'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { employeeApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { gates } from '@/lib/permissions';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { formatDate, initials } from '@/lib/format';
import { EnterpriseTable, type Column } from '@/components/ui/EnterpriseTable';
import type { Employee } from '@/lib/types';

export default function EmployeesPage() {
  const { roles } = useAuth();
  const canRead = gates.canReadDirectory(roles);
  const canWrite = gates.canWriteEmployees(roles);
  const employees = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list, enabled: canRead });

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      render: (employee) => (
        <Link href={`/employees/${employee.id}`} className="flex items-center gap-2.5 group">
          <div className="size-7 rounded-md bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center font-semibold text-xs text-[var(--text-secondary)]">
            {initials(`${employee.firstName} ${employee.lastName}`)}
          </div>
          <div>
            <div className="font-semibold text-xs text-[var(--text)] group-hover:text-[var(--accent-solid)] transition-colors">
              {employee.firstName} {employee.lastName}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono">{employee.employeeCode}</div>
          </div>
        </Link>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department',
      sortable: true,
      render: (employee) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {employee.departmentName ?? 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      render: (employee) => (
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {employee.email ?? '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (employee) => (
        <span className="text-xs text-[var(--text-muted)] tabular-nums">
          {employee.phone ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (employee) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
            employee.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800'
          }`}
        >
          <span className={`size-1.5 rounded-full ${employee.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {employee.status}
        </span>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Enrolled Date',
      sortable: true,
      render: (employee) => (
        <span className="text-xs text-[var(--text-muted)] tabular-nums">
          {formatDate(employee.joiningDate)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10 text-right',
      render: (employee) => (
        <Link
          href={`/employees/${employee.id}`}
          className="size-7 rounded-md inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
          aria-label={`View ${employee.firstName}`}
        >
          <Icon name="chevron" size={14} />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              Core Directory
            </span>
            <span className="text-[var(--text-faint)]">/</span>
            <span className="text-xs text-[var(--text-muted)]">Personnel Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
            People Directory
          </h1>
        </div>

        {canWrite && (
          <div className="flex items-center gap-2.5">
            <Link href="/employees/new" className="btn btn-primary text-xs">
              <Icon name="plus" size={14} />
              <span>Onboard New Employee</span>
            </Link>
          </div>
        )}
      </div>

      <section aria-label="Employees list">
        {!canRead ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <EmptyState
              title="Restricted Access"
              description="The personnel directory is restricted to authorized HR and administrative officers."
              icon="users"
            />
          </div>
        ) : employees.isLoading ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <LoadingState label="Loading employee directory..." />
          </div>
        ) : employees.isError ? (
          <div className="p-8 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
            <ErrorState message="Failed to fetch personnel directory" onRetry={() => void employees.refetch()} />
          </div>
        ) : employees.data ? (
          <EnterpriseTable
            data={employees.data}
            columns={columns}
            keyExtractor={(e) => e.id}
            searchPlaceholder="Search personnel by name, code, or department..."
            searchField={(e) => `${e.firstName} ${e.lastName} ${e.employeeCode} ${e.departmentName ?? ''} ${e.email ?? ''}`}
            filterOptions={[
              { label: 'Active', value: 'ACTIVE', filterFn: (e) => e.status === 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE', filterFn: (e) => e.status !== 'ACTIVE' },
            ]}
          />
        ) : null}
      </section>
    </div>
  );
}
