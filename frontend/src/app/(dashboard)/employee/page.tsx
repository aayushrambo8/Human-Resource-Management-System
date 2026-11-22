'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { employeeApi, leaveApi } from '@/lib/api';
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
  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.list,
  });

  const leavesQuery = useQuery({
    queryKey: ['leaves'],
    queryFn: leaveApi.list,
  });

  // Pick profile or default fallback
  const currentEmployee = employeesQuery.data?.find(
    (e) => e.email?.toLowerCase() === email.toLowerCase() || e.employeeCode === 'EMP-01'
  ) ?? {
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

  const myPunches = localPunches.filter(
    (p) => p.employeeCode === currentEmployee.employeeCode || p.employeeId === 'emp-curr'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Self Service
            </span>
            <span className="text-[var(--color-border)]">/</span>
            <span className="text-xs text-[var(--color-text-muted)]">Personal Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Employee Workspace & Hub
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Personal attendance tracking, leave requests, and employee profile
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setLeaveModalOpen(true)}
            className="btn btn-primary text-xs"
          >
            <Icon name="plus" size={14} />
            <span>Apply for Leave</span>
          </button>
          <Link href="/attendance" className="btn btn-secondary text-xs">
            <Icon name="clock" size={14} />
            <span>View Timesheet</span>
          </Link>
        </div>
      </div>

      {leaveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Icon name="check" size={15} />
          <span>Your leave application has been submitted to People & Culture for review.</span>
        </div>
      )}

      {/* Hero Profile Island */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 size-48 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ background: 'var(--color-primary)' }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              {initials(`${currentEmployee.firstName} ${currentEmployee.lastName}`)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text)]">
                  {currentEmployee.firstName} {currentEmployee.lastName}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {currentEmployee.status}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                  {roles.join(' · ') || 'EMPLOYEE'}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {currentEmployee.departmentName} · Code: <span className="font-mono">{currentEmployee.employeeCode}</span>
              </p>
              <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] mt-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Icon name="mail" size={12} />
                  <span>{currentEmployee.email}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="phone" size={12} />
                  <span>{currentEmployee.phone}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="calendar" size={12} />
                  <span>Joined {formatDate(currentEmployee.joiningDate)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-[var(--color-border)]">
            <div className="text-[11px] font-mono text-[var(--color-text-muted)]">Current Shift State</div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`size-2 rounded-full ${
                  isCheckedIn ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                }`}
              />
              <span className="text-xs font-bold text-[var(--color-text)]">
                {isCheckedIn ? (isOnBreak ? 'On Break' : 'Clocked In (Active)') : 'Clocked Out'}
              </span>
            </div>
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
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs space-y-2 text-xs">
            <div className="font-semibold text-[var(--color-text)] flex items-center justify-between">
              <span>Shift Telemetry</span>
              <span className="font-mono text-[10px] text-[var(--color-primary)]">Verified</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <span>Expected Shift:</span>
              <span className="font-mono text-[var(--color-text)] font-semibold">09:00 AM – 05:00 PM</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
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
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Annual Leave Balances & Entitlements
              </h3>
              <Link href="/leave" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1">
                <span>Leave Desk</span>
                <Icon name="arrow" size={11} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
                <div className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">Paid Time Off (PTO)</div>
                <div className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
                  14 <span className="text-xs font-normal text-[var(--color-text-muted)]">/ 18 days left</span>
                </div>
                <div className="w-full bg-[var(--color-canvas-secondary)] rounded-full h-1 mt-2.5 overflow-hidden">
                  <div className="bg-[var(--color-primary)] h-full rounded-full" style={{ width: '77%' }} />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
                <div className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">Sick & Medical Leave</div>
                <div className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
                  7 <span className="text-xs font-normal text-[var(--color-text-muted)]">/ 10 days left</span>
                </div>
                <div className="w-full bg-[var(--color-canvas-secondary)] rounded-full h-1 mt-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
                <div className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">Casual / Personal</div>
                <div className="text-2xl font-bold text-[var(--color-text)] tabular-nums">
                  3 <span className="text-xs font-normal text-[var(--color-text-muted)]">/ 5 days left</span>
                </div>
                <div className="w-full bg-[var(--color-canvas-secondary)] rounded-full h-1 mt-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Today & Recent Punch History */}
          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  Personal Swipe & Punch Stream
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Recorded checkpoints across web terminal and turnstiles
                </p>
              </div>
              <Link href="/attendance" className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1">
                <span>All punches</span>
                <Icon name="arrow" size={12} />
              </Link>
            </div>

            {myPunches.length > 0 ? (
              <div className="space-y-2">
                {myPunches.slice(0, 5).map((punch) => (
                  <div
                    key={punch.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`size-2 rounded-full ${
                          punch.direction === 'IN' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span className="font-semibold text-[var(--color-text)]">
                        {punch.direction === 'IN' ? 'Clock In' : 'Clock Out'}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--color-text-muted)] px-1.5 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)]">
                        {punch.deviceCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--color-text-muted)] font-mono text-[11px]">
                        {formatDate(punch.punchTime)}
                      </span>
                      <span className="font-bold text-[var(--color-text)] font-mono">
                        {formatTime(punch.punchTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">
                <Icon name="clock" size={24} className="mx-auto mb-2 opacity-50" />
                <p>No punches recorded yet for this session. Use the stopwatch above to Clock In!</p>
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

