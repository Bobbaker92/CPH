import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Filter, ChevronDown, ChevronUp, Phone, MapPin, Calendar, Euro,
  Check, X, Clock, Target, Award, TrendingUp, User, Users, Edit3
} from 'lucide-react'
import ActionMenu from '../../components/ActionMenu'
import { DATA_SYNC_KEYS, readSyncedData, subscribeSyncedData, writeSyncedData } from '../../lib/dataSync'

// ─── Données mock ───────────────────────────────────────────
const PROSPECTRICES_LIST = [
  { id: 1, nom: 'Nadia Belkacem', tel: '06 55 44 33 22', secteur: 'Marseille Nord / Aubagne', email: 'prospection@cphpaca.fr' },
  { id: 2, nom: 'Samira Kaci', tel: '06 11 22 33 44', secteur: 'Aix / Gardanne', email: 'samira@cphpaca.fr' },
]

const RDV_ALL = [
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
  // RDV de Samira
  {
    id: 6, prospectrice: 2,
    nom: 'Pierre Dumont', tel: '06 77 88 99 00',
    adresse: '12 cours Mirabeau, 13100 Aix-en-Provence',
    dateRdv: '2026-04-17', heureRdv: '09:30',
    typeRdv: 'diagnostic', typeToiture: 'Tuile romane',
    notes: 'Grand toit, potentiel hydrofuge',
    statut: 'fait', montantHT: null,
    dateCreation: '2026-04-12',
  },
  {
    id: 7, prospectrice: 2,
    nom: 'Claire Durand', tel: '06 33 22 11 00',
    adresse: '5 rue Gambetta, 13120 Gardanne',
    dateRdv: '2026-04-16', heureRdv: '14:00',
    typeRdv: 'panneaux', typeToiture: 'Bac acier',
    notes: 'Petits travaux zinguerie',
    statut: 'vendu', montantHT: 3200,
    dateCreation: '2026-04-11',
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
  return { totalVendu, baseComm, totalPrimes, totalComm: baseComm + totalPrimes }
}

const STATUT_OPTIONS = [
  { value: 'planifie', label: 'Planifié', cls: 'badge-blue' },
  { value: 'fait', label: 'RDV fait', cls: 'badge-orange' },
  { value: 'vendu', label: 'Vendu', cls: 'badge-green' },
  { value: 'pas_vendu', label: 'Pas vendu', cls: 'badge-gray' },
]

const RDV_TYPE_LABELS = {
  panneaux: 'Panneaux',
  diagnostic: 'Diagnostic',
}

const formatMontant = (n) => n.toLocaleString('fr-FR') + ' €'
const formatDate = (d) => { const [y, m, day] = d.split('-'); return `${day}/${m}/${y}` }
const extractVille = (adresse) => {
  if (!adresse) return ''
  const chunk = adresse.split(',').pop()?.trim() || ''
  if (!chunk) return adresse
  const m = chunk.match(/^(\d{5})\s+(.+)$/)
  return m ? `${m[2]} ${m[1]}` : chunk
}
const estimatePanneaux = (rdv) => (rdv.typeRdv === 'panneaux' ? 10 : 6)

// ─── Composant principal ────────────────────────────────────
export default function AdminProspection() {
  const navigate = useNavigate()
  const [rdvs, setRdvs] = useState(() => readSyncedData(DATA_SYNC_KEYS.prospectionRdvs, RDV_ALL))
  const [search, setSearch] = useState('')
  const [filterProsp, setFilterProsp] = useState('tous')
  const [filterStatut, setFilterStatut] = useState('tous')
  const [editingId, setEditingId] = useState(null)
  const [editMontant, setEditMontant] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    writeSyncedData(DATA_SYNC_KEYS.prospectionRdvs, rdvs)
  }, [rdvs])

  useEffect(() => {
    return subscribeSyncedData(DATA_SYNC_KEYS.prospectionRdvs, () => {
      setRdvs(readSyncedData(DATA_SYNC_KEYS.prospectionRdvs, RDV_ALL))
    })
  }, [])

  const filtered = useMemo(() => {
    let list = [...rdvs]
    if (filterProsp !== 'tous') list = list.filter(r => r.prospectrice === parseInt(filterProsp))
    if (filterStatut !== 'tous') list = list.filter(r => r.statut === filterStatut)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.nom.toLowerCase().includes(q) ||
        r.adresse.toLowerCase().includes(q) ||
        r.tel.includes(q)
      )
    }
    return list.sort((a, b) => b.dateRdv.localeCompare(a.dateRdv))
  }, [rdvs, filterProsp, filterStatut, search])

  const updateStatut = (id, newStatut) => {
    setRdvs(prev => prev.map(r => r.id === id ? { ...r, statut: newStatut, montantHT: newStatut === 'vendu' ? r.montantHT : null } : r))
    if (newStatut === 'vendu') {
      setEditingId(id)
      setEditMontant('')
    }
  }

  const saveMontant = (id) => {
    const val = parseFloat(editMontant)
    if (!val || val <= 0) return
    setRdvs(prev => prev.map(r => r.id === id ? { ...r, montantHT: val } : r))
    setEditingId(null)
    setEditMontant('')
  }

  // Stats globales
  const globalStats = useMemo(() => {
    const vendu = rdvs.filter(r => r.statut === 'vendu')
    const fait = rdvs.filter(r => r.statut === 'fait' || r.statut === 'vendu' || r.statut === 'pas_vendu')
    const caTotal = vendu.reduce((s, r) => s + (r.montantHT || 0), 0)
    return {
      totalRdvs: rdvs.length,
      qualifies: fait.length,
      vendus: vendu.length,
      pasVendu: rdvs.filter(r => r.statut === 'pas_vendu').length,
      enAttente: rdvs.filter(r => r.statut === 'planifie').length,
      tauxConversion: fait.length > 0 ? Math.round((vendu.length / fait.length) * 100) : 0,
      caTotal,
    }
  }, [rdvs])

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Prospection terrain</h1>
            <p>Suivi des RDV et commissions des prospectrices</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="admin-kpi-row admin-kpi-row-6">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}><Calendar size={20} /></div>
          <div><p className="admin-kpi-value">{globalStats.totalRdvs}</p><p className="admin-kpi-label">RDV pris</p></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--primary)', color: 'white' }}><Check size={20} /></div>
          <div><p className="admin-kpi-value">{globalStats.qualifies}</p><p className="admin-kpi-label">RDV qualifiés</p></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--green-light)', color: 'var(--green)' }}><Check size={20} /></div>
          <div><p className="admin-kpi-value">{globalStats.vendus}</p><p className="admin-kpi-label">Vendus</p></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}><X size={20} /></div>
          <div><p className="admin-kpi-value">{globalStats.pasVendu}</p><p className="admin-kpi-label">Pas vendu</p></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}><TrendingUp size={20} /></div>
          <div><p className="admin-kpi-value">{globalStats.tauxConversion}%</p><p className="admin-kpi-label">Taux conversion</p></div>
        </div>
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}><Euro size={20} /></div>
          <div><p className="admin-kpi-value">{formatMontant(globalStats.caTotal)}</p><p className="admin-kpi-label">CA HT total</p></div>
        </div>
      </div>

      {/* Commissions par prospectrice */}
      <div className="admin-prosp-commissions">
        <h2><Award size={18} /> Commissions par prospectrice</h2>
        <div className="admin-prosp-comm-grid">
          {PROSPECTRICES_LIST.map(p => {
            const pRdvs = rdvs.filter(r => r.prospectrice === p.id)
            const c = calcCommissions(pRdvs)
            const nbTotal = pRdvs.length
            const nbQualifies = pRdvs.filter(r => r.statut === 'fait' || r.statut === 'vendu' || r.statut === 'pas_vendu').length
            const nbVendus = pRdvs.filter(r => r.statut === 'vendu').length
            const nbPasVendu = pRdvs.filter(r => r.statut === 'pas_vendu').length
            const nbPlanifie = pRdvs.filter(r => r.statut === 'planifie').length
            const tauxConv = nbQualifies > 0 ? Math.round((nbVendus / nbQualifies) * 100) : 0
            return (
              <div key={p.id} className="admin-prosp-comm-card">
                <div className="admin-prosp-comm-head">
                  <div className="prosp-avatar">{p.nom.split(' ').map(n => n[0]).join('')}</div>
                  <div>
                    <strong>{p.nom}</strong>
                    <span>{p.secteur}</span>
                  </div>
                </div>
                <div className="admin-prosp-comm-stats admin-prosp-comm-stats-6">
                  <div>
                    <span className="admin-prosp-comm-stat-val">{nbTotal}</span>
                    <span className="admin-prosp-comm-stat-label">RDV pris</span>
                  </div>
                  <div>
                    <span className="admin-prosp-comm-stat-val">{nbQualifies}</span>
                    <span className="admin-prosp-comm-stat-label">Qualifiés</span>
                  </div>
                  <div>
                    <span className="admin-prosp-comm-stat-val" style={{color: 'var(--green)'}}>{nbVendus}</span>
                    <span className="admin-prosp-comm-stat-label">Vendus</span>
                  </div>
                  <div>
                    <span className="admin-prosp-comm-stat-val" style={{color: 'var(--gray-400)'}}>{nbPasVendu}</span>
                    <span className="admin-prosp-comm-stat-label">Pas vendu</span>
                  </div>
                  <div>
                    <span className="admin-prosp-comm-stat-val" style={{color: 'var(--blue)'}}>{nbPlanifie}</span>
                    <span className="admin-prosp-comm-stat-label">En attente</span>
                  </div>
                  <div>
                    <span className="admin-prosp-comm-stat-val" style={{color: tauxConv >= 50 ? 'var(--green)' : tauxConv >= 30 ? 'var(--orange)' : 'var(--red)'}}>{tauxConv}%</span>
                    <span className="admin-prosp-comm-stat-label">Conversion</span>
                  </div>
                </div>
                <div className="admin-prosp-comm-stats" style={{borderBottom: '1px solid var(--gray-100)'}}>
                  <div>
                    <span className="admin-prosp-comm-stat-val">{formatMontant(c.totalVendu)}</span>
                    <span className="admin-prosp-comm-stat-label">CA HT</span>
                  </div>
                </div>
                <div className="admin-prosp-comm-detail">
                  <div className="admin-prosp-comm-row">
                    <span>Commission 5%</span>
                    <strong>{formatMontant(c.baseComm)}</strong>
                  </div>
                  <div className="admin-prosp-comm-row">
                    <span>Primes paliers</span>
                    <strong>{formatMontant(c.totalPrimes)}</strong>
                  </div>
                  <div className="admin-prosp-comm-row admin-prosp-comm-total">
                    <span>Total dû</span>
                    <strong>{formatMontant(c.totalComm)}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filtres + recherche */}
      <div className="admin-prosp-toolbar">
        <div className="admin-search" style={{ flex: 1, maxWidth: 320 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher prospect, adresse, tél..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-prosp-select" value={filterProsp} onChange={e => setFilterProsp(e.target.value)}>
          <option value="tous">Toutes les prospectrices</option>
          {PROSPECTRICES_LIST.map(p => (
            <option key={p.id} value={p.id}>{p.nom}</option>
          ))}
        </select>
        <select className="admin-prosp-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="tous">Tous les statuts</option>
          {STATUT_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Tableau RDV */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Prospect</th>
              <th>Prospectrice</th>
              <th>Date RDV</th>
              <th>Adresse</th>
              <th>Statut</th>
              <th>Montant HT</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(rdv => {
              const prosp = PROSPECTRICES_LIST.find(p => p.id === rdv.prospectrice)
              const expanded = expandedId === rdv.id
              return (
                <React.Fragment key={rdv.id}>
                <tr className={expanded ? 'admin-row-expanded' : ''}>
                  <td data-label="Prospect">
                    <div className="admin-prosp-prospect">
                      <strong>{rdv.nom}</strong>
                      <span><Phone size={12} /> <a href={`tel:${rdv.tel.replace(/\s/g, '')}`}>{rdv.tel}</a></span>
                    </div>
                  </td>
                  <td data-label="Prospectrice">{prosp?.nom || '—'}</td>
                  <td data-label="Date RDV">
                    <span className="admin-prosp-date">
                      {formatDate(rdv.dateRdv)} à {rdv.heureRdv}
                    </span>
                  </td>
                  <td data-label="Adresse">
                    <span className="admin-prosp-addr"><MapPin size={12} /> {rdv.adresse}</span>
                  </td>
                  <td data-label="Statut">
                    <select
                      className={`prosp-badge-select ${STATUT_OPTIONS.find(s => s.value === rdv.statut)?.cls || ''}`}
                      value={rdv.statut}
                      onChange={e => updateStatut(rdv.id, e.target.value)}
                    >
                      {STATUT_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td data-label="Montant HT">
                    {editingId === rdv.id ? (
                      <div className="admin-prosp-montant-edit">
                        <input
                          type="number"
                          placeholder="Montant HT"
                          value={editMontant}
                          onChange={e => setEditMontant(e.target.value)}
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && saveMontant(rdv.id)}
                        />
                        <button className="btn btn-sm btn-primary" onClick={() => saveMontant(rdv.id)}><Check size={14} /></button>
                        <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)}><X size={14} /></button>
                      </div>
                    ) : rdv.statut === 'vendu' ? (
                      <span
                        className="admin-prosp-montant"
                        onClick={() => { setEditingId(rdv.id); setEditMontant(rdv.montantHT?.toString() || '') }}
                        title="Cliquer pour modifier"
                      >
                        {rdv.montantHT ? formatMontant(rdv.montantHT) : <em className="admin-prosp-montant-empty">Saisir montant</em>}
                      </span>
                    ) : (
                      <span className="admin-prosp-montant-na">—</span>
                    )}
                  </td>
                  <td data-label="Actions">
                    <ActionMenu
                      items={[
                        { label: 'Voir détails', icon: '👁️', onClick: () => setExpandedId(expanded ? null : rdv.id) },
                        {
                          label: 'Ajouter au planning',
                          icon: '🗓️',
                          onClick: () => navigate('/admin/planning', {
                            state: {
                              preselected: {
                                nom: rdv.nom,
                                tel: rdv.tel,
                                ville: extractVille(rdv.adresse),
                                panneaux: estimatePanneaux(rdv),
                              },
                            },
                          }),
                        },
                        rdv.statut === 'planifie' && { label: 'Marquer RDV fait', icon: '✅', onClick: () => updateStatut(rdv.id, 'fait') },
                        rdv.statut === 'fait' && { label: 'Marquer vendu', icon: '💰', onClick: () => updateStatut(rdv.id, 'vendu') },
                        rdv.statut === 'fait' && { label: 'Marquer pas vendu', icon: '❌', onClick: () => updateStatut(rdv.id, 'pas_vendu') },
                      ].filter(Boolean)}
                    />
                  </td>
                </tr>
                {expanded && (
                  <tr className="admin-prosp-detail-row">
                    <td colSpan={7}>
                      <div className="admin-prosp-detail-content">
                        <div className="admin-prosp-detail-grid">
                          <div><strong>Téléphone</strong><br /><a href={`tel:${rdv.tel.replace(/\s/g, '')}`}>{rdv.tel}</a></div>
                          <div><strong>Type de RDV</strong><br />{RDV_TYPE_LABELS[rdv.typeRdv] || 'Diagnostic'}</div>
                          <div><strong>Type toiture</strong><br />{rdv.typeToiture || '—'}</div>
                          <div><strong>Ajouté le</strong><br />{formatDate(rdv.dateCreation)}</div>
                        </div>
                        {rdv.notes && <div className="admin-prosp-detail-notes"><strong>Notes :</strong> {rdv.notes}</div>}
                        <div className="admin-prosp-detail-actions">
                          <a href={`tel:${rdv.tel.replace(/\s/g, '')}`} className="btn btn-sm btn-dark"><Phone size={14} /> Appeler</a>
                          <button className="btn btn-sm btn-outline" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(rdv.adresse)}`, '_blank')}><MapPin size={14} /> Itinéraire</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="admin-empty">Aucun RDV ne correspond à vos filtres</div>
        )}
      </div>
    </>
  )
}
