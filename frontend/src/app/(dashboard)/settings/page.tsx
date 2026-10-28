'use client';

import { useQuery } from '@tanstack/react-query';
import { healthApi } from '@/lib/api';
import { Icon } from '@/components/ui/Icon';

export default function SettingsPage() {
  const health = useQuery({ queryKey: ['health'], queryFn: healthApi.get, retry: false });

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-date">CONFIGURATION</p>
          <h1 className="dashboard-title">Settings</h1>
        </div>
      </header>

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

      <section aria-label="Application info" style={{ marginTop: 24 }}>
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
            <span>Spring Boot 3 + PostgreSQL</span>
          </div>
        </article>
      </section>
    </div>
  );
}