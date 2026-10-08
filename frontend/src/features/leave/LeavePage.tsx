import { useQuery } from '@tanstack/react-query'
import { leaveApi } from '../../api/services'
import { getErrorMessage } from '../../api/client'
import { Icon } from '../../components/Icon'
import { PageHeader } from '../../components/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { formatDate } from '../../utils/format'

export function LeavePage() {
  const query = useQuery({ queryKey: ['leaves'], queryFn: leaveApi.list })
  return (
    <>
      <PageHeader eyebrow="PEOPLE & WELLBEING" title="Leave management" description="Keep time away visible, organized and easy to plan around." />
      <div className="leave-summary"><div className="leave-summary-icon"><Icon name="calendar" size={19} /></div><div><strong>Leave overview</strong><span>Requests and approvals from your team.</span></div><span className="coming-chip">CONNECTED</span></div>
      <section className="panel table-panel">
        {query.isLoading ? <LoadingState label="Loading leave requests" /> : query.isError ? <ErrorState message={getErrorMessage(query.error)} onRetry={() => void query.refetch()} /> : query.data?.length ? (
          <div className="table-scroll"><table className="data-table"><thead><tr><th>EMPLOYEE</th><th>DATES</th><th>REASON</th><th>STATUS</th><th>SUBMITTED</th></tr></thead><tbody>{query.data.map((request) => <tr key={request.id}><td className="strong-cell">{request.employeeCode}</td><td>{formatDate(request.startDate)} – {formatDate(request.endDate)}</td><td>{request.reason}</td><td><span className={`status-badge ${request.status === 'APPROVED' ? 'status-active' : request.status === 'PENDING' ? 'status-warning' : 'status-inactive'}`}><i />{request.status}</span></td><td>{formatDate(request.reviewedAt)}</td></tr>)}</tbody></table></div>
        ) : <EmptyState title="No leave requests yet" description="When requests are submitted, you’ll see their dates and status here." icon="calendar" />}
      </section>
      <p className="page-footnote">Leave requests are visible according to your account permissions.</p>
    </>
  )
}
