package com.aayush.hrms.biometric;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/biometric")
public class BiometricAttendanceController {

    private final BiometricDeviceRepository deviceRepository;
    private final DeviceTokenService deviceTokenService;
    private final BiometricAttendanceService attendanceService;
    private final String tokenHeader;

    public BiometricAttendanceController(
            BiometricDeviceRepository deviceRepository,
            DeviceTokenService deviceTokenService,
            BiometricAttendanceService attendanceService,
            @Value("${hrms.biometric.token-header:X-Device-Token}") String tokenHeader) {
        this.deviceRepository = deviceRepository;
        this.deviceTokenService = deviceTokenService;
        this.attendanceService = attendanceService;
        this.tokenHeader = tokenHeader;
    }

    @PostMapping("/attendance")
    @ResponseStatus(HttpStatus.ACCEPTED)
    BiometricPunchResponse acceptPunch(
            HttpServletRequest httpRequest,
            @Valid @RequestBody BiometricPunchRequest request) {
        BiometricDevice device = deviceRepository.findByDeviceCode(request.deviceCode())
                .filter(BiometricDevice::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        if (!deviceTokenService.matches(httpRequest.getHeader(tokenHeader), device.getTokenHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid " + tokenHeader);
        }

        return attendanceService.acceptPunch(request);
    }
}
