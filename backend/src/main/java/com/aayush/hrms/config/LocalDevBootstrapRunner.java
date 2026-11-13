package com.aayush.hrms.config;

import com.aayush.hrms.auth.Role;
import com.aayush.hrms.auth.RoleRepository;
import com.aayush.hrms.auth.UserAccount;
import com.aayush.hrms.auth.UserAccountRepository;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("local")
public class LocalDevBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalDevBootstrapRunner.class);

    private final UserAccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalDevBootstrapRunner(
            UserAccountRepository accountRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        ensureAccount("admin@northstar.edu", "Admin@123", "ADMIN");
        ensureAccount("hr@northstar.edu", "Hr@123", "HR");
        ensureAccount("user@northstar.edu", "User@123", "EMPLOYEE");
        ensureAccount("admin@institution.local", "admin-password-123", "ADMIN");
    }

    private void ensureAccount(String email, String rawPassword, String roleCode) {
        try {
            Role role = roleRepository.findByCode(roleCode)
                    .orElseThrow(() -> new IllegalStateException("Role not found: " + roleCode));

            var existing = accountRepository.findByEmailIgnoreCase(email);
            if (existing.isEmpty()) {
                UserAccount account = new UserAccount(
                        email.toLowerCase().trim(),
                        passwordEncoder.encode(rawPassword),
                        null,
                        Set.of(role)
                );
                accountRepository.save(account);
                log.info("Bootstrapped local dev account: {} (Role: {})", email, roleCode);
            }
        } catch (Exception e) {
            log.warn("Could not bootstrap local dev account {}: {}", email, e.getMessage());
        }
    }
}
