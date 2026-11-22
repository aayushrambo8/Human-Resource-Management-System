package com.aayush.hrms.attendance;

import com.aayush.hrms.common.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('attendance:read')")
    public PageResponse<AttendanceSummary> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.clamp(size, 1, 100), Sort.unsorted());
        return PageResponse.from(attendanceService.list(pageable));
    }

    @PostMapping("/punch")
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceSummary punch(
            Authentication authentication,
            @Valid @RequestBody AttendancePunchRequest request) {
        String authEmail = authentication != null ? authentication.getName() : null;
        return attendanceService.recordPunch(authEmail, request);
    }
}
