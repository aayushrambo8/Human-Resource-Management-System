package com.aayush.hrms.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;
    private final BootstrapTokenService bootstrapTokenService;

    public AuthController(AuthService authService, BootstrapTokenService bootstrapTokenService) {
        this.authService = authService;
        this.bootstrapTokenService = bootstrapTokenService;
    }

    @PostMapping("/auth/bootstrap")
    public TokenResponse bootstrap(
            @RequestHeader(name = "X-Bootstrap-Token", required = false) String bootstrapToken,
            @Valid @RequestBody AuthRequest request) {
        if (!bootstrapTokenService.matches(bootstrapToken)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Invalid bootstrap token");
        }
        return authService.bootstrap(request);
    }

    @PostMapping("/auth/login")
    public TokenResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("/auth/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/auth/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request.refreshToken());
    }

    @PostMapping("/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('account:write')")
    public void createAccount(@Valid @RequestBody CreateAccountRequest request) {
        authService.createAccount(request);
    }
}
