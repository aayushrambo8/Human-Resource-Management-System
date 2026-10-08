package com.aayush.hrms.attendance;

import java.time.Instant;
import java.util.UUID;

public record AttendanceSummary(
        UUID id,
        UUID employeeId,
        String employeeCode,
        String employeeName,
        String deviceCode,
        Instant punchTime,
        AttendanceDirection direction) {

    static AttendanceSummary from(AttendanceRecord record) {
        return new AttendanceSummary(
                record.getId(),
                record.getEmployee().getId(),
                record.getEmployee().getEmployeeCode(),
                record.getEmployee().getFirstName() + " " + record.getEmployee().getLastName(),
                record.getDevice().getDeviceCode(),
                record.getPunchTime(),
                record.getDirection());
    }
}
