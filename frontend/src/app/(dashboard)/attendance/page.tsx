'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { attendanceApi } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, formatTime, initials } from '@/lib/format';

export default function AttendancePage() {
  const [page, setPage] = useState(0);
  const size = 20;
  const attendance = useQuery({ queryKey: ['attendance', page, size], queryFn: () => attendanceApi.list(page, size) });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">TIME & ATTENDANCE</p>
          <h1 className="dashboard-title">Attendance Records</h1>
        </div>
      </header>

      <section aria-label="Attendance records">
        <article className="island table-panel">
          {attendance.isLoading ? (
            <LoadingState label="Loading attendance" />
          ) : attendance.isError ? (
            <ErrorState message="Failed to load attendance" onRetry={() => void attendance.refetch()} />
          ) : attendance.data && attendance.data.content.length > 0 ? (
            <>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Device</th>
                      <th>Direction</th>
                      <th>Date</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.data.content.map((entry, index) => (
                      <tr key={entry.id}>
                        <td>
                          <div className="person-link">
                            <span className={`avatar avatar-${index % 5}`} aria-hidden="true">{initials(entry.employeeName)}</span>
                            <div>
                              <strong>{entry.employeeName}</strong>
                              <small>{entry.employeeCode}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="device-cell">
                            <span className="device-icon"><Icon name="fingerprint" size={14} /></span>
                            {entry.deviceCode}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${entry.direction === 'IN' ? 'badge-success' : 'badge-muted'}`}>
                            {entry.direction === 'IN' ? 'In' : 'Out'}
                          </span>
                        </td>
                        <td>{formatDate(entry.punchTime)}</td>
                        <td>{formatTime(entry.punchTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={page} totalPages={attendance.data.totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState title="No attendance records" description="Records will appear here when employees check in." icon="calendar" />
          )}
        </article>
      </section>
    </div>
  );
}