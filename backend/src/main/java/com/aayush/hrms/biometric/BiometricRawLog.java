package com.aayush.hrms.biometric;

import com.aayush.hrms.attendance.AttendanceDirection;
import com.aayush.hrms.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "biometric_raw_logs")
public class BiometricRawLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private BiometricDevice device;

    @Column(nullable = false, length = 40)
    private String employeeCode;

    @Column(nullable = false)
    private Instant punchTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private AttendanceDirection direction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private BiometricLogStatus status;

    @Column(columnDefinition = "text")
    private String rawPayload;

    protected BiometricRawLog() {
    }

    public BiometricRawLog(
            BiometricDevice device,
            String employeeCode,
            Instant punchTime,
            AttendanceDirection direction,
            BiometricLogStatus status,
            String rawPayload) {
        this.device = device;
        this.employeeCode = employeeCode;
        this.punchTime = punchTime;
        this.direction = direction;
        this.status = status;
        this.rawPayload = rawPayload;
    }

    public BiometricDevice getDevice() {
        return device;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public Instant getPunchTime() {
        return punchTime;
    }

    public AttendanceDirection getDirection() {
        return direction;
    }

    public BiometricLogStatus getStatus() {
        return status;
    }

    public String getRawPayload() {
        return rawPayload;
    }
}
