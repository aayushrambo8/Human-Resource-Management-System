package com.aayush.hrms.auth;

import com.aayush.hrms.common.BaseEntity;
import com.aayush.hrms.employee.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_accounts")
public class UserAccount extends BaseEntity {

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false)
    private boolean enabled = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", unique = true)
    private Employee employee;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "account_roles",
            joinColumns = @JoinColumn(name = "account_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    protected UserAccount() {
    }

    public UserAccount(String email, String passwordHash, Employee employee, Set<Role> roles) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.employee = employee;
        this.roles.addAll(roles);
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public Employee getEmployee() {
        return employee;
    }

    public Set<Role> getRoles() {
        return roles;
    }
}
