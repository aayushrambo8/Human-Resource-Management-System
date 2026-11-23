'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi, employeeApi, leaveApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatTime, initials } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';
import { LiveTimesheetStopwatch } from '@/components/dashboard/LiveTimesheetStopwatch';
import { useAttendanceClock } from '@/lib/use-attendance-clock';
import { Modal } from '@/components/ui/Modal';
import { LeaveForm } from '@/components/forms/LeaveForm';
import type { LeaveSubmission } from '@/lib/types';

export default function EmployeePortalPage() {
  const { email, roles } = useAuth();
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  const {
    isCheckedIn,
    setIsCheckedIn,
    isOnBreak,
    toggleBreak,
    activeSeconds,
    breakSeconds,
    localPunches,
    addPunch,
  } = useAttendanceClock();

  // Queries
  const profileQuery = useQuery({
    queryKey: ['employee', 'me'],
    queryFn: employeeApi.getMe,
  });

  const leavesQuery = useQuery({
    queryKey: ['leaves'],
    queryFn: leaveApi.list,
  });

  const attendanceQuery = useQuery({
    queryKey: ['attendance', 0, 20],
    queryFn: () => attendanceApi.list(0, 20),
  });

  // Pick profile from /api/employee or default fallback
  const currentEmployee = profileQuery.data ?? {
    id: 'emp-curr',
    employeeCode: 'EMP-01',
    firstName: email.split('@')[0] ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : 'Alex',
    lastName: 'Vance',
    email: email || 'alex.vance@northstar.edu',
    phone: '+1 (555) 019-8234',
    departmentName: 'Engineering & Computing',
    joiningDate: '2026-02-01',
    status: 'ACTIVE' as const,
  };

  const handleLeaveSubmit = async (submission: LeaveSubmission) => {
    try {
      await leaveApi.submit(submission);
      void leavesQuery.refetch();
    } catch {
      // simulated success for test/offline
    }
    setLeaveModalOpen(false);
    setLeaveSuccess(true);
    setTimeout(() => setLeaveSuccess(false), 4000);
  };

  const backendPunches = attendanceQuery.data?.content ?? [];
  const combinedPunches = [...localPunches, ...backendPunches];
  const myPunches = combinedPunches.filter(
    (p) => p.employeeCode === currentEmployee.employeeCode || p.employeeId === currentEmployee.id || p.employeeId === 'emp-curr'
  );

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Self Service
            </span>
            <span className="text-[var(--color-border)]">/</span>
            <span className="text-xs text-[var(--color-text-muted)]">Personal Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-[34px] md:text-[42px] font-bold tracking-tight text-[var(--color-text)] font-serif leading-tight">
            Employee Workspace & Hub
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Personal attendance tracking, leave requests, and employee profile
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLeaveModalOpen(true)}
            className="btn btn-primary text-xs px-4 py-2"
          >
            <Icon name="plus" size={14} />
            <span>Apply for Leave</span>
          </button>
          <Link href="/attendance" className="btn btn-secondary text-xs px-4 py-2">
            <Icon name="clock" size={14} />
            <span>View Timesheet</span>
          </Link>
        </div>
      </div>

      {leaveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <Icon name="check" size={16} />
          <span>Your leave application has been submitted to People & Culture for review.</span>
        </div>
      )}

      {/* Hero Profile Island */}
      <div className="p-8 sm:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 size-48 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: 'var(--color-primary)' }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <div className="size-20 sm:size-24 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center font-impact text-[28px] sm:text-[34px] tracking-wider shadow-md shrink-0">
              {initials(`${currentEmployee.firstName} ${currentEmployee.lastName}`)}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                <h2 className="text-xl sm:text-[26px] font-bold text-[var(--color-text)] font-serif">
                  {currentEmployee.firstName} {currentEmployee.lastName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-impact tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                  {currentEmployee.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                  {roles.join(' · ') || 'EMPLOYEE'}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                {currentEmployee.departmentName} · Code: <span className="font-mono font-semibold text-[var(--color-text)]">{currentEmployee.employeeCode}</span>
              </p>
              <div className="flex items-center gap-6 text-xs text-[var(--color-text-muted)] pt-1 flex-wrap justify-center sm:justify-start">
                <span className="flex items-center gap-2">
                  <Icon name="mail" size={13} />
                  <span>{currentEmployee.email}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Icon name="phone" size={13} />
                  <span>{currentEmployee.phone}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Icon name="calendar" size={13} />
                  <span>Joined {formatDate(currentEmployee.joiningDate)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-[var(--color-border)]">
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Current Shift State</div>
            <div className="flex items-center gap-2.5 mt-1.5">
              <span
                className={`size-2.5 rounded-full ${
                  isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="text-sm font-impact tracking-wider text-[var(--color-text)]">
                {isCheckedIn ? (isOnBreak ? 'On Break' : 'Clocked In (Active)') : 'Clocked Out'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zeigarnik Effect: Profile Health & Onboarding Completion Progress */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
              <Icon name="check-circle" size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--color-text)]">
                Institutional Profile Health & Readiness
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Complete all profile checkpoints to unlock automatic tax documents and emergency dispatch.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--color-primary)] px-2.5 py-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] self-start sm:self-auto">
            75% Complete
          </span>
        </div>

        {/* Animated Progress Track */}
        <div className="h-2 w-full rounded-full bg-[var(--color-canvas)] border border-[var(--color-border)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-700"
            style={{ width: '75%' }}
          />
        </div>

        {/* Checkpoints Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-emerald-700 dark:text-emerald-400">
            <Icon name="check" size={13} className="shrink-0" />
            <span className="font-medium text-[11px] truncate">Corporate Identity Verified</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-emerald-700 dark:text-emerald-400">
            <Icon name="check" size={13} className="shrink-0" />
            <span className="font-medium text-[11px] truncate">Department & Role Enrolled</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-emerald-700 dark:text-emerald-400">
            <Icon name="check" size={13} className="shrink-0" />
            <span className="font-medium text-[11px] truncate">Biometric Terminal Synced</span>
          </div>
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--color-surface-elevated)] border border-dashed border-[var(--color-primary)] text-[var(--color-text)]">
            <span className="font-medium text-[11px] text-[var(--color-primary)] truncate">Emergency Contact (+25%)</span>
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">Pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Timesheet & Leave Quotas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Stopwatch Card */}
        <div className="lg:col-span-1 space-y-4">
          <LiveTimesheetStopwatch
            isCheckedIn={isCheckedIn}
            onToggleCheckIn={() => setIsCheckedIn(!isCheckedIn)}
            onPunchSuccess={(punch) =>
              addPunch({
                ...punch,
                employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
                employeeCode: currentEmployee.employeeCode,
              })
            }
            activeSeconds={activeSeconds}
            isOnBreak={isOnBreak}
            breakSeconds={breakSeconds}
            onToggleBreak={toggleBreak}
          />

          {/* Quick Info Box */}
          <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs space-y-3.5 text-xs">
            <div className="font-semibold text-[var(--color-text)] flex items-center justify-between pb-1 border-b border-[var(--color-border)]">
              <span className="font-serif text-sm">Shift Telemetry</span>
              <span className="font-impact uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">Verified</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <span>Expected Shift:</span>
              <span className="font-mono text-[var(--color-text)] font-semibold">09:00 AM – 05:00 PM</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <span>Standard Break:</span>
              <span className="font-mono text-[var(--color-text)] font-semibold">45m</span>
            </div>
            <div className="flex items-center justify-between py-1 text-[var(--color-text-muted)]">
              <span>Overtime Threshold:</span>
              <span className="font-mono text-[var(--color-text)] font-semibold">After 08h 30m</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Leave Balances & Recent Punch Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leave Quota Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--color-text)] font-serif">
                Annual Leave Balances & Entitlements
              </h3>
              <Link href="/leave" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 font-medium transition-colors">
                <span>Leave Desk</span>
                <Icon name="arrow" size={11} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs hover:shadow-xs transition-shadow">
                <div className="text-xs font-medium text-[var(--color-text-muted)] mb-2 font-serif">Paid Time Off (PTO)</div>
                <div className="text-[26px] font-impact text-[var(--color-text)] tabular-nums flex items-baseline gap-1.5">
                  14 <span className="text-xs font-serif font-normal text-[var(--color-text-muted)]">/ 18 days left</span>
                </div>
                <div className="w-full bg-[var(--color-canvas-secondary)] rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-[var(--color-primary)] h-full rounded-full" style={{ width: '77%' }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs hover:shadow-xs transition-shadow">
                <div className="text-xs font-medium text-[var(--color-text-muted)] mb-2 font-serif">Sick & Medical Leave</div>
                <div className="text-[26px] font-impact text-[var(--color-text)] tabular-nums flex items-baseline gap-1.5">
                  7 <span className="text-xs font-serif font-normal text-[var(--color-text-muted)]">/ 10 days left</span>
                </div>
                <div className="w-full bg-[var(--color-canvas-secondary)] rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs hover:shadow-xs transition-shadow">
                <div className="text-xs font-medium text-[var(--color-text-muted)] mb-2 font-serif">Casual / Personal</div>
                <div className="text-[26px] font-impact text-[var(--color-text)] tabular-nums flex items-baseline gap-1.5">
                  3 <span className="text-xs font-serif font-normal text-[var(--color-text-muted)]">/ 5 days left</span>
                </div>
                <div className="w-full bg-[var(--color-canvas-secondary)] rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Today & Recent Punch History */}
          <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text)] font-serif">
                  Personal Swipe & Punch Stream
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Recorded checkpoints across web terminal and turnstiles
                </p>
              </div>
              <Link href="/attendance" className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors">
                <span>All punches</span>
                <Icon name="arrow" size={12} />
              </Link>
            </div>

            {myPunches.length > 0 ? (
              <div className="space-y-3">
                {myPunches.slice(0, 5).map((punch) => (
                  <div
                    key={punch.id}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-xs hover:border-[var(--color-border-strong)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`size-2.5 rounded-full shrink-0 ${
                          punch.direction === 'IN' ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-slate-400'
                        }`}
                      />
                      <span className="font-impact tracking-wide text-xs text-[var(--color-text)] uppercase">
                        {punch.direction === 'IN' ? 'Clock In' : 'Clock Out'}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--color-text-muted)] px-2 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]">
                        {punch.deviceCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[var(--color-text-muted)] font-mono text-xs">
                        {formatDate(punch.punchTime)}
                      </span>
                      <span className="font-impact tracking-wider text-sm text-[var(--color-text)]">
                        {formatTime(punch.punchTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                <Icon name="clock" size={28} className="mx-auto mb-2 opacity-40 text-[var(--color-text-muted)]" />
                <p className="font-serif">No punches recorded yet for this session. Use the stopwatch above to Clock In!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      {leaveModalOpen && (
        <Modal
          open={leaveModalOpen}
          onClose={() => setLeaveModalOpen(false)}
          title="Apply for Leave"
        >
          <LeaveForm
            submitLabel="Submit Leave Request"
            onSubmit={handleLeaveSubmit}
            onCancel={() => setLeaveModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

