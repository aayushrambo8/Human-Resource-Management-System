package com.aayush.hrms.auth;

import com.aayush.hrms.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "permissions")
public class Permission extends BaseEntity {

    @Column(nullable = false, unique = true, length = 80)
    private String code;

    protected Permission() {
    }

    public String getCode() {
        return code;
    }
}
