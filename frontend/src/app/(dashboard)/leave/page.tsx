'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { leaveApi } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { formatDate, initials } from '@/lib/format';

export default function LeavePage() {
  const leave = useQuery({ queryKey: ['leaves'], queryFn: leaveApi.list });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">LEAVE MANAGEMENT</p>
          <h1 className="dashboard-title">Leave Requests</h1>
        </div>
        <div className="dashboard-actions">
          <Link className="btn btn-primary" href="/leave/new">
            <Icon name="plus" size={16} /> Submit Request
          </Link>
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
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {leave.data.map((request, index) => (
                    <tr key={request.id}>
                      <td>
                        <Link href={`/employees/${request.employeeId}`} className="person-link">
                          <span className={`avatar avatar-${index % 5}`} aria-hidden="true">{initials(request.employeeCode)}</span>
                          <div>
                            <strong>{request.employeeCode}</strong>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <div>
                          <strong>{formatDate(request.startDate)} – {formatDate(request.endDate)}</strong>
                        </div>
                      </td>
                      <td className="muted" style={{ maxWidth: 300 }}>{request.reason}</td>
                      <td>
                        <span className={`status-badge ${request.status === 'APPROVED' ? 'status-active' : request.status === 'REJECTED' ? 'status-inactive' : 'status-warning'}`}>
                          <i aria-hidden="true" />
                          {request.status}
                        </span>
                      </td>
                      <td>{request.reviewedAt ? formatDate(request.reviewedAt) : '—'}</td>
                      <td>
                        <Link href={`/leave/${request.id}`} className="icon-button" aria-label={`View request ${request.id}`}>
                          <Icon name="chevron" size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No leave requests" description="Submit your first leave request to get started." icon="calendar" />
          )}
        </article>
      </section>
    </div>
  );
}