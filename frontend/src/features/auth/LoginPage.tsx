import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/authContext'
import { getErrorMessage } from '../../api/client'
import { Icon } from '../../components/Icon'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate('/', { replace: true })
    } catch (loginError) {
      setError(getErrorMessage(loginError, 'Sign in failed. Check your credentials.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-screen min-h-screen">
      <div className="login-aside">
        <div className="login-brand">
          <div className="brand-mark">N</div>
          <div className="brand-copy"><strong>Northstar</strong><span>INSTITUTION HRMS</span></div>
        </div>
        <div className="login-story">
          <div className="story-kicker"><span /> PEOPLE, WITH PURPOSE</div>
          <h1>Make room for<br /><em>great work.</em></h1>
          <p>A thoughtful workspace for the people who make your institution move forward.</p>
          <div className="story-quote">
            <div className="quote-avatars"><span>AM</span><span>PK</span><span>SR</span><b>+12</b></div>
            <div><strong>People make the difference.</strong><span>Everything you need to support them.</span></div>
          </div>
        </div>
        <div className="login-aside-footer"><span>BUILT FOR YOUR INSTITUTION</span><span>PRIVATE · SECURE · LOCAL</span></div>
        <div className="aside-decoration aside-decoration-one" />
        <div className="aside-decoration aside-decoration-two" />
      </div>
      <div className="login-main">
        <div className="login-top-note">NEW TO YOUR WORKSPACE? <span>Contact your HR administrator</span></div>
        <div className="login-form-wrap">
          <div className="login-mobile-brand"><div className="brand-mark">N</div> Northstar HRMS</div>
          <div className="login-heading">
            <div className="login-icon"><Icon name="spark" size={21} /></div>
            <h2>Welcome back</h2>
            <p>Sign in to your people workspace.</p>
          </div>
          {location.state?.expired && <div className="inline-notice">Your session expired. Please sign in again.</div>}
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Work email</label>
            <div className="input-wrap"><Icon name="mail" size={18} /><input id="email" type="email" autoComplete="username" placeholder="you@institution.edu" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div className="password-label"><label htmlFor="password">Password</label><button type="button" className="text-button" onClick={() => setError('Please contact your HR administrator to reset your password.')}>Forgot password?</button></div>
            <div className="input-wrap"><Icon name="briefcase" size={18} /><input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={12} /></div>
            {error && <div className="form-error" role="alert"><Icon name="warning" size={16} />{error}</div>}
            <button className="button button-primary login-submit" type="submit" disabled={submitting}>
              {submitting ? <><span className="button-spinner" /> Signing in…</> : <>Sign in to workspace <Icon name="arrow" size={17} /></>}
            </button>
          </form>
          <div className="login-security"><span className="secure-symbol">✓</span><span>Your workspace is private and protected.</span></div>
        </div>
        <div className="login-footer"><span>© 2026 Northstar Institute</span><span>NEED HELP? <a href="mailto:hr@institution.edu">CONTACT SUPPORT</a></span></div>
      </div>
    </div>
  )
}
