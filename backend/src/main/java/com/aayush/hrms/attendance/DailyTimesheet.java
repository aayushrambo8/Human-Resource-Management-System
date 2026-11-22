package com.aayush.hrms.attendance;

import com.aayush.hrms.common.BaseEntity;
import com.aayush.hrms.employee.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_timesheets")
public class DailyTimesheet extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "shift_id")
    private UUID shiftId;

    @Column(name = "first_punch_in")
    private Instant firstPunchIn;

    @Column(name = "last_punch_out")
    private Instant lastPunchOut;

    @Column(name = "total_work_minutes", nullable = false)
    private int totalWorkMinutes = 0;

    @Column(name = "regular_minutes", nullable = false)
    private int regularMinutes = 0;

    @Column(name = "overtime_minutes", nullable = false)
    private int overtimeMinutes = 0;

    @Column(name = "break_minutes", nullable = false)
    private int breakMinutes = 0;

    @Column(name = "late_minutes", nullable = false)
    private int lateMinutes = 0;

    @Column(name = "early_exit_minutes", nullable = false)
    private int earlyExitMinutes = 0;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "ABSENT";

    @Column(name = "has_anomaly", nullable = false)
    private boolean hasAnomaly = false;

    @Column(name = "anomaly_reason", length = 255)
    private String anomalyReason;

    @Column(name = "is_manual_override", nullable = false)
    private boolean isManualOverride = false;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "remarks", length = 500)
    private String remarks;

    protected DailyTimesheet() {
    }

    public DailyTimesheet(Employee employee, LocalDate workDate) {
        this.employee = employee;
        this.workDate = workDate;
        this.status = "PRESENT";
    }

    public void recordPunch(Instant punchTime, AttendanceDirection direction) {
        if (direction == AttendanceDirection.IN) {
            if (this.firstPunchIn == null || punchTime.isBefore(this.firstPunchIn)) {
                this.firstPunchIn = punchTime;
            }
            this.status = "PRESENT";
        } else if (direction == AttendanceDirection.OUT) {
            this.lastPunchOut = punchTime;
            if (this.firstPunchIn != null) {
                int minutes = (int) Math.max(0, Duration.between(this.firstPunchIn, punchTime).toMinutes());
                this.totalWorkMinutes = minutes;
                this.regularMinutes = Math.min(minutes, 480);
                this.overtimeMinutes = Math.max(0, minutes - 480);
                this.status = minutes >= 240 ? "PRESENT" : (minutes > 0 ? "HALF_DAY" : "PRESENT");
            } else {
                this.status = "PRESENT";
            }
        }
    }

    public Employee getEmployee() {
        return employee;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public UUID getShiftId() {
        return shiftId;
    }

    public void setShiftId(UUID shiftId) {
        this.shiftId = shiftId;
    }

    public Instant getFirstPunchIn() {
        return firstPunchIn;
    }

    public Instant getLastPunchOut() {
        return lastPunchOut;
    }

    public int getTotalWorkMinutes() {
        return totalWorkMinutes;
    }

    public int getRegularMinutes() {
        return regularMinutes;
    }

    public int getOvertimeMinutes() {
        return overtimeMinutes;
    }

    public int getBreakMinutes() {
        return breakMinutes;
    }

    public int getLateMinutes() {
        return lateMinutes;
    }

    public int getEarlyExitMinutes() {
        return earlyExitMinutes;
    }

    public String getStatus() {
        return status;
    }

    public boolean isHasAnomaly() {
        return hasAnomaly;
    }

    public String getAnomalyReason() {
        return anomalyReason;
    }

    public boolean isManualOverride() {
        return isManualOverride;
    }

    public UUID getApprovedBy() {
        return approvedBy;
    }

    public String getRemarks() {
        return remarks;
    }
}
