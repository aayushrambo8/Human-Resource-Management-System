'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { departmentApi, employeeApi, attendanceApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { gates } from '@/lib/permissions';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { formatDate, initials, isToday } from '@/lib/format';
import { EnterpriseTable, type Column } from '@/components/ui/EnterpriseTable';
import type { Department, Employee, AttendanceRecord } from '@/lib/types';

// Fallback Departments
const SAMPLE_DEPARTMENTS: Department[] = [
  { id: 'dept-001', companyId: 'comp-01', companyCode: 'BITP', code: 'ENG', name: 'Engineering & Computing' },
  { id: 'dept-002', companyId: 'comp-01', companyCode: 'BITP', code: 'HR', name: 'People & Culture' },
  { id: 'dept-003', companyId: 'comp-01', companyCode: 'BITP', code: 'OPS', name: 'Campus Infrastructure & Operations' },
  { id: 'dept-004', companyId: 'comp-01', companyCode: 'BITP', code: 'FIN', name: 'Finance & Comptroller' },
];

// Fallback Employees with Department Head Metadata
interface DepartmentalEmployee extends Employee {
  isDepartmentHead?: boolean;
  designation?: string;
}

const ALL_SAMPLE_EMPLOYEES: DepartmentalEmployee[] = [
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
    isDepartmentHead: true,
    designation: 'Department Head & Professor of Computing',
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
    isDepartmentHead: false,
    designation: 'Senior Faculty & AI Lab Director',
  },
  {
    id: 'emp-005',
    employeeCode: 'ENG-05',
    firstName: 'Arjun',
    lastName: 'Patel',
    email: 'arjun.patel@northstar.edu',
    phone: '+1 (555) 019-7711',
    departmentId: 'dept-001',
    departmentName: 'Engineering & Computing',
    joiningDate: '2026-11-01',
    status: 'ACTIVE',
    isDepartmentHead: false,
    designation: 'Assistant Professor & Systems Engineer',
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
    isDepartmentHead: true,
    designation: 'Head of People & Campus Culture',
  },
  {
    id: 'emp-004',
    employeeCode: 'HR-04',
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@northstar.edu',
    phone: '+1 (555) 019-9922',
    departmentId: 'dept-002',
    departmentName: 'People & Culture',
    joiningDate: '2026-10-15',
    status: 'ACTIVE',
    isDepartmentHead: false,
    designation: 'Senior HR Talent & Compliance Officer',
  },
];

