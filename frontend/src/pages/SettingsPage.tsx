import { useAuth } from '../app/authContext'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'

export function SettingsPage() {
  const { email } = useAuth()
  return (
    <>
      <PageHeader eyebrow="WORKSPACE PREFERENCES" title="Settings" description="Manage your profile and workspace preferences." />
      <section className="panel settings-card">
        <div className="settings-heading"><div className="settings-icon"><Icon name="users" size={19} /></div><div><h2>Your account</h2><p>Signed-in account information.</p></div></div>
        <div className="settings-row"><span>Work email</span><strong>{email}</strong></div>
        <div className="settings-row"><span>Workspace</span><strong>Northstar Institute</strong></div>
        <div className="settings-row"><span>Authentication</span><strong><span className="status-dot" /> Secure session</strong></div>
        <div className="settings-note"><Icon name="warning" size={17} /><span>Profile and security changes are managed by your HR administrator.</span></div>
      </section>
      <section className="settings-placeholder"><span className="settings-placeholder-icon"><Icon name="settings" size={19} /></span><div><strong>More settings are on the way</strong><p>Organization preferences and user management will be available here as the HRMS grows.</p></div></section>
    </>
  )
}
