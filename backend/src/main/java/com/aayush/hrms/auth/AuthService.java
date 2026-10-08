package com.aayush.hrms.auth;

import com.aayush.hrms.employee.Employee;
import com.aayush.hrms.employee.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserAccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final BootstrapLockRepository bootstrapLockRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserAccountRepository accountRepository,
            RoleRepository roleRepository,
            RefreshTokenRepository refreshTokenRepository,
            BootstrapLockRepository bootstrapLockRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.bootstrapLockRepository = bootstrapLockRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public TokenResponse bootstrap(AuthRequest request) {
        bootstrapLockRepository.lockBootstrapRow()
                .orElseThrow(() -> new IllegalStateException("Authentication bootstrap lock is missing"));
        if (accountRepository.count() != 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Initial account has already been created");
        }
        Role admin = roleRepository.findByCode("ADMIN")
                .orElseThrow(() -> new IllegalStateException("ADMIN role is missing"));
        UserAccount account = accountRepository.save(new UserAccount(
                normalizeEmail(request.email()), passwordEncoder.encode(request.password()), null, Set.of(admin)));
        return issue(account);
    }

    @Transactional
    public TokenResponse login(AuthRequest request) {
        UserAccount account = accountRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .filter(UserAccount::isEnabled)
                .filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return issue(account);
    }

    @Transactional
    public TokenResponse refresh(String rawToken) {
        RefreshToken previous = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .filter(token -> token.isUsableAt(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        previous.revoke(Instant.now());
        return issue(previous.getAccount());
    }

    @Transactional
    public void logout(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken))
                .filter(token -> token.isUsableAt(Instant.now()))
                .ifPresent(token -> token.revoke(Instant.now()));
    }

    @Transactional
    public void createAccount(CreateAccountRequest request) {
        String email = normalizeEmail(request.email());
        if (accountRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        Set<Role> roles = request.roles().stream()
                .map(code -> roleRepository.findByCode(code)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown role: " + code)))
                .collect(java.util.stream.Collectors.toSet());
        Employee employee = request.employeeCode() == null || request.employeeCode().isBlank()
                ? null
                : employeeRepository.findByEmployeeCode(request.employeeCode())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown employee code"));
        accountRepository.save(new UserAccount(email, passwordEncoder.encode(request.password()), employee, roles));
    }

    private TokenResponse issue(UserAccount account) {
        Instant now = Instant.now();
        Instant accessExpiry = now.plus(jwtService.getAccessTokenSeconds(), ChronoUnit.SECONDS);
        String accessToken = jwtService.issue(account, now, accessExpiry);
        byte[] refreshBytes = new byte[32];
        secureRandom.nextBytes(refreshBytes);
        String refreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(refreshBytes);
        Instant refreshExpiry = now.plus(7, ChronoUnit.DAYS);
        refreshTokenRepository.save(new RefreshToken(account, hash(refreshToken), refreshExpiry));
        return new TokenResponse(
                accessToken,
                accessExpiry,
                refreshToken,
                refreshExpiry,
                account.getEmail(),
                account.getRoles().stream().map(Role::getCode).collect(java.util.stream.Collectors.toSet()));
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    private static String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to hash refresh token", exception);
        }
    }
}
