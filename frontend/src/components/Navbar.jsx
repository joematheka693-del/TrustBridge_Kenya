import { Link, NavLink, useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, ChevronDown, ClipboardCheck, Gauge, LayoutDashboard, LogOut, Menu, ShieldCheck, Star, UserCircle, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { getDashboardPath, roleLabels } from '../utils/roleAccess.js'
import ThemeSwitcher from './ThemeSwitcher.jsx'
import '../styles/navbar.css'

const guestLinks = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Talent', to: '/talent' },
]

const roleLinks = {
  member: [
    { label: 'Home', to: '/' },
    { label: 'Jobs', to: '/jobs' },
    { label: 'Talent', to: '/talent' },
    { label: 'Dashboard', to: '/member/dashboard' },
  ],
  freelancer: [
    { label: 'Jobs', to: '/jobs' },
    { label: 'Profile', to: '/profile-builder' },
    { label: 'Applications', to: '/applications' },
    { label: 'Dashboard', to: '/freelancer/dashboard' },
  ],
  client: [
    { label: 'Post Job', to: '/post-job' },
    { label: 'Talent', to: '/talent' },
    { label: 'Invites', to: '/applications' },
    { label: 'Dashboard', to: '/client/dashboard' },
  ],
  admin: [
    { label: 'Command', to: '/admin/dashboard' },
    { label: 'Users', to: '/admin/users' },
    { label: 'Moderation', to: '/admin/jobs' },
    { label: 'Audit', to: '/admin/system-audit' },
  ],
}

const dropdownLinks = {
  member: [
    { label: 'Member dashboard', to: '/member/dashboard', icon: LayoutDashboard },
    { label: 'Verification', to: '/verification', icon: ShieldCheck },
    { label: 'Trust score', to: '/trust-score', icon: Star },
  ],
  freelancer: [
    { label: 'Freelancer dashboard', to: '/freelancer/dashboard', icon: LayoutDashboard },
    { label: 'Profile builder', to: '/profile-builder', icon: Users },
    { label: 'Applications', to: '/applications', icon: ClipboardCheck },
    { label: 'Trust score', to: '/trust-score', icon: Star },
  ],
  client: [
    { label: 'Client dashboard', to: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Post job', to: '/post-job', icon: BriefcaseBusiness },
    { label: 'Client jobs', to: '/client/jobs', icon: ClipboardCheck },
    { label: 'Hiring trust', to: '/trust-score', icon: Star },
  ],
  admin: [
    { label: 'Admin command center', to: '/admin/dashboard', icon: Gauge },
    { label: 'User management', to: '/admin/users', icon: Users },
    { label: 'Verification queue', to: '/admin/verification', icon: ShieldCheck },
    { label: 'System audit', to: '/admin/system-audit', icon: ClipboardCheck },
  ],
}

function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, user, role, logout } = useAuth()
  const links = isAuthenticated ? roleLinks[role] || roleLinks.member : guestLinks
  const accountLinks = dropdownLinks[role] || dropdownLinks.member

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg trust-navbar sticky-top">
      <div className="container trust-navbar-inner">
        <Link className="navbar-brand trust-brand" to="/">
          <span className="trust-brand-icon"><ShieldCheck size={20} /></span>
          <span>TrustBridge Kenya</span>
        </Link>

        <button className="navbar-toggler trust-menu-btn" type="button" data-bs-toggle="collapse" data-bs-target="#trustNavbar" aria-controls="trustNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <Menu size={22} />
        </button>

        <div className="collapse navbar-collapse" id="trustNavbar">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 trust-nav-links">
            {links.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink className="nav-link" to={link.to}>{link.label}</NavLink>
              </li>
            ))}
          </ul>

          <div className="trust-nav-actions">
            <ThemeSwitcher />
            {isAuthenticated ? (
              <div className="dropdown">
                <button className={`btn trust-profile-btn trust-profile-${role} dropdown-toggle`} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <UserCircle size={18} />
                  <span className="trust-profile-name">{user?.name}</span>
                  <span className="trust-role-badge">{roleLabels[role] || role}</span>
                  <ChevronDown size={16} />
                </button>
                <ul className="dropdown-menu dropdown-menu-end trust-dropdown">
                  <li><span className="dropdown-item-text trust-dropdown-user">{user?.email}</span></li>
                  <li><span className="dropdown-item-text">Workspace: {roleLabels[role] || role}</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><Link className="dropdown-item" to={getDashboardPath(role)}><LayoutDashboard size={16} /> Main dashboard</Link></li>
                  {accountLinks.map((item) => {
                    const Icon = item.icon

                    return (
                      <li key={item.to}><Link className="dropdown-item" to={item.to}><Icon size={16} /> {item.label}</Link></li>
                    )
                  })}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item trust-logout-item" type="button" onClick={handleLogout}><LogOut size={16} /> Logout</button></li>
                </ul>
              </div>
            ) : (
              <Link className="btn trust-primary-btn" to="/auth">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
