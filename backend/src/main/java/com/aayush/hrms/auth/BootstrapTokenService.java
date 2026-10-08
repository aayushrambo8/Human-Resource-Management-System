package com.aayush.hrms.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class BootstrapTokenService {

    private final byte[] expectedToken;

    public BootstrapTokenService(@Value("${hrms.auth.bootstrap-token}") String expectedToken) {
        this.expectedToken = expectedToken.getBytes(StandardCharsets.UTF_8);
        if (this.expectedToken.length < 32) {
            throw new IllegalArgumentException("HRMS_BOOTSTRAP_TOKEN must contain at least 32 bytes");
        }
    }

    public boolean matches(String providedToken) {
        if (providedToken == null) {
            return false;
        }
        return MessageDigest.isEqual(
                expectedToken,
                providedToken.getBytes(StandardCharsets.UTF_8));
    }
}
