'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { attendanceApi, departmentApi, employeeApi, healthApi, leaveApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { BarList } from '@/components/ui/BarList';
import { Icon } from '@/components/ui/Icon';
import { Island, IslandBody, IslandHeader } from '@/components/ui/Island';
import { KpiCard } from '@/components/ui/KpiCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { formatDate, formatTime, initials } from '@/lib/format';
import type { AttendanceRecord, Employee, LeaveRequest } from '@/lib/types';

const NEW_HIRE_WINDOW_DAYS = 30;

const today = new Date();
const dateLabel = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(today);

/**
 * Whole days elapsed since a backend date-only value ("yyyy-MM-dd"), computed
 * from local calendar dates so the result never shifts with the viewer's
 * timezone. Returns null for malformed or future dates.
 */
function daysSinceDateOnly(dateOnly: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const then = new Date(year, month - 1, day);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((startOfToday.getTime() - then.getTime()) / 86_400_000);
  return diffDays >= 0 ? diffDays : null;
}

function leaveStatusClass(status: string): string {
  if (status === 'APPROVED') return 'status-active';
  if (status === 'REJECTED') return 'status-inactive';
  return 'status-warning';
}

export default function DashboardPage() {
  const { roles } = useAuth();
  // Mirrors backend permissions (ADMIN/HR can read the directory modules); the
  // API independently enforces access — queries stay disabled for other roles
  // to avoid requests that would only ever return 403.
  const canReadDirectory = roles.includes('ADMIN') || roles.includes('HR');

  const employees = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.list,
    enabled: canReadDirectory,
  });
  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: departmentApi.list,
    enabled: canReadDirectory,
  });
  const attendance = useQuery({
    queryKey: ['attendance', 0, 20],
    queryFn: () => attendanceApi.list(0, 20),
    enabled: canReadDirectory,
  });
  // GET /api/leaves is readable by every role (own records only, unless leave:read).
  const leaves = useQuery({ queryKey: ['leaves'], queryFn: leaveApi.list });
  const health = useQuery({ queryKey: ['health'], queryFn: healthApi.get, retry: false });

  const pendingLeaves = leaves.data?.filter((request) => request.status === 'PENDING').length ?? 0;
  const newHires =
    employees.data?.filter((employee) => {
      if (!employee.joiningDate) return false;
      const days = daysSinceDateOnly(employee.joiningDate);
      return days !== null && days <= NEW_HIRE_WINDOW_DAYS;
    }).length ?? 0;
  const activeEmployees = employees.data?.filter((employee) => employee.status === 'ACTIVE').length ?? 0;

  const headcountByDepartment = (employees.data ?? [])
    .reduce<Array<{ label: string; value: number }>>((acc, employee) => {
      const label = employee.departmentName ?? 'Unassigned';
      const bucket = acc.find((item) => item.label === label);
      if (bucket) bucket.value += 1;
      else acc.push({ label, value: 1 });
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  const recentEmployees = employees.data?.slice(0, 5) ?? [];
  const recentAttendance = attendance.data?.content.slice(0, 6) ?? [];
  const myLeaves = leaves.data?.slice(0, 6) ?? [];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">{dateLabel}</p>
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="dashboard-actions">
          {canReadDirectory && (
            <Link className="btn btn-secondary" href="/employees">
              <Icon name="users" size={16} /> Employee Directory
            </Link>
          )}
          <Link className="btn btn-secondary" href="/leave">
            <Icon name="calendar" size={16} /> Leave Requests
          </Link>
        </div>
      </header>

      {health.isError && (
        <div className="alert alert-error" role="alert">
          <Icon name="alert" size={16} />
          <span>Backend connection unavailable — {getErrorMessage(health.error)}</span>
          <button onClick={() => void health.refetch()}>Retry</button>
        </div>
      )}

      {canReadDirectory ? (
        <section className="island-grid" aria-label="Key metrics">
          <KpiCard
            label="Total Employees"
            value={employees.isLoading ? '—' : String(employees.data?.length ?? 0)}
            icon="users"
            tone="blue"
          />
          <KpiCard
            label="Pending Leave Requests"
            value={leaves.isLoading ? '—' : String(pendingLeaves)}
            icon="calendar"
            tone="amber"
            hint="Awaiting review"
          />
          <KpiCard
            label={`New Hires (${NEW_HIRE_WINDOW_DAYS}d)`}
            value={employees.isLoading ? '—' : String(newHires)}
            icon="arrow"
            tone="green"
            hint="Joined in the last 30 days"
          />
          <KpiCard
            label="Departments"
            value={departments.isLoading ? '—' : String(departments.data?.length ?? 0)}
            icon="building"
            tone="rose"
          />
        </section>
      ) : (
        <section className="island-grid" aria-label="Key metrics">
          <KpiCard
            label="My Leave Requests"
            value={leaves.isLoading ? '—' : String(leaves.data?.length ?? 0)}
            icon="calendar"
            tone="blue"
            hint="Requests you have submitted"
          />
          <KpiCard
            label="My Pending Requests"
            value={leaves.isLoading ? '—' : String(pendingLeaves)}
            icon="clock"
            tone="amber"
            hint="Awaiting review"
          />
        </section>
      )}

      <section className="island-grid island-grid-2" aria-label="Analytics panels">
        {canReadDirectory ? (
          <Island>
            <IslandHeader>
              <div>
                <span className="island-eyebrow">Analytics</span>
                <h2>Headcount by Department</h2>
              </div>
              <Link className="island-link" href="/departments">
                View departments <Icon name="arrow" size={14} />
              </Link>
            </IslandHeader>
            <IslandBody>
              {departments.isLoading ? (
                <LoadingState label="Loading departments" />
              ) : departments.isError ? (
                <ErrorState
                  message={getErrorMessage(departments.error)}
                  onRetry={() => void departments.refetch()}
                />
              ) : (
                <BarList items={headcountByDepartment} emptyLabel="No headcount data yet." />
              )}
            </IslandBody>
          </Island>
        ) : (
          <Island>
            <IslandHeader>
              <div>
                <span className="island-eyebrow">My Requests</span>
                <h2>Recent Leave Requests</h2>
              </div>
              <Link className="island-link" href="/leave">
                View all <Icon name="arrow" size={14} />
              </Link>
            </IslandHeader>
            <IslandBody>
              {leaves.isLoading ? (
                <LoadingState label="Loading leave requests" />
              ) : leaves.isError ? (
                <ErrorState
                  message={getErrorMessage(leaves.error)}
                  onRetry={() => void leaves.refetch()}
                />
              ) : myLeaves.length ? (
                <LeaveTable rows={myLeaves} />
              ) : (
                <EmptyState
                  title="No leave requests"
                  description="There are no leave requests to display."
                  icon="calendar"
                />
              )}
            </IslandBody>
          </Island>
        )}

        <Island>
          <IslandHeader>
            <div>
              <span className="island-eyebrow">{canReadDirectory ? 'Team Overview' : 'My Account'}</span>
              <h2>People Pulse</h2>
            </div>
          </IslandHeader>
          <IslandBody className="island-pulse">
            {canReadDirectory ? (
              <>
                <div className="pulse-stat">
                  <span className="pulse-number">{employees.isLoading ? '—' : String(activeEmployees)}</span>
                  <span className="pulse-label">Active team members</span>
                </div>
                <p className="pulse-desc">
                  Your team is the heart of this institution. Keep their details current and their work visible.
                </p>
                <Link className="island-link island-link-inline" href="/employees">
                  Explore team <Icon name="arrow" size={14} />
                </Link>
              </>
            ) : (
              <>
                <div className="pulse-stat">
                  <span className="pulse-number">{leaves.isLoading ? '—' : String(pendingLeaves)}</span>
                  <span className="pulse-label">Pending leave requests</span>
                </div>
                <p className="pulse-desc">
                  This view shows your own records. Directory and attendance data are managed by HR.
                </p>
                <Link className="island-link island-link-inline" href="/leave">
                  View my requests <Icon name="arrow" size={14} />
                </Link>
              </>
            )}
          </IslandBody>
        </Island>
      </section>

      {canReadDirectory && (
        <section aria-label="Recent attendance">
          <Island>
            <IslandHeader>
              <div>
                <span className="island-eyebrow">Recent Activity</span>
                <h2>Attendance</h2>
              </div>
              <Link className="island-link" href="/attendance">
                View all <Icon name="arrow" size={14} />
              </Link>
            </IslandHeader>
            <IslandBody>
              {attendance.isLoading ? (
                <LoadingState label="Loading attendance" />
              ) : attendance.isError ? (
                <ErrorState
                  message={getErrorMessage(attendance.error)}
                  onRetry={() => void attendance.refetch()}
                />
              ) : recentAttendance.length ? (
                <ActivityList items={recentAttendance} />
              ) : (
                <EmptyState
                  title="No attendance yet"
                  description="Records appear when employees check in."
                  icon="clock"
                />
              )}
            </IslandBody>
          </Island>
        </section>
      )}

      {canReadDirectory && (
        <section aria-label="Employee overview">
          <Island>
            <IslandHeader>
              <div>
                <span className="island-eyebrow">Directory</span>
                <h2>Employee Overview</h2>
              </div>
              <Link className="island-link" href="/employees">
                View all <Icon name="arrow" size={14} />
              </Link>
            </IslandHeader>
            <IslandBody className="island-table">
              {employees.isLoading ? (
                <LoadingState label="Loading employees" />
              ) : employees.isError ? (
                <ErrorState
                  message={getErrorMessage(employees.error)}
                  onRetry={() => void employees.refetch()}
                />
              ) : recentEmployees.length ? (
                <EmployeeTable rows={recentEmployees} />
              ) : (
                <EmptyState title="No employees yet" description="Employee records will appear here." icon="users" />
              )}
            </IslandBody>
          </Island>
        </section>
      )}

      <footer className="dashboard-footer">
        <span>Northstar Institute · People Operations</span>
        <span>Made for people, built for purpose</span>
      </footer>
    </div>
  );
}

function ActivityList({ items }: { items: AttendanceRecord[] }) {
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

function EmployeeTable({ rows }: { rows: Employee[] }) {
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

function LeaveTable({ rows }: { rows: LeaveRequest[] }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Reviewed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((request) => (
            <tr key={request.id}>
              <td>{formatDate(request.startDate)} – {formatDate(request.endDate)}</td>
              <td className="muted">{request.reason}</td>
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
  );
}
