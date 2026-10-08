package com.aayush.hrms.biometric;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BiometricDeviceRepository extends JpaRepository<BiometricDevice, UUID> {
    Optional<BiometricDevice> findByDeviceCode(String deviceCode);
}
