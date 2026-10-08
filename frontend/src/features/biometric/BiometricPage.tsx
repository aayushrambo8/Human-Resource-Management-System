import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { biometricApi } from '../../api/services'
import { getErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { formatDateTime } from '../../utils/format'

export function BiometricPage() {
  const [page, setPage] = useState(0)
  const query = useQuery({ queryKey: ['biometric-logs', page], queryFn: () => biometricApi.list(page, 20) })
  return (
    <>
      <PageHeader eyebrow="DEVICE ACTIVITY" title="Biometric logs" description="Raw device punches, retained for audit and attendance processing." />
      <div className="list-toolbar"><div className="table-context"><span className="status-dot" /> Device ingestion <span className="context-divider">·</span> {query.data?.totalElements ?? '—'} raw logs</div><span className="result-count">Newest first</span></div>
      <section className="panel table-panel">
        {query.isLoading ? <LoadingState label="Loading biometric logs" /> : query.isError ? <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} /> : query.data?.content.length ? <>
          <div className="table-scroll"><table className="data-table">
            <thead><tr><th>DEVICE</th><th>EMPLOYEE ID</th><th>PUNCH TIME</th><th>DIRECTION</th><th>PROCESSING STATUS</th><th>RAW PAYLOAD</th></tr></thead>
            <tbody>{query.data.content.map((log) => <tr key={log.id}>
              <td><span className="device-cell"><span className="device-icon">⌁</span>{log.deviceCode}</span></td><td className="strong-cell">{log.employeeCode}</td><td>{formatDateTime(log.punchTime)}</td><td><span className={`pill ${log.direction === 'IN' ? 'pill-success' : 'pill-muted'}`}>{log.direction}</span></td><td><span className={`status-badge ${log.status === 'ACCEPTED' ? 'status-active' : 'status-warning'}`}><i />{log.status.replace('_', ' ')}</span></td><td className="payload-cell">{log.rawPayload || '—'}</td>
            </tr>)}</tbody>
          </table></div>
          <div className="pagination"><span>Page {query.data.totalPages ? page + 1 : 0} of {query.data.totalPages}</span><div><button className="button button-light button-small" disabled={page <= 0} onClick={() => setPage(page - 1)}>Previous</button><button className="button button-light button-small" disabled={page + 1 >= query.data.totalPages} onClick={() => setPage(page + 1)}>Next</button></div></div>
        </> : <EmptyState title="No raw device logs" description="Punches received from connected biometric devices are preserved here." icon="fingerprint" />}
      </section>
    </>
  )
}
