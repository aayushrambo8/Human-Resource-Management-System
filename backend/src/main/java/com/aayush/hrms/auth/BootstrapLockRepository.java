package com.aayush.hrms.auth;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface BootstrapLockRepository extends JpaRepository<BootstrapLock, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select bootstrap from BootstrapLock bootstrap where bootstrap.id = 1")
    Optional<BootstrapLock> lockBootstrapRow();
}
