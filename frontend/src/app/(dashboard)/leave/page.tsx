'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { leaveApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { formatDate, initials } from '@/lib/format';

function leaveStatusClass(status: string): string {
  if (status === 'APPROVED') return 'status-active';
  if (status === 'REJECTED') return 'status-inactive';
  return 'status-warning';
}

export default function LeavePage() {
  const { roles } = useAuth();
  // GET /api/leaves returns every request for leave:read (ADMIN/HR) and only
  // the caller's own otherwise — employee-code links to the directory only
  // work for roles that can open it.
  const canReadDirectory = roles.includes('ADMIN') || roles.includes('HR');
  const leave = useQuery({ queryKey: ['leaves'], queryFn: leaveApi.list });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">LEAVE MANAGEMENT</p>
          <h1 className="dashboard-title">Leave Requests</h1>
        </div>
      </header>

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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No leave requests"
              description="There are no leave requests to display."
              icon="calendar"
            />
          )}
        </article>
      </section>
    </div>
  );
}
