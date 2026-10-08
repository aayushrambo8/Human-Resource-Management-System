package com.aayush.hrms.biometric;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BiometricRawLogRepository extends JpaRepository<BiometricRawLog, UUID> {
    java.util.List<BiometricRawLog> findAllByOrderByPunchTimeDesc();
    Page<BiometricRawLog> findAllByOrderByPunchTimeDesc(Pageable pageable);
}
