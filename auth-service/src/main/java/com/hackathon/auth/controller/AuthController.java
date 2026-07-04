package com.hackathon.auth.controller;

import com.hackathon.auth.dto.*;
import com.hackathon.auth.service.AuthService;
import com.hackathon.common.constant.SecurityConstants;
import com.hackathon.common.dto.ApiResponse;
import com.hackathon.common.dto.UserDto;
import com.hackathon.common.exception.BadRequestException;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto registeredUser = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(registeredUser, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request, 
                                                            HttpServletResponse response) {
        System.out.println(request.getPassword()+" "+request.getUsername());
        LoginResponse loginResponse = authService.login(request);
        
        if (loginResponse.isMfaRequired()) {
            return ResponseEntity.ok(ApiResponse.success(loginResponse, "MFA code required to complete login"));
        }
        
        // Generate and set HttpOnly refresh token cookie
        ResponseCookie cookie = ResponseCookie.from(SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, loginResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(SecurityConstants.REFRESH_TOKEN_EXPIRATION / 1000)
                .sameSite("Lax")
                .build();
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        return ResponseEntity.ok(ApiResponse.success(loginResponse, "Logged in successfully"));
    }

    @PostMapping("/login/mfa/verify")
    public ResponseEntity<ApiResponse<LoginResponse>> verifyMfa(@Valid @RequestBody MfaVerifyRequest request, 
                                                                HttpServletResponse response) {
        LoginResponse loginResponse = authService.verifyMfa(request);
        
        // Generate and set HttpOnly refresh token cookie
        ResponseCookie cookie = ResponseCookie.from(SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, loginResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(SecurityConstants.REFRESH_TOKEN_EXPIRATION / 1000)
                .sameSite("Lax")
                .build();
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        return ResponseEntity.ok(ApiResponse.success(loginResponse, "MFA verification successful"));
    }

    @PostMapping("/mfa/setup")
    public ResponseEntity<ApiResponse<String>> setupMfa(@RequestHeader("X-User-Name") String username, 
                                                        @RequestBody MfaSetupRequest request) {
        authService.setupMfa(username, request);
        String msg = request.isEnabled() ? "MFA enabled. Verification email sent." : "MFA disabled.";
        return ResponseEntity.ok(ApiResponse.success(msg, msg));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refresh(
            @RequestBody(required = false) TokenRefreshRequest request,
            @CookieValue(name = SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, required = false) String cookieRefreshToken,
            HttpServletResponse response) {
        
        String refreshToken = null;
        if (cookieRefreshToken != null) {
            refreshToken = cookieRefreshToken;
        } else if (request != null) {
            refreshToken = request.getRefreshToken();
        }

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is missing");
        }

        TokenRefreshResponse refreshResponse = authService.refreshToken(refreshToken);

        // Update refresh token cookie
        ResponseCookie cookie = ResponseCookie.from(SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, refreshResponse.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(SecurityConstants.REFRESH_TOKEN_EXPIRATION / 1000)
                .sameSite("Lax")
                .build();
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.success(refreshResponse, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            @CookieValue(name = SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response) {
        
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        // Clear refresh token cookie
        ResponseCookie cookie = ResponseCookie.from(SecurityConstants.REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> profile(@RequestHeader(name = "X-User-Name", required = false) String username) {
        if (username == null || username.isBlank()) {
            throw new BadRequestException("User profile requested but no user identifier header found");
        }
        UserDto profile = authService.getUserProfile(username);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<java.util.List<UserDto>>> getAllUsers() {
        java.util.List<UserDto> users = authService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "All registered users retrieved successfully"));
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<ApiResponse<String>> approveUser(@PathVariable("id") Long id) {
        authService.approveUser(id);
        return ResponseEntity.ok(ApiResponse.success("User approved successfully", "User approved successfully"));
    }
}
