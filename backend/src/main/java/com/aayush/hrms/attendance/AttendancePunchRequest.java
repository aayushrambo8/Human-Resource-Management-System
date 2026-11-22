package com.aayush.hrms.attendance;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record AttendancePunchRequest(
        @NotNull AttendanceDirection direction,
        String deviceCode,
        Instant punchTime,
        String employeeCode) {
}
