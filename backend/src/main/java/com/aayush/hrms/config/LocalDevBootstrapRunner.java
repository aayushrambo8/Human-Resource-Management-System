package com.aayush.hrms.config;

import com.aayush.hrms.auth.Role;
import com.aayush.hrms.auth.RoleRepository;
import com.aayush.hrms.auth.UserAccount;
import com.aayush.hrms.auth.UserAccountRepository;
import com.aayush.hrms.employee.Employee;
import com.aayush.hrms.employee.EmployeeRepository;
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
@Profile("!test")
public class LocalDevBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(LocalDevBootstrapRunner.class);

    private final UserAccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalDevBootstrapRunner(
            UserAccountRepository accountRepository,
            RoleRepository roleRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.roleRepository = roleRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Standard system accounts
        ensureAccount("admin@northstar.edu", "Admin@123", "ADMIN", "EMP001");
        ensureAccount("hr@northstar.edu", "Hr@123", "HR", "EMP011");
        ensureAccount("user@northstar.edu", "User@123", "EMPLOYEE", "EMP101");
        ensureAccount("admin@institution.local", "Password@123", "ADMIN", null);

        // Test accounts for biometric & clock-out verification
        ensureAccount("marcus.vance@institution.local", "Password@123", "ADMIN", "EMP010");
        ensureAccount("elena.rostova@institution.local", "Password@123", "HR", null);
        ensureAccount("david.chen@institution.local", "Password@123", "HR", "EMP012");
        ensureAccount("sarah.connor@institution.local", "Password@123", "EMPLOYEE", null);
        ensureAccount("john.doe@institution.local", "Password@123", "EMPLOYEE", "EMP102");
        ensureAccount("emily.watson@institution.local", "Password@123", "EMPLOYEE", "EMP103");
        ensureAccount("michael.chang@institution.local", "Password@123", "EMPLOYEE", "EMP104");
        ensureAccount("rachel.green@institution.local", "Password@123", "EMPLOYEE", "EMP105");
        ensureAccount("priya.sharma@institution.local", "Password@123", "EMPLOYEE", "EMP106");
    }

    private void ensureAccount(String email, String rawPassword, String roleCode, String employeeCode) {
        try {
            Role role = roleRepository.findByCode(roleCode)
                    .orElseThrow(() -> new IllegalStateException("Role not found: " + roleCode));

            Employee employee = null;
            if (employeeCode != null) {
                var empOpt = employeeRepository.findByEmployeeCode(employeeCode);
                if (empOpt.isPresent()) {
                    var emp = empOpt.get();
                    if (!accountRepository.existsByEmployeeId(emp.getId())) {
                        employee = emp;
                    } else {
                        log.info("Employee {} already linked to an account; creating {} as unlinked", employeeCode, email);
                    }
                }
            }

            var existing = accountRepository.findByEmailIgnoreCase(email);
            if (existing.isEmpty()) {
                UserAccount account = new UserAccount(
                        email.toLowerCase().trim(),
                        passwordEncoder.encode(rawPassword),
                        employee,
                        Set.of(role)
                );
                accountRepository.save(account);
                log.info("Bootstrapped test account: {} (Role: {}, Employee: {})", email, roleCode, employeeCode);
            }
        } catch (Exception e) {
            log.warn("Could not bootstrap test account {}: {}", email, e.getMessage());
        }
    }
}
