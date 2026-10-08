import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../app/authContext'
import { healthApi } from '../api/services'
import { Icon, type IconName } from '../components/Icon'

const navigation: { title: string; items: { label: string; to: string; icon: IconName }[] }[] = [
  {
    title: 'WORKSPACE',
    items: [
      { label: 'Overview', to: '/', icon: 'grid' },
      { label: 'Employees', to: '/employees', icon: 'users' },
      { label: 'Departments', to: '/departments', icon: 'building' },
    ],
  },
  {
    title: 'TIME & ATTENDANCE',
    items: [
      { label: 'Attendance', to: '/attendance', icon: 'clock' },
      { label: 'Biometric logs', to: '/biometric', icon: 'fingerprint' },
      { label: 'Leave', to: '/leave', icon: 'calendar' },
    ],
  },
]

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/employees': 'Employees',
  '/departments': 'Departments',
  '/attendance': 'Attendance',
  '/biometric': 'Biometric logs',
  '/leave': 'Leave management',
  '/settings': 'Settings',
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { email, logout } = useAuth()
  const health = useQuery({ queryKey: ['health'], queryFn: healthApi.get, retry: false })
  const title = location.pathname.startsWith('/employees/')
    ? 'Employee profile'
    : pageTitles[location.pathname] ?? 'Workspace'
  const userInitial = email.charAt(0).toUpperCase() || 'A'

  return (
    <div className="app-shell min-h-screen">
      {sidebarOpen && <button className="mobile-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark">N</div>
          <div className="brand-copy"><strong>Northstar</strong><span>INSTITUTION HRMS</span></div>
          <button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">NI</div>
          <div className="workspace-copy"><span>Workspace</span><strong>Northstar Institute</strong></div>
          <Icon name="chevron" size={16} className="workspace-chevron" />
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-label">{group.title}</div>
              {group.items.map((item) => (
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  key={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                  {item.to === '/leave' && <span className="nav-count">3</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <Icon name="settings" size={18} /><span>Settings</span>
          </NavLink>
          <div className="sidebar-divider" />
          <div className="user-profile">
            <div className="user-avatar">{userInitial}</div>
            <div className="user-copy"><strong>{email.split('@')[0] || 'Administrator'}</strong><span>HR Administrator</span></div>
            <button className="icon-button logout-button" onClick={() => void logout()} aria-label="Sign out" title="Sign out">
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
              <Icon name="menu" />
            </button>
            <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>{title}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className={`system-status ${health.isError ? 'system-status-error' : ''}`}><span className="status-dot" /> {health.isPending ? 'Checking systems' : health.isError ? 'Connection issue' : 'All systems operational'}</div>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Icon name="bell" size={19} /><i />
            </button>
            <div className="topbar-avatar">{userInitial}</div>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  )
}
