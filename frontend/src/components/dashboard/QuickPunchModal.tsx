'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@/components/ui/Icon';
import { BRANDING } from '@/lib/branding';

interface QuickPunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onPunchSuccess?: (record: { direction: 'IN' | 'OUT'; deviceCode: string; time: string }) => void;
}

export function QuickPunchModal({
  isOpen,
  onClose,
  userEmail: _userEmail,
  onPunchSuccess,
}: QuickPunchModalProps) {
  const [direction, setDirection] = useState<'IN' | 'OUT'>('IN');
  const [device, setDevice] = useState('BIO-GATE-A');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const nowIso = new Date().toISOString();
      setSuccessMessage(
        `Successfully logged ${direction === 'IN' ? 'Check In' : 'Check Out'} at ${currentTime}`
      );
      if (onPunchSuccess) {
        onPunchSuccess({ direction, deviceCode: device, time: nowIso });
      }
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="punch-modal-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl z-10 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <Icon name="clock" size={18} />
              </div>
              <div>
                <h3 id="punch-modal-title" className="text-base font-bold text-[var(--text)]">
                  Live Attendance Check-In
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Biometric checkpoint synchronization · {BRANDING.shortName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-lg cursor-pointer"
              aria-label="Close dialog"
            >
              <Icon name="close" size={16} />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-alt)] border border-[var(--border)] text-center space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Official Terminal Time
            </span>
            <div className="text-3xl font-extrabold text-[var(--text)] font-mono tracking-tight tabular-nums">
              {currentTime || '--:--:--'}
            </div>
            <p className="text-[11px] text-[var(--text-faint)]">
              Calibrated to {BRANDING.name} Time Server
            </p>
          </div>

          {successMessage ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1"
            >
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {successMessage}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                Timesheet stream and gate telemetry refreshed.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Punch Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection('IN')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      direction === 'IN'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Check In (Start)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('OUT')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      direction === 'OUT'
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-500 text-slate-800 dark:text-slate-200 shadow-xs'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <span className="size-2 rounded-full bg-slate-500" />
                    Check Out (Exit)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="terminal-select" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Biometric Terminal
                </label>
                <select
                  id="terminal-select"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="BIO-GATE-A">Gate Alpha (Turnstiles A1-A4)</option>
                  <option value="BIO-TOWER-B">Tower Wing B1 (Faculty)</option>
                  <option value="BIO-LAB-C">Research Lab C (Biometric)</option>
                  <option value="WEB-TERMINAL">Direct Web Terminal</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Attendance'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

