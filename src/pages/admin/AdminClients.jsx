import { useState, useMemo } from 'react'
import {
  Search, MapPin, Phone, Mail, Plus, Users, Repeat, TrendingUp, X as XIcon,
  Calendar, FileText, Star, MessageCircle, Edit3, Trash2, Copy, Download, Gift, Sun
} from 'lucide-react'
import ActionMenu from '../../components/ActionMenu'

const CLIENTS = [
  { id: 1, nom: 'Jean-Pierre Martin', tel: '06 12 34 56 78', email: 'jp.martin@free.fr', ville: 'Marseille 13008', adresse: '12 rue Paradis', interventions: 3, ca: 597, derniere: '12/03/2026', statut: 'actif', notes: 'Client r\u00E9gulier, 2 panneaux suppl\u00E9mentaires pr\u00E9vus.' },
  { id: 2, nom: 'Marie Duval', tel: '06 98 76 54 32', email: 'm.duval@gmail.com', ville: 'Marseille 13012', adresse: '8 bd National', interventions: 2, ca: 398, derniere: '04/02/2026', statut: 'actif', notes: '' },
  { id: 3, nom: 'Robert Vidal', tel: '06 11 22 33 44', email: 'rvidal@orange.fr', ville: 'Marseille 13005', adresse: '45 rue de Rome', interventions: 4, ca: 3397, derniere: '28/03/2026', statut: 'vip', notes: 'Signataire d\'un contrat couverture 3200\u00A0\u20AC en mars.' },
  { id: 4, nom: 'Sophie Blanc', tel: '07 88 99 00 11', email: 's.blanc@yahoo.fr', ville: 'Marseille 13004', adresse: '3 avenue du Prado', interventions: 1, ca: 199, derniere: '15/01/2026', statut: 'nouveau', notes: '' },
  { id: 5, nom: 'Paul Roche', tel: '06 55 44 33 22', email: 'paul.r@laposte.net', ville: 'Aubagne 13400', adresse: '28 chemin des Oliviers', interventions: 2, ca: 398, derniere: '22/03/2026', statut: 'actif', notes: '' },
  { id: 6, nom: 'Ahmed Mansour', tel: '07 22 33 44 55', email: 'a.mansour@gmail.com', ville: 'Aix 13100', adresse: '14 cours Mirabeau', interventions: 1, ca: 199, derniere: '18/05/2026', statut: 'nouveau', notes: 'Contact par t\u00E9l\u00E9phone suite pub locale.' },
  { id: 7, nom: 'Nathalie Perrin', tel: '06 77 88 99 00', email: 'n.perrin@free.fr', ville: 'Aix 13090', adresse: '5 avenue Malacrida', interventions: 3, ca: 1797, derniere: '10/03/2026', statut: 'actif', notes: '' },
  { id: 8, nom: 'Marc Lefebvre', tel: '06 33 22 11 00', email: 'marc.l@orange.fr', ville: 'Toulon 83000', adresse: '22 rue Picot', interventions: 2, ca: 4399, derniere: '05/04/2026', statut: 'vip', notes: 'Gros contrat rives + fa\u00EEtage sign\u00E9.' },
]

const STATUT_BADGE = {
  nouveau: { label: 'Nouveau', cls: 'badge-blue' },
  actif: { label: 'Actif', cls: 'badge-green' },
  vip: { label: 'VIP', cls: 'badge-orange' },
}

const MOCK_TIMELINE = [
  { date: '28/03/2026', type: 'intervention', titre: 'Nettoyage 16 panneaux', desc: 'Karim Z. &mdash; 199\u00A0\u20AC &mdash; Rapport envoy\u00E9' },
  { date: '15/03/2026', type: 'devis', titre: 'Devis couverture accept\u00E9', desc: 'Fa\u00EEtage closoir &mdash; 2\u00A0800\u00A0\u20AC' },
  { date: '10/03/2026', type: 'note', titre: 'Note interne', desc: '2 tuiles fissur\u00E9es rep\u00E9r\u00E9es pan Sud' },
  { date: '02/02/2026', type: 'intervention', titre: 'Nettoyage 16 panneaux', desc: 'Karim Z. &mdash; 199\u00A0\u20AC &mdash; Rapport envoy\u00E9' },
  { date: '14/10/2025', type: 'intervention', titre: 'Premi\u00E8re intervention', desc: 'Karim Z. &mdash; 199\u00A0\u20AC &mdash; Client acquis' },
]

