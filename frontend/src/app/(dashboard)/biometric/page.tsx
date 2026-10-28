'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { biometricApi } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, formatTime, initials } from '@/lib/format';

export default function BiometricPage() {
  const [page, setPage] = useState(0);
  const size = 20;
  const logs = useQuery({ queryKey: ['biometric', page, size], queryFn: () => biometricApi.list(page, size) });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">TIME & ATTENDANCE</p>
          <h1 className="dashboard-title">Biometric Logs</h1>
        </div>
      </header>

      <section aria-label="Biometric logs">
        <article className="island table-panel">
          {logs.isLoading ? (
            <LoadingState label="Loading biometric logs" />
          ) : logs.isError ? (
            <ErrorState message="Failed to load biometric logs" onRetry={() => void logs.refetch()} />
          ) : logs.data && logs.data.content.length > 0 ? (
            <>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Device</th>
                      <th>Direction</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.data.content.map((entry, index) => (
                      <tr key={entry.id}>
                        <td>
                          <div className="person-link">
                            <span className={`avatar avatar-${index % 5}`} aria-hidden="true">{initials(entry.employeeCode)}</span>
                            <div>
                              <strong>{entry.employeeCode}</strong>
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
                        <td>
                          <span className={`status-badge ${entry.status === 'ACCEPTED' ? 'status-active' : 'status-warning'}`}>
                            <i aria-hidden="true" />
                            {entry.status}
                          </span>
                        </td>
                        <td>{formatDate(entry.punchTime)}</td>
                        <td>{formatTime(entry.punchTime)}</td>
                        <td className="payload-cell">{entry.rawPayload ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={page} totalPages={logs.data.totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState title="No biometric logs" description="Device logs will appear here when punches are recorded." icon="fingerprint" />
          )}
        </article>
      </section>
    </div>
  );
}