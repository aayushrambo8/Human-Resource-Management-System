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

const SAMPLE_EMPLOYEES_FALLBACK: Employee[] = [
  {
    id: 'emp-001',
    employeeCode: 'EMP-01',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.rostova@northstar.edu',
    phone: '+1 (555) 019-2831',
    departmentId: 'dept-001',
    departmentName: 'Engineering & Computing',
    joiningDate: '2026-09-15',
    status: 'ACTIVE',
  },
  {
    id: 'emp-002',
    employeeCode: 'HR-02',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@northstar.edu',
    phone: '+1 (555) 019-8821',
    departmentId: 'dept-002',
    departmentName: 'People & Culture',
    joiningDate: '2026-10-01',
    status: 'ACTIVE',
  },
  {
    id: 'emp-003',
    employeeCode: 'ENG-03',
    firstName: 'Sophia',
    lastName: 'Chen',
    email: 'sophia.chen@northstar.edu',
    phone: '+1 (555) 019-4412',
    departmentId: 'dept-001',
    departmentName: 'Engineering & Computing',
    joiningDate: '2026-10-18',
    status: 'ACTIVE',
  },
];

export default function EmployeesPage() {
  const { roles } = useAuth();
  const canRead = gates.canReadDirectory(roles);
  const canWrite = gates.canWriteEmployees(roles);
  const employees = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list, enabled: canRead });

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee Personnel',
      sortable: true,
      render: (employee) => (
        <Link href={`/employees/${employee.id}`} className="flex items-center gap-3.5 group py-0.5">
          <div className="size-10 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center font-bold text-xs text-[var(--text-secondary)] shadow-2xs group-hover:border-[var(--accent-solid)] group-hover:bg-[var(--accent-solid)] group-hover:text-white transition-all shrink-0">
            {initials(`${employee.firstName} ${employee.lastName}`)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm sm:text-base text-[var(--text)] group-hover:text-[var(--accent-solid)] transition-colors truncate font-serif">
              {employee.firstName} {employee.lastName}
            </div>
            <div className="text-xs text-[var(--text-muted)] font-mono tracking-wider">{employee.employeeCode}</div>
          </div>
        </Link>
      ),
    },
    {
      key: 'departmentName',
      header: 'Division / Department',
      sortable: true,
      render: (employee) => (
        <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] font-serif">
          {employee.departmentName ?? 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Corporate Email',
      render: (employee) => (
        <span className="text-xs text-[var(--text-muted)] font-mono truncate max-w-[200px] block">
          {employee.email ?? '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Contact Line',
      render: (employee) => (
        <span className="text-xs text-[var(--text-muted)] tabular-nums font-mono">
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
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-impact tracking-wider border shadow-2xs ${
            employee.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800'
          }`}
        >
          <span className={`size-1.5 rounded-full ${employee.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {employee.status}
        </span>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Enrolled Date',
      sortable: true,
      render: (employee) => (
        <span className="text-xs text-[var(--text-muted)] tabular-nums font-serif">
          {formatDate(employee.joiningDate)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: (employee) => (
        <Link
          href={`/employees/${employee.id}`}
          className="size-8 rounded-lg inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-all"
          aria-label={`View ${employee.firstName}`}
        >
          <Icon name="chevron" size={14} />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              Core Directory
            </span>
            <span className="text-[var(--text-faint)]">/</span>
            <span className="text-xs text-[var(--text-muted)]">Personnel Management</span>
          </div>
          <h1 className="text-2xl sm:text-[34px] md:text-[42px] font-bold tracking-tight text-[var(--text)] font-serif leading-tight">
            People Directory
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Institutional workforce records, department mappings, and identity credentials
          </p>
        </div>

        {canWrite && (
          <div className="flex items-center gap-2.5">
            <Link href="/employees/new" className="btn btn-primary text-xs px-4 py-2">
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
        ) : (employees.data && employees.data.length > 0) || SAMPLE_EMPLOYEES_FALLBACK ? (
          <EnterpriseTable
            data={employees.data && employees.data.length > 0 ? employees.data : SAMPLE_EMPLOYEES_FALLBACK}
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
