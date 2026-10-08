package com.aayush.hrms.attendance;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;

    public AttendanceService(AttendanceRecordRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @Transactional
    public Page<AttendanceSummary> list(Pageable pageable) {
        return attendanceRepository.findAllByOrderByPunchTimeDesc(pageable).map(AttendanceSummary::from);
    }
}
