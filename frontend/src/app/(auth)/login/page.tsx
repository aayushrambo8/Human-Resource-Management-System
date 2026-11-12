'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Icon } from '@/components/ui/Icon';
import { BRANDING } from '@/lib/branding';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-card">
        <header className="login-header">
          {/* The visible label is the mark "N" + "Northstar". axe's
              label-content-name check compares the raw text-node concatenation,
              so an explicit whitespace node is required between them (it is not
              rendered as a flex item, so layout is unchanged) and the
              accessible name must contain the full visible string. */}
          <Link href="/" className="login-brand" aria-label={`${BRANDING.markLetter} ${BRANDING.name}`}>
            <div className="brand-mark" aria-hidden="true" style={{ background: BRANDING.theme.primaryAccent }}>
              {BRANDING.markLetter}
            </div>
            {' '}
            <span className="brand-name">{BRANDING.shortName}</span>
          </Link>
          <h1>Sign in to your account</h1>
          <p>Enter your credentials to access the dashboard</p>
        </header>

        {expired && (
          <div className="login-error" role="alert">
            <Icon name="alert" size={16} />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="login-error" role="alert">
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="admin@institution.local"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary login-submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <footer className="login-footer">
          <p>Northstar Institute HRMS — Self-hosted people operations</p>
        </footer>
      </main>
    </div>
  );
}