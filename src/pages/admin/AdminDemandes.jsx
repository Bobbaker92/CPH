import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Phone, Calendar, X as XIcon, MapPin, Sun, Layers,
  Clock, MessageCircle, ChevronRight, Filter, Plus, Download, Copy,
  Trash2, Check
} from 'lucide-react'
import ActionMenu from '../../components/ActionMenu'
import {
  SOURCE_META,
  getDemandes,
  addDemande as addDemandeStore,
  updateDemande,
  removeDemande as removeDemandeStore,
  subscribe,
} from '../../lib/demandesStore'

const STATUTS = [
  { key: 'tous', label: 'Toutes', color: 'gray' },
  { key: 'nouveau', label: 'Nouvelles', color: 'red' },
  { key: 'a-rappeler', label: '\u00C0 rappeler', color: 'orange' },
  { key: 'planifie', label: 'Planifi\u00E9es', color: 'blue' },
  { key: 'refuse', label: 'Refus\u00E9es', color: 'gray' },
]

const INTEGRATION_LABEL = {
  surimposition: 'Surimposition',
  integre: 'Int\u00E9gr\u00E9s \u00E0 la toiture',
  unknown: 'Non pr\u00E9cis\u00E9',
}

const STATUT_LABEL = {
  nouveau: 'Nouveau',
  'a-rappeler': '\u00C0 rappeler',
  planifie: 'Planifi\u00E9',
  refuse: 'Refus\u00E9',
}

