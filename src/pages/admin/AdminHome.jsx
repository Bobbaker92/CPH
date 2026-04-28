import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, MapPin, Calendar, ArrowRight, MoreVertical, Euro, AlertCircle, Users, Gift, PhoneCall } from 'lucide-react'
import { getDemandes, subscribe as subDemandes, SOURCE_META } from '../../lib/demandesStore'
import { getInterventions, subscribe as subInterventions } from '../../lib/interventionsStore'
import { getClients, subscribe as subClients } from '../../lib/clientsStore'
import { getParrainages, subscribe as subParrainages } from '../../lib/parrainagesStore'

function formatDateFR(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function shortCouvreur(full) {
  if (!full) return ''
  const parts = full.split(' ')
  if (parts.length < 2) return full
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function getStartOfWeek(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function getEndOfWeek(date = new Date()) {
  const start = getStartOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function pickSemaineReference(interventions, now = new Date()) {
  const currentStart = getStartOfWeek(now)
  const currentEnd = getEndOfWeek(now)

  const inCurrent = interventions.filter((i) => {
    if (!i.date) return false
    const d = new Date(`${i.date}T12:00:00`)
    return d >= currentStart && d <= currentEnd
  })
  if (inCurrent.length > 0) return { start: currentStart, end: currentEnd }

  const upcoming = interventions
    .filter((i) => i.date)
    .map((i) => new Date(`${i.date}T12:00:00`))
    .filter((d) => d >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => a - b)

  if (upcoming.length === 0) return { start: currentStart, end: currentEnd }

  const nextStart = getStartOfWeek(upcoming[0])
  const nextEnd = getEndOfWeek(upcoming[0])
  return { start: nextStart, end: nextEnd }
}

function parseDateRecu(value) {
  const now = new Date()
  const text = String(value || '').trim().toLowerCase()

  if (!text) return new Date(0)
  if (text.includes('à l\'instant')) return new Date(now.getTime() + 1)

  const timeMatch = text.match(/(\d{1,2}):(\d{2})/)
  const hh = timeMatch ? Number(timeMatch[1]) : 12
  const mm = timeMatch ? Number(timeMatch[2]) : 0

  if (text.includes('aujourd')) {
    const d = new Date(now)
    d.setHours(hh, mm, 0, 0)
    return d
  }

  if (text.includes('hier')) {
    const d = new Date(now)
    d.setDate(d.getDate() - 1)
    d.setHours(hh, mm, 0, 0)
    return d
  }

  const daysAgo = text.match(/il y a\s+(\d+)\s+jours?/)
  if (daysAgo) {
    const d = new Date(now)
    d.setDate(d.getDate() - Number(daysAgo[1]))
    d.setHours(hh, mm, 0, 0)
    return d
  }

  const classic = text.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (classic) {
    const d = new Date(Number(classic[3]), Number(classic[2]) - 1, Number(classic[1]), hh, mm, 0, 0)
    return d
  }

  return new Date(0)
}

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
  const [demandes, setDemandes] = useState(() => getDemandes())
  const [interventions, setInterventions] = useState(() => getInterventions())
  const [clients, setClients] = useState(() => getClients())
  const [parrainages, setParrainages] = useState(() => getParrainages())

  useEffect(() => {
    const unsubDemandes = subDemandes(() => setDemandes(getDemandes()))
    const unsubInterventions = subInterventions(() => setInterventions(getInterventions()))
    const unsubClients = subClients(() => setClients(getClients()))
    const unsubParrainages = subParrainages(() => setParrainages(getParrainages()))

    return () => {
      unsubDemandes()
      unsubInterventions()
      unsubClients()
      unsubParrainages()
    }
  }, [])

  const kpis = useMemo(() => {
    const now = new Date()
    const weekRef = pickSemaineReference(interventions, now)
    const year = now.getFullYear()
    const month = now.getMonth()

    const nouvellesDemandes = demandes.filter((d) => d.statut === 'nouveau').length
    const aRappeler = demandes.filter((d) => d.statut === 'a-rappeler').length

    const interventionsSemaine = interventions.filter((i) => {
      if (!i.date) return false
      const d = new Date(`${i.date}T12:00:00`)
      return d >= weekRef.start && d <= weekRef.end
    }).length

    const interventionsMoisCA = interventions.filter((i) => {
      if (!i.date) return false
      const d = new Date(`${i.date}T12:00:00`)
      return d.getFullYear() === year
        && d.getMonth() === month
        && (i.statut === 'planifie' || i.statut === 'terminee' || i.statut === 'termine')
    }).length

    const caEstimeMois = interventionsMoisCA * 199
    const clientsTotal = clients.length
    const parrainagesActifs = parrainages.filter((p) => p.statut === 'envoye' || p.statut === 'inscrit').length

    return {
      nouvellesDemandes,
      aRappeler,
      interventionsSemaine,
      caEstimeMois,
      clientsTotal,
      parrainagesActifs,
    }
  }, [clients, demandes, interventions, parrainages])

  const prochaines = useMemo(() => {
    const now = new Date()
    return [...interventions]
      .filter((i) => {
        if (!i.date) return false
        if (i.statut === 'annulee') return false
        const d = new Date(`${i.date}T00:00:00`)
        return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      })
      .sort((a, b) => {
        const aKey = `${a.date || ''} ${a.heureSort || ''}`
        const bKey = `${b.date || ''} ${b.heureSort || ''}`
        return aKey.localeCompare(bKey)
      })
      .slice(0, 3)
  }, [interventions])

  const derniersLeads = useMemo(() => {
    return [...demandes]
      .sort((a, b) => parseDateRecu(b.dateRecu) - parseDateRecu(a.dateRecu))
      .slice(0, 5)
  }, [demandes])

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Bonjour Fares 👋</h1>
            <p>Vue en temps réel de votre activité commerciale et opérationnelle.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-sm btn-outline" onClick={() => navigate('/admin/planning')}><Calendar size={14} /> Planning</button>
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/admin/demandes')}><ArrowRight size={14} /> Voir demandes</button>
          </div>
        </div>
      </div>

      <Link to="/admin/demandes" className="admin-alert">
        <span className="admin-alert-icon"><AlertCircle size={18} /></span>
        <div className="admin-alert-body">
          <strong>{kpis.nouvellesDemandes} nouvelles demandes à traiter</strong>
          <span>{kpis.aRappeler} demande(s) à rappeler.</span>
        </div>
        <span className="admin-alert-cta">Voir les demandes <ArrowRight size={14} /></span>
      </Link>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-head">
            <div>
              <div className="stat-label">Nouvelles demandes</div>
              <div className="stat-value">{kpis.nouvellesDemandes}</div>
            </div>
            <Sparkline points={[0, 1, 2, 2, 3, 3, kpis.nouvellesDemandes || 0]} color="var(--orange)" />
          </div>
          <div className="stat-change"><PhoneCall size={12} /> Leads entrants</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-head">
            <div>
              <div className="stat-label">À rappeler</div>
              <div className="stat-value">{kpis.aRappeler}</div>
            </div>
            <Sparkline points={[0, 1, 1, 2, 1, 2, kpis.aRappeler || 0]} color="var(--blue)" />
          </div>
          <div className="stat-change">Priorité commerciale</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-head">
            <div>
              <div className="stat-label">Interventions cette semaine</div>
              <div className="stat-value">{kpis.interventionsSemaine}</div>
            </div>
            <Sparkline points={[0, 1, 2, 3, 4, 4, kpis.interventionsSemaine || 0]} />
          </div>
          <div className="stat-change"><TrendingUp size={12} /> Charge terrain</div>
        </div>

        <div className="stat-card stat-card-highlight">
          <div className="stat-card-head">
            <div>
              <div className="stat-label">CA estimé du mois</div>
              <div className="stat-value">{kpis.caEstimeMois.toLocaleString('fr-FR')}&nbsp;&euro;</div>
            </div>
            <Sparkline points={[199, 398, 597, 995, 1592, 1990, kpis.caEstimeMois || 0]} color="var(--green)" />
          </div>
          <div className="stat-change"><Euro size={12} /> Base 199 € / intervention</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-head">
            <div>
              <div className="stat-label">Clients total</div>
              <div className="stat-value">{kpis.clientsTotal}</div>
            </div>
            <Sparkline points={[2, 3, 4, 5, 6, 7, kpis.clientsTotal || 0]} color="var(--accent)" />
          </div>
          <div className="stat-change"><Users size={12} /> Base clients active</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-head">
            <div>
              <div className="stat-label">Parrainages actifs</div>
              <div className="stat-value">{kpis.parrainagesActifs}</div>
            </div>
            <Sparkline points={[0, 1, 1, 2, 2, 3, kpis.parrainagesActifs || 0]} color="var(--blue)" />
          </div>
          <div className="stat-change"><Gift size={12} /> Envoyés + inscrits</div>
        </div>
      </div>

      <div className="home-grid">
        <div className="table-card admin-list-card">
          <div className="table-header">
            <div>
              <h3>Prochaines interventions</h3>
              <p className="table-header-sub">Les 3 plus proches</p>
            </div>
            <Link to="/admin/planning" className="btn btn-sm btn-ghost">Tout voir <ArrowRight size={12} /></Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Ville</th>
                <th>Date</th>
                <th>Créneau</th>
                <th>Couvreur</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {prochaines.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '20px 0' }}>Aucune intervention planifiée.</td></tr>
              )}
              {prochaines.map((i) => (
                <tr key={i.id} onClick={() => navigate('/admin/planning')} style={{ cursor: 'pointer' }}>
                  <td data-label="Client"><strong>{i.client}</strong></td>
                  <td data-label="Ville"><span className="cell-with-icon"><MapPin size={12} /> {i.ville}</span></td>
                  <td data-label="Date">{formatDateFR(i.date)}</td>
                  <td data-label="Créneau"><span className="cell-chip">{i.heure}</span></td>
                  <td data-label="Couvreur">{shortCouvreur(i.couvreur)}</td>
                  <td data-label="Statut">
                    <span className={`badge ${i.statut === 'terminee' || i.statut === 'termine' ? 'badge-green' : i.statut === 'a-confirmer' ? 'badge-orange' : i.statut === 'en-cours' ? 'badge-blue' : 'badge-gray'}`}>
                      {i.statut}
                    </span>
                  </td>
                  <td data-label=""><button className="icon-btn" onClick={() => navigate('/admin/planning')}><MoreVertical size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card admin-list-card">
          <div className="table-header">
            <div>
              <h3>Derniers leads</h3>
              <p className="table-header-sub">5 plus récents</p>
            </div>
            <span className="badge badge-green">{kpis.nouvellesDemandes} nouveaux</span>
          </div>
          <div className="leads-list">
            {derniersLeads.map((lead) => (
              <div key={lead.id} className="lead-item" onClick={() => navigate('/admin/demandes')} style={{ cursor: 'pointer' }}>
                <div className="lead-item-main">
                  <div className="lead-item-head">
                    <strong>{lead.nom}</strong>
                    <span className={`badge ${lead.statut === 'nouveau' ? 'badge-red' : lead.statut === 'a-rappeler' ? 'badge-orange' : lead.statut === 'planifie' ? 'badge-blue' : 'badge-gray'}`}>
                      {lead.statut}
                    </span>
                  </div>
                  <p className="lead-item-ville"><MapPin size={11} /> {lead.ville}</p>
                  <p className="lead-item-desc">{lead.dateRecu}</p>
                </div>
                <div className="lead-item-side">
                  <div className={`badge ${SOURCE_META[lead.source]?.cls || 'badge-gray'}`} style={{ whiteSpace: 'nowrap' }}>
                    {SOURCE_META[lead.source]?.icon || ''} {lead.source}
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
