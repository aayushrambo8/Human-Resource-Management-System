package com.aayush.hrms.biometric;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import org.springframework.stereotype.Service;

@Service
public class DeviceTokenService {

    public boolean matches(String providedToken, String expectedHash) {
        if (providedToken == null || providedToken.isBlank() || expectedHash == null) {
            return false;
        }
        byte[] providedBytes = hash(providedToken).toLowerCase().getBytes(StandardCharsets.UTF_8);
        byte[] expectedBytes = expectedHash.toLowerCase().getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(providedBytes, expectedBytes);
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
