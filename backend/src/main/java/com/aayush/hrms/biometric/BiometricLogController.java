package com.aayush.hrms.biometric;

import com.aayush.hrms.common.PageResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/biometric/logs")
public class BiometricLogController {

    private final BiometricLogService logService;

    public BiometricLogController(BiometricLogService logService) {
        this.logService = logService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('biometric:read')")
    public PageResponse<BiometricLogSummary> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.clamp(size, 1, 100), Sort.unsorted());
        return PageResponse.from(logService.list(pageable));
    }
}
