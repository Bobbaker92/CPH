import { useState } from 'react'
import { Download, Maximize2, CheckCircle, AlertCircle, X } from 'lucide-react'
import BeforeAfterSlider from '../../components/BeforeAfterSlider'

const PHOTO_AVANT = '/photos/avant-mock.svg'
const PHOTO_APRES = '/photos/apres-mock.svg'

export default function ClientPhotos() {
  const [lightbox, setLightbox] = useState(null) // 'avant' | 'apres' | null

  return (
    <>
      <div className="page-header">
        <h1>Photos de l&apos;intervention</h1>
        <p>Photo avant / apr&egrave;s du nettoyage et observations de toiture.</p>
      </div>

      {/* Slider drag avant / après */}
      <div className="card" style={{marginBottom:20, padding:0, overflow:'hidden'}}>
        <div className="photo-compare-header">
          <div>
            <h3>Comparatif interactif</h3>
            <p>Glissez la poign&eacute;e pour comparer &mdash; nettoyage du 4 mai 2026</p>
          </div>
          <button className="btn btn-sm btn-outline" type="button">
            <Download size={13} /> T&eacute;l&eacute;charger
          </button>
        </div>
        <BeforeAfterSlider
          beforeSrc={PHOTO_AVANT}
          afterSrc={PHOTO_APRES}
          beforeAlt="Panneaux encrass&eacute;s avant nettoyage"
          afterAlt="Panneaux propres apr&egrave;s nettoyage"
        />
      </div>

      {/* Vignettes individuelles + lightbox */}
      <div className="card" style={{marginBottom:20}}>
        <h3 style={{marginBottom:14}}>Photos individuelles</h3>
        <div className="photo-compare">
          <figure className="photo-compare-item">
            <button
              type="button"
              className="photo-thumb"
              onClick={() => setLightbox('avant')}
              aria-label="Agrandir la photo avant"
            >
              <img src={PHOTO_AVANT} alt="Panneaux avant nettoyage" loading="lazy" decoding="async" />
              <Maximize2 size={18} className="photo-thumb-icon" />
            </button>
            <figcaption>
              <span className="badge badge-orange">Avant</span>
              <span>10h15</span>
            </figcaption>
          </figure>
          <figure className="photo-compare-item">
            <button
              type="button"
              className="photo-thumb"
              onClick={() => setLightbox('apres')}
              aria-label="Agrandir la photo apr&egrave;s"
            >
              <img src={PHOTO_APRES} alt="Panneaux apr&egrave;s nettoyage" loading="lazy" decoding="async" />
              <Maximize2 size={18} className="photo-thumb-icon" />
            </button>
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

      {/* Lightbox plein écran */}
      {lightbox && (
        <div
          className="photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${lightbox === 'avant' ? 'avant' : 'après'} en plein écran`}
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === 'Escape' && setLightbox(null)}
        >
          <button
            type="button"
            className="photo-lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="Fermer"
            autoFocus
          >
            <X size={24} />
          </button>
          <img
            src={lightbox === 'avant' ? PHOTO_AVANT : PHOTO_APRES}
            alt={lightbox === 'avant' ? 'Panneaux avant nettoyage' : 'Panneaux après nettoyage'}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
