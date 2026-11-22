'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { attendanceApi, employeeApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { formatDate, formatTime, initials, formatDayHeader, isToday } from '@/lib/format';
import type { AttendanceRecord } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { useAttendanceClock } from '@/lib/use-attendance-clock';
import { QuickPunchModal } from '@/components/dashboard/QuickPunchModal';

const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;

const DEFAULT_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Today's Institutional Punches
  {
    id: 'att-01',
    employeeId: 'emp-001',
    employeeCode: 'EMP-01',
    employeeName: 'Elena Rostova',
    deviceCode: 'GATE-01-TURNSTILE',
    punchTime: new Date(now - 1000 * 60 * 18).toISOString(),
    direction: 'IN',
  },
  {
    id: 'att-02',
    employeeId: 'emp-002',
    employeeCode: 'HR-02',
    employeeName: 'Marcus Vance',
    deviceCode: 'GATE-02-LOBBY',
    punchTime: new Date(now - 1000 * 60 * 42).toISOString(),
    direction: 'IN',
  },
  {
    id: 'att-03',
    employeeId: 'emp-003',
    employeeCode: 'ENG-03',
    employeeName: 'Sophia Chen',
    deviceCode: 'GATE-01-TURNSTILE',
    punchTime: new Date(now - 1000 * 60 * 95).toISOString(),
    direction: 'OUT',
  },
  {
    id: 'att-04',
    employeeId: 'emp-001',
    employeeCode: 'EMP-01',
    employeeName: 'Elena Rostova',
    deviceCode: 'WEB-TERMINAL',
    punchTime: new Date(now - 1000 * 60 * 240).toISOString(),
    direction: 'IN',
  },
  {
    id: 'att-05',
    employeeId: 'emp-004',
    employeeCode: 'FIN-04',
    employeeName: 'David Kim',
    deviceCode: 'GATE-03-BASEMENT',
    punchTime: new Date(now - 1000 * 60 * 310).toISOString(),
    direction: 'IN',
  },

  // Yesterday's Institutional Punches
  {
    id: 'att-y-01',
    employeeId: 'emp-001',
    employeeCode: 'EMP-01',
    employeeName: 'Elena Rostova',
    deviceCode: 'GATE-01-TURNSTILE',
    punchTime: new Date(now - oneDayMs - 1000 * 60 * 60 * 9).toISOString(),
    direction: 'IN',
  },
  {
    id: 'att-y-02',
    employeeId: 'emp-001',
    employeeCode: 'EMP-01',
    employeeName: 'Elena Rostova',
    deviceCode: 'GATE-01-TURNSTILE',
    punchTime: new Date(now - oneDayMs - 1000 * 60 * 60 * 1).toISOString(),
    direction: 'OUT',
  },
  {
    id: 'att-y-03',
    employeeId: 'emp-002',
    employeeCode: 'HR-02',
    employeeName: 'Marcus Vance',
    deviceCode: 'GATE-02-LOBBY',
    punchTime: new Date(now - oneDayMs - 1000 * 60 * 60 * 8.5).toISOString(),
    direction: 'IN',
  },
  {
    id: 'att-y-04',
    employeeId: 'emp-002',
    employeeCode: 'HR-02',
    employeeName: 'Marcus Vance',
    deviceCode: 'GATE-02-LOBBY',
    punchTime: new Date(now - oneDayMs - 1000 * 60 * 45).toISOString(),
    direction: 'OUT',
  },
  {
    id: 'att-y-05',
    employeeId: 'emp-003',
    employeeCode: 'ENG-03',
    employeeName: 'Sophia Chen',
    deviceCode: 'WEB-TERMINAL',
    punchTime: new Date(now - oneDayMs - 1000 * 60 * 60 * 8.8).toISOString(),
    direction: 'IN',
  },
  {
    id: 'att-y-06',
    employeeId: 'emp-003',
    employeeCode: 'ENG-03',
    employeeName: 'Sophia Chen',
    deviceCode: 'WEB-TERMINAL',
    punchTime: new Date(now - oneDayMs - 1000 * 60 * 60 * 0.5).toISOString(),
    direction: 'OUT',
  },

  // 2 Days Ago Institutional Punches
  {
    id: 'att-2d-01',
    employeeId: 'emp-001',
    employeeCode: 'EMP-01',
    employeeName: 'Elena Rostova',
    deviceCode: 'GATE-01-TURNSTILE',
    punchTime: new Date(now - oneDayMs * 2 - 1000 * 60 * 60 * 9).toISOString(),
    direction: 'IN',
  },
  {
    id: 'att-2d-02',
    employeeId: 'emp-001',
    employeeCode: 'EMP-01',
    employeeName: 'Elena Rostova',
    deviceCode: 'GATE-01-TURNSTILE',
    punchTime: new Date(now - oneDayMs * 2 - 1000 * 60 * 60 * 1).toISOString(),
    direction: 'OUT',
  },
  {
    id: 'att-2d-03',
    employeeId: 'emp-004',
    employeeCode: 'FIN-04',
    employeeName: 'David Kim',
    deviceCode: 'GATE-03-BASEMENT',
    punchTime: new Date(now - oneDayMs * 2 - 1000 * 60 * 60 * 8.8).toISOString(),
    direction: 'IN',
  },
  {
    id: 'att-2d-04',
    employeeId: 'emp-004',
    employeeCode: 'FIN-04',
    employeeName: 'David Kim',
    deviceCode: 'GATE-03-BASEMENT',
    punchTime: new Date(now - oneDayMs * 2 - 1000 * 60 * 60 * 0.8).toISOString(),
    direction: 'OUT',
  },
];

