package com.aayush.hrms.leave;

import jakarta.validation.constraints.NotNull;

public record LeaveDecision(@NotNull LeaveStatus status) {
}
