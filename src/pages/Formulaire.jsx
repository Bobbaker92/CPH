import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Sun, Home, Layers, MapPin, User, Phone, Check, Shield, Building, Building2, HelpCircle, PanelTop, Grid3x3 } from 'lucide-react'
import CallbackModal from '../components/CallbackModal'
import { addDemande } from '../lib/demandesStore'
import useSeo from '../lib/useSeo'

const ETAPES = [
  { id: 'panneaux', label: 'Panneaux', icon: Sun },
  { id: 'maison', label: 'Maison', icon: Home },
  { id: 'toiture', label: 'Toiture', icon: Layers },
  { id: 'localisation', label: 'Localisation', icon: MapPin },
  { id: 'coordonnees', label: 'Contact', icon: User },
]

// PACA : 04, 05, 06, 13, 83, 84
const DEPTS_PACA = ['04', '05', '06', '13', '83', '84']

const VILLES_PACA = [
  // 13 Bouches-du-Rh\u00F4ne
  'Aix-en-Provence', 'Arles', 'Aubagne', 'La Ciotat', 'Fos-sur-Mer', 'Gardanne',
  'Istres', 'Marignane', 'Marseille', 'Martigues', 'Salon-de-Provence', 'Vitrolles',
  // 83 Var
  'Toulon', 'La Seyne-sur-Mer', 'Hy\u00E8res', 'Fr\u00E9jus', 'Draguignan', 'La Garde',
  'Saint-Rapha\u00EBl', 'Six-Fours-les-Plages', 'La Valette-du-Var', 'Ollioules',
  // 06 Alpes-Maritimes
  'Nice', 'Antibes', 'Cannes', 'Grasse', 'Cagnes-sur-Mer', 'Le Cannet',
  'Saint-Laurent-du-Var', 'Menton', 'Mougins', 'Vence',
  // 84 Vaucluse
  'Avignon', 'Carpentras', 'Orange', 'Cavaillon', 'Pertuis', 'Le Pontet', 'Sorgues',
  // 04 Alpes-de-Haute-Provence
  'Manosque', 'Digne-les-Bains', 'Sisteron', 'Forcalquier',
  // 05 Hautes-Alpes
  'Gap', 'Brian\u00E7on', 'Embrun',
]

function ChoiceCard({ selected, onClick, icon, label, description, visual }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`choice-card ${visual ? 'choice-card-visual' : ''} ${selected ? 'selected' : ''}`}
    >
      {visual && <div className="choice-visual">{visual}</div>}
      {!visual && icon && <div className="choice-icon">{icon}</div>}
      <div className="choice-text">
        <span className="choice-label">{label}</span>
        {description && <span className="choice-desc">{description}</span>}
      </div>
      {selected && <div className="choice-check"><Check size={16} /></div>}
    </button>
  )
}

// Photos de tuiles
const TileVisuals = {
  canal: <img loading="lazy" decoding="async" src="/tuiles/canal.webp" alt="Tuile canal" />,
  romane: <img loading="lazy" decoding="async" src="/tuiles/romane.webp" alt="Tuile romane" />,
  redland: <img loading="lazy" decoding="async" src="/tuiles/redland.webp" alt="Tuile Redland" />,
  plate: <img loading="lazy" decoding="async" src="/tuiles/plate.webp" alt="Tuile plate" />,
  mecanique: <img loading="lazy" decoding="async" src="/tuiles/romane.webp" alt="Tuile m\u00E9canique" />,
  bacAcier: <img loading="lazy" decoding="async" src="/tuiles/bac-acier.webp" alt="Bac acier" />,
  autre: (
    <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="unk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e5e7eb"/>
          <stop offset="1" stopColor="#d1d5db"/>
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="url(#unk)"/>
      <circle cx="100" cy="75" r="40" fill="white" opacity="0.7"/>
      <text x="100" y="92" textAnchor="middle" fontSize="56" fontWeight="700" fill="#9ca3af" fontFamily="Poppins, sans-serif">?</text>
    </svg>
  ),
}

function telValide(tel = '') {
  return tel.replace(/\D/g, '').length >= 9
}

function hashTel(tel = '') {
  const digits = tel.replace(/\D/g, '')
  let hash = 0
  for (let i = 0; i < digits.length; i += 1) {
    hash = ((hash * 31) + digits.charCodeAt(i)) >>> 0
  }
  return hash.toString(36)
}

