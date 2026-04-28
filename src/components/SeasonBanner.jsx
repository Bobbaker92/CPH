import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun, ArrowRight, X } from 'lucide-react'

const DISMISS_KEY = 'cph_season_banner_dismissed_v1'
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 jours

/**
 * Banner saisonnier en haut de page : message contextuel selon le mois
 * (pollens au printemps, sirocco en été, feuilles en automne, etc.).
 *
 * Dismissable : un clic sur la croix le cache pendant 7 jours.
 *
 * Le contenu est calculé côté client à partir du mois courant — pas de
 * config serveur, mise à jour automatique au fil des saisons.
 */
function getSeasonalContent() {
  const m = new Date().getMonth() // 0 = janvier
  if (m >= 2 && m <= 5) {
    // Mars-juin : saison des pollens
    return {
      emoji: '🌳',
      message: 'Saison des pollens en cours en PACA — nettoyage recommandé sous 30 jours pour préserver votre rendement.',
      cta: 'Réserver mon nettoyage',
    }
  }
  if (m >= 6 && m <= 8) {
    // Juillet-septembre : sirocco + chaleur
    return {
      emoji: '🌬️',
      message: 'Épisodes de sirocco fréquents — vos panneaux accumulent du sable saharien. Inspection conseillée.',
      cta: 'Demander un devis',
    }
  }
  if (m >= 9 && m <= 10) {
    // Octobre-novembre : nettoyage post-été
    return {
      emoji: '🍂',
      message: 'Nettoyage de fin de saison — préparez vos panneaux pour les mois d\'hiver moins ensoleillés.',
      cta: 'Planifier mon créneau',
    }
  }
  // Décembre-février : faible production, message éducatif
  return {
    emoji: '☀️',
    message: 'Vos panneaux produisent moins en hiver. Prenez rendez-vous dès maintenant pour un créneau au printemps.',
    cta: 'Réserver pour le printemps',
  }
}

function isRecentlyDismissed() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (Number.isNaN(ts)) return false
    return Date.now() - ts < DISMISS_TTL_MS
  } catch {
    return false
  }
}

export default function SeasonBanner() {
  // useState initializer évalué une seule fois à mount — pas de setState
  // dans un effect (lint react-hooks/set-state-in-effect).
  const [visible, setVisible] = useState(() => !isRecentlyDismissed())
  const [content] = useState(() => getSeasonalContent())

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="season-banner" role="region" aria-label="Information saisonnière">
      <div className="container season-banner-content">
        <span className="season-banner-emoji" aria-hidden="true">{content.emoji}</span>
        <span className="season-banner-message">{content.message}</span>
        <Link to="/devis" className="season-banner-cta">
          {content.cta} <ArrowRight size={13} />
        </Link>
        <button
          type="button"
          className="season-banner-close"
          onClick={dismiss}
          aria-label="Fermer le bandeau saisonnier"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
