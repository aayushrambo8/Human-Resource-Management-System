package com.aayush.hrms.employee;

import com.aayush.hrms.auth.UserAccount;
import com.aayush.hrms.auth.UserAccountRepository;
import com.aayush.hrms.company.Department;
import com.aayush.hrms.company.DepartmentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserAccountRepository accountRepository;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            UserAccountRepository accountRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public EmployeeSummary getProfileForUser(String authEmail) {
        if (authEmail == null || authEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        UserAccount account = accountRepository.findByEmailIgnoreCase(authEmail).orElse(null);
        if (account != null && account.getEmployee() != null) {
            return EmployeeSummary.from(account.getEmployee());
        }
        var empOpt = employeeRepository.findByEmail(authEmail);
        if (empOpt.isPresent()) {
            return EmployeeSummary.from(empOpt.get());
        }
        String localPart = authEmail.split("@")[0];
        String[] nameParts = localPart.split("[._-]");
        String firstName = capitalize(nameParts[0]);
        String lastName = nameParts.length > 1 ? capitalize(nameParts[1]) : "Personnel";
        return new EmployeeSummary(
                UUID.nameUUIDFromBytes(authEmail.getBytes(StandardCharsets.UTF_8)),
                "EMP-" + Math.abs(authEmail.hashCode() % 1000),
                firstName,
                lastName,
                authEmail,
                "+1 (555) 019-0000",
                null,
                "Campus Operations",
                LocalDate.now().minusMonths(6),
                EmploymentStatus.ACTIVE
        );
    }

    private static String capitalize(String s) {
        if (s == null || s.isEmpty()) return "";
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }

    @Transactional
    public EmployeeSummary create(EmployeeRequest request) {
        Employee employee = new Employee(clean(request.employeeCode()), clean(request.firstName()), clean(request.lastName()));
        employee.update(
                clean(request.employeeCode()),
                clean(request.firstName()),
                clean(request.lastName()),
                cleanNullable(request.email()),
                cleanNullable(request.phone()),
                findDepartment(request.departmentId()),
                request.joiningDate(),
                request.status());
        return EmployeeSummary.from(employeeRepository.save(employee));
    }

    @Transactional
    public List<EmployeeSummary> list() {
        return employeeRepository.findAll().stream().map(EmployeeSummary::from).toList();
    }

    @Transactional
    public EmployeeSummary get(UUID id) {
        return EmployeeSummary.from(findEmployee(id));
    }

    @Transactional
    public EmployeeSummary update(UUID id, EmployeeRequest request) {
        Employee employee = findEmployee(id);
        employee.update(
                clean(request.employeeCode()),
                clean(request.firstName()),
                clean(request.lastName()),
                cleanNullable(request.email()),
                cleanNullable(request.phone()),
                findDepartment(request.departmentId()),
                request.joiningDate(),
                request.status());
        return EmployeeSummary.from(employee);
    }

    private Employee findEmployee(UUID id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
    }

    private Department findDepartment(UUID id) {
        return id == null ? null : departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));
    }

    private static String clean(String value) {
        return value.trim();
    }

    private static String cleanNullable(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
