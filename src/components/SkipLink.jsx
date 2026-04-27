/**
 * Lien d'évitement (skip link) pour utilisateurs au clavier et lecteurs d'écran.
 * Visible uniquement au focus (Tab depuis le haut de la page).
 * Cible #main-content qui doit être présent dans la page courante.
 *
 * Référence : RGAA 4.1 critère 12.6 + WCAG 2.4.1.
 */
export default function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Aller au contenu principal
    </a>
  )
}
