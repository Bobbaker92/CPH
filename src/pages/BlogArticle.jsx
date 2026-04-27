import { useParams, Link } from 'react-router-dom'
import { Shield, Calendar, Clock, ArrowLeft, BookOpen, User, Phone, Check, ArrowRight, Sun } from 'lucide-react'
import useSeo from '../lib/useSeo'
import useJsonLd from '../lib/useJsonLd'

const SITE = 'https://cphpaca.fr'

const ARTICLES = {
  'pourquoi-nettoyer-panneaux-solaires': {
    titre: 'Pourquoi nettoyer vos panneaux solaires en PACA\u00A0?',
    date: '10 avril 2026',
    temps: '5 min',
    categorie: 'Entretien',
    contenu: [
      { type: 'p', text: 'La r\u00E9gion Provence-Alpes-C\u00F4te d\u2019Azur b\u00E9n\u00E9ficie d\u2019un ensoleillement exceptionnel avec plus de 2\u00A0600 heures de soleil par an. C\u2019est ce qui rend l\u2019installation de panneaux solaires si rentable ici. Mais cet avantage a un revers\u00A0: la poussi\u00E8re, le pollen et la pollution.' },
      { type: 'h2', text: 'Les ennemis de vos panneaux en PACA' },
      { type: 'p', text: 'Le climat m\u00E9diterran\u00E9en g\u00E9n\u00E8re des conditions sp\u00E9cifiques qui encrassent vos panneaux plus rapidement que dans d\u2019autres r\u00E9gions\u00A0:' },
      { type: 'ul', items: [
        'Poussi\u00E8re et sable\u00A0: les \u00E9pisodes de sirocco d\u00E9posent une fine couche de particules sahariennes',
        'Pollen\u00A0: de f\u00E9vrier \u00E0 juin, le pollen de pin, cypr\u00E8s et olivier recouvre toutes les surfaces',
        'Pollution atmosph\u00E9rique\u00A0: les zones urbaines (Marseille, Toulon) ajoutent des d\u00E9p\u00F4ts de micro-particules',
        'Fientes d\u2019oiseaux\u00A0: les go\u00E9lands sur le littoral, les pigeons en ville',
        'R\u00E9sine de pin\u00A0: si votre maison est entour\u00E9e de pins, la r\u00E9sine cr\u00E9e un film collant difficile \u00E0 enlever',
      ]},
      { type: 'cta' },
      { type: 'h2', text: 'L\u2019impact sur votre production' },
      { type: 'p', text: 'Un panneau encras\u00E9 peut perdre entre 5% et 20% de rendement selon le niveau de salet\u00E9. Sur une installation 6\u00A0kWc typique en PACA, cela repr\u00E9sente entre 200 et 400\u00A0\u20AC de production perdue par an.' },
      { type: 'p', text: 'Les cellules photovolta\u00EFques fonctionnent de mani\u00E8re optimale quand la surface vitr\u00E9e re\u00E7oit le maximum de lumi\u00E8re. M\u00EAme une fine couche de poussi\u00E8re, invisible \u00E0 l\u2019\u0153il nu, suffit \u00E0 r\u00E9duire significativement la production.' },
      { type: 'h2', text: 'Quand faire nettoyer vos panneaux\u00A0?' },
      { type: 'p', text: 'En PACA, nous recommandons un nettoyage\u00A0:' },
      { type: 'ul', items: [
        'Au printemps (avril-mai)\u00A0: apr\u00E8s la saison des pollens',
        'En automne (septembre-octobre)\u00A0: apr\u00E8s la poussi\u00E8re estivale',
      ]},
      { type: 'p', text: 'Un \u00E0 deux nettoyages par an suffisent pour maintenir un rendement optimal.' },
      { type: 'h2', text: 'Pourquoi faire appel \u00E0 un professionnel\u00A0?' },
      { type: 'p', text: 'Nettoyer soi-m\u00EAme ses panneaux comporte des risques\u00A0: chute en toiture, rayure des panneaux avec des produits inadapt\u00E9s, ou simple inefficacit\u00E9. Un couvreur professionnel intervient en s\u00E9curit\u00E9, utilise de l\u2019eau pure d\u00E9min\u00E9ralis\u00E9e, et profite de sa pr\u00E9sence sur le toit pour v\u00E9rifier l\u2019\u00E9tat de votre couverture.' },
    ],
  },
  'frequence-nettoyage-panneaux-solaires': {
    titre: '\u00C0 quelle fr\u00E9quence nettoyer ses panneaux solaires\u00A0?',
    date: '5 avril 2026',
    temps: '4 min',
    categorie: 'Conseils',
    contenu: [
      { type: 'p', text: 'La fr\u00E9quence id\u00E9ale de nettoyage d\u00E9pend principalement de votre environnement. En r\u00E9gion PACA, le climat sec et ensoleill\u00E9 favorise l\u2019accumulation de poussi\u00E8re et de pollen sur vos panneaux.' },
      { type: 'h2', text: 'La r\u00E8gle g\u00E9n\u00E9rale' },
      { type: 'p', text: 'Pour la plupart des installations r\u00E9sidentielles en PACA, un nettoyage annuel au printemps suffit. Si votre maison est situ\u00E9e dans un environnement particuli\u00E8rement expos\u00E9, deux passages par an sont recommand\u00E9s.' },
      { type: 'cta' },
      { type: 'h2', text: 'Les facteurs qui augmentent la fr\u00E9quence' },
      { type: 'ul', items: [
        'Proximit\u00E9 d\u2019une route \u00E0 fort trafic',
        'Zone agricole ou industrielle',
        'Pr\u00E9sence d\u2019arbres au-dessus du toit (pins, ch\u00EAnes)',
        'Bord de mer (sel, go\u00E9lands)',
        'Faible inclinaison du toit (les poussi\u00E8res stagnent)',
      ]},
    ],
  },
}

