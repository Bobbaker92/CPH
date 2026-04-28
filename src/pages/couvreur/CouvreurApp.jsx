import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, ChevronRight, Camera, Navigation, Phone, CheckCircle, MessageSquare, AlertTriangle, LogOut, PenSquare } from 'lucide-react'
import { getInterventions, subscribe, updateIntervention } from '../../lib/interventionsStore'

function normaliserEmail(email = '') {
  return String(email).trim().toLowerCase()
}

function formatDateIntervention(dateStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function toInterventionStatus(statut = '') {
  if (statut === 'terminee' || statut === 'termine') return 'terminee'
  if (statut === 'en-cours' || statut === 'en_cours') return 'en-cours'
  return 'a-faire'
}

function statusLabel(statut = '') {
  if (statut === 'terminee') return 'Terminée'
  if (statut === 'en-cours') return 'En cours'
  return 'À faire'
}

function statusBadge(statut = '') {
  if (statut === 'terminee') return 'badge-green'
  if (statut === 'en-cours') return 'badge-blue'
  return 'badge-orange'
}

export default function CouvreurApp() {
  const navigate = useNavigate()
  const sessionCourante = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return {
      role: user?.role || '',
      email: normaliserEmail(user?.email || ''),
    }
  }, [])

  const [view, setView] = useState('liste')
  const [selectedId, setSelectedId] = useState(null)
  const [notes, setNotes] = useState('')
  const [interventions, setInterventions] = useState(() => getInterventions())

  useEffect(() => {
    if (sessionCourante.role !== 'couvreur' || !sessionCourante.email) {
      navigate('/connexion', { replace: true })
    }
  }, [navigate, sessionCourante.email, sessionCourante.role])

  useEffect(() => {
    return subscribe(() => setInterventions(getInterventions()))
  }, [])

  const mesInterventions = useMemo(() => {
    const email = sessionCourante.email
    if (!email) return []

    return interventions
      .filter((i) => normaliserEmail(i.couvreurEmail) === email)
      .slice()
      .sort((a, b) => {
        if (a.date !== b.date) return String(a.date || '').localeCompare(String(b.date || ''))
        return String(a.heureSort || '').localeCompare(String(b.heureSort || ''))
      })
      .map((i) => ({
        ...i,
        statutTerrain: toInterventionStatus(i.statut),
      }))
  }, [interventions, sessionCourante.email])

  const selected = useMemo(
    () => mesInterventions.find((i) => String(i.id) === String(selectedId)) || null,
    [mesInterventions, selectedId]
  )

  const stats = useMemo(() => {
    const total = mesInterventions.length
    const terminees = mesInterventions.filter((i) => i.statutTerrain === 'terminee').length
    const enCours = mesInterventions.filter((i) => i.statutTerrain === 'en-cours').length
    return { total, terminees, enCours, aFaire: total - terminees - enCours }
  }, [mesInterventions])

  const enregistrerPatch = (id, patch) => {
    updateIntervention(id, patch)
  }

  const marquerArrive = (intervention) => {
    enregistrerPatch(intervention.id, {
      statut: intervention.statutTerrain === 'terminee' ? 'terminee' : 'en-cours',
      arrivee: true,
      heureArrivee: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    })
  }

  const demarrerIntervention = (intervention) => {
    enregistrerPatch(intervention.id, {
      statut: 'en-cours',
      demarree: true,
      heureDemarrage: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    })
  }

  const terminerIntervention = (intervention) => {
    enregistrerPatch(intervention.id, {
      statut: 'terminee',
      termineeAt: new Date().toISOString(),
      notesTerrain: notes,
    })
    setView('liste')
    setSelectedId(null)
  }

  const incrementerPhoto = (intervention, champ) => {
    const actuel = Number(intervention[champ]) || 0
    enregistrerPatch(intervention.id, { [champ]: actuel + 1 })
  }

  const ajouterObservation = (intervention) => {
    const label = prompt('Observation toiture (optionnel)')
    if (!label) return
    const actuel = Number(intervention.photosToitureCount) || 0
    enregistrerPatch(intervention.id, {
      photosToitureCount: actuel + 1,
      derniereObservationToiture: label,
    })
  }

  const signerIntervention = (intervention) => {
    enregistrerPatch(intervention.id, {
      signe: true,
      signatureAt: new Date().toISOString(),
    })
  }

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/connexion', { replace: true })
  }

  if (!sessionCourante.email) return null

  if (view === 'liste') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="mobile-header">
          <h2>Mes interventions</h2>
          <span style={{ fontSize: 13, opacity: 0.7 }}>{sessionCourante.email}</span>
        </div>

        <div style={{ padding: '16px', background: 'white', borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800 }}>{stats.total}</p>
              <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>Interventions</p>
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>{stats.terminees}</p>
              <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>Terminées</p>
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue)' }}>{stats.enCours}</p>
              <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>En cours</p>
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-400)' }}>{stats.aFaire}</p>
              <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>À faire</p>
            </div>
          </div>
        </div>

        {mesInterventions.length === 0 && (
          <div className="card" style={{ margin: 16, textAlign: 'center' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Aucune intervention assignée.</p>
          </div>
        )}

        {mesInterventions.map((inter) => (
          <div key={inter.id} className="intervention-card">
            <div className="card-top">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div>
                  <h3>{inter.client}</h3>
                  <p className="address"><MapPin size={13} style={{ verticalAlign: 'middle' }} /> {inter.adresse || inter.ville || '—'}</p>
                </div>
                <span className={`badge ${statusBadge(inter.statutTerrain)}`}>{statusLabel(inter.statutTerrain)}</span>
              </div>
              <div className="infos" style={{ flexWrap: 'wrap' }}>
                <span className="info-item"><Clock size={13} /> {formatDateIntervention(inter.date)} • {inter.heure}</span>
                <span className="info-item">{inter.panneaux} panneaux</span>
              </div>
            </div>
            <div className="card-actions">
              <button onClick={() => window.open(`tel:${String(inter.tel || '').replace(/\s/g, '')}`)}>
                <Phone size={14} style={{ marginRight: 4 }} /> Appeler
              </button>
              <button onClick={() => { setSelectedId(inter.id); setNotes(inter.notesTerrain || ''); setView('detail') }}>
                Détails <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'center', padding: 12, gap: 8 }}>
          <button className="btn btn-sm btn-outline" onClick={logout}><LogOut size={14} /> Déconnexion</button>
        </div>
      </div>
    )
  }

  if (view === 'detail' && selected) {
    const avantCount = Number(selected.photosAvantCount) || 0
    const apresCount = Number(selected.photosApresCount) || 0
    const toitureCount = Number(selected.photosToitureCount) || 0

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="mobile-header">
          <button onClick={() => setView('liste')} style={{ background: 'none', border: 'none', color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
            &larr; Retour
          </button>
          <span style={{ fontSize: 13, opacity: 0.7 }}>{selected.heure}</span>
        </div>

        <div style={{ padding: 16 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{selected.client}</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 12 }}><MapPin size={13} style={{ verticalAlign: 'middle' }} /> {selected.adresse || selected.ville || '—'}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href={`tel:${String(selected.tel || '').replace(/\s/g, '')}`} className="btn btn-sm btn-dark" style={{ flex: 1, justifyContent: 'center' }}>
                <Phone size={14} /> Appeler
              </a>
              <button className="btn btn-sm btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selected.adresse || selected.ville || '')}`, '_blank')}>
                <Navigation size={14} /> Itinéraire
              </button>
            </div>
          </div>

          <div className="upload-section card" style={{ marginBottom: 16, padding: 16 }}>
            <h4 style={{ marginBottom: 10 }}>Photos avant / après</h4>
            <div className="upload-row">
              <div className={`upload-slim ${avantCount > 0 ? 'filled' : ''}`} onClick={() => incrementerPhoto(selected, 'photosAvantCount')}>
                <Camera size={18} />
                <span>Avant ({avantCount})</span>
              </div>
              <div className={`upload-slim ${apresCount > 0 ? 'filled' : ''}`} onClick={() => incrementerPhoto(selected, 'photosApresCount')}>
                <Camera size={18} />
                <span>Après ({apresCount})</span>
              </div>
            </div>
          </div>

          <div className="upload-section card" style={{ marginBottom: 16, padding: 16 }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <AlertTriangle size={16} color="var(--orange)" /> Observations toiture
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--gray-500)', marginLeft: 'auto' }}>Optionnel</span>
            </h4>
            <p style={{ marginTop: 0, color: 'var(--gray-500)', fontSize: 13 }}>Photos d'observation : {toitureCount}</p>
            {selected.derniereObservationToiture && (
              <p style={{ marginTop: 0, color: 'var(--gray-700)', fontSize: 13 }}>
                Dernière note : {selected.derniereObservationToiture}
              </p>
            )}
            <button type="button" className="upload-add-btn" onClick={() => ajouterObservation(selected)}>
              <Camera size={14} /> Ajouter une observation
            </button>
          </div>

          <div className="card" style={{ marginBottom: 16, padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={16} /> Notes terrain
            </h4>
            <textarea
              className="notes-field"
              placeholder="Notes de l'intervention"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: 14 }} onClick={() => marquerArrive(selected)}>
              Marquer comme arrivé
            </button>
            <button className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', padding: 14 }} onClick={() => demarrerIntervention(selected)}>
              Démarrer intervention
            </button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: 14 }} onClick={() => signerIntervention(selected)}>
              <PenSquare size={16} /> {selected.signe ? 'Signature enregistrée' : 'Signature client (placeholder)'}
            </button>
            <button className="btn btn-green" style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 16 }} onClick={() => terminerIntervention(selected)}>
              <CheckCircle size={18} /> Terminer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
