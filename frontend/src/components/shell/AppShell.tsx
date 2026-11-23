'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-provider';
import { initials } from '@/lib/format';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useBranding } from '@/lib/branding';
import { motion, AnimatePresence } from '@/lib/motion';
import { CommandPalette } from '@/components/shell/CommandPalette';

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
      { href: '/employee', label: 'Employee Portal', icon: 'user' },
      { href: '/employees', label: 'People Directory', icon: 'users', roles: ['ADMIN', 'HR'] },
      { href: '/departments', label: 'Departments', icon: 'building', roles: ['ADMIN', 'HR'] },
    ],
  },
  {
    title: 'Time & Operations',
    items: [
      { href: '/attendance', label: 'Attendance Ledger', icon: 'clock' },
      { href: '/biometric', label: 'Biometric Access', icon: 'fingerprint', roles: ['ADMIN', 'HR'] },
      { href: '/leave', label: 'Leave & Time Off', icon: 'calendar', badge: 'Active' },
    ],
  },
  {
    title: 'Personalization & System',
    items: [
      { href: '/settings/appearance', label: 'Appearance Studio', icon: 'sparkles' },
      { href: '/settings/branding', label: 'Branding & Assets', icon: 'building' },
      { href: '/settings', label: 'Configuration', icon: 'settings', roles: ['ADMIN'] },
    ],
  },
];

interface PageMeta {
  title: string;
  category: string;
  description?: string;
  parentHref?: string;
  parentTitle?: string;
}

const PAGE_METADATA: Record<string, PageMeta> = {
  '/': { title: 'Executive Overview', category: 'Workforce Core', description: 'Real-time workforce intelligence and attendance tracking' },
  '/employee': { title: 'Employee Portal', category: 'Self Service', description: 'Personal workspace, timesheet stopwatch, and leave desk', parentHref: '/', parentTitle: 'Overview' },
  '/employees': { title: 'People Directory', category: 'Workforce Core', description: 'Enterprise employee records and organizational assignments', parentHref: '/', parentTitle: 'Overview' },
  '/employees/new': { title: 'Onboard Employee', category: 'Workforce Core', description: 'Register new personnel into the institutional directory', parentHref: '/employees', parentTitle: 'People Directory' },
  '/attendance': { title: 'Attendance Ledger', category: 'Time & Operations', description: 'Biometric check-in logs and personal timesheet records', parentHref: '/', parentTitle: 'Overview' },
  '/leave': { title: 'Leave & Time Off', category: 'Time & Operations', description: 'Review, approve, and schedule institutional leave requests', parentHref: '/', parentTitle: 'Overview' },
  '/departments': { title: 'Departments', category: 'Workforce Core', description: 'Divisions, organizational units, and departmental hierarchies', parentHref: '/', parentTitle: 'Overview' },
  '/biometric': { title: 'Biometric Access', category: 'Time & Operations', description: 'Hardware terminal telemetry and biometric access checkpoints', parentHref: '/', parentTitle: 'Overview' },
  '/settings/appearance': { title: 'Appearance Studio', category: 'Personalization', description: 'Artistic backgrounds, bespoke accents, and workspace geometry', parentHref: '/settings', parentTitle: 'Configuration' },
  '/settings/branding': { title: 'Branding & Identity', category: 'Personalization', description: 'Institutional logo, login hero image, and organization metadata', parentHref: '/settings', parentTitle: 'Configuration' },
  '/settings': { title: 'Configuration', category: 'Administration', description: 'System health, identity provisioning, and access controls', parentHref: '/', parentTitle: 'Overview' },
};

