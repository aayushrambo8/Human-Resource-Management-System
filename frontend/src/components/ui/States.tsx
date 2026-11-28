'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import { Icon } from './Icon';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="state-panel"
    >
      <div className="spinner" />
      <span>{label}</span>
    </motion.div>
  );
}

export function ErrorState({
  message,
  onRetry,
  statusCode,
}: {
  message: string;
  onRetry?: () => void;
  statusCode?: number | string;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyInfo = async () => {
    try {
      const data = {
        error: message,
        statusCode: statusCode || 'Not specified',
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
      };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="state-panel state-error flex flex-col items-start gap-3 p-5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20"
    >
      <div className="flex items-start gap-3 w-full">
        <Icon name="warning" size={24} className="state-icon shrink-0 text-red-500 mt-0.5" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <strong className="text-sm font-bold text-red-950 dark:text-red-200">
              Something went wrong
            </strong>
            {statusCode && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/15 text-red-700 dark:text-red-300">
                HTTP {statusCode}
              </span>
            )}
          </div>
          <p className="text-xs text-red-800 dark:text-red-300/90 leading-relaxed">{message}</p>

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {onRetry && (
              <button
                type="button"
                className="btn btn-secondary text-xs cursor-pointer flex items-center gap-1.5"
                onClick={onRetry}
              >
                <Icon name="arrow" size={13} className="rotate-180" />
                <span>Try again</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors ml-1 cursor-pointer"
            >
              <Icon name="alert" size={12} />
              <span>{showDetails ? 'Hide details' : 'View diagnostics (no console needed)'}</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full pt-2 border-t border-red-200/60 dark:border-red-900/40 text-[11px] font-mono overflow-hidden space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs font-sans font-semibold text-red-900 dark:text-red-300">
              <span>Failure Context</span>
              <button
                type="button"
                onClick={copyInfo}
                className="text-[11px] text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Icon name="check" size={11} />
                <span>{copied ? 'Copied Details!' : 'Copy details'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-black/5 dark:bg-black/40 text-[10.5px] text-[var(--color-text-muted)] space-y-1 overflow-x-auto">
              <div><span className="font-bold text-[var(--color-text)]">Reason:</span> {message}</div>
              <div><span className="font-bold text-[var(--color-text)]">Recorded:</span> {new Date().toLocaleTimeString()}</div>
              <div><span className="font-bold text-[var(--color-text)]">Endpoint:</span> {typeof window !== 'undefined' ? window.location.pathname : ''}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function EmptyState({
  title,
  description,
  icon = 'grid',
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  icon?: 'grid' | 'users' | 'calendar' | 'clock' | 'building' | 'fingerprint';
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="state-panel"
    >
      <Icon name={icon} size={28} className="state-icon" />
      <strong className="text-balance">{title}</strong>
      <p className="max-w-md text-left sm:text-center">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary mt-2 text-xs"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
