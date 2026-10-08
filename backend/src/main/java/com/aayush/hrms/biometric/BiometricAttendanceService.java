package com.aayush.hrms.biometric;

import com.aayush.hrms.attendance.AttendanceDirection;
import com.aayush.hrms.attendance.AttendanceRecord;
import com.aayush.hrms.attendance.AttendanceRecordRepository;
import com.aayush.hrms.employee.Employee;
import com.aayush.hrms.employee.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class BiometricAttendanceService {

    private final BiometricDeviceRepository deviceRepository;
    private final BiometricRawLogRepository rawLogRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    public BiometricAttendanceService(
            BiometricDeviceRepository deviceRepository,
            BiometricRawLogRepository rawLogRepository,
            EmployeeRepository employeeRepository,
            AttendanceRecordRepository attendanceRecordRepository) {
        this.deviceRepository = deviceRepository;
        this.rawLogRepository = rawLogRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
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
        }

        return new BiometricPunchResponse(rawLog.getId(), attendanceRecordId, status.name());
    }
}
