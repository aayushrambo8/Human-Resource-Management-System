package com.aayush.hrms.biometric;

import com.aayush.hrms.attendance.AttendanceDirection;
import java.time.Instant;
import java.util.UUID;

public record BiometricLogSummary(
        UUID id,
        String deviceCode,
        String employeeCode,
        Instant punchTime,
        AttendanceDirection direction,
        BiometricLogStatus status,
        String rawPayload) {

    static BiometricLogSummary from(BiometricRawLog log) {
        return new BiometricLogSummary(
                log.getId(),
                log.getDevice().getDeviceCode(),
                log.getEmployeeCode(),
                log.getPunchTime(),
                log.getDirection(),
                log.getStatus(),
                log.getRawPayload());
    }
}
