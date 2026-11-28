'use client';

import { motion } from 'motion/react';
import { Icon } from '@/components/ui/Icon';

export interface TimesheetMetric {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  badge: string;
  positive: boolean;
  icon: 'clock' | 'calendar' | 'activity' | 'users';
}

interface TimesheetMetricsRowProps {
  metrics: TimesheetMetric[];
}

export function TimesheetMetricsRow({ metrics }: TimesheetMetricsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <motion.div
          key={m.id}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {m.label}
              </span>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text)] tabular-nums">
                {m.value}
              </div>
            </div>

            <div className="size-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Icon name={m.icon} size={17} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-muted)] truncate max-w-[120px]">{m.subtitle}</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-md text-[10px] tabular-nums border ${
                m.positive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              {m.badge}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

