package com.aayush.hrms.company;

import com.aayush.hrms.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "departments")
public class Department extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 32)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    protected Department() {
    }

    public Department(Company company, String code, String name) {
        this.company = company;
        this.code = code;
        this.name = name;
    }

    public Company getCompany() {
        return company;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public void update(Company company, String code, String name) {
        this.company = company;
        this.code = code;
        this.name = name;
    }
}