function exportCSV(clients) {
  const header = ['Nom', 'T\u00E9l\u00E9phone', 'Email', 'Ville', 'Interventions', 'CA', 'Derni\u00E8re', 'Statut']
  const rows = clients.map(c => [c.nom, c.tel, c.email, c.ville, c.interventions, c.ca, c.derniere, c.statut])
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `clients-cph-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminClients() {
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('tous')
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('infos')

  const stats = useMemo(() => ({
    total: CLIENTS.length,
    recurrents: CLIENTS.filter(c => c.interventions > 1).length,
    ca: CLIENTS.reduce((s, c) => s + c.ca, 0),
  }), [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return CLIENTS.filter(c => {
      if (statut !== 'tous' && c.statut !== statut) return false
      if (!q) return true
      return c.nom.toLowerCase().includes(q) || c.ville.toLowerCase().includes(q) || c.tel.includes(q)
    })
  }, [search, statut])

  const openClient = (c) => { setSelected(c); setTab('infos') }

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Clients</h1>
            <p>Base client consolid&eacute;e avec historique d&apos;interventions.</p>
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
            <div className="stat-label">Clients r&eacute;currents</div>
            <Repeat size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{stats.recurrents}</div>
          <div className="stat-change">{Math.round(stats.recurrents/stats.total*100)}% de la base</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">CA cumul&eacute;</div>
            <TrendingUp size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{stats.ca.toLocaleString('fr-FR')}&nbsp;&euro;</div>
          <div className="stat-change">Depuis 2025</div>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-tabs">
          {[
            { k: 'tous', l: 'Tous', c: CLIENTS.length },
            { k: 'nouveau', l: 'Nouveaux', c: CLIENTS.filter(c => c.statut === 'nouveau').length },
            { k: 'actif', l: 'Actifs', c: CLIENTS.filter(c => c.statut === 'actif').length },
            { k: 'vip', l: 'VIP', c: CLIENTS.filter(c => c.statut === 'vip').length },
          ].map(t => (
            <button key={t.k} className={`admin-tab ${statut === t.k ? 'active' : ''}`} onClick={() => setStatut(t.k)}>
              <span>{t.l}</span><span className="admin-tab-count admin-tab-count-gray">{t.c}</span>
            </button>
          ))}
        </div>
        <div className="admin-search admin-search-inline">
          <Search size={15} />
          <input type="text" placeholder="Nom, ville, t&eacute;l&eacute;phone&hellip;" value={search} onChange={e => setSearch(e.target.value)} />
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
              <th>Derni&egrave;re</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => openClient(c)}>
                <td data-label="Client">
                  <div className="cell-client">
                    <span className="avatar-sm">{c.nom.split(' ').map(s => s[0]).slice(0,2).join('')}</span>
                    <strong>{c.nom}</strong>
                  </div>
                </td>
                <td data-label="Ville"><span className="cell-with-icon"><MapPin size={12} /> {c.ville}</span></td>
                <td data-label="Contact">
                  <div className="cell-contact">
                    <a href={`tel:${c.tel.replace(/\s/g, '')}`} onClick={e => e.stopPropagation()}><Phone size={12} /> {c.tel}</a>
                    <a href={`mailto:${c.email}`} className="muted" onClick={e => e.stopPropagation()}><Mail size={12} /> {c.email}</a>
                  </div>
                </td>
                <td data-label="Interventions" className="cell-num"><strong>{c.interventions}</strong></td>
                <td data-label="CA" className="cell-num"><strong>{c.ca.toLocaleString('fr-FR')}&nbsp;&euro;</strong></td>
                <td data-label="Derni&egrave;re">{c.derniere}</td>
                <td data-label="Statut"><span className={`badge ${STATUT_BADGE[c.statut].cls}`}>{STATUT_BADGE[c.statut].label}</span></td>
                <td data-label="" onClick={e => e.stopPropagation()}>
                  <ActionMenu items={[
                    { icon: <FileText size={13} />, label: 'Voir la fiche', onClick: () => openClient(c) },
                    { icon: <Edit3 size={13} />, label: 'Modifier' },
                    { icon: <Calendar size={13} />, label: 'Planifier une intervention' },
                    { icon: <FileText size={13} />, label: 'Cr\u00E9er un devis' },
                    { divider: true },
                    { icon: <Copy size={13} />, label: 'Copier l\'email', onClick: () => navigator.clipboard?.writeText(c.email) },
                    { divider: true },
                    { icon: <Trash2 size={13} />, label: 'Supprimer', danger: true },
                  ]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer fiche client */}
      {selected && (
        <>
          <div className="admin-drawer-backdrop" onClick={() => setSelected(null)} />
          <aside className="admin-detail-drawer admin-detail-drawer-wide">
            <div className="admin-detail-head">
              <div className="admin-detail-head-client">
                <span className="avatar-sm" style={{width:40, height:40, fontSize:14}}>
                  {selected.nom.split(' ').map(s => s[0]).slice(0,2).join('')}
                </span>
                <div>
                  <h2>{selected.nom}</h2>
                  <p>Client #{selected.id} &bull; <span className={`badge ${STATUT_BADGE[selected.statut].cls}`}>{STATUT_BADGE[selected.statut].label}</span></p>
                </div>
              </div>
              <button className="admin-drawer-close" onClick={() => setSelected(null)}>
                <XIcon size={20} />
              </button>
            </div>

            {/* Tabs */}
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
                    <div className="admin-detail-row"><span>T&eacute;l&eacute;phone</span><a href={`tel:${selected.tel.replace(/\s/g, '')}`}>{selected.tel}</a></div>
                    <div className="admin-detail-row"><span>Email</span><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
                    <div className="admin-detail-row"><span>Adresse</span><strong>{selected.adresse}</strong></div>
                    <div className="admin-detail-row"><span>Ville</span><strong>{selected.ville}</strong></div>
                  </section>
                  <section className="admin-detail-section">
                    <h4>Statistiques</h4>
                    <div className="mini-stats">
                      <div><span>{selected.interventions}</span><em>Interventions</em></div>
                      <div><span>{selected.ca.toLocaleString('fr-FR')}&nbsp;&euro;</span><em>CA total</em></div>
                      <div><span>{selected.derniere}</span><em>Derni&egrave;re</em></div>
                    </div>
                  </section>
                </>
              )}

              {tab === 'historique' && (
                <section className="admin-detail-section">
                  <h4>Historique d&apos;activit&eacute;</h4>
                  <ul className="detail-timeline">
                    {MOCK_TIMELINE.map((item, i) => (
                      <li key={i} className={`detail-timeline-item detail-timeline-${item.type}`}>
                        <span className="detail-timeline-dot">
                          {item.type === 'intervention' && <Sun size={11} />}
                          {item.type === 'devis' && <FileText size={11} />}
                          {item.type === 'note' && <MessageCircle size={11} />}
                        </span>
                        <div>
                          <div className="detail-timeline-head">
                            <strong>{item.titre}</strong>
                            <span>{item.date}</span>
                          </div>
                          <p dangerouslySetInnerHTML={{ __html: item.desc }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {tab === 'notes' && (
                <section className="admin-detail-section">
                  <h4>Notes internes</h4>
                  {selected.notes
                    ? <p className="admin-detail-note">{selected.notes}</p>
                    : <p className="muted" style={{fontSize:13}}>Aucune note pour ce client.</p>}
                  <textarea
                    className="notes-field"
                    placeholder="Ajouter une note&hellip;"
                    style={{marginTop:12}}
                  />
                </section>
              )}
            </div>

            <div className="admin-detail-foot">
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Fermer</button>
              <button className="btn btn-primary btn-sm"><Calendar size={14} /> Planifier</button>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
