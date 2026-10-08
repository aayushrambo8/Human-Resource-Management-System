package com.aayush.hrms.biometric;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class BiometricLogService {

    private final BiometricRawLogRepository logRepository;

    public BiometricLogService(BiometricRawLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Transactional
    public Page<BiometricLogSummary> list(Pageable pageable) {
        return logRepository.findAllByOrderByPunchTimeDesc(pageable).map(BiometricLogSummary::from);
    }
}
