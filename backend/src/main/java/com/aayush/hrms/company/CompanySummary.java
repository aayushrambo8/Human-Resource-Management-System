package com.aayush.hrms.company;

import java.util.UUID;

public record CompanySummary(UUID id, String code, String name, boolean active) {
    static CompanySummary from(Company company) {
        return new CompanySummary(company.getId(), company.getCode(), company.getName(), company.isActive());
    }
}
