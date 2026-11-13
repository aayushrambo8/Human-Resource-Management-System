package com.aayush.hrms.config;

import com.aayush.hrms.auth.AuthRequest;
import com.aayush.hrms.auth.AuthService;
import com.aayush.hrms.auth.CreateAccountRequest;
import com.aayush.hrms.auth.UserAccountRepository;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class LocalDevBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalDevBootstrapRunner.class);

    private final AuthService authService;
    private final UserAccountRepository accountRepository;

    public LocalDevBootstrapRunner(AuthService authService, UserAccountRepository accountRepository) {
        this.authService = authService;
        this.accountRepository = accountRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        // 1. Initial Admin Account
        if (accountRepository.count() == 0) {
            log.info("Bootstrapping initial local admin account: admin@northstar.edu");
            try {
                authService.bootstrap(new AuthRequest("admin@northstar.edu", "Admin@123"));
                log.info("Local admin account bootstrapped successfully: admin@northstar.edu / Admin@123");
            } catch (Exception e) {
                log.warn("Could not bootstrap initial admin account: {}", e.getMessage());
            }
        }

        // Backward-compat admin alias
        if (accountRepository.findByEmailIgnoreCase("admin@institution.local").isEmpty()) {
            try {
                authService.createAccount(new CreateAccountRequest("admin@institution.local", "admin-password-123", Set.of("ADMIN"), null));
            } catch (Exception ignored) {
            }
        }

        // 2. HR Manager Account
        if (accountRepository.findByEmailIgnoreCase("hr@northstar.edu").isEmpty()) {
            try {
                authService.createAccount(new CreateAccountRequest("hr@northstar.edu", "Hr@123", Set.of("HR"), null));
                log.info("Sample HR account created: hr@northstar.edu / Hr@123 (Roles: [HR])");
            } catch (Exception e) {
                log.warn("Could not create sample HR account: {}", e.getMessage());
            }
        }

        // 3. User / Employee Account
        if (accountRepository.findByEmailIgnoreCase("user@northstar.edu").isEmpty()) {
            try {
                authService.createAccount(new CreateAccountRequest("user@northstar.edu", "User@123", Set.of("EMPLOYEE"), null));
                log.info("Sample User/Employee account created: user@northstar.edu / User@123 (Roles: [EMPLOYEE])");
            } catch (Exception e) {
                log.warn("Could not create sample User account: {}", e.getMessage());
            }
        }
    }
}
