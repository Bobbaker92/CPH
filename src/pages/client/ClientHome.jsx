import { Calendar, MapPin, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ClientHome() {
  return (
    <>
      <div className="page-header">
        <h1>Bonjour, Jean-Pierre</h1>
        <p>Voici le suivi de votre intervention.</p>
      </div>

      {/* Prochaine intervention */}
      <div className="card" style={{marginBottom:24, borderLeft:'4px solid var(--primary)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
          <div>
            <h3 style={{fontSize:16, fontWeight:700, marginBottom:8}}>Prochaine intervention</h3>
            <div style={{display:'flex', gap:24, fontSize:14, color:'var(--gray-600)'}}>
              <span style={{display:'flex', alignItems:'center', gap:6}}><Calendar size={15} /> 4 mai 2026</span>
              <span style={{display:'flex', alignItems:'center', gap:6}}><Clock size={15} /> 10h - 12h</span>
              <span style={{display:'flex', alignItems:'center', gap:6}}><MapPin size={15} /> Marseille 13008</span>
            </div>
          </div>
          <span className="badge badge-blue">{"Planifi\u00E9"}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{marginBottom:24}}>
        <h3 style={{fontSize:16, fontWeight:700, marginBottom:20}}>Suivi</h3>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-dot active"></div>
            <div className="timeline-content">
              <h4>{"R\u00E9servation confirm\u00E9e"}</h4>
              <p>{"14 avril 2026 - Intervention r\u00E9serv\u00E9e pour le 4 mai"}</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot current"></div>
            <div className="timeline-content">
              <h4>En attente d'intervention</h4>
              <p>Notre couvreur interviendra le 4 mai entre 10h et 12h</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>{"Intervention r\u00E9alis\u00E9e"}</h4>
              <p>{"Photos avant/apr\u00E8s disponibles dans votre espace"}</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>{"Rapport envoy\u00E9"}</h4>
              <p>{"Rapport d'\u00E9tat de votre toiture sous 48h"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <Link to="/client/photos" className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}}>
          <div>
            <h3 style={{fontSize:15, fontWeight:700}}>{"Photos avant / apr\u00E8s"}</h3>
            <p style={{fontSize:13, color:'var(--gray-500)'}}>{"Disponibles apr\u00E8s intervention"}</p>
          </div>
          <ChevronRight size={18} color="var(--gray-400)" />
        </Link>
        <Link to="/client/rapport" className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}}>
          <div>
            <h3 style={{fontSize:15, fontWeight:700}}>Rapport toiture</h3>
            <p style={{fontSize:13, color:'var(--gray-500)'}}>{"Envoy\u00E9 sous 48h apr\u00E8s intervention"}</p>
          </div>
          <ChevronRight size={18} color="var(--gray-400)" />
        </Link>
      </div>
    </>
  )
}
