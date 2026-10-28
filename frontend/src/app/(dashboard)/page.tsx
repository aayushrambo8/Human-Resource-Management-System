'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { attendanceApi, departmentApi, employeeApi, healthApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api-client';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatDate, formatTime, initials } from '@/lib/format';

const today = new Date();
const dateLabel = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(today);

export default function DashboardPage() {
  const employees = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list });
  const departments = useQuery({ queryKey: ['departments'], queryFn: departmentApi.list });
  const attendance = useQuery({ queryKey: ['attendance', 0, 100], queryFn: () => attendanceApi.list(0, 100) });
  const health = useQuery({ queryKey: ['health'], queryFn: healthApi.get, retry: false });

  const activeCount = employees.data?.filter((employee) => employee.status === 'ACTIVE').length ?? 0;
  const departmentCount = departments.data?.length ?? 0;

  const recentEmployees = employees.data?.slice(0, 4) ?? [];
  const recentAttendance = attendance.data?.content.slice(0, 5) ?? [];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">{dateLabel}</p>
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="dashboard-actions">
          <Link className="btn btn-secondary" href="/employees">
            <Icon name="users" size={16} /> Employee Directory
          </Link>
        </div>
      </header>

      {health.isError && (
        <div className="alert alert-error">
          <Icon name="alert" size={16} />
          <span>Backend connection unavailable — {getErrorMessage(health.error)}</span>
          <button onClick={() => void health.refetch()}>Retry</button>
        </div>
      )}

      <section className="island-grid" aria-label="Key metrics">
        <MetricCard label="Total Employees" value={employees.isLoading ? '—' : String(employees.data?.length ?? 0)} icon="users" tone="indigo" />
        <MetricCard label="Active Now" value={employees.isLoading ? '—' : String(activeCount)} icon="activity" tone="emerald" />
        <MetricCard label="Departments" value={departments.isLoading ? '—' : String(departmentCount)} icon="building" tone="amber" />
        <MetricCard label="Total Punches" value={attendance.isLoading ? '—' : String(attendance.data?.totalElements ?? 0)} icon="clock" tone="rose" />
      </section>

      <section className="island-grid island-grid-2" aria-label="Activity panels">
        <Island>
          <IslandHeader>
            <div>
              <span className="island-eyebrow">Recent Activity</span>
              <h2>Attendance</h2>
            </div>
            <Link className="island-link" href="/attendance">View all</Link>
          </IslandHeader>
          <IslandBody>
            {attendance.isLoading ? (
              <LoadingState label="Loading attendance" />
            ) : attendance.isError ? (
              <ErrorState message={getErrorMessage(attendance.error)} onRetry={() => void attendance.refetch()} />
            ) : recentAttendance.length ? (
              <ActivityList items={recentAttendance} />
            ) : (
              <EmptyState title="No attendance yet" description="Records appear when employees check in." icon="calendar" />
            )}
          </IslandBody>
        </Island>

        <Island>
          <IslandHeader>
            <div>
              <span className="island-eyebrow">Team Overview</span>
              <h2>People Pulse</h2>
            </div>
          </IslandHeader>
          <IslandBody className="island-pulse">
            <div className="pulse-stat">
              <span className="pulse-number">{employees.isLoading ? '—' : String(activeCount)}</span>
              <span className="pulse-label">Active team members</span>
            </div>
            <p className="pulse-desc">
              Your team is the heart of this institution. Keep their details current and their work visible.
            </p>
            <Link className="island-link island-link-inline" href="/employees">
              Explore team <Icon name="arrow" size={14} />
            </Link>
          </IslandBody>
        </Island>
      </section>

      <section aria-label="Recent employees">
        <Island>
          <IslandHeader>
            <div>
              <span className="island-eyebrow">Directory</span>
              <h2>Recent Employees</h2>
            </div>
            <Link className="island-link" href="/employees">View all</Link>
          </IslandHeader>
          <IslandBody className="island-table">
            {employees.isLoading ? (
              <LoadingState label="Loading employees" />
            ) : employees.isError ? (
              <ErrorState message={getErrorMessage(employees.error)} onRetry={() => void employees.refetch()} />
            ) : recentEmployees.length ? (
              <EmployeeTable rows={recentEmployees} />
            ) : (
              <EmptyState title="No employees yet" description="Add team members to get started." icon="users" />
            )}
          </IslandBody>
        </Island>
      </section>

      <footer className="dashboard-footer">
        <span>Northstar Institute · People Operations</span>
        <span>Made for people, built for purpose</span>
      </footer>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: 'users' | 'activity' | 'building' | 'clock';
  tone: string;
}) {
  return (
    <Island className="island-metric">
      <IslandBody>
        <div className="metric-top">
          <span className="metric-label">{label}</span>
          <span className={`metric-icon metric-icon-${tone}`}><Icon name={icon} size={20} /></span>
        </div>
        <div className="metric-value">{value}</div>
      </IslandBody>
    </Island>
  );
}

function ActivityList({ items }: { items: Array<{ id: string; employeeName: string; employeeCode: string; deviceCode: string; direction: string; punchTime: string }> }) {
  return (
    <ul className="activity-list" role="list">
      {items.map((entry, index) => (
        <li key={entry.id} className="activity-item">
          <span className={`avatar avatar-${index % 5}`} aria-hidden="true">{initials(entry.employeeName)}</span>
          <div className="activity-info">
            <strong>{entry.employeeName}</strong>
            <span>{entry.employeeCode} · {entry.deviceCode}</span>
          </div>
          <span className={`badge ${entry.direction === 'IN' ? 'badge-success' : 'badge-muted'}`}>
            {entry.direction === 'IN' ? 'In' : 'Out'}
          </span>
          <time>{formatTime(entry.punchTime)}</time>
        </li>
      ))}
    </ul>
  );
}

function EmployeeTable({ rows }: { rows: Array<{ id: string; firstName: string; lastName: string; employeeCode: string; departmentName: string | null; email: string | null; status: string; joiningDate: string | null }> }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Email</th>
            <th>Status</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((employee, index) => (
            <tr key={employee.id}>
              <td>
                <Link href={`/employees/${employee.id}`} className="person-link">
                  <span className={`avatar avatar-${index % 5}`} aria-hidden="true">{initials(`${employee.firstName} ${employee.lastName}`)}</span>
                  <div>
                    <strong>{employee.firstName} {employee.lastName}</strong>
                    <small>{employee.employeeCode}</small>
                  </div>
                </Link>
              </td>
              <td>{employee.departmentName ?? 'Unassigned'}</td>
              <td className="muted">{employee.email ?? '—'}</td>
              <td>
                <span className={`status-badge ${employee.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                  <i aria-hidden="true" />
                  {employee.status}
                </span>
              </td>
              <td>{formatDate(employee.joiningDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Island({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <article className={`island ${className}`}>{children}</article>;
}

function IslandHeader({ children }: { children: React.ReactNode }) {
  return <header className="island-header">{children}</header>;
}

function IslandBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`island-body ${className}`}>{children}</div>;
}