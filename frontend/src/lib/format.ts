// Matches the backend's date-only format (LocalDate → "yyyy-MM-dd"). Parsed as
// a local calendar date so the day never shifts by the viewer's timezone
// (decision 2026-10-28: local display, safe date-only parsing).
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(dateStr: string): Date {
  if (DATE_ONLY.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = parseDate(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    // UTC instants ("...Z") render in the viewer's local timezone.
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
  } catch {
    return dateStr;
  }
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}