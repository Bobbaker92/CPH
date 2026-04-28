import { Link } from 'react-router-dom'
import { MapPin, Phone, Clock, ArrowRight, Sun } from 'lucide-react'
import useSeo from '../lib/useSeo'

const DEPARTEMENTS = [
  {
    code: '13',
    nom: 'Bouches-du-Rhône',
    villes: ['Marseille', 'Aix-en-Provence', 'Aubagne', 'La Ciotat', 'Vitrolles', 'Marignane', 'Salon-de-Provence', 'Martigues', 'Istres', 'Gardanne'],
    delai: 'Sous 7 jours',
  },
  {
    code: '83',
    nom: 'Var',
    villes: ['Toulon', 'Hyères', 'Fréjus', 'Saint-Raphaël', 'Draguignan', 'La Seyne-sur-Mer', 'La Garde', 'Six-Fours', 'Ollioules', 'La Valette'],
    delai: 'Sous 7 jours',
  },
  {
    code: '06',
    nom: 'Alpes-Maritimes',
    villes: ['Nice', 'Cannes', 'Antibes', 'Grasse', 'Cagnes-sur-Mer', 'Le Cannet', 'Saint-Laurent-du-Var', 'Menton', 'Mougins', 'Vence'],
    delai: 'Sous 10 jours',
  },
  {
    code: '84',
    nom: 'Vaucluse',
    villes: ['Avignon', 'Carpentras', 'Orange', 'Cavaillon', 'Pertuis', 'Le Pontet', 'Sorgues', 'Bollène', 'L\'Isle-sur-la-Sorgue'],
    delai: 'Sous 10 jours',
  },
  {
    code: '04',
    nom: 'Alpes-de-Haute-Provence',
    villes: ['Manosque', 'Digne-les-Bains', 'Sisteron', 'Forcalquier', 'Oraison', 'Château-Arnoux'],
    delai: 'Sur devis',
  },
  {
    code: '05',
    nom: 'Hautes-Alpes',
    villes: ['Gap', 'Briançon', 'Embrun', 'Veynes', 'Tallard', 'Laragne-Montéglin'],
    delai: 'Sur devis',
  },
]

export default function Zones() {
  useSeo({
    title: 'Zones d\'intervention CPH Solar — toute la région PACA',
    description: "Nous intervenons partout en région PACA : Bouches-du-Rhône, Var, Alpes-Maritimes, Vaucluse, Alpes-de-Haute-Provence, Hautes-Alpes. Délai 7 à 10 jours selon zone.",
    path: '/zones',
  })

  const totalVilles = DEPARTEMENTS.reduce((s, d) => s + d.villes.length, 0)

  return (
    <div className="zones-page">
      <header className="zones-header">
        <div className="container">
          <Link to="/" className="zones-back">← Retour à l&rsquo;accueil</Link>
          <span className="zones-eyebrow">Zones d&rsquo;intervention</span>
          <h1>O&ugrave; intervenons-nous&nbsp;?</h1>
          <p>
            CPH Solar couvre l&rsquo;int&eacute;gralit&eacute; de la r&eacute;gion Provence-Alpes-C&ocirc;te d&rsquo;Azur,
            de Marseille aux Alpes du Sud. Plus de <strong>{totalVilles} villes principales</strong>{' '}
            desservies sur 6 d&eacute;partements.
          </p>
        </div>
      </header>

      <main className="zones-main container" id="main-content" tabIndex="-1">
        <div className="zones-grid">
          {DEPARTEMENTS.map((d) => (
            <article key={d.code} className="zone-card">
              <div className="zone-card-head">
                <div className="zone-code"><MapPin size={16} /> {d.code}</div>
                <h2>{d.nom}</h2>
              </div>
              <p className="zone-delai">
                <Clock size={13} /> {d.delai}
              </p>
              <ul className="zone-villes">
                {d.villes.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="zones-tarif">
          <Sun size={20} />
          <div>
            <h3>Pas de surcoût géographique</h3>
            <p>
              Le tarif <strong>199&nbsp;€</strong> (ou 179&nbsp;€ en créneau recommandé) inclut
              le déplacement sur l&rsquo;ensemble de la région PACA, peu importe la ville.
              Pas de mauvaise surprise selon votre adresse.
            </p>
          </div>
        </section>

        <section className="zones-cta">
          <div>
            <h2>Votre ville n&rsquo;est pas list&eacute;e&nbsp;?</h2>
            <p>Appelez-nous : selon le calendrier, nous pouvons souvent intervenir en zone limitrophe.</p>
          </div>
          <div className="zones-cta-actions">
            <a href="tel:0412160630" className="btn btn-outline">
              <Phone size={16} /> 04 12 16 06 30
            </a>
            <Link to="/devis" className="btn btn-primary">
              V&eacute;rifier mon adresse <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
