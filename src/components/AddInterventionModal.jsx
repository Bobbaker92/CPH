import { useState, useMemo } from 'react'
import {
  X as XIcon, MapPin, Sun, Calendar, Clock, Check, AlertTriangle, Info, Sparkles, User
} from 'lucide-react'
import { addIntervention, COUVREURS_DISPONIBLES } from '../lib/interventionsStore'

const SEUIL_PETITE = 10
const CAPACITE_STANDARD = 3
const CAPACITE_ETENDUE = 4

// Créneaux standards de la journée
const CRENEAUX = ['8h-10h', '10h30-12h30', '14h-16h', '16h30-18h']

const JOURS_LABEL = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const MOIS_LABEL = ['jan', 'f\u00E9v', 'mars', 'avr', 'mai', 'juin', 'juil', 'ao\u00FBt', 'sept', 'oct', 'nov', 'd\u00E9c']

function getSecteur(ville) {
  return (ville || '').split(/\s+\d/)[0].trim()
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr)
  return `${JOURS_LABEL[d.getDay()]} ${d.getDate()} ${MOIS_LABEL[d.getMonth()]}`
}

function formatLongDate(dateStr) {
  const d = new Date(dateStr)
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  const mois = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt', 'septembre', 'octobre', 'novembre', 'd\u00E9cembre']
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`
}

function buildShortJour(dateStr) {
  const d = new Date(dateStr)
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const mois = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt', 'septembre', 'octobre', 'novembre', 'd\u00E9cembre']
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`
}

/**
 * Génère les 21 prochains jours ouvrés (Lun-Sam) à partir d'aujourd'hui.
 */
