package com.aayush.hrms.employee;

import com.aayush.hrms.common.BaseEntity;
import com.aayush.hrms.company.Department;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
public class Employee extends BaseEntity {

    @Column(nullable = false, unique = true, length = 40)
    private String employeeCode;

    @Column(nullable = false, length = 80)
    private String firstName;

    @Column(nullable = false, length = 80)
    private String lastName;

    @Column(unique = true, length = 180)
    private String email;

    @Column(length = 32)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    private LocalDate joiningDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private EmploymentStatus status = EmploymentStatus.ACTIVE;

    protected Employee() {
    }

    public Employee(String employeeCode, String firstName, String lastName) {
        this.employeeCode = employeeCode;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public Department getDepartment() {
        return department;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public EmploymentStatus getStatus() {
        return status;
    }

    public void update(
            String employeeCode,
            String firstName,
            String lastName,
            String email,
            String phone,
            Department department,
            LocalDate joiningDate,
            EmploymentStatus status) {
        this.employeeCode = employeeCode;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.department = department;
        this.joiningDate = joiningDate;
        this.status = status;
    }
}
