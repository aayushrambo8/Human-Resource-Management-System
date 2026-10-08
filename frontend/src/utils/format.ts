export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', options ?? { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function formatTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date)
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  return `${formatDate(value, { month: 'short', day: 'numeric' })} · ${formatTime(value)}`
}
