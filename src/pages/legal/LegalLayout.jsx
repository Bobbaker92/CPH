import { Link } from 'react-router-dom'
import { Sun, ArrowLeft } from 'lucide-react'

/**
 * Layout commun aux pages légales (Mentions, CGV, Confidentialité).
 * Header simple + container texte + footer minimal — découplé du chrome marketing.
 */
export default function LegalLayout({ title, lastUpdate = '27 avril 2026', children }) {
  return (
    <div className="legal-page-root">
      <header className="legal-page-header">
        <div className="container legal-page-header-row">
          <Link to="/" className="legal-page-brand">
            <div className="nav-logo"><Sun size={18} /></div>
            <strong>CPH Solar</strong>
          </Link>
          <Link to="/" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} /> Retour &agrave; l&rsquo;accueil
          </Link>
        </div>
      </header>

      <main className="container legal-page">
        <h1>{title}</h1>
        <p className="legal-page-meta">Derni&egrave;re mise &agrave; jour&nbsp;: {lastUpdate}</p>
        {children}
      </main>

      <footer className="legal-page-footer">
        <div className="container">
          &copy; 2026 Contr&ocirc;le Provence Habitat &mdash; SIRET 933&nbsp;929&nbsp;051&nbsp;00011 &mdash;{' '}
          <Link to="/mentions-legales">Mentions l&eacute;gales</Link> &middot;{' '}
          <Link to="/cgv">CGV</Link> &middot;{' '}
          <Link to="/confidentialite">Confidentialit&eacute;</Link>
        </div>
      </footer>
    </div>
  )
}
