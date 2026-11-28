import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Terms and Conditions governing authorized access and acceptable use of the Birla Institute of Technology (BIT Patna) Enterprise HRMS Portal.',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-primary)] font-semibold">
              Legal &amp; Compliance
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Terms and Conditions
            </h1>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity"
          >
            Back to Sign In
          </Link>
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          Last updated: November 28, 2026 · Birla Institute of Technology (BIT Patna) HRMS Portal
        </p>

        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-base font-bold">1. Authorized Access</h2>
          <p className="text-[var(--color-text-muted)]">
            Access to this Human Resource Management System is restricted to authorized faculty, staff, HR officers, and system administrators of Birla Institute of Technology. Sharing credentials or attempting unauthorized access is strictly prohibited.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-base font-bold">2. Acceptable Use &amp; Biometric Integrity</h2>
          <p className="text-[var(--color-text-muted)]">
            Users must submit accurate attendance, leave, and personnel information. Automated scraping, brute-force authentication attempts, or tampering with biometric terminal records are prohibited and logged for security review.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-base font-bold">3. Intellectual Property</h2>
          <p className="text-[var(--color-text-muted)]">
            All institutional branding, software interfaces, and operational reports within this portal remain the property of Birla Institute of Technology and its respective licensors.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-base font-bold">4. Availability &amp; Liability</h2>
          <p className="text-[var(--color-text-muted)]">
            While we strive for continuous uptime and real-time telemetry synchronization, scheduled maintenance or network interruptions may occur. Official HR records remain governed by institutional policy.
          </p>
        </section>

        <footer className="pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
          <span>© 2026 Birla Institute of Technology. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="font-semibold text-[var(--color-primary)] hover:underline">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:underline">
              Dashboard
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
