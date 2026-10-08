package com.aayush.hrms.biometric;

import com.aayush.hrms.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "biometric_devices")
public class BiometricDevice extends BaseEntity {

    @Column(nullable = false, unique = true, length = 64)
    private String deviceCode;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 80)
    private String ipAddress;

    @Column(length = 120)
    private String location;

    @Column(nullable = false, length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private boolean active = true;

    protected BiometricDevice() {
    }

    public String getDeviceCode() {
        return deviceCode;
    }

    public String getName() {
        return name;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public boolean isActive() {
        return active;
    }

}
