import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck, UserCog, Users, UserX } from 'lucide-react'
import DashboardLayout from './DashboardLayout.jsx'
import AdminMetricGrid from '../components/AdminMetricGrid.jsx'
import AdminUserTable from '../components/AdminUserTable.jsx'
import StateNotice from '../components/StateNotice.jsx'
import { demoAdminUsers } from '../data/demoAdminUsers.js'
import { deleteAdminUser, getAdminUsers, updateUserRole, updateUserStatus } from '../services/adminApi.js'
import '../styles/adminUsers.css'

function AdminUsers() {
  const [users, setUsers] = useState(demoAdminUsers)
  const [roleFilter, setRoleFilter] = useState('all')
  const [backendMessage, setBackendMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      try {
        const response = await getAdminUsers({ role: roleFilter })
        const backendUsers = response?.users || []
        if (isMounted) {
          setUsers(backendUsers.length > 0 ? backendUsers : demoAdminUsers)
          setBackendMessage(backendUsers.length > 0 ? 'Admin users API connected.' : 'Backend returned no users, so preview users are shown.')
        }
      } catch (error) {
        if (isMounted) {
          setUsers(demoAdminUsers)
          setBackendMessage(error?.message || 'Admin users API unavailable. Preview users are shown.')
        }
      }
    }

    loadUsers()

    return () => {
      isMounted = false
    }
  }, [roleFilter])

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'all') return users
    return users.filter((user) => user.role === roleFilter)
  }, [roleFilter, users])

  const metrics = [
    { title: 'Total platform users', label: 'users', value: users.length, icon: Users },
    { title: 'Admin accounts', label: 'admins', value: users.filter((user) => user.role === 'admin').length, icon: ShieldCheck },
    { title: 'Accounts under review', label: 'review', value: users.filter((user) => user.status === 'review').length, icon: UserCog },
    { title: 'Suspended accounts', label: 'safety', value: users.filter((user) => user.status === 'suspended').length, icon: UserX },
  ]

  const handleRoleChange = async (userId, role) => {
    setUsers((current) => current.map((user) => (user.id || user.user_id) === userId ? { ...user, role } : user))
    try {
      await updateUserRole(userId, role)
      setBackendMessage('User role updated in backend.')
    } catch (error) {
      setBackendMessage(error?.message || 'Role changed locally, but backend update failed.')
    }
  }

  const handleStatusChange = async (userId, status) => {
    setUsers((current) => current.map((user) => (user.id || user.user_id) === userId ? { ...user, status } : user))
    try {
      await updateUserStatus(userId, status)
      setBackendMessage('User status updated in backend.')
    } catch (error) {
      setBackendMessage(error?.message || 'Status changed locally, but backend update failed.')
    }
  }

  const handleDeleteUser = async (userId) => {
    setUsers((current) => current.filter((user) => (user.id || user.user_id) !== userId))
    try {
      await deleteAdminUser(userId)
      setBackendMessage('User deleted in backend.')
    } catch (error) {
      setBackendMessage(error?.message || 'User removed locally, but backend delete failed.')
    }
  }

  return (
    <DashboardLayout title="Admin User Management" kicker="admin only" description="Control users, roles, safety status, account review, and admin separation from one protected workspace.">
      {backendMessage && <StateNotice type={backendMessage.includes('updated') || backendMessage.includes('connected') || backendMessage.includes('deleted') ? 'success' : 'warning'} title="Admin users API status" description={backendMessage} />}
      <AdminMetricGrid metrics={metrics} />

      <section className="admin-users-toolbar">
        <div>
          <p className="page-kicker">role filter</p>
          <h2>Separate users by role</h2>
        </div>
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
          <option value="all">All roles</option>
          <option value="member">Members</option>
          <option value="freelancer">Freelancers</option>
          <option value="client">Clients</option>
          <option value="admin">Admins</option>
        </select>
      </section>

      <AdminUserTable users={filteredUsers} onRoleChange={handleRoleChange} onStatusChange={handleStatusChange} onDeleteUser={handleDeleteUser} />
    </DashboardLayout>
  )
}

export default AdminUsers