function generateUpcomingDays(startDate, howMany = 21) {
  const days = []
  const cursor = new Date(startDate)
  cursor.setHours(0, 0, 0, 0)
  while (days.length < howMany) {
    const dow = cursor.getDay()
    if (dow !== 0) { // Saute dimanche
      const yyyy = cursor.getFullYear()
      const mm = String(cursor.getMonth() + 1).padStart(2, '0')
      const dd = String(cursor.getDate()).padStart(2, '0')
      days.push(`${yyyy}-${mm}-${dd}`)
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

/**
 * Calcule la recommandation pour un jour donné.
 */
function scoreDay(dateStr, existingInterventions, newSecteur, newPanneaux) {
  const dayList = existingInterventions.filter(i => i.date === dateStr)
  const count = dayList.length

  const isNewSmall = newPanneaux != null && newPanneaux <= SEUIL_PETITE
  const allExistingSmall = dayList.every(i => i.panneaux <= SEUIL_PETITE)
  const allSmallWithNew = allExistingSmall && isNewSmall

  const existingSecteurs = new Set(dayList.map(i => getSecteur(i.ville)))
  const sameSecteur = newSecteur && dayList.every(i => getSecteur(i.ville) === newSecteur)

  // Capacité max si on ajoute cette intervention
  const max = (allSmallWithNew && (count === 0 || sameSecteur)) ? CAPACITE_ETENDUE : CAPACITE_STANDARD
  const hasRoom = count < max

  // Créneaux occupés
  const bookedSlots = new Set(dayList.map(i => i.heure))
  const availableSlots = CRENEAUX.filter(s => !bookedSlots.has(s))

  let kind, score, reason, tag
  if (!hasRoom) {
    kind = 'full'
    score = -1
    reason = count === max ? 'Journ\u00E9e compl\u00E8te' : 'Surcharge'
    tag = 'Complet'
  } else if (count === 0) {
    kind = 'empty'
    score = 20
    reason = 'Journ\u00E9e libre'
    tag = 'Libre'
  } else if (sameSecteur) {
    // Jackpot : même secteur ET on peut potentiellement aller à 4 ou déjà rempli à 2/3
    kind = 'recommended'
    score = 100 + count * 10 + (allSmallWithNew ? 20 : 0) // plus il y a déjà, plus c'est rentable
    reason = `${count} interv. d\u00E9j\u00E0 pr\u00E9vues \u00E0 ${newSecteur}`
    tag = 'Id\u00E9al'
  } else {
    kind = 'mismatch'
    score = 10 - count
    reason = `${count} interv. mais zone ${[...existingSecteurs][0]}`
    tag = 'Zone diff.'
  }

  return {
    date: dateStr,
    count, max, hasRoom,
    availableSlots,
    existing: dayList,
    secteurs: [...existingSecteurs],
    allSmallWithNew,
    sameSecteur,
    kind, score, reason, tag,
  }
}

export default function AddInterventionModal({
  onClose,
  onPlanned,
  interventions,
  today,
  preselectedVille = '',
  preselectedNom = '',
  preselectedTel = '',
  preselectedPanneaux = '',
  preselectedDemandeId = null,
}) {
  const [form, setForm] = useState({
    nom: preselectedNom,
    tel: preselectedTel,
    ville: preselectedVille,
    panneaux: preselectedPanneaux,
    couvreurEmail: COUVREURS_DISPONIBLES[0]?.email || 'karim@cphpaca.fr',
    date: '',
    heure: '',
  })

  const couvreurSelectionne = useMemo(
    () => COUVREURS_DISPONIBLES.find((c) => c.email === form.couvreurEmail) || COUVREURS_DISPONIBLES[0],
    [form.couvreurEmail]
  )

  const newSecteur = getSecteur(form.ville)
  const newPanneaux = form.panneaux ? parseInt(form.panneaux, 10) : null
  const canCompute = !!newSecteur && newPanneaux != null && !Number.isNaN(newPanneaux)

  // Génère et score tous les jours à venir
  const scored = useMemo(() => {
    if (!canCompute) return []
    const baseDate = today ? new Date(today) : new Date()
    const days = generateUpcomingDays(baseDate, 21)
    return days.map(d => scoreDay(d, interventions, newSecteur, newPanneaux))
  }, [interventions, newSecteur, newPanneaux, today, canCompute])

  // Top 3 recommandés + quelques libres
  const topRecos = useMemo(() => {
    return scored
      .filter(s => s.hasRoom)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }, [scored])

  const canSubmit = form.nom && form.tel && form.ville && form.panneaux && form.date && form.heure

  const submit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const intervention = addIntervention({
      client: form.nom,
      tel: form.tel,
      ville: form.ville,
      panneaux: parseInt(form.panneaux, 10),
      couvreur: couvreurSelectionne?.nom || 'Karim Ziani',
      couvreurEmail: form.couvreurEmail,
      date: form.date,
      heure: form.heure,
      jour: buildShortJour(form.date),
      demandeId: preselectedDemandeId,
    })
    onPlanned?.(intervention)
  }

  return (
    <>
      <div className="admin-drawer-backdrop" onClick={onClose} />
      <div className="admin-modal admin-modal-large" role="dialog" aria-modal="true">
        <form onSubmit={submit} className="admin-modal-inner admin-modal-inner-large">
          <div className="admin-modal-head">
            <h2>Nouvelle intervention</h2>
            <button type="button" className="admin-drawer-close" onClick={onClose}>
              <XIcon size={20} />
            </button>
          </div>

          <div className="admin-modal-body add-interv-body">
            {/* Col gauche : formulaire */}
            <div className="add-interv-left">
              <h4 className="admin-modal-section-title">Client</h4>
              <div className="admin-modal-grid">
                <div className="input-group">
                  <label>Nom *</label>
                  <input type="text" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>T&eacute;l&eacute;phone *</label>
                  <input type="tel" value={form.tel} onChange={e => setForm({...form, tel: e.target.value})} required />
                </div>
                <div className="input-group" style={{gridColumn:'1 / -1'}}>
                  <label>Ville / secteur *</label>
                  <input type="text" placeholder="Ex : Marseille 13008" value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} required />
                </div>
                <div className="input-group" style={{gridColumn:'1 / -1'}}>
                  <label>Nombre de panneaux *</label>
                  <input type="number" min="1" value={form.panneaux} onChange={e => setForm({...form, panneaux: e.target.value})} required />
                </div>
                <div className="input-group" style={{gridColumn:'1 / -1'}}>
                  <label>Couvreur *</label>
                  <select value={form.couvreurEmail} onChange={(e) => setForm({ ...form, couvreurEmail: e.target.value })}>
                    {COUVREURS_DISPONIBLES.map((couvreur) => (
                      <option key={couvreur.email} value={couvreur.email}>{couvreur.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              {form.date && form.heure && (
                <div className="add-interv-summary">
                  <Check size={14} />
                  <span>
                    <strong>{formatLongDate(form.date)}</strong>
                    <em> &bull; {form.heure}</em>
                  </span>
                </div>
              )}
            </div>

            {/* Col droite : recommandations */}
            <div className="add-interv-right">
              <div className="add-interv-reco-head">
                <Sparkles size={14} />
                <h4>Meilleurs cr&eacute;neaux</h4>
                {newSecteur && <span className="add-interv-secteur">Secteur&nbsp;: <strong>{newSecteur}</strong></span>}
              </div>

              {!canCompute && (
                <div className="add-interv-placeholder">
                  <Info size={18} />
                  <p>Renseignez la <strong>ville</strong> et le <strong>nombre de panneaux</strong> pour voir les meilleurs cr&eacute;neaux.</p>
                </div>
              )}

              {canCompute && topRecos.length === 0 && (
                <div className="add-interv-placeholder">
                  <AlertTriangle size={18} />
                  <p>Aucune journ&eacute;e disponible dans les 3 prochaines semaines.</p>
                </div>
              )}

              {canCompute && topRecos.map(day => (
                <DaySuggestion
                  key={day.date}
                  day={day}
                  selected={form.date === day.date}
                  selectedHeure={form.date === day.date ? form.heure : ''}
                  onSelect={(heure) => setForm({ ...form, date: day.date, heure })}
                />
              ))}
            </div>
          </div>

          <div className="admin-modal-foot">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!canSubmit}>
              <Calendar size={14} /> Planifier l&apos;intervention
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

function DaySuggestion({ day, selected, selectedHeure, onSelect }) {
  const kindClass = day.kind === 'recommended' ? 'reco' : day.kind === 'empty' ? 'empty' : 'mismatch'

  return (
    <div className={`day-suggestion day-suggestion-${kindClass} ${selected ? 'is-selected' : ''}`}>
      <div className="day-suggestion-head">
        <div>
          <strong>{formatShortDate(day.date)}</strong>
          <span className="day-suggestion-reason">{day.reason}</span>
        </div>
        <span className={`day-tag day-tag-${kindClass}`}>
          {day.kind === 'recommended' && <Sparkles size={10} />}
          {day.tag}
        </span>
      </div>

      {/* Contexte : interventions déjà présentes */}
      {day.existing.length > 0 && (
        <div className="day-existing">
          {day.existing.map((i, idx) => (
            <span key={idx} className="day-existing-chip">
              <Clock size={10} /> {i.heure}
              <span className="day-existing-sep">&middot;</span>
              {i.ville.split(/\s+\d/)[0]}
              <span className="day-existing-sep">&middot;</span>
              {i.panneaux}p
            </span>
          ))}
        </div>
      )}

      {/* Slots disponibles */}
      <div className="day-slots">
        {day.availableSlots.map(slot => (
          <button
            key={slot}
            type="button"
            className={`day-slot ${selectedHeure === slot ? 'selected' : ''}`}
            onClick={() => onSelect(slot)}
          >
            <Clock size={11} /> {slot}
          </button>
        ))}
      </div>

      {/* Indicateur capacité */}
      <div className="day-capacity">
        <span>Capacit&eacute; : {day.count}/{day.max}</span>
        <div className="day-capacity-bar">
          <div
            className={`day-capacity-fill day-capacity-${kindClass}`}
            style={{width: `${((day.count + 1) / day.max) * 100}%`}}
          />
        </div>
      </div>
    </div>
  )
}
