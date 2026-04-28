import { Link } from 'react-router-dom'
import { Check, X, ArrowRight, Sun, Phone, Sparkles, MapPin } from 'lucide-react'
import useSeo from '../lib/useSeo'
import useJsonLd from '../lib/useJsonLd'

const SITE = 'https://cphpaca.fr'

const PACKS = [
  {
    nom: 'Standard',
    prix: 199,
    badge: null,
    description: 'Pour les installations résidentielles classiques.',
    inclus: [
      'Nettoyage complet à l’eau déminéralisée',
      'Inspection toiture (4 points)',
      'Rapport photo avant/après sous 24h',
      'Couvreur certifié Qualibat',
      'Assurance décennale',
    ],
    exclu: [
      'Réparations toiture (devis séparé)',
    ],
  },
  {
    nom: 'Créneau recommandé',
    prix: 179,
    badge: 'Économie 20 €',
    description: 'Quand nous sommes déjà programmés sur votre secteur.',
    inclus: [
      'Tout du pack Standard',
      'Date imposée (créneau optimisé)',
      'Économie 20 € liée à la mutualisation des trajets',
    ],
    exclu: [
      'Choix libre du créneau',
    ],
  },
  {
    nom: 'Grande installation',
    prix: 'Sur devis',
    badge: '24+ panneaux',
    description: 'Au-delà de 24 panneaux ou installation atypique.',
    inclus: [
      'Tout du pack Standard',
      'Devis personnalisé sous 24h',
      'Possibilité d’intervention à plusieurs',
      'Tarif dégressif selon la taille',
    ],
    exclu: [],
  },
]

export default function Tarifs() {
  useSeo({
    title: 'Tarifs nettoyage panneaux solaires PACA — dès 179 €',
    description: 'Combien coûte un nettoyage de panneaux solaires en région PACA ? Pack standard 199 € TTC, créneau recommandé 179 €. Inspection toiture incluse, couvreur certifié Qualibat.',
    path: '/tarifs',
  })

  useJsonLd('tarifs-offers', {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Nettoyage panneaux solaires CPH Solar',
    itemListElement: PACKS.filter((p) => typeof p.prix === 'number').map((p, i) => ({
      '@type': 'Offer',
      position: i + 1,
      name: `Pack ${p.nom}`,
      price: p.prix,
      priceCurrency: 'EUR',
      url: `${SITE}/devis`,
      areaServed: 'Provence-Alpes-Côte d’Azur',
    })),
  })

  return (
    <div className="tarifs-page">
      <header className="tarifs-header">
        <div className="container">
          <Link to="/" className="tarifs-back">← Retour à l&rsquo;accueil</Link>
          <span className="tarifs-eyebrow">Tarifs transparents</span>
          <h1>Combien co&ucirc;te un nettoyage de panneaux solaires&nbsp;?</h1>
          <p>
            Tarifs uniques, pas de mauvaise surprise. Inspection toiture toujours incluse,
            quel que soit le pack choisi.
          </p>
        </div>
      </header>

      <main className="tarifs-main container" id="main-content" tabIndex="-1">
        <div className="tarifs-grid">
          {PACKS.map((p, i) => (
            <article key={p.nom} className={`tarif-card ${i === 1 ? 'tarif-card-highlighted' : ''}`}>
              {p.badge && <span className="tarif-badge">{p.badge}</span>}
              <h2>{p.nom}</h2>
              <div className="tarif-prix">
                {typeof p.prix === 'number' ? (
                  <>
                    <strong>{p.prix}&nbsp;€</strong>
                    <span>TTC</span>
                  </>
                ) : (
                  <strong className="tarif-prix-devis">{p.prix}</strong>
                )}
              </div>
              <p className="tarif-desc">{p.description}</p>
              <ul className="tarif-list">
                {p.inclus.map((it) => (
                  <li key={it} className="tarif-li-yes">
                    <Check size={14} /> {it}
                  </li>
                ))}
                {p.exclu.map((it) => (
                  <li key={it} className="tarif-li-no">
                    <X size={14} /> {it}
                  </li>
                ))}
              </ul>
              <Link to="/devis" className={`btn btn-sm ${i === 1 ? 'btn-primary' : 'btn-outline'}`} style={{justifyContent:'center'}}>
                {typeof p.prix === 'number' ? 'Réserver' : 'Demander un devis'} <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>

        <section className="tarifs-includes">
          <h2><Sparkles size={18} style={{verticalAlign:'middle', marginRight:6, color:'#fbbf24'}} /> Ce qui est toujours inclus</h2>
          <div className="tarifs-includes-grid">
            <div><Sun size={16} /> Eau déminéralisée (zéro produit chimique)</div>
            <div><Check size={16} /> Inspection 4 points (fixations, tuiles, étanchéité, faîtage)</div>
            <div><Check size={16} /> Rapport photo avant/après sous 24h</div>
            <div><MapPin size={16} /> Déplacement partout en PACA</div>
          </div>
        </section>

        <section className="tarifs-faq">
          <h2>Pourquoi nos tarifs sont-ils transparents&nbsp;?</h2>
          <p>
            Le marché du nettoyage de panneaux va de 80 € (sans inspection ni assurance, eau du robinet)
            à 500 € pour certaines entreprises. Notre 199 € positionne <strong>l&rsquo;expertise couvreur
            + l&rsquo;eau déminéralisée + l&rsquo;assurance décennale</strong> au juste prix.
          </p>
          <p>
            Vous payez uniquement après l&rsquo;intervention si vous le souhaitez. Aucune avance demandée.
          </p>
        </section>

        <section className="tarifs-cta">
          <div>
            <h2>Prêt à programmer votre intervention&nbsp;?</h2>
            <p>Devis gratuit en 2 minutes, sans engagement.</p>
          </div>
          <div className="tarifs-cta-actions">
            <a href="tel:0412160630" className="btn btn-outline">
              <Phone size={16} /> 04 12 16 06 30
            </a>
            <Link to="/devis" className="btn btn-primary">
              Demander mon devis <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
