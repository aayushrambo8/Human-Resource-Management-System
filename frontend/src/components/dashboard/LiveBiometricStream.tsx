'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { initials, formatTime } from '@/lib/format';
import type { AttendanceRecord } from '@/lib/types';

interface LiveBiometricStreamProps {
  records: AttendanceRecord[];
}

export function LiveBiometricStream({ records }: LiveBiometricStreamProps) {
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const filtered = records.filter((r) => {
    if (directionFilter === 'ALL') return true;
    return r.direction === directionFilter;
  });

  return (
    <article className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
            </span>
            <h3 className="text-sm font-bold text-[var(--text)]">
              Live Biometric & Gate Swipe Feed
            </h3>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Active gate telemetry stream
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-[11px] font-semibold">
          {(['ALL', 'IN', 'OUT'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDirectionFilter(mode)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                directionFilter === mode
                  ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {mode === 'ALL' ? 'All' : mode === 'IN' ? 'Check In' : 'Check Out'}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-[var(--border-subtle)] max-h-[320px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {filtered.slice(0, 7).map((punch, idx) => {
            const isIn = punch.direction === 'IN';
            return (
              <motion.div
                key={punch.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="py-2.5 flex items-center justify-between gap-3 group hover:bg-[var(--surface-hover)] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`size-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 avatar avatar-${
                      idx % 5
                    }`}
                  >
                    {initials(punch.employeeName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text)] truncate">
                      {punch.employeeName}
                    </p>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                      {punch.employeeCode} · {punch.deviceCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                      isIn
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isIn ? 'In' : 'Out'}
                  </span>
                  <time className="text-xs font-mono font-medium text-[var(--text-secondary)] tabular-nums">
                    {formatTime(punch.punchTime)}
                  </time>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
        <span>Active reader: Turnstile Gate A</span>
        <Link href="/attendance" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
          View full logs →
        </Link>
      </div>
    </article>
  );
}
