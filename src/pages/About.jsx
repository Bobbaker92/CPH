import { Link } from 'react-router-dom'
import { Award, Shield, Calendar, Phone, ArrowRight, Sun, Star, Wrench, MapPin } from 'lucide-react'
import useSeo from '../lib/useSeo'
import useJsonLd from '../lib/useJsonLd'

const SITE = 'https://cphpaca.fr'

export default function About() {
  useSeo({
    title: 'À propos — Karim Ziani, votre couvreur certifié en PACA',
    description: "Découvrez Karim Ziani, le couvreur certifié Qualibat qui intervient pour CPH Solar partout en région PACA. 12 ans de métier, 800 toitures inspectées, expertise photovoltaïque.",
    path: '/a-propos',
  })

  useJsonLd('about-person', {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Karim Ziani',
    jobTitle: 'Couvreur certifié Qualibat — CPH Solar',
    worksFor: {
      '@type': 'Organization',
      name: 'CPH Solar',
      url: SITE,
    },
    knowsAbout: [
      'Nettoyage de panneaux photovoltaïques',
      'Inspection de toiture',
      'Étanchéité',
      'Couverture tuiles canal et romanes',
    ],
    award: ['Certification Qualibat', 'Certification RGE'],
  })

  return (
    <div className="about-page">
      <header className="about-header">
        <div className="container">
          <Link to="/" className="about-back">← Retour à l&rsquo;accueil</Link>
          <span className="about-eyebrow">À propos</span>
          <h1>Karim Ziani, votre couvreur en PACA</h1>
          <p className="about-lede">
            12 ans de métier sur les toits de la région, plus de 800 toitures inspectées.
            Couvreur certifié Qualibat et RGE, j&rsquo;interviens en personne sur chacun
            de vos chantiers — pas de sous-traitance.
          </p>
        </div>
      </header>

      <main className="about-main container" id="main-content" tabIndex="-1">
        <div className="about-grid">
          <div className="about-portrait">
            <div className="about-portrait-mock" aria-hidden="true">
              <Sun size={60} />
            </div>
            <div className="about-portrait-caption">
              <strong>Karim Ziani</strong>
              <span>Couvreur principal · CPH Solar</span>
            </div>
          </div>

          <div className="about-bio">
            <h2>Mon parcours</h2>
            <p>
              J&rsquo;ai commencé comme apprenti couvreur en 2014 à Aubagne. Après 5 ans
              dans une entreprise familiale spécialisée dans les tuiles canal de Provence,
              j&rsquo;ai rejoint CPH en 2019 pour développer la branche <strong>nettoyage
              et entretien de panneaux photovoltaïques</strong> — un service que peu de
              vrais couvreurs proposent et où l&rsquo;expertise toiture fait toute la
              différence.
            </p>
            <p>
              Pourquoi un <em>couvreur</em> et pas un nettoyeur classique ? Parce qu&rsquo;une
              toiture mal lue, c&rsquo;est une infiltration qui se prépare. Quand je nettoie
              vos panneaux, je profite de ma présence sur le toit pour vérifier les
              fixations, les tuiles, les solins et le faîtage. Si je vois un problème,
              je vous le signale tout de suite.
            </p>
          </div>
        </div>

        <section className="about-stats">
          <div className="about-stat">
            <Calendar size={24} />
            <strong>12 ans</strong>
            <span>d&rsquo;expérience couverture</span>
          </div>
          <div className="about-stat">
            <Wrench size={24} />
            <strong>800+</strong>
            <span>toitures inspectées</span>
          </div>
          <div className="about-stat">
            <MapPin size={24} />
            <strong>6 dépts</strong>
            <span>13, 83, 06, 84, 04, 05</span>
          </div>
          <div className="about-stat">
            <Star size={24} />
            <strong>4,9 / 5</strong>
            <span>note moyenne client</span>
          </div>
        </section>

        <section className="about-certifs">
          <h2>Certifications et garanties</h2>
          <div className="about-certifs-grid">
            <div className="about-certif">
              <Award size={20} />
              <div>
                <strong>Qualibat</strong>
                <span>Certification couverture</span>
              </div>
            </div>
            <div className="about-certif">
              <Award size={20} />
              <div>
                <strong>RGE</strong>
                <span>Reconnu Garant de l&rsquo;Environnement</span>
              </div>
            </div>
            <div className="about-certif">
              <Shield size={20} />
              <div>
                <strong>Décennale</strong>
                <span>Couverture intervention toiture</span>
              </div>
            </div>
            <div className="about-certif">
              <Shield size={20} />
              <div>
                <strong>RC Pro</strong>
                <span>Responsabilité civile professionnelle</span>
              </div>
            </div>
          </div>
        </section>

        <section className="about-values">
          <h2>Mes engagements</h2>
          <ul>
            <li><strong>Pas de sous-traitance.</strong> J&rsquo;interviens en personne sur chaque chantier.</li>
            <li><strong>Eau déminéralisée uniquement.</strong> Aucun produit chimique, séchage sans trace.</li>
            <li><strong>Inspection toiture systématique</strong> à chaque passage, sans surcoût.</li>
            <li><strong>Rapport photo</strong> envoyé sous 24h après l&rsquo;intervention.</li>
            <li><strong>Disponibilité.</strong> Je rappelle dans la journée, intervention sous 7 jours.</li>
          </ul>
        </section>

        <section className="about-cta">
          <div>
            <h2>Discutons de votre toiture</h2>
            <p>Devis gratuit, intervention en région PACA — vous parlez directement à Karim.</p>
          </div>
          <div className="about-cta-actions">
            <a href="tel:0412160630" className="btn btn-outline">
              <Phone size={16} /> 04 12 16 06 30
            </a>
            <Link to="/devis" className="btn btn-primary">
              Demander un devis <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
