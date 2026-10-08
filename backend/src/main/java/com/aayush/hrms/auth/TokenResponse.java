package com.aayush.hrms.auth;

import java.time.Instant;
import java.util.Set;

public record TokenResponse(
        String accessToken,
        Instant accessTokenExpiresAt,
        String refreshToken,
        Instant refreshTokenExpiresAt,
        String email,
        Set<String> roles) {
}
