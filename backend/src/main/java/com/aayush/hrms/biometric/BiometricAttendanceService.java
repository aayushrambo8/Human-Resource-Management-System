package com.aayush.hrms.biometric;

import com.aayush.hrms.attendance.AttendanceDirection;
import com.aayush.hrms.attendance.AttendanceRecord;
import com.aayush.hrms.attendance.AttendanceRecordRepository;
import com.aayush.hrms.attendance.DailyTimesheet;
import com.aayush.hrms.attendance.DailyTimesheetRepository;
import com.aayush.hrms.employee.Employee;
import com.aayush.hrms.employee.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class BiometricAttendanceService {

    private final BiometricDeviceRepository deviceRepository;
    private final BiometricRawLogRepository rawLogRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final DailyTimesheetRepository dailyTimesheetRepository;

    public BiometricAttendanceService(
            BiometricDeviceRepository deviceRepository,
            BiometricRawLogRepository rawLogRepository,
            EmployeeRepository employeeRepository,
            AttendanceRecordRepository attendanceRecordRepository,
            DailyTimesheetRepository dailyTimesheetRepository) {
        this.deviceRepository = deviceRepository;
        this.rawLogRepository = rawLogRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.dailyTimesheetRepository = dailyTimesheetRepository;
    }

    @Transactional
    public BiometricPunchResponse acceptPunch(BiometricPunchRequest request) {
        BiometricDevice device = deviceRepository.findByDeviceCode(request.deviceCode())
                .filter(BiometricDevice::isActive)
                .orElseThrow(() -> new EntityNotFoundException("Unknown biometric device"));

        AttendanceDirection direction = request.direction() == null
                ? AttendanceDirection.UNKNOWN
                : request.direction();

        Employee employee = employeeRepository.findByEmployeeCode(request.employeeCode()).orElse(null);
        BiometricLogStatus status = employee == null
                ? BiometricLogStatus.UNKNOWN_EMPLOYEE
                : BiometricLogStatus.ACCEPTED;

        BiometricRawLog rawLog = rawLogRepository.save(new BiometricRawLog(
                device,
                request.employeeCode(),
                request.punchTime(),
                direction,
                status,
                request.rawPayload()));

        UUID attendanceRecordId = null;
        if (employee != null) {
            AttendanceRecord record = attendanceRecordRepository.save(new AttendanceRecord(
                    employee,
                    device,
                    request.punchTime(),
                    direction));
            attendanceRecordId = record.getId();

            // When employee punches (especially clock-out), update or create daily timesheet in the DB
            try {
                LocalDate workDate = request.punchTime().atZone(ZoneId.systemDefault()).toLocalDate();
                DailyTimesheet timesheet = dailyTimesheetRepository.findByEmployeeAndWorkDate(employee, workDate)
                        .orElseGet(() -> new DailyTimesheet(employee, workDate));
                timesheet.recordPunch(request.punchTime(), direction);
                dailyTimesheetRepository.save(timesheet);
            } catch (Exception e) {
                // Keep attendance record saved even if timesheet table update has issues
            }
        }

        return new BiometricPunchResponse(rawLog.getId(), attendanceRecordId, status.name());
    }
}
