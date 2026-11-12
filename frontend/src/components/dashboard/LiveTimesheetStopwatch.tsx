'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Icon } from '@/components/ui/Icon';
import { BRANDING } from '@/lib/branding';

interface LiveTimesheetStopwatchProps {
  onPunchSuccess?: (record: { direction: 'IN' | 'OUT'; deviceCode: string; time: string }) => void;
  isCheckedIn: boolean;
  onToggleCheckIn: () => void;
  todayDurationSeconds?: number;
}

export function LiveTimesheetStopwatch({
  onPunchSuccess,
  isCheckedIn,
  onToggleCheckIn,
  todayDurationSeconds = 25420, // ~7h 03m 40s default demo
}: LiveTimesheetStopwatchProps) {
  const [seconds, setSeconds] = useState(todayDurationSeconds);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakSeconds, setBreakSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCheckedIn && !isOnBreak) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (isCheckedIn && isOnBreak) {
      interval = setInterval(() => {
        setBreakSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCheckedIn, isOnBreak]);

  const formatHMS = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return {
      hrs: String(hrs).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
    };
  };

  const { hrs, mins, secs } = formatHMS(seconds);
  const breakTime = formatHMS(breakSeconds);

  const handleAction = () => {
    onToggleCheckIn();
    const newDirection: 'IN' | 'OUT' = isCheckedIn ? 'OUT' : 'IN';
    if (onPunchSuccess) {
      onPunchSuccess({
        direction: newDirection,
        deviceCode: 'WEB-TERMINAL',
        time: new Date().toISOString(),
      });
    }
  };

  return (
    <div
      className="relative overflow-hidden p-5 bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)] flex flex-col justify-between space-y-4 transition-all duration-300"
      style={{
        borderRadius: 'var(--card-radius, 16px)',
      }}
    >
      {/* Decorative Glow that matches current theme's primary color */}
      <div
        className="absolute -top-12 -right-12 size-36 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-500"
        style={{ background: 'var(--color-primary)' }}
      />

      {/* Header Info */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`size-2.5 rounded-full transition-colors ${
                isCheckedIn
                  ? 'bg-[var(--color-success,#10B981)] animate-ping'
                  : 'bg-[var(--color-text-muted)] opacity-60'
              }`}
            />
            <span className="text-[10.5px] font-mono tracking-wider uppercase font-semibold text-[var(--color-text-muted)]">
              {isCheckedIn ? (isOnBreak ? 'On Break' : 'Active Attendance') : 'Checked Out'}
            </span>
          </div>
          <h2 className="text-base font-bold text-[var(--color-text)] mt-1 tracking-tight">
            Daily Attendance Stopwatch
          </h2>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Official terminal logging · {BRANDING.name}
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] shrink-0 shadow-2xs">
          Target: 08h 00m
        </span>
      </div>

      {/* Digital Counter Display */}
      <div className="relative z-10 py-3 text-center space-y-1.5 bg-[var(--color-canvas-secondary)] rounded-xl border border-[var(--color-border)] p-3 transition-colors">
        <div className="flex items-baseline justify-center gap-1 font-mono text-4xl sm:text-5xl font-black tracking-tight tabular-nums text-[var(--color-text)]">
          <span>{hrs}</span>
          <span className="text-[var(--color-primary)] opacity-85 animate-pulse">:</span>
          <span>{mins}</span>
          <span className="text-[var(--color-primary)] opacity-85 animate-pulse">:</span>
          <span className="text-[var(--color-primary)]">{secs}</span>
        </div>
        <p className="text-[11px] font-mono text-[var(--color-text-muted)]">
          {isOnBreak ? `Break duration: ${breakTime.mins}m ${breakTime.secs}s` : 'Logged active productive time today'}
        </p>
      </div>

      {/* Telemetry Chips */}
      <div className="relative z-10 grid grid-cols-1 gap-1.5 text-[10.5px] font-mono">
        <div className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] truncate flex items-center justify-between">
          <span className="text-[var(--color-text-muted)]">Weekly Working Hours</span>
          <span className="font-bold text-[var(--color-text)]">38h 45m / 40h</span>
        </div>
        <div className="px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] truncate flex items-center justify-between">
          <span className="text-[var(--color-text-muted)]">On-Time Arrival Rate</span>
          <span className="font-bold text-[var(--color-primary)]">96.4%</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="relative z-10 flex items-center gap-2 pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleAction}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isCheckedIn
              ? 'bg-[var(--color-surface-elevated)] text-[var(--color-danger)] border border-[var(--color-border)] hover:bg-[var(--color-canvas-secondary)] shadow-xs'
              : 'btn-primary'
          }`}
          style={
            !isCheckedIn
              ? {
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 10px -1px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                }
              : undefined
          }
        >
          <Icon name="clock" size={15} />
          <span>{isCheckedIn ? 'Clock Out (Finish Shift)' : 'Clock In (Start Working)'}</span>
        </motion.button>

        {isCheckedIn && (
          <button
            type="button"
            onClick={() => setIsOnBreak((prev) => !prev)}
            className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-[var(--color-surface-elevated)] hover:bg-[var(--color-canvas-secondary)] text-[var(--color-text)] border border-[var(--color-border)] transition-colors cursor-pointer shrink-0"
          >
            {isOnBreak ? 'Resume' : 'Break'}
          </button>
        )}
      </div>
    </div>
  );
}
