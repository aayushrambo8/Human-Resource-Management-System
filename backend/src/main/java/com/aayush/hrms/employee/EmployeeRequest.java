package com.aayush.hrms.employee;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeRequest(
        @NotBlank @Size(max = 40) String employeeCode,
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 80) String lastName,
        @Email @Size(max = 180) String email,
        @Size(max = 32) String phone,
        UUID departmentId,
        LocalDate joiningDate,
        @NotNull EmploymentStatus status) {
}
