'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from '@/lib/motion';
import { Icon } from '@/components/ui/Icon';
import { BRANDING } from '@/lib/branding';

export default function NotFound() {
  const [currentPath, setCurrentPath] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname + window.location.search);
      setTimestamp(new Date().toISOString());
    }
  }, []);

  const diagnosticData = {
    error: '404 Not Found',
    message: 'The requested route or resource could not be found on the server.',
    path: currentPath || 'unknown',
    timestamp: timestamp || new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    gateway: 'Next.js Turbopack / Spring Boot Reverse Proxy',
  };

  const handleCopyDiagnostics = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnosticData, null, 2));
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
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden"
      >
        {/* Subtle Ambient Decorative Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 size-64 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: 'var(--color-primary)' }}
        />

        {/* Status Badge & Code */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              HTTP 404 · NOT FOUND
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {BRANDING.shortName} Enterprise Platform
          </span>
        </div>

        {/* Headline & Explanation */}
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            Page or Resource Not Found
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            The requested destination{' '}
            <code className="px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-primary)] break-all">
              {currentPath || '/requested-page'}
            </code>{' '}
            does not exist, has been reorganized, or requires elevated institutional access.
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-[0.99] transition-all shadow-sm"
          >
            <Icon name="grid" size={14} />
            <span>Overview Dashboard</span>
          </Link>
          <Link
            href="/employee"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs border border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-canvas-secondary)] text-[var(--color-text)] transition-colors"
          >
            <Icon name="user" size={14} />
            <span>Employee Portal</span>
          </Link>
          <Link
            href="/attendance"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs border border-[var(--color-border)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-canvas-secondary)] text-[var(--color-text)] transition-colors"
          >
            <Icon name="clock" size={14} />
            <span>Attendance Ledger</span>
          </Link>
        </div>

        {/* Visible Diagnostics Drawer — Eliminates the need to open DevTools/console */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Icon name="alert" size={13} />
              <span>{showDiagnostics ? 'Hide Technical Diagnostics' : 'Show Technical Diagnostics (No Console Needed)'}</span>
              <Icon name={showDiagnostics ? 'close' : 'arrow'} size={11} className={showDiagnostics ? '' : 'rotate-90'} />
            </button>

            {showDiagnostics && (
              <button
                type="button"
                onClick={handleCopyDiagnostics}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Icon name="check" size={12} />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Diagnostics JSON'}</span>
              </button>
            )}
          </div>

          <AnimatePresence>
            {showDiagnostics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 overflow-hidden"
              >
                <div className="p-3.5 rounded-xl bg-[var(--color-canvas-secondary)] border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-text-muted)] space-y-1.5 overflow-x-auto">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text)] font-semibold">Status:</span>
                    <span>404 Not Found</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text)] font-semibold">Attempted Path:</span>
                    <span className="text-amber-500">{currentPath || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text)] font-semibold">Recorded Time:</span>
                    <span>{timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text)] font-semibold">System Gateway:</span>
                    <span>Next.js Turbopack Reverse Proxy</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
