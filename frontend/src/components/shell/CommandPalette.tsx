'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from '@/lib/motion';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-provider';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Actions' | 'Preferences';
  icon: IconName;
  href?: string;
  action?: () => void;
  roles?: string[];
}

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { roles, logout } = useAuth();
  const { setMode, resolvedMode } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const COMMANDS: CommandItem[] = [
    {
      id: 'nav-overview',
      title: 'Overview',
      subtitle: 'Executive workforce metrics and stopwatch',
      category: 'Navigation',
      icon: 'grid',
      href: '/',
    },
    {
      id: 'nav-employee',
      title: 'Employee Portal',
      subtitle: 'Self-service timesheet, leaves, and profile',
      category: 'Navigation',
      icon: 'user',
      href: '/employee',
    },
    {
      id: 'nav-employees',
      title: 'People Directory',
      subtitle: 'Personnel records and team directory',
      category: 'Navigation',
      icon: 'users',
      href: '/employees',
      roles: ['ADMIN', 'HR'],
    },
    {
      id: 'nav-new-employee',
      title: 'Onboard New Employee',
      subtitle: 'Register new personnel into directory',
      category: 'Actions',
      icon: 'plus',
      href: '/employees/new',
      roles: ['ADMIN', 'HR'],
    },
    {
      id: 'nav-attendance',
      title: 'Attendance Ledger',
      subtitle: 'Full biometric check-in history and timesheets',
      category: 'Navigation',
      icon: 'clock',
      href: '/attendance',
    },
    {
      id: 'nav-biometric',
      title: 'Biometric Access Checkpoints',
      subtitle: 'Hardware terminal telemetry and logs',
      category: 'Navigation',
      icon: 'fingerprint',
      href: '/biometric',
      roles: ['ADMIN', 'HR'],
    },
    {
      id: 'nav-leave',
      title: 'Leave & Time Off Desk',
      subtitle: 'Request leave or review pending team requests',
      category: 'Navigation',
      icon: 'calendar',
      href: '/leave',
    },
    {
      id: 'nav-departments',
      title: 'Departments & Divisions',
      subtitle: 'Organizational hierarchy and teams',
      category: 'Navigation',
      icon: 'building',
      href: '/departments',
      roles: ['ADMIN', 'HR'],
    },
    {
      id: 'nav-appearance',
      title: 'Appearance Studio',
      subtitle: 'Bespoke themes, background intensity and accents',
      category: 'Preferences',
      icon: 'sparkles',
      href: '/settings/appearance',
    },
    {
      id: 'nav-branding',
      title: 'Branding & Assets',
      subtitle: 'Institutional identity, logo and mark',
      category: 'Preferences',
      icon: 'building',
      href: '/settings/branding',
    },
    {
      id: 'nav-settings',
      title: 'System Configuration',
      subtitle: 'Access controls and system health',
      category: 'Preferences',
      icon: 'settings',
      href: '/settings',
      roles: ['ADMIN'],
    },
    {
      id: 'act-toggle-theme',
      title: `Switch to ${resolvedMode === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: 'Toggle global color appearance',
      category: 'Actions',
      icon: resolvedMode === 'dark' ? 'sun' : 'moon',
      action: () => setMode(resolvedMode === 'dark' ? 'light' : 'dark'),
    },
    {
      id: 'act-logout',
      title: 'Sign Out',
      subtitle: 'End authorized session safely',
      category: 'Actions',
      icon: 'logout',
      action: () => void logout(),
    },
  ];

  // Filter commands by permissions and query
  const filteredCommands = COMMANDS.filter((cmd) => {
    if (cmd.roles && !cmd.roles.some((r) => roles.includes(r))) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const executeItem = (item: CommandItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeItem(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-xl rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-label="Quick Command Palette"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              <span className="text-[var(--color-text-muted)] shrink-0">
                <Icon name="search" size={16} />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command, page name, or destination..."
                className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                  No matching destinations found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredCommands.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white shadow-xs'
                          : 'hover:bg-[var(--color-canvas-secondary)] text-[var(--color-text)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 ${isSelected ? 'text-white' : 'text-[var(--color-text-muted)]'}`}>
                          <Icon name={item.icon} size={16} />
                        </span>
                        <div className="min-w-0">
                          <span className="block text-xs font-semibold truncate">{item.title}</span>
                          <span className={`block text-[10.5px] truncate ${isSelected ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md shrink-0 border ${
                        isSelected
                          ? 'bg-white/20 border-white/30 text-white'
                          : 'bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                      }`}>
                        {item.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-canvas)] text-[10.5px] font-mono text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <span>↑↓ Navigate</span>
                <span>•</span>
                <span>↵ Open</span>
              </div>
              <span>Jakob&apos;s Law Command Palette</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
