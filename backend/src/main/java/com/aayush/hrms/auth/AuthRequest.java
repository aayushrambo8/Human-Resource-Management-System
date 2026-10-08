package com.aayush.hrms.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;

public record AuthRequest(
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 12, max = 72) String password) {

    @AssertTrue(message = "Password must be at most 72 UTF-8 bytes")
    public boolean isPasswordWithinBcryptLimit() {
        return password != null && password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}
