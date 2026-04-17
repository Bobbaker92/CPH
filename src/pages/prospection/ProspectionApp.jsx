import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Calendar, MapPin, Phone, User, Euro, TrendingUp, LogOut,
  Clock, Check, X, ChevronDown, ChevronUp, Edit3, Target, Award, House
} from 'lucide-react'
import { DATA_SYNC_KEYS, readSyncedData, subscribeSyncedData, writeSyncedData } from '../../lib/dataSync'

// ─── Données mock ───────────────────────────────────────────
const PROSPECTRICES = {
  'prospection@cphpaca.fr': {
    id: 1, nom: 'Nadia Belkacem', tel: '06 55 44 33 22',
    secteur: 'Marseille Nord / Aubagne',
  },
}

const RDV_INIT = [
  {
    id: 1, prospectrice: 1,
    nom: 'Robert Garcia', tel: '06 12 34 56 78',
    adresse: '15 rue des Lilas, 13012 Marseille',
    dateRdv: '2026-04-18', heureRdv: '10:00',
    typeRdv: 'panneaux', typeToiture: 'Tuile canal',
    notes: 'Toiture ancienne, potentiel travaux faîtage',
    statut: 'planifie', montantHT: null,
    dateCreation: '2026-04-14',
  },
  {
    id: 2, prospectrice: 1,
    nom: 'Fatima Aoudia', tel: '07 88 99 00 11',
    adresse: '8 chemin du Roy, 13400 Aubagne',
    dateRdv: '2026-04-17', heureRdv: '14:00',
    typeRdv: 'diagnostic', typeToiture: 'Tuile romane',
    notes: 'Intéressée réfection + hydrofuge',
    statut: 'fait', montantHT: null,
    dateCreation: '2026-04-13',
  },
  {
    id: 3, prospectrice: 1,
    nom: 'Marc Lefèvre', tel: '06 44 55 66 77',
    adresse: '22 avenue de la République, 13001 Marseille',
    dateRdv: '2026-04-15', heureRdv: '09:00',
    typeRdv: 'diagnostic', typeToiture: 'Ardoise',
    notes: 'Remplacement faîtage complet, gros chantier',
    statut: 'vendu', montantHT: 12500,
    dateCreation: '2026-04-10',
  },
  {
    id: 4, prospectrice: 1,
    nom: 'Sophie Martin', tel: '06 22 33 44 55',
    adresse: '3 impasse des Oliviers, 13400 Aubagne',
    dateRdv: '2026-04-14', heureRdv: '16:00',
    typeRdv: 'panneaux', typeToiture: 'Tuile plate',
    notes: 'Pas de budget pour le moment',
    statut: 'pas_vendu', montantHT: null,
    dateCreation: '2026-04-09',
  },
  {
    id: 5, prospectrice: 1,
    nom: 'Karim Zaoui', tel: '06 99 88 77 66',
    adresse: '45 bd Michelet, 13008 Marseille',
    dateRdv: '2026-04-12', heureRdv: '11:00',
    typeRdv: 'diagnostic', typeToiture: 'Tuile canal',
    notes: 'Travaux rives + faîtage',
    statut: 'vendu', montantHT: 8500,
    dateCreation: '2026-04-07',
  },
]

// ─── Logique commissions ────────────────────────────────────
const SEUIL_COM = 10000
const TAUX_COM = 0.05
const PALIERS_PRIME = [20000, 30000, 40000, 50000]
const PRIME_PAR_PALIER = 250

function calcCommissions(rdvs) {
  const totalVendu = rdvs
    .filter(r => r.statut === 'vendu' && r.montantHT)
    .reduce((s, r) => s + r.montantHT, 0)

  const baseComm = totalVendu > SEUIL_COM ? (totalVendu - SEUIL_COM) * TAUX_COM : 0
  const primesCount = PALIERS_PRIME.filter(p => totalVendu >= p).length
  const totalPrimes = primesCount * PRIME_PAR_PALIER
  const prochainPalier = PALIERS_PRIME.find(p => totalVendu < p) || null
  const resteAvantPalier = prochainPalier ? prochainPalier - totalVendu : 0

  return { totalVendu, baseComm, totalPrimes, totalComm: baseComm + totalPrimes, prochainPalier, resteAvantPalier }
}

