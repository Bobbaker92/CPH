import { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  MapPin, Clock, ChevronLeft, ChevronRight, Plus, Route,
  Calendar, List, Phone, Sun, Download, Check, X as XIcon, Edit3, Trash2,
  AlertTriangle, CheckCircle, Info
} from 'lucide-react'
import ActionMenu from '../../components/ActionMenu'
import AddInterventionModal from '../../components/AddInterventionModal'

const COUVREUR_UNIQUE = 'Karim Ziani'

const ALL_INTERVENTIONS_INIT = [
  // Lundi 4 mai — Marseille, 3 chantiers (1 grosse install → capacité standard 3)
  { id: 'i1', date: '2026-05-04', jour: 'Lundi 4 mai', heure: '8h-10h', client: 'Robert Vidal', ville: 'Marseille 13005', couvreur: COUVREUR_UNIQUE, panneaux: 12, statut: 'confirme' },
  { id: 'i2', date: '2026-05-04', jour: 'Lundi 4 mai', heure: '10h30-12h30', client: 'Jean-Pierre Martin', ville: 'Marseille 13008', couvreur: COUVREUR_UNIQUE, panneaux: 16, statut: 'confirme' },
  { id: 'i3', date: '2026-05-04', jour: 'Lundi 4 mai', heure: '14h-16h', client: 'Marie Duval', ville: 'Marseille 13012', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },

  // Mardi 5 mai — Aix/Gardanne, 2 chantiers (disponible)
  { id: 'i6', date: '2026-05-05', jour: 'Mardi 5 mai', heure: '9h-11h', client: 'Claire Dubois', ville: 'Aix 13100', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'confirme' },
  { id: 'i8', date: '2026-05-05', jour: 'Mardi 5 mai', heure: '14h-16h', client: 'Isabelle Morel', ville: 'Gardanne 13120', couvreur: COUVREUR_UNIQUE, panneaux: 16, statut: 'confirme' },

  // Lundi 12 mai — Toulon, 4 petites installations même secteur → capacité étendue
  { id: 'i9', date: '2026-05-12', jour: 'Lundi 12 mai', heure: '8h-9h30', client: 'Laurent Petit', ville: 'Toulon 83000', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
  { id: 'i10', date: '2026-05-12', jour: 'Lundi 12 mai', heure: '10h-11h30', client: 'Sophie Blanc', ville: 'Toulon 83200', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'confirme' },
  { id: 'i11', date: '2026-05-12', jour: 'Lundi 12 mai', heure: '13h-14h30', client: 'Nicolas Fabre', ville: 'Toulon 83500', couvreur: COUVREUR_UNIQUE, panneaux: 6, statut: 'a-confirmer' },
  { id: 'i12', date: '2026-05-12', jour: 'Lundi 12 mai', heure: '15h-16h30', client: 'Claire Vasseur', ville: 'Toulon 83100', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
]

const COUVREURS = [COUVREUR_UNIQUE]
const SEMAINES = [
  { label: 'Semaine du 4 mai', range: ['2026-05-04', '2026-05-10'] },
  { label: 'Semaine du 11 mai', range: ['2026-05-11', '2026-05-17'] },
  { label: 'Semaine du 18 mai', range: ['2026-05-18', '2026-05-24'] },
]

const STATUT_LABEL = { 'confirme': 'Confirm\u00E9', 'a-confirmer': '\u00C0 confirmer', 'termine': 'Termin\u00E9e', 'annulee': 'Annul\u00E9e' }

// Règle métier : 3 chantiers/jour par couvreur, ou 4 si tous ≤10 panneaux ET même secteur
const CAPACITE_STANDARD = 3
const CAPACITE_ETENDUE = 4
const SEUIL_PETITE_INSTALLATION = 10

// Extrait le "secteur" depuis la ville (Marseille, Aubagne, Aix...)
function getSecteur(ville) {
  return ville.split(/\s+\d/)[0].trim()
}

function computeCapacity(interventions) {
  const count = interventions.length
  if (count === 0) return { used: 0, max: CAPACITE_STANDARD, status: 'empty', allSmall: false, sameZone: true, secteur: null }

  const allSmall = interventions.every(i => i.panneaux <= SEUIL_PETITE_INSTALLATION)
  const secteurs = new Set(interventions.map(i => getSecteur(i.ville)))
  const sameZone = secteurs.size === 1
  const secteur = sameZone ? [...secteurs][0] : null

  const maxAutorise = (allSmall && sameZone) ? CAPACITE_ETENDUE : CAPACITE_STANDARD

  let status = 'ok'
  if (count > maxAutorise) status = 'over'
  else if (count === maxAutorise) status = 'full'
  else if (count === maxAutorise - 1) status = 'warning' // presque plein

  return { used: count, max: maxAutorise, status, allSmall, sameZone, secteur }
}

function exportCSV(interventions) {
  const header = ['Date', 'Heure', 'Client', 'Ville', 'Couvreur', 'Panneaux', 'Statut']
  const rows = interventions.map(i => [i.date, i.heure, i.client, i.ville, i.couvreur, i.panneaux, STATUT_LABEL[i.statut]])
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `planning-cph-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminPlanning() {
  const location = useLocation()
  const navigate = useNavigate()
  const [interventions, setInterventions] = useState(ALL_INTERVENTIONS_INIT)
  const [semaineIdx, setSemaineIdx] = useState(0)
  const [showRule, setShowRule] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [preselected, setPreselected] = useState(null)

  // Auto-ouvre la modale si on vient de /admin/demandes avec state.preselected
  useEffect(() => {
    if (location.state?.preselected) {
      setPreselected(location.state.preselected)
      setAddOpen(true)
      // nettoie le state pour éviter réouverture au back/forward
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  const semaine = SEMAINES[semaineIdx]

  const filtered = useMemo(() => {
    return interventions.filter(i => {
      if (i.date < semaine.range[0] || i.date > semaine.range[1]) return false
      return true
    })
  }, [interventions, semaine])

  // Groupement : jour → couvreur → interventions, avec capacité calculée
  const parJourCouvreur = useMemo(() => {
    const byJour = {}
    filtered.forEach(i => {
      if (!byJour[i.jour]) byJour[i.jour] = { jour: i.jour, date: i.date, couvreurs: {} }
      if (!byJour[i.jour].couvreurs[i.couvreur]) byJour[i.jour].couvreurs[i.couvreur] = []
      byJour[i.jour].couvreurs[i.couvreur].push(i)
    })
    return Object.values(byJour)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(j => ({
        ...j,
        equipes: Object.entries(j.couvreurs).map(([couvreur, list]) => ({
          couvreur,
          interventions: list.sort((a, b) => a.heure.localeCompare(b.heure)),
          capacity: computeCapacity(list),
        })),
      }))
  }, [filtered])

  // Alertes globales semaine
  const alertes = useMemo(() => {
    const over = []
    parJourCouvreur.forEach(j => {
      j.equipes.forEach(eq => {
        if (eq.capacity.status === 'over') over.push({ jour: j.jour, couvreur: eq.couvreur, ...eq.capacity })
      })
    })
    return over
  }, [parJourCouvreur])

  const totalInterv = filtered.length
  const totalPanneaux = filtered.reduce((s, i) => s + i.panneaux, 0)

  const changeStatut = (id, statut) => {
    setInterventions(list => list.map(i => i.id === id ? { ...i, statut } : i))
  }
  const removeIntervention = (id) => {
    setInterventions(list => list.filter(i => i.id !== id))
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Planning</h1>
            <p>Organis&eacute; par couvreur avec capacit&eacute; journali&egrave;re.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-sm btn-outline" onClick={() => exportCSV(filtered)}><Download size={14} /> Exporter</button>
            <button className="btn btn-sm btn-primary" onClick={() => setAddOpen(true)}><Plus size={14} /> Ajouter</button>
          </div>
        </div>
      </div>

      {/* Rappel règle métier */}
      {showRule && (
        <div className="capacity-rule">
          <span className="capacity-rule-icon"><Info size={16} /></span>
          <div className="capacity-rule-body">
            <strong>R&egrave;gle de planification</strong>
            <span>
              Max <strong>3 chantiers/jour</strong> par couvreur. Exception&nbsp;: <strong>4 autoris&eacute;s</strong> si
              toutes les installations sont <strong>petites (&le;{SEUIL_PETITE_INSTALLATION} panneaux)</strong> et
              <strong> dans le m&ecirc;me secteur</strong>.
            </span>
          </div>
          <button className="capacity-rule-close" onClick={() => setShowRule(false)} aria-label="Masquer">
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* Alerte surbooking */}
      {alertes.length > 0 && (
        <div className="capacity-alert">
          <AlertTriangle size={18} />
          <div>
            <strong>{alertes.length} journ&eacute;e{alertes.length > 1 ? 's' : ''} en surcharge</strong>
            <span>
              {alertes.map((a, i) => (
                <span key={i}>
                  {a.jour} &mdash; {a.couvreur} ({a.used}/{a.max})
                  {i < alertes.length - 1 ? <>&nbsp;&bull;&nbsp;</> : null}
                </span>
              ))}
            </span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="planning-toolbar">
        <div className="planning-week-nav">
          <button className="icon-btn" onClick={() => setSemaineIdx(Math.max(0, semaineIdx - 1))} disabled={semaineIdx === 0}>
            <ChevronLeft size={16} />
          </button>
          <div className="planning-week-label">
            <Calendar size={14} />
            <span>{semaine.label}</span>
          </div>
          <button className="icon-btn" onClick={() => setSemaineIdx(Math.min(SEMAINES.length - 1, semaineIdx + 1))} disabled={semaineIdx === SEMAINES.length - 1}>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>

      {/* Mini stats semaine */}
      <div className="planning-week-stats">
        <div className="planning-week-stat">
          <List size={14} />
          <span><strong>{totalInterv}</strong> interventions</span>
        </div>
        <div className="planning-week-stat">
          <Sun size={14} />
          <span><strong>{totalPanneaux}</strong> panneaux</span>
        </div>
        <div className="planning-week-stat">
          <Route size={14} />
          <span><strong>{totalInterv * 199}&nbsp;&euro;</strong> de CA</span>
        </div>
      </div>

      {parJourCouvreur.length === 0 && (
        <div className="empty-state">
          <Calendar size={28} />
          <p>Aucune intervention pour ce filtre sur cette semaine</p>
        </div>
      )}

      {/* Jours */}
      {addOpen && (
        <AddInterventionModal
          onClose={() => { setAddOpen(false); setPreselected(null) }}
          today={SEMAINES[0].range[0]}
          interventions={interventions}
          preselectedNom={preselected?.nom || ''}
          preselectedTel={preselected?.tel || ''}
          preselectedVille={preselected?.ville || ''}
          preselectedPanneaux={preselected?.panneaux || ''}
          onAdd={(data) => {
            const id = 'new-' + Date.now()
            setInterventions(list => [...list, {
              id, ...data,
              couvreur: COUVREUR_UNIQUE,
              statut: 'a-confirmer',
            }])
            setAddOpen(false)
            setPreselected(null)
            // Aligne la semaine affichée sur la date choisie
            const weekIdx = SEMAINES.findIndex(s => data.date >= s.range[0] && data.date <= s.range[1])
            if (weekIdx >= 0) setSemaineIdx(weekIdx)
          }}
        />
      )}

      {parJourCouvreur.map((jour) => (
        <div key={jour.jour} className="planning-day">
          <div className="planning-day-head">
            <h3>{jour.jour}</h3>
            <span className="planning-day-total">
              {jour.equipes.reduce((s, e) => s + e.interventions.length, 0)} chantiers au total
            </span>
          </div>

          <div className="planning-equipes">
            {jour.equipes.map((eq) => (
              <CouvreurDay
                key={eq.couvreur}
                couvreur={eq.couvreur}
                interventions={eq.interventions}
                capacity={eq.capacity}
                changeStatut={changeStatut}
                removeIntervention={removeIntervention}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

function CouvreurDay({ couvreur, interventions, capacity, changeStatut, removeIntervention }) {
  const { used, max, status, allSmall, sameZone, secteur } = capacity
  const pct = Math.min(100, (used / max) * 100)

  const statusLabel = {
    empty: 'Disponible',
    ok: 'Disponible',
    warning: 'Presque plein',
    full: 'Journ\u00E9e compl\u00E8te',
    over: 'SURCHARG\u00C9',
  }[status]

  const statusClass = status === 'over' ? 'over' : status === 'full' ? 'full' : status === 'warning' ? 'warning' : 'ok'

  return (
    <div className={`couvreur-day couvreur-day-${statusClass}`}>
      <div className="couvreur-day-head">
        <div className="couvreur-day-who">
          <span className="avatar-sm">{couvreur.split(' ').map(s => s[0]).join('')}</span>
          <div>
            <strong>{couvreur}</strong>
            {secteur && <span className="couvreur-day-secteur"><MapPin size={10} /> {secteur}</span>}
          </div>
        </div>

        <div className="couvreur-day-capacity">
          <div className="capacity-bar">
            <div className={`capacity-bar-fill capacity-bar-${statusClass}`} style={{width: `${pct}%`}} />
          </div>
          <div className="capacity-info">
            <strong>{used}/{max}</strong>
            <span className={`capacity-status capacity-status-${statusClass}`}>{statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Badge explicatif du max */}
      {used > 0 && (
        <div className="capacity-reason">
          {max === CAPACITE_ETENDUE ? (
            <><CheckCircle size={12} /> <span>Capacit&eacute; &eacute;tendue &agrave; 4 : toutes petites installations, m&ecirc;me secteur</span></>
          ) : allSmall && !sameZone ? (
            <><Info size={12} /> <span>Petites installations mais zones diff&eacute;rentes &rarr; capacit&eacute; standard (3)</span></>
          ) : !allSmall ? (
            <><Info size={12} /> <span>Au moins une grosse installation &rarr; capacit&eacute; standard (3)</span></>
          ) : null}
          {status === 'over' && (
            <span className="capacity-warning-over">
              <AlertTriangle size={12} /> D&eacute;passement&nbsp;: r&eacute;affectez ou d&eacute;placez {used - max} chantier{used - max > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      <div className="planning-cards">
        {interventions.map(inter => (
          <article key={inter.id} className="planning-card">
            <div className="planning-card-time">
              <Clock size={12} />
              {inter.heure}
            </div>
            <div className="planning-card-body">
              <h4>{inter.client}</h4>
              <p className="planning-card-meta">
                <MapPin size={11} /> {inter.ville}
                <span className="demande-meta-sep">&bull;</span>
                <span className={inter.panneaux <= SEUIL_PETITE_INSTALLATION ? 'badge-inline-small' : 'badge-inline-large'}>
                  {inter.panneaux} panneaux
                </span>
              </p>
            </div>

            <div className="planning-card-side">
              <span className={`badge ${inter.statut === 'confirme' ? 'badge-green' : inter.statut === 'a-confirmer' ? 'badge-orange' : 'badge-gray'}`}>
                {STATUT_LABEL[inter.statut]}
              </span>
              <div className="planning-card-actions">
                <button className="icon-btn" title="Appeler"><Phone size={14} /></button>
                <ActionMenu items={[
                  { icon: <Check size={13} />, label: 'Marquer confirm\u00E9', onClick: () => changeStatut(inter.id, 'confirme') },
                  { icon: <Clock size={13} />, label: '\u00C0 confirmer', onClick: () => changeStatut(inter.id, 'a-confirmer') },
                  { icon: <Check size={13} />, label: 'Marquer termin\u00E9e', onClick: () => changeStatut(inter.id, 'termine') },
                  { divider: true },
                  { icon: <Edit3 size={13} />, label: 'Modifier' },
                  { icon: <XIcon size={13} />, label: 'Annuler', onClick: () => changeStatut(inter.id, 'annulee') },
                  { icon: <Trash2 size={13} />, label: 'Supprimer', danger: true, onClick: () => removeIntervention(inter.id) },
                ]} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
