import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/(auth)/login/page';
import { renderWithProviders } from '@/test/harness';
import { BRANDING } from '@/lib/branding';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: mockRefresh,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/login',
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('LoginPage - Split Screen Layout & Form Box', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockSearchParams = new URLSearchParams();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('renders the organization visual identity on the left and login box on the right', () => {
    renderWithProviders(<LoginPage />);

    // Left section: Organization visual presentation
    expect(screen.getByRole('region', { name: /institution showcase/i })).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(BRANDING.name, 'i')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(new RegExp(BRANDING.tagline, 'i'))).toBeInTheDocument();
    expect(screen.getByAltText(/Birla Institute of Technology Emblem/i)).toHaveAttribute('src', BRANDING.logoUrl);
    expect(screen.getByText(/Biometric Telemetry/i)).toBeInTheDocument();

    // Right section: Dedicated Login Page & Login Box
    expect(screen.getByRole('region', { name: /user authentication login section/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sign In to Portal/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Dashboard/i })).toBeInTheDocument();
  });

  it('allows filling credentials and submitting the form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const usernameInput = screen.getByLabelText(/Username or Email/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });

    await user.type(usernameInput, 'admin@northstar.edu');
    await user.type(passwordInput, 'Admin@123');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('provides quick demo credential autofill buttons for Admin, HR, and User', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const usernameInput = screen.getByLabelText(/Username or Email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^Password/i) as HTMLInputElement;

    // 1. Admin autofill
    const adminDemoBtn = screen.getByRole('button', { name: /Fill Admin/i });
    await user.click(adminDemoBtn);
    expect(usernameInput.value).toBe('admin@northstar.edu');
    expect(passwordInput.value).toBe('Admin@123');

    // 2. HR autofill
    const hrDemoBtn = screen.getByRole('button', { name: /Fill HR/i });
    await user.click(hrDemoBtn);
    expect(usernameInput.value).toBe('hr@northstar.edu');
    expect(passwordInput.value).toBe('Hr@123');

    // 3. User autofill
    const userDemoBtn = screen.getByRole('button', { name: /Fill User/i });
    await user.click(userDemoBtn);
    expect(usernameInput.value).toBe('user@northstar.edu');
    expect(passwordInput.value).toBe('User@123');
  });

  it('renders session expired warning when expired parameter is present', () => {
    mockSearchParams = new URLSearchParams('expired=true');
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/Your session has expired/i)).toBeInTheDocument();
  });
});

