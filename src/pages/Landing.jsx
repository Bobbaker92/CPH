import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, Shield, Clock, Star, Award, MapPin, User, BookOpen, ChevronRight, Sun, Droplets, FileCheck, Zap, ArrowRight, Check, Quote, Menu, X, LogOut } from 'lucide-react'
import CallbackModal, { CallbackFab } from '../components/CallbackModal'
import useSeo from '../lib/useSeo'
import useJsonLd from '../lib/useJsonLd'
import { CookieReopenLink } from '../components/CookieConsent'
import RoiCalculator from '../components/RoiCalculator'
import SeasonBanner from '../components/SeasonBanner'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import NewsletterSignup from '../components/NewsletterSignup'

const FAQ = [
  {
    q: 'Combien coûte un nettoyage de panneaux solaires ?',
    r: '199 € TTC par intervention pour les installations jusqu’à 24 panneaux. Tarif réduit à 179 € TTC quand vous choisissez un créneau recommandé sur un secteur déjà programmé. Aucune avance n’est demandée — paiement en ligne ou à l’intervention.',
  },
  {
    q: 'En combien de temps intervenez-vous ?',
    r: 'Sous 7 jours en moyenne sur toute la région PACA. Pour les zones les plus demandées (Marseille, Aix, Aubagne, Toulon), souvent sous 48-72h. Vous choisissez votre créneau directement en ligne.',
  },
  {
    q: 'Sur quelles zones intervenez-vous ?',
    r: 'Toute la région Provence-Alpes-Côte d’Azur : Bouches-du-Rhône (13), Var (83), Alpes-Maritimes (06), Vaucluse (84), Alpes-de-Haute-Provence (04) et Hautes-Alpes (05).',
  },
  {
    q: 'Quelle est la différence avec un nettoyeur classique ?',
    r: 'Nous sommes des couvreurs certifiés Qualibat, pas des nettoyeurs. À chaque intervention, nous inspectons aussi votre toiture (fixations, tuiles, étanchéité, faîtage). Si une tuile est cassée ou un solin descellé, vous le savez avant de descendre du toit.',
  },
  {
    q: 'Quels produits utilisez-vous ?',
    r: 'Uniquement de l’eau déminéralisée, sans produit chimique, sans détergent. C’est ce qui permet d’obtenir un séchage sans trace et de préserver le revêtement antireflet de vos panneaux.',
  },
  {
    q: 'Êtes-vous assurés ?',
    r: 'Oui, nous sommes couverts par une assurance responsabilité civile professionnelle et une garantie décennale. CPH (Contrôle Provence Habitat) est immatriculée au RNE sous le numéro 933 929 051.',
  },
  {
    q: 'Faut-il être présent le jour de l’intervention ?',
    r: 'Pas nécessairement, dès lors que nous avons accès à la toiture. Vous recevez sous 24h un rapport photo avant/après ainsi qu’un état détaillé de votre toiture.',
  },
  {
    q: 'Puis-je payer après l’intervention ?',
    r: 'Oui. Vous avez le choix entre payer en ligne par carte au moment de la réservation, ou régler le couvreur à la fin de l’intervention par carte, chèque ou espèces.',
  },
]

function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          setCount(Math.floor(progress * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        tick()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

const TEMOIGNAGES = [
  { nom: 'Philippe R.', ville: 'Marseille 13008', note: 5, texte: "Intervention rapide et soign\u00E9e. Le couvreur a d\u00E9tect\u00E9 un probl\u00E8me de fa\u00EEtage que je n'aurais jamais vu. Tr\u00E8s professionnel." },
  { nom: 'Nathalie D.', ville: 'Aix-en-Provence', note: 5, texte: "Mes panneaux sont comme neufs. Le rapport avec photos \u00E9tait tr\u00E8s d\u00E9taill\u00E9. Je recommande les yeux ferm\u00E9s." },
  { nom: 'Marc L.', ville: 'Aubagne', note: 5, texte: "Prix correct, travail impeccable. Le fait que ce soit de vrais couvreurs et pas juste des nettoyeurs fait toute la diff\u00E9rence." },
]

function getLoggedUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const u = JSON.parse(raw)
    if (!u?.role || !u?.email) return null
    const prenom = String(u.nom || '').trim().split(/\s+/)[0] || ''
    const espacePath = u.role === 'admin' ? '/admin'
      : u.role === 'couvreur' ? '/couvreur'
      : u.role === 'client' ? '/client'
      : '/connexion'
    return { ...u, prenom, espacePath }
  } catch {
    return null
  }
}

