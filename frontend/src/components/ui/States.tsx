'use client';

import { Icon } from './Icon';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="state-panel">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-panel state-error">
      <Icon name="warning" size={24} className="state-icon" />
      <div>
        <strong>Something went wrong</strong>
        <p>{message}</p>
        {onRetry && (
          <button className="btn btn-secondary" onClick={onRetry} style={{ marginTop: 8 }}>
            <Icon name="arrow" size={14} /> Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon = 'grid',
}: {
  title: string;
  description: string;
  icon?: 'grid' | 'users' | 'calendar' | 'clock' | 'building' | 'fingerprint';
}) {
  return (
    <div className="state-panel">
      <Icon name={icon} size={28} className="state-icon" />
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}