'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@/components/ui/Icon';

export interface TimesheetDayRow {
  dayName: string;
  dateStr: string;
  checkIn: string;
  checkOut: string;
  breakDuration: string;
  effectiveHours: string;
  progressPercent: number; // 0-100 relative to 8h
  status: 'PRESENT' | 'ON_LEAVE' | 'WEEKEND' | 'HOLIDAY';
}

const DEFAULT_WEEK: TimesheetDayRow[] = [
  { dayName: 'Mon', dateStr: 'Nov 09', checkIn: '08:55 AM', checkOut: '05:35 PM', breakDuration: '45m', effectiveHours: '7h 55m', progressPercent: 98, status: 'PRESENT' },
  { dayName: 'Tue', dateStr: 'Nov 10', checkIn: '08:48 AM', checkOut: '06:12 PM', breakDuration: '50m', effectiveHours: '8h 34m', progressPercent: 100, status: 'PRESENT' },
  { dayName: 'Wed', dateStr: 'Nov 11', checkIn: '09:02 AM', checkOut: '05:40 PM', breakDuration: '40m', effectiveHours: '7h 58m', progressPercent: 99, status: 'PRESENT' },
  { dayName: 'Thu', dateStr: 'Nov 12', checkIn: '08:52 AM', checkOut: 'Active Now', breakDuration: '30m', effectiveHours: '7h 04m', progressPercent: 88, status: 'PRESENT' },
  { dayName: 'Fri', dateStr: 'Nov 13', checkIn: '--:--', checkOut: '--:--', breakDuration: '0m', effectiveHours: '0h 00m', progressPercent: 0, status: 'PRESENT' },
  { dayName: 'Sat', dateStr: 'Nov 14', checkIn: '--:--', checkOut: '--:--', breakDuration: '0m', effectiveHours: '0h 00m', progressPercent: 0, status: 'WEEKEND' },
  { dayName: 'Sun', dateStr: 'Nov 15', checkIn: '--:--', checkOut: '--:--', breakDuration: '0m', effectiveHours: '0h 00m', progressPercent: 0, status: 'WEEKEND' },
];

export function WeeklyTimesheetMatrix() {
  const [weekOffset, setWeekOffset] = useState(0);

  return (
    <article className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            <h2 className="text-base font-bold text-[var(--text)]">
              Weekly Attendance & Timesheet Log
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Synchronized with institutional biometric checkpoints
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Previous week"
          >
            <Icon name="back" size={14} />
          </button>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)]">
            {weekOffset === 0 ? 'Current Week (Nov 09 – Nov 15)' : `Offset: ${weekOffset > 0 ? '+' : ''}${weekOffset} wk`}
          </span>
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Next week"
          >
            <Icon name="arrow" size={14} />
          </button>
        </div>
      </div>

      {/* Timesheet Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              <th className="py-3 px-3">Day & Date</th>
              <th className="py-3 px-3">Check In</th>
              <th className="py-3 px-3">Check Out</th>
              <th className="py-3 px-3">Breaks</th>
              <th className="py-3 px-3">Daily Progress</th>
              <th className="py-3 px-3 text-right">Effective Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {DEFAULT_WEEK.map((row) => (
              <tr key={row.dayName} className="hover:bg-[var(--surface-hover)] transition-colors">
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text)]">{row.dayName}</span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">{row.dateStr}</span>
                  </div>
                </td>

                <td className="py-3.5 px-3 font-mono text-[var(--text)] tabular-nums">
                  {row.checkIn}
                </td>

                <td className="py-3.5 px-3 font-mono text-[var(--text)] tabular-nums">
                  {row.checkOut}
                </td>

                <td className="py-3.5 px-3 font-mono text-[var(--text-muted)] tabular-nums">
                  {row.breakDuration}
                </td>

                <td className="py-3.5 px-3 min-w-[160px]">
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-[var(--surface-alt)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                          width: `${row.progressPercent}%`,
                          transformOrigin: 'left',
                        }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3 text-right font-mono font-bold text-[var(--text)] tabular-nums">
                  {row.effectiveHours}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