const DEFAULT = {
  titre: 'Article',
  date: 'Mars 2026',
  temps: '5 min',
  categorie: 'Conseils',
  contenu: [
    { type: 'p', text: 'Contenu \u00E0 venir. Cet article est en cours de r\u00E9daction.' },
  ],
}

function InlineCTA() {
  return (
    <div className="article-inline-cta">
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
        <div style={{
          width:40, height:40, borderRadius:10, background:'var(--accent)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <Sun size={20} color="var(--primary)" />
        </div>
        <div>
          <strong style={{display:'block', fontSize:15, color:'var(--primary)'}}>
            {"Nettoyage par un couvreur pro \u2014 199\u00A0\u20AC"}
          </strong>
          <span style={{fontSize:12, color:'var(--gray-500)'}}>
            {"Inspection toiture incluse. Paiement \u00E0 l\u2019intervention."}
          </span>
        </div>
      </div>
      <Link to="/devis" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'12px 20px', fontSize:13}}>
        {"R\u00E9server mon nettoyage"} <ArrowRight size={14} />
      </Link>
    </div>
  )
}

export default function BlogArticle() {
  const { slug } = useParams()
  const article = ARTICLES[slug] || DEFAULT

  const firstPara = article.contenu?.find((b) => b.type === 'p')?.text || ''
  const seoDescription = firstPara.length > 160 ? `${firstPara.slice(0, 157)}...` : firstPara
  useSeo({
    title: article.titre,
    description: seoDescription || article.titre,
    path: `/blog/${slug}`,
  })

  // Breadcrumb JSON-LD : Accueil > Blog > Article
  useJsonLd(`breadcrumb-${slug}`, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
      { '@type': 'ListItem', position: 3, name: article.titre, item: `${SITE}/blog/${slug}` },
    ],
  })

  // Article JSON-LD : pour rich snippet article (date, auteur, titre)
  useJsonLd(`article-${slug}`, {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.titre,
    datePublished: article.date,
    author: { '@type': 'Organization', name: 'CPH Solar' },
    publisher: {
      '@type': 'Organization',
      name: 'CPH Solar',
      logo: { '@type': 'ImageObject', url: `${SITE}/favicon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${slug}` },
    articleSection: article.categorie,
  })

  return (
    <div style={{minHeight:'100vh', background:'var(--white)'}}>
      {/* Navbar with conversion CTA */}
      <nav style={{
        background: 'var(--primary)', padding: '12px 0',
        borderBottom: '3px solid var(--accent)',
        position:'sticky', top:0, zIndex:100,
      }}>
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Link to="/" style={{display:'flex', alignItems:'center', gap: 8}}>
            <Shield size={18} color="var(--accent)" />
            <span style={{color:'white', fontWeight:700, fontSize:14}}>CPH</span>
            <span className="hide-mobile" style={{color:'rgba(255,255,255,0.4)', fontSize:12, marginLeft:4}}>Nettoyage solaire</span>
          </Link>
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            <a href="tel:0412160630" className="hide-mobile" style={{color:'var(--accent)', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6}}>
              <Phone size={14} /> 04 12 16 06 30
            </a>
            <Link to="/devis" className="btn btn-primary btn-sm" style={{padding:'8px 16px', fontSize:12}}>
              {"R\u00E9server \u2014 199\u00A0\u20AC"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Article layout with sidebar */}
      <div className="article-layout">
        <article className="article-main">
          {/* Back */}
          <Link to="/blog" style={{
            display:'inline-flex', alignItems:'center', gap:6,
            fontSize:13, color:'var(--gray-500)', fontWeight:500, marginBottom:24,
          }}>
            <ArrowLeft size={14} /> Retour au blog
          </Link>

          {/* Meta */}
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap'}}>
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

          {/* Titre */}
          <h1 style={{fontSize:28, fontWeight:700, color:'var(--primary)', lineHeight:1.3, marginBottom:16}}>
            {article.titre}
          </h1>

          {/* Teaser CTA (haut d'article) */}
          <div className="article-teaser-cta">
            <div>
              <strong>{"199\u00A0\u20AC \u2014 Intervention sous 15 jours"}</strong>
              <span>{"Nettoyage + inspection toiture + rapport photo"}</span>
            </div>
            <Link to="/devis" className="btn btn-primary btn-sm">
              {"Je r\u00E9serve"} <ArrowRight size={14} />
            </Link>
          </div>

          {/* Contenu */}
          <div style={{lineHeight:1.8}}>
            {article.contenu.map((block, i) => {
              if (block.type === 'p') return (
                <p key={i} style={{fontSize:15, color:'var(--gray-700)', marginBottom:20}}>
                  {block.text}
                </p>
              )
              if (block.type === 'h2') return (
                <h2 key={i} style={{fontSize:20, fontWeight:700, color:'var(--primary)', marginTop:36, marginBottom:16}}>
                  {block.text}
                </h2>
              )
              if (block.type === 'ul') return (
                <ul key={i} style={{paddingLeft:24, marginBottom:20}}>
                  {block.items.map((item, j) => (
                    <li key={j} style={{fontSize:14, color:'var(--gray-600)', marginBottom:8, lineHeight:1.7}}>
                      {item}
                    </li>
                  ))}
                </ul>
              )
              if (block.type === 'cta') return <InlineCTA key={i} />
              return null
            })}
          </div>

          {/* CTA final */}
          <div className="article-final-cta">
            <div className="article-final-cta-inner">
              <div>
                <h3>{"Pr\u00EAt \u00E0 faire nettoyer vos panneaux ?"}</h3>
                <p>{"Intervention par un couvreur certifi\u00E9 Qualibat. Inspection toiture offerte. Rapport d\u00E9taill\u00E9."}</p>
                <div className="article-final-cta-features">
                  <span><Check size={14} /> 199&nbsp;&euro; TTC</span>
                  <span><Check size={14} /> Sous 15 jours</span>
                  <span><Check size={14} /> Paiement sur place</span>
                </div>
              </div>
              <Link to="/devis" className="btn btn-primary btn-lg" style={{whiteSpace:'nowrap'}}>
                {"R\u00E9server mon nettoyage"} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </article>

        {/* Sticky sidebar desktop */}
        <aside className="article-sidebar">
          <div className="sidebar-cta-card">
            <div className="sidebar-cta-icon">
              <Sun size={24} />
            </div>
            <h3>{"Nettoyage de vos panneaux"}</h3>
            <div className="sidebar-cta-price">
              <span className="price">{"199\u00A0\u20AC"}</span>
              <span className="price-label">TTC / intervention</span>
            </div>
            <ul className="sidebar-cta-features">
              <li><Check size={14} /> Nettoyage complet</li>
              <li><Check size={14} /> Inspection toiture</li>
              <li><Check size={14} /> Rapport photo</li>
              <li><Check size={14} /> Qualibat</li>
            </ul>
            <Link to="/devis" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'14px', fontSize:14}}>
              {"R\u00E9server"} <ArrowRight size={14} />
            </Link>
            <a href="tel:0412160630" className="sidebar-cta-phone">
              <Phone size={14} /> 04 12 16 06 30
            </a>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA bar */}
      <div className="mobile-sticky-cta">
        <div>
          <span className="mobile-sticky-price">{"199\u00A0\u20AC"}</span>
          <span className="mobile-sticky-label">TTC tout compris</span>
        </div>
        <Link to="/devis" className="btn btn-primary btn-sm">
          {"R\u00E9server"} <ArrowRight size={14} />
        </Link>
      </div>

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