function exportCSV(demandes) {
  const header = ['Nom', 'T\u00E9l', 'Email', 'Ville', 'Adresse', 'Panneaux', 'Pose', 'Statut', 'Re\u00E7u']
  const rows = demandes.map(d => [d.nom, d.tel, d.email, d.ville, d.adresse, d.panneaux, INTEGRATION_LABEL[d.integration], STATUT_LABEL[d.statut], d.dateRecu])
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `demandes-cph-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function panneauxToNumber(val) {
  if (!val || val === '—') return ''
  const m = String(val).match(/(\d+)/)
  return m ? m[1] : ''
}

export default function AdminDemandes() {
  const navigate = useNavigate()
  const [demandes, setDemandes] = useState(() => getDemandes())
  const [filtre, setFiltre] = useState('tous')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [newOpen, setNewOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setDemandes(getDemandes())
    })
    return unsubscribe
  }, [])

  const counts = useMemo(() => {
    const c = { tous: demandes.length }
    STATUTS.forEach(s => { if (s.key !== 'tous') c[s.key] = demandes.filter(d => d.statut === s.key).length })
    return c
  }, [demandes])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return demandes.filter(d => {
      if (filtre !== 'tous' && d.statut !== filtre) return false
      if (!q) return true
      return (
        d.nom.toLowerCase().includes(q) ||
        d.ville.toLowerCase().includes(q) ||
        d.tel.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
        d.email.toLowerCase().includes(q)
      )
    })
  }, [filtre, search, demandes])

  const changeStatut = (id, statut) => {
    updateDemande(id, { statut })
  }

  const planifier = (d) => {
    navigate('/admin/planning', {
      state: {
        preselected: {
          nom: d.nom,
          tel: d.tel,
          ville: d.ville,
          panneaux: panneauxToNumber(d.panneaux),
          demandeId: d.id,
        }
      }
    })
  }
  const removeDemande = (id) => removeDemandeStore(id)

  const addDemande = (data) => {
    addDemandeStore({
      ...data,
      source: 'Manuel',
      statut: 'nouveau',
    })
    setNewOpen(false)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Demandes</h1>
            <p>Leads arriv&eacute;s via le formulaire public et les appels entrants.</p>
          </div>
          <div className="page-header-actions">
            <span className="badge badge-red">{counts.nouveau || 0} nouvelles</span>
            <button className="btn btn-sm btn-outline" onClick={() => exportCSV(filtered)}><Download size={14} /> Exporter</button>
            <button className="btn btn-primary btn-sm" onClick={() => setNewOpen(true)}><Plus size={14} /> Nouvelle demande</button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="admin-toolbar">
        <div className="admin-tabs">
          {STATUTS.map(s => (
            <button
              key={s.key}
              className={`admin-tab ${filtre === s.key ? 'active' : ''}`}
              onClick={() => setFiltre(s.key)}
            >
              <span>{s.label}</span>
              <span className={`admin-tab-count admin-tab-count-${s.color}`}>{counts[s.key] || 0}</span>
            </button>
          ))}
        </div>
        <div className="admin-search admin-search-inline">
          <Search size={15} />
          <input
            type="text"
            placeholder="Rechercher&hellip;"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Liste en cartes */}
      <div className="demandes-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <Filter size={28} />
            <p>Aucune demande ne correspond aux filtres</p>
          </div>
        )}
        {filtered.map(d => (
          <article key={d.id} className={`demande-card demande-card-${d.statut}`}>
            <div className="demande-card-main">
              <div className="demande-head">
                <div>
                  <h3>{d.nom}</h3>
                  <p className="demande-meta">
                    <Clock size={12} /> {d.dateRecu}
                    <span className="demande-meta-sep">&bull;</span>
                    <span className={`demande-source ${SOURCE_META[d.source]?.cls || ''}`}>
                      <span className="demande-source-icon">{SOURCE_META[d.source]?.icon || ''}</span>
                      {d.source}
                    </span>
                  </p>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <span className={`badge badge-${d.statut === 'nouveau' ? 'red' : d.statut === 'a-rappeler' ? 'orange' : d.statut === 'planifie' ? 'blue' : 'gray'}`}>
                    {STATUT_LABEL[d.statut]}
                  </span>
                  <ActionMenu items={[
                    { icon: <ChevronRight size={13} />, label: 'Voir le d\u00E9tail', onClick: () => setSelected(d) },
                    { icon: <Calendar size={13} />, label: 'Marquer planifi\u00E9', onClick: () => changeStatut(d.id, 'planifie') },
                    { icon: <Clock size={13} />, label: '\u00C0 rappeler', onClick: () => changeStatut(d.id, 'a-rappeler') },
                    { icon: <Check size={13} />, label: 'Marquer nouveau', onClick: () => changeStatut(d.id, 'nouveau') },
                    { divider: true },
                    { icon: <Copy size={13} />, label: 'Copier t\u00E9l\u00E9phone', onClick: () => navigator.clipboard?.writeText(d.tel) },
                    { icon: <Copy size={13} />, label: 'Copier email', onClick: () => navigator.clipboard?.writeText(d.email) },
                    { divider: true },
                    { icon: <XIcon size={13} />, label: 'Refuser', onClick: () => changeStatut(d.id, 'refuse') },
                    { icon: <Trash2 size={13} />, label: 'Supprimer', danger: true, onClick: () => removeDemande(d.id) },
                  ]} />
                </div>
              </div>

              <div className="demande-infos">
                <div className="demande-info"><MapPin size={13} /> {d.ville} &mdash; {d.adresse}</div>
                <div className="demande-info"><Sun size={13} /> {d.panneaux} panneaux &bull; {INTEGRATION_LABEL[d.integration]}</div>
                <div className="demande-info"><Layers size={13} /> Tuile {d.tuile}</div>
              </div>

              {d.notes && (
                <div className="demande-note">
                  <MessageCircle size={12} /> {d.notes}
                </div>
              )}
            </div>

            <div className="demande-card-side">
              <a href={`tel:${d.tel.replace(/\s/g, '')}`} className="demande-tel">
                <Phone size={14} /> {d.tel}
              </a>
              <div className="demande-actions">
                {d.statut !== 'planifie' && (
                  <button className="btn btn-sm btn-primary" style={{justifyContent:'center'}} onClick={() => planifier(d)}>
                    <Calendar size={14} /> Planifier
                  </button>
                )}
                {d.statut === 'nouveau' && (
                  <button className="btn btn-sm btn-outline" style={{justifyContent:'center'}} onClick={() => changeStatut(d.id, 'a-rappeler')}>
                    <Clock size={14} /> Rappeler
                  </button>
                )}
                <button className="btn btn-sm btn-ghost" onClick={() => setSelected(d)}>
                  D&eacute;tail <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Drawer détail */}
      {selected && (
        <>
          <div className="admin-drawer-backdrop" onClick={() => setSelected(null)} />
          <aside className="admin-detail-drawer">
            <div className="admin-detail-head">
              <div>
                <h2>{selected.nom}</h2>
                <p>Demande #{selected.id} &bull; {selected.dateRecu}</p>
              </div>
              <button className="admin-drawer-close" onClick={() => setSelected(null)}>
                <XIcon size={20} />
              </button>
            </div>
            <div className="admin-detail-body">
              <section className="admin-detail-section">
                <h4>Contact</h4>
                <div className="admin-detail-row"><span>T&eacute;l&eacute;phone</span><a href={`tel:${selected.tel.replace(/\s/g, '')}`}>{selected.tel}</a></div>
                <div className="admin-detail-row"><span>Email</span><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
                <div className="admin-detail-row"><span>Adresse</span><strong>{selected.adresse}</strong></div>
                <div className="admin-detail-row"><span>Ville</span><strong>{selected.ville}</strong></div>
              </section>
              <section className="admin-detail-section">
                <h4>Installation</h4>
                <div className="admin-detail-row"><span>Panneaux</span><strong>{selected.panneaux}</strong></div>
                <div className="admin-detail-row"><span>Tuiles</span><strong>{selected.tuile}</strong></div>
                <div className="admin-detail-row"><span>Pose</span><strong>{INTEGRATION_LABEL[selected.integration]}</strong></div>
                <div className="admin-detail-row"><span>Maison</span><strong>{selected.etage}</strong></div>
              </section>
              {selected.notes && (
                <section className="admin-detail-section">
                  <h4>Notes internes</h4>
                  <p className="admin-detail-note">{selected.notes}</p>
                </section>
              )}
            </div>
            <div className="admin-detail-foot">
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Fermer</button>
              <button className="btn btn-primary btn-sm" onClick={() => { planifier(selected); setSelected(null) }}>
                <Calendar size={14} /> Planifier
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Modal nouvelle demande */}
      {newOpen && <NewDemandeModal onClose={() => setNewOpen(false)} onSubmit={addDemande} />}
    </>
  )
}

function NewDemandeModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    nom: '', tel: '', email: '', ville: '', adresse: '',
    panneaux: '', tuile: '', integration: 'unknown', etage: '', notes: '',
  })
  const canSubmit = form.nom && form.tel && form.ville

  const submit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit(form)
  }

  return (
    <>
      <div className="admin-drawer-backdrop" onClick={onClose} />
      <div className="admin-modal" role="dialog" aria-modal="true">
        <form onSubmit={submit} className="admin-modal-inner">
          <div className="admin-modal-head">
            <h2>Nouvelle demande</h2>
            <button type="button" className="admin-drawer-close" onClick={onClose}>
              <XIcon size={20} />
            </button>
          </div>

          <div className="admin-modal-body">
            <h4 className="admin-modal-section-title">Contact</h4>
            <div className="admin-modal-grid">
              <div className="input-group">
                <label>Nom complet *</label>
                <input type="text" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>T&eacute;l&eacute;phone *</label>
                <input type="tel" value={form.tel} onChange={e => setForm({...form, tel: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Ville *</label>
                <input type="text" value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} required />
              </div>
              <div className="input-group" style={{gridColumn:'1 / -1'}}>
                <label>Adresse</label>
                <input type="text" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} />
              </div>
            </div>

            <h4 className="admin-modal-section-title">Installation</h4>
            <div className="admin-modal-grid">
              <div className="input-group">
                <label>Panneaux</label>
                <select value={form.panneaux} onChange={e => setForm({...form, panneaux: e.target.value})}>
                  <option value="">&mdash;</option>
                  <option>6-10</option>
                  <option>10-16</option>
                  <option>16-24</option>
                  <option>24+</option>
                </select>
              </div>
              <div className="input-group">
                <label>Tuile</label>
                <select value={form.tuile} onChange={e => setForm({...form, tuile: e.target.value})}>
                  <option value="">&mdash;</option>
                  <option value="canal">Canal</option>
                  <option value="romane">Romane</option>
                  <option value="redland">Redland</option>
                  <option value="plate">Plate</option>
                  <option value="bac-acier">Bac acier</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="input-group" style={{gridColumn:'1 / -1'}}>
                <label>Pose des panneaux</label>
                <div className="admin-modal-pills">
                  {[
                    { v: 'surimposition', l: 'Surimposition' },
                    { v: 'integre', l: 'Int\u00E9gr\u00E9s' },
                    { v: 'unknown', l: 'Inconnu' },
                  ].map(o => (
                    <button
                      key={o.v}
                      type="button"
                      className={`planning-pill ${form.integration === o.v ? 'active' : ''}`}
                      onClick={() => setForm({...form, integration: o.v})}
                    >{o.l}</button>
                  ))}
                </div>
              </div>
            </div>

            <h4 className="admin-modal-section-title">Notes internes</h4>
            <textarea
              className="notes-field"
              placeholder="Ex\u00A0: contact\u00E9 par t\u00E9l\u00E9phone, rappeler demain&hellip;"
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
            />
          </div>

          <div className="admin-modal-foot">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={!canSubmit}>
              <Plus size={14} /> Cr&eacute;er la demande
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
