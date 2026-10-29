import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeavePage from '@/app/(dashboard)/leave/page';
import { leaveApi } from '@/lib/api';
import { renderWithProviders } from '@/test/harness';
import type { LeaveRequest } from '@/lib/types';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/api', () => ({
  leaveApi: { list: vi.fn(), submit: vi.fn(), decide: vi.fn() },
}));

const PENDING: LeaveRequest = {
  id: 'leave-1',
  employeeId: 'emp-1',
  employeeCode: 'EMP001',
  startDate: '2026-11-02',
  endDate: '2026-11-06',
  reason: 'Annual leave',
  status: 'PENDING',
  reviewedAt: null,
};

const APPROVED: LeaveRequest = {
  ...PENDING,
  id: 'leave-2',
  employeeCode: 'EMP002',
  reason: 'Medical appointment',
  status: 'APPROVED',
  reviewedAt: '2026-10-20T09:30:00Z',
};

const listMock = vi.mocked(leaveApi.list);
const decideMock = vi.mocked(leaveApi.decide);

beforeEach(() => {
  listMock.mockResolvedValue([PENDING, APPROVED]);
  decideMock.mockResolvedValue({ ...PENDING, status: 'APPROVED', reviewedAt: '2026-10-29T10:00:00Z' });
});

describe('LeavePage (ADMIN/HR reviewer)', () => {
  it('renders the leave list from the API', async () => {
    renderWithProviders(<LeavePage />, { roles: ['ADMIN'] });
    expect(await screen.findByText('Annual leave')).toBeInTheDocument();
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it('offers review actions only for pending requests', async () => {
    renderWithProviders(<LeavePage />, { roles: ['HR'] });
    await screen.findByText('Annual leave');
    const approveButtons = screen.getAllByRole('button', { name: 'Approve' });
    const rejectButtons = screen.getAllByRole('button', { name: 'Reject' });
    // Two rows total but only one is PENDING.
    expect(approveButtons).toHaveLength(1);
    expect(rejectButtons).toHaveLength(1);
    // The already-reviewed row has no actions (its dash is labelled for
    // screen readers).
    expect(screen.getByLabelText('Already reviewed')).toBeInTheDocument();
  });

  it('records an approval against the request id', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeavePage />, { roles: ['ADMIN'] });
    await screen.findByText('Annual leave');

    await user.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => expect(decideMock).toHaveBeenCalledWith('leave-1', { status: 'APPROVED' }));
    // The list is refetched so the pill and Reviewed column update.
    await waitFor(() => expect(listMock.mock.calls.length).toBeGreaterThan(1));
  });

  it('records a rejection with status REJECTED', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeavePage />, { roles: ['ADMIN'] });
    await screen.findByText('Annual leave');

    await user.click(screen.getByRole('button', { name: 'Reject' }));

    await waitFor(() => expect(decideMock).toHaveBeenCalledWith('leave-1', { status: 'REJECTED' }));
  });

  it('surfaces the backend message when a decision is refused', async () => {
    const user = userEvent.setup();
    // The backend answers 409 when a request has already been reviewed.
    decideMock.mockRejectedValueOnce({
      isAxiosError: true,
      config: {},
      response: { status: 409, data: { detail: 'Leave request has already been reviewed' } },
      message: 'Request failed with status code 409',
    });

    renderWithProviders(<LeavePage />, { roles: ['ADMIN'] });
    await screen.findByText('Annual leave');
    await user.click(screen.getByRole('button', { name: 'Approve' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Leave request has already been reviewed');
  });

  it('offers the submit dialog to reviewers', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeavePage />, { roles: ['ADMIN'] });
    await user.click(await screen.findByRole('button', { name: /new request/i }));
    expect(screen.getByRole('dialog', { name: 'New leave request' })).toBeInTheDocument();
  });
});

describe('LeavePage (EMPLOYEE)', () => {
  it('never exposes review actions', async () => {
    renderWithProviders(<LeavePage />, { roles: ['EMPLOYEE'] });
    await screen.findByText('Annual leave');
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument();
    // No directory links either — EMPLOYEE cannot open /employees/{id}.
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('explains that the list is scoped to the signed-in employee', async () => {
    renderWithProviders(<LeavePage />, { roles: ['EMPLOYEE'] });
    expect(await screen.findByText(/viewing your own leave requests/i)).toBeInTheDocument();
  });

  it('still allows submitting a leave request (leave:write)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeavePage />, { roles: ['EMPLOYEE'] });
    const button = await screen.findByRole('button', { name: /new request/i });
    await user.click(button);
    expect(screen.getByRole('dialog', { name: 'New leave request' })).toBeInTheDocument();
  });
});
