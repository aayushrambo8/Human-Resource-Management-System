import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { attendanceApi } from '../../api/services'
import { getErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { formatDateTime, initials } from '../../utils/format'

export function AttendancePage() {
  const [page, setPage] = useState(0)
  const query = useQuery({ queryKey: ['attendance', page], queryFn: () => attendanceApi.list(page, 20) })
  return (
    <>
      <PageHeader eyebrow="TIME & ATTENDANCE" title="Attendance records" description="A clear record of employee check-ins from across your institution." />
      <div className="list-toolbar"><div className="table-context"><span className="status-dot" /> Live records <span className="context-divider">·</span> {query.data?.totalElements ?? '—'} total punches</div><span className="result-count">Sorted by latest</span></div>
      <section className="panel table-panel">
        {query.isLoading ? <LoadingState label="Loading attendance records" /> : query.isError ? <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} /> : query.data?.content.length ? <>
          <div className="table-scroll"><table className="data-table">
            <thead><tr><th>EMPLOYEE</th><th>DATE & TIME</th><th>DIRECTION</th><th>DEVICE</th><th>RECORD</th></tr></thead>
            <tbody>{query.data.content.map((record, index) => <tr key={record.id}>
              <td><div className="person-cell"><span className={`avatar avatar-${index % 5}`}>{initials(record.employeeName)}</span><span><strong>{record.employeeName}</strong><small>{record.employeeCode}</small></span></div></td>
              <td>{formatDateTime(record.punchTime)}</td><td><span className={`pill ${record.direction === 'IN' ? 'pill-success' : 'pill-muted'}`}>{record.direction === 'IN' ? 'Clock in' : record.direction === 'OUT' ? 'Clock out' : 'Unknown'}</span></td><td>{record.deviceCode}</td><td className="muted-cell">{record.id.slice(0, 8).toUpperCase()}</td>
            </tr>)}</tbody>
          </table></div>
          <Pagination page={page} totalPages={query.data.totalPages} onChange={setPage} />
        </> : <EmptyState title="No attendance records yet" description="Employee clock-ins will appear here as biometric punches are received." icon="calendar" />}
      </section>
    </>
  )
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  return <div className="pagination"><span>Page {totalPages ? page + 1 : 0} of {totalPages}</span><div><button className="button button-light button-small" disabled={page <= 0} onClick={() => onChange(page - 1)}>Previous</button><button className="button button-light button-small" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Next</button></div></div>
}