export default function Landing() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nom: '', tel: '', email: '', adresse: '', ville: '', panneaux: '' })
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [callbackOpen, setCallbackOpen] = useState(false)
  const [loggedUser, setLoggedUser] = useState(() => getLoggedUser())

  const handleLogout = () => {
    try { localStorage.removeItem('user') } catch { /* ignore */ }
    setLoggedUser(null)
  }

  useSeo({
    title: null,
    description: "Nettoyage de panneaux photovoltaïques en région PACA par couvreur certifié. Restaurez jusqu'à 30% de production. Devis gratuit, intervention sous 7 jours, dès 179 € TTC.",
    path: '/',
  })

  // FAQPage JSON-LD : éligible aux rich snippets Google FAQ
  useJsonLd('landing-faq', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, r }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: r },
    })),
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % TEMOIGNAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/reservation')
  }

  return (
    <div style={{overflow:'hidden'}}>
      <SeasonBanner />
      {/* Navbar */}
      <nav className="navbar">
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Link to="/" style={{display:'flex', alignItems:'center', gap: 10}}>
            <div className="nav-logo">
              <Sun size={20} />
            </div>
            <div>
              <span style={{color:'white', fontWeight:700, fontSize:15, display:'block', lineHeight:1.2}}>CPH Solar</span>
              <span style={{color:'rgba(255,255,255,0.4)', fontSize:10, textTransform:'uppercase', letterSpacing:1}}>Nettoyage PACA</span>
            </div>
          </Link>
          <div className="nav-desktop">
            <a href="tel:0412160630" className="nav-phone">
              <Phone size={14} /> 04 12 16 06 30
            </a>
            <Link to="/blog" className="nav-link">
              <BookOpen size={14} /> Blog
            </Link>
            {loggedUser ? (
              <div className="nav-user-group">
                <Link to={loggedUser.espacePath} className="btn btn-primary btn-sm" style={{padding:'9px 20px'}}>
                  <User size={13} /> {loggedUser.prenom ? `Bonjour ${loggedUser.prenom}` : 'Mon espace'}
                </Link>
                <button
                  type="button"
                  className="nav-logout-btn"
                  onClick={handleLogout}
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link to="/connexion" className="btn btn-primary btn-sm" style={{padding:'9px 20px'}}>
                <User size={13} /> Mon espace
              </Link>
            )}
          </div>

          {/* Mobile burger button */}
          <button className="nav-burger" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <>
          <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div className="nav-logo"><Sun size={18} /></div>
                <div>
                  <span style={{color:'white', fontWeight:700, fontSize:14, display:'block'}}>CPH Solar</span>
                  <span style={{color:'rgba(255,255,255,0.4)', fontSize:10, textTransform:'uppercase', letterSpacing:1}}>Nettoyage PACA</span>
                </div>
              </div>
              <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="mobile-menu-nav">
              <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-menu-link">
                Accueil
              </Link>
              <a href="#form-section" onClick={() => { setMenuOpen(false); setTimeout(() => navigate('/devis'), 100) }} className="mobile-menu-link">
                {"R\u00E9server mon nettoyage"}
              </a>
              <Link to="/blog" onClick={() => setMenuOpen(false)} className="mobile-menu-link">
                <BookOpen size={16} /> Blog
              </Link>
              <Link
                to={loggedUser ? loggedUser.espacePath : '/connexion'}
                onClick={() => setMenuOpen(false)}
                className="mobile-menu-link"
              >
                <User size={16} /> {loggedUser?.prenom ? `Bonjour ${loggedUser.prenom}` : 'Mon espace'}
              </Link>
              {loggedUser && (
                <button
                  type="button"
                  className="mobile-menu-link"
                  onClick={() => { handleLogout(); setMenuOpen(false) }}
                  style={{textAlign:'left', background:'none', border:'none', width:'100%', font:'inherit', cursor:'pointer'}}
                >
                  <LogOut size={16} /> Se déconnecter
                </button>
              )}
              <div className="mobile-menu-divider" />
              <Link to="/mentions-legales" onClick={() => setMenuOpen(false)} className="mobile-menu-link-sub">
                {"Mentions l\u00E9gales"}
              </Link>
              <Link to="/confidentialite" onClick={() => setMenuOpen(false)} className="mobile-menu-link-sub">
                {"Politique de confidentialit\u00E9"}
              </Link>
              <Link to="/cgv" onClick={() => setMenuOpen(false)} className="mobile-menu-link-sub">
                CGV
              </Link>
            </div>

            <div className="mobile-menu-footer">
              <a href="tel:0412160630" className="mobile-menu-phone">
                <Phone size={18} /> 04 12 16 06 30
              </a>
              <Link to="/devis" onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'14px'}}>
                {"R\u00E9server \u2014 199\u00A0\u20AC"}
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Hero */}
      <section className="hero-section" id="main-content" tabIndex="-1">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge">
              <Award size={14} /> Couvreurs certifi&eacute;s Qualibat
            </div>
            <h1>
              Nettoyage<br />
              panneaux solaires<br />
              <span>en r&eacute;gion PACA</span>
            </h1>
            <p className="subtitle">
              Intervention par des couvreurs professionnels.
              Inspection compl&egrave;te de votre toiture incluse avec rapport photo d&eacute;taill&eacute;.
            </p>
            <div className="hero-price-block">
              <div className="hero-price-tag">
                <span className="hero-price-amount">199&euro;</span>
                <span className="hero-price-label">TTC / intervention</span>
              </div>
              <div className="hero-price-includes">
                <div><Check size={14} /> Nettoyage complet</div>
                <div><Check size={14} /> Inspection toiture</div>
                <div><Check size={14} /> Rapport photos</div>
              </div>
            </div>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/devis')}>
                {"R\u00E9server mon intervention"} <ArrowRight size={16} />
              </button>
              <a href="tel:0412160630" className="btn btn-outline-white btn-lg">
                <Phone size={16} /> Appeler
              </a>
            </div>
          </div>
        </div>

        {/* Floating stats */}
        <div className="hero-floating-stats">
          <div className="floating-stat">
            <span className="floating-stat-value"><AnimatedCounter end={2600} suffix="h" /></span>
            <span className="floating-stat-label">d'ensoleillement/an en PACA</span>
          </div>
          <div className="floating-stat-divider"></div>
          <div className="floating-stat">
            <span className="floating-stat-value"><AnimatedCounter end={20} suffix="%" /></span>
            <span className="floating-stat-label">de rendement perdu si sale</span>
          </div>
          <div className="floating-stat-divider"></div>
          <div className="floating-stat">
            <span className="floating-stat-value"><AnimatedCounter end={48} suffix="h" /></span>
            <span className="floating-stat-label">pour recevoir votre rapport</span>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="trust-bar">
        <div className="trust-items">
          <div className="trust-item"><Award size={16} /> Qualibat</div>
          <div className="trust-item"><Shield size={16} /> D&eacute;cennale</div>
          <div className="trust-item"><Star size={16} /> 4.8/5 Google</div>
          <div className="trust-item"><MapPin size={16} /> Toute la r&eacute;gion PACA</div>
          <div className="trust-item"><Clock size={16} /> 15 jours max</div>
        </div>
      </div>

      {/* Process */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Notre m&eacute;thode</span>
          <h2>Un processus simple et rigoureux</h2>
          <p>De la r&eacute;servation au rapport, tout est pens&eacute; pour vous simplifier la vie.</p>
        </div>
        <div className="process-grid container">
          {[
            { icon: <Zap size={24}/>, num: '01', title: 'R\u00E9servation en ligne', desc: 'Choisissez un cr\u00E9neau adapt\u00E9 \u00E0 votre secteur. Nous regroupons les interventions par zone.' },
            { icon: <Droplets size={24}/>, num: '02', title: 'Nettoyage professionnel', desc: 'Eau pure d\u00E9min\u00E9ralis\u00E9e, sans produit chimique. S\u00E9chage sans trace garanti.' },
            { icon: <Shield size={24}/>, num: '03', title: 'Inspection toiture', desc: 'Notre couvreur v\u00E9rifie fa\u00EEtage, rives, tuiles et \u00E9tanch\u00E9it\u00E9. C\u2019est notre m\u00E9tier.' },
            { icon: <FileCheck size={24}/>, num: '04', title: 'Rapport d\u00E9taill\u00E9', desc: 'Photos avant/apr\u00E8s, \u00E9tat de la couverture, recommandations. Re\u00E7u sous 48h.' },
          ].map((step, i) => (
            <div key={i} className="process-card">
              <div className="process-num">{step.num}</div>
              <div className="process-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before/After */}
      <section className="section section-dark">
        <div className="section-header">
          <span className="section-tag section-tag-light">R&eacute;sultats</span>
          <h2 style={{color:'white'}}>Avant / Apr&egrave;s</h2>
          <p style={{color:'rgba(255,255,255,0.5)'}}>La diff&eacute;rence est visible &agrave; l'&oelig;il nu et mesurable sur votre production.</p>
        </div>
        <div className="container">
          <div className="ba-grid">
            <div className="ba-card">
              <div className="ba-image ba-before">
                <span className="ba-label">AVANT</span>
                <div className="ba-placeholder">
                  <Sun size={40} style={{opacity:0.3}} />
                  <span>Panneaux encras&eacute;s</span>
                  <span className="ba-stat">-15% rendement</span>
                </div>
              </div>
            </div>
            <div className="ba-card">
              <div className="ba-image ba-after">
                <span className="ba-label ba-label-green">APR&Egrave;S</span>
                <div className="ba-placeholder ba-placeholder-clean">
                  <Sun size={40} />
                  <span>Panneaux nettoy&eacute;s</span>
                  <span className="ba-stat ba-stat-green">100% rendement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Notre diff&eacute;rence</span>
          <h2>Couvreurs, pas nettoyeurs</h2>
          <p>Nous ne sommes pas des auto-entrepreneurs avec une perche. Nous sommes des couvreurs certifi&eacute;s.</p>
        </div>
        <div className="container">
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon"><Award size={28} /></div>
              <h3>Certifi&eacute;s Qualibat</h3>
              <p>Assurance d&eacute;cennale, qualification reconnue. Votre garantie d'un travail dans les r&egrave;gles.</p>
            </div>
            <div className="why-card why-card-highlight">
              <div className="why-icon"><Shield size={28} /></div>
              <h3>Inspection offerte</h3>
              <p>On monte sur votre toit tous les jours. On sait rep&eacute;rer un fa&icirc;tage ouvert ou une rive fissur&eacute;e.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><FileCheck size={28} /></div>
              <h3>Rapport complet</h3>
              <p>Photos avant/apr&egrave;s, &eacute;tat de chaque &eacute;l&eacute;ment de couverture, recommandations claires.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><Zap size={28} /></div>
              <h3>Prix fixe, z&eacute;ro surprise</h3>
              <p>{"199\u00A0\u20AC TTC, point final. Pas de suppl\u00E9ment d\u00E9placement, pas de frais cach\u00E9s."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Temoignages */}
      <section className="section section-gray">
        <div className="section-header">
          <span className="section-tag">Avis clients</span>
          <h2>Ils nous font confiance</h2>
          <p>{"D\u00E9couvrez les retours de nos clients en r\u00E9gion PACA."}</p>
        </div>
        <div className="container" style={{maxWidth:700}}>
          <div className="testimonial-card">
            <div className="testimonial-quote"><Quote size={32} /></div>
            <p className="testimonial-text">{TEMOIGNAGES[activeTestimonial].texte}</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">
                {TEMOIGNAGES[activeTestimonial].nom.charAt(0)}
              </div>
              <div>
                <strong>{TEMOIGNAGES[activeTestimonial].nom}</strong>
                <span>{TEMOIGNAGES[activeTestimonial].ville}</span>
              </div>
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--accent)" color="var(--accent)" />)}
              </div>
            </div>
            <div className="testimonial-dots">
              {TEMOIGNAGES.map((_, i) => (
                <button
                  key={i}
                  className={`testimonial-dot ${i === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="section section-form" id="form-section">
        <div className="container">
          <div className="form-section-grid">
            <div className="form-section-left">
              <span className="section-tag section-tag-light">Intervention</span>
              <h2 style={{color:'white', fontSize:28, fontWeight:700, marginBottom:16}}>
                {"R\u00E9servez votre nettoyage"}
              </h2>
              <p style={{color:'rgba(255,255,255,0.6)', fontSize:14, lineHeight:1.8, marginBottom:32}}>
                {"Remplissez le formulaire, nous vous proposons un cr\u00E9neau adapt\u00E9 \u00E0 votre secteur g\u00E9ographique. R\u00E9ponse sous 24h."}
              </p>
              <div className="form-section-features">
                <div><Check size={16} /> <span>Nettoyage complet &agrave; l'eau pure</span></div>
                <div><Check size={16} /> <span>Inspection toiture offerte</span></div>
                <div><Check size={16} /> <span>Rapport d&eacute;taill&eacute; avec photos</span></div>
                <div><Check size={16} /> <span>Couvreur certifi&eacute; Qualibat</span></div>
                <div><Check size={16} /> <span>Paiement &agrave; l'intervention</span></div>
              </div>
              <div style={{marginTop:32}}>
                <div className="form-price-big">199&euro; <span>TTC</span></div>
                <p style={{color:'rgba(255,255,255,0.4)', fontSize:12}}>Tout compris, sans surprise</p>
              </div>
            </div>

            <div className="form-card">
              <h3>Demandez votre intervention</h3>
              <p className="form-sub">{"R\u00E9ponse sous 24h \u2014 Paiement \u00E0 l\u2019intervention"}</p>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="input-group">
                    <label>Nom</label>
                    <input type="text" placeholder="Votre nom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>{"T\u00E9l\u00E9phone"}</label>
                    <input type="tel" placeholder="06 00 00 00 00" value={form.tel} onChange={e => setForm({...form, tel: e.target.value})} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" placeholder="votre@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Adresse</label>
                  <input type="text" placeholder={"Votre adresse compl\u00E8te"} value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Ville</label>
                    <select value={form.ville} onChange={e => setForm({...form, ville: e.target.value})}>
                      <option value="">{"S\u00E9lectionnez"}</option>
                      <option>Marseille</option>
                      <option>Aix-en-Provence</option>
                      <option>Aubagne</option>
                      <option>La Ciotat</option>
                      <option>Martigues</option>
                      <option>Salon-de-Provence</option>
                      <option>Istres</option>
                      <option>Arles</option>
                      <option>Vitrolles</option>
                      <option>Gardanne</option>
                      <option>Autre (13)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Nombre de panneaux</label>
                    <select value={form.panneaux} onChange={e => setForm({...form, panneaux: e.target.value})}>
                      <option value="">{"S\u00E9lectionnez"}</option>
                      <option>6 - 10 panneaux</option>
                      <option>10 - 16 panneaux</option>
                      <option>16 - 24 panneaux</option>
                      <option>24+ panneaux</option>
                      <option>Je ne sais pas</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'16px', fontSize:'15px'}}>
                  {"R\u00E9server \u2014 199\u00A0\u20AC TTC"} <ArrowRight size={16} />
                </button>
                <p style={{fontSize:11, color:'var(--gray-400)', textAlign:'center'}}>
                  {"Paiement \u00E0 l\u2019intervention uniquement. Aucun engagement."}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Zone */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Zone d'intervention</span>
          <h2>Toute la r&eacute;gion PACA</h2>
          <p>Nous intervenons sur les 6 d&eacute;partements : 04, 05, 06, 13, 83 et 84.</p>
        </div>
        <div className="container">
          <div className="zone-grid">
            {[
              { ville: 'Marseille', cp: '13' },
              { ville: 'Aix-en-Provence', cp: '13' },
              { ville: 'Aubagne', cp: '13' },
              { ville: 'Toulon', cp: '83' },
              { ville: 'Hy\u00E8res', cp: '83' },
              { ville: 'Fr\u00E9jus', cp: '83' },
              { ville: 'Nice', cp: '06' },
              { ville: 'Cannes', cp: '06' },
              { ville: 'Antibes', cp: '06' },
              { ville: 'Avignon', cp: '84' },
              { ville: 'Digne-les-Bains', cp: '04' },
              { ville: 'Gap', cp: '05' },
            ].map((z, i) => (
              <div key={i} className="zone-chip">
                <MapPin size={14} />
                <span className="zone-ville">{z.ville}</span>
                <span className="zone-cp">{z.cp}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Vos panneaux m&eacute;ritent un professionnel</h2>
          <p>{"Un panneau propre produit jusqu\u2019\u00E0 20% d\u2019\u00E9nergie en plus. R\u00E9servez votre intervention."}</p>
          <div style={{display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap'}}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/devis')}>
              {"R\u00E9server \u2014 199\u00A0\u20AC"} <ArrowRight size={16} />
            </button>
            <a href="tel:0412160630" className="btn btn-outline-white btn-lg">
              <Phone size={16} /> 04 12 16 06 30
            </a>
          </div>
        </div>
      </section>

      {/* Calculateur ROI */}
      <RoiCalculator />

      {/* Démo avant / après */}
      <section className="landing-ba-section">
        <div className="container">
          <div className="landing-ba-head">
            <span className="landing-ba-eyebrow">D&eacute;monstration</span>
            <h2>L&rsquo;effet visible d&rsquo;un nettoyage CPH</h2>
            <p>
              Glissez le curseur de gauche &agrave; droite pour comparer un panneau encrass&eacute;
              en r&eacute;gion PACA et le m&ecirc;me panneau apr&egrave;s notre intervention.
            </p>
          </div>
          <div className="landing-ba-frame">
            <BeforeAfterSlider
              beforeSrc="/photos/avant-mock.svg"
              afterSrc="/photos/apres-mock.svg"
              beforeAlt="Panneaux solaires encrass&eacute;s par la poussi&egrave;re et le pollen"
              afterAlt="Panneaux solaires propres et brillants apr&egrave;s nettoyage CPH"
            />
          </div>
          <div className="landing-ba-note">
            <strong>+15 &agrave; 25%</strong> de production retrouv&eacute;e en moyenne sur des panneaux qui n&rsquo;avaient pas &eacute;t&eacute; nettoy&eacute;s depuis 2 ans.
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div className="faq-head">
            <span className="faq-eyebrow">Questions fr&eacute;quentes</span>
            <h2>Tout ce qu&rsquo;il faut savoir avant de r&eacute;server</h2>
          </div>
          <div className="faq-list">
            {FAQ.map(({ q, r }, i) => (
              <details key={i} className="faq-item">
                <summary>
                  <span>{q}</span>
                  <span className="faq-toggle" aria-hidden="true">+</span>
                </summary>
                <p>{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bouton rappel flottant + modal */}
      <CallbackFab onClick={() => setCallbackOpen(true)} />
      {callbackOpen && <CallbackModal onClose={() => setCallbackOpen(false)} context="landing" />}

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <NewsletterSignup />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:12}}>
                <div className="nav-logo"><Sun size={18} /></div>
                <strong style={{color:'white', fontSize:14}}>CPH Solar</strong>
              </div>
              <p>Entreprise de couverture certifi&eacute;e Qualibat.</p>
              <p style={{marginTop:8}}>168 rue du dirigeable<br />ZI Les Paluds, 13400 Aubagne</p>
            </div>
            <div>
              <h4 style={{color:'white', fontSize:13, fontWeight:700, marginBottom:12}}>Services</h4>
              <p><a href="#">Nettoyage panneaux solaires</a></p>
              <p><a href="#">Inspection toiture</a></p>
              <p><Link to="/blog">Blog</Link></p>
              <p><Link to="/a-propos">À propos</Link></p>
              <p><Link to="/tarifs">Tarifs</Link></p>
            </div>
            <div>
              <h4 style={{color:'white', fontSize:13, fontWeight:700, marginBottom:12}}>Contact</h4>
              <p><a href="tel:0412160630">04 12 16 06 30</a></p>
              <p><a href="mailto:contact@cphpaca.fr">contact@cphpaca.fr</a></p>
              <p style={{marginTop:8}}>Lun-Ven, 8h-18h</p>
            </div>
            <div>
              <h4 style={{color:'white', fontSize:13, fontWeight:700, marginBottom:12}}>{"L\u00E9gal"}</h4>
              <p><Link to="/mentions-legales">{"Mentions l\u00E9gales"}</Link></p>
              <p><Link to="/confidentialite">{"Politique de confidentialit\u00E9"}</Link></p>
              <p><Link to="/cgv">CGV</Link></p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{"© 2026 Contr\u00F4le Provence Habitat. Tous droits r\u00E9serv\u00E9s."}</p>
            <CookieReopenLink />
          </div>
        </div>
      </footer>
    </div>
  )
}
