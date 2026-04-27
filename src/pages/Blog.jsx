import { Link } from 'react-router-dom'
import { Shield, Calendar, Clock, ArrowRight, BookOpen, User } from 'lucide-react'
import useSeo from '../lib/useSeo'
import useJsonLd from '../lib/useJsonLd'

const SITE = 'https://cphpaca.fr'

const ARTICLES = [
  {
    slug: 'pourquoi-nettoyer-panneaux-solaires',
    titre: 'Pourquoi nettoyer vos panneaux solaires en PACA\u00A0?',
    extrait: 'Poussi\u00E8re, pollen, pollution\u2026 En r\u00E9gion PACA, vos panneaux solaires sont expos\u00E9s \u00E0 des conditions qui r\u00E9duisent leur rendement jusqu\u2019\u00E0 20%. D\u00E9couvrez pourquoi un nettoyage r\u00E9gulier est essentiel.',
    date: '10 avril 2026',
    temps: '5 min',
    categorie: 'Entretien',
  },
  {
    slug: 'frequence-nettoyage-panneaux-solaires',
    titre: '\u00C0 quelle fr\u00E9quence nettoyer ses panneaux solaires\u00A0?',
    extrait: 'Faut-il nettoyer ses panneaux tous les mois, tous les ans\u00A0? La r\u00E9ponse d\u00E9pend de votre environnement. On vous explique tout pour la r\u00E9gion PACA.',
    date: '5 avril 2026',
    temps: '4 min',
    categorie: 'Conseils',
  },
  {
    slug: 'perte-rendement-panneaux-sales',
    titre: 'Panneaux solaires sales\u00A0: combien perdez-vous vraiment\u00A0?',
    extrait: 'Un panneau encras\u00E9 peut perdre de 5 \u00E0 20% de production. Sur une installation 6\u00A0kWc, \u00E7a repr\u00E9sente 200 \u00E0 400\u00A0\u20AC par an. Chiffres et explications.',
    date: '28 mars 2026',
    temps: '6 min',
    categorie: 'Rendement',
  },
  {
    slug: 'nettoyage-panneaux-solaires-marseille',
    titre: 'Nettoyage de panneaux solaires \u00E0 Marseille\u00A0: ce qu\u2019il faut savoir',
    extrait: 'Marseille cumule ensoleillement exceptionnel et pollution atmosph\u00E9rique. Vos panneaux s\u2019encrassent plus vite qu\u2019ailleurs. Nos conseils pour les propri\u00E9taires marseillais.',
    date: '20 mars 2026',
    temps: '5 min',
    categorie: 'Local',
  },
  {
    slug: 'entretien-toiture-panneaux-photovoltaiques',
    titre: 'Toiture et panneaux photovolta\u00EFques\u00A0: l\u2019entretien \u00E0 ne pas n\u00E9gliger',
    extrait: 'Vos panneaux sont fix\u00E9s sur votre toiture. L\u2019\u00E9tat de la couverture impacte directement la durabilit\u00E9 de votre installation. Un couvreur vous explique.',
    date: '15 mars 2026',
    temps: '7 min',
    categorie: 'Toiture',
  },
  {
    slug: 'prix-nettoyage-panneaux-solaires-2026',
    titre: 'Prix du nettoyage de panneaux solaires en 2026',
    extrait: 'Combien co\u00FBte un nettoyage professionnel\u00A0? Comparatif des tarifs, ce qui est inclus et ce qui ne l\u2019est pas. Guide complet pour les particuliers.',
    date: '8 mars 2026',
    temps: '5 min',
    categorie: 'Tarifs',
  },
]

