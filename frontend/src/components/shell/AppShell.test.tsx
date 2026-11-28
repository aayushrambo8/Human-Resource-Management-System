import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from '@/components/shell/AppShell';
import { renderWithProviders } from '@/test/harness';

let mockPathname = '/';

vi.mock('@/lib/theme-provider', () => ({
  useTheme: () => ({
    preferences: { mode: 'light', themeId: 'botanical' },
    resolvedMode: 'light',
    setMode: vi.fn(),
    setTheme: vi.fn(),
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('AppShell UI/UX Fixes', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('renders accessible, interactive breadcrumbs with proper semantic markup', () => {
    mockPathname = '/employees/new';
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { email: 'admin@northstar.edu', roles: ['ADMIN'] }
    );

    const breadcrumbNav = screen.getByRole('navigation', { name: /breadcrumbs/i });
    expect(breadcrumbNav).toBeInTheDocument();
    expect(within(breadcrumbNav).getByText('Onboard Employee')).toHaveAttribute('aria-current', 'page');
    expect(within(breadcrumbNav).getByRole('link', { name: /people directory/i })).toHaveAttribute('href', '/employees');
  });

  it('renders user profile on top in a pill shape and opens menu', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { email: 'sarah.connor@northstar.edu', roles: ['HR'] }
    );

    const userPill = screen.getByRole('button', { name: /account menu for sarah\.connor@northstar\.edu/i });
    expect(userPill).toBeInTheDocument();
    expect(screen.getByText('sarah.connor')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();

    await user.click(userPill);
    expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /employee profile/i })).toBeInTheDocument();
  });

  it('toggles interactive notifications popover and marks notifications read', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { email: 'admin@northstar.edu', roles: ['ADMIN'] }
    );

    const notifBtn = screen.getByRole('button', { name: /activity alerts/i });
    await user.click(notifBtn);

    expect(screen.getByRole('dialog', { name: /notifications panel/i })).toBeInTheDocument();
    expect(screen.getByText(/Punch Log Recorded/i)).toBeInTheDocument();

    const markAllBtn = screen.getByRole('button', { name: /mark all read/i });
    await user.click(markAllBtn);
    expect(screen.queryByText(/new/i)).not.toBeInTheDocument();
  });

  it('does not highlight Configuration when Appearance Studio is active', () => {
    mockPathname = '/settings/appearance';
    renderWithProviders(
      <AppShell>
        <div>Content</div>
      </AppShell>,
      { email: 'admin@northstar.edu', roles: ['ADMIN'] }
    );

    const mainNav = screen.getByRole('navigation', { name: /main navigation/i });
    const appearanceLink = within(mainNav).getByRole('link', { name: /appearance studio/i });
    const configLink = within(mainNav).getByRole('link', { name: /configuration/i });

    expect(appearanceLink).toHaveClass('active');
    expect(configLink).not.toHaveClass('active');
  });
});
