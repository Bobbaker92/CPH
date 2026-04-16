import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, ChevronRight, Camera, Navigation, Phone, CheckCircle, Upload, MessageSquare, AlertTriangle } from 'lucide-react'

const INTERVENTIONS_JOUR = [
  { id: 1, heure: '8h-10h', client: 'Robert Vidal', adresse: '15 bd Baille, 13005 Marseille', tel: '06 12 34 56 78', panneaux: 12, statut: 'termine' },
  { id: 2, heure: '10h-12h', client: 'Jean-Pierre Martin', adresse: '24 rue des Oliviers, 13008 Marseille', tel: '06 98 76 54 32', panneaux: 16, statut: 'en_cours' },
  { id: 3, heure: '14h-16h', client: 'Marie Duval', adresse: '8 av du Prado, 13012 Marseille', tel: '06 11 22 33 44', panneaux: 8, statut: 'a_faire' },
]

export default function CouvreurApp() {
  const [view, setView] = useState('liste') // liste | detail | photos
  const [selected, setSelected] = useState(null)
  const [photos, setPhotos] = useState({ avant: false, apres: false, toiture: [] })
  const [notes, setNotes] = useState('')
  const navigate = useNavigate()

  if (view === 'liste') {
    return (
      <div style={{minHeight:'100vh', background:'var(--bg)'}}>
        <div className="mobile-header">
          <h2>Mes interventions</h2>
          <span style={{fontSize:13, opacity:0.7}}>Lundi 4 mai 2026</span>
        </div>

        {/* Recap journ\u00E9e */}
        <div style={{padding:'16px', background:'white', borderBottom:'1px solid var(--gray-100)'}}>
          <div style={{display:'flex', justifyContent:'space-around', textAlign:'center'}}>
            <div>
              <p style={{fontSize:20, fontWeight:800}}>3</p>
              <p style={{fontSize:11, color:'var(--gray-500)'}}>Interventions</p>
            </div>
            <div>
              <p style={{fontSize:20, fontWeight:800, color:'var(--green)'}}>1</p>
              <p style={{fontSize:11, color:'var(--gray-500)'}}>{"Termin\u00E9"}</p>
            </div>
            <div>
              <p style={{fontSize:20, fontWeight:800, color:'var(--blue)'}}>1</p>
              <p style={{fontSize:11, color:'var(--gray-500)'}}>En cours</p>
            </div>
            <div>
              <p style={{fontSize:20, fontWeight:800, color:'var(--gray-400)'}}>1</p>
              <p style={{fontSize:11, color:'var(--gray-500)'}}>{"\u00C0 faire"}</p>
            </div>
          </div>
        </div>

        {INTERVENTIONS_JOUR.map(inter => (
          <div key={inter.id} className="intervention-card">
            <div className="card-top">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:8}}>
                <div>
                  <h3>{inter.client}</h3>
                  <p className="address"><MapPin size={13} style={{verticalAlign:'middle'}} /> {inter.adresse}</p>
                </div>
                <span className={`badge ${inter.statut === 'termine' ? 'badge-green' : inter.statut === 'en_cours' ? 'badge-blue' : 'badge-orange'}`}>
                  {inter.statut === 'termine' ? 'Termin\u00E9' : inter.statut === 'en_cours' ? 'En cours' : '\u00C0 faire'}
                </span>
              </div>
              <div className="infos">
                <span className="info-item"><Clock size={13} /> {inter.heure}</span>
                <span className="info-item">{inter.panneaux} panneaux</span>
              </div>
            </div>
            <div className="card-actions">
              <button onClick={() => window.open(`tel:${inter.tel.replace(/\s/g, '')}`)}>
                <Phone size={14} style={{marginRight:4}} /> Appeler
              </button>
              <button onClick={() => { setSelected(inter); setView('detail') }}>
                {"D\u00E9tails"} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Nav bottom */}
        <div style={{position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid var(--gray-200)', display:'flex', justifyContent:'center', padding:12, gap:8}}>
          <button className="btn btn-sm btn-outline" onClick={() => navigate('/')}>Retour accueil</button>
        </div>
      </div>
    )
  }

  if (view === 'detail' && selected) {
    return (
      <div style={{minHeight:'100vh', background:'var(--bg)'}}>
        <div className="mobile-header">
          <button onClick={() => setView('liste')} style={{background:'none', border:'none', color:'white', fontSize:14, display:'flex', alignItems:'center', gap:4}}>
            &larr; Retour
          </button>
          <span style={{fontSize:13, opacity:0.7}}>{selected.heure}</span>
        </div>

        {/* Info client */}
        <div style={{padding:16}}>
          <div className="card" style={{marginBottom:16}}>
            <h3 style={{fontSize:18, fontWeight:700, marginBottom:4}}>{selected.client}</h3>
            <p style={{fontSize:14, color:'var(--gray-500)', marginBottom:12}}><MapPin size={13} style={{verticalAlign:'middle'}} /> {selected.adresse}</p>
            <div style={{display:'flex', gap:12}}>
              <a href={`tel:${selected.tel.replace(/\s/g, '')}`} className="btn btn-sm btn-dark" style={{flex:1, justifyContent:'center'}}>
                <Phone size={14} /> Appeler
              </a>
              <button className="btn btn-sm btn-outline" style={{flex:1, justifyContent:'center'}} onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selected.adresse)}`, '_blank')}>
                <Navigation size={14} /> {"Itin\u00E9raire"}
              </button>
            </div>
          </div>

          {/* Photos avant / après (compact) */}
          <div className="upload-section card" style={{marginBottom:16, padding:16}}>
            <h4 style={{marginBottom:10}}>Photos avant / apr&egrave;s</h4>
            <div className="upload-row">
              <div
                className={`upload-slim ${photos.avant ? 'filled' : ''}`}
                onClick={() => setPhotos({...photos, avant: !photos.avant})}
              >
                {photos.avant ? <CheckCircle size={18} /> : <Camera size={18} />}
                <span>Avant</span>
              </div>
              <div
                className={`upload-slim ${photos.apres ? 'filled' : ''}`}
                onClick={() => setPhotos({...photos, apres: !photos.apres})}
              >
                {photos.apres ? <CheckCircle size={18} /> : <Camera size={18} />}
                <span>Apr&egrave;s</span>
              </div>
            </div>
          </div>

          {/* Observations toiture (optionnel, à la demande) */}
          <div className="upload-section card" style={{marginBottom:16, padding:16}}>
            <h4 style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
              <AlertTriangle size={16} color="var(--orange)" /> Observations toiture
              <span style={{fontSize:11, fontWeight:400, color:'var(--gray-500)', marginLeft:'auto'}}>Optionnel</span>
            </h4>
            {photos.toiture.length > 0 && (
              <div className="upload-row" style={{flexWrap:'wrap', marginBottom:10}}>
                {photos.toiture.map((label, i) => (
                  <div key={i} className="upload-slim filled" style={{flex:'0 1 auto'}}>
                    <CheckCircle size={16} />
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() => setPhotos({...photos, toiture: photos.toiture.filter((_, j) => j !== i)})}
                      style={{marginLeft:6, background:'none', border:'none', color:'var(--gray-500)', padding:0, cursor:'pointer'}}
                      aria-label="Retirer"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              className="upload-add-btn"
              onClick={() => {
                const label = prompt('Que photographiez-vous\u00A0? (ex\u00A0: fa\u00EEtage, tuile fissur\u00E9e\u2026)')
                if (label) setPhotos({...photos, toiture: [...photos.toiture, label]})
              }}
            >
              <Camera size={14} /> Ajouter une observation
            </button>
          </div>

          {/* Notes */}
          <div className="card" style={{marginBottom:16, padding:20}}>
            <h4 style={{fontSize:14, fontWeight:700, marginBottom:12, display:'flex', alignItems:'center', gap:8}}>
              <MessageSquare size={16} /> Notes terrain
            </h4>
            <textarea
              className="notes-field"
              placeholder="Ex: Closoir absent c\u00F4t\u00E9 sud sur 3m. Rives fissur\u00E9es c\u00F4t\u00E9 ouest. Recommander remplacement fa\u00EEtage + reprise rives."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <button
            className="btn btn-green"
            style={{width:'100%', justifyContent:'center', padding:16, fontSize:16}}
            onClick={() => { setView('liste'); setSelected(null) }}
          >
            <CheckCircle size={18} /> Valider l'intervention
          </button>
        </div>
      </div>
    )
  }

  return null
}
