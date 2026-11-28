'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { gates } from '@/lib/permissions';
import { ROLE_CODES } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { AccountForm } from '@/components/forms/AccountForm';

export default function SettingsPage() {
  const { roles } = useAuth();
  const canCreateAccounts = gates.canCreateAccounts(roles);
  const health = useQuery({ queryKey: ['health'], queryFn: healthApi.get, retry: false });
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-faint)]">
              Administration
            </span>
            <span className="text-[var(--text-faint)]">/</span>
            <span className="text-xs text-[var(--text-muted)]">Configuration & Auth</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
            System Settings & Security
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Provisioning */}
        {canCreateAccounts && (
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="size-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text)]">
                <Icon name="shield" size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--text)]">User Account Provisioning</h2>
                <p className="text-xs text-[var(--text-muted)]">Manage authorized credentials and RBAC assignments</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)]">Authority Level:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">account:write (Admin)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)]">Available Roles:</span>
                <span className="font-mono text-[11px] text-[var(--text)]">{ROLE_CODES.join(' · ')}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary text-xs w-full"
              onClick={() => setAccountOpen(true)}
            >
              <Icon name="plus" size={14} />
              <span>Provision New User Account</span>
            </button>
          </div>
        )}

        {/* Infrastructure & Telemetry Health */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-subtle)]">
            <div className="size-9 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--text)]">
              <Icon name="server" size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text)]">Infrastructure Telemetry</h2>
              <p className="text-xs text-[var(--text-muted)]">Microservice runtime and database connectivity</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)]">Backend Core:</span>
              <span className="font-mono text-[11px] text-[var(--text)]">Spring Boot 4.1.1 / Java 25</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)]">Database Engine:</span>
              <span className="font-mono text-[11px] text-[var(--text)]">PostgreSQL (Flyway V1–V4)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)]">Service Health:</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                {health.data?.status ?? 'OPERATIONAL (ONLINE)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {accountOpen && (
        <Modal title="Provision New Enterprise Account" open={accountOpen} onClose={() => setAccountOpen(false)}>
          <AccountForm onCancel={() => setAccountOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
