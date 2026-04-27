import { Link } from 'react-router-dom'
import { Sun, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="notfound-root">
      <div className="notfound-inner">
        <div className="notfound-logo">
          <div className="nav-logo"><Sun size={22} /></div>
          <strong>CPH Solar</strong>
        </div>

        <div className="notfound-code">404</div>
        <h1>Cette page n&rsquo;existe pas</h1>
        <p>
          Le lien que vous avez suivi est peut-&ecirc;tre cass&eacute;, ou la page a &eacute;t&eacute;
          d&eacute;plac&eacute;e. Pas de panique&nbsp;: vous pouvez revenir &agrave; l&rsquo;accueil ou
          demander un devis directement.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary">
            <Home size={16} /> Retour &agrave; l&rsquo;accueil
          </Link>
          <Link to="/devis" className="btn btn-outline">
            Demander un devis
          </Link>
        </div>

        <p className="notfound-help">
          Besoin d&rsquo;aide&nbsp;?{' '}
          <a href="tel:0412160630">04&nbsp;12&nbsp;16&nbsp;06&nbsp;30</a>
          {' '}&middot;{' '}
          <a href="mailto:contact@cphpaca.fr">contact@cphpaca.fr</a>
        </p>

        <Link to="/" className="notfound-back">
          <ArrowLeft size={14} /> Page pr&eacute;c&eacute;dente
        </Link>
      </div>
    </div>
  )
}
