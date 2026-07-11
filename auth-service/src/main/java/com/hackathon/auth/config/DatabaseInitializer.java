package com.hackathon.auth.config;

import com.hackathon.auth.entity.Role;
import com.hackathon.auth.entity.User;
import com.hackathon.auth.repository.RefreshTokenRepository;
import com.hackathon.auth.repository.RoleRepository;
import com.hackathon.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Resetting and initializing database...");

        // 1. Clear existing tokens and users to guarantee a clean slate and resolve any unique constraint/stale data conflicts
        try {
            refreshTokenRepository.deleteAll();
            userRepository.deleteAll();
            log.info("Cleared existing users and refresh tokens successfully.");
        } catch (Exception e) {
            log.error("Failed to clean up tables: {}", e.getMessage());
        }

        // 2. Ensure roles exist
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_USER").build()));
        Role processorRole = roleRepository.findByName("ROLE_PROCESSOR")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_PROCESSOR").build()));
        Role managerRole = roleRepository.findByName("ROLE_MANAGER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_MANAGER").build()));
        Role auditorRole = roleRepository.findByName("ROLE_AUDITOR")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_AUDITOR").build()));
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));

        // Create Admin Roles Set
        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(userRole);
        adminRoles.add(adminRole);

        User admin = User.builder()
                .username("admin")
                .email("kasiviswanadhamchalla@gmail.com")
                .password(passwordEncoder.encode("Hackathon@123"))
                .roles(adminRoles)
                .enabled(true)
                .approved(true)
                .build();
        userRepository.save(admin);
        
        log.info("Seeded primary admin user:kasiviswanadhamchalla@gmail.com ) / Hackathon@123");
    }
}
