'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-provider';
import { initials } from '@/lib/format';
import { Icon, type IconName } from '@/components/ui/Icon';

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Roles that can read the module (mirrors backend permissions — the API enforces the truth). */
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: 'grid' },
  { href: '/employees', label: 'Employees', icon: 'users', roles: ['ADMIN', 'HR'] },
  { href: '/attendance', label: 'Attendance', icon: 'clock', roles: ['ADMIN', 'HR'] },
  { href: '/leave', label: 'Leave', icon: 'calendar' },
  { href: '/departments', label: 'Departments', icon: 'building', roles: ['ADMIN', 'HR'] },
  { href: '/biometric', label: 'Biometric Logs', icon: 'fingerprint', roles: ['ADMIN', 'HR'] },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
  '/leave': 'Leave',
  '/departments': 'Departments',
  '/biometric': 'Biometric Logs',
  '/settings': 'Settings',
};

function pageTitle(pathname: string): string {
  if (pathname.startsWith('/employees/')) return 'Employee Details';
  return PAGE_TITLES[pathname] ?? 'Dashboard';
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  if (!theme) return <span className="icon-button theme-toggle-placeholder" aria-hidden="true" />;
  const isDark = theme === 'dark';
  return (
    <button
      className="icon-button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={18} />
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { email, roles, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Client-side gate (decision 2026-10-28): children mount only after the auth
  // provider has hydrated, so `isAuthenticated` is accurate here. The Spring
  // Boot API independently enforces authentication on every request.
  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    setSidebarOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const visibleNav = NAV_ITEMS.filter((item) => !item.roles || item.roles.some((role) => roles.includes(role)));
  const userInitials = initials(email.split('@')[0] || 'U');
  const roleLabel = roles.join(' · ') || 'Signed in';

  // Client-side gate (decision 2026-10-28, hardened during Phase C): render
  // nothing while unauthenticated so protected page components never mount.
  // Without this, a cold load of a protected route painted the shell for one
  // frame and fired doomed API requests (e.g. /api/leaves) that 401'd, which
  // the axios interceptor surfaced as a misleading "session expired" prompt.
  // The redirect runs in the effect below; the Spring Boot API independently
  // enforces authentication on every request.
  if (!isAuthenticated) {
    return <div style={{ minHeight: '100vh' }} />;
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/" className="brand" aria-label="Northstar HRMS dashboard">
            <span className="brand-mark" aria-hidden="true">N</span>
            <span className="brand-name">Northstar HRMS</span>
          </Link>
          <button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {visibleNav.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? 'nav-item-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <span className="user-avatar" aria-hidden="true">{userInitials}</span>
            <div className="user-info">
              <strong>{email}</strong>
              <span>{roleLabel}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Icon name="menu" size={18} />
            </button>
            <span className="page-title">{pageTitle(pathname)}</span>
          </div>
          <div className="topbar-right">
            <ThemeToggle />
            <div className="profile-menu" ref={menuRef}>
              <button
                className="topbar-avatar"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {userInitials}
              </button>
              {menuOpen && (
                <div className="dropdown" role="menu">
                  <div className="dropdown-header">
                    <strong>{email}</strong>
                    <span>{roleLabel}</span>
                  </div>
                  <button
                    role="menuitem"
                    className="dropdown-item"
                    onClick={() => {
                      setMenuOpen(false);
                      void logout();
                    }}
                  >
                    <Icon name="logout" size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
