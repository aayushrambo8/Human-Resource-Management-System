'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-provider';
import { initials } from '@/lib/format';
import { Icon, type IconName } from '@/components/ui/Icon';
import { BRANDING } from '@/lib/branding';

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: string;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Workforce Core',
    items: [
      { href: '/', label: 'Overview', icon: 'grid' },
      { href: '/employees', label: 'People Directory', icon: 'users', roles: ['ADMIN', 'HR'] },
      { href: '/departments', label: 'Departments', icon: 'building', roles: ['ADMIN', 'HR'] },
    ],
  },
  {
    title: 'Time & Operations',
    items: [
      { href: '/attendance', label: 'Time Tracking', icon: 'clock', roles: ['ADMIN', 'HR'] },
      { href: '/biometric', label: 'Biometric Access', icon: 'fingerprint', roles: ['ADMIN', 'HR'] },
      { href: '/leave', label: 'Leave & Time Off', icon: 'calendar', badge: 'Active' },
    ],
  },
  {
    title: 'Personalization & System',
    items: [
      { href: '/settings/appearance', label: 'Appearance Studio', icon: 'sparkles' },
      { href: '/settings', label: 'Configuration', icon: 'settings' },
    ],
  },
];

const PAGE_METADATA: Record<string, { title: string; category: string; description?: string }> = {
  '/': { title: 'Executive Overview', category: 'Workforce Core', description: 'Real-time workforce intelligence and attendance tracking' },
  '/employees': { title: 'People Directory', category: 'Workforce Core', description: 'Enterprise employee records and organizational assignments' },
  '/employees/new': { title: 'Onboard Employee', category: 'Workforce Core', description: 'Register new personnel into the institutional directory' },
  '/attendance': { title: 'Time Tracking', category: 'Time & Operations', description: 'Daily attendance logs, check-ins, and timesheet records' },
  '/leave': { title: 'Leave & Time Off', category: 'Time & Operations', description: 'Review, approve, and schedule institutional leave requests' },
  '/departments': { title: 'Departments', category: 'Workforce Core', description: 'Divisions, organizational units, and departmental hierarchies' },
  '/biometric': { title: 'Biometric Access', category: 'Time & Operations', description: 'Hardware terminal telemetry and biometric access checkpoints' },
  '/settings/appearance': { title: 'Appearance & Themes', category: 'Personalization', description: 'Artistic backgrounds, bespoke accents, and workspace geometry' },
  '/settings': { title: 'Configuration', category: 'Administration', description: 'System health, identity provisioning, and access controls' },
};