function sessionKeyAbandonFormulaire(tel = '') {
  return `cph_lead_abandon_formulaire_${hashTel(tel)}`
}

const DRAFT_KEY = 'cph_devis_draft_v1'
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 jours

const EMPTY_FORM = {
  panneaux: '',
  etage: '',
  tuile: '',
  integration: '',
  acces: '',
  ville: '',
  codePostal: '',
  nom: '',
  tel: '',
  email: '',
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/**
 * Lit la session client active (localStorage.user) et pré-remplit nom/tel/email
 * si l'utilisateur est connecté en tant que client. Permet à un client existant
 * qui clique "Réserver une nouvelle intervention" de gagner 30 secondes.
 */
function loadClientPrefill() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const user = JSON.parse(raw)
    if (user?.role !== 'client' || !user.email) return null
    return { nom: user.nom || '', email: user.email, tel: user.tel || '' }
  } catch {
    return null
  }
}

function saveDraft(form, step) {
  // On ne sauve que si l'utilisateur a fait au moins 1 choix réel.
  const hasContent = Object.values(form).some((v) => v && String(v).trim())
  if (!hasContent) return
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ form, step, timestamp: Date.now() })
    )
  } catch {
    // localStorage indisponible — pas grave
  }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
}

export default function Formulaire() {
  const navigate = useNavigate()
  const [draftRestored, setDraftRestored] = useState(false)
  const initialDraft = loadDraft()
  const initialPrefill = loadClientPrefill()
  const [step, setStep] = useState(initialDraft?.step ?? 0)

  useSeo({
    title: 'Devis gratuit — Nettoyage de panneaux solaires',
    description: "Obtenez un devis pour le nettoyage de vos panneaux solaires en PACA. 5 questions, 2 minutes. Intervention dès 179 € TTC.",
    path: '/devis',
  })
  const [form, setForm] = useState(() => {
    // Priorité 1 : brouillon en cours (autosave)
    if (initialDraft?.form) return initialDraft.form
    // Priorité 2 : client connecté → pré-remplir nom/tel/email
    if (initialPrefill) return { ...EMPTY_FORM, ...initialPrefill }
    return EMPTY_FORM
  })

  useEffect(() => {
    if (initialDraft) setDraftRestored(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save brouillon à chaque changement (debounced à 400ms)
  useEffect(() => {
    const t = setTimeout(() => saveDraft(form, step), 400)
    return () => clearTimeout(t)
  }, [form, step])
  const [cpLookup, setCpLookup] = useState({ loading: false, error: '', options: [] })
  const [callbackOpen, setCallbackOpen] = useState(false)
  const formRef = useRef(form)
  const stepRef = useRef(step)
  const step5StartRef = useRef(null)
  const submitClickedRef = useRef(false)
  const abandonCapturedRef = useRef(false)

  useEffect(() => {
    formRef.current = form
  }, [form])

  useEffect(() => {
    stepRef.current = step
    if (step === 4) {
      step5StartRef.current = Date.now()
    } else {
      step5StartRef.current = null
    }
  }, [step])

  // Auto-remplissage ville depuis code postal (API geo.api.gouv.fr)
  useEffect(() => {
    const cp = form.codePostal
    if (!/^\d{5}$/.test(cp)) return

    let cancelled = false
    const controller = new AbortController()

    ;(async () => {
      try {
        const r = await fetch(
          `https://geo.api.gouv.fr/communes?codePostal=${cp}&fields=nom,codeDepartement&limit=10`,
          { signal: controller.signal }
        )
        const data = await r.json()
        if (cancelled) return
        if (!Array.isArray(data) || data.length === 0) {
          setCpLookup({ loading: false, error: 'Code postal inconnu', options: [] })
          return
        }
        const communesPaca = data.filter(c => DEPTS_PACA.includes(c.codeDepartement))
        if (communesPaca.length === 0) {
          setCpLookup({ loading: false, error: 'Hors région PACA', options: [] })
          return
        }
        setCpLookup({ loading: false, error: '', options: communesPaca })
        // Si une seule ville, on la sélectionne automatiquement
        if (communesPaca.length === 1) {
          setForm(f => ({ ...f, ville: communesPaca[0].nom }))
        }
      } catch (err) {
        if (!cancelled && err.name !== 'AbortError') {
          setCpLookup({ loading: false, error: 'Erreur de connexion', options: [] })
        }
      }
    })()

    return () => { cancelled = true; controller.abort() }
  }, [form.codePostal])

  useEffect(() => {
    const captureAbandon = () => {
      if (abandonCapturedRef.current) return
      if (submitClickedRef.current) return
      if (stepRef.current !== 4) return
      if (!step5StartRef.current) return

      const duree = Date.now() - step5StartRef.current
      if (duree <= 15000) return

      const valeurs = formRef.current
      if (!telValide(valeurs.tel)) return

      const key = sessionKeyAbandonFormulaire(valeurs.tel)
      if (sessionStorage.getItem(key)) return

      addDemande({
        nom: valeurs.nom || '—',
        tel: valeurs.tel || '—',
        email: valeurs.email || '—',
        ville: valeurs.ville || '—',
        adresse: valeurs.adresse || '—',
        panneaux: valeurs.panneaux || '—',
        tuile: valeurs.tuile || '—',
        integration: valeurs.integration || 'unknown',
        etage: valeurs.etage || '—',
        source: 'Formulaire abandonné',
        notes: 'A rempli 5 étapes sur 5 puis quitté sans valider.',
      })
      sessionStorage.setItem(key, '1')
      abandonCapturedRef.current = true
    }

    const onPageHide = () => {
      captureAbandon()
    }

    window.addEventListener('pagehide', onPageHide)

    return () => {
      window.removeEventListener('pagehide', onPageHide)
      captureAbandon()
    }
  }, [])

  const emailValide = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || '').trim())

  const canNext = () => {
    switch (step) {
      case 0: return !!form.panneaux
      case 1: return !!form.etage && !!form.acces
      case 2: return !!form.tuile && !!form.integration
      case 3: return !!form.ville && !!form.codePostal
      case 4: return !!form.nom && !!form.tel && emailValide(form.email)
      default: return false
    }
  }

  const missingMessage = () => {
    switch (step) {
      case 0: return form.panneaux ? '' : 'Choisissez le nombre de panneaux'
      case 1:
        if (!form.etage) return 'Choisissez le type de maison'
        if (!form.acces) return 'Pr\u00E9cisez l\u2019acc\u00E8s au toit'
        return ''
      case 2:
        if (!form.tuile) return 'Choisissez le type de tuile'
        if (!form.integration) return 'Pr\u00E9cisez la pose des panneaux'
        return ''
      case 3:
        if (!form.codePostal) return 'Renseignez votre code postal'
        if (!form.ville) return 'Renseignez votre ville'
        return ''
      case 4:
        if (!form.nom) return 'Renseignez votre nom'
        if (!form.tel) return 'Renseignez votre t\u00E9l\u00E9phone'
        if (!form.email) return 'Renseignez votre email pour recevoir la confirmation'
        if (!emailValide(form.email)) return 'Adresse email invalide'
        return ''
      default: return ''
    }
  }

  const handleNext = () => {
    if (!canNext()) return
    if (step < ETAPES.length - 1) setStep(step + 1)
    else {
      if (submitClickedRef.current) return
      submitClickedRef.current = true

      addDemande({
        nom: form.nom,
        tel: form.tel,
        email: form.email,
        ville: form.ville,
        adresse: form.adresse || '—',
        panneaux: form.panneaux,
        tuile: form.tuile,
        integration: form.integration,
        etage: form.etage,
        source: 'Formulaire',
      })
      clearDraft() // funnel terminé → on supprime le brouillon
      navigate('/reservation', { state: { devis: form } })
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
    else navigate('/')
  }

  const progress = ((step + 1) / ETAPES.length) * 100

  return (
    <div className="funnel-page">
      <h1 className="sr-only">Devis nettoyage de panneaux solaires en r&eacute;gion PACA</h1>
      {/* Header */}
      <div className="funnel-header">
        <div className="funnel-header-inner">
          <button className="funnel-back" onClick={handleBack}>
            <ChevronLeft size={20} />
          </button>
          <div className="funnel-header-center">
            <span className="funnel-step-label">
              {`\u00C9tape ${step + 1} sur ${ETAPES.length}`}
            </span>
            <span className="funnel-step-title">{ETAPES[step].label}</span>
          </div>
          <div style={{width:40}} />
        </div>
        <div className="funnel-progress">
          <div className="funnel-progress-bar" style={{width:`${progress}%`}} />
        </div>
      </div>

      {/* Bandeau brouillon restauré */}
      {draftRestored && (
        <div className="funnel-draft-banner" role="status" aria-live="polite">
          <span>
            <strong>Brouillon restauré.</strong> Vos réponses précédentes sont pré-remplies.
          </span>
          <button
            type="button"
            className="funnel-draft-banner-btn"
            onClick={() => {
              clearDraft()
              setForm(EMPTY_FORM)
              setStep(0)
              setDraftRestored(false)
            }}
          >
            Recommencer à zéro
          </button>
        </div>
      )}

      {/* Steps indicator */}
      <div className="funnel-steps">
        {ETAPES.map((e, i) => (
          <div key={e.id} className={`funnel-step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            {i < step ? <Check size={14} /> : <e.icon size={14} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="funnel-content">

        {/* Etape 1: Panneaux */}
        {step === 0 && (
          <div className="funnel-step-content">
            <h2>Combien de panneaux avez-vous ?</h2>
            <p>{"Pas besoin d\u2019\u00EAtre pr\u00E9cis, une estimation suffit."}</p>
            <div className="choice-grid">
              {[
                { val: '6-10', label: '6 \u00E0 10', desc: 'Petite installation (3 kWc)', icon: <Sun size={22} /> },
                { val: '10-16', label: '10 \u00E0 16', desc: 'Installation moyenne (6 kWc)', icon: <Sun size={22} /> },
                { val: '16-24', label: '16 \u00E0 24', desc: 'Grande installation (9 kWc)', icon: <Sun size={22} /> },
                { val: '24+', label: '24 ou plus', desc: 'Tr\u00E8s grande installation', icon: <Sun size={22} /> },
                { val: 'unknown', label: 'Je ne sais pas', desc: 'On verra sur place', icon: <HelpCircle size={22} /> },
              ].map(opt => (
                <ChoiceCard
                  key={opt.val}
                  selected={form.panneaux === opt.val}
                  onClick={() => setForm({...form, panneaux: opt.val})}
                  icon={opt.icon}
                  label={opt.label}
                  description={opt.desc}
                />
              ))}
            </div>
          </div>
        )}

        {/* Etape 2: Maison */}
        {step === 1 && (
          <div className="funnel-step-content">
            <h2>Quel type de maison ?</h2>
            <p>{"Cela nous aide \u00E0 pr\u00E9parer le mat\u00E9riel adapt\u00E9."}</p>
            <div className="choice-grid">
              {[
                { val: 'plain-pied', label: 'Plain-pied', desc: 'Sans \u00E9tage', icon: <Home size={22} /> },
                { val: 'etage', label: '\u00C0 \u00E9tage', desc: 'R+1 ou plus', icon: <Building size={22} /> },
                { val: 'immeuble', label: 'Petit immeuble', desc: 'R+2 maximum', icon: <Building2 size={22} /> },
              ].map(opt => (
                <ChoiceCard
                  key={opt.val}
                  selected={form.etage === opt.val}
                  onClick={() => setForm({...form, etage: opt.val})}
                  icon={opt.icon}
                  label={opt.label}
                  description={opt.desc}
                />
              ))}
            </div>

            <h3 style={{marginTop:32, fontSize:16, fontWeight:600, color:'var(--primary)'}}>
              {"Acc\u00E8s au toit"}
            </h3>
            <div className="choice-grid" style={{marginTop:12}}>
              {[
                { val: 'facile', label: 'Facile', desc: 'Acc\u00E8s d\u00E9gag\u00E9, terrain plat' },
                { val: 'moyen', label: 'Moyen', desc: 'Jardin, passage \u00E9troit' },
                { val: 'difficile', label: 'Difficile', desc: 'Pente, v\u00E9g\u00E9tation dense' },
                { val: 'unknown', label: 'Je ne sais pas', desc: '' },
              ].map(opt => (
                <ChoiceCard
                  key={opt.val}
                  selected={form.acces === opt.val}
                  onClick={() => setForm({...form, acces: opt.val})}
                  icon={<Home size={20} />}
                  label={opt.label}
                  description={opt.desc}
                />
              ))}
            </div>
          </div>
        )}

        {/* Etape 3: Toiture */}
        {step === 2 && (
          <div className="funnel-step-content">
            <h2>Quel type de tuiles ?</h2>
            <p>{"Si vous n\u2019\u00EAtes pas s\u00FBr, choisissez celle qui ressemble le plus."}</p>
            <div className="choice-grid choice-grid-4">
              {[
                { val: 'canal', label: 'Tuile canal', desc: 'Traditionnelle du Sud', visual: TileVisuals.canal },
                { val: 'romane', label: 'Tuile romane', desc: 'La plus courante en PACA', visual: TileVisuals.romane },
                { val: 'redland', label: 'Tuile Redland', desc: 'Tuile béton, surface lisse', visual: TileVisuals.redland },
                { val: 'plate', label: 'Tuile plate', desc: 'Plate et rectangulaire', visual: TileVisuals.plate },
                { val: 'bac-acier', label: 'Bac acier', desc: 'Tôle ondulée métallique', visual: TileVisuals.bacAcier },
                { val: 'autre', label: 'Autre / Je ne sais pas', desc: '', visual: TileVisuals.autre },
              ].map(opt => (
                <ChoiceCard
                  key={opt.val}
                  selected={form.tuile === opt.val}
                  onClick={() => setForm({...form, tuile: opt.val})}
                  visual={opt.visual}
                  label={opt.label}
                  description={opt.desc}
                />
              ))}
            </div>

            <h3 style={{marginTop:32, fontSize:16, fontWeight:600, color:'var(--primary)'}}>
              {"Comment sont pos\u00E9s les panneaux ?"}
            </h3>
            <p style={{fontSize:13, color:'var(--gray-500)', marginTop:4, marginBottom:12}}>
              {"Cela d\u00E9termine la technique de nettoyage et l\u2019inspection \u00E9tanch\u00E9it\u00E9 associ\u00E9e."}
            </p>
            <div className="choice-grid">
              {[
                { val: 'surimposition', label: 'Surimposition', desc: 'Pos\u00E9s sur la toiture, au-dessus des tuiles', icon: <PanelTop size={22} /> },
                { val: 'integre', label: 'Int\u00E9gr\u00E9s \u00E0 la toiture', desc: 'IAB — remplacent les tuiles, affleurent la toiture', icon: <Grid3x3 size={22} /> },
                { val: 'unknown', label: 'Je ne sais pas', desc: 'On v\u00E9rifiera sur place', icon: <HelpCircle size={22} /> },
              ].map(opt => (
                <ChoiceCard
                  key={opt.val}
                  selected={form.integration === opt.val}
                  onClick={() => setForm({...form, integration: opt.val})}
                  icon={opt.icon}
                  label={opt.label}
                  description={opt.desc}
                />
              ))}
            </div>
          </div>
        )}

        {/* Etape 4: Localisation */}
        {step === 3 && (
          <div className="funnel-step-content">
            <h2>{"O\u00F9 se situe votre maison ?"}</h2>
            <p>{"Nous intervenons dans toute la r\u00E9gion PACA (04, 05, 06, 13, 83, 84)."}</p>

            <div className="city-form">
              <div className="input-group">
                <label>Code postal</label>
                <input
                  type="text"
                  placeholder={"Ex\u00A0: 13400, 83000, 06000\u2026"}
                  value={form.codePostal}
                  onChange={e => setForm({...form, codePostal: e.target.value.replace(/\D/g,'').slice(0,5)})}
                  maxLength={5}
                  inputMode="numeric"
                />
                {cpLookup.loading && (
                  <span className="cp-hint">{"Recherche\u2026"}</span>
                )}
                {cpLookup.error && !cpLookup.loading && form.codePostal.length === 5 && (
                  <span className="cp-hint cp-hint-error">{cpLookup.error}</span>
                )}
              </div>

              <div className="input-group">
                <label>Ville</label>
                <div className="city-input-wrapper">
                  <MapPin size={18} className="city-input-icon" />
                  <input
                    type="text"
                    list="villes-13"
                    placeholder="Tapez votre ville"
                    value={form.ville}
                    onChange={e => setForm({...form, ville: e.target.value})}
                    className="city-input"
                    autoComplete="off"
                  />
                </div>
                <datalist id="villes-13">
                  {VILLES_PACA.map(v => <option key={v} value={v} />)}
                </datalist>
              </div>
            </div>

            {/* Si plusieurs villes correspondent, proposer le choix */}
            {cpLookup.options.length > 1 && (
              <div className="cp-options">
                <span className="cp-options-label">
                  {cpLookup.options.length} villes correspondent \u00E0 ce code postal\u00A0:
                </span>
                <div className="city-chips">
                  {cpLookup.options.map(c => (
                    <button
                      key={c.nom}
                      type="button"
                      className={`city-chip ${form.ville === c.nom ? 'active' : ''}`}
                      onClick={() => setForm({...form, ville: c.nom})}
                    >
                      {c.nom}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="city-popular">
              <span className="city-popular-label">{"Villes les plus fr\u00E9quentes :"}</span>
              <div className="city-chips">
                {['Marseille', 'Aix-en-Provence', 'Toulon', 'Nice', 'Avignon', 'Aubagne', 'Cannes', 'Hy\u00E8res'].map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`city-chip ${form.ville === v ? 'active' : ''}`}
                    onClick={() => setForm({...form, ville: v})}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="city-note">
              <Shield size={14} />
              <span>{"Toute la r\u00E9gion PACA est couverte. Si vous avez un doute, appelez-nous au 04 12 16 06 30."}</span>
            </div>
          </div>
        )}

        {/* Etape 5: Coordonnees */}
        {step === 4 && (
          <div className="funnel-step-content">
            <h2>Vos coordonn&eacute;es</h2>
            <p>{"Pour vous recontacter et confirmer votre cr\u00E9neau."}</p>

            <div className="funnel-form">
              <div className="input-group">
                <label>Nom complet *</label>
                <input
                  type="text"
                  placeholder="Jean-Pierre Martin"
                  value={form.nom}
                  onChange={e => setForm({...form, nom: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>{"T\u00E9l\u00E9phone *"}</label>
                <input
                  type="tel"
                  placeholder="06 00 00 00 00"
                  value={form.tel}
                  onChange={e => setForm({...form, tel: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>

            {/* Recap */}
            <div className="funnel-recap">
              <h3>{"R\u00E9capitulatif"}</h3>
              <div className="recap-grid">
                <div className="recap-item">
                  <span className="recap-label">Panneaux</span>
                  <span className="recap-value">{form.panneaux || '-'}</span>
                </div>
                <div className="recap-item">
                  <span className="recap-label">Maison</span>
                  <span className="recap-value">{form.etage || '-'}</span>
                </div>
                <div className="recap-item">
                  <span className="recap-label">Tuiles</span>
                  <span className="recap-value">{form.tuile || '-'}</span>
                </div>
                <div className="recap-item">
                  <span className="recap-label">Pose</span>
                  <span className="recap-value">{form.integration === 'surimposition' ? 'Surimposition' : form.integration === 'integre' ? 'Int\u00E9gr\u00E9s' : form.integration === 'unknown' ? 'Inconnu' : '-'}</span>
                </div>
                <div className="recap-item">
                  <span className="recap-label">Ville</span>
                  <span className="recap-value">{form.ville || '-'}</span>
                </div>
              </div>
              <div className="recap-price">
                <div>
                  <span className="recap-price-amount">{"199\u00A0\u20AC"}</span>
                  <span className="recap-price-label">TTC tout compris</span>
                </div>
                <div className="recap-includes">
                  <span><Check size={12} /> Nettoyage</span>
                  <span><Check size={12} /> Inspection</span>
                  <span><Check size={12} /> Rapport photo</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="funnel-bottom">
        <div className="funnel-bottom-inner">
          {step > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleBack}>
              <ChevronLeft size={16} /> Retour
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!canNext()}
            style={{
              flex:1, justifyContent:'center', padding:'16px 24px',
              opacity: canNext() ? 1 : 0.4,
            }}
          >
            {step === ETAPES.length - 1 ? (
              <>{"Choisir mon cr\u00E9neau"} <ChevronRight size={16} /></>
            ) : (
              <>Continuer <ChevronRight size={16} /></>
            )}
          </button>
        </div>
        {!canNext() && missingMessage() ? (
          <p className="funnel-bottom-note funnel-bottom-error">
            {missingMessage()}
          </p>
        ) : (
          <p className="funnel-bottom-note">
            <Shield size={12} /> {"Paiement \u00E0 l\u2019intervention uniquement. Aucun engagement."}
          </p>
        )}
        <p className="funnel-bottom-alt">
          Pas s&ucirc;r ? <button type="button" className="funnel-bottom-altbtn" onClick={() => setCallbackOpen(true)}>
            <Phone size={12} /> Je pr&eacute;f&egrave;re &ecirc;tre rappel&eacute;
          </button>
        </p>
      </div>

      {callbackOpen && <CallbackModal onClose={() => setCallbackOpen(false)} context={`devis-etape-${step + 1}`} />}
    </div>
  )
}
