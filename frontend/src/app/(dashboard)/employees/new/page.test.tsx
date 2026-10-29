import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewEmployeePage from '@/app/(dashboard)/employees/new/page';
import { departmentApi, employeeApi } from '@/lib/api';
import { renderWithProviders } from '@/test/harness';

const { pushMock, refreshMock } = vi.hoisted(() => ({ pushMock: vi.fn(), refreshMock: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock, replace: vi.fn() }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/api', () => ({
  employeeApi: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn() },
  departmentApi: { list: vi.fn(), create: vi.fn(), update: vi.fn() },
}));

const createMock = vi.mocked(employeeApi.create);
const departmentListMock = vi.mocked(departmentApi.list);

beforeEach(() => {
  pushMock.mockReset();
  refreshMock.mockReset();
  createMock.mockReset();
  departmentListMock.mockResolvedValue([
    { id: 'dep-1', companyId: 'co-1', companyCode: 'NSI', code: 'ENG', name: 'Engineering' },
  ]);
});

async function fillValidEmployee(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/employee code/i), 'EMP999');
  await user.type(screen.getByLabelText(/first name/i), 'Ada');
  await user.type(screen.getByLabelText(/last name/i), 'Lovelace');
}

describe('NewEmployeePage', () => {
  it('shows a restricted state instead of the form for EMPLOYEE', () => {
    renderWithProviders(<NewEmployeePage />, { roles: ['EMPLOYEE'] });
    expect(screen.getByText('Restricted to HR & Admin')).toBeInTheDocument();
    expect(screen.queryByLabelText(/employee code/i)).not.toBeInTheDocument();
    // No doomed POST is offered, matching the read gate on /employees.
    expect(createMock).not.toHaveBeenCalled();
  });

  it('presents the create form to HR', async () => {
    renderWithProviders(<NewEmployeePage />, { roles: ['HR'] });
    expect(await screen.findByLabelText(/employee code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create employee/i })).toBeInTheDocument();
  });

  it('blocks submission and focuses the first invalid field when required data is missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewEmployeePage />, { roles: ['ADMIN'] });

    await user.click(screen.getByRole('button', { name: /create employee/i }));

    expect(await screen.findByText('Employee code is required.')).toBeInTheDocument();
    expect(screen.getByText('First name is required.')).toBeInTheDocument();
    expect(screen.getByText('Last name is required.')).toBeInTheDocument();
    expect(screen.getByLabelText(/employee code/i)).toHaveFocus();
    expect(createMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid email before contacting the API', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NewEmployeePage />, { roles: ['ADMIN'] });

    await fillValidEmployee(user);
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /create employee/i }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('creates the employee with empty optionals sent as null and navigates back', async () => {
    const user = userEvent.setup();
    createMock.mockResolvedValue({
      id: 'emp-new',
      employeeCode: 'EMP999',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: null,
      phone: null,
      departmentId: null,
      departmentName: null,
      joiningDate: null,
      status: 'ACTIVE',
    });

    renderWithProviders(<NewEmployeePage />, { roles: ['ADMIN'] });
    await fillValidEmployee(user);
    await user.click(screen.getByRole('button', { name: /create employee/i }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith({
      employeeCode: 'EMP999',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: null,
      phone: null,
      departmentId: null,
      joiningDate: null,
      status: 'ACTIVE',
    });
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/employees'));
  });

  it('sends the selected department and status through', async () => {
    const user = userEvent.setup();
    createMock.mockResolvedValue({
      id: 'emp-new',
      employeeCode: 'EMP998',
      firstName: 'Grace',
      lastName: 'Hopper',
      email: null,
      phone: null,
      departmentId: 'dep-1',
      departmentName: 'Engineering',
      joiningDate: null,
      status: 'ACTIVE',
    });

    renderWithProviders(<NewEmployeePage />, { roles: ['ADMIN'] });
    await user.type(screen.getByLabelText(/employee code/i), 'EMP998');
    await user.type(screen.getByLabelText(/first name/i), 'Grace');
    await user.type(screen.getByLabelText(/last name/i), 'Hopper');
    await user.selectOptions(screen.getByLabelText(/department/i), 'dep-1');
    await user.selectOptions(screen.getByLabelText(/status/i), 'INACTIVE');
    await user.click(screen.getByRole('button', { name: /create employee/i }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ departmentId: 'dep-1', status: 'INACTIVE' }),
    );
  });

  it('shows the backend error when the create is rejected', async () => {
    const user = userEvent.setup();
    createMock.mockRejectedValue({
      isAxiosError: true,
      config: {},
      response: { status: 400, data: { detail: 'employeeCode already exists' } },
      message: 'Request failed with status code 400',
    });

    renderWithProviders(<NewEmployeePage />, { roles: ['ADMIN'] });
    await fillValidEmployee(user);
    await user.click(screen.getByRole('button', { name: /create employee/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('employeeCode already exists');
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('offers a way back to the directory', () => {
    renderWithProviders(<NewEmployeePage />, { roles: ['ADMIN'] });
    expect(screen.getByRole('link', { name: /back to directory/i })).toHaveAttribute('href', '/employees');
  });
});
