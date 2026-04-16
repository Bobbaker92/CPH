import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, MapPin, Inbox, Calendar, ArrowRight, MoreVertical, Phone, FileText, Plus, Euro, Sun, AlertCircle } from 'lucide-react'

const INTERVENTIONS = [
  { id: 1, client: 'Jean-Pierre Martin', ville: 'Marseille 13008', date: '04/05/2026', creneau: '10h-12h', couvreur: 'Karim Z.', statut: 'Planifi\u00E9', potentiel: 'Fa\u00EEtage + Rives' },
  { id: 2, client: 'Marie Duval', ville: 'Marseille 13012', date: '04/05/2026', creneau: '14h-16h', couvreur: 'Karim Z.', statut: 'Planifi\u00E9', potentiel: '-' },
  { id: 3, client: 'Paul Roche', ville: 'Aubagne 13400', date: '05/05/2026', creneau: '8h-10h', couvreur: 'Karim Z.', statut: 'Planifi\u00E9', potentiel: '-' },
  { id: 4, client: 'Sophie Blanc', ville: 'Marseille 13004', date: '12/05/2026', creneau: '10h-12h', couvreur: 'Karim Z.', statut: 'Planifi\u00E9', potentiel: '-' },
  { id: 5, client: 'Ahmed Mansour', ville: 'Aix 13100', date: '18/05/2026', creneau: '8h-10h', couvreur: 'Karim Z.', statut: 'Planifi\u00E9', potentiel: '-' },
]

const LEADS_COUVERTURE = [
  { client: 'Robert Vidal', ville: 'Marseille 13005', prestation: 'Fa\u00EEtage closoir 8ml', montant: 2800, statut: 'Devis envoy\u00E9' },
  { client: 'Nathalie Perrin', ville: 'Aix 13090', prestation: 'Hydrofuge toiture 80m\u00B2', montant: 1400, statut: 'En attente' },
  { client: 'Marc Lefebvre', ville: 'Toulon 83000', prestation: 'Rives + fa\u00EEtage', montant: 4200, statut: 'Sign\u00E9' },
]

// Mini sparkline inline
function Sparkline({ points, color = 'var(--green)' }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = 80
  const h = 24
  const step = w / (points.length - 1)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - ((p - min) / range) * h).toFixed(1)}`).join(' ')
  const lastX = w
  const lastY = h - ((points[points.length - 1] - min) / range) * h
  return (
    <svg width={w} height={h} className="sparkline" aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  )
}

export default function AdminHome() {
  const navigate = useNavigate()

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Bonjour Fares 👋</h1>
            <p>Voici votre activit&eacute; du moment, mercredi 15 avril 2026.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-sm btn-outline" onClick={() => navigate('/admin/planning')}><Calendar size={14} /> Planning</button>
            <button className="btn btn-sm btn-primary"><Plus size={14} /> Nouvelle intervention</button>
          </div>
        </div>
      </div>

      {/* Alerte demandes */}
      <Link to="/admin/demandes" className="admin-alert">
        <span className="admin-alert-icon"><AlertCircle size={18} /></span>
        <div className="admin-alert-body">
          <strong>3 nouvelles demandes &agrave; traiter</strong>
          <span>Pierre Vidal, Sophie Lambert&hellip; Le plus ancien attend depuis 2 heures.</span>
        </div>
        <span className="admin-alert-cta">Voir les demandes <ArrowRight size={14} /></span>
      </Link>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-head">
            <div>
              <div className="stat-label">Interventions ce mois</div>
              <div className="stat-value">18</div>
            </div>
            <Sparkline points={[8,12,9,14,11,15,18]} />
          </div>
          <div className="stat-change"><TrendingUp size={12} /> +28% vs mars</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div>
              <div className="stat-label">CA nettoyage</div>
              <div className="stat-value">3&nbsp;582&nbsp;&euro;</div>
            </div>
            <Sparkline points={[1200,1800,1500,2200,2000,2800,3582]} color="var(--accent)" />
          </div>
          <div className="stat-change"><Euro size={12} /> 18 &times; 199&nbsp;&euro;</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div>
              <div className="stat-label">Leads couverture</div>
              <div className="stat-value">7</div>
            </div>
            <Sparkline points={[2,3,4,3,5,6,7]} color="var(--blue)" />
          </div>
          <div className="stat-change">39% des interventions</div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-card-head">
            <div>
              <div className="stat-label">CA couverture potentiel</div>
              <div className="stat-value">12&nbsp;400&nbsp;&euro;</div>
            </div>
            <Sparkline points={[3000,4500,6000,7000,9000,10500,12400]} color="var(--green)" />
          </div>
          <div className="stat-change">3 devis sign&eacute;s</div>
        </div>
      </div>

      <div className="home-grid">
        {/* Prochaines interventions */}
        <div className="table-card admin-list-card">
          <div className="table-header">
            <div>
              <h3>Prochaines interventions</h3>
              <p className="table-header-sub">Les 5 plus proches</p>
            </div>
            <Link to="/admin/planning" className="btn btn-sm btn-ghost">Tout voir <ArrowRight size={12} /></Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Ville</th>
                <th>Date</th>
                <th>Cr&eacute;neau</th>
                <th>Couvreur</th>
                <th>Couverture</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {INTERVENTIONS.map(i => (
                <tr key={i.id}>
                  <td data-label="Client"><strong>{i.client}</strong></td>
                  <td data-label="Ville"><span className="cell-with-icon"><MapPin size={12} /> {i.ville}</span></td>
                  <td data-label="Date">{i.date}</td>
                  <td data-label="Cr&eacute;neau"><span className="cell-chip">{i.creneau}</span></td>
                  <td data-label="Couvreur">{i.couvreur}</td>
                  <td data-label="Couverture">
                    {i.potentiel !== '-'
                      ? <span className="badge badge-orange">{i.potentiel}</span>
                      : <span className="muted">&mdash;</span>}
                  </td>
                  <td data-label=""><button className="icon-btn"><MoreVertical size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leads couverture */}
        <div className="table-card admin-list-card">
          <div className="table-header">
            <div>
              <h3>Leads couverture</h3>
              <p className="table-header-sub">G&eacute;n&eacute;r&eacute;s par nos nettoyages</p>
            </div>
            <span className="badge badge-green">3 ce mois</span>
          </div>
          <div className="leads-list">
            {LEADS_COUVERTURE.map((l, i) => (
              <div key={i} className="lead-item">
                <div className="lead-item-main">
                  <div className="lead-item-head">
                    <strong>{l.client}</strong>
                    <span className={`badge ${l.statut === 'Sign\u00E9' ? 'badge-green' : l.statut === 'Devis envoy\u00E9' ? 'badge-blue' : 'badge-orange'}`}>
                      {l.statut}
                    </span>
                  </div>
                  <p className="lead-item-ville"><MapPin size={11} /> {l.ville}</p>
                  <p className="lead-item-desc">{l.prestation}</p>
                </div>
                <div className="lead-item-side">
                  <div className="lead-item-amount">{l.montant.toLocaleString('fr-FR')}&nbsp;&euro;</div>
                  <div className="lead-item-actions">
                    <button className="icon-btn" title="Appeler"><Phone size={14} /></button>
                    <button className="icon-btn" title="Devis"><FileText size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
