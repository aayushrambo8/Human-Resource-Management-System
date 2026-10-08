package com.aayush.hrms.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.Set;
import java.nio.charset.StandardCharsets;

public record CreateAccountRequest(
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 12, max = 72) String password,
        @NotEmpty Set<@NotBlank String> roles,
        @Size(max = 40) String employeeCode) {

    @AssertTrue(message = "Password must be at most 72 UTF-8 bytes")
    public boolean isPasswordWithinBcryptLimit() {
        return password != null && password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }
}
