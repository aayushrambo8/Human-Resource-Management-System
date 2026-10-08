package com.aayush.hrms.attendance;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    java.util.List<AttendanceRecord> findAllByOrderByPunchTimeDesc();
    Page<AttendanceRecord> findAllByOrderByPunchTimeDesc(Pageable pageable);
}
