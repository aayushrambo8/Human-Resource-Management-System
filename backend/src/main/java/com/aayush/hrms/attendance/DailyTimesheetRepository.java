package com.aayush.hrms.attendance;

import com.aayush.hrms.employee.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface DailyTimesheetRepository extends JpaRepository<DailyTimesheet, UUID> {
    Optional<DailyTimesheet> findByEmployeeAndWorkDate(Employee employee, LocalDate workDate);
    Optional<DailyTimesheet> findByEmployeeIdAndWorkDate(UUID employeeId, LocalDate workDate);
}
