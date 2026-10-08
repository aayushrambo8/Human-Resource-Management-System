package com.aayush.hrms.auth;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "auth_bootstrap_lock")
public class BootstrapLock {

    @Id
    private Integer id;

    protected BootstrapLock() {
    }
}
