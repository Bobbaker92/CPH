import { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  MapPin, Clock, ChevronLeft, ChevronRight, Plus,
  Calendar, Phone, Sun, Download, Check, X as XIcon, Edit3, Trash2,
  AlertTriangle, Info, List
} from 'lucide-react'
import ActionMenu from '../../components/ActionMenu'
import AddInterventionModal from '../../components/AddInterventionModal'

const COUVREUR_UNIQUE = 'Karim Ziani'

const ALL_INTERVENTIONS_INIT = [
  // Lundi 4 mai
  { id: 'i1', date: '2026-05-04', heure: '8h-10h', heureSort: '08:00', client: 'Robert Vidal', ville: 'Marseille 13005', couvreur: COUVREUR_UNIQUE, panneaux: 12, statut: 'confirme' },
  { id: 'i2', date: '2026-05-04', heure: '10h30-12h30', heureSort: '10:30', client: 'Jean-Pierre Martin', ville: 'Marseille 13008', couvreur: COUVREUR_UNIQUE, panneaux: 16, statut: 'confirme' },
  { id: 'i3', date: '2026-05-04', heure: '14h-16h', heureSort: '14:00', client: 'Marie Duval', ville: 'Marseille 13012', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
  // Mardi 5 mai
  { id: 'i6', date: '2026-05-05', heure: '9h-11h', heureSort: '09:00', client: 'Claire Dubois', ville: 'Aix 13100', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'confirme' },
  { id: 'i8', date: '2026-05-05', heure: '14h-16h', heureSort: '14:00', client: 'Isabelle Morel', ville: 'Gardanne 13120', couvreur: COUVREUR_UNIQUE, panneaux: 16, statut: 'confirme' },
  // Mercredi 7 mai
  { id: 'i13', date: '2026-05-07', heure: '8h-10h', heureSort: '08:00', client: 'Thomas Roux', ville: 'Aubagne 13400', couvreur: COUVREUR_UNIQUE, panneaux: 14, statut: 'a-confirmer' },
  { id: 'i14', date: '2026-05-07', heure: '10h-12h', heureSort: '10:00', client: 'Nadia Khelif', ville: 'Aubagne 13400', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'confirme' },
  // Jeudi 8 mai (férié mais intervention prévue)
  { id: 'i15', date: '2026-05-08', heure: '9h-11h', heureSort: '09:00', client: 'Alain Bernard', ville: 'Aix 13100', couvreur: COUVREUR_UNIQUE, panneaux: 20, statut: 'a-confirmer' },
  // Vendredi 9 mai
  { id: 'i16', date: '2026-05-09', heure: '8h-10h', heureSort: '08:00', client: 'Sylvie Mercier', ville: 'Marseille 13004', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
  { id: 'i17', date: '2026-05-09', heure: '10h-12h', heureSort: '10:00', client: 'Bruno Costa', ville: 'Marseille 13006', couvreur: COUVREUR_UNIQUE, panneaux: 12, statut: 'confirme' },
  { id: 'i18', date: '2026-05-09', heure: '14h-16h', heureSort: '14:00', client: 'Fatima Aoudi', ville: 'Marseille 13010', couvreur: COUVREUR_UNIQUE, panneaux: 6, statut: 'confirme' },
  // Samedi 10 mai
  { id: 'i19', date: '2026-05-10', heure: '8h-10h', heureSort: '08:00', client: 'Patrick Leroy', ville: 'Toulon 83000', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'a-confirmer' },
  // Semaine 2 — Lundi 12 mai
  { id: 'i9', date: '2026-05-12', heure: '8h-9h30', heureSort: '08:00', client: 'Laurent Petit', ville: 'Toulon 83000', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
  { id: 'i10', date: '2026-05-12', heure: '10h-11h30', heureSort: '10:00', client: 'Sophie Blanc', ville: 'Toulon 83200', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'confirme' },
  { id: 'i11', date: '2026-05-12', heure: '13h-14h30', heureSort: '13:00', client: 'Nicolas Fabre', ville: 'Toulon 83500', couvreur: COUVREUR_UNIQUE, panneaux: 6, statut: 'a-confirmer' },
  { id: 'i12', date: '2026-05-12', heure: '15h-16h30', heureSort: '15:00', client: 'Claire Vasseur', ville: 'Toulon 83100', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
  // Mardi 13 mai
  { id: 'i20', date: '2026-05-13', heure: '9h-11h', heureSort: '09:00', client: 'Michel Dupont', ville: 'Nice 06000', couvreur: COUVREUR_UNIQUE, panneaux: 18, statut: 'confirme' },
  { id: 'i21', date: '2026-05-13', heure: '14h-16h', heureSort: '14:00', client: 'Sandra Ricci', ville: 'Nice 06300', couvreur: COUVREUR_UNIQUE, panneaux: 12, statut: 'confirme' },
]

const STATUT_LABEL = { 'confirme': 'Confirmé', 'a-confirmer': 'À confirmer', 'termine': 'Terminée', 'annulee': 'Annulée' }

const CAPACITE_STANDARD = 3
const CAPACITE_ETENDUE = 4
const SEUIL_PETITE_INSTALLATION = 10

function getSecteur(ville) {
  return ville.split(/\s+\d/)[0].trim()
}

function computeCapacity(interventions) {
  const count = interventions.length
  if (count === 0) return { used: 0, max: CAPACITE_STANDARD, status: 'empty' }
  const allSmall = interventions.every(i => i.panneaux <= SEUIL_PETITE_INSTALLATION)
  const secteurs = new Set(interventions.map(i => getSecteur(i.ville)))
  const sameZone = secteurs.size === 1
  const maxAutorise = (allSmall && sameZone) ? CAPACITE_ETENDUE : CAPACITE_STANDARD
  let status = 'ok'
  if (count > maxAutorise) status = 'over'
  else if (count === maxAutorise) status = 'full'
  else if (count === maxAutorise - 1) status = 'warning'
  return { used: count, max: maxAutorise, status }
}

function exportCSV(interventions) {
  const header = ['Date', 'Heure', 'Client', 'Ville', 'Couvreur', 'Panneaux', 'Statut']
  const rows = interventions.map(i => [i.date, i.heure, i.client, i.ville, i.couvreur, i.panneaux, STATUT_LABEL[i.statut]])
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `planning-cph-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Génère les jours d'une semaine (lun-sam) à partir du lundi
function getWeekDays(mondayStr) {
  const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const JOURS_LONG = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const MOIS = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc']
  const monday = new Date(mondayStr + 'T00:00:00')
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    return {
      iso,
      short: JOURS[i],
      long: JOURS_LONG[i],
      dayNum: d.getDate(),
      month: MOIS[d.getMonth()],
      isToday: false, // maquette
    }
  })
}

const SEMAINES = [
  { monday: '2026-05-04', label: '4 — 10 mai 2026' },
  { monday: '2026-05-11', label: '11 — 17 mai 2026' },
  { monday: '2026-05-18', label: '18 — 24 mai 2026' },
]

export default function AdminPlanning() {
  const location = useLocation()
  const navigate = useNavigate()
  const [interventions, setInterventions] = useState(ALL_INTERVENTIONS_INIT)
  const [semaineIdx, setSemaineIdx] = useState(0)
  const initialPreselected = location.state?.preselected ?? null
  const [addOpen, setAddOpen] = useState(!!initialPreselected)
  const [preselected, setPreselected] = useState(initialPreselected)

  useEffect(() => {
    if (location.state?.preselected) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  const semaine = SEMAINES[semaineIdx]
  const weekDays = useMemo(() => getWeekDays(semaine.monday), [semaine.monday])

  const endDate = weekDays[weekDays.length - 1].iso

  const filtered = useMemo(() => {
    return interventions
      .filter(i => i.date >= semaine.monday && i.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date) || a.heureSort.localeCompare(b.heureSort))
  }, [interventions, semaine.monday, endDate])

  // Interventions par jour
  const byDay = useMemo(() => {
    const map = {}
    weekDays.forEach(d => { map[d.iso] = [] })
    filtered.forEach(i => {
      if (map[i.date]) map[i.date].push(i)
    })
    return map
  }, [filtered, weekDays])

  // Stats semaine
  const totalInterv = filtered.length
  const totalPanneaux = filtered.reduce((s, i) => s + i.panneaux, 0)
  const totalConfirme = filtered.filter(i => i.statut === 'confirme').length
  const totalAConfirmer = filtered.filter(i => i.statut === 'a-confirmer').length

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
            <p>Vue semaine — organisé par jour avec capacité journalière.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-sm btn-outline" onClick={() => exportCSV(filtered)}><Download size={14} /> Exporter</button>
            <button className="btn btn-sm btn-primary" onClick={() => setAddOpen(true)}><Plus size={14} /> Ajouter</button>
          </div>
        </div>
      </div>

      {/* Navigation semaine */}
      <div className="pw-nav">
        <button className="icon-btn" onClick={() => setSemaineIdx(Math.max(0, semaineIdx - 1))} disabled={semaineIdx === 0}>
          <ChevronLeft size={18} />
        </button>
        <div className="pw-nav-label">
          <Calendar size={15} />
          <span>Semaine du {semaine.label}</span>
        </div>
        <button className="icon-btn" onClick={() => setSemaineIdx(Math.min(SEMAINES.length - 1, semaineIdx + 1))} disabled={semaineIdx === SEMAINES.length - 1}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Stats semaine */}
      <div className="pw-stats">
        <div className="pw-stat">
          <span className="pw-stat-val">{totalInterv}</span>
          <span className="pw-stat-lbl">interventions</span>
        </div>
        <div className="pw-stat">
          <span className="pw-stat-val pw-stat-green">{totalConfirme}</span>
          <span className="pw-stat-lbl">confirmées</span>
        </div>
        <div className="pw-stat">
          <span className="pw-stat-val pw-stat-orange">{totalAConfirmer}</span>
          <span className="pw-stat-lbl">à confirmer</span>
        </div>
        <div className="pw-stat">
          <span className="pw-stat-val">{totalPanneaux}</span>
          <span className="pw-stat-lbl">panneaux</span>
        </div>
        <div className="pw-stat">
          <span className="pw-stat-val">{(totalInterv * 199).toLocaleString('fr-FR')}&nbsp;€</span>
          <span className="pw-stat-lbl">CA potentiel</span>
        </div>
      </div>

      {/* Grille semaine */}
      <div className="pw-grid">
        {weekDays.map(day => {
          const dayInterventions = byDay[day.iso] || []
          const cap = computeCapacity(dayInterventions)
          const capClass = cap.status === 'over' ? 'over' : cap.status === 'full' ? 'full' : cap.status === 'warning' ? 'warn' : 'ok'

          return (
            <div key={day.iso} className={`pw-col ${dayInterventions.length === 0 ? 'pw-col-empty' : ''}`}>
              {/* Header jour */}
              <div className={`pw-col-head pw-col-head-${capClass}`}>
                <div className="pw-col-day">
                  <span className="pw-col-day-name">{day.short}</span>
                  <span className="pw-col-day-num">{day.dayNum}</span>
                  <span className="pw-col-day-month">{day.month}</span>
                </div>
                <div className={`pw-col-cap pw-cap-${capClass}`}>
                  {cap.used}/{cap.max}
                </div>
              </div>

              {/* Interventions du jour */}
              <div className="pw-col-body">
                {dayInterventions.length === 0 && (
                  <div className="pw-empty">
                    <span>Libre</span>
                  </div>
                )}
                {dayInterventions.map(inter => (
                  <div key={inter.id} className={`pw-card pw-card-${inter.statut === 'confirme' ? 'green' : inter.statut === 'a-confirmer' ? 'orange' : 'gray'}`}>
                    <div className="pw-card-time">
                      <Clock size={11} />
                      <span>{inter.heure}</span>
                    </div>
                    <div className="pw-card-client">{inter.client}</div>
                    <div className="pw-card-meta">
                      <MapPin size={10} /> {inter.ville}
                    </div>
                    <div className="pw-card-meta">
                      <Sun size={10} /> {inter.panneaux} panneaux
                    </div>
                    <div className="pw-card-bottom">
                      <span className={`pw-badge pw-badge-${inter.statut === 'confirme' ? 'green' : inter.statut === 'a-confirmer' ? 'orange' : 'gray'}`}>
                        {STATUT_LABEL[inter.statut]}
                      </span>
                      <div className="pw-card-actions">
                        <a href={`tel:${inter.ville ? '0412160630' : ''}`} className="icon-btn icon-btn-sm" title="Appeler"><Phone size={12} /></a>
                        <ActionMenu items={[
                          { icon: <Check size={13} />, label: 'Confirmé', onClick: () => changeStatut(inter.id, 'confirme') },
                          { icon: <Clock size={13} />, label: 'À confirmer', onClick: () => changeStatut(inter.id, 'a-confirmer') },
                          { icon: <Check size={13} />, label: 'Terminée', onClick: () => changeStatut(inter.id, 'termine') },
                          { divider: true },
                          { icon: <XIcon size={13} />, label: 'Annuler', onClick: () => changeStatut(inter.id, 'annulee') },
                          { icon: <Trash2 size={13} />, label: 'Supprimer', danger: true, onClick: () => removeIntervention(inter.id) },
                        ]} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modale ajout */}
      {addOpen && (
        <AddInterventionModal
          onClose={() => { setAddOpen(false); setPreselected(null) }}
          today={SEMAINES[0].monday}
          interventions={interventions}
          preselectedNom={preselected?.nom || ''}
          preselectedTel={preselected?.tel || ''}
          preselectedVille={preselected?.ville || ''}
          preselectedPanneaux={preselected?.panneaux || ''}
          onAdd={(data) => {
            const id = 'new-' + Date.now()
            setInterventions(list => [...list, {
              id, ...data,
              heureSort: data.heure.replace(/h/, ':').replace(/-.*/, '').padStart(5, '0'),
              couvreur: COUVREUR_UNIQUE,
              statut: 'a-confirmer',
            }])
            setAddOpen(false)
            setPreselected(null)
            const weekIdx = SEMAINES.findIndex(s => {
              const days = getWeekDays(s.monday)
              return data.date >= days[0].iso && data.date <= days[5].iso
            })
            if (weekIdx >= 0) setSemaineIdx(weekIdx)
          }}
        />
      )}
    </>
  )
}
