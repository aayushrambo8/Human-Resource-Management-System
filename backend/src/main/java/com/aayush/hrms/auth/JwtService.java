package com.aayush.hrms.auth;

import tools.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private final byte[] secret;
    private final ObjectMapper objectMapper;
    private final long accessTokenSeconds;

    public JwtService(
            @Value("${hrms.auth.jwt-secret}") String secret,
            @Value("${hrms.auth.access-token-seconds:900}") long accessTokenSeconds,
            ObjectMapper objectMapper) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        if (this.secret.length < 32) {
            throw new IllegalArgumentException("HRMS_JWT_SECRET must contain at least 32 bytes");
        }
        if (accessTokenSeconds < 60) {
            throw new IllegalArgumentException("Access token lifetime must be at least 60 seconds");
        }
        this.accessTokenSeconds = accessTokenSeconds;
        this.objectMapper = objectMapper;
    }

    public String issue(UserAccount account, Instant issuedAt, Instant expiresAt) {
        try {
            Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
            Map<String, Object> claims = new LinkedHashMap<>();
            claims.put("sub", account.getEmail());
            claims.put("iat", issuedAt.getEpochSecond());
            claims.put("exp", expiresAt.getEpochSecond());
            claims.put("roles", account.getRoles().stream().map(Role::getCode).sorted().toList());
            claims.put("permissions", account.getRoles().stream()
                    .flatMap(role -> role.getPermissions().stream())
                    .map(Permission::getCode)
                    .distinct()
                    .sorted()
                    .toList());
            String unsigned = ENCODER.encodeToString(objectMapper.writeValueAsBytes(header)) + "."
                    + ENCODER.encodeToString(objectMapper.writeValueAsBytes(claims));
            return unsigned + "." + ENCODER.encodeToString(sign(unsigned));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to issue access token", exception);
        }
    }

    public Map<String, Object> verify(String token) {
        try {
            String[] parts = token.split("\\.", -1);
            if (parts.length != 3) {
                return null;
            }
            byte[] headerBytes = Base64.getUrlDecoder().decode(parts[0]);
            Map<?, ?> header = objectMapper.readValue(headerBytes, Map.class);
            if (!"HS256".equals(header.get("alg"))) {
                return null;
            }
            String unsigned = parts[0] + "." + parts[1];
            byte[] providedSignature = Base64.getUrlDecoder().decode(parts[2]);
            if (!MessageDigest.isEqual(sign(unsigned), providedSignature)) {
                return null;
            }
            Map<?, ?> rawClaims = objectMapper.readValue(Base64.getUrlDecoder().decode(parts[1]), Map.class);
            if (!(rawClaims.get("sub") instanceof String subject)
                    || !(rawClaims.get("exp") instanceof Number expiresAt)
                    || expiresAt.longValue() <= Instant.now().getEpochSecond()
                    || !(rawClaims.get("roles") instanceof java.util.List<?> roles)
                    || !(rawClaims.get("permissions") instanceof java.util.List<?> permissions)
                    || !roles.stream().allMatch(String.class::isInstance)
                    || !permissions.stream().allMatch(String.class::isInstance)) {
                return null;
            }
            return Map.of("sub", subject, "roles", roles, "permissions", permissions);
        } catch (Exception exception) {
            return null;
        }
    }

    public long getAccessTokenSeconds() {
        return accessTokenSeconds;
    }

    private byte[] sign(String content) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return mac.doFinal(content.getBytes(StandardCharsets.US_ASCII));
    }
}
