import { useState, useMemo } from 'react'
import { Gift, Users, TrendingUp, Search, Copy, Download, Check, Trash2, Mail, Send } from 'lucide-react'
import ActionMenu from '../../components/ActionMenu'

function exportCSV(parrainages) {
  const header = ['Parrain', 'Filleul', 'Ville', 'Date envoi', 'Statut', 'R\u00E9compense']
  const rows = parrainages.map(p => [p.parrain, p.filleul, p.ville, p.dateEnvoi, p.statut, p.recompense])
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `parrainages-cph-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const PARRAINAGES = [
  { id: 1, parrain: 'Jean-Pierre Martin', filleul: 'Pierre Vidal', ville: 'Marseille 13008', dateEnvoi: '10/04/2026', statut: 'inscrit', recompense: 30 },
  { id: 2, parrain: 'Robert Vidal', filleul: 'Sophie Lambert', ville: 'Aix-en-Provence', dateEnvoi: '08/04/2026', statut: 'convertie', recompense: 30 },
  { id: 3, parrain: 'Marie Duval', filleul: 'Clara Meunier', ville: 'Marseille 13012', dateEnvoi: '05/04/2026', statut: 'envoye', recompense: 0 },
  { id: 4, parrain: 'Marc Lefebvre', filleul: 'Julien Roussel', ville: 'Toulon 83000', dateEnvoi: '02/04/2026', statut: 'convertie', recompense: 30 },
  { id: 5, parrain: 'Nathalie Perrin', filleul: 'Ahmed Mansour', ville: 'Aix 13100', dateEnvoi: '28/03/2026', statut: 'convertie', recompense: 30 },
  { id: 6, parrain: 'Paul Roche', filleul: '(en attente)', ville: '-', dateEnvoi: '20/03/2026', statut: 'envoye', recompense: 0 },
]

const STATUT_LABEL = {
  envoye: { label: 'Lien envoy\u00E9', cls: 'badge-gray' },
  inscrit: { label: 'Inscrit', cls: 'badge-blue' },
  convertie: { label: 'Converti', cls: 'badge-green' },
}

const TOP_PARRAINS = [
  { nom: 'Robert Vidal', filleuls: 4, gains: 120 },
  { nom: 'Jean-Pierre Martin', filleuls: 2, gains: 60 },
  { nom: 'Marc Lefebvre', filleuls: 2, gains: 60 },
  { nom: 'Nathalie Perrin', filleuls: 1, gains: 30 },
]

export default function AdminParrainages() {
  const [search, setSearch] = useState('')
  const [filtre, setFiltre] = useState('tous')

  const stats = useMemo(() => ({
    total: PARRAINAGES.length,
    convertis: PARRAINAGES.filter(p => p.statut === 'convertie').length,
    gains: PARRAINAGES.reduce((s, p) => s + p.recompense, 0),
  }), [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return PARRAINAGES.filter(p => {
      if (filtre !== 'tous' && p.statut !== filtre) return false
      if (!q) return true
      return p.parrain.toLowerCase().includes(q) || p.filleul.toLowerCase().includes(q)
    })
  }, [search, filtre])

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Parrainages</h1>
            <p>30&nbsp;&euro; offerts au parrain pour chaque filleul converti.</p>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-sm btn-outline" onClick={() => exportCSV(filtered)}><Download size={14} /> Exporter</button>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => navigator.clipboard?.writeText('https://cphpaca.fr/?parrain=XXX')}
            >
              <Copy size={14} /> Lien g&eacute;n&eacute;rique
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">Parrainages envoy&eacute;s</div>
            <Users size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-change">Sur 30 jours</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">Convertis</div>
            <Gift size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{stats.convertis}</div>
          <div className="stat-change">{Math.round(stats.convertis/stats.total*100)}% de conversion</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">R&eacute;compenses vers&eacute;es</div>
            <TrendingUp size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{stats.gains}&nbsp;&euro;</div>
          <div className="stat-change">En r&eacute;duction sur prochaine intervention</div>
        </div>
      </div>

      <div className="parrainage-layout">
        {/* Liste */}
        <div className="parrainage-main">
          <div className="admin-toolbar">
            <div className="admin-tabs">
              {[
                { k: 'tous', l: 'Tous', c: PARRAINAGES.length },
                { k: 'envoye', l: 'Envoy\u00E9s', c: PARRAINAGES.filter(p => p.statut === 'envoye').length },
                { k: 'inscrit', l: 'Inscrits', c: PARRAINAGES.filter(p => p.statut === 'inscrit').length },
                { k: 'convertie', l: 'Convertis', c: PARRAINAGES.filter(p => p.statut === 'convertie').length },
              ].map(t => (
                <button key={t.k} className={`admin-tab ${filtre === t.k ? 'active' : ''}`} onClick={() => setFiltre(t.k)}>
                  <span>{t.l}</span><span className="admin-tab-count admin-tab-count-gray">{t.c}</span>
                </button>
              ))}
            </div>
            <div className="admin-search admin-search-inline">
              <Search size={15} />
              <input type="text" placeholder="Parrain ou filleul&hellip;" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="table-card admin-list-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Parrain</th>
                  <th>Filleul</th>
                  <th>Ville</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th className="cell-num">R&eacute;compense</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td data-label="Parrain"><strong>{p.parrain}</strong></td>
                    <td data-label="Filleul">{p.filleul}</td>
                    <td data-label="Ville">{p.ville}</td>
                    <td data-label="Date">{p.dateEnvoi}</td>
                    <td data-label="Statut"><span className={`badge ${STATUT_LABEL[p.statut].cls}`}>{STATUT_LABEL[p.statut].label}</span></td>
                    <td data-label="R&eacute;compense" className="cell-num">
                      {p.recompense > 0 ? <strong style={{color:'var(--green)'}}>-{p.recompense}&nbsp;&euro;</strong> : <span className="muted">&mdash;</span>}
                    </td>
                    <td data-label="">
                      <ActionMenu items={[
                        { icon: <Send size={13} />, label: 'Renvoyer le lien' },
                        { icon: <Check size={13} />, label: 'Marquer converti' },
                        { icon: <Mail size={13} />, label: 'Contacter parrain' },
                        { divider: true },
                        { icon: <Trash2 size={13} />, label: 'Supprimer', danger: true },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top parrains */}
        <aside className="parrainage-aside">
          <div className="card" style={{padding:20}}>
            <h3 style={{fontSize:14, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
              <Gift size={16} style={{color:'var(--accent)'}} /> Top parrains
            </h3>
            <ul className="top-list">
              {TOP_PARRAINS.map((p, i) => (
                <li key={p.nom}>
                  <span className="top-rank">#{i + 1}</span>
                  <div className="top-info">
                    <strong>{p.nom}</strong>
                    <span>{p.filleuls} filleul{p.filleuls > 1 ? 's' : ''}</span>
                  </div>
                  <span className="top-gain">{p.gains}&nbsp;&euro;</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  )
}
