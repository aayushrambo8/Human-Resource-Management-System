package com.aayush.hrms.employee;

import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('employee:read')")
    List<EmployeeSummary> listEmployees() {
        return employeeService.list();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('employee:read')")
    EmployeeSummary getEmployee(@PathVariable UUID id) {
        return employeeService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('employee:write')")
    EmployeeSummary createEmployee(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('employee:write')")
    EmployeeSummary updateEmployee(@PathVariable UUID id, @Valid @RequestBody EmployeeRequest request) {
        return employeeService.update(id, request);
    }
}
