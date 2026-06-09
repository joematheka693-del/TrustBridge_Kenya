import RoleSidebar from '../components/RoleSidebar.jsx'
import BackendStatusBanner from '../components/BackendStatusBanner.jsx'
import '../styles/dashboardLayout.css'

function DashboardLayout({ title, kicker, description, children }) {
  return (
    <section className="dashboard-layout-page">
      <div className="container dashboard-layout-grid">
        <RoleSidebar />
        <div className="dashboard-workspace">
          <header className="dashboard-workspace-header">
            <span className="section-kicker">{kicker}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </header>
          <BackendStatusBanner compact />
          {children}
        </div>
      </div>
    </section>
  )
}

export default DashboardLayout
