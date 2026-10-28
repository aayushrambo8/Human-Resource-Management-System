'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { employeeApi } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { formatDate, initials } from '@/lib/format';

export default function EmployeesPage() {
  const employees = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">DIRECTORY</p>
          <h1 className="dashboard-title">Employees</h1>
        </div>
      </header>

      <section aria-label="Employees list">
        <article className="island island-table">
          {employees.isLoading ? (
            <LoadingState label="Loading employees" />
          ) : employees.isError ? (
            <ErrorState message="Failed to load employees" onRetry={() => void employees.refetch()} />
          ) : employees.data && employees.data.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {employees.data.map((employee, index) => (
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
                      <td className="muted">{employee.phone ?? '—'}</td>
                      <td>
                        <span className={`status-badge ${employee.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                          <i aria-hidden="true" />
                          {employee.status}
                        </span>
                      </td>
                      <td>{formatDate(employee.joiningDate)}</td>
                      <td>
                        <Link href={`/employees/${employee.id}`} className="icon-button" aria-label={`View ${employee.firstName}`}>
                          <Icon name="chevron" size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No employees yet" description="Add your first team member to get started." icon="users" />
          )}
        </article>
      </section>
    </div>
  );
}