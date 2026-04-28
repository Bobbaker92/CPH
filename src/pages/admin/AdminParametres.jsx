import { useState, useRef } from 'react'
import { Settings, RotateCcw, Download, Upload, AlertTriangle, Check, FileJson, Sparkles } from 'lucide-react'
import { applyDemoSeed } from '../../lib/demoSeed'

const STORE_KEYS = [
  { key: 'cph_demandes_v1',           label: 'Demandes' },
  { key: 'cph_demandes_overrides_v1', label: 'Overrides demandes' },
  { key: 'cph_interventions_v1',      label: 'Interventions' },
  { key: 'cph_interventions_overrides_v1', label: 'Overrides interventions' },
  { key: 'cph_clients_v1',            label: 'Clients' },
  { key: 'cph_clients_overrides_v1',  label: 'Overrides clients' },
  { key: 'cph_parrainages_v1',        label: 'Parrainages' },
  { key: 'cph_parrainages_overrides_v1', label: 'Overrides parrainages' },
]

function readAllStores() {
  const dump = { exportedAt: new Date().toISOString(), version: 1, data: {} }
  for (const { key } of STORE_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      dump.data[key] = raw ? JSON.parse(raw) : null
    } catch {
      dump.data[key] = null
    }
  }
  return dump
}

function writeAllStores(dump) {
  if (!dump?.data) throw new Error('Format invalide : champ "data" manquant')
  for (const { key } of STORE_KEYS) {
    if (dump.data[key] === undefined) continue
    if (dump.data[key] === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(dump.data[key]))
    }
  }
}

function clearAllStores() {
  for (const { key } of STORE_KEYS) {
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  }
}

export default function AdminParametres() {
  const [feedback, setFeedback] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileInputRef = useRef(null)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleExport = () => {
    const dump = readAllStores()
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cph-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showFeedback('success', `Export téléchargé (${Object.keys(dump.data).filter((k) => dump.data[k]).length} clés non vides)`)
  }

  const handleImport = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const dump = JSON.parse(e.target.result)
        writeAllStores(dump)
        showFeedback('success', 'Import réussi. Rechargez la page pour voir les changements.')
      } catch (err) {
        showFeedback('error', `Import échoué : ${err.message}`)
      }
    }
    reader.readAsText(file)
    // Reset input pour permettre de reimporter le même fichier
    event.target.value = ''
  }

  const handleDemoSeed = () => {
    const stats = applyDemoSeed()
    showFeedback(
      'success',
      `Données démo injectées : ${stats.demandes} demandes, ${stats.interventions} interventions, ${stats.clients} clients, ${stats.parrainages} parrainages. Rechargez la page pour les voir.`
    )
  }

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 5000)
      return
    }
    clearAllStores()
    setConfirmReset(false)
    showFeedback('success', 'Tous les stores ont été vidés. Rechargez la page pour réinjecter les mocks par défaut.')
  }

  const stats = STORE_KEYS.map((s) => {
    let count = 0
    let size = 0
    try {
      const raw = localStorage.getItem(s.key)
      if (raw) {
        size = raw.length
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) count = parsed.length
        else if (parsed && typeof parsed === 'object') count = Object.keys(parsed.modifs || {}).length + (parsed.supprimes?.length || 0)
      }
    } catch {
      // ignore
    }
    return { ...s, count, size }
  })

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1><Settings size={20} style={{verticalAlign:'middle', marginRight:8}} /> Param&egrave;tres</h1>
            <p>Gestion des donn&eacute;es locales (demandes, interventions, clients, parrainages).</p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`admin-flash admin-flash-${feedback.type}`} role="alert" aria-live="polite">
          {feedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Stats */}
      <section className="admin-card">
        <h3>&Eacute;tat actuel des stores</h3>
        <div className="admin-stores-grid">
          {stats.map((s) => (
            <div key={s.key} className="admin-store-stat">
              <span className="admin-store-stat-label">{s.label}</span>
              <strong className="admin-store-stat-value">{s.count}</strong>
              <span className="admin-store-stat-sub">
                {s.size > 0 ? `${(s.size / 1024).toFixed(1)} ko` : 'vide'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Export */}
      <section className="admin-card">
        <div className="admin-card-row">
          <div>
            <h3><Download size={16} style={{verticalAlign:'middle', marginRight:6}} /> Exporter les donn&eacute;es</h3>
            <p>T&eacute;l&eacute;charge un fichier JSON contenant l&rsquo;int&eacute;gralit&eacute; des stores (sauvegarde, debug, transfert vers une autre machine).</p>
          </div>
          <button className="btn btn-primary" onClick={handleExport}>
            <FileJson size={14} /> T&eacute;l&eacute;charger le JSON
          </button>
        </div>
      </section>

      {/* Import */}
      <section className="admin-card">
        <div className="admin-card-row">
          <div>
            <h3><Upload size={16} style={{verticalAlign:'middle', marginRight:6}} /> Importer un export</h3>
            <p>Restaure un &eacute;tat pr&eacute;c&eacute;dent (export JSON g&eacute;n&eacute;r&eacute; ci-dessus). &Eacute;crase les donn&eacute;es actuelles.</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            style={{display:'none'}}
            aria-label="Choisir un fichier d'export JSON"
          />
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} /> Choisir un fichier&hellip;
          </button>
        </div>
      </section>

      {/* Demo seed — pour les démos prospects */}
      <section className="admin-card" style={{borderColor:'#c4b5fd', background:'#faf5ff'}}>
        <div className="admin-card-row">
          <div>
            <h3>
              <Sparkles size={16} style={{verticalAlign:'middle', marginRight:6, color:'#7c3aed'}} />
              Charger un set de démo
            </h3>
            <p>Injecte 10 demandes variées (statuts/sources mélangés), 5 interventions (futures + passées), 3 clients et 2 parrainages. Pratique pour montrer le site à un prospect avec des données réalistes.</p>
          </div>
          <button
            className="btn btn-outline"
            style={{borderColor:'#7c3aed', color:'#7c3aed'}}
            onClick={handleDemoSeed}
          >
            <Sparkles size={14} /> Charger la démo
          </button>
        </div>
      </section>

      {/* Reset */}
      <section className="admin-card admin-card-danger">
        <div className="admin-card-row">
          <div>
            <h3><AlertTriangle size={16} style={{verticalAlign:'middle', marginRight:6, color:'#dc2626'}} /> R&eacute;initialiser les donn&eacute;es</h3>
            <p>Vide tous les stores localStorage. Au prochain rechargement, les mocks par d&eacute;faut sont r&eacute;injectés. Action irr&eacute;versible.</p>
          </div>
          <button
            className={confirmReset ? 'btn btn-danger' : 'btn btn-outline'}
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            {confirmReset ? 'Cliquer à nouveau pour confirmer' : 'Réinitialiser'}
          </button>
        </div>
      </section>
    </>
  )
}
