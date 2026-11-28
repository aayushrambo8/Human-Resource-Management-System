import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/app/(dashboard)/page';
import { attendanceApi, departmentApi, employeeApi, healthApi, leaveApi } from '@/lib/api';
import { renderWithProviders } from '@/test/harness';
import { BRANDING } from '@/lib/branding';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/api', () => ({
  healthApi: { get: vi.fn() },
  employeeApi: { list: vi.fn() },
  departmentApi: { list: vi.fn() },
  attendanceApi: { list: vi.fn(), punch: vi.fn().mockResolvedValue({}) },
  leaveApi: { list: vi.fn(), decide: vi.fn() },
}));

const mockEmployees = [
  {
    id: 'emp-1',
    employeeCode: 'EMP-01',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena@northstar.edu',
    phone: '555-0101',
    departmentId: 'dept-1',
    departmentName: 'Engineering',
    joiningDate: '2026-10-15',
    status: 'ACTIVE',
  },
];

const mockDepartments = [
  { id: 'dept-1', companyId: 'c1', companyCode: 'NST', code: 'ENG', name: 'Engineering' },
];

const mockAttendance = {
  content: [
    {
      id: 'att-1',
      employeeId: 'emp-1',
      employeeCode: 'EMP-01',
      employeeName: 'Elena Rostova',
      deviceCode: 'BIO-GATE-A',
      punchTime: new Date().toISOString(),
      direction: 'IN',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
};

const mockLeaves = [
  {
    id: 'leave-1',
    employeeId: 'emp-1',
    employeeCode: 'EMP-01',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    reason: 'Research Symposium',
    status: 'PENDING',
    reviewedAt: null,
  },
];

beforeEach(() => {
  vi.mocked(healthApi.get).mockResolvedValue({ status: 'UP', product: 'HRMS', timestamp: new Date().toISOString() });
  vi.mocked(employeeApi.list).mockResolvedValue(mockEmployees);
  vi.mocked(departmentApi.list).mockResolvedValue(mockDepartments);
  vi.mocked(attendanceApi.list).mockResolvedValue(mockAttendance);
  vi.mocked(leaveApi.list).mockResolvedValue(mockLeaves);
  vi.mocked(leaveApi.decide).mockResolvedValue({ ...mockLeaves[0], status: 'APPROVED', reviewedAt: new Date().toISOString() });
});

describe('DashboardPage - Timesheet & Attendance Tracker UI', () => {
  it('renders the central branding, timesheet stopwatch, and metrics row', async () => {
    renderWithProviders(<DashboardPage />, { email: 'admin@northstar.edu', roles: ['ADMIN'] });

    expect(await screen.findByText(/Daily Attendance Stopwatch/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Working Hours/i)).toBeInTheDocument();
    expect(screen.getByText(/On-Time Arrival Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Today's Attendance & Timesheet Log/i)).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(BRANDING.name, 'i')).length).toBeGreaterThanOrEqual(1);
  });

  it('toggles check-in and break on the live stopwatch', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { email: 'admin@northstar.edu', roles: ['ADMIN'] });

    const clockOutBtn = await screen.findByRole('button', { name: /Clock Out/i });
    await user.click(clockOutBtn);

    expect(await screen.findByRole('button', { name: /Clock In/i })).toBeInTheDocument();
  });

  it('triggers quick punch modal and records attendance', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { email: 'admin@northstar.edu', roles: ['ADMIN'] });

    const punchBtn = await screen.findByRole('button', { name: /Biometric Check-In/i });
    await user.click(punchBtn);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /Confirm Attendance/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Successfully logged/i)).toBeInTheDocument();
    });
  });

  it('approves a pending leave request directly from the timesheet leave queue', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { email: 'admin@northstar.edu', roles: ['ADMIN'] });

    await screen.findByText('Research Symposium');
    const approveBtn = screen.getByRole('button', { name: /Approve leave for EMP-01/i });
    await user.click(approveBtn);

    await waitFor(() => {
      expect(leaveApi.decide).toHaveBeenCalledWith('leave-1', { status: 'APPROVED' });
    });
  });

  it('isolates attendance data so an employee only sees their own attendance log', async () => {
    renderWithProviders(<DashboardPage />, { email: 'user@northstar.edu', roles: ['EMPLOYEE'] });

    // The heading reflects personal ledger
    expect(await screen.findByText(/Today's Attendance & Timesheet Log/i)).toBeInTheDocument();
    expect(screen.getByText(/My Shift Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Today Hours Logged/i)).toBeInTheDocument();

    // The attendance table contains the employee's record and never other employees
    const attendanceTable = screen.getByRole('table');
    expect(within(attendanceTable).getByText(/User/i)).toBeInTheDocument();
    expect(within(attendanceTable).queryByText(/Elena Rostova/i)).not.toBeInTheDocument();
    expect(within(attendanceTable).queryByText(/Marcus Vance/i)).not.toBeInTheDocument();
    expect(within(attendanceTable).queryByText(/Sophia Chen/i)).not.toBeInTheDocument();
  });
});
