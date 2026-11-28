import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AttendancePage from '@/app/(dashboard)/attendance/page';
import { attendanceApi, employeeApi } from '@/lib/api';
import { renderWithProviders } from '@/test/harness';

vi.mock('@/lib/api', () => ({
  attendanceApi: {
    list: vi.fn(),
  },
  employeeApi: {
    list: vi.fn(),
  },
}));

describe('AttendancePage - Role-Based Attendance Ledger Arranged in Groups of Days', () => {
  beforeEach(() => {
    vi.mocked(attendanceApi.list).mockResolvedValue({
      content: [
        {
          id: 'att-admin-01',
          employeeId: 'emp-01',
          employeeCode: 'EMP-01',
          employeeName: 'Elena Rostova',
          deviceCode: 'GATE-01-TURNSTILE',
          punchTime: new Date().toISOString(),
          direction: 'IN',
        },
        {
          id: 'att-admin-02',
          employeeId: 'emp-02',
          employeeCode: 'HR-02',
          employeeName: 'Marcus Vance',
          deviceCode: 'GATE-02-LOBBY',
          punchTime: new Date().toISOString(),
          direction: 'IN',
        },
        {
          id: 'att-admin-03',
          employeeId: 'emp-01',
          employeeCode: 'EMP-01',
          employeeName: 'Elena Rostova',
          deviceCode: 'GATE-01-TURNSTILE',
          punchTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          direction: 'IN',
        },
      ],
      page: 0,
      size: 50,
      totalElements: 3,
      totalPages: 1,
    });

    vi.mocked(employeeApi.list).mockResolvedValue([
      {
        id: 'emp-01',
        employeeCode: 'EMP-01',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena@northstar.edu',
        phone: null,
        departmentId: null,
        departmentName: 'Engineering',
        joiningDate: '2026-01-01',
        status: 'ACTIVE',
      },
      {
        id: 'emp-02',
        employeeCode: 'HR-02',
        firstName: 'Marcus',
        lastName: 'Vance',
        email: 'marcus@northstar.edu',
        phone: null,
        departmentId: null,
        departmentName: 'Human Resources',
        joiningDate: '2026-01-01',
        status: 'ACTIVE',
      },
    ]);
  });

  it('renders institutional attendance ledger with all personnel for HR/Admin', async () => {
    renderWithProviders(<AttendancePage />, { email: 'admin@northstar.edu', roles: ['ADMIN'] });

    expect(await screen.findByRole('heading', { level: 1, name: /Attendance Ledger/i })).toBeInTheDocument();
    expect(screen.getByText(/Recorded Days/i)).toBeInTheDocument();

    const tables = await screen.findAllByRole('table');
    const tableText = tables.map((t) => t.textContent).join(' ');
    expect(tableText).toContain('Elena Rostova');
    expect(tableText).toContain('Marcus Vance');
  });

  it('strictly isolates attendance for regular employees to their own punches only', async () => {
    renderWithProviders(<AttendancePage />, { email: 'user@northstar.edu', roles: ['EMPLOYEE'] });

    expect(await screen.findByRole('heading', { level: 1, name: /My Attendance Ledger/i })).toBeInTheDocument();
    expect(screen.getByText(/Timesheet Days/i)).toBeInTheDocument();

    const tables = await screen.findAllByRole('table');
    expect(tables.length).toBeGreaterThanOrEqual(1);

    // Verify all rendered tables across all days only belong to the employee
    for (const table of tables) {
      expect(within(table).queryByText(/Elena Rostova/i)).not.toBeInTheDocument();
      expect(within(table).queryByText(/Marcus Vance/i)).not.toBeInTheDocument();
    }
    expect(screen.getAllByText(/User/i).length).toBeGreaterThanOrEqual(1);
  });

  it('arranges timesheet records into groups of days with day headers and hours summary', async () => {
    renderWithProviders(<AttendancePage />, { email: 'user@northstar.edu', roles: ['EMPLOYEE'] });

    // Day groups like Today and Yesterday are prominently displayed across headers, badges, and filters
    const todayElements = await screen.findAllByText(/^Today$/i);
    expect(todayElements.length).toBeGreaterThanOrEqual(1);

    const yesterdayElements = screen.getAllByText(/^Yesterday$/i);
    expect(yesterdayElements.length).toBeGreaterThanOrEqual(1);

    // Filter controls for day groups
    expect(screen.getByRole('button', { name: /^All Days/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Today$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Yesterday$/i })).toBeInTheDocument();
  });

  it('allows HR to search or select one specific employee and view only their attendance', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AttendancePage />, { email: 'hr@northstar.edu', roles: ['HR'] });

    await screen.findByRole('heading', { level: 1, name: /Attendance Ledger/i });

    // HR can select Elena Rostova from the employee dropdown
    const employeeSelect = screen.getByLabelText(/Filter by employee/i);
    await user.selectOptions(employeeSelect, 'EMP-01');

    // Only Elena's punches should remain; Marcus Vance must not be present
    const tables = screen.getAllByRole('table');
    const tableText = tables.map((t) => t.textContent).join(' ');
    expect(tableText).toContain('Elena Rostova');
    expect(tableText).not.toContain('Marcus Vance');

    // Active filter badge appears
    expect(screen.getByText(/Employee: Elena Rostova/i)).toBeInTheDocument();
  });

  it('allows HR to filter for one specific day or a date range and resets cleanly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AttendancePage />, { email: 'hr@northstar.edu', roles: ['HR'] });

    await screen.findByRole('heading', { level: 1, name: /Attendance Ledger/i });

    // Switch to Single Day mode
    const singleDayBtn = screen.getByRole('button', { name: /^Single Day$/i });
    await user.click(singleDayBtn);

    const singleDateInput = screen.getByLabelText(/Select single date/i);
    const todayStr = new Date().toISOString().slice(0, 10);
    await user.clear(singleDateInput);
    await user.type(singleDateInput, todayStr);

    // Filtered to today only (1 Day)
    expect(screen.getByText(/1 Days/i)).toBeInTheDocument();

    // Switch to Date Range mode
    const dateRangeBtn = screen.getByRole('button', { name: /^Date Range$/i });
    await user.click(dateRangeBtn);

    expect(screen.getByLabelText(/Start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End date/i)).toBeInTheDocument();

    // Reset filters returns to all days
    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    await user.click(resetBtn);

    expect(screen.getByText(/2 Days/i)).toBeInTheDocument();
  });
});