function getPageMeta(pathname: string): PageMeta {
  if (pathname === '/employees/new') return PAGE_METADATA['/employees/new'];
  if (pathname.startsWith('/employees/')) {
    return {
      title: 'Employee Profile',
      category: 'Workforce Core',
      description: 'Personnel records and employment lifecycle',
      parentHref: '/employees',
      parentTitle: 'People Directory',
    };
  }
  return PAGE_METADATA[pathname] ?? { title: 'Dashboard', category: 'Workforce', parentHref: '/', parentTitle: 'Overview' };
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/settings') return pathname === '/settings';
  if (href === '/settings/appearance') return pathname === '/settings/appearance';
  if (href === '/settings/branding') return pathname === '/settings/branding';
  if (href === '/employee') return pathname === '/employee';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ThemeModeToggle() {
  const { setMode, resolvedMode } = useTheme();
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

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'attendance' | 'leave' | 'terminal' | 'system';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Punch Log Recorded',
    message: 'Web terminal check-in confirmed successfully.',
    time: '10m ago',
    read: false,
    type: 'attendance',
  },
  {
    id: 'notif-2',
    title: 'Leave Application Pending',
    message: 'Sophia Chen submitted annual leave request for Nov 20–23.',
    time: '1h ago',
    read: false,
    type: 'leave',
  },
  {
    id: 'notif-3',
    title: 'Hardware Biometric Checkpoint',
    message: 'Turnstile GATE-01 synced with 99.4% biometric recognition score.',
    time: '3h ago',
    read: false,
    type: 'terminal',
  },
  {
    id: 'notif-4',
    title: 'Holiday Schedule Notice',
    message: 'Institutional holiday calendar for the upcoming quarter is active.',
    time: 'Yesterday',
    read: true,
    type: 'system',
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { email, roles, isAuthenticated, logout } = useAuth();
  const { branding } = useBranding();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Jakob's Law: Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    setSidebarOpen(false);
    setMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  // Handle outside clicks for menus
  useEffect(() => {
    if (!menuOpen && !notificationsOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen, notificationsOpen]);

  if (!isAuthenticated) {
    return <div style={{ minHeight: '100vh', background: 'var(--color-canvas)' }} />;
  }

  const userInitials = initials(email.split('@')[0] || 'U');
  const roleLabel = roles.join(' · ') || 'Authorized';
  const meta = getPageMeta(pathname);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="relative min-h-screen">
      {/* 1. Abstract Background Art Canvas */}
      <div className="abstract-bg-canvas" aria-hidden="true" />

      {/* 2. Outer Floating Workspace Frame */}
      <div className="workspace-frame">
        {/* Mobile Scrim / Backdrop with Framer Motion */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden cursor-pointer"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Master Floating Workspace Shell */}
        <div className="floating-workspace-shell">
          {/* Floating Sidebar */}
          <aside
            className={`floating-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}
          >
            {/* Brand Header */}
            <div className="sidebar-header">
              <Link href="/" className="flex items-center gap-2.5 min-w-0 shrink-0" aria-label={`${branding.shortName} HRMS`}>
                <div className="size-8 rounded-lg bg-white p-1 border border-[var(--color-border)] flex items-center justify-center shrink-0 min-w-8 min-h-8 shadow-2xs">
                  <img
                    src={branding.logoUrl}
                    alt={branding.markLetter}
                    className="size-full object-contain shrink-0"
                  />
                </div>
                <div className="sidebar-text-fold flex-col min-w-0">
                  <span className="text-sm font-bold text-[var(--color-text)] truncate">{branding.name}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono truncate">{branding.division}</span>
                </div>
              </Link>
              {/* Desktop Collapse Toggle */}
              <button
                type="button"
                className="icon-button hidden lg:inline-grid text-[var(--color-text-muted)] shrink-0"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label="Toggle sidebar collapse"
              >
                <Icon name={sidebarCollapsed ? 'chevron' : 'back'} size={14} />
              </button>
              {/* Mobile Close Button */}
              <button
                type="button"
                className="icon-button lg:hidden text-[var(--color-text-muted)] shrink-0"
                onClick={() => setSidebarOpen(false)}
                title="Close sidebar navigation"
                aria-label="Close sidebar navigation"
              >
                <Icon name="close" size={14} />
              </button>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 overflow-y-auto space-y-3.5 pr-0.5" aria-label="Main navigation">
              {NAV_SECTIONS.map((section) => {
                const visibleItems = section.items.filter(
                  (item) => !item.roles || item.roles.some((role) => roles.includes(role))
                );
                if (visibleItems.length === 0) return null;

                return (
                  <div key={section.title} className="space-y-1">
                    <div className="sidebar-section-title px-2.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] opacity-70">
                      {section.title}
                    </div>
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
                            <div className="nav-icon-slot">
                              <Icon name={item.icon} size={16} />
                            </div>
                            <div className="sidebar-text-fold flex-1 min-w-0 items-center justify-between">
                              <span className="truncate">{item.label}</span>
                              {item.badge && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)] ml-2 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Floating Main Column (Topbar + Content Panel) */}
          <div className="floating-main-area">
            {/* Floating Topbar */}
            <header className="floating-topbar">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {/* Mobile Navigation Drawer Trigger */}
                <button
                  type="button"
                  className="icon-button lg:hidden text-[var(--color-text)] shrink-0 hit-slop"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar navigation menu"
                  title="Open navigation menu"
                >
                  <Icon name="menu" size={16} />
                </button>

                {/* Accessible Interactive Breadcrumb Navigation */}
                <nav aria-label="Breadcrumbs" className="flex items-center min-w-0">
                  <ol className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] min-w-0">
                    <li className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href="/"
                        className="hover:text-[var(--color-text)] transition-colors flex items-center gap-1 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] rounded-xs"
                      >
                        <Icon name="grid" size={13} className="opacity-75" />
                        <span className="hidden sm:inline">Overview</span>
                      </Link>
                    </li>
                    <li aria-hidden="true" className="text-[var(--color-border)] select-none">/</li>
                    {meta.parentHref && meta.parentTitle && meta.parentHref !== '/' && (
                      <>
                        <li className="flex items-center gap-1.5 shrink-0">
                          <Link
                            href={meta.parentHref}
                            className="hover:text-[var(--color-text)] transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] rounded-xs"
                          >
                            {meta.parentTitle}
                          </Link>
                        </li>
                        <li aria-hidden="true" className="text-[var(--color-border)] select-none">/</li>
                      </>
                    )}
                    <li className="font-semibold text-[var(--color-text)] truncate" aria-current="page">
                      {meta.title}
                    </li>
                  </ol>
                </nav>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {/* Search Bar - Jakob's Law: Cmd+K / Quick Command Palette Trigger */}
                <button
                  type="button"
                  onClick={() => setCommandPaletteOpen(true)}
                  aria-label="Open command palette (Ctrl+K)"
                  className="relative hidden md:flex items-center h-8 pl-8 pr-2.5 text-xs rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-text)] w-48 lg:w-56 transition-all text-left cursor-pointer group shadow-2xs"
                >
                  <span className="absolute left-2.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors pointer-events-none">
                    <Icon name="search" size={13} />
                  </span>
                  <span className="truncate flex-1">Quick search...</span>
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-mono font-semibold rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                    ⌘K
                  </kbd>
                </button>

                {/* Appearance Studio Link */}
                <Link
                  href="/settings/appearance"
                  className="icon-button"
                  title="Open Appearance Studio"
                  aria-label="Appearance Studio"
                >
                  <Icon name="sparkles" size={15} />
                </Link>

                <ThemeModeToggle />

                {/* Interactive Notifications Popover */}
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    className="icon-button relative hit-slop"
                    aria-label={`Activity alerts (${unreadCount} unread)`}
                    title="Activity alerts"
                    aria-expanded={notificationsOpen}
                    aria-haspopup="dialog"
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setMenuOpen(false);
                    }}
                  >
                    <Icon name="bell" size={15} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 size-2 rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--color-surface)] animate-pulse" />
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-2 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl z-50 popover-menu-tr origin-top-right"
                        role="dialog"
                        aria-label="Notifications panel"
                      >
                        <div className="flex items-center justify-between p-2.5 pb-2 border-b border-[var(--color-border)] mb-1.5">
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-bold text-[var(--color-text)]">Notifications</strong>
                            {unreadCount > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[var(--color-primary)] text-white">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllNotificationsAsRead}
                              className="text-[10.5px] font-medium text-[var(--color-primary)] hover:underline cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-1.5 p-1">
                          {notifications.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => markNotificationAsRead(item.id)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                item.read
                                  ? 'bg-[var(--color-surface)] border-transparent hover:bg-[var(--color-canvas-secondary)] opacity-75'
                                  : 'bg-[var(--color-surface-elevated)] border-[var(--color-border)] hover:border-[var(--color-primary)] shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-semibold text-[var(--color-text)] truncate">{item.title}</span>
                                <span className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">{item.time}</span>
                              </div>
                              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">{item.message}</p>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 mt-1 border-t border-[var(--color-border)] text-center">
                          <Link
                            href="/attendance"
                            className="text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors inline-flex items-center gap-1"
                          >
                            <span>View system activity ledger</span>
                            <Icon name="arrow" size={11} />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pill Shape User Profile (On Top, pill shape rather than below) */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-canvas-secondary)] transition-all cursor-pointer shadow-2xs group focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)]"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label={`Account menu for ${email}`}
                    onClick={() => {
                      setMenuOpen(!menuOpen);
                      setNotificationsOpen(false);
                    }}
                  >
                    <div className="size-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-[10.5px] shadow-xs shrink-0">
                      {userInitials}
                    </div>
                    <div className="hidden sm:flex flex-col text-left min-w-0 pr-0.5">
                      <span className="text-xs font-semibold text-[var(--color-text)] truncate max-w-[120px] leading-tight">
                        {email.split('@')[0]}
                      </span>
                      <span className="text-[9px] font-mono font-medium text-[var(--color-text-muted)] truncate leading-tight uppercase tracking-wider">
                        {roleLabel}
                      </span>
                    </div>
                    <Icon
                      name="chevron"
                      size={11}
                      className={`text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-transform duration-200 shrink-0 ${
                        menuOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl z-50 popover-menu-tr origin-top-right"
                        role="menu"
                        aria-label="User account options"
                      >
                        <div className="p-2.5 border-b border-[var(--color-border)] mb-1">
                          <strong className="block text-xs font-semibold text-[var(--color-text)] truncate">{email}</strong>
                          <span className="block text-[10px] text-[var(--color-text-muted)] font-mono">{roleLabel}</span>
                        </div>
                        <Link
                          href="/employee"
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-canvas-secondary)] transition-colors"
                          role="menuitem"
                        >
                          <Icon name="user" size={14} />
                          <span>Employee Profile</span>
                        </Link>
                        <Link
                          href="/settings/appearance"
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-canvas-secondary)] transition-colors"
                          role="menuitem"
                        >
                          <Icon name="sparkles" size={14} />
                          <span>Appearance Studio</span>
                        </Link>
                        <Link
                          href="/settings/branding"
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-canvas-secondary)] transition-colors"
                          role="menuitem"
                        >
                          <Icon name="building" size={14} />
                          <span>Branding & Assets</span>
                        </Link>
                        {roles.includes('ADMIN') && (
                          <Link
                            href="/settings"
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-canvas-secondary)] transition-colors"
                            role="menuitem"
                          >
                            <Icon name="settings" size={14} />
                            <span>System Configuration</span>
                          </Link>
                        )}
                        <button
                          role="menuitem"
                          type="button"
                          className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          onClick={() => {
                            setMenuOpen(false);
                            void logout();
                          }}
                        >
                          <Icon name="logout" size={14} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

      {/* Jakob's Law: Quick Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
