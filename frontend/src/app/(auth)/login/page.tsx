'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Icon } from '@/components/ui/Icon';
import { useBranding } from '@/lib/branding';
import { SAMPLE_LOGINS, type SampleLogin } from '@/lib/api';

export default function LoginPage() {
  const { branding } = useBranding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please verify your username and password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--color-canvas)] text-[var(--color-text)]">
      {/* ============================================================== */}
      {/* LEFT SECTION (75% on Desktop): Organization Showcase & Main Institute Image */}
      {/* ============================================================== */}
      <section
        className="w-full lg:w-[72%] xl:w-[75%] relative min-h-[460px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden bg-slate-950 text-white"
        aria-label="Institution showcase and background visual"
      >
        {/* Main Institute Image (75% Coverage Background) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out pointer-events-none scale-102"
          style={{
            backgroundImage: `url('${branding.loginHeroUrl}')`,
            backgroundPosition: 'center 40%',
          }}
          aria-hidden="true"
        />

        {/* Cinematic Multi-Layer Gradient Overlays for High Contrast & Contrast Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/50 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none" />

        {/* Ambient Brand Accents */}
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

        {/* 1. Top Organization Header: Logo + Identity */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3.5 group"
            aria-label={`${branding.markLetter} ${branding.name}`}
          >
            {/* Institute Official Logo PNG */}
            <div className="size-13 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-200 border border-white/40">
              <img
                src={branding.logoUrl}
                alt={`${branding.name} Emblem`}
                className="size-full object-contain"
                onError={(e) => {
                  // Fallback if image path is unavailable
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>{' '}
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
                {branding.name}
              </span>
              <span className="text-xs font-mono text-emerald-300 font-semibold tracking-wider uppercase mt-0.5">
                {branding.division} · {branding.shortName}
              </span>
            </div>
          </Link>

        </div>

        {/* 2. Hero Content & Value Proposition */}
        <div className="relative z-10 my-10 lg:my-auto max-w-3xl space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md">
            Intelligent Workforce Operations & Automated Biometrics
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed drop-shadow-sm font-normal">
            Unified human resource governance for faculty, officers, and staff at {branding.name} ({branding.shortName}). Real-time biometric terminal telemetry, automated timesheet ledgers, and streamlined leave approvals.
          </p>

          {/* Key Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/15 hover:border-emerald-400/50 transition-colors shadow-lg">
              <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2.5">
                <Icon name="fingerprint" size={18} />
              </div>
              <h3 className="text-xs font-bold text-white">Biometric Telemetry</h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                Sub-second terminal synchronization across campus checkpoints.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/15 hover:border-blue-400/50 transition-colors shadow-lg">
              <div className="size-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center mb-2.5">
                <Icon name="users" size={18} />
              </div>
              <h3 className="text-xs font-bold text-white">Workforce Hierarchy</h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                Multi-departmental governance, employee records, and RBAC control.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/15 hover:border-amber-400/50 transition-colors shadow-lg">
              <div className="size-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-2.5">
                <Icon name="calendar" size={18} />
              </div>
              <h3 className="text-xs font-bold text-white">Leave Governance</h3>
              <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                Automated quota tracking, approval desk, and PTO ledger records.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Bottom Showcase Footer */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">{branding.name}</span>
            <span>·</span>
            <span>{branding.division} ({branding.shortName})</span>
          </div>
          <div className="font-mono text-[11px] text-slate-300">
            Enterprise Security Gateway · {branding.version} · Active Telemetry
          </div>
          <div>            <p>
              Created by AayushBabu Enterprises
            </p></div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* RIGHT SECTION: Dedicated Login Page & Login Box with Credentials */}
      {/* ============================================================== */}
      <section
        className="w-full lg:w-[28%] xl:w-[25%] flex items-center justify-center p-6 sm:p-10 lg:p-8 bg-[var(--color-surface)] border-t lg:border-t-0 lg:border-l border-[var(--color-border)] shadow-2xl relative z-20 min-h-[520px]"
        aria-label="User authentication login section"
      >
        <div className="w-full max-w-sm space-y-6">
          {/* Brand Logo & Greeting */}
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
              Enter your credentials to access the {branding.shortName} HRMS workspace.
            </p>
          </div>

          {/* Session Expired Alert */}
          {expired && (
            <div
              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 animate-in fade-in"
              role="alert"
            >
              <Icon name="alert" size={15} className="shrink-0" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div
              className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2 animate-in fade-in"
              role="alert"
            >
              <Icon name="close" size={15} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form Box */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@northstar.edu"
                  required
                  disabled={loading}
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
              </div>
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
                <span className="text-[10.5px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                  Forgot password?
                </span>
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full h-10 pl-9 pr-10 text-xs rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 transition-colors cursor-pointer"
                >
                  <Icon name={showPassword ? 'close' : 'sparkles'} size={14} />
                </button>
              </div>
            </div>

            {/* Remember Device Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--color-text-muted)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] size-3.5"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Quick Demo Credentials Shortcuts */}
          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-text-muted)]">
              <span>Sample Logins (1-Click Fill)</span>
              <Icon name="sparkles" size={12} className="text-amber-500" />
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {SAMPLE_LOGINS.map((sample: SampleLogin) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => fillDemo(sample.email, sample.password)}
                  className="px-2 py-1.5 text-[10.5px] font-semibold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-canvas-secondary)] hover:border-[var(--color-primary)] text-[var(--color-text)] transition-colors text-center cursor-pointer flex flex-col items-center justify-center gap-0.5"
                  title={`${sample.label}: ${sample.email} / ${sample.password}`}
                >
                  <span className="font-bold">Fill {sample.label.split(' ')[0]}</span>
                  <span className="text-[9px] text-[var(--color-text-muted)] font-normal">{sample.badge}</span>
                </button>
              ))}
            </div>

            {/* Quick credentials reference table */}
            <div className="pt-2 border-t border-[var(--color-border)]/70 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] block">
                Official Sample Credentials
              </span>
              <div className="space-y-1 text-[10.5px] font-mono">
                {SAMPLE_LOGINS.map((sample: SampleLogin) => (
                  <div
                    key={sample.id}
                    onClick={() => fillDemo(sample.email, sample.password)}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--color-canvas-secondary)] cursor-pointer transition-colors border border-transparent hover:border-[var(--color-border)]"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        fillDemo(sample.email, sample.password);
                      }
                    }}
                    title={`Click to fill ${sample.label} credentials`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-[var(--color-text)]">{sample.id}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">({sample.role})</span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{sample.password}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Institutional Footer */}
          <footer className="pt-4 text-center border-t border-[var(--color-border)] space-y-1">
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
