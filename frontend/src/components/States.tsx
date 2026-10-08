import { Icon } from './Icon'

export function LoadingState({ label = 'Loading your workspace' }: { label?: string }) {
  return (
    <div className="state-panel" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-panel state-error" role="alert">
      <span className="state-icon"><Icon name="warning" size={19} /></span>
      <div>
        <strong>We couldn’t load this information</strong>
        <p>{message}</p>
      </div>
      {onRetry && <button className="button button-light button-small" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  icon = 'grid',
}: {
  title: string
  description: string
  icon?: 'users' | 'calendar' | 'fingerprint' | 'grid'
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} size={22} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}
