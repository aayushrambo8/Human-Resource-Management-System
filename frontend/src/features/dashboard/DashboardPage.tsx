import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { attendanceApi, departmentApi, employeeApi, healthApi } from '../../api/services'
import { getErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/PageHeader'
import { Icon } from '../../components/Icon'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { formatDate, formatTime, initials } from '../../utils/format'

const today = new Date()
const dateLabel = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(today).toUpperCase()

export function DashboardPage() {
  const employees = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list })
  const departments = useQuery({ queryKey: ['departments'], queryFn: departmentApi.list })
  const attendance = useQuery({ queryKey: ['attendance', 0, 100], queryFn: () => attendanceApi.list(0, 100) })
  const health = useQuery({ queryKey: ['health'], queryFn: healthApi.get, retry: false })

  const activeCount = employees.data?.filter((employee) => employee.status === 'ACTIVE').length ?? 0
  const departmentCount = departments.data?.length ?? 0
  return (
    <>
      <PageHeader
        eyebrow={dateLabel}
        title="Good morning"
        description="Here’s what’s happening across your people operations today."
        action={<Link className="button button-dark" to="/employees">Employee directory <Icon name="arrow" size={16} /></Link>}
      />

      {health.isError && (
        <div className="connection-banner">
          <span className="connection-led" />
          <span>Backend connection unavailable</span>
          <span className="connection-detail">{getErrorMessage(health.error)}</span>
          <button onClick={() => void health.refetch()}>Retry</button>
        </div>
      )}

      <section className="stats-grid" aria-label="People overview">
        <StatCard label="Total employees" value={employees.isLoading ? '—' : employees.isError ? '!' : String(employees.data?.length ?? 0)} note="Across your institution" icon="users" tone="lavender" />
        <StatCard label="Active employees" value={employees.isLoading ? '—' : employees.isError ? '!' : String(activeCount)} note="Currently employed" icon="briefcase" tone="mint" />
        <StatCard label="Departments" value={departments.isLoading ? '—' : departments.isError ? '!' : String(departmentCount)} note="Teams in your workspace" icon="building" tone="blue" />
        <StatCard label="Attendance punches" value={attendance.isLoading ? '—' : attendance.isError ? '—' : String(attendance.data?.totalElements ?? 0)} note="All recorded device events" icon="clock" tone="peach" />
      </section>

      <section className="dashboard-grid">
        <div className="panel attendance-panel">
          <div className="panel-heading">
            <div><span className="panel-eyebrow">LIVE ACTIVITY</span><h2>Recent attendance</h2></div>
            <Link className="subtle-link" to="/attendance">View all <Icon name="chevron" size={15} /></Link>
          </div>
          {attendance.isLoading ? <LoadingState label="Loading attendance" /> : attendance.isError ? (
            <ErrorState message={getErrorMessage(attendance.error)} onRetry={() => void attendance.refetch()} />
          ) : attendance.data?.content.length ? (
            <div className="activity-list">
              {attendance.data.content.slice(0, 5).map((entry, index) => (
                <div className="activity-row" key={entry.id}>
                  <div className={`avatar avatar-${index % 5}`}>{initials(entry.employeeName)}</div>
                  <div className="activity-person"><strong>{entry.employeeName}</strong><span>{entry.employeeCode} · {entry.deviceCode}</span></div>
                  <span className={`pill ${entry.direction === 'IN' ? 'pill-success' : 'pill-muted'}`}>{entry.direction === 'IN' ? 'Clocked in' : 'Clocked out'}</span>
                  <time>{formatTime(entry.punchTime)}</time>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No attendance yet" description="Records will appear here when employees start checking in." icon="calendar" />
          )}
          <div className="panel-footer"><Icon name="clock" size={15} /> Data updates as biometric punches arrive.</div>
        </div>

        <div className="panel spotlight-panel">
          <div className="spotlight-orbit orbit-one" /><div className="spotlight-orbit orbit-two" />
          <span className="spotlight-tag"><Icon name="spark" size={14} /> PEOPLE PULSE</span>
          <div className="spotlight-content">
            <div className="spotlight-number">{employees.isLoading ? '—' : `${activeCount}`}</div>
            <div className="spotlight-caption">people making a difference</div>
            <p>Your team is the heart of this institution. Keep their details current and their work visible.</p>
            <Link to="/employees" className="spotlight-link">Explore your team <Icon name="arrow" size={16} /></Link>
          </div>
          <div className="spotlight-bottom"><span>TEAM OVERVIEW</span><span>01 <i /> 04</span></div>
        </div>
      </section>

      <section className="panel directory-panel">
        <div className="panel-heading">
          <div><span className="panel-eyebrow">YOUR PEOPLE</span><h2>Recently added employees</h2></div>
          <Link className="subtle-link" to="/employees">View directory <Icon name="chevron" size={15} /></Link>
        </div>
        {employees.isLoading ? <LoadingState label="Loading employees" /> : employees.isError ? (
          <ErrorState message={getErrorMessage(employees.error)} onRetry={() => void employees.refetch()} />
        ) : employees.data?.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>WORK EMAIL</th><th>STATUS</th><th>JOINED</th><th /></tr></thead>
              <tbody>
                {employees.data.slice(0, 5).map((employee, index) => (
                  <tr key={employee.id}>
                    <td><Link className="person-cell" to={`/employees/${employee.id}`}><span className={`avatar avatar-${index % 5}`}>{initials(`${employee.firstName} ${employee.lastName}`)}</span><span><strong>{employee.firstName} {employee.lastName}</strong><small>{employee.employeeCode}</small></span></Link></td>
                    <td>{employee.departmentName ?? 'Unassigned'}</td>
                    <td className="muted-cell">{employee.email ?? '—'}</td>
                    <td><span className={`status-badge ${employee.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}><i />{employee.status}</span></td>
                    <td>{formatDate(employee.joiningDate)}</td>
                    <td><Link className="row-arrow" to={`/employees/${employee.id}`} aria-label={`View ${employee.firstName}`}><Icon name="chevron" size={16} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Your directory is ready" description="Employee profiles will show up here after they’re added to the system." icon="users" />
        )}
      </section>
      <div className="dashboard-footer"><span>Northstar Institute · People operations</span><span>Made for people, built for purpose <b>✳</b></span></div>
    </>
  )
}

function StatCard({
  label,
  value,
  note,
  icon,
  tone,
}: {
  label: string
  value: string
  note: string
  icon: 'users' | 'briefcase' | 'building' | 'clock'
  tone: string
}) {
  return (
    <article className="stat-card">
      <div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon name={icon} size={18} /></span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-note"><span className="stat-note-dot" />{note}</div>
    </article>
  )
}
