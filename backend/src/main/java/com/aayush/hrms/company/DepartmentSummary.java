package com.aayush.hrms.company;

import java.util.UUID;

public record DepartmentSummary(
        UUID id,
        UUID companyId,
        String companyCode,
        String code,
        String name) {
    static DepartmentSummary from(Department department) {
        return new DepartmentSummary(
                department.getId(),
                department.getCompany().getId(),
                department.getCompany().getCode(),
                department.getCode(),
                department.getName());
    }
}
