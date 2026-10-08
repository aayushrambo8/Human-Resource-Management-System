package com.aayush.hrms.company;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CompanyRepository companyRepository;

    public DepartmentService(DepartmentRepository departmentRepository, CompanyRepository companyRepository) {
        this.departmentRepository = departmentRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional
    public List<DepartmentSummary> list() {
        return departmentRepository.findAll().stream().map(DepartmentSummary::from).toList();
    }

    @Transactional
    public DepartmentSummary create(DepartmentRequest request) {
        Company company = findCompany(request.companyId());
        return DepartmentSummary.from(departmentRepository.save(
                new Department(company, request.code().trim(), request.name().trim())));
    }

    @Transactional
    public DepartmentSummary update(UUID id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found"));
        department.update(findCompany(request.companyId()), request.code().trim(), request.name().trim());
        return DepartmentSummary.from(department);
    }

    private Company findCompany(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));
    }
}
