package com.aayush.hrms.company;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Transactional
    public List<CompanySummary> list() {
        return companyRepository.findAll().stream().map(CompanySummary::from).toList();
    }

    @Transactional
    public CompanySummary create(CompanyRequest request) {
        Company company = new Company(request.code().trim(), request.name().trim());
        company.update(
                request.code().trim(),
                request.name().trim(),
                request.active() == null || request.active());
        return CompanySummary.from(companyRepository.save(company));
    }

    @Transactional
    public CompanySummary update(UUID id, CompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));
        company.update(request.code().trim(), request.name().trim(),
                request.active() == null ? company.isActive() : request.active());
        return CompanySummary.from(company);
    }
}