export default function Blog() {
  useSeo({
    title: 'Blog — Conseils nettoyage et entretien de panneaux solaires',
    description: "Conseils, retours d'expérience et bonnes pratiques pour entretenir vos panneaux photovoltaïques en PACA. Articles rédigés par des couvreurs.",
    path: '/blog',
  })

  // ItemList JSON-LD : aide Google à comprendre la liste des articles
  useJsonLd('blog-itemlist', {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: ARTICLES.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: a.titre,
      url: `${SITE}/blog/${a.slug}`,
    })),
  })

  // Breadcrumb : Accueil > Blog
  useJsonLd('blog-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
    ],
  })

  return (
    <div style={{minHeight:'100vh', background:'var(--white)'}}>
      {/* Navbar */}
      <nav style={{
        background: 'var(--primary)', padding: '12px 0',
        borderBottom: '3px solid var(--accent)',
      }}>
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Link to="/" style={{display:'flex', alignItems:'center', gap: 8}}>
            <Shield size={18} color="var(--accent)" />
            <span style={{color:'white', fontWeight:700, fontSize:14}}>CPH</span>
            <span style={{color:'rgba(255,255,255,0.4)', fontSize:12, marginLeft:4}}>Nettoyage solaire</span>
          </Link>
          <div style={{display:'flex', alignItems:'center', gap:20}}>
            <Link to="/blog" style={{color:'var(--accent)', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6}}>
              <BookOpen size={14} /> Blog
            </Link>
            <Link to="/connexion" className="btn btn-sm btn-primary" style={{padding:'8px 18px', fontSize:12}}>
              <User size={13} /> Mon espace
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div style={{background:'var(--primary)', padding:'48px 0 56px', textAlign:'center'}}>
        <div className="container">
          <h1 style={{color:'white', fontSize:30, fontWeight:700, marginBottom:8}}>Blog</h1>
          <p style={{color:'rgba(255,255,255,0.5)', fontSize:14, maxWidth:500, margin:'0 auto'}}>
            {"Conseils d\u2019experts pour l\u2019entretien de vos panneaux solaires et de votre toiture en r\u00E9gion PACA."}
          </p>
        </div>
      </div>

      {/* Articles */}
      <div className="container" id="main-content" tabIndex="-1" style={{maxWidth:800, padding:'48px 24px'}}>
        {ARTICLES.map((article, i) => (
          <Link to={`/blog/${article.slug}`} key={i} style={{display:'block', marginBottom:24}}>
            <article className="card" style={{
              padding:0, overflow:'hidden', transition:'all 0.2s',
              borderLeft:'3px solid transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderLeftColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderLeftColor = 'transparent' }}
            >
              <div style={{padding:'24px 28px'}}>
                <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
                  <span style={{
                    fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5,
                    color:'var(--accent-hover)', background:'var(--accent-light)',
                    padding:'3px 10px', borderRadius:4,
                  }}>
                    {article.categorie}
                  </span>
                  <span style={{fontSize:12, color:'var(--gray-400)', display:'flex', alignItems:'center', gap:4}}>
                    <Calendar size={11} /> {article.date}
                  </span>
                  <span style={{fontSize:12, color:'var(--gray-400)', display:'flex', alignItems:'center', gap:4}}>
                    <Clock size={11} /> {article.temps}
                  </span>
                </div>
                <h2 style={{fontSize:18, fontWeight:700, color:'var(--primary)', marginBottom:8, lineHeight:1.4}}>
                  {article.titre}
                </h2>
                <p style={{fontSize:13, color:'var(--gray-500)', lineHeight:1.7, marginBottom:12}}>
                  {article.extrait}
                </p>
                <span style={{fontSize:13, fontWeight:600, color:'var(--accent-hover)', display:'flex', alignItems:'center', gap:4}}>
                  Lire l'article <ArrowRight size={14} />
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>{"Vos panneaux m\u00E9ritent un professionnel"}</h2>
          <p>{"199\u00A0\u20AC TTC \u2014 Nettoyage + inspection toiture offerte."}</p>
          <Link to="/" className="btn btn-primary">
            {"Demander une intervention"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p style={{marginBottom:8}}><strong style={{color:'white'}}>{"Contr\u00F4le Provence Habitat"}</strong> {"\u2014 Entreprise de couverture"}</p>
          <p>168 rue du dirigeable, ZI Les Paluds, 13400 Aubagne</p>
          <p style={{marginTop:4}}>04 12 16 06 30 | contact@cphpaca.fr</p>
        </div>
      </footer>
    </div>
  )
}
