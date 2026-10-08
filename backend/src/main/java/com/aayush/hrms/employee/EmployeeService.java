package com.aayush.hrms.employee;

import com.aayush.hrms.company.Department;
import com.aayush.hrms.company.DepartmentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;

    public EmployeeService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
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
