'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { leaveApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { gates } from '@/lib/permissions';
import type { LeaveSubmission } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { Modal } from '@/components/ui/Modal';
import { LeaveForm } from '@/components/forms/LeaveForm';
import { formatDate, initials } from '@/lib/format';

function leaveStatusClass(status: string): string {
  if (status === 'APPROVED') return 'status-active';
  if (status === 'REJECTED') return 'status-inactive';
  return 'status-warning';
}

export default function LeavePage() {
  const { roles } = useAuth();
  const queryClient = useQueryClient();
  // GET /api/leaves returns every request for leave:read (ADMIN/HR) and only
  // the caller's own otherwise — employee-code links to the directory only
  // work for roles that can open it.
  const canReadDirectory = gates.canReadDirectory(roles);
  // leave:write (submit) is held by all three roles; leave:review (decide) only
  // by ADMIN/HR — the backend rejects a decision from EMPLOYEE with 403.
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
      await leaveApi.decide(id, { status });
      await queryClient.invalidateQueries({ queryKey: ['leaves'] });
    } catch (error) {
      // The backend rejects a decision on an already-reviewed request
      // (400/409) and any attempt to reset a decision — surface its message
      // rather than silently dropping the click.
      setReviewError(getErrorMessage(error, 'Could not record the decision.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">LEAVE MANAGEMENT</p>
          <h1 className="dashboard-title">Leave Requests</h1>
        </div>
        {canSubmit && (
          <div className="dashboard-actions">
            <button type="button" className="btn btn-primary" onClick={() => setSubmitOpen(true)}>
              <Icon name="plus" size={14} /> New request
            </button>
          </div>
        )}
      </header>

      {/* EMPLOYEE sees only their own requests (the backend scopes the list);
          reviewers see everyone's. */}
      {!canReadDirectory && (
        <p className="muted" style={{ fontSize: 13 }}>
          You are viewing your own leave requests. Only HR and administrators see the full list.
        </p>
      )}

      {reviewError && (
        <div className="alert alert-error" role="alert">
          <Icon name="alert" size={16} />
          <span>{reviewError}</span>
        </div>
      )}

      <section aria-label="Leave requests">
        <article className="island island-table">
          {leave.isLoading ? (
            <LoadingState label="Loading leave requests" />
          ) : leave.isError ? (
            <ErrorState message="Failed to load leave requests" onRetry={() => void leave.refetch()} />
          ) : leave.data && leave.data.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Reviewed</th>
                    {canReview && <th><span className="sr-only">Action</span></th>}
                  </tr>
                </thead>
                <tbody>
                  {leave.data.map((request, index) => (
                    <tr key={request.id}>
                      <td>
                        {canReadDirectory ? (
                          <Link href={`/employees/${request.employeeId}`} className="person-link">
                            <span className={`avatar avatar-${index % 5}`} aria-hidden="true">{initials(request.employeeCode)}</span>
                            <div>
                              <strong>{request.employeeCode}</strong>
                            </div>
                          </Link>
                        ) : (
                          <div className="person-link">
                            <span className={`avatar avatar-${index % 5}`} aria-hidden="true">{initials(request.employeeCode)}</span>
                            <div>
                              <strong>{request.employeeCode}</strong>
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong>{formatDate(request.startDate)} – {formatDate(request.endDate)}</strong>
                        </div>
                      </td>
                      <td className="muted" style={{ maxWidth: 300 }}>{request.reason}</td>
                      <td>
                        <span className={`status-badge ${leaveStatusClass(request.status)}`}>
                          <i aria-hidden="true" />
                          {request.status}
                        </span>
                      </td>
                      <td>{request.reviewedAt ? formatDate(request.reviewedAt) : '—'}</td>
                      {canReview && (
                        <td>
                          {request.status === 'PENDING' ? (
                            <div className="row-actions">
                              <button
                                type="button"
                                className="btn btn-secondary btn-compact"
                                onClick={() => void decide(request.id, 'APPROVED')}
                                disabled={busyId === request.id}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-compact"
                                onClick={() => void decide(request.id, 'REJECTED')}
                                disabled={busyId === request.id}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="muted" aria-label="Already reviewed">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No leave requests"
              description={canSubmit ? 'Submit your first request to get started.' : 'There are no leave requests to display.'}
              icon="calendar"
            />
          )}
        </article>
      </section>

      {canSubmit && (
        <Modal
          open={submitOpen}
          onClose={() => setSubmitOpen(false)}
          title="New leave request"
          description="The request is filed against your own account and routed to HR for review."
        >
          <LeaveForm
            submitLabel="Submit request"
            onSubmit={handleSubmit}
            onCancel={() => setSubmitOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
