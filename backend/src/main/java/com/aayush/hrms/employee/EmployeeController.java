package com.aayush.hrms.employee;

import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/api/employee")
    public EmployeeSummary getMyProfile(Authentication authentication) {
        return employeeService.getProfileForUser(authentication != null ? authentication.getName() : null);
    }

    @GetMapping({"/api/employee/me", "/api/employees/me"})
    public EmployeeSummary getMyProfileAlias(Authentication authentication) {
        return employeeService.getProfileForUser(authentication != null ? authentication.getName() : null);
    }

    @GetMapping("/api/employees")
    @PreAuthorize("hasAuthority('employee:read')")
    public List<EmployeeSummary> listEmployees() {
        return employeeService.list();
    }

    @GetMapping("/api/employees/{id}")
    @PreAuthorize("hasAuthority('employee:read')")
    public EmployeeSummary getEmployee(@PathVariable UUID id) {
        return employeeService.get(id);
    }

    @PostMapping("/api/employees")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('employee:write')")
    public EmployeeSummary createEmployee(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.create(request);
    }

    @PutMapping("/api/employees/{id}")
    @PreAuthorize("hasAuthority('employee:write')")
    public EmployeeSummary updateEmployee(@PathVariable UUID id, @Valid @RequestBody EmployeeRequest request) {
        return employeeService.update(id, request);
    }
}
