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
  // POST /api/accounts is @PreAuthorize("hasAuthority('account:write')") —
  // ADMIN only; HR and EMPLOYEE would be rejected by the backend.
  const canCreateAccounts = gates.canCreateAccounts(roles);

  const health = useQuery({ queryKey: ['health'], queryFn: healthApi.get, retry: false });
  const [accountOpen, setAccountOpen] = useState(false);

  const closeAccountDialog = () => setAccountOpen(false);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">CONFIGURATION</p>
          <h1 className="dashboard-title">Settings</h1>
        </div>
      </header>

      {canCreateAccounts && (
        <section aria-label="User accounts">
          <article className="island settings-card">
            <header className="settings-heading">
              <div className="settings-icon"><Icon name="users" size={18} /></div>
              <div>
                <h2>User Accounts</h2>
                <p>Create sign-in accounts and assign roles</p>
              </div>
            </header>
            <div className="settings-row">
              <strong><Icon name="briefcase" size={16} /> Provisioning</strong>
              <span>Admin-only — the API rejects account creation without account:write</span>
            </div>
            <div className="settings-row">
              <strong><Icon name="info" size={16} /> Available roles</strong>
              <span>{ROLE_CODES.join(' · ')}</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-primary" onClick={() => setAccountOpen(true)}>
                <Icon name="plus" size={14} /> New account
              </button>
            </div>
          </article>
        </section>
      )}

      <section aria-label="System settings">
        <article className="island settings-card">
          <header className="settings-heading">
            <div className="settings-icon"><Icon name="settings" size={18} /></div>
            <div>
              <h2>System Status</h2>
              <p>Backend connectivity and health information</p>
            </div>
          </header>
          <div className="settings-row">
            <strong><Icon name="activity" size={16} /> API Status</strong>
            <span className={health.isError ? 'status-badge status-inactive' : 'status-badge status-active'}>
              <i aria-hidden="true" />
              {health.isError ? 'Disconnected' : 'Connected'}
            </span>
          </div>
          <div className="settings-row">
            <strong><Icon name="clock" size={16} /> Last Check</strong>
            <span>{health.data?.timestamp ?? '—'}</span>
          </div>
          <div className="settings-row">
            <strong><Icon name="server" size={16} /> Product</strong>
            <span>{health.data?.product ?? 'HRMS Backend'}</span>
          </div>
          {health.isError && (
            <div className="settings-note">
              <Icon name="alert" size={14} />
              <span>Backend connection unavailable. Some features may not work.</span>
            </div>
          )}
        </article>
      </section>

      <section aria-label="Application info">
        <article className="island settings-card">
          <header className="settings-heading">
            <div className="settings-icon"><Icon name="info" size={18} /></div>
            <div>
              <h2>Application Info</h2>
              <p>Version and build information</p>
            </div>
          </header>
          <div className="settings-row">
            <strong>Name</strong>
            <span>Northstar Institute HRMS</span>
          </div>
          <div className="settings-row">
            <strong>Version</strong>
            <span>1.0.0</span>
          </div>
          <div className="settings-row">
            <strong>Build</strong>
            <span>Next.js 15 + React 19</span>
          </div>
          <div className="settings-row">
            <strong>Backend</strong>
            <span>Spring Boot 4 + PostgreSQL</span>
          </div>
        </article>
      </section>

      {canCreateAccounts && (
        <Modal
          open={accountOpen}
          onClose={closeAccountDialog}
          title="New account"
          description="The account can sign in immediately with the password you set."
        >
          <AccountForm onCancel={closeAccountDialog} />
        </Modal>
      )}
    </div>
  );
}
