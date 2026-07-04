package com.hackathon.auth.service;

import com.hackathon.auth.dto.*;
import com.hackathon.common.dto.UserDto;

public interface AuthService {
    UserDto register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    TokenRefreshResponse refreshToken(String refreshToken);
    void logout(String refreshToken);
    UserDto getUserProfile(String username);
    LoginResponse verifyMfa(MfaVerifyRequest request);
    void setupMfa(String username, MfaSetupRequest request);
}
