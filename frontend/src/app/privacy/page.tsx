import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for the Birla Institute of Technology (BIT Patna) Enterprise HRMS Portal, covering workforce data, biometric attendance logs, and cookies.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-[var(--color-primary)] font-semibold">
              Legal &amp; Compliance
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Privacy Policy
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
          Last updated: November 28, 2026 · Effective for Birla Institute of Technology (BIT Patna) HRMS Portal
        </p>

        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-base font-bold">1. Information We Collect</h2>
          <p className="text-[var(--color-text-muted)]">
            We collect institutional workforce records required for human resource administration, including employee names, institutional email addresses, department assignments, leave applications, and biometric terminal attendance timestamps.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-base font-bold">2. How We Use Information</h2>
          <p className="text-[var(--color-text-muted)]">
            Collected data is used strictly for attendance ledger verification, leave governance, role-based access control, and security auditing. Authentication tokens are stored in browser session storage and never shared with unauthorized third parties.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-base font-bold">3. Cookies &amp; Analytics</h2>
          <p className="text-[var(--color-text-muted)]">
            Essential storage is used for theme preferences and session state. Optional usage analytics are only activated if you explicitly accept analytics cookies via our Cookie Consent Banner.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-base font-bold">4. Data Security &amp; Retention</h2>
          <p className="text-[var(--color-text-muted)]">
            All traffic is encrypted over HTTPS/TLS in production, passwords are hashed server-side using bcrypt, and API endpoints enforce JWT-based role authorization. Records are retained in accordance with institutional HR policies.
          </p>
        </section>

        <section className="space-y-2 text-sm leading-relaxed">
          <h2 className="text-base font-bold">5. Contact</h2>
          <p className="text-[var(--color-text-muted)]">
            For privacy inquiries or data access requests, contact the HR Department at{' '}
            <a
              href="mailto:hrpatna@bitmesra.ac.in"
              className="font-semibold text-[var(--color-primary)] underline underline-offset-2"
            >
              hrpatna@bitmesra.ac.in
            </a>
            .
          </p>
        </section>

        <footer className="pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
          <span>© 2026 Birla Institute of Technology. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="font-semibold text-[var(--color-primary)] hover:underline">
              Terms &amp; Conditions
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
