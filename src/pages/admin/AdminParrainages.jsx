import { useState, useMemo, useEffect } from 'react'
import { Gift, Users, TrendingUp, Search, Copy, Download, Check, Trash2, Mail, Send } from 'lucide-react'
import ActionMenu from '../../components/ActionMenu'
import { getParrainages, subscribe as subscribeParrainages } from '../../lib/parrainagesStore'

function exportCSV(parrainages) {
  const header = ['Parrain', 'Filleul', 'Date envoi', 'Statut', 'Bonus']
  const rows = parrainages.map((p) => [p.parrainNom, p.inviteNom, p.dateEnvoi, p.statut, p.bonus])
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `parrainages-cph-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const STATUT_LABEL = {
  envoye: { label: 'Lien envoyé', cls: 'badge-gray' },
  inscrit: { label: 'Inscrit', cls: 'badge-blue' },
  valide: { label: 'Validé', cls: 'badge-green' },
  paye: { label: 'Payé', cls: 'badge-orange' },
}

export default function AdminParrainages() {
  const [parrainages, setParrainages] = useState(() => getParrainages())
  const [search, setSearch] = useState('')
  const [filtre, setFiltre] = useState('tous')

  useEffect(() => {
    const unsubscribe = subscribeParrainages(() => setParrainages(getParrainages()))
    return () => unsubscribe()
  }, [])

  const stats = useMemo(() => ({
    total: parrainages.length,
    convertis: parrainages.filter((p) => p.statut === 'valide' || p.statut === 'paye').length,
    gains: parrainages.filter((p) => p.statut === 'paye').reduce((s, p) => s + (Number(p.bonus) || 0), 0),
  }), [parrainages])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return parrainages.filter((p) => {
      if (filtre !== 'tous' && p.statut !== filtre) return false
      if (!q) return true
      return p.parrainNom.toLowerCase().includes(q) || p.inviteNom.toLowerCase().includes(q)
    })
  }, [parrainages, search, filtre])

  const topParrains = useMemo(() => {
    const map = new Map()
    parrainages.forEach((p) => {
      const key = p.parrainNom || '—'
      const current = map.get(key) || { nom: key, filleuls: 0, gains: 0 }
      const converti = p.statut === 'valide' || p.statut === 'paye'
      const gains = p.statut === 'paye' ? Number(p.bonus) || 0 : 0
      map.set(key, {
        nom: key,
        filleuls: current.filleuls + (converti ? 1 : 0),
        gains: current.gains + gains,
      })
    })

    return Array.from(map.values())
      .sort((a, b) => b.filleuls - a.filleuls || b.gains - a.gains || a.nom.localeCompare(b.nom))
      .slice(0, 4)
  }, [parrainages])

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Parrainages</h1>
            <p>30&nbsp;&euro; offerts au parrain pour chaque filleul converti.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
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
          <div className="stat-change">{stats.total ? Math.round((stats.convertis / stats.total) * 100) : 0}% de conversion</div>
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
        <div className="parrainage-main">
          <div className="admin-toolbar">
            <div className="admin-tabs">
              {[
                { k: 'tous', l: 'Tous', c: parrainages.length },
                { k: 'envoye', l: 'Envoyés', c: parrainages.filter((p) => p.statut === 'envoye').length },
                { k: 'inscrit', l: 'Inscrits', c: parrainages.filter((p) => p.statut === 'inscrit').length },
                { k: 'valide', l: 'Validés', c: parrainages.filter((p) => p.statut === 'valide').length },
                { k: 'paye', l: 'Payés', c: parrainages.filter((p) => p.statut === 'paye').length },
              ].map((t) => (
                <button key={t.k} className={`admin-tab ${filtre === t.k ? 'active' : ''}`} onClick={() => setFiltre(t.k)}>
                  <span>{t.l}</span><span className="admin-tab-count admin-tab-count-gray">{t.c}</span>
                </button>
              ))}
            </div>
            <div className="admin-search admin-search-inline">
              <Search size={15} />
              <input type="text" placeholder="Parrain ou filleul&hellip;" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <th className="cell-num">Bonus</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td data-label="Parrain"><strong>{p.parrainNom}</strong></td>
                    <td data-label="Filleul">{p.inviteNom}</td>
                    <td data-label="Ville">{p.inviteVille || '—'}</td>
                    <td data-label="Date">{p.dateEnvoi}</td>
                    <td data-label="Statut"><span className={`badge ${STATUT_LABEL[p.statut]?.cls || 'badge-gray'}`}>{STATUT_LABEL[p.statut]?.label || p.statut}</span></td>
                    <td data-label="Bonus" className="cell-num">
                      <strong style={{ color: 'var(--green)' }}>-{Number(p.bonus) || 0}&nbsp;&euro;</strong>
                    </td>
                    <td data-label="">
                      <ActionMenu items={[
                        { icon: <Send size={13} />, label: 'Renvoyer le lien' },
                        { icon: <Check size={13} />, label: 'Marquer validé' },
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

        <aside className="parrainage-aside">
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gift size={16} style={{ color: 'var(--accent)' }} /> Top parrains
            </h3>
            <ul className="top-list">
              {topParrains.map((p, i) => (
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
