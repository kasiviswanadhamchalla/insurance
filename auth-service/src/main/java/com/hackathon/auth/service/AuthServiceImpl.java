package com.hackathon.auth.service;

import com.hackathon.auth.dto.*;
import com.hackathon.auth.entity.RefreshToken;
import com.hackathon.auth.entity.Role;
import com.hackathon.auth.entity.User;
import com.hackathon.auth.mapper.UserMapper;
import com.hackathon.auth.repository.RefreshTokenRepository;
import com.hackathon.auth.repository.RoleRepository;
import com.hackathon.auth.repository.UserRepository;
import com.hackathon.common.constant.SecurityConstants;
import com.hackathon.common.dto.MfaEvent;
import com.hackathon.common.dto.UserDto;
import com.hackathon.common.exception.BadRequestException;
import com.hackathon.common.exception.ResourceNotFoundException;
import com.hackathon.common.exception.UnauthorizedException;
import com.hackathon.common.util.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserMapper userMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final JavaMailSender mailSender;

    public AuthServiceImpl(UserRepository userRepository,
                            RoleRepository roleRepository,
                            RefreshTokenRepository refreshTokenRepository,
                            PasswordEncoder passwordEncoder,
                            JwtUtils jwtUtils,
                            UserMapper userMapper,
                            KafkaTemplate<String, Object> kafkaTemplate,
                            JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.userMapper = userMapper;
        this.kafkaTemplate = kafkaTemplate;
        this.mailSender = mailSender;
    }

    @Override
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Set<Role> assignedRoles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                Role r = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                assignedRoles.add(r);
            }
        } else {
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new ResourceNotFoundException("Default User Role not found"));
            assignedRoles.add(userRole);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(false)
                .approved(false)
                .roles(assignedRoles)
                .build();

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        System.out.println(request.getPassword()+" "+request.getUsername());
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        if (!user.isApproved()) {
            throw new UnauthorizedException("Your registration request is pending admin approval.");
        }

        if (!user.isEnabled()) {
            throw new UnauthorizedException("User account is disabled");
        }

        if (user.isMfaEnabled()) {
            // Generate OTP
            String otp = String.format("%06d", new Random().nextInt(1000000));
            String transactionId = UUID.randomUUID().toString();
            
            user.setMfaOtp(otp);
            user.setMfaSecret(transactionId); // Store transactionId in mfaSecret for lookup
            user.setMfaOtpExpiry(Instant.now().plus(5, ChronoUnit.MINUTES));
            userRepository.save(user);

            // Send SMTP Email for MFA verification code
            sendMfaEmail(user.getEmail(), otp);

            // Publish MFA Event to Kafka
            MfaEvent mfaEvent = MfaEvent.builder()
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .otp(otp)
                    .mfaTransactionId(transactionId)
                    .build();
            
            try {
                kafkaTemplate.send("mfa-events", mfaEvent);
                log.info("MFA Kafka Event published for user: {}", user.getUsername());
            } catch (Exception e) {
                log.error("Failed to publish MFA Event to Kafka. Displaying OTP for local development: {}", otp, e);
            }

            return LoginResponse.builder()
                    .mfaRequired(true)
                    .mfaTransactionId(transactionId)
                    .user(userMapper.toDto(user))
                    .build();
        }

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        String accessToken = jwtUtils.generateToken(user.getUsername(), roles, SecurityConstants.ACCESS_TOKEN_EXPIRATION);
        RefreshToken refreshToken = createOrUpdateRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .user(userMapper.toDto(user))
                .build();
    }

    @Override
    public LoginResponse verifyMfa(MfaVerifyRequest request) {
        User user = userRepository.findByMfaSecret(request.getMfaTransactionId())
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired MFA transaction"));

        if (user.getMfaOtpExpiry() == null || user.getMfaOtpExpiry().isBefore(Instant.now())) {
            throw new UnauthorizedException("MFA OTP has expired");
        }

        if (!user.getMfaOtp().equals(request.getCode())) {
            throw new UnauthorizedException("Invalid MFA OTP code");
        }

        // Clear OTP details upon successful verification
        user.setMfaOtp(null);
        user.setMfaSecret(null);
        user.setMfaOtpExpiry(null);
        userRepository.save(user);

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        String accessToken = jwtUtils.generateToken(user.getUsername(), roles, SecurityConstants.ACCESS_TOKEN_EXPIRATION);
        RefreshToken refreshToken = createOrUpdateRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .user(userMapper.toDto(user))
                .build();
    }

    @Override
    public void setupMfa(String username, MfaSetupRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        user.setMfaEnabled(request.isEnabled());
        
        if (request.isEnabled()) {
            // Generate OTP for verification check or just send confirmation
            String otp = String.format("%06d", new Random().nextInt(1000000));
            String transactionId = UUID.randomUUID().toString();
            
            user.setMfaOtp(otp);
            user.setMfaSecret(transactionId);
            user.setMfaOtpExpiry(Instant.now().plus(5, ChronoUnit.MINUTES));
            
            MfaEvent mfaEvent = MfaEvent.builder()
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .otp(otp)
                    .mfaTransactionId(transactionId)
                    .build();

            try {
                kafkaTemplate.send("mfa-events", mfaEvent);
                log.info("MFA setup email verification published for user: {}", user.getUsername());
            } catch (Exception e) {
                log.error("Failed to publish MFA setup verification. OTP: {}", otp, e);
            }
        } else {
            user.setMfaOtp(null);
            user.setMfaSecret(null);
            user.setMfaOtpExpiry(null);
        }
        
        userRepository.save(user);
    }

    @Override
    public TokenRefreshResponse refreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token was expired. Please make a new signin request");
        }

        User user = refreshToken.getUser();
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        String newAccessToken = jwtUtils.generateToken(user.getUsername(), roles, SecurityConstants.ACCESS_TOKEN_EXPIRATION);
        RefreshToken newRefreshToken = createOrUpdateRefreshToken(user);

        return TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .build();
    }

    @Override
    public void logout(String refreshTokenString) {
        refreshTokenRepository.findByToken(refreshTokenString)
                .ifPresent(refreshTokenRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return userMapper.toDto(user);
    }

    private RefreshToken createOrUpdateRefreshToken(User user) {
        Instant expiryDate = Instant.now().plusMillis(SecurityConstants.REFRESH_TOKEN_EXPIRATION);
        String token = UUID.randomUUID().toString();

        return refreshTokenRepository.save(
            refreshTokenRepository.findByToken(token) // Avoid collisions
                .map(existingToken -> {
                    existingToken.setToken(token);
                    existingToken.setExpiryDate(expiryDate);
                    return existingToken;
                })
                .orElseGet(() -> RefreshToken.builder()
                        .user(user)
                        .token(token)
                        .expiryDate(expiryDate)
                        .build())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setApproved(true);
        user.setEnabled(true);
        userRepository.save(user);
        log.info("User ID {} ({}) approved by Admin", userId, user.getUsername());
    }

    private void sendMfaEmail(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("ClaimFlow - Two-Step Verification OTP");
            message.setText("Hello,\n\nYour ClaimFlow verification code is: " + otp + "\n\nThis code will expire in 5 minutes.\n\nSecurely,\nClaimFlow Security Team");
            mailSender.send(message);
            log.info("MFA SMTP Email sent successfully to {}", email);
        } catch (Exception e) {
            log.error("Failed to send MFA SMTP Email to {}: {}", email, e.getMessage());
        }
    }
}