const STATUT_LABELS = {
  planifie: { label: 'Planifié', cls: 'badge-blue' },
  fait: { label: 'RDV fait', cls: 'badge-orange' },
  vendu: { label: 'Vendu', cls: 'badge-green' },
  pas_vendu: { label: 'Pas vendu', cls: 'badge-gray' },
}

const RDV_TYPE_LABELS = {
  panneaux: 'Panneaux',
  diagnostic: 'Diagnostic',
}

// ─── Composant principal ────────────────────────────────────
export default function ProspectionApp() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const prospectrice = PROSPECTRICES[user.email] || PROSPECTRICES['prospection@cphpaca.fr']

  const [rdvs, setRdvs] = useState(() => readSyncedData(DATA_SYNC_KEYS.prospectionRdvs, RDV_INIT))
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [filter, setFilter] = useState('tous')

  useEffect(() => {
    writeSyncedData(DATA_SYNC_KEYS.prospectionRdvs, rdvs)
  }, [rdvs])

  useEffect(() => {
    return subscribeSyncedData(DATA_SYNC_KEYS.prospectionRdvs, () => {
      setRdvs(readSyncedData(DATA_SYNC_KEYS.prospectionRdvs, RDV_INIT))
    })
  }, [])

  const mesRdvs = useMemo(() => {
    let list = rdvs.filter(r => r.prospectrice === prospectrice.id)
    if (filter !== 'tous') list = list.filter(r => r.statut === filter)
    return list.sort((a, b) => b.dateRdv.localeCompare(a.dateRdv))
  }, [rdvs, prospectrice.id, filter])

  const comm = useMemo(() => calcCommissions(rdvs.filter(r => r.prospectrice === prospectrice.id)), [rdvs, prospectrice.id])

  const stats = useMemo(() => {
    const mine = rdvs.filter(r => r.prospectrice === prospectrice.id)
    return {
      total: mine.length,
      planifie: mine.filter(r => r.statut === 'planifie').length,
      fait: mine.filter(r => r.statut === 'fait').length,
      vendu: mine.filter(r => r.statut === 'vendu').length,
      pasVendu: mine.filter(r => r.statut === 'pas_vendu').length,
    }
  }, [rdvs, prospectrice.id])

  // ── Formulaire nouveau RDV ──
  const [form, setForm] = useState({
    nom: '', tel: '', adresse: '', dateRdv: '', heureRdv: '',
    typeRdv: 'diagnostic', typeToiture: '', notes: '',
  })

  const handleAdd = (e) => {
    e.preventDefault()
    const newRdv = {
      id: Date.now(),
      prospectrice: prospectrice.id,
      nom: form.nom, tel: form.tel, adresse: form.adresse,
      dateRdv: form.dateRdv, heureRdv: form.heureRdv,
      typeRdv: form.typeRdv,
      typeToiture: form.typeToiture, notes: form.notes,
      statut: 'planifie', montantHT: null,
      dateCreation: new Date().toISOString().slice(0, 10),
    }
    setRdvs(prev => [...prev, newRdv])
    setForm({ nom: '', tel: '', adresse: '', dateRdv: '', heureRdv: '', typeRdv: 'diagnostic', typeToiture: '', notes: '' })
    setShowAdd(false)
  }

  const formatDate = (d) => {
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  const formatMontant = (n) => n.toLocaleString('fr-FR') + ' €'

  return (
    <div className="prosp-app">
      {/* Header */}
      <header className="prosp-header">
        <div className="prosp-header-top">
          <div className="prosp-header-brand">
            <div className="prosp-logo"><House size={18} /></div>
            <div>
              <h1>CPH Solar</h1>
              <span>Prospection terrain</span>
            </div>
          </div>
          <button className="prosp-logout" onClick={() => { localStorage.removeItem('user'); navigate('/connexion') }}>
            <LogOut size={18} />
          </button>
        </div>
        <div className="prosp-header-user">
          <div className="prosp-avatar">{prospectrice.nom.split(' ').map(n => n[0]).join('')}</div>
          <div>
            <strong>{prospectrice.nom}</strong>
            <span>{prospectrice.secteur}</span>
          </div>
        </div>
      </header>

      {/* Stats rapides */}
      <div className="prosp-stats">
        <div className="prosp-stat">
          <span className="prosp-stat-value">{stats.total}</span>
          <span className="prosp-stat-label">RDV total</span>
        </div>
        <div className="prosp-stat">
          <span className="prosp-stat-value prosp-stat-green">{stats.vendu}</span>
          <span className="prosp-stat-label">Vendus</span>
        </div>
        <div className="prosp-stat">
          <span className="prosp-stat-value prosp-stat-blue">{stats.planifie}</span>
          <span className="prosp-stat-label">Planifiés</span>
        </div>
        <div className="prosp-stat">
          <span className="prosp-stat-value prosp-stat-orange">{stats.fait}</span>
          <span className="prosp-stat-label">En attente</span>
        </div>
      </div>

      {/* Commission */}
      <div className="prosp-commission">
        <div className="prosp-commission-header">
          <Award size={18} />
          <strong>Mes commissions</strong>
        </div>
        <div className="prosp-commission-body">
          <div className="prosp-commission-row">
            <span>CA HT vendu</span>
            <strong>{formatMontant(comm.totalVendu)}</strong>
          </div>
          <div className="prosp-commission-row">
            <span>Commission 5% {comm.totalVendu > SEUIL_COM ? `(sur ${formatMontant(comm.totalVendu - SEUIL_COM)})` : '(seuil 10k non atteint)'}</span>
            <strong>{formatMontant(comm.baseComm)}</strong>
          </div>
          <div className="prosp-commission-row">
            <span>Primes paliers</span>
            <strong>{formatMontant(comm.totalPrimes)}</strong>
          </div>
          <div className="prosp-commission-row prosp-commission-total">
            <span>Total commissions</span>
            <strong>{formatMontant(comm.totalComm)}</strong>
          </div>
          {comm.prochainPalier && (
            <div className="prosp-commission-progress">
              <div className="prosp-commission-progress-text">
                <Target size={14} />
                <span>Prochain palier : {formatMontant(comm.prochainPalier)} — encore {formatMontant(comm.resteAvantPalier)}</span>
              </div>
              <div className="prosp-commission-bar">
                <div
                  className="prosp-commission-bar-fill"
                  style={{ width: `${Math.min(100, ((comm.totalVendu - (comm.prochainPalier - 10000)) / 10000) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="prosp-filters">
        {[
          { key: 'tous', label: 'Tous' },
          { key: 'planifie', label: 'Planifiés' },
          { key: 'fait', label: 'RDV fait' },
          { key: 'vendu', label: 'Vendus' },
          { key: 'pas_vendu', label: 'Pas vendu' },
        ].map(f => (
          <button
            key={f.key}
            className={`prosp-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste RDV */}
      <div className="prosp-rdv-list">
        {mesRdvs.length === 0 && (
          <div className="prosp-empty">Aucun RDV pour ce filtre</div>
        )}
        {mesRdvs.map(rdv => {
          const s = STATUT_LABELS[rdv.statut]
          const expanded = expandedId === rdv.id
          return (
            <div key={rdv.id} className="prosp-rdv-card">
              <div className="prosp-rdv-main" onClick={() => setExpandedId(expanded ? null : rdv.id)}>
                <div className="prosp-rdv-info">
                  <strong>{rdv.nom}</strong>
                  <span className="prosp-rdv-date">
                    <Calendar size={13} /> {formatDate(rdv.dateRdv)} à {rdv.heureRdv}
                  </span>
                  <span className="prosp-rdv-addr">
                    <MapPin size={13} /> {rdv.adresse}
                  </span>
                </div>
                <div className="prosp-rdv-right">
                  <span className={`prosp-badge ${s.cls}`}>{s.label}</span>
                  {rdv.montantHT && <span className="prosp-rdv-montant">{formatMontant(rdv.montantHT)} HT</span>}
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {expanded && (
                <div className="prosp-rdv-detail">
                  <div className="prosp-rdv-detail-row">
                    <Phone size={14} /> <a href={`tel:${rdv.tel.replace(/\s/g, '')}`}>{rdv.tel}</a>
                  </div>
                  <div className="prosp-rdv-detail-row">
                    <House size={14} /> Type de RDV: {RDV_TYPE_LABELS[rdv.typeRdv] || 'Diagnostic'} {rdv.typeToiture ? `— ${rdv.typeToiture}` : ''}
                  </div>
                  {rdv.notes && (
                    <div className="prosp-rdv-detail-row prosp-rdv-notes">
                      <Edit3 size={14} /> {rdv.notes}
                    </div>
                  )}
                  <div className="prosp-rdv-detail-row prosp-rdv-created">
                    Ajouté le {formatDate(rdv.dateCreation)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* FAB ajouter */}
      <button className="prosp-fab" onClick={() => setShowAdd(true)}>
        <Plus size={22} />
      </button>

      {/* Modale ajout RDV */}
      {showAdd && (
        <div className="prosp-modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="prosp-modal" onClick={e => e.stopPropagation()}>
            <div className="prosp-modal-head">
              <h3>Nouveau RDV</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="prosp-modal-form">
              <div className="prosp-field">
                <label>Nom du prospect</label>
                <input required value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))} placeholder="Jean Dupont" />
              </div>
              <div className="prosp-field">
                <label>Téléphone</label>
                <input required value={form.tel} onChange={e => setForm(f => ({...f, tel: e.target.value}))} placeholder="06 12 34 56 78" type="tel" />
              </div>
              <div className="prosp-field">
                <label>Adresse</label>
                <input required value={form.adresse} onChange={e => setForm(f => ({...f, adresse: e.target.value}))} placeholder="15 rue des Lilas, 13012 Marseille" />
              </div>
              <div className="prosp-field-row">
                <div className="prosp-field">
                  <label>Date du RDV</label>
                  <input required type="date" value={form.dateRdv} onChange={e => setForm(f => ({...f, dateRdv: e.target.value}))} />
                </div>
                <div className="prosp-field">
                  <label>Heure</label>
                  <input required type="time" value={form.heureRdv} onChange={e => setForm(f => ({...f, heureRdv: e.target.value}))} />
                </div>
              </div>
              <div className="prosp-field-row">
                <div className="prosp-field">
                  <label>Type de RDV</label>
                  <div className="prosp-rdv-type-buttons">
                    <button type="button" className={`prosp-filter-btn ${form.typeRdv === 'panneaux' ? 'active' : ''}`} onClick={() => setForm(f => ({...f, typeRdv: 'panneaux'}))}>
                      Panneaux
                    </button>
                    <button type="button" className={`prosp-filter-btn ${form.typeRdv === 'diagnostic' ? 'active' : ''}`} onClick={() => setForm(f => ({...f, typeRdv: 'diagnostic'}))}>
                      Diagnostic
                    </button>
                  </div>
                </div>
                <div className="prosp-field">
                  <label>Type toiture</label>
                  <select value={form.typeToiture} onChange={e => setForm(f => ({...f, typeToiture: e.target.value}))}>
                    <option value="">---</option>
                    <option value="Tuile canal">Tuile canal</option>
                    <option value="Tuile romane">Tuile romane</option>
                    <option value="Tuile plate">Tuile plate</option>
                    <option value="Ardoise">Ardoise</option>
                    <option value="Bac acier">Bac acier</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
              <div className="prosp-field">
                <label>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={3} placeholder="Remarques, potentiel travaux..." />
              </div>
              <button type="submit" className="btn btn-primary prosp-modal-submit">
                <Check size={16} /> Enregistrer le RDV
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
