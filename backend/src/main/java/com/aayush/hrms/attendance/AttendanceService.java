package com.aayush.hrms.attendance;

import com.aayush.hrms.auth.UserAccount;
import com.aayush.hrms.auth.UserAccountRepository;
import com.aayush.hrms.biometric.BiometricDevice;
import com.aayush.hrms.biometric.BiometricDeviceRepository;
import com.aayush.hrms.biometric.BiometricLogStatus;
import com.aayush.hrms.biometric.BiometricRawLog;
import com.aayush.hrms.biometric.BiometricRawLogRepository;
import com.aayush.hrms.employee.Employee;
import com.aayush.hrms.employee.EmployeeRepository;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserAccountRepository accountRepository;
    private final BiometricDeviceRepository deviceRepository;
    private final BiometricRawLogRepository rawLogRepository;
    private final DailyTimesheetRepository timesheetRepository;

    public AttendanceService(
            AttendanceRecordRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            UserAccountRepository accountRepository,
            BiometricDeviceRepository deviceRepository,
            BiometricRawLogRepository rawLogRepository,
            DailyTimesheetRepository timesheetRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.accountRepository = accountRepository;
        this.deviceRepository = deviceRepository;
        this.rawLogRepository = rawLogRepository;
        this.timesheetRepository = timesheetRepository;
    }

    @Transactional
    public Page<AttendanceSummary> list(Pageable pageable) {
        return attendanceRepository.findAllByOrderByPunchTimeDesc(pageable).map(AttendanceSummary::from);
    }

    @Transactional
    public Page<AttendanceSummary> list(String authEmail, boolean canReadAll, Pageable pageable) {
        if (canReadAll) {
            return attendanceRepository.findAllByOrderByPunchTimeDesc(pageable).map(AttendanceSummary::from);
        }
        if (authEmail != null && !authEmail.isBlank()) {
            UserAccount account = accountRepository.findByEmailIgnoreCase(authEmail).orElse(null);
            Employee employee = (account != null && account.getEmployee() != null)
                    ? account.getEmployee()
                    : employeeRepository.findByEmail(authEmail).orElse(null);
            if (employee != null) {
                return attendanceRepository.findByEmployeeOrderByPunchTimeDesc(employee, pageable)
                        .map(AttendanceSummary::from);
            }
        }
        return Page.empty(pageable);
    }

    @Transactional
    public AttendanceSummary recordPunch(String authEmail, AttendancePunchRequest request) {
        UserAccount callerAccount = authEmail != null ? accountRepository.findByEmailIgnoreCase(authEmail).orElse(null) : null;
        boolean isHrOrAdmin = callerAccount != null && callerAccount.getRoles().stream()
                .anyMatch(r -> r.getCode().equals("ADMIN") || r.getCode().equals("HR"));

        Employee employee;
        if (request.employeeCode() != null && !request.employeeCode().isBlank()) {
            employee = employeeRepository.findByEmployeeCode(request.employeeCode())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found with code: " + request.employeeCode()));
            if (!isHrOrAdmin && (callerAccount == null || callerAccount.getEmployee() == null
                    || !callerAccount.getEmployee().getId().equals(employee.getId()))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot punch attendance for another employee");
            }
        } else if (callerAccount != null && callerAccount.getEmployee() != null) {
            employee = callerAccount.getEmployee();
        } else if (authEmail != null && !authEmail.isBlank()) {
            employee = employeeRepository.findByEmail(authEmail)
                    .orElseGet(() -> employeeRepository.findAll().stream().findFirst().orElse(null));
        } else {
            employee = null;
        }

        if (employee == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to resolve employee for attendance punch");
        }

        String deviceCode = (request.deviceCode() != null && !request.deviceCode().isBlank())
                ? request.deviceCode()
                : "WEB-TERMINAL";

        BiometricDevice device = deviceRepository.findByDeviceCode(deviceCode)
                .orElseGet(() -> {
                    return deviceRepository.save(new BiometricDevice(
                            deviceCode,
                            "Web Attendance Terminal",
                            "127.0.0.1",
                            "Online Portal",
                            "e76b6359af8cbe298e362c0e179b90c627cef49db0e9aeeca55175ef799c6b37"
                    ));
                });

        Instant punchTime = request.punchTime() != null ? request.punchTime() : Instant.now();
        AttendanceDirection direction = request.direction() != null ? request.direction() : AttendanceDirection.IN;

        // Save raw biometric log for auditing
        rawLogRepository.save(new BiometricRawLog(
                device,
                employee.getEmployeeCode(),
                punchTime,
                direction,
                BiometricLogStatus.ACCEPTED,
                "Web/Manual punch for " + employee.getEmployeeCode()));

        // Save official attendance record
        AttendanceRecord record = attendanceRepository.save(new AttendanceRecord(
                employee,
                device,
                punchTime,
                direction));

        // Update daily timesheet in database (updates last_punch_out and calculated work minutes if clocked out)
        try {
            LocalDate workDate = punchTime.atZone(ZoneId.systemDefault()).toLocalDate();
            DailyTimesheet timesheet = timesheetRepository.findByEmployeeAndWorkDate(employee, workDate)
                    .orElseGet(() -> new DailyTimesheet(employee, workDate));
            timesheet.recordPunch(punchTime, direction);
            timesheetRepository.save(timesheet);
        } catch (Exception ignored) {
        }

        return AttendanceSummary.from(record);
    }
}
