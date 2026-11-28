import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/(auth)/login/page';
import { renderWithProviders } from '@/test/harness';
import { BRANDING } from '@/lib/branding';
import { authApi } from '@/lib/api';

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

describe('LoginPage - Security, Validation & Layout', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockSearchParams = new URLSearchParams();
    vi.restoreAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('renders the organization visual identity, login CTA, and legal links', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('region', { name: /institution showcase/i })).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(BRANDING.name, 'i')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Intelligent Workforce Operations/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Birla Institute of Technology Emblem/i)).toHaveAttribute('src', BRANDING.logoUrl);

    expect(screen.getByRole('region', { name: /user authentication login section/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sign In to Portal/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: /Terms & Conditions/i })).toHaveAttribute('href', '/terms');
  });

  it('validates empty fields before submitting', async () => {
    const user = userEvent.setup();
    const loginSpy = vi.spyOn(authApi, 'login');
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /Sign In to Dashboard/i }));

    expect(screen.getByText(/Please enter your institutional email or username/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter your password/i)).toBeInTheDocument();
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('blocks automated submissions when honeypot field is filled', async () => {
    const user = userEvent.setup();
    const loginSpy = vi.spyOn(authApi, 'login');
    renderWithProviders(<LoginPage />);

    const honeypot = document.getElementById('company-website') as HTMLInputElement;
    await user.type(honeypot, 'https://spam-bot.example');
    await user.click(screen.getByRole('button', { name: /Sign In to Dashboard/i }));

    expect(screen.getByText(/Automated submission blocked/i)).toBeInTheDocument();
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('submits valid credentials and redirects to dashboard', async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, 'login').mockResolvedValue({
      accessToken: 'jwt-access-token',
      accessTokenExpiresAt: new Date(Date.now() + 3600_000).toISOString(),
      refreshToken: 'jwt-refresh-token',
      refreshTokenExpiresAt: new Date(Date.now() + 86400_000).toISOString(),
      email: 'faculty@bitmesra.ac.in',
      roles: ['EMPLOYEE'],
    });

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Username or Email/i), 'faculty@bitmesra.ac.in');
    await user.type(screen.getByLabelText(/^Password/i), 'SecurePass123');
    await user.click(screen.getByRole('button', { name: /Sign In to Dashboard/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('renders session expired warning when expired parameter is present', () => {
    mockSearchParams = new URLSearchParams('expired=true');
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/Your session has expired/i)).toBeInTheDocument();
  });
});
