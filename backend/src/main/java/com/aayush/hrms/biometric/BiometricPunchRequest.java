package com.aayush.hrms.biometric;

import com.aayush.hrms.attendance.AttendanceDirection;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record BiometricPunchRequest(
        @NotBlank String deviceCode,
        @NotBlank String employeeCode,
        @NotNull Instant punchTime,
        AttendanceDirection direction,
        String rawPayload) {
}
