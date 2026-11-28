'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Icon } from '@/components/ui/Icon';
import { useBranding } from '@/lib/branding';
import { trackEvent } from '@/lib/analytics';

interface FieldErrors {
  email?: string;
  password?: string;
}

const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_MS = 30_000;

function validateLoginFields(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    errors.email = 'Please enter your institutional email or username.';
  } else if (trimmedEmail.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!password) {
    errors.password = 'Please enter your password.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  return errors;
}

export default function LoginPage() {
  const { branding } = useBranding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showResetHelp, setShowResetHelp] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const failedAttemptsRef = useRef<number[]>([]);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Bot protection: honeypot trap
    if (honeypot.trim() !== '') {
      setError('Automated submission blocked.');
      return;
    }

    // Bot protection: client-side burst rate limit
    const now = Date.now();
    failedAttemptsRef.current = failedAttemptsRef.current.filter((t) => now - t < COOLDOWN_MS);
    if (failedAttemptsRef.current.length >= MAX_FAILED_ATTEMPTS) {
      setError('Too many failed attempts. Please wait 30 seconds before trying again.');
      return;
    }

    // Client-side form validation
    const validation = validateLoginFields(email, password);
    setFieldErrors(validation);
    if (validation.email || validation.password) {
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      trackEvent('login_success', { method: 'credentials' });
      router.push('/');
    } catch (err) {
      failedAttemptsRef.current.push(Date.now());
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid credentials. Please verify your username and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--color-canvas)] text-[var(--color-text)] overflow-x-hidden">
      {/* ============================================================== */}
      {/* LEFT SECTION (Desktop Showcase / Compact Mobile Header)        */}
      {/* ============================================================== */}
      <section
        className="w-full lg:w-[68%] xl:w-[72%] relative min-h-[260px] sm:min-h-[340px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-16 overflow-hidden bg-slate-950 text-white"
        aria-label="Institution showcase and background visual"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out pointer-events-none scale-102"
          style={{
            backgroundImage: `url('${branding.loginHeroUrl}')`,
            backgroundPosition: 'center 40%',
          }}
          aria-hidden="true"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/55 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />

        <div
          className="absolute -top-24 -left-24 size-96 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: branding.theme.primaryAccent || '#1e3a8a' }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 left-1/3 size-96 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: branding.theme.emeraldGlow || '#10b981' }}
          aria-hidden="true"
        />

        {/* 1. Top Organization Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3.5 group"
            aria-label={`${branding.markLetter} ${branding.name}`}
          >
            <div className="size-12 sm:size-13 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-200 border border-white/40 shrink-0">
              <img
                src={branding.logoUrl}
                alt={`${branding.name} Emblem`}
                className="size-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm truncate">
                {branding.name}
              </span>
              <span className="text-xs font-mono text-emerald-300 font-semibold tracking-wider uppercase mt-0.5 truncate">
                {branding.division} · {branding.shortName}
              </span>
            </div>
          </Link>
        </div>

        {/* 2. Hero Content & Value Proposition */}
        <div className="relative z-10 my-6 sm:my-8 lg:my-auto max-w-3xl space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md">
            Intelligent Workforce Operations &amp; Automated Biometrics
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed drop-shadow-sm font-normal">
            Unified human resource governance for faculty, officers, and staff at {branding.name} ({branding.shortName}). Real-time biometric terminal telemetry, automated timesheet ledgers, and streamlined leave approvals.
          </p>

          {/* Key Feature Cards */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/65 backdrop-blur-md border border-white/15 shadow-lg">
              <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2.5">
                <Icon name="fingerprint" size={18} />
              </div>
              <h3 className="text-xs font-bold text-white">Biometric Telemetry</h3>
              <p className="text-[11px] text-slate-200 mt-1 leading-normal">
                Sub-second terminal synchronization across campus checkpoints.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/65 backdrop-blur-md border border-white/15 shadow-lg">
              <div className="size-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center mb-2.5">
                <Icon name="users" size={18} />
              </div>
              <h3 className="text-xs font-bold text-white">Workforce Hierarchy</h3>
              <p className="text-[11px] text-slate-200 mt-1 leading-normal">
                Multi-departmental governance, employee records, and RBAC control.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/65 backdrop-blur-md border border-white/15 shadow-lg">
              <div className="size-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-2.5">
                <Icon name="calendar" size={18} />
              </div>
              <h3 className="text-xs font-bold text-white">Leave Governance</h3>
              <p className="text-[11px] text-slate-200 mt-1 leading-normal">
                Automated quota tracking, approval desk, and PTO ledger records.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Bottom Showcase Footer */}
        <div className="relative z-10 pt-4 border-t border-white/15 hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{branding.name}</span>
            <span>·</span>
            <span>{branding.division} ({branding.shortName})</span>
          </div>
          <div className="font-mono text-[11px] text-slate-300">
            Aayush Babu Enterprises
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* RIGHT SECTION: Authentication Portal & Primary CTA             */}
      {/* ============================================================== */}
      <section
        className="w-full lg:w-[32%] xl:w-[28%] flex items-center justify-center p-6 sm:p-10 lg:p-8 bg-[var(--color-surface)] border-t lg:border-t-0 lg:border-l border-[var(--color-border)] shadow-2xl relative z-20"
        aria-label="User authentication login section"
      >
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="size-14 rounded-2xl bg-white p-1.5 border border-[var(--color-border)] shadow-md mx-auto sm:mx-0 flex items-center justify-center mb-1">
              <img
                src={branding.logoUrl}
                alt={branding.name}
                className="size-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Sign In to Portal
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Enter your institutional credentials to access the {branding.shortName} HRMS workspace.
            </p>
          </div>

          {expired && (
            <div
              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2"
              role="alert"
            >
              <Icon name="alert" size={15} className="shrink-0" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div
              className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 text-xs flex items-center gap-2"
              role="alert"
            >
              <Icon name="close" size={15} className="shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Bot Honeypot Field (hidden from real users) */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="company-website">Website</label>
              <input
                id="company-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Username / Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-[var(--color-text)]"
              >
                Username or Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none">
                  <Icon name="user" size={15} />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="name@bitmesra.ac.in"
                  required
                  disabled={loading}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'username-error' : undefined}
                  className="w-full min-h-[44px] h-11 pl-9 pr-3 text-xs rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
              </div>
              {fieldErrors.email && (
                <p id="username-error" role="alert" className="text-[11px] font-medium text-red-700 dark:text-red-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[var(--color-text)]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowResetHelp((v) => !v)}
                  className="text-[11px] font-medium text-[var(--color-primary)] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none">
                  <Icon name="shield" size={15} />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  className="w-full min-h-[44px] h-11 pl-9 pr-11 text-xs rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-2 transition-colors cursor-pointer"
                >
                  <Icon name={showPassword ? 'close' : 'sparkles'} size={14} />
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" role="alert" className="text-[11px] font-medium text-red-700 dark:text-red-400">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {showResetHelp && (
              <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-xs text-[var(--color-text-muted)]">
                To reset your institutional password, contact HR Support at{' '}
                <a
                  href={`mailto:${branding.supportEmail}?subject=HRMS%20Password%20Reset`}
                  className="font-semibold text-[var(--color-primary)] underline"
                >
                  {branding.supportEmail}
                </a>
                .
              </div>
            )}

            {/* Remember Device Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--color-text-muted)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] size-4"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            {/* Single Clear Primary Call To Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl font-bold text-xs bg-[var(--color-primary)] text-white hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <Icon name="arrow" size={13} />
                </>
              )}
            </button>
          </form>

          {/* Institutional Footer with Legal Links */}
          <footer className="pt-4 text-center border-t border-[var(--color-border)] space-y-2">
            <div className="flex items-center justify-center gap-4 text-[11px] font-medium">
              <Link href="/privacy" className="text-[var(--color-primary)] hover:underline">
                Privacy Policy
              </Link>
              <span aria-hidden="true" className="text-[var(--color-text-muted)]">·</span>
              <Link href="/terms" className="text-[var(--color-primary)] hover:underline">
                Terms &amp; Conditions
              </Link>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {branding.copyright}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
              Support: {branding.supportEmail}
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}