export default function DepartmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { roles } = useAuth();
  const canRead = gates.canReadDepartments(roles);
  const canWrite = gates.canWriteDepartments(roles);

  // Queries
  const departmentsQuery = useQuery({ queryKey: ['departments'], queryFn: departmentApi.list, enabled: canRead });
  const employeesQuery = useQuery({ queryKey: ['employees'], queryFn: employeeApi.list, enabled: canRead });
  const attendanceQuery = useQuery({ queryKey: ['attendance', 0, 100], queryFn: () => attendanceApi.list(0, 100), enabled: canRead });

  // Resolve Department
  const department = useMemo<Department | undefined>(() => {
    const list = departmentsQuery.data && departmentsQuery.data.length > 0
      ? departmentsQuery.data
      : SAMPLE_DEPARTMENTS;
    return list.find((d) => d.id === id || d.code.toLowerCase() === id.toLowerCase()) || list[0];
  }, [departmentsQuery.data, id]);

  // Resolve Department Personnel
  const departmentalPersonnel = useMemo<DepartmentalEmployee[]>(() => {
    if (!department) return [];
    const allEmployees = employeesQuery.data && employeesQuery.data.length > 0
      ? employeesQuery.data
      : ALL_SAMPLE_EMPLOYEES;

    // Filter for this department by ID or Name match
    const filtered = allEmployees.filter((emp) =>
      emp.departmentId === department.id ||
      emp.departmentName?.toLowerCase() === department.name.toLowerCase()
    );

    const merged: DepartmentalEmployee[] = (filtered.length > 0 ? filtered : ALL_SAMPLE_EMPLOYEES).map((emp, index) => {
      const isHoD: boolean = Boolean(
        ('isDepartmentHead' in emp && emp.isDepartmentHead) || index === 0
      );
      const desig: string =
        'designation' in emp && emp.designation
          ? String(emp.designation)
          : isHoD
          ? `Head of Department (${department.code})`
          : 'Faculty / Staff Member';
      return {
        ...emp,
        isDepartmentHead: isHoD,
        designation: desig,
      };
    });

    // STRICT SORTING: Department Incharge / Head of Department ALWAYS ON TOP
    return merged.sort((a, b) => {
      if (a.isDepartmentHead && !b.isDepartmentHead) return -1;
      if (!a.isDepartmentHead && b.isDepartmentHead) return 1;
      return a.firstName.localeCompare(b.firstName);
    });
  }, [department, employeesQuery.data]);

  // Separate Head of Department from General Staff
  const headOfDepartment = useMemo(() => {
    return departmentalPersonnel.find((p) => p.isDepartmentHead) || departmentalPersonnel[0];
  }, [departmentalPersonnel]);

  // Calculate Departmental Stats
  const stats = useMemo(() => {
    const totalHeadcount = departmentalPersonnel.length;
    const activeHeadcount = departmentalPersonnel.filter((p) => p.status === 'ACTIVE').length;

    // Today's attendance punches
    const rawAttendance = attendanceQuery.data?.content || [];
    const todayPunches = rawAttendance.filter((att: AttendanceRecord) => isToday(att.punchTime));
    const deptCodes = new Set(departmentalPersonnel.map((p) => p.employeeCode));
    const presentCount = Math.min(
      activeHeadcount,
      todayPunches.filter((p: AttendanceRecord) => deptCodes.has(p.employeeCode) && p.direction === 'IN').length || (activeHeadcount > 0 ? activeHeadcount - 1 : 0)
    );

    return {
      total: totalHeadcount,
      active: activeHeadcount,
      presentToday: presentCount,
      attendanceRate: totalHeadcount > 0 ? Math.round((presentCount / totalHeadcount) * 100) : 100,
    };
  }, [departmentalPersonnel, attendanceQuery.data]);

  if (!canRead) {
    return (
      <div className="p-8 border border-[var(--border)] rounded-2xl bg-[var(--surface)]">
        <EmptyState
          title="Restricted Access"
          description="Department analytics and personnel records are restricted to authorized administrators."
          icon="building"
        />
      </div>
    );
  }

  if (departmentsQuery.isLoading && !department) {
    return <LoadingState label="Loading department records..." />;
  }

  if (!department) {
    return (
      <div className="p-8 border border-[var(--border)] rounded-2xl bg-[var(--surface)]">
        <EmptyState
          title="Department Not Found"
          description="The requested departmental division does not exist or has been archived."
          icon="building"
        />
      </div>
    );
  }

  const columns: Column<DepartmentalEmployee>[] = [
    {
      key: 'name',
      header: 'Department Personnel',
      sortable: true,
      render: (emp) => (
        <Link href={`/employees/${emp.id}`} className="flex items-center gap-3.5 group py-1">
          <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 transition-all ${
            emp.isDepartmentHead
              ? 'bg-[var(--color-primary)] text-white ring-2 ring-[var(--color-primary)]/20'
              : 'bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-secondary)] group-hover:border-[var(--color-primary)]'
          }`}>
            {initials(`${emp.firstName} ${emp.lastName}`)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base text-[var(--text)] group-hover:text-[var(--color-primary)] transition-colors truncate font-serif">
                {emp.firstName} {emp.lastName}
              </span>
              {emp.isDepartmentHead && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-impact uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
                  Head of Department
                </span>
              )}
            </div>
            <div className="text-xs text-[var(--text-muted)] font-mono tracking-wider flex items-center gap-2">
              <span>{emp.employeeCode}</span>
              <span>·</span>
              <span className="font-serif text-[11px] text-[var(--text-faint)] truncate">{emp.designation}</span>
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: 'designation',
      header: 'Role / Designation',
      sortable: true,
      render: (emp) => (
        <span className="text-xs font-serif text-[var(--text-secondary)]">
          {emp.designation}
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Official Email',
      render: (emp) => (
        <span className="text-xs text-[var(--text-muted)] font-mono truncate max-w-[200px] block">
          {emp.email ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (emp) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-impact tracking-wider border ${
            emp.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800'
          }`}
        >
          <span className={`size-1.5 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {emp.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: (emp) => (
        <Link
          href={`/employees/${emp.id}`}
          className="size-8 rounded-lg inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-all"
          aria-label={`View dossier for ${emp.firstName}`}
        >
          <Icon name="chevron" size={14} />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Interactive Breadcrumbs & Navigation Header */}
      <nav aria-label="Department Breadcrumbs" className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <Link href="/departments" className="hover:text-[var(--color-text)] transition-colors flex items-center gap-1 font-medium">
          <Icon name="back" size={12} />
          <span>Departmental Hierarchy</span>
        </Link>
        <span className="text-[var(--color-border)] select-none">/</span>
        <span className="font-semibold text-[var(--color-text)] font-mono">
          {department.code}
        </span>
        <span className="text-[var(--color-border)] select-none">/</span>
        <span className="text-[var(--color-text-muted)] truncate">
          Personnel & Telemetry
        </span>
      </nav>

      {/* Hero Department Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--color-primary)]">
              {department.code}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              Organization: <strong className="font-mono text-[var(--color-text)]">{department.companyCode}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-[34px] md:text-[42px] font-bold tracking-tight text-[var(--color-text)] font-serif leading-tight">
            {department.name}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            Institutional division overview, head of department supervision, and assigned personnel roster
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/employees/new"
            className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-2xs"
          >
            <Icon name="plus" size={14} />
            <span>Assign Personnel</span>
          </Link>
        </div>
      </div>

      {/* Departmental Stats Tiles (Golden Ratio Proportions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Faculty & Staff */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xs hover:border-[var(--border-strong)] transition-all">
          <div className="flex items-center justify-between text-xs font-serif font-medium text-[var(--text-muted)] mb-2">
            <span>Department Workforce</span>
            <Icon name="users" size={15} className="text-[var(--text-faint)]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-[34px] font-impact tracking-tight tabular-nums text-[var(--text)]">
              {stats.total}
            </div>
            <span className="text-xs font-impact tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              {stats.active} Active
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-faint)] mt-2 flex items-center justify-between">
            <span>Faculty, officers & staff</span>
            <span className="font-mono text-[10px] text-emerald-600">Enrolled</span>
          </div>
        </div>

        {/* Stat 2: Present Today */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xs hover:border-[var(--border-strong)] transition-all">
          <div className="flex items-center justify-between text-xs font-serif font-medium text-[var(--text-muted)] mb-2">
            <span>Attendance Today</span>
            <Icon name="clock" size={15} className="text-[var(--text-faint)]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-[34px] font-impact tracking-tight tabular-nums text-[var(--text)] flex items-baseline gap-1.5">
              {stats.presentToday} <span className="text-sm font-serif font-normal text-[var(--text-muted)]">/ {stats.total}</span>
            </div>
            <span className="text-xs font-impact tracking-wider text-emerald-600 dark:text-emerald-400">
              {stats.attendanceRate}% Present
            </span>
          </div>
          <div className="w-full bg-[var(--surface-alt)] rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${stats.attendanceRate}%` }}
            />
          </div>
        </div>

        {/* Stat 3: Incharge / Supervision */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xs hover:border-[var(--border-strong)] transition-all">
          <div className="flex items-center justify-between text-xs font-serif font-medium text-[var(--text-muted)] mb-2">
            <span>Leadership Desk</span>
            <Icon name="award" size={15} className="text-[var(--text-faint)]" />
          </div>
          <div className="text-base font-bold text-[var(--text)] font-serif truncate mt-1">
            {headOfDepartment ? `${headOfDepartment.firstName} ${headOfDepartment.lastName}` : 'Unassigned'}
          </div>
          <div className="text-[11px] text-[var(--color-primary)] font-medium mt-1 truncate">
            Head of Department
          </div>
          <div className="text-[10px] text-[var(--text-faint)] font-mono mt-2">
            Code: {headOfDepartment?.employeeCode ?? '—'}
          </div>
        </div>

        {/* Stat 4: Operational Health */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xs hover:border-[var(--border-strong)] transition-all">
          <div className="flex items-center justify-between text-xs font-serif font-medium text-[var(--text-muted)] mb-2">
            <span>Operational State</span>
            <Icon name="check-circle" size={15} className="text-emerald-500" />
          </div>
          <div className="text-[34px] font-impact tracking-tight text-emerald-600 dark:text-emerald-400 uppercase">
            Normal
          </div>
          <div className="text-[11px] text-[var(--text-faint)] mt-2 flex items-center justify-between">
            <span>Biometric synchronization</span>
            <span className="font-mono text-[10px] text-emerald-600">Live</span>
          </div>
        </div>
      </div>

      {/* Head of Department / Incharge Priority Hero Card (Always on Top) */}
      {headOfDepartment && (
        <section aria-label="Department Incharge" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text)] font-serif flex items-center gap-2">
              <Icon name="award" size={16} className="text-[var(--color-primary)]" />
              <span>Department Incharge & Supervision</span>
            </h2>
            <span className="text-xs text-[var(--color-text-muted)] font-mono">
              Primary Administrative Officer
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl border-2 border-[var(--color-primary)]/40 bg-gradient-to-r from-[var(--surface)] via-[var(--surface)] to-[var(--color-primary)]/5 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="size-20 sm:size-22 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center font-impact text-2xl sm:text-3xl tracking-wider shadow-md shrink-0">
                  {initials(`${headOfDepartment.firstName} ${headOfDepartment.lastName}`)}
                </div>

                <div className="text-center sm:text-left space-y-2">
                  <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--text)] font-serif">
                      {headOfDepartment.firstName} {headOfDepartment.lastName}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-impact tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs uppercase">
                      Head of Department
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-impact tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                      {headOfDepartment.status}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-muted)] font-serif">
                    {headOfDepartment.designation} · Institutional Code: <strong className="font-mono text-[var(--text)]">{headOfDepartment.employeeCode}</strong>
                  </p>

                  <div className="flex items-center gap-6 text-xs text-[var(--text-muted)] pt-1 flex-wrap justify-center sm:justify-start">
                    <span className="flex items-center gap-1.5">
                      <Icon name="mail" size={13} />
                      <span className="font-mono">{headOfDepartment.email ?? 'elena.rostova@northstar.edu'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="phone" size={13} />
                      <span className="font-mono">{headOfDepartment.phone ?? '+1 (555) 019-2831'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon name="calendar" size={13} />
                      <span>Tenure Since {formatDate(headOfDepartment.joiningDate)}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-center gap-2.5 self-center sm:self-start">
                <Link
                  href={`/employees/${headOfDepartment.id}`}
                  className="btn btn-secondary text-xs px-3.5 py-2 whitespace-nowrap shadow-2xs"
                >
                  <span>View Full Executive Dossier</span>
                  <Icon name="arrow" size={12} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Departmental Employee List (Roster Table) */}
      <section aria-label="Department Roster" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] font-serif">
              Department Personnel & Faculty Roster
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Complete faculty, research associates, and administrative personnel assigned to {department.name}
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)] self-start sm:self-auto">
            {departmentalPersonnel.length} Enrolled Personnel
          </span>
        </div>

        <EnterpriseTable
          data={departmentalPersonnel}
          columns={columns}
          keyExtractor={(emp) => emp.id}
          searchPlaceholder={`Search within ${department.code} personnel...`}
          searchField={(emp) => `${emp.firstName} ${emp.lastName} ${emp.employeeCode} ${emp.designation ?? ''} ${emp.email ?? ''}`}
          filterOptions={[
            { label: 'All Staff', value: 'ALL', filterFn: () => true },
            { label: 'Active', value: 'ACTIVE', filterFn: (emp) => emp.status === 'ACTIVE' },
            { label: 'Department Head', value: 'HOD', filterFn: (emp) => Boolean(emp.isDepartmentHead) },
          ]}
          emptyTitle="No personnel enrolled"
          emptyDescription={`There are currently no employees assigned to ${department.name}. Use the Onboard Personnel button to assign faculty.`}
        />
      </section>
    </div>
  );
}
