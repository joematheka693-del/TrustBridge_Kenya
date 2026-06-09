import { ShieldCheck, Trash2, UserCog, UserX } from 'lucide-react'
import '../styles/adminUserTable.css'

const roleOptions = ['member', 'freelancer', 'client', 'admin']

function AdminUserTable({ users, onRoleChange, onStatusChange, onDeleteUser }) {
  return (
    <div className="admin-table-shell">
      <div className="admin-table-header">
        <div>
          <p className="page-kicker">admin users</p>
          <h2>User and role management</h2>
        </div>
        <span>{users.length} users</span>
      </div>

      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Trust</th>
              <th>Flags</th>
              <th>Last active</th>
              <th>Controls</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id || user.user_id}>
                <td>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </td>
                <td>
                  <select value={user.role} onChange={(event) => onRoleChange(user.id || user.user_id, event.target.value)}>
                    {roleOptions.map((role) => <option value={role} key={role}>{role}</option>)}
                  </select>
                </td>
                <td><span className={`status-pill status-${user.status}`}>{user.status}</span></td>
                <td>{user.trustScore || user.trust_score || 45}/100</td>
                <td>{user.flags || 0}</td>
                <td>{user.lastActive || user.updated_at || 'Not recorded'}</td>
                <td>
                  <div className="admin-table-actions">
                    <button type="button" onClick={() => onStatusChange(user.id || user.user_id, 'active')}><ShieldCheck size={16} /> Approve</button>
                    <button type="button" onClick={() => onStatusChange(user.id || user.user_id, 'review')}><UserCog size={16} /> Review</button>
                    <button type="button" className="danger-action" onClick={() => onStatusChange(user.id || user.user_id, 'suspended')}><UserX size={16} /> Suspend</button>
                    <button type="button" className="danger-action" onClick={() => onDeleteUser(user.id || user.user_id)}><Trash2 size={16} /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUserTable
