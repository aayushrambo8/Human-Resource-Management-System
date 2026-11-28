'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getCookieConsent,
  initAnalyticsIfConsented,
  onConsentChange,
  setCookieConsent,
  trackPageView,
  type ConsentDecision,
} from '@/lib/analytics';

export function CookieConsentBanner() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentDecision>('accepted');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = getCookieConsent();
    setConsent(current);
    if (current === 'accepted') {
      initAnalyticsIfConsented();
    }
    return onConsentChange((next) => setConsent(next));
  }, []);

  useEffect(() => {
    if (mounted && consent === 'accepted' && pathname) {
      trackPageView(pathname);
    }
  }, [mounted, consent, pathname]);

  if (!mounted || consent !== null) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5 shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-xs">
          <p className="font-bold text-[var(--color-text)]">
            Cookie &amp; Privacy Preferences
          </p>
          <p className="text-[var(--color-text-muted)] leading-relaxed">
            We use essential storage for authentication and workspace themes, plus optional analytics to improve portal speed. Read our{' '}
            <Link href="/privacy" className="font-semibold text-[var(--color-primary)] underline underline-offset-2">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="font-semibold text-[var(--color-primary)] underline underline-offset-2">
              Terms
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setCookieConsent('rejected')}
            className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-canvas-secondary)] transition-colors cursor-pointer"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => {
              setCookieConsent('accepted');
              initAnalyticsIfConsented();
              if (pathname) trackPageView(pathname);
            }}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-xs font-bold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Accept Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
