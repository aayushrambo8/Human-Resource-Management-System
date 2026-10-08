package com.aayush.hrms.biometric;

import java.util.UUID;

public record BiometricPunchResponse(
        UUID logId,
        UUID attendanceRecordId,
        String status) {
}
