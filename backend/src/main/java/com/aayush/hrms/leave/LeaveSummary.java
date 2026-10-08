package com.aayush.hrms.leave;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record LeaveSummary(
        UUID id,
        UUID employeeId,
        String employeeCode,
        LocalDate startDate,
        LocalDate endDate,
        String reason,
        LeaveStatus status,
        Instant reviewedAt) {

    static LeaveSummary from(LeaveRequest request) {
        return new LeaveSummary(
                request.getId(),
                request.getEmployee().getId(),
                request.getEmployee().getEmployeeCode(),
                request.getStartDate(),
                request.getEndDate(),
                request.getReason(),
                request.getStatus(),
                request.getReviewedAt());
    }
}
