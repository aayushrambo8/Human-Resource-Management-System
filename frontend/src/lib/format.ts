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

export function isToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    const d = parseDate(dateStr);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}

export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  try {
    const d1 = typeof date1 === 'string' ? parseDate(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseDate(date2) : date2;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  } catch {
    return false;
  }
}

export function formatDayHeader(dateStr: string): { label: string; dateFormatted: string; isToday: boolean; isYesterday: boolean } {
  try {
    const date = parseDate(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    const dateFormatted = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(date);

    if (diffDays === 0) {
      return { label: 'Today', dateFormatted, isToday: true, isYesterday: false };
    }
    if (diffDays === 1) {
      return { label: 'Yesterday', dateFormatted, isToday: false, isYesterday: true };
    }
    return {
      label: new Intl.DateTimeFormat('en', { weekday: 'long' }).format(date),
      dateFormatted,
      isToday: false,
      isYesterday: false,
    };
  } catch {
    return { label: dateStr, dateFormatted: dateStr, isToday: false, isYesterday: false };
  }
}

/**
 * Truncate filenames or codes in the middle rather than at the end
 * so that vital file extensions (.pdf, .csv, .png) or suffixes are preserved.
 * Example: "employee_passport_scan_2026.pdf" -> "employee_p...2026.pdf"
 */
export function truncateMiddle(text: string | null | undefined, maxLen = 24): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;

  const dotIndex = text.lastIndexOf('.');
  const ext = dotIndex !== -1 ? text.slice(dotIndex) : '';
  const base = dotIndex !== -1 ? text.slice(0, dotIndex) : text;

  // Space reserved for base name parts around ellipsis
  const availableBase = maxLen - ext.length - 3;
  if (availableBase <= 2) {
    return `${text.slice(0, maxLen - 3)}...`;
  }

  const frontChars = Math.ceil(availableBase / 2);
  const backChars = Math.floor(availableBase / 2);

  return `${base.slice(0, frontChars)}...${base.slice(-backChars)}${ext}`;
}

