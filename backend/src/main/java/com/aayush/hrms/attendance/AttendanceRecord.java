package com.aayush.hrms.attendance;

import com.aayush.hrms.biometric.BiometricDevice;
import com.aayush.hrms.common.BaseEntity;
import com.aayush.hrms.employee.Employee;
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
@Table(name = "attendance_records")
public class AttendanceRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private BiometricDevice device;

    @Column(nullable = false)
    private Instant punchTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private AttendanceDirection direction;

    protected AttendanceRecord() {
    }

    public AttendanceRecord(
            Employee employee,
            BiometricDevice device,
            Instant punchTime,
            AttendanceDirection direction) {
        this.employee = employee;
        this.device = device;
        this.punchTime = punchTime;
        this.direction = direction;
    }

    public Employee getEmployee() {
        return employee;
    }

    public BiometricDevice getDevice() {
        return device;
    }

    public Instant getPunchTime() {
        return punchTime;
    }

    public AttendanceDirection getDirection() {
        return direction;
    }
}
