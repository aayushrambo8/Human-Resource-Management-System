package com.aayush.hrms.employee;

import java.util.UUID;
import java.time.LocalDate;

public record EmployeeSummary(
        UUID id,
        String employeeCode,
        String firstName,
        String lastName,
        String email,
        String phone,
        UUID departmentId,
        String departmentName,
        LocalDate joiningDate,
        EmploymentStatus status) {

    static EmployeeSummary from(Employee employee) {
        return new EmployeeSummary(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getDepartment() == null ? null : employee.getDepartment().getId(),
                employee.getDepartment() == null ? null : employee.getDepartment().getName(),
                employee.getJoiningDate(),
                employee.getStatus());
    }
}
