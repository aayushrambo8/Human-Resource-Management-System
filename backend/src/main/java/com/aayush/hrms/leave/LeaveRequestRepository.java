package com.aayush.hrms.leave;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {
    List<LeaveRequest> findAllByEmployeeIdOrderByCreatedAtDesc(UUID employeeId);
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();
}
