import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Cookie, X, Settings, Check, ShieldOff } from 'lucide-react'
import { useCookieConsent } from '../lib/cookieConsent'

/**
 * Bandeau de consentement cookies conforme CNIL :
 * - "Tout refuser" aussi visible que "Tout accepter"
 * - Pas de pré-cochage des cases optionnelles
 * - Choix persisté 13 mois
 * - Réouvrable via le bouton "Gérer mes cookies" en bas de page
 *
 * Caché sur les espaces privés (admin, client, couvreur, prospection)
 * car derrière login = pas d'enjeu RGPD anonyme.
 */
const PRIVATE_PREFIXES = ['/admin', '/client', '/couvreur', '/prospection']

export default function CookieConsent() {
  const location = useLocation()
  const { consent, accept, refuse, customize } = useCookieConsent()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [analytics, setAnalytics] = useState(false)

  const isPrivateZone = PRIVATE_PREFIXES.some((p) => location.pathname.startsWith(p))
  if (isPrivateZone) return null
  if (consent) return null

  const handleCustomize = () => {
    customize({ analytics })
    setDetailsOpen(false)
  }

  return (
    <>
      <div className="cookie-banner" role="region" aria-label="Bandeau cookies">
        <div className="cookie-banner-content">
          <div className="cookie-banner-icon">
            <Cookie size={22} />
          </div>
          <div className="cookie-banner-text">
            <strong>Vos cookies, votre choix</strong>
            <p>
              Nous utilisons des cookies n&eacute;cessaires au bon fonctionnement du site et,
              sous r&eacute;serve de votre accord, des cookies de mesure d&rsquo;audience pour
              am&eacute;liorer votre exp&eacute;rience. Aucune donn&eacute;e n&rsquo;est revendue.{' '}
              <Link to="/confidentialite">En savoir plus</Link>
            </p>
          </div>
          <div className="cookie-banner-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm cookie-btn-secondary"
              onClick={() => setDetailsOpen(true)}
            >
              <Settings size={14} /> Personnaliser
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm cookie-btn-refuse"
              onClick={refuse}
            >
              <ShieldOff size={14} /> Tout refuser
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm cookie-btn-accept"
              onClick={accept}
            >
              <Check size={14} /> Tout accepter
            </button>
          </div>
        </div>
      </div>

      {detailsOpen && (
        <>
          <div className="admin-drawer-backdrop" onClick={() => setDetailsOpen(false)} />
          <div className="cookie-modal" role="dialog" aria-modal="true">
            <div className="cookie-modal-head">
              <h2>Pr&eacute;f&eacute;rences cookies</h2>
              <button type="button" className="admin-drawer-close" onClick={() => setDetailsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="cookie-modal-body">
              <p className="cookie-modal-intro">
                Vous pouvez choisir cat&eacute;gorie par cat&eacute;gorie. Les cookies dits
                &laquo;&nbsp;n&eacute;cessaires&nbsp;&raquo; sont indispensables au fonctionnement
                du site et ne peuvent pas &ecirc;tre d&eacute;sactiv&eacute;s.
              </p>

              <div className="cookie-category">
                <div className="cookie-category-head">
                  <strong>Cookies n&eacute;cessaires</strong>
                  <span className="cookie-category-required">Toujours actifs</span>
                </div>
                <p>
                  Indispensables au bon fonctionnement du site (session, s&eacute;curit&eacute;,
                  navigation). Sans eux, le site ne peut pas fonctionner correctement.
                </p>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-head">
                  <strong>Mesure d&rsquo;audience</strong>
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                    />
                    <span className="cookie-toggle-track" />
                  </label>
                </div>
                <p>
                  Nous permet de comprendre quelles pages sont consult&eacute;es et d&rsquo;am&eacute;liorer
                  le site. Donn&eacute;es anonymis&eacute;es, h&eacute;berg&eacute;es en France.
                </p>
              </div>
            </div>

            <div className="cookie-modal-foot">
              <button type="button" className="btn btn-outline btn-sm" onClick={refuse}>
                Tout refuser
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleCustomize}>
                Enregistrer mes pr&eacute;f&eacute;rences
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

/**
 * Bouton à placer dans le footer pour réouvrir le bandeau.
 * Obligatoire CNIL : l'utilisateur doit pouvoir retirer son consentement
 * aussi facilement qu'il l'a donné.
 */
export function CookieReopenLink() {
  const { reopen } = useCookieConsent()
  return (
    <button type="button" className="cookie-reopen" onClick={reopen}>
      G&eacute;rer mes cookies
    </button>
  )
}
