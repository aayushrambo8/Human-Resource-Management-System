'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { leaveApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { gates } from '@/lib/permissions';
import type { LeaveRequest, LeaveSubmission } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { LeaveForm } from '@/components/forms/LeaveForm';
import { formatDate, initials } from '@/lib/format';
import { EnterpriseTable, type Column } from '@/components/ui/EnterpriseTable';

export default function LeavePage() {
  const { roles } = useAuth();
  const queryClient = useQueryClient();
  const canReadDirectory = gates.canReadDirectory(roles);
  const canSubmit = gates.canSubmitLeaves(roles);
  const canReview = gates.canReviewLeaves(roles);

  const [submitOpen, setSubmitOpen] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const leave = useQuery({ queryKey: ['leaves'], queryFn: leaveApi.list });

  const handleSubmit = async (submission: LeaveSubmission) => {
    await leaveApi.submit(submission);
    await queryClient.invalidateQueries({ queryKey: ['leaves'] });
    setSubmitOpen(false);
  };

  const decide = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewError('');
    setBusyId(id);
    try {
      const updated = await leaveApi.decide(id, { status });
      queryClient.setQueryData<LeaveRequest[]>(['leaves'], (old) => {
        if (!old) return [updated];
        return old.map((l) => (l.id === id ? { ...l, status, reviewedAt: updated.reviewedAt || new Date().toISOString() } : l));
      });
      await queryClient.invalidateQueries({ queryKey: ['leaves'] });
    } catch (error) {
      setReviewError(getErrorMessage(error, 'Could not record the decision.'));
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'employeeCode',
      header: 'Requester',
      sortable: true,
      render: (item) => (
        canReadDirectory ? (
          <Link href={`/employees/${item.employeeId}`} className="flex items-center gap-2.5 group">
            <div className="size-7 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center font-semibold text-xs text-[var(--text-secondary)]">
              {initials(item.employeeCode)}
            </div>
            <div>
              <div className="font-semibold text-xs text-[var(--text)] group-hover:text-[var(--accent-solid)] transition-colors">
                {item.employeeCode}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">{item.employeeCode}</div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center font-semibold text-xs text-[var(--text-secondary)]">
              {initials(item.employeeCode)}
            </div>
            <div>
              <div className="font-semibold text-xs text-[var(--text)]">
                {item.employeeCode}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-mono">{item.employeeCode}</div>
            </div>
          </div>
        )
      ),
    },
    {
      key: 'period',
      header: 'Dates',
      render: (item) => (
        <span className="text-xs text-[var(--text)] tabular-nums">
          {formatDate(item.startDate)} → {formatDate(item.endDate)}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item) => (
        <span className="text-xs text-[var(--text-muted)] max-w-xs truncate block" title={item.reason}>
          {item.reason}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
            item.status === 'APPROVED'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : item.status === 'REJECTED'
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              item.status === 'APPROVED'
                ? 'bg-emerald-500'
                : item.status === 'REJECTED'
                ? 'bg-red-500'
                : 'bg-amber-500'
            }`}
          />
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => {
        if (!canReview) return null;
        if (item.status !== 'PENDING') {
          return (
            <span aria-label="Already reviewed" className="text-xs text-[var(--text-faint)]">
              —
            </span>
          );
        }
        const isBusy = busyId === item.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50"
              disabled={isBusy}
              onClick={() => void decide(item.id, 'APPROVED')}
            >
              Approve
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-red-600 transition-colors disabled:opacity-50"
              disabled={isBusy}
              onClick={() => void decide(item.id, 'REJECTED')}
            >
              Reject
            </button>
          </div>
        );
      },
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
            <span className="text-xs text-[var(--text-muted)]">Time Off Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
            Leave Requests
          </h1>
          {!canReview && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              You are viewing your own leave requests.
            </p>
          )}
        </div>

        {canSubmit && (
          <div className="flex items-center gap-2.5">
            <button type="button" className="btn btn-primary text-xs" onClick={() => setSubmitOpen(true)}>
              <Icon name="plus" size={14} />
              <span>New request</span>
            </button>
          </div>
        )}
      </div>

      {reviewError && (
        <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2" role="alert">
          <Icon name="alert" size={16} />
          <span>{reviewError}</span>
        </div>
      )}

      <section aria-label="Leave requests">
        {leave.isLoading ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <LoadingState label="Loading leave requests..." />
          </div>
        ) : leave.isError ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <ErrorState message="Failed to load leave records" onRetry={() => void leave.refetch()} />
          </div>
        ) : leave.data && leave.data.length > 0 ? (
          <EnterpriseTable
            data={leave.data}
            columns={columns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="Filter leave requests by name, code, reason..."
            searchField={(i) => `${i.employeeCode} ${i.reason}`}
            filterOptions={[
              { label: 'Pending', value: 'PENDING', filterFn: (i) => i.status === 'PENDING' },
              { label: 'Approved', value: 'APPROVED', filterFn: (i) => i.status === 'APPROVED' },
              { label: 'Rejected', value: 'REJECTED', filterFn: (i) => i.status === 'REJECTED' },
            ]}
          />
        ) : (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <EmptyState
              title="No leave requests filed"
              description="Institutional leave requests and holiday balances will appear here."
              icon="calendar"
            />
          </div>
        )}
      </section>

      {submitOpen && (
        <Modal title="New leave request" open={submitOpen} onClose={() => setSubmitOpen(false)}>
          <LeaveForm submitLabel="Submit request" onSubmit={handleSubmit} onCancel={() => setSubmitOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
