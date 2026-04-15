import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function ClientRecommander() {
  const [copied, setCopied] = useState(false)
  const lien = 'https://solaire-paca.fr/r/jp-martin'

  const handleCopy = () => {
    navigator.clipboard.writeText(lien)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="page-header">
        <h1>Recommandez-nous</h1>
        <p>Faites profiter votre entourage de notre expertise.</p>
      </div>

      <div className="referral-box" style={{marginBottom:24}}>
        <h3>{"50\u00A0\u20AC offerts pour vos proches"}</h3>
        <p>
          {"Partagez votre lien personnel. Votre proche b\u00E9n\u00E9ficie de 50\u00A0\u20AC de r\u00E9duction sur son intervention. Vous recevez 50\u00A0\u20AC de cr\u00E9dit valable sur toutes nos prestations."}
        </p>

        <div className="referral-link">
          <code>{lien}</code>
          <button className="btn btn-sm btn-primary" onClick={handleCopy}>
            {copied ? <><Check size={14} /> {"Copi\u00E9"}</> : <><Copy size={14} /> Copier</>}
          </button>
        </div>

        <a
          href={`https://wa.me/?text=${encodeURIComponent("Salut, j'ai fait nettoyer mes panneaux solaires par CPH \u2014 couvreurs pros, inspection toiture offerte. 50\u20AC de r\u00E9duc avec mon lien : " + lien)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            width:'100%', padding:'14px 20px', borderRadius:8,
            background:'#25D366', color:'white', fontWeight:600, fontSize:14,
            marginBottom:20, transition:'opacity 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Envoyer via WhatsApp
        </a>

        <div className="referral-stats">
          <div className="referral-stat">
            <span className="val">1</span>
            <span className="lbl">Recommandation</span>
          </div>
          <div className="referral-stat">
            <span className="val">{"50\u00A0\u20AC"}</span>
            <span className="lbl">{"Cr\u00E9dit disponible"}</span>
          </div>
          <div className="referral-stat">
            <span className="val">{"100\u00A0\u20AC"}</span>
            <span className="lbl">{"Economies totales"}</span>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="card" style={{marginBottom:24}}>
        <h3 style={{fontSize:16, fontWeight:700, marginBottom:16}}>Historique</h3>
        <table style={{width:'100%'}}>
          <thead>
            <tr>
              <th style={{textAlign:'left', padding:'8px 0', fontSize:12, color:'var(--gray-500)'}}>Contact</th>
              <th style={{textAlign:'left', padding:'8px 0', fontSize:12, color:'var(--gray-500)'}}>Statut</th>
              <th style={{textAlign:'right', padding:'8px 0', fontSize:12, color:'var(--gray-500)'}}>{"Cr\u00E9dit"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{padding:'12px 0', fontSize:14}}>Pierre D.</td>
              <td style={{padding:'12px 0'}}><span className="badge badge-green">{"Intervention r\u00E9alis\u00E9e"}</span></td>
              <td style={{padding:'12px 0', textAlign:'right', fontSize:14, fontWeight:600, color:'var(--green)'}}>{"+50\u00A0\u20AC"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Conditions */}
      <div className="card" style={{background:'var(--gray-50)'}}>
        <h3 style={{fontSize:14, fontWeight:700, marginBottom:8}}>Conditions</h3>
        <ul style={{fontSize:13, color:'var(--gray-500)', paddingLeft:20, lineHeight:2}}>
          <li>{"Le cr\u00E9dit est activ\u00E9 apr\u00E8s la r\u00E9alisation de l'intervention de votre proche"}</li>
          <li>{"Le cr\u00E9dit est valable 12 mois sur toutes nos prestations (nettoyage, couverture, hydrofuge...)"}</li>
          <li>{"Cumul illimit\u00E9"}</li>
        </ul>
      </div>
    </>
  )
}
