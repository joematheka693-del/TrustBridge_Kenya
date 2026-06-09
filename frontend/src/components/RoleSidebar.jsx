import { NavLink } from 'react-router-dom'
import { Activity, BriefcaseBusiness, ClipboardCheck, Gauge, LayoutDashboard, LockKeyhole, Search, ShieldCheck, Star, UserCog, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { roleLabels } from '../utils/roleAccess.js'
import '../styles/roleSidebar.css'

const roleMenus = {
  member: [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', to: '/jobs', icon: BriefcaseBusiness },
    { label: 'Talent', to: '/talent', icon: Users },
    { label: 'Verification', to: '/verification', icon: ShieldCheck },
    { label: 'Trust score', to: '/trust-score', icon: Star },
  ],
  freelancer: [
    { label: 'Freelancer home', to: '/freelancer/dashboard', icon: LayoutDashboard },
    { label: 'Profile builder', to: '/profile-builder', icon: UserCog },
    { label: 'Available jobs', to: '/jobs', icon: BriefcaseBusiness },
    { label: 'Applications', to: '/applications', icon: ClipboardCheck },
    { label: 'Verification', to: '/verification', icon: ShieldCheck },
    { label: 'Trust score', to: '/trust-score', icon: Star },
  ],
  client: [
    { label: 'Client home', to: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Post job', to: '/post-job', icon: BriefcaseBusiness },
    { label: 'My jobs', to: '/client/jobs', icon: ClipboardCheck },
    { label: 'Talent search', to: '/talent', icon: Search },
    { label: 'Invites', to: '/applications', icon: Users },
    { label: 'Hiring trust', to: '/trust-score', icon: Star },
  ],
  admin: [
    { label: 'Admin overview', to: '/admin/dashboard', icon: Gauge },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Jobs moderation', to: '/admin/jobs', icon: BriefcaseBusiness },
    { label: 'Application oversight', to: '/admin/applications', icon: ClipboardCheck },
    { label: 'Verification queue', to: '/admin/verification', icon: ShieldCheck },
    { label: 'Trust controls', to: '/admin/trust-controls', icon: Star },
    { label: 'Platform activity', to: '/admin/activity', icon: Activity },
    { label: 'System audit', to: '/admin/system-audit', icon: LockKeyhole },
  ],
}

function RoleSidebar() {
  const { role, user } = useAuth()
  const menuItems = roleMenus[role] || roleMenus.member

  return (
    <aside className={`role-sidebar role-sidebar-${role}`}>
      <div className="sidebar-profile-card">
        <span className="sidebar-role-pill">{roleLabels[role] || role}</span>
        <h2>{user?.name || 'TrustBridge User'}</h2>
        <p>{user?.email || 'No email available'}</p>
        <div className="sidebar-workspace-note">Separated {roleLabels[role] || role} workspace</div>
      </div>

      <nav className="sidebar-menu" aria-label={`${role} sidebar`}>
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink className="sidebar-link" to={item.to} key={item.label}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default RoleSidebar
