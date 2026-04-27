import { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  MapPin, Clock, ChevronLeft, ChevronRight, Plus,
  Calendar, Phone, Sun, Download, Check, X as XIcon, Trash2,
  AlertTriangle, LayoutGrid, List, CalendarDays
} from 'lucide-react'
import ActionMenu from '../../components/ActionMenu'
import AddInterventionModal from '../../components/AddInterventionModal'
import {
  getInterventions,
  updateIntervention,
  removeIntervention as removeInterventionStore,
  subscribe,
} from '../../lib/interventionsStore'

const STATUT_LABEL = { 'confirme': 'Confirmé', 'a-confirmer': 'À confirmer', 'termine': 'Terminée', 'annulee': 'Annulée' }
const CAPACITE_STANDARD = 3
const CAPACITE_ETENDUE = 4
const SEUIL_PETITE_INSTALLATION = 10
const MOIS_NOMS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const MOIS_COURTS = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc']
const JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const JOURS_LONGS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function getSecteur(ville) { return ville.split(/\s+\d/)[0].trim() }

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
  a.href = url; a.download = `planning-cph-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

function getWeekDays(mondayStr) {
  const monday = new Date(mondayStr + 'T00:00:00')
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i)
    return { iso: d.toISOString().slice(0, 10), short: JOURS_COURTS[i], long: JOURS_LONGS[i], dayNum: d.getDate(), month: MOIS_COURTS[d.getMonth()] }
  })
}

// Monday of the week containing a given date
function getMondayOf(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

// All days in a month grid (includes padding from prev/next month)
function getMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1 // Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid = []
  // Padding before
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    grid.push({ iso: d.toISOString().slice(0, 10), dayNum: d.getDate(), inMonth: false })
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    grid.push({ iso: d.toISOString().slice(0, 10), dayNum: i, inMonth: true })
  }
  // Padding after (fill to 42 = 6 rows)
  while (grid.length < 42) {
    const d = new Date(year, month + 1, grid.length - startDay - daysInMonth + 1)
    grid.push({ iso: d.toISOString().slice(0, 10), dayNum: d.getDate(), inMonth: false })
  }
  return grid
}

function formatDateLong(isoStr) {
  const d = new Date(isoStr + 'T00:00:00')
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  return `${JOURS_LONGS[day]} ${d.getDate()} ${MOIS_NOMS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`
}

// ── Shared card component ───────────────────────────────────
function InterventionCard({ inter, changeStatut, removeIntervention, onReport, compact = false }) {
  const badgeColor = inter.statut === 'confirme' ? 'green' : inter.statut === 'a-confirmer' ? 'orange' : 'gray'
  return (
    <div className={`pw-card pw-card-${badgeColor} ${compact ? 'pw-card-compact' : ''}`}>
      <div className="pw-card-time"><Clock size={11} /><span>{inter.heure}</span></div>
      <div className="pw-card-client">{inter.client}</div>
      <div className="pw-card-meta"><MapPin size={10} /> {inter.ville}</div>
      {!compact && <div className="pw-card-meta"><Sun size={10} /> {inter.panneaux} panneaux</div>}
      <div className="pw-card-bottom">
        <span className={`pw-badge pw-badge-${badgeColor}`}>{STATUT_LABEL[inter.statut]}</span>
        <div className="pw-card-actions">
          <a href="tel:0412160630" className="icon-btn icon-btn-sm" title="Appeler"><Phone size={12} /></a>
          <ActionMenu items={[
            { icon: <Check size={13} />, label: 'Confirmé', onClick: () => changeStatut(inter.id, 'confirme') },
            { icon: <Clock size={13} />, label: 'À confirmer', onClick: () => changeStatut(inter.id, 'a-confirmer') },
            { icon: <Check size={13} />, label: 'Terminée', onClick: () => changeStatut(inter.id, 'termine') },
            { divider: true },
            { icon: <Calendar size={13} />, label: 'Reporter', onClick: () => onReport(inter) },
            { icon: <XIcon size={13} />, label: 'Annuler', onClick: () => changeStatut(inter.id, 'annulee') },
            { icon: <Trash2 size={13} />, label: 'Supprimer', danger: true, onClick: () => removeIntervention(inter.id) },
          ]} />
        </div>
      </div>
    </div>
  )
}

// ── Day column (reused in week + day views) ─────────────────
function DayColumn({ day, interventions, changeStatut, removeIntervention, onReport, full = false }) {
  const cap = computeCapacity(interventions)
  const capClass = cap.status === 'over' ? 'over' : cap.status === 'full' ? 'full' : cap.status === 'warning' ? 'warn' : 'ok'
  return (
    <div className={`pw-col ${interventions.length === 0 ? 'pw-col-empty' : ''} ${full ? 'pw-col-full' : ''}`}>
      <div className={`pw-col-head pw-col-head-${capClass}`}>
        <div className="pw-col-day">
          {full
            ? <span className="pw-col-day-long">{day.long || day.short} {day.dayNum} {day.month}</span>
            : <><span className="pw-col-day-name">{day.short}</span><span className="pw-col-day-num">{day.dayNum}</span><span className="pw-col-day-month">{day.month}</span></>
          }
        </div>
        <div className={`pw-col-cap pw-cap-${capClass}`}>{cap.used}/{cap.max}</div>
      </div>
      <div className="pw-col-body">
        {interventions.length === 0 && <div className="pw-empty"><span>Libre</span></div>}
        {interventions.map(inter => (
          <InterventionCard key={inter.id} inter={inter} changeStatut={changeStatut} removeIntervention={removeIntervention} onReport={onReport} />
        ))}
      </div>
    </div>
  )
}

// ── Modale report avec suggestions secteur ──────────────────
function ReportModal({ target, form, setForm, allInterventions, onSubmit, onClose }) {
  const secteur = getSecteur(target.ville)

  // Jours à venir qui ont des interventions dans le même secteur
  const suggestions = useMemo(() => {
    const today = target.date
    const others = allInterventions.filter(i => i.id !== target.id && i.date >= today)

    // Grouper par date
    const byDate = {}
    others.forEach(i => {
      if (!byDate[i.date]) byDate[i.date] = []
      byDate[i.date].push(i)
    })

    return Object.entries(byDate)
      .map(([date, ints]) => {
        const sameSector = ints.filter(i => getSecteur(i.ville) === secteur)
        const cap = computeCapacity(ints)
        return { date, ints, sameSector, cap, hasSector: sameSector.length > 0 }
      })
      .filter(s => s.cap.status !== 'over') // pas de jours surchargés
      .sort((a, b) => {
        // Même secteur d'abord, puis par date
        if (a.hasSector !== b.hasSector) return a.hasSector ? -1 : 1
        return a.date.localeCompare(b.date)
      })
      .slice(0, 8)
  }, [allInterventions, target, secteur])

  return (
    <div className="pw-report-backdrop" onClick={onClose}>
      <div className="pw-report-modal" onClick={e => e.stopPropagation()}>
        <div className="pw-report-head">
          <h3>Reporter l'intervention</h3>
          <button onClick={onClose}><XIcon size={20} /></button>
        </div>
        <div className="pw-report-info">
          <strong>{target.client}</strong>
          <span><MapPin size={12} /> {target.ville} — {target.panneaux} panneaux</span>
          <span className="pw-report-old">Actuellement : {formatDateLong(target.date)} de {target.heure}</span>
          <span className="pw-report-secteur">Secteur : <strong>{secteur}</strong></span>
        </div>

        {/* Suggestions par secteur */}
        {suggestions.some(s => s.hasSector) && (
          <div className="pw-report-suggestions">
            <div className="pw-report-suggestions-title">
              <MapPin size={14} />
              <span>Dates avec interventions sur <strong>{secteur}</strong></span>
            </div>
            <div className="pw-report-suggestions-list">
              {suggestions.filter(s => s.hasSector).map(s => {
                const capClass = s.cap.status === 'full' ? 'full' : s.cap.status === 'warning' ? 'warn' : 'ok'
                const selected = form.date === s.date
                return (
                  <button
                    key={s.date}
                    className={`pw-report-sug ${selected ? 'pw-report-sug-active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, date: s.date }))}
                  >
                    <div className="pw-report-sug-date">
                      <strong>{formatDateLong(s.date)}</strong>
                      <span className={`pw-col-cap pw-cap-${capClass}`}>{s.cap.used}/{s.cap.max}</span>
                    </div>
                    <div className="pw-report-sug-detail">
                      {s.sameSector.map(i => (
                        <span key={i.id} className="pw-report-sug-pill">
                          {i.heure} — {i.client}
                        </span>
                      ))}
                      {s.ints.length > s.sameSector.length && (
                        <span className="pw-report-sug-other">+ {s.ints.length - s.sameSector.length} autre{s.ints.length - s.sameSector.length > 1 ? 's' : ''} hors secteur</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Autres jours disponibles */}
        {suggestions.some(s => !s.hasSector) && (
          <div className="pw-report-suggestions pw-report-suggestions-other">
            <div className="pw-report-suggestions-title">
              <Calendar size={14} />
              <span>Autres jours avec de la place</span>
            </div>
            <div className="pw-report-suggestions-list">
              {suggestions.filter(s => !s.hasSector).map(s => {
                const capClass = s.cap.status === 'full' ? 'full' : s.cap.status === 'warning' ? 'warn' : 'ok'
                const selected = form.date === s.date
                return (
                  <button
                    key={s.date}
                    className={`pw-report-sug pw-report-sug-dim ${selected ? 'pw-report-sug-active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, date: s.date }))}
                  >
                    <div className="pw-report-sug-date">
                      <strong>{formatDateLong(s.date)}</strong>
                      <span className={`pw-col-cap pw-cap-${capClass}`}>{s.cap.used}/{s.cap.max}</span>
                    </div>
                    <div className="pw-report-sug-detail">
                      <span className="pw-report-sug-other">{s.ints.map(i => getSecteur(i.ville)).filter((v, idx, a) => a.indexOf(v) === idx).join(', ')}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Saisie manuelle */}
        <div className="pw-report-form">
          <div className="pw-report-form-title">Ou choisir manuellement</div>
          <div className="pw-report-form-row">
            <div className="prosp-field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="prosp-field">
              <label>Créneau</label>
              <select value={form.heure} onChange={e => setForm(f => ({ ...f, heure: e.target.value }))}>
                <option value="">Choisir...</option>
                <option value="8h-10h">8h - 10h</option>
                <option value="8h-9h30">8h - 9h30</option>
                <option value="9h-11h">9h - 11h</option>
                <option value="10h-12h">10h - 12h</option>
                <option value="10h30-12h30">10h30 - 12h30</option>
                <option value="13h-14h30">13h - 14h30</option>
                <option value="14h-16h">14h - 16h</option>
                <option value="15h-16h30">15h - 16h30</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pw-report-actions">
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={!form.date || !form.heure}>
            <Calendar size={14} /> Confirmer le report
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
export default function AdminPlanning() {
  const location = useLocation()
  const navigate = useNavigate()
  const [interventions, setInterventions] = useState(() => getInterventions())
  const [view, setView] = useState('semaine') // jour | semaine | mois
  const [currentDate, setCurrentDate] = useState('2026-05-04') // date pivot
  const initialPreselected = location.state?.preselected ?? null
  const [addOpen, setAddOpen] = useState(!!initialPreselected)
  const [preselected, setPreselected] = useState(initialPreselected)
  const [reportTarget, setReportTarget] = useState(null) // intervention à reporter
  const [reportForm, setReportForm] = useState({ date: '', heure: '' })

  useEffect(() => {
    if (location.state?.preselected) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  useEffect(() => {
    return subscribe(() => {
      setInterventions(getInterventions())
    })
  }, [])

  const changeStatut = (id, statut) => updateIntervention(id, { statut })
  const removeIntervention = (id) => removeInterventionStore(id)

  const openReport = (inter) => {
    setReportTarget(inter)
    setReportForm({ date: inter.date, heure: inter.heure })
  }
  const submitReport = () => {
    if (!reportForm.date || !reportForm.heure) return
    const heureSort = reportForm.heure.replace(/h/, ':').replace(/-.*/, '').replace(/^(\d):/, '0$1:').padStart(5, '0')
    updateIntervention(reportTarget.id, { date: reportForm.date, heure: reportForm.heure, heureSort })
    setReportTarget(null)
    setCurrentDate(reportForm.date)
  }

  // ── Navigation ──
  const navPrev = () => {
    const d = new Date(currentDate + 'T00:00:00')
    if (view === 'jour') d.setDate(d.getDate() - 1)
    else if (view === 'semaine') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1)
    setCurrentDate(d.toISOString().slice(0, 10))
  }
  const navNext = () => {
    const d = new Date(currentDate + 'T00:00:00')
    if (view === 'jour') d.setDate(d.getDate() + 1)
    else if (view === 'semaine') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
    setCurrentDate(d.toISOString().slice(0, 10))
  }

  // ── Date range for current view ──
  const { startDate, endDate, navLabel } = useMemo(() => {
    const d = new Date(currentDate + 'T00:00:00')
    if (view === 'jour') {
      return { startDate: currentDate, endDate: currentDate, navLabel: formatDateLong(currentDate) }
    } else if (view === 'semaine') {
      const mon = getMondayOf(currentDate)
      const sat = new Date(mon + 'T00:00:00')
      sat.setDate(sat.getDate() + 5)
      const end = sat.toISOString().slice(0, 10)
      const monD = new Date(mon + 'T00:00:00')
      return {
        startDate: mon, endDate: end,
        navLabel: `${monD.getDate()} — ${sat.getDate()} ${MOIS_NOMS[sat.getMonth()].toLowerCase()} ${sat.getFullYear()}`
      }
    } else {
      const first = new Date(d.getFullYear(), d.getMonth(), 1)
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      return {
        startDate: first.toISOString().slice(0, 10),
        endDate: last.toISOString().slice(0, 10),
        navLabel: `${MOIS_NOMS[d.getMonth()]} ${d.getFullYear()}`
      }
    }
  }, [currentDate, view])

  const filtered = useMemo(() => {
    return interventions
      .filter(i => i.date >= startDate && i.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date) || a.heureSort.localeCompare(b.heureSort))
  }, [interventions, startDate, endDate])

  // Stats
  const totalInterv = filtered.length
  const totalPanneaux = filtered.reduce((s, i) => s + i.panneaux, 0)
  const totalConfirme = filtered.filter(i => i.statut === 'confirme').length
  const totalAConfirmer = filtered.filter(i => i.statut === 'a-confirmer').length

  // ── Week data ──
  const weekDays = useMemo(() => {
    if (view !== 'semaine') return []
    return getWeekDays(getMondayOf(currentDate))
  }, [currentDate, view])

  const byDay = useMemo(() => {
    const map = {}
    filtered.forEach(i => {
      if (!map[i.date]) map[i.date] = []
      map[i.date].push(i)
    })
    return map
  }, [filtered])

  // ── Month data ──
  const monthGrid = useMemo(() => {
    if (view !== 'mois') return []
    const d = new Date(currentDate + 'T00:00:00')
    return getMonthGrid(d.getFullYear(), d.getMonth())
  }, [currentDate, view])

  const allByDay = useMemo(() => {
    const map = {}
    interventions.forEach(i => {
      if (!map[i.date]) map[i.date] = []
      map[i.date].push(i)
    })
    return map
  }, [interventions])

  // ── Day data ──
  const dayInfo = useMemo(() => {
    if (view !== 'jour') return null
    const d = new Date(currentDate + 'T00:00:00')
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1
    return {
      iso: currentDate,
      short: JOURS_COURTS[dow],
      long: JOURS_LONGS[dow],
      dayNum: d.getDate(),
      month: MOIS_COURTS[d.getMonth()],
    }
  }, [currentDate, view])

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Planning</h1>
            <p>{totalInterv} intervention{totalInterv > 1 ? 's' : ''} sur cette période</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-sm btn-outline" onClick={() => exportCSV(filtered)}><Download size={14} /> Exporter</button>
            <button className="btn btn-sm btn-primary" onClick={() => setAddOpen(true)}><Plus size={14} /> Ajouter</button>
          </div>
        </div>
      </div>

      {/* Toggle vue + navigation */}
      <div className="pw-toolbar">
        <div className="pw-view-toggle">
          {[
            { key: 'jour', icon: <List size={14} />, label: 'Jour' },
            { key: 'semaine', icon: <LayoutGrid size={14} />, label: 'Semaine' },
            { key: 'mois', icon: <CalendarDays size={14} />, label: 'Mois' },
          ].map(v => (
            <button
              key={v.key}
              className={`pw-view-btn ${view === v.key ? 'active' : ''}`}
              onClick={() => setView(v.key)}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        <div className="pw-nav">
          <button className="icon-btn" onClick={navPrev}><ChevronLeft size={18} /></button>
          <div className="pw-nav-label">
            <Calendar size={15} />
            <span>{navLabel}</span>
          </div>
          <button className="icon-btn" onClick={navNext}><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Stats */}
      <div className="pw-stats">
        <div className="pw-stat"><span className="pw-stat-val">{totalInterv}</span><span className="pw-stat-lbl">interventions</span></div>
        <div className="pw-stat"><span className="pw-stat-val pw-stat-green">{totalConfirme}</span><span className="pw-stat-lbl">confirmées</span></div>
        <div className="pw-stat"><span className="pw-stat-val pw-stat-orange">{totalAConfirmer}</span><span className="pw-stat-lbl">à confirmer</span></div>
        <div className="pw-stat"><span className="pw-stat-val">{totalPanneaux}</span><span className="pw-stat-lbl">panneaux</span></div>
        <div className="pw-stat"><span className="pw-stat-val">{(totalInterv * 199).toLocaleString('fr-FR')}&nbsp;€</span><span className="pw-stat-lbl">CA potentiel</span></div>
      </div>

      {/* ═══ VUE JOUR ═══ */}
      {view === 'jour' && dayInfo && (
        <div className="pw-day-view">
          <DayColumn
            day={dayInfo}
            interventions={filtered}
            changeStatut={changeStatut}
            removeIntervention={removeIntervention}
            onReport={openReport}
            full
          />
        </div>
      )}

      {/* ═══ VUE SEMAINE ═══ */}
      {view === 'semaine' && (
        <div className="pw-grid">
          {weekDays.map(day => (
            <DayColumn
              key={day.iso}
              day={day}
              interventions={byDay[day.iso] || []}
              changeStatut={changeStatut}
              removeIntervention={removeIntervention}
              onReport={openReport}
            />
          ))}
        </div>
      )}

      {/* ═══ VUE MOIS ═══ */}
      {view === 'mois' && (
        <div className="pw-month">
          <div className="pw-month-header">
            {JOURS_COURTS.slice(0, 7).map(j => (
              <div key={j} className="pw-month-hdr-cell">{j}</div>
            ))}
          </div>
          <div className="pw-month-grid">
            {monthGrid.map((cell) => {
              const dayInts = (allByDay[cell.iso] || []).sort((a, b) => a.heureSort.localeCompare(b.heureSort))
              const cap = computeCapacity(dayInts)
              const capClass = cap.status === 'over' ? 'over' : cap.status === 'full' ? 'full' : cap.status === 'warning' ? 'warn' : 'ok'
              return (
                <div
                  key={cell.iso}
                  className={`pw-month-cell ${!cell.inMonth ? 'pw-month-cell-out' : ''} ${dayInts.length > 0 ? 'pw-month-cell-has' : ''}`}
                  onClick={() => { setCurrentDate(cell.iso); setView('jour') }}
                >
                  <div className="pw-month-cell-head">
                    <span className="pw-month-cell-num">{cell.dayNum}</span>
                    {dayInts.length > 0 && (
                      <span className={`pw-month-cell-cap pw-cap-${capClass}`}>{cap.used}/{cap.max}</span>
                    )}
                  </div>
                  <div className="pw-month-cell-body">
                    {dayInts.slice(0, 3).map(inter => (
                      <div key={inter.id} className={`pw-month-pill pw-month-pill-${inter.statut === 'confirme' ? 'green' : inter.statut === 'a-confirmer' ? 'orange' : 'gray'}`}>
                        <span className="pw-month-pill-time">{inter.heure.split('-')[0]}</span>
                        <span className="pw-month-pill-name">{inter.client.split(' ')[0]}</span>
                      </div>
                    ))}
                    {dayInts.length > 3 && (
                      <div className="pw-month-more">+{dayInts.length - 3} autre{dayInts.length - 3 > 1 ? 's' : ''}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modale reporter */}
      {reportTarget && (
        <ReportModal
          target={reportTarget}
          form={reportForm}
          setForm={setReportForm}
          allInterventions={interventions}
          onSubmit={submitReport}
          onClose={() => setReportTarget(null)}
        />
      )}

      {/* Modale ajout */}
      {addOpen && (
        <AddInterventionModal
          onClose={() => { setAddOpen(false); setPreselected(null) }}
          today={startDate}
          interventions={interventions}
          preselectedNom={preselected?.nom || ''}
          preselectedTel={preselected?.tel || ''}
          preselectedVille={preselected?.ville || ''}
          preselectedPanneaux={preselected?.panneaux || ''}
          preselectedDemandeId={preselected?.demandeId || null}
          onPlanned={(data) => {
            setAddOpen(false)
            setPreselected(null)
            setCurrentDate(data.date)
          }}
        />
      )}
    </>
  )
}