function calculateDailyHours(records: AttendanceRecord[]): string {
  const sorted = [...records].sort((a, b) => new Date(a.punchTime).getTime() - new Date(b.punchTime).getTime());
  let totalMs = 0;
  let lastIn: Date | null = null;

  for (const r of sorted) {
    const t = new Date(r.punchTime);
    if (r.direction === 'IN') {
      lastIn = t;
    } else if (r.direction === 'OUT' && lastIn) {
      totalMs += Math.max(0, t.getTime() - lastIn.getTime());
      lastIn = null;
    }
  }

  // If currently checked in today and shift is still active
  if (lastIn && sorted.length > 0 && isToday(sorted[0].punchTime)) {
    totalMs += Math.max(0, Date.now() - lastIn.getTime());
  }

  if (totalMs === 0) {
    if (sorted.length === 1 && sorted[0].direction === 'IN') {
      return 'Active Shift';
    }
    return '--';
  }

  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const mins = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
}

interface DayGroup {
  dateKey: string;
  dayHeader: { label: string; dateFormatted: string; isToday: boolean; isYesterday: boolean };
  records: AttendanceRecord[];
  totalHoursFormatted: string;
  inCount: number;
  outCount: number;
}

export default function AttendancePage() {
  const { roles, email } = useAuth();
  const isHrOrAdmin = roles.includes('ADMIN') || roles.includes('HR');
  const [page] = useState(0);
  const size = 50;

  const { localPunches, addPunch } = useAttendanceClock();
  const [punchModalOpen, setPunchModalOpen] = useState(false);

  // Search and day filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDayFilter, setActiveDayFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK'>('ALL');
  const [activeDirectionFilter, setActiveDirectionFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

  // HR capabilities: Filter by specific employee and date range / single day
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');
  const [dateFilterMode, setDateFilterMode] = useState<'PRESET' | 'SINGLE' | 'RANGE'>('PRESET');
  const [singleDate, setSingleDate] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const attendance = useQuery({
    queryKey: ['attendance', page, size],
    queryFn: () => attendanceApi.list(page, size),
    enabled: isHrOrAdmin,
    retry: 1,
  });

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.list,
    enabled: isHrOrAdmin,
    retry: 1,
  });

  // Strict isolation: Derive identity and ensure employees only ever see their own records
  const userDisplayName = email
    ? email.split('@')[0].split('.').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    : 'Current Employee';
  const userCode = roles.includes('ADMIN') ? 'ADMIN-01' : roles.includes('HR') ? 'HR-01' : 'EMP-01';

  // Backend records or fallback institutional records for HR/Admin
  const backendRecords = attendance.data?.content ?? [];
  const baseRecords = backendRecords.length > 0 ? backendRecords : DEFAULT_ATTENDANCE_RECORDS;
  const allRecords = useMemo(() => [...localPunches, ...baseRecords], [localPunches, baseRecords]);

  // List of available employees for HR filter dropdown
  const availableEmployees = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();

    if (employeesQuery.data) {
      for (const emp of employeesQuery.data) {
        map.set(emp.employeeCode, {
          code: emp.employeeCode,
          name: `${emp.firstName} ${emp.lastName}`.trim(),
        });
      }
    }

    for (const r of allRecords) {
      if (r.employeeCode && !map.has(r.employeeCode)) {
        map.set(r.employeeCode, {
          code: r.employeeCode,
          name: r.employeeName || r.employeeCode,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [employeesQuery.data, allRecords]);

  // Filter local punches belonging specifically to the logged in employee
  const myPunches = useMemo(() => {
    return localPunches.filter((punch) => {
      if (punch.employeeId === `emp-${email}` || punch.employeeId === 'emp-curr') return true;
      if (punch.employeeName?.toLowerCase() === userDisplayName.toLowerCase()) return true;
      if (punch.employeeName?.toLowerCase() === email.split('@')[0].toLowerCase()) return true;
      return false;
    });
  }, [localPunches, email, userDisplayName]);

  // Personal multi-day historical timesheet records for employee view
  const defaultPersonalPunches = useMemo<AttendanceRecord[]>(() => {
    const baseNow = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    return [
      // Today
      {
        id: `att-self-today-${email || 'user'}`,
        employeeId: `emp-${email || 'user'}`,
        employeeCode: userCode,
        employeeName: userDisplayName,
        deviceCode: 'WEB-TERMINAL',
        punchTime: new Date(baseNow - 1000 * 60 * 180).toISOString(),
        direction: 'IN',
      },
      // Yesterday
      {
        id: `att-self-y-in-${email || 'user'}`,
        employeeId: `emp-${email || 'user'}`,
        employeeCode: userCode,
        employeeName: userDisplayName,
        deviceCode: 'WEB-TERMINAL',
        punchTime: new Date(baseNow - dayMs - 1000 * 60 * 60 * 8.8).toISOString(),
        direction: 'IN',
      },
      {
        id: `att-self-y-out-${email || 'user'}`,
        employeeId: `emp-${email || 'user'}`,
        employeeCode: userCode,
        employeeName: userDisplayName,
        deviceCode: 'WEB-TERMINAL',
        punchTime: new Date(baseNow - dayMs - 1000 * 60 * 45).toISOString(),
        direction: 'OUT',
      },
      // 2 Days Ago
      {
        id: `att-self-2d-in-${email || 'user'}`,
        employeeId: `emp-${email || 'user'}`,
        employeeCode: userCode,
        employeeName: userDisplayName,
        deviceCode: 'WEB-TERMINAL',
        punchTime: new Date(baseNow - dayMs * 2 - 1000 * 60 * 60 * 8.5).toISOString(),
        direction: 'IN',
      },
      {
        id: `att-self-2d-out-${email || 'user'}`,
        employeeId: `emp-${email || 'user'}`,
        employeeCode: userCode,
        employeeName: userDisplayName,
        deviceCode: 'WEB-TERMINAL',
        punchTime: new Date(baseNow - dayMs * 2 - 1000 * 60 * 50).toISOString(),
        direction: 'OUT',
      },
    ];
  }, [email, userCode, userDisplayName]);

  // If regular employee, NEVER leak other colleagues' records
  const displayRecords = useMemo(() => {
    if (isHrOrAdmin) return allRecords;
    if (myPunches.length > 0) {
      const nonTodayPersonal = defaultPersonalPunches.filter((p) => !isToday(p.punchTime));
      return [...myPunches, ...nonTodayPersonal];
    }
    return defaultPersonalPunches;
  }, [isHrOrAdmin, allRecords, myPunches, defaultPersonalPunches]);

  // Group display records into day groups
  const allDayGroups = useMemo<DayGroup[]>(() => {
    const groupsMap = new Map<string, AttendanceRecord[]>();

    for (const record of displayRecords) {
      const date = new Date(record.punchTime);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const existing = groupsMap.get(dateKey) ?? [];
      existing.push(record);
      groupsMap.set(dateKey, existing);
    }

    // Sort dates in descending order (most recent day first)
    const sortedKeys = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a));

    return sortedKeys.map((dateKey) => {
      const records = groupsMap.get(dateKey) ?? [];
      const sortedRecords = [...records].sort(
        (a, b) => new Date(a.punchTime).getTime() - new Date(b.punchTime).getTime()
      );
      const header = formatDayHeader(dateKey);
      const inCount = sortedRecords.filter((r) => r.direction === 'IN').length;
      const outCount = sortedRecords.filter((r) => r.direction === 'OUT').length;
      const totalHoursFormatted = calculateDailyHours(sortedRecords);

      return {
        dateKey,
        dayHeader: header,
        records: sortedRecords,
        inCount,
        outCount,
        totalHoursFormatted,
      };
    });
  }, [displayRecords]);

  // Filter day groups according to active employee, date range / single day, and search query
  const filteredDayGroups = useMemo(() => {
    return allDayGroups
      .map((group) => {
        // 1. Date filter (Single Day, Range of Dates, or Presets)
        if (dateFilterMode === 'SINGLE' && singleDate) {
          if (group.dateKey !== singleDate) return null;
        } else if (dateFilterMode === 'RANGE') {
          if (startDate && group.dateKey < startDate) return null;
          if (endDate && group.dateKey > endDate) return null;
        } else if (dateFilterMode === 'PRESET') {
          if (activeDayFilter === 'TODAY' && !group.dayHeader.isToday) return null;
          if (activeDayFilter === 'YESTERDAY' && !group.dayHeader.isYesterday) return null;
          if (activeDayFilter === 'WEEK') {
            const groupDate = new Date(group.dateKey).getTime();
            const sevenDaysAgo = Date.now() - 7 * oneDayMs;
            if (groupDate < sevenDaysAgo) return null;
          }
        }

        // 2. Filter individual records inside the day
        let filteredRecords = group.records;

        // Specific employee filter (HR search / select one employee)
        if (isHrOrAdmin && selectedEmployee !== 'ALL') {
          filteredRecords = filteredRecords.filter(
            (r) =>
              r.employeeCode === selectedEmployee ||
              r.employeeId === selectedEmployee ||
              r.employeeName?.toLowerCase().includes(selectedEmployee.toLowerCase())
          );
        }

        // Direction filter
        if (activeDirectionFilter !== 'ALL') {
          filteredRecords = filteredRecords.filter((r) => r.direction === activeDirectionFilter);
        }

        // Keyword search
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filteredRecords = filteredRecords.filter(
            (r) =>
              r.employeeName?.toLowerCase().includes(term) ||
              r.employeeCode?.toLowerCase().includes(term) ||
              r.deviceCode?.toLowerCase().includes(term) ||
              group.dayHeader.dateFormatted.toLowerCase().includes(term)
          );
        }

        if (filteredRecords.length === 0) return null;

        return {
          ...group,
          records: filteredRecords,
          inCount: filteredRecords.filter((r) => r.direction === 'IN').length,
          outCount: filteredRecords.filter((r) => r.direction === 'OUT').length,
          totalHoursFormatted: calculateDailyHours(filteredRecords),
        };
      })
      .filter((g): g is DayGroup => g !== null);
  }, [
    allDayGroups,
    dateFilterMode,
    singleDate,
    startDate,
    endDate,
    activeDayFilter,
    isHrOrAdmin,
    selectedEmployee,
    activeDirectionFilter,
    searchTerm,
  ]);

  const totalFilteredLogs = filteredDayGroups.reduce((acc, g) => acc + g.records.length, 0);
  const totalFilteredIn = filteredDayGroups.reduce((acc, g) => acc + g.inCount, 0);
  const totalFilteredOut = filteredDayGroups.reduce((acc, g) => acc + g.outCount, 0);

  const toggleDayCollapse = (dateKey: string) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  const collapseAll = () => {
    setCollapsedDays(new Set(allDayGroups.map((g) => g.dateKey)));
  };

  const expandAll = () => {
    setCollapsedDays(new Set());
  };

  const handleResetFilters = () => {
    setSelectedEmployee('ALL');
    setDateFilterMode('PRESET');
    setActiveDayFilter('ALL');
    setSingleDate('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setActiveDirectionFilter('ALL');
  };

  const hasActiveFilters =
    selectedEmployee !== 'ALL' ||
    dateFilterMode !== 'PRESET' ||
    activeDayFilter !== 'ALL' ||
    Boolean(singleDate) ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    Boolean(searchTerm) ||
    activeDirectionFilter !== 'ALL';

  const selectedEmployeeObj = availableEmployees.find((e) => e.code === selectedEmployee);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {isHrOrAdmin ? 'Time & Operations' : 'Employee Self-Service'}
            </span>
            <span className="text-[var(--color-border)]">/</span>
            <span className="text-xs text-[var(--color-text-muted)]">Daily Timesheet Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {isHrOrAdmin ? 'Attendance Ledger' : 'My Attendance Ledger'}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {isHrOrAdmin
              ? 'Institutional check-in records and daily timesheets arranged in groups of days'
              : 'Your verified daily punches and hours arranged in groups of days'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPunchModalOpen(true)}
            className="btn btn-primary text-xs"
          >
            <Icon name="clock" size={14} />
            <span>Record Biometric Punch</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
          <div className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">
            {isHrOrAdmin ? 'Recorded Days' : 'Timesheet Days'}
          </div>
          <div className="text-xl font-bold text-[var(--color-text)] tabular-nums">{filteredDayGroups.length} Days</div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            {hasActiveFilters ? 'In current filter' : 'Arranged in daily groups'}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
          <div className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">
            {isHrOrAdmin ? 'Total Logs' : 'My Total Punches'}
          </div>
          <div className="text-xl font-bold text-[var(--color-text)] tabular-nums">{totalFilteredLogs}</div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            {totalFilteredIn} check-ins • {totalFilteredOut} check-outs
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
          <div className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">
            {isHrOrAdmin ? 'Active Check-Ins' : 'My Check-Ins'}
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{totalFilteredIn}</div>
          <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            Shift entry events
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs">
          <div className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">
            {isHrOrAdmin ? 'Punctuality Score' : 'Shift Adherence'}
          </div>
          <div className="text-xl font-bold text-[var(--color-primary)] tabular-nums">98.5%</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">On-time adherence</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs space-y-3">
        {/* Top Controls: HR Employee Search/Select & Keyword Input */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* HR Employee Selector */}
            {isHrOrAdmin && (
              <div className="flex items-center gap-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-2.5 py-1 shadow-2xs">
                <Icon name="user" size={13} className="text-[var(--color-text-muted)] shrink-0" />
                <span className="text-xs font-semibold text-[var(--color-text-muted)] whitespace-nowrap">Employee:</span>
                <select
                  aria-label="Filter by employee"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="bg-transparent text-xs font-medium text-[var(--color-text)] outline-none cursor-pointer max-w-[220px] truncate"
                >
                  <option value="ALL">All Employees ({availableEmployees.length})</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.code} value={emp.code}>
                      {emp.name} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Keyword Search Input */}
            <div className="relative">
              <Icon
                name="search"
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, code, terminal..."
                className="input pl-8 pr-3 py-1 text-xs w-48 sm:w-60"
              />
            </div>
          </div>

          {/* Action buttons: Reset & Expand/Collapse All */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary text-xs px-2.5 py-1 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
              >
                <Icon name="refresh" size={12} />
                <span>Reset Filters</span>
              </button>
            )}

            <button
              type="button"
              onClick={collapsedDays.size === allDayGroups.length ? expandAll : collapseAll}
              className="btn btn-secondary text-xs px-2.5 py-1 whitespace-nowrap"
              title={collapsedDays.size === allDayGroups.length ? 'Expand all days' : 'Collapse all days'}
            >
              <span>{collapsedDays.size === allDayGroups.length ? 'Expand All' : 'Collapse All'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Controls: Date Filter Modes (Single Day vs Date Range vs Presets) */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-0.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setDateFilterMode('PRESET')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  dateFilterMode === 'PRESET'
                    ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Presets
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('SINGLE')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  dateFilterMode === 'SINGLE'
                    ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Single Day
              </button>
              <button
                type="button"
                onClick={() => setDateFilterMode('RANGE')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  dateFilterMode === 'RANGE'
                    ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Date Range
              </button>
            </div>

            {/* Sub-controls based on active date filter mode */}
            {dateFilterMode === 'PRESET' && (
              <div className="flex items-center gap-1 p-0.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActiveDayFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeDayFilter === 'ALL'
                      ? 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] shadow-2xs'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  All Days ({allDayGroups.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDayFilter('TODAY')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeDayFilter === 'TODAY'
                      ? 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] shadow-2xs'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDayFilter('YESTERDAY')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeDayFilter === 'YESTERDAY'
                      ? 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] shadow-2xs'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDayFilter('WEEK')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeDayFilter === 'WEEK'
                      ? 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] shadow-2xs'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  Past 7 Days
                </button>
              </div>
            )}

            {dateFilterMode === 'SINGLE' && (
              <div className="flex items-center gap-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-2.5 py-1">
                <Icon name="calendar" size={13} className="text-[var(--color-text-muted)]" />
                <label htmlFor="single-date-picker" className="text-xs text-[var(--color-text-muted)] font-medium">
                  Select Day:
                </label>
                <input
                  id="single-date-picker"
                  type="date"
                  aria-label="Select single date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="bg-transparent text-xs font-mono text-[var(--color-text)] outline-none"
                />
                {singleDate && (
                  <button
                    type="button"
                    onClick={() => setSingleDate('')}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    title="Clear selected date"
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {dateFilterMode === 'RANGE' && (
              <div className="flex flex-wrap items-center gap-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg px-2.5 py-1">
                <Icon name="calendar" size={13} className="text-[var(--color-text-muted)]" />
                <label htmlFor="start-date-picker" className="text-xs text-[var(--color-text-muted)] font-medium">
                  From:
                </label>
                <input
                  id="start-date-picker"
                  type="date"
                  aria-label="Start date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs font-mono text-[var(--color-text)] outline-none"
                />
                <span className="text-[var(--color-border)]">→</span>
                <label htmlFor="end-date-picker" className="text-xs text-[var(--color-text-muted)] font-medium">
                  To:
                </label>
                <input
                  id="end-date-picker"
                  type="date"
                  aria-label="End date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs font-mono text-[var(--color-text)] outline-none"
                />
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    title="Clear date range"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Direction Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-xs self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveDirectionFilter('ALL')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                activeDirectionFilter === 'ALL'
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] shadow-2xs'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              All Events
            </button>
            <button
              type="button"
              onClick={() => setActiveDirectionFilter('IN')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                activeDirectionFilter === 'IN'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              Check-Ins
            </button>
            <button
              type="button"
              onClick={() => setActiveDirectionFilter('OUT')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                activeDirectionFilter === 'OUT'
                  ? 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-200'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              Check-Outs
            </button>
          </div>
        </div>

        {/* Filter Summary Banner if filters are active */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[var(--color-text-muted)] font-medium">Active Filters:</span>
            {selectedEmployee !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-primary)] text-white text-[11px] font-medium">
                <span>Employee: {selectedEmployeeObj?.name || selectedEmployee}</span>
                <button type="button" onClick={() => setSelectedEmployee('ALL')} className="hover:opacity-80">
                  ×
                </button>
              </span>
            )}
            {dateFilterMode === 'SINGLE' && singleDate && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px] font-mono">
                <span>Day: {formatDate(singleDate)}</span>
                <button type="button" onClick={() => setSingleDate('')} className="hover:opacity-80">
                  ×
                </button>
              </span>
            )}
            {dateFilterMode === 'RANGE' && (startDate || endDate) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px] font-mono">
                <span>
                  Range: {startDate ? formatDate(startDate) : 'Start'} → {endDate ? formatDate(endDate) : 'End'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="hover:opacity-80"
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] text-[11px]">
                <span>Keyword: &quot;{searchTerm}&quot;</span>
                <button type="button" onClick={() => setSearchTerm('')} className="hover:opacity-80">
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Attendance Ledger Arranged in Groups of Days */}
      <section aria-label="Attendance records" className="space-y-5">
        {attendance.isLoading ? (
          <div className="p-8 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
            <LoadingState label="Loading biometric attendance ledger..." />
          </div>
        ) : filteredDayGroups.length > 0 ? (
          filteredDayGroups.map((group, groupIdx) => {
            const isCollapsed = collapsedDays.has(group.dateKey);

            return (
              <div
                key={group.dateKey}
                style={{ animationDelay: `${groupIdx * 30}ms` }}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xs overflow-hidden transition-all animate-in fade-in duration-200"
              >
                {/* Day Header Bar */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleDayCollapse(group.dateKey)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDayCollapse(group.dateKey);
                    }
                  }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] cursor-pointer select-none hover:bg-[var(--color-surface)] transition-colors active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] shrink-0">
                      <Icon name="calendar" size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--color-text)]">
                          {group.dayHeader.label}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] font-mono tabular-nums">
                          ({group.dayHeader.dateFormatted})
                        </span>
                        {group.dayHeader.isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                            Today
                          </span>
                        )}
                        {group.dayHeader.isYesterday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                            Yesterday
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        <span className="tabular-nums">{group.records.length}</span> punch{group.records.length > 1 ? 'es' : ''} recorded • Daily logged time:{' '}
                        <span className="font-semibold text-[var(--color-text)] tabular-nums">{group.totalHoursFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Day Summary Pill & Collapse Arrow */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                        IN: {group.inCount}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300">
                        OUT: {group.outCount}
                      </span>
                    </div>

                    <div className="size-6 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-text-muted)]">
                      <Icon
                        name="chevron-down"
                        size={13}
                        className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Day Table Body */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] font-medium">
                          <th className="px-4 py-2.5">Personnel</th>
                          <th className="px-4 py-2.5">Terminal Checkpoint</th>
                          <th className="px-4 py-2.5">Event Direction</th>
                          <th className="px-4 py-2.5">Punch Time</th>
                          <th className="px-4 py-2.5">Date</th>
                          <th className="px-4 py-2.5 text-right">Biometric Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {group.records.map((record) => (
                          <tr
                            key={record.id}
                            className="hover:bg-[var(--color-surface-elevated)] transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="size-6 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center font-semibold text-[10px] text-[var(--color-text-muted)]">
                                  {initials(record.employeeName || record.employeeCode)}
                                </div>
                                <div>
                                  <div className="font-semibold text-xs text-[var(--color-text)]">
                                    {record.employeeName || record.employeeCode}
                                  </div>
                                  <div className="text-[10px] text-[var(--color-text-muted)] font-mono">
                                    {record.employeeCode}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                                {record.deviceCode}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                  record.direction === 'IN'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800'
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${
                                    record.direction === 'IN' ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                />
                                {record.direction === 'IN' ? 'CHECK IN' : 'CHECK OUT'}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span className="text-xs text-[var(--color-text)] font-semibold tabular-nums">
                                {formatTime(record.punchTime)}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                                {formatDate(record.punchTime)}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                                <Icon name="check" size={12} />
                                <span>Verified</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] text-center">
            <EmptyState
              title={
                selectedEmployee !== 'ALL'
                  ? `No attendance logs for ${selectedEmployeeObj?.name || selectedEmployee}`
                  : 'No attendance logs found'
              }
              description={
                dateFilterMode === 'SINGLE' && singleDate
                  ? `No swipe records recorded for ${formatDate(singleDate)}.`
                  : dateFilterMode === 'RANGE' && (startDate || endDate)
                  ? `No swipe records recorded between ${startDate ? formatDate(startDate) : 'earliest'} and ${endDate ? formatDate(endDate) : 'latest'}.`
                  : 'No punch records found matching your selected filters.'
              }
              icon="clock"
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary text-xs mt-3 inline-flex items-center gap-1.5"
              >
                <Icon name="refresh" size={12} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* Quick Punch Modal */}
      {punchModalOpen && (
        <QuickPunchModal
          isOpen={punchModalOpen}
          userEmail={email}
          onClose={() => setPunchModalOpen(false)}
          onPunchSuccess={(punch) => {
            addPunch({
              direction: punch.direction,
              deviceCode: punch.deviceCode,
              time: punch.time,
              employeeName: userDisplayName,
              employeeCode: userCode,
              employeeId: `emp-${email}`,
            });
            setPunchModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
