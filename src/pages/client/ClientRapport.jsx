import { FileText, Download, CheckCircle, AlertTriangle } from 'lucide-react'

export default function ClientRapport() {
  return (
    <>
      <div className="page-header">
        <h1>Rapport d'intervention</h1>
        <p>{"Rapport d\u00E9taill\u00E9 de l'\u00E9tat de vos panneaux et de votre toiture."}</p>
      </div>

      {/* Rapport panneaux */}
      <div className="card" style={{marginBottom:24}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
          <h3 style={{fontSize:16, fontWeight:700}}>Panneaux solaires</h3>
          <span className="badge badge-green"><CheckCircle size={12} /> {"Nettoyage effectu\u00E9"}</span>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div style={{padding:16, background:'var(--gray-50)', borderRadius:'var(--radius-sm)'}}>
            <p style={{fontSize:13, color:'var(--gray-500)', marginBottom:4}}>{"\u00C9tat des panneaux"}</p>
            <p style={{fontSize:15, fontWeight:600, color:'var(--green)'}}>{"Bon \u00E9tat g\u00E9n\u00E9ral"}</p>
          </div>
          <div style={{padding:16, background:'var(--gray-50)', borderRadius:'var(--radius-sm)'}}>
            <p style={{fontSize:13, color:'var(--gray-500)', marginBottom:4}}>Nombre de panneaux</p>
            <p style={{fontSize:15, fontWeight:600}}>{"16 panneaux nettoy\u00E9s"}</p>
          </div>
          <div style={{padding:16, background:'var(--gray-50)', borderRadius:'var(--radius-sm)'}}>
            <p style={{fontSize:13, color:'var(--gray-500)', marginBottom:4}}>Fixations</p>
            <p style={{fontSize:15, fontWeight:600, color:'var(--green)'}}>RAS</p>
          </div>
          <div style={{padding:16, background:'var(--gray-50)', borderRadius:'var(--radius-sm)'}}>
            <p style={{fontSize:13, color:'var(--gray-500)', marginBottom:4}}>{"\u00C9tanch\u00E9it\u00E9"}</p>
            <p style={{fontSize:15, fontWeight:600, color:'var(--green)'}}>RAS</p>
          </div>
        </div>
      </div>

      {/* Rapport toiture */}
      <div className="card" style={{marginBottom:24}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
          <h3 style={{fontSize:16, fontWeight:700}}>{"\u00C9tat de la toiture"}</h3>
          <span className="badge badge-orange"><AlertTriangle size={12} /> Points d'attention</span>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div style={{padding:16, background:'var(--green-light)', borderRadius:'var(--radius-sm)', borderLeft:'4px solid var(--green)'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
              <CheckCircle size={16} color="var(--green)" />
              <span style={{fontSize:14, fontWeight:600}}>Tuiles</span>
            </div>
            <p style={{fontSize:13, color:'var(--gray-600)', paddingLeft:24}}>{"Bon \u00E9tat g\u00E9n\u00E9ral, pas de tuile cass\u00E9e ou d\u00E9plac\u00E9e constat\u00E9e."}</p>
          </div>

          <div style={{padding:16, background:'var(--orange-light)', borderRadius:'var(--radius-sm)', borderLeft:'4px solid var(--orange)'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
              <AlertTriangle size={16} color="var(--orange)" />
              <span style={{fontSize:14, fontWeight:600}}>{"Fa\u00EEtage"}</span>
            </div>
            <p style={{fontSize:13, color:'var(--gray-600)', paddingLeft:24}}>{"Closoir absent sur environ 3 m\u00E8tres lin\u00E9aires c\u00F4t\u00E9 sud. Risque d'infiltration \u00E0 moyen terme. Remplacement recommand\u00E9."}</p>
          </div>

          <div style={{padding:16, background:'var(--orange-light)', borderRadius:'var(--radius-sm)', borderLeft:'4px solid var(--orange)'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
              <AlertTriangle size={16} color="var(--orange)" />
              <span style={{fontSize:14, fontWeight:600}}>Rives</span>
            </div>
            <p style={{fontSize:13, color:'var(--gray-600)', paddingLeft:24}}>{"Mortier de rive fissur\u00E9 sur la partie ouest. \u00C0 reprendre pour \u00E9viter les infiltrations."}</p>
          </div>

          <div style={{padding:16, background:'var(--green-light)', borderRadius:'var(--radius-sm)', borderLeft:'4px solid var(--green)'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
              <CheckCircle size={16} color="var(--green)" />
              <span style={{fontSize:14, fontWeight:600}}>{"Goutti\u00E8re"}</span>
            </div>
            <p style={{fontSize:13, color:'var(--gray-600)', paddingLeft:24}}>{"Bon \u00E9tat, \u00E9coulement correct."}</p>
          </div>
        </div>
      </div>

      {/* Note du couvreur */}
      <div className="card" style={{marginBottom:24, background:'var(--gray-50)'}}>
        <h3 style={{fontSize:16, fontWeight:700, marginBottom:12}}>Note du couvreur</h3>
        <p style={{fontSize:14, color:'var(--gray-600)', lineHeight:1.7}}>
          {"\"Panneaux nettoy\u00E9s sans difficult\u00E9. J'ai constat\u00E9 un probl\u00E8me de fa\u00EEtage c\u00F4t\u00E9 sud\u00A0: le closoir est absent sur environ 3m, ce qui peut provoquer des infiltrations en cas de fortes pluies. Les rives c\u00F4t\u00E9 ouest montrent des fissures dans le mortier. Je recommande une intervention de remise en \u00E9tat pour s\u00E9curiser la couverture. N'h\u00E9sitez pas \u00E0 nous contacter pour un devis gratuit.\""}
        </p>
        <p style={{fontSize:13, color:'var(--gray-400)', marginTop:8}}>{"- Thomas, couvreur certifi\u00E9 Qualibat"}</p>
      </div>

      {/* Actions */}
      <div style={{display:'flex', gap:16}}>
        <button className="btn btn-dark">
          <Download size={16} /> {"T\u00E9l\u00E9charger le rapport PDF"}
        </button>
        <button className="btn btn-primary">
          Demander un devis couverture
        </button>
      </div>
    </>
  )
}
