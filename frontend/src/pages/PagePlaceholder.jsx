import DashboardLayout from './DashboardLayout.jsx'
import '../styles/pagePlaceholder.css'

function PagePlaceholder({ title, kicker, description, cards = [] }) {
  return (
    <DashboardLayout title={title} kicker={kicker} description={description}>
      <div className="placeholder-grid">
        {cards.map((card) => (
          <article className="placeholder-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <div className="placeholder-meta">
              <span>{card.status}</span>
            </div>
          </article>
        ))}
      </div>
    </DashboardLayout>
  )
}

export default PagePlaceholder
