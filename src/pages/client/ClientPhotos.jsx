import { Image, Download, Maximize2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ClientPhotos() {
  return (
    <>
      <div className="page-header">
        <h1>Photos de l&apos;intervention</h1>
        <p>Photo avant / apr&egrave;s du nettoyage et observations de toiture.</p>
      </div>

      {/* Comparatif avant / après */}
      <div className="card" style={{marginBottom:20, padding:0, overflow:'hidden'}}>
        <div className="photo-compare-header">
          <div>
            <h3>Avant / apr&egrave;s</h3>
            <p>Nettoyage du 4 mai 2026</p>
          </div>
          <button className="btn btn-sm btn-outline"><Download size={13} /> T&eacute;l&eacute;charger</button>
        </div>
        <div className="photo-compare">
          <figure className="photo-compare-item">
            <div className="photo-placeholder photo-placeholder-large">
              <Image size={44} />
              <span style={{fontSize:13, fontWeight:600}}>Photo avant</span>
              <span style={{fontSize:11, color:'var(--gray-400)'}}>Disponible apr&egrave;s intervention</span>
              <button className="photo-zoom" aria-label="Agrandir"><Maximize2 size={14} /></button>
            </div>
            <figcaption>
              <span className="badge badge-orange">Avant</span>
              <span>10h15</span>
            </figcaption>
          </figure>
          <figure className="photo-compare-item">
            <div className="photo-placeholder photo-placeholder-large">
              <Image size={44} />
              <span style={{fontSize:13, fontWeight:600}}>Photo apr&egrave;s</span>
              <span style={{fontSize:11, color:'var(--gray-400)'}}>Disponible apr&egrave;s intervention</span>
              <button className="photo-zoom" aria-label="Agrandir"><Maximize2 size={14} /></button>
            </div>
            <figcaption>
              <span className="badge badge-green">Apr&egrave;s</span>
              <span>11h30</span>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Observations toiture */}
      <div className="card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <div>
            <h3 style={{fontSize:16, fontWeight:700}}>Observations toiture</h3>
            <p style={{fontSize:12, color:'var(--gray-500)', marginTop:2}}>Inspection r&eacute;alis&eacute;e pendant le nettoyage.</p>
          </div>
          <span className="badge badge-blue">Inspection incluse</span>
        </div>
        <div className="observations-list">
          <div className="observation-item observation-ok">
            <CheckCircle size={18} />
            <div>
              <strong>Fa&icirc;tage</strong>
              <span>Correct &mdash; pas de jeu, closoir en place</span>
            </div>
          </div>
          <div className="observation-item observation-ok">
            <CheckCircle size={18} />
            <div>
              <strong>Rives</strong>
              <span>En bon &eacute;tat</span>
            </div>
          </div>
          <div className="observation-item observation-warn">
            <AlertCircle size={18} />
            <div>
              <strong>Tuiles</strong>
              <span>2 tuiles fissur&eacute;es rep&eacute;r&eacute;es pan Sud &mdash; devis couverture disponible</span>
            </div>
          </div>
          <div className="observation-item observation-ok">
            <CheckCircle size={18} />
            <div>
              <strong>&Eacute;tanch&eacute;it&eacute;</strong>
              <span>Aucune infiltration observ&eacute;e</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
