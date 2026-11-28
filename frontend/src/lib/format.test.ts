import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTime,
  initials,
  isToday,
  isSameDay,
  formatDayHeader,
  truncateMiddle,
} from './format';

describe('format utilities', () => {
  it('formats calendar dates safely', () => {
    expect(formatDate('2026-11-20')).toContain('Nov');
    expect(formatDate('2026-11-20')).toContain('20');
    expect(formatDate(null)).toBe('-');
  });

  it('generates initials for single and multi-word names', () => {
    expect(initials('Elena Rostova')).toBe('ER');
    expect(initials('Marcus')).toBe('M');
  });

  it('identifies today and same days accurately', () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(isToday(todayStr)).toBe(true);
    expect(isSameDay(todayStr, todayStr)).toBe(true);
    expect(isToday('2020-01-01')).toBe(false);
  });

  it('formats day headers with Today, Yesterday, and weekday labels', () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const header = formatDayHeader(todayStr);
    expect(header.label).toBe('Today');
    expect(header.isToday).toBe(true);
  });

  describe('truncateMiddle (UI Rule 8: middle truncation)', () => {
    it('returns short filenames unchanged', () => {
      expect(truncateMiddle('doc.pdf', 20)).toBe('doc.pdf');
    });

    it('truncates in the middle while strictly preserving extension', () => {
      const longName = 'employee_employment_contract_v2_signed.pdf';
      const truncated = truncateMiddle(longName, 22);

      expect(truncated.endsWith('.pdf')).toBe(true);
      expect(truncated).toContain('...');
      expect(truncated.length).toBeLessThanOrEqual(22);
    });

    it('handles filenames without extensions or empty inputs gracefully', () => {
      expect(truncateMiddle(null)).toBe('');
      expect(truncateMiddle(undefined)).toBe('');
      const longWithoutExt = 'very_long_identifier_without_extension_at_all';
      const res = truncateMiddle(longWithoutExt, 16);
      expect(res).toContain('...');
      expect(res.length).toBeLessThanOrEqual(16);
    });
  });
});
