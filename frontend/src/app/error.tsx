'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from '@/lib/motion';
import { Icon } from '@/components/ui/Icon';
import { BRANDING } from '@/lib/branding';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showStack, setShowStack] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log error locally
  }, [error]);

  const diagnosticDetails = {
    name: error.name || 'ApplicationError',
    message: error.message || 'An unexpected client error occurred',
    digest: error.digest || 'none',
    timestamp: new Date().toISOString(),
    stack: error.stack || 'No stack trace captured',
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnosticDetails, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--color-canvas)] text-[var(--color-text)]">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-[var(--color-surface)] border border-red-200 dark:border-red-900/50 rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden"
      >
        {/* Ambient Danger Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 size-60 rounded-full blur-3xl pointer-events-none opacity-20 bg-red-500"
        />

        {/* Top Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              CLIENT ERROR ENCOUNTERED
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {BRANDING.shortName} Diagnostics
          </span>
        </div>

        {/* Title */}
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            Something went wrong
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            The platform encountered an issue processing your request:
          </p>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs font-mono">
            {error.message || 'Unknown application error'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icon name="arrow" size={14} className="rotate-180" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs border border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-canvas-secondary)] text-[var(--color-text)] transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="grid" size={14} />
            <span>Return to Safety (Dashboard)</span>
          </Link>
        </div>

        {/* Diagnostic Accordion */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowStack(!showStack)}
              className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Icon name="alert" size={13} />
              <span>{showStack ? 'Hide Error Diagnostics' : 'Show Error Diagnostics (No Console Needed)'}</span>
            </button>
            {showStack && (
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Icon name="check" size={12} />
                <span>{copied ? 'Copied Details!' : 'Copy Diagnostics'}</span>
              </button>
            )}
          </div>

          <AnimatePresence>
            {showStack && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 overflow-hidden"
              >
                <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
                  {error.stack || `${error.name}: ${error.message}`}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
