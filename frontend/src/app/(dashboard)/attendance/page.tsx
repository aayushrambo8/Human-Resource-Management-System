'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { attendanceApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, formatTime, initials } from '@/lib/format';
import { EnterpriseTable, type Column } from '@/components/ui/EnterpriseTable';
import type { AttendanceRecord } from '@/lib/types';

export default function AttendancePage() {
  const { roles } = useAuth();
  const canReadAttendance = roles.includes('ADMIN') || roles.includes('HR');
  const [page, setPage] = useState(0);
  const size = 20;
  const attendance = useQuery({
    queryKey: ['attendance', page, size],
    queryFn: () => attendanceApi.list(page, size),
    enabled: canReadAttendance,
  });

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'employeeName',
      header: 'Employee',
      sortable: true,
      render: (record) => (
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center font-semibold text-xs text-[var(--text-secondary)]">
            {initials(record.employeeName || record.employeeCode)}
          </div>
          <div>
            <div className="font-semibold text-xs text-[var(--text)]">
              {record.employeeName || record.employeeCode}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono">{record.employeeCode}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'deviceCode',
      header: 'Terminal Checkpoint',
      sortable: true,
      render: (record) => (
        <span className="font-mono text-xs text-[var(--text-muted)]">
          {record.deviceCode}
        </span>
      ),
    },
    {
      key: 'direction',
      header: 'Direction',
      sortable: true,
      render: (record) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
            record.direction === 'IN'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800'
          }`}
        >
          <span className={`size-1.5 rounded-full ${record.direction === 'IN' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {record.direction === 'IN' ? 'CHECK IN' : 'CHECK OUT'}
        </span>
      ),
    },
    {
      key: 'punchDate',
      header: 'Date',
      render: (record) => (
        <span className="text-xs text-[var(--text-secondary)] tabular-nums">
          {formatDate(record.punchTime)}
        </span>
      ),
    },
    {
      key: 'punchTime',
      header: 'Punch Time',
      sortable: true,
      render: (record) => (
        <span className="text-xs text-[var(--text)] font-medium tabular-nums">
          {formatTime(record.punchTime)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              Operations
            </span>
            <span className="text-[var(--text-faint)]">/</span>
            <span className="text-xs text-[var(--text-muted)]">Biometric Records</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
            Attendance Ledger
          </h1>
        </div>
      </div>

      <section aria-label="Attendance records">
        {!canReadAttendance ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <EmptyState
              title="Restricted Access"
              description="Attendance ledger records are accessible by authorized HR and administrative personnel."
              icon="clock"
            />
          </div>
        ) : attendance.isLoading ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <LoadingState label="Loading biometric attendance ledger..." />
          </div>
        ) : attendance.isError ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <ErrorState message="Failed to load attendance records" onRetry={() => void attendance.refetch()} />
          </div>
        ) : attendance.data && attendance.data.content.length > 0 ? (
          <div className="space-y-4">
            <EnterpriseTable
              data={attendance.data.content}
              columns={columns}
              keyExtractor={(r) => r.id}
              searchPlaceholder="Filter records by employee code, name, device..."
              searchField={(r) => `${r.employeeName ?? ''} ${r.employeeCode} ${r.deviceCode}`}
              filterOptions={[
                { label: 'Check-In', value: 'IN', filterFn: (r) => r.direction === 'IN' },
                { label: 'Check-Out', value: 'OUT', filterFn: (r) => r.direction === 'OUT' },
              ]}
            />
            <Pagination
              currentPage={page}
              totalPages={attendance.data.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <EmptyState title="No attendance logs" description="No swipe records recorded for the selected window." icon="clock" />
          </div>
        )}
      </section>
    </div>
  );
}
