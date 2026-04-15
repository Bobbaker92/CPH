import { Calendar, MapPin, Clock, User, Phone } from 'lucide-react'

export default function ClientIntervention() {
  return (
    <>
      <div className="page-header">
        <h1>Mon intervention</h1>
        <p>{"D\u00E9tails et suivi de votre intervention planifi\u00E9e."}</p>
      </div>

      <div className="intervention-detail-grid">
        {/* Details */}
        <div className="card">
          <h3 style={{fontSize:16, fontWeight:700, marginBottom:20}}>{"D\u00E9tails"}</h3>
          <div style={{display:'flex', flexDirection:'column', gap:16}}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <Calendar size={18} color="var(--gray-400)" />
              <div>
                <p style={{fontSize:13, color:'var(--gray-500)'}}>Date</p>
                <p style={{fontSize:15, fontWeight:600}}>Lundi 4 mai 2026</p>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <Clock size={18} color="var(--gray-400)" />
              <div>
                <p style={{fontSize:13, color:'var(--gray-500)'}}>{"Cr\u00E9neau"}</p>
                <p style={{fontSize:15, fontWeight:600}}>10h - 12h</p>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <MapPin size={18} color="var(--gray-400)" />
              <div>
                <p style={{fontSize:13, color:'var(--gray-500)'}}>Adresse</p>
                <p style={{fontSize:15, fontWeight:600}}>24 rue des Oliviers, 13008 Marseille</p>
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <User size={18} color="var(--gray-400)" />
              <div>
                <p style={{fontSize:13, color:'var(--gray-500)'}}>Couvreur</p>
                <p style={{fontSize:15, fontWeight:600}}>{"Karim Z. - Couvreur certifi\u00E9 Qualibat"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prestation */}
        <div className="card">
          <h3 style={{fontSize:16, fontWeight:700, marginBottom:20}}>Prestation</h3>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--gray-100)'}}>
              <span style={{fontSize:14}}>Nettoyage panneaux solaires</span>
              <span style={{fontSize:14, fontWeight:600}}>{"199\u00A0\u20AC"}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--gray-100)'}}>
              <span style={{fontSize:14, color:'var(--green)'}}>Inspection toiture</span>
              <span style={{fontSize:14, fontWeight:600, color:'var(--green)'}}>Offerte</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--gray-100)'}}>
              <span style={{fontSize:14, color:'var(--green)'}}>Rapport avec photos</span>
              <span style={{fontSize:14, fontWeight:600, color:'var(--green)'}}>Offert</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--gray-100)'}}>
              <span style={{fontSize:14, color:'var(--green)'}}>{"Cr\u00E9dit parrainage"}</span>
              <span style={{fontSize:14, fontWeight:600, color:'var(--green)'}}>{"-50\u00A0\u20AC"}</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'16px 0'}}>
              <span style={{fontSize:16, fontWeight:700}}>Total TTC</span>
              <span style={{fontSize:20, fontWeight:800}}>{"149\u00A0\u20AC"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="card" style={{marginTop:24, background:'var(--gray-50)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h3 style={{fontSize:14, fontWeight:700, marginBottom:4}}>{"Besoin de modifier votre cr\u00E9neau ?"}</h3>
            <p style={{fontSize:13, color:'var(--gray-500)'}}>Contactez-nous au moins 48h avant l'intervention.</p>
          </div>
          <a href="tel:0412160630" className="btn btn-sm btn-dark"><Phone size={14} /> 04 12 16 06 30</a>
        </div>
      </div>
    </>
  )
}
