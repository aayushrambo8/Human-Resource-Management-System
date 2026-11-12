'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { biometricApi } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, formatTime, initials } from '@/lib/format';
import { EnterpriseTable, type Column } from '@/components/ui/EnterpriseTable';
import type { BiometricLog } from '@/lib/types';

export default function BiometricPage() {
  const [page, setPage] = useState(0);
  const size = 20;
  const logs = useQuery({ queryKey: ['biometric', page, size], queryFn: () => biometricApi.list(page, size) });

  const columns: Column<BiometricLog>[] = [
    {
      key: 'employeeCode',
      header: 'Badge / ID',
      sortable: true,
      render: (entry) => (
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center font-semibold text-xs text-[var(--text-secondary)]">
            {initials(entry.employeeCode)}
          </div>
          <span className="font-mono text-xs font-semibold text-[var(--text)]">
            {entry.employeeCode}
          </span>
        </div>
      ),
    },
    {
      key: 'deviceCode',
      header: 'Hardware Terminal',
      sortable: true,
      render: (entry) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--text-muted)]">
          <Icon name="fingerprint" size={13} className="text-[var(--text-faint)]" />
          <span>{entry.deviceCode}</span>
        </div>
      ),
    },
    {
      key: 'direction',
      header: 'Swipe Direction',
      render: (entry) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
            entry.direction === 'IN'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800'
          }`}
        >
          <span className={`size-1.5 rounded-full ${entry.direction === 'IN' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {entry.direction === 'IN' ? 'CHECK IN' : 'CHECK OUT'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Authentication',
      render: (entry) => (
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-alt)] border border-[var(--border)] text-emerald-600 dark:text-emerald-400">
          {entry.status}
        </span>
      ),
    },
    {
      key: 'punchDate',
      header: 'Event Date',
      render: (entry) => (
        <span className="text-xs text-[var(--text-secondary)] tabular-nums">
          {formatDate(entry.punchTime)}
        </span>
      ),
    },
    {
      key: 'punchTime',
      header: 'Exact Time',
      sortable: true,
      render: (entry) => (
        <span className="text-xs text-[var(--text)] font-medium tabular-nums">
          {formatTime(entry.punchTime)}
        </span>
      ),
    },
    {
      key: 'rawPayload',
      header: 'Telemetry Packet',
      render: (entry) => (
        <code className="text-[10px] font-mono text-[var(--text-faint)] max-w-xs truncate block">
          {entry.rawPayload ?? 'AUTHENTICATED_SECURE_TOKEN'}
        </code>
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
            <span className="text-xs text-[var(--text-muted)]">Hardware Terminal Logs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
            Biometric Access Logs
          </h1>
        </div>
      </div>

      <section aria-label="Biometric logs">
        {logs.isLoading ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <LoadingState label="Reading biometric checkpoint stream..." />
          </div>
        ) : logs.isError ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <ErrorState message="Failed to load biometric telemetry logs" onRetry={() => void logs.refetch()} />
          </div>
        ) : logs.data && logs.data.content.length > 0 ? (
          <div className="space-y-4">
            <EnterpriseTable
              data={logs.data.content}
              columns={columns}
              keyExtractor={(entry) => entry.id}
              searchPlaceholder="Filter biometric packets by badge code or hardware..."
              searchField={(e) => `${e.employeeCode} ${e.deviceCode} ${e.status}`}
              filterOptions={[
                { label: 'Check-In', value: 'IN', filterFn: (e) => e.direction === 'IN' },
                { label: 'Check-Out', value: 'OUT', filterFn: (e) => e.direction === 'OUT' },
              ]}
            />
            <Pagination
              currentPage={page}
              totalPages={logs.data.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <EmptyState title="No biometric swipes recorded" description="Swipe packets from IoT access gates will stream here." icon="fingerprint" />
          </div>
        )}
      </section>
    </div>
  );
}