function getPageMeta(pathname: string) {
  if (pathname === '/employees/new') return PAGE_METADATA['/employees/new'];
  if (pathname.startsWith('/employees/')) return { title: 'Employee Profile', category: 'Workforce Core', description: 'Personnel records and employment lifecycle' };
  return PAGE_METADATA[pathname] ?? { title: 'Dashboard', category: 'Workforce' };
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ThemeModeToggle() {
  const { preferences, setMode, resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';

  return (
    <button
      className="icon-button"
      onClick={() => setMode(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={15} />
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { email, roles, isAuthenticated, logout } = useAuth();
  const { preferences } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
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

  if (!isAuthenticated) {
    return <div style={{ minHeight: '100vh', background: 'var(--color-canvas)' }} />;
  }

  const userInitials = initials(email.split('@')[0] || 'U');
  const roleLabel = roles.join(' · ') || 'Authorized';
  const meta = getPageMeta(pathname);

  return (
    <div className="relative min-h-screen">
      {/* 1. Abstract Background Art Canvas (Visible through all outer margins & spaces) */}
      <div className="abstract-bg-canvas" aria-hidden="true" />

      {/* 2. Outer Floating Workspace Frame */}
      <div className="workspace-frame">
        {/* Mobile Scrim */}
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity lg:hidden"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Master Floating Workspace Shell */}
        <div className="floating-workspace-shell">
          {/* Floating Sidebar */}
          <aside
            className={`floating-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}
          >
            {/* Brand Header */}
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-[var(--color-border)]">
              <Link href="/" className="flex items-center gap-2.5 min-w-0" aria-label={`${BRANDING.shortName} HRMS`}>
                <div className="brand-mark">{BRANDING.markLetter}</div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[var(--color-text)] truncate">{BRANDING.name}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{BRANDING.division}</span>
                  </div>
                )}
              </Link>
              <button
                type="button"
                className="icon-button hidden lg:inline-grid text-[var(--color-text-muted)]"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label="Toggle sidebar collapse"
              >
                <Icon name={sidebarCollapsed ? 'chevron' : 'back'} size={14} />
              </button>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 overflow-y-auto space-y-4 pr-0.5" aria-label="Main navigation">
              {NAV_SECTIONS.map((section) => {
                const visibleItems = section.items.filter(
                  (item) => !item.roles || item.roles.some((role) => roles.includes(role))
                );
                if (visibleItems.length === 0) return null;

                return (
                  <div key={section.title} className="space-y-1">
                    {!sidebarCollapsed && (
                      <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] opacity-70">
                        {section.title}
                      </div>
                    )}
                    <div className="space-y-1">
                      {visibleItems.map((item) => {
                        const active = isActivePath(pathname, item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`floating-nav-item ${active ? 'active' : ''}`}
                            aria-current={active ? 'page' : undefined}
                            title={sidebarCollapsed ? item.label : undefined}
                          >
                            <Icon name={item.icon} size={16} />
                            {!sidebarCollapsed && (
                              <div className="flex items-center justify-between flex-1 min-w-0">
                                <span className="truncate">{item.label}</span>
                                {item.badge && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Footer Profile */}
            <div className="pt-3 mt-auto border-t border-[var(--color-border)]">
              <div
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--color-canvas-secondary)] cursor-pointer transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                role="button"
                tabIndex={0}
                aria-label="User account details"
              >
                <div className="size-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {userInitials}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <strong className="text-xs font-semibold text-[var(--color-text)] truncate">{email}</strong>
                    <span className="text-[10px] text-[var(--color-text-muted)] truncate">{roleLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Floating Main Column (Topbar + Content Panel) */}
          <div className="floating-main-area">
            {/* Floating Topbar */}
            <header className="floating-topbar">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--color-text-muted)] font-medium">{meta.category}</span>
                  <span className="text-[var(--color-border)]">/</span>
                  <span className="text-[var(--color-text)] font-semibold">{meta.title}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative hidden md:flex items-center">
                  <span className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none">
                    <Icon name="search" size={13} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search people, teams, records..."
                    className="h-8 pl-8 pr-3 text-xs rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-1 focus:ring-[var(--color-primary)] w-56 transition-all"
                  />
                </div>

                {/* Appearance studio link */}
                <Link
                  href="/settings/appearance"
                  className="icon-button"
                  title="Open Appearance Studio"
                  aria-label="Appearance Studio"
                >
                  <Icon name="sparkles" size={15} />
                </Link>

                <ThemeModeToggle />

                {/* Notifications */}
                <button
                  type="button"
                  className="icon-button relative"
                  aria-label="Activity alerts"
                  title="Activity alerts"
                >
                  <Icon name="bell" size={15} />
                  <span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--color-surface)]" />
                </button>

                {/* Account Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    className="icon-button font-bold text-xs border border-[var(--color-border)]"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label="Account options"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    {userInitials}
                  </button>

                  {menuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-52 p-1.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                      role="menu"
                    >
                      <div className="p-2.5 border-b border-[var(--color-border)] mb-1">
                        <strong className="block text-xs font-semibold text-[var(--color-text)] truncate">{email}</strong>
                        <span className="block text-[10px] text-[var(--color-text-muted)] font-mono">{roleLabel}</span>
                      </div>
                      <Link
                        href="/settings/appearance"
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-canvas-secondary)] transition-colors"
                        role="menuitem"
                      >
                        <Icon name="sparkles" size={14} />
                        <span>Appearance Studio</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-canvas-secondary)] transition-colors"
                        role="menuitem"
                      >
                        <Icon name="settings" size={14} />
                        <span>System Settings</span>
                      </Link>
                      <button
                        role="menuitem"
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        onClick={() => {
                          setMenuOpen(false);
                          void logout();
                        }}
                      >
                        <Icon name="logout" size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Floating Workspace Content Canvas */}
            <main className="floating-workspace-content">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
