package com.aayush.hrms.company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @NotBlank @Size(max = 32) String code,
        @NotBlank @Size(max = 160) String name,
        Boolean active) {
}
