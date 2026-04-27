import { useState, useMemo, useEffect } from 'react'
import {
  Search, MapPin, Phone, Mail, Plus, Users, Repeat, TrendingUp, X as XIcon,
  Calendar, FileText, MessageCircle, Edit3, Trash2, Copy, Download, Sun, Key, Check, Send
} from 'lucide-react'
import ActionMenu from '../../components/ActionMenu'
import { resetClientPasswordByAdmin } from '../../lib/clientAuth'
import { getClients, subscribe as subscribeClients } from '../../lib/clientsStore'
import { getInterventions, subscribe as subscribeInterventions } from '../../lib/interventionsStore'

const STATUT_BADGE = {
  nouveau: { label: 'Nouveau', cls: 'badge-blue' },
  actif: { label: 'Actif', cls: 'badge-green' },
  vip: { label: 'VIP', cls: 'badge-orange' },
}

function normalizeId(id) {
  return String(id)
}

function formatDateFr(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR')
}

function exportCSV(clients) {
  const header = ['Nom', 'Téléphone', 'Email', 'Ville', 'Interventions', 'CA', 'Dernière', 'Statut']
  const rows = clients.map((c) => [c.nom, c.tel, c.email, c.ville, c.interventions, c.ca, c.derniere, c.statut])
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `clients-cph-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminClients() {
  const [clients, setClients] = useState(() => getClients())
  const [interventions, setInterventions] = useState(() => getInterventions())
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('tous')
  const [selectedId, setSelectedId] = useState(null)
  const [tab, setTab] = useState('infos')
  const [pwdReset, setPwdReset] = useState(null) // { client, password, sent }
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const unsubscribeClients = subscribeClients(() => setClients(getClients()))
    const unsubscribeInterventions = subscribeInterventions(() => setInterventions(getInterventions()))
    return () => {
      unsubscribeClients()
      unsubscribeInterventions()
    }
  }, [])

  const interventionsByClientId = useMemo(() => {
    const map = {}
    interventions.forEach((intervention) => {
      if (!intervention.clientId) return
      const key = normalizeId(intervention.clientId)
      if (!map[key]) map[key] = []
      map[key].push(intervention)
    })
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => b.date.localeCompare(a.date) || String(a.heureSort || '').localeCompare(String(b.heureSort || '')))
    })
    return map
  }, [interventions])

  const clientsEnrichis = useMemo(() => {
    return clients.map((client) => {
      const linked = interventionsByClientId[normalizeId(client.id)] || []
      const interventionsCount = linked.length > 0 ? linked.length : Number(client.interventions) || 0
      const ca = linked.length > 0 ? linked.reduce((sum) => sum + 199, 0) : Number(client.ca) || 0
      const derniere = linked.length > 0 ? formatDateFr(linked[0].date) : (client.derniere || '—')
      return {
        ...client,
        interventions: interventionsCount,
        ca,
        derniere,
      }
    })
  }, [clients, interventionsByClientId])

  const openPwdReset = (client) => {
    const { password } = resetClientPasswordByAdmin(client.email, { nom: client.nom, tel: client.tel })
    setPwdReset({ client, password, sent: false })
  }

  const copy = (value, key) => {
    navigator.clipboard?.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  const stats = useMemo(() => ({
    total: clientsEnrichis.length,
    recurrents: clientsEnrichis.filter((c) => c.interventions > 1).length,
    ca: clientsEnrichis.reduce((sum, c) => sum + (Number(c.ca) || 0), 0),
  }), [clientsEnrichis])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clientsEnrichis.filter((c) => {
      if (statut !== 'tous' && c.statut !== statut) return false
      if (!q) return true
      return c.nom.toLowerCase().includes(q) || c.ville.toLowerCase().includes(q) || c.tel.includes(q) || c.email.toLowerCase().includes(q)
    })
  }, [clientsEnrichis, search, statut])

  const selected = useMemo(() => {
    if (!selectedId) return null
    return clientsEnrichis.find((client) => normalizeId(client.id) === normalizeId(selectedId)) || null
  }, [clientsEnrichis, selectedId])

  const selectedHistorique = useMemo(() => {
    if (!selected) return []
    return interventionsByClientId[normalizeId(selected.id)] || []
  }, [interventionsByClientId, selected])

  const openClient = (client) => {
    setSelectedId(client.id)
    setTab('infos')
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Clients</h1>
            <p>Base client consolidée avec historique d'interventions.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-sm btn-outline" onClick={() => exportCSV(filtered)}><Download size={14} /> Exporter</button>
            <button className="btn btn-primary btn-sm"><Plus size={14} /> Ajouter</button>
          </div>
        </div>
      </div>

      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">Clients au total</div>
            <Users size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-change"><TrendingUp size={12} /> +2 ce mois</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">Clients récurrents</div>
            <Repeat size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{stats.recurrents}</div>
          <div className="stat-change">{stats.total ? Math.round((stats.recurrents / stats.total) * 100) : 0}% de la base</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">CA cumulé</div>
            <TrendingUp size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{stats.ca.toLocaleString('fr-FR')} €</div>
          <div className="stat-change">Depuis 2025</div>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-tabs">
          {[
            { k: 'tous', l: 'Tous', c: clientsEnrichis.length },
            { k: 'nouveau', l: 'Nouveaux', c: clientsEnrichis.filter((c) => c.statut === 'nouveau').length },
            { k: 'actif', l: 'Actifs', c: clientsEnrichis.filter((c) => c.statut === 'actif').length },
            { k: 'vip', l: 'VIP', c: clientsEnrichis.filter((c) => c.statut === 'vip').length },
          ].map((t) => (
            <button key={t.k} className={`admin-tab ${statut === t.k ? 'active' : ''}`} onClick={() => setStatut(t.k)}>
              <span>{t.l}</span><span className="admin-tab-count admin-tab-count-gray">{t.c}</span>
            </button>
          ))}
        </div>
        <div className="admin-search admin-search-inline">
          <Search size={15} />
          <input type="text" placeholder="Nom, ville, téléphone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-card admin-list-card">
        <table className="admin-table admin-table-clickable">
          <thead>
            <tr>
              <th>Client</th>
              <th>Ville</th>
              <th>Contact</th>
              <th className="cell-num">Interv.</th>
              <th className="cell-num">CA</th>
              <th>Dernière</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} onClick={() => openClient(client)}>
                <td data-label="Client">
                  <div className="cell-client">
                    <span className="avatar-sm">{client.nom.split(' ').map((s) => s[0]).slice(0, 2).join('')}</span>
                    <strong>{client.nom}</strong>
                  </div>
                </td>
                <td data-label="Ville"><span className="cell-with-icon"><MapPin size={12} /> {client.ville}</span></td>
                <td data-label="Contact">
                  <div className="cell-contact">
                    <a href={`tel:${client.tel.replace(/\s/g, '')}`} onClick={(e) => e.stopPropagation()}><Phone size={12} /> {client.tel}</a>
                    <a href={`mailto:${client.email}`} className="muted" onClick={(e) => e.stopPropagation()}><Mail size={12} /> {client.email}</a>
                  </div>
                </td>
                <td data-label="Interventions" className="cell-num"><strong>{client.interventions}</strong></td>
                <td data-label="CA" className="cell-num"><strong>{client.ca.toLocaleString('fr-FR')} €</strong></td>
                <td data-label="Dernière">{client.derniere}</td>
                <td data-label="Statut"><span className={`badge ${STATUT_BADGE[client.statut]?.cls || 'badge-gray'}`}>{STATUT_BADGE[client.statut]?.label || client.statut}</span></td>
                <td data-label="" onClick={(e) => e.stopPropagation()}>
                  <ActionMenu items={[
                    { icon: <FileText size={13} />, label: 'Voir la fiche', onClick: () => openClient(client) },
                    { icon: <Edit3 size={13} />, label: 'Modifier' },
                    { icon: <Calendar size={13} />, label: 'Planifier une intervention' },
                    { icon: <FileText size={13} />, label: 'Créer un devis' },
                    { divider: true },
                    { icon: <Key size={13} />, label: 'Réinitialiser le mot de passe', onClick: () => openPwdReset(client) },
                    { icon: <Copy size={13} />, label: 'Copier l\'email', onClick: () => navigator.clipboard?.writeText(client.email) },
                    { divider: true },
                    { icon: <Trash2 size={13} />, label: 'Supprimer', danger: true },
                  ]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <>
          <div className="admin-drawer-backdrop" onClick={() => setSelectedId(null)} />
          <aside className="admin-detail-drawer admin-detail-drawer-wide">
            <div className="admin-detail-head">
              <div className="admin-detail-head-client">
                <span className="avatar-sm" style={{ width: 40, height: 40, fontSize: 14 }}>
                  {selected.nom.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                </span>
                <div>
                  <h2>{selected.nom}</h2>
                  <p>Client #{selected.id} • <span className={`badge ${STATUT_BADGE[selected.statut]?.cls || 'badge-gray'}`}>{STATUT_BADGE[selected.statut]?.label || selected.statut}</span></p>
                </div>
              </div>
              <button className="admin-drawer-close" onClick={() => setSelectedId(null)}>
                <XIcon size={20} />
              </button>
            </div>

            <div className="admin-detail-tabs">
              <button className={`admin-detail-tab ${tab === 'infos' ? 'active' : ''}`} onClick={() => setTab('infos')}>Infos</button>
              <button className={`admin-detail-tab ${tab === 'historique' ? 'active' : ''}`} onClick={() => setTab('historique')}>Historique</button>
              <button className={`admin-detail-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>Notes</button>
            </div>

            <div className="admin-detail-body">
              {tab === 'infos' && (
                <>
                  <section className="admin-detail-section">
                    <h4>Contact</h4>
                    <div className="admin-detail-row"><span>Téléphone</span><a href={`tel:${selected.tel.replace(/\s/g, '')}`}>{selected.tel}</a></div>
                    <div className="admin-detail-row"><span>Email</span><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
                    <div className="admin-detail-row"><span>Adresse</span><strong>{selected.adresse}</strong></div>
                    <div className="admin-detail-row"><span>Ville</span><strong>{selected.ville}</strong></div>
                  </section>
                  <section className="admin-detail-section">
                    <h4>Statistiques</h4>
                    <div className="mini-stats">
                      <div><span>{selected.interventions}</span><em>Interventions</em></div>
                      <div><span>{selected.ca.toLocaleString('fr-FR')} €</span><em>CA total</em></div>
                      <div><span>{selected.derniere}</span><em>Dernière</em></div>
                    </div>
                  </section>
                </>
              )}

              {tab === 'historique' && (
                <section className="admin-detail-section">
                  <h4>Historique d'activité</h4>
                  {selectedHistorique.length === 0 ? (
                    <p className="muted" style={{ fontSize: 13 }}>Aucune intervention liée à ce client.</p>
                  ) : (
                    <ul className="detail-timeline">
                      {selectedHistorique.map((item) => (
                        <li key={item.id} className="detail-timeline-item detail-timeline-intervention">
                          <span className="detail-timeline-dot"><Sun size={11} /></span>
                          <div>
                            <div className="detail-timeline-head">
                              <strong>Intervention {item.heure}</strong>
                              <span>{formatDateFr(item.date)}</span>
                            </div>
                            <p>
                              {item.ville} — {item.panneaux} panneaux — {item.statut === 'confirme' ? 'Confirmée' : item.statut === 'a-confirmer' ? 'À confirmer' : item.statut}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {tab === 'notes' && (
                <section className="admin-detail-section">
                  <h4>Notes internes</h4>
                  {selected.notes
                    ? <p className="admin-detail-note">{selected.notes}</p>
                    : <p className="muted" style={{ fontSize: 13 }}>Aucune note pour ce client.</p>}
                  <textarea className="notes-field" placeholder="Ajouter une note…" style={{ marginTop: 12 }} />
                </section>
              )}
            </div>

            <div className="admin-detail-foot">
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedId(null)}>Fermer</button>
              <button className="btn btn-primary btn-sm"><Calendar size={14} /> Planifier</button>
            </div>
          </aside>
        </>
      )}

      {pwdReset && (
        <div className="pw-report-backdrop" onClick={() => setPwdReset(null)}>
          <div className="pw-report-modal admin-pwd-reset-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pw-report-head">
              <h3>Réinitialiser le mot de passe</h3>
              <button onClick={() => setPwdReset(null)}><XIcon size={20} /></button>
            </div>

            <div className="admin-pwd-reset-body">
              <div className="admin-pwd-reset-client">
                <span className="avatar-sm">{pwdReset.client.nom.split(' ').map((s) => s[0]).slice(0, 2).join('')}</span>
                <div>
                  <strong>{pwdReset.client.nom}</strong>
                  <span>{pwdReset.client.email}</span>
                </div>
              </div>

              <div className="admin-pwd-reset-info">
                <Key size={14} />
                <div>
                  <strong>Nouveau mot de passe généré</strong>
                  <span>Communiquez-le au client. Son ancien mot de passe est désormais invalide.</span>
                </div>
              </div>

              <div className="admin-pwd-reset-cred">
                <span>Mot de passe</span>
                <code>{pwdReset.password}</code>
                <button className="icon-btn" onClick={() => copy(pwdReset.password, 'pwd')} title="Copier">
                  {copied === 'pwd' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {!pwdReset.sent ? (
                <button className="btn btn-primary admin-pwd-reset-send" onClick={() => setPwdReset((p) => ({ ...p, sent: true }))}>
                  <Send size={14} /> Envoyer par email à {pwdReset.client.email}
                </button>
              ) : (
                <div className="admin-pwd-reset-sent">
                  <Check size={16} />
                  <span>Email envoyé à <strong>{pwdReset.client.email}</strong> (simulé en maquette).</span>
                </div>
              )}
            </div>

            <div className="pw-report-actions">
              <button className="btn btn-outline" onClick={() => setPwdReset(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
