import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronLeft, CreditCard, Calendar, Shield, Check, Lock, Mail, MessageSquare,
  Clock, MapPin, Info, Loader2, Phone
} from 'lucide-react'
import CallbackModal from '../components/CallbackModal'
import { addDemande } from '../lib/demandesStore'
import { addClient } from '../lib/clientsStore'

const JOURS_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt', 'septembre', 'octobre', 'novembre', 'd\u00E9cembre']

function formatDateLisible(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${JOURS_LONG[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
}

function formatCardNumber(v) {
  const digits = v.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(v) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  if (d.length < 3) return d
  return d.slice(0, 2) + ' / ' + d.slice(2)
}

function detectBrand(num) {
  const n = num.replace(/\s/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  return ''
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

function sessionKeyAbandonPaiement(tel = '') {
  return `cph_lead_abandon_paiement_${hashTel(tel)}`
}

export default function Paiement() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}

  // Fallback si on arrive directement sur /paiement
  const prix = state.prix || 199
  const dateStr = state.date || '2026-05-04'
  const creneau = state.creneau || '10h-12h'
  const ville = state.ville || 'Marseille'
  const devis = state.devis || {}
  const clientEmail = devis.email || 'pierre.vidal@free.fr'
  const clientTel = devis.tel || '06 12 34 56 78'
  const clientNom = [devis.prenom, devis.nom].filter(Boolean).join(' ').trim()
  const clientAdresse = devis.adresse || '—'
  const clientPanneaux = devis.panneaux || '—'
  const clientTuile = devis.tuile || '—'
  const clientIntegration = devis.integration || 'unknown'
  const clientEtage = devis.etage || '—'

  const [methode, setMethode] = useState('carte') // 'carte' | 'intervention'
  const [notif, setNotif] = useState({ email: true, sms: false })
  const [card, setCard] = useState({ number: '', exp: '', cvc: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [callbackOpen, setCallbackOpen] = useState(false)
  const submitClickedRef = useRef(false)
  const enterAtRef = useRef(0)
  const abandonCapturedRef = useRef(false)

  useEffect(() => {
    enterAtRef.current = Date.now()
  }, [])

  const brand = useMemo(() => detectBrand(card.number), [card.number])
  const cardComplete = useMemo(() => {
    const num = card.number.replace(/\s/g, '')
    return num.length >= 15 && card.exp.replace(/\D/g, '').length === 4 && card.cvc.length >= 3 && card.name.trim().length > 2
  }, [card])

  const canSubmit = methode === 'intervention' || (methode === 'carte' && cardComplete)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit || loading) return
    submitClickedRef.current = true
    setError('')
    setLoading(true)

    // Simule un appel Stripe
    setTimeout(() => {
      setLoading(false)
      const client = addClient({
        nom: clientNom || devis.nom || '—',
        tel: clientTel,
        email: clientEmail,
        ville,
        adresse: devis.adresse || '—',
      })
      navigate('/confirmation', {
        state: {
          date: dateStr,
          creneau,
          ville,
          prix,
          paiement: methode === 'carte' ? { mode: 'carte', brand, last4: card.number.replace(/\s/g, '').slice(-4) } : { mode: 'intervention' },
          notif,
          email: clientEmail,
          tel: clientTel,
          nom: clientNom,
          clientId: client?.id || null,
        }
      })
    }, 1400)
  }

  useEffect(() => {
    const enteredAt = enterAtRef.current
    const captureAbandon = () => {
      if (abandonCapturedRef.current) return
      if (submitClickedRef.current) return

      const duree = Date.now() - enteredAt
      if (duree <= 20000) return
      if (!telValide(clientTel)) return

      const key = sessionKeyAbandonPaiement(clientTel)
      if (sessionStorage.getItem(key)) return

      const notes = `Arrivé jusqu'à la CB. Créneau choisi : ${dateStr} ${creneau}. N'a pas finalisé.`

      addDemande({
        nom: clientNom || '—',
        tel: clientTel,
        email: clientEmail || '—',
        ville: ville || '—',
        adresse: clientAdresse,
        panneaux: clientPanneaux,
        tuile: clientTuile,
        integration: clientIntegration,
        etage: clientEtage,
        source: 'Paiement abandonné',
        notes,
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
  }, [clientAdresse, clientEmail, clientEtage, clientIntegration, clientNom, clientPanneaux, clientTel, clientTuile, creneau, dateStr, ville])

  return (
    <div className="paiement-page">
      {/* Header */}
      <header className="paiement-header">
        <div className="paiement-header-inner">
          <button className="paiement-back" onClick={() => navigate(-1)} aria-label="Retour">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1>Paiement</h1>
            <span className="paiement-step">&Eacute;tape 3 sur 3</span>
          </div>
        </div>
        <div className="paiement-steps">
          <span className="paiement-stepdot done"><Check size={12} /></span>
          <span className="paiement-stepline done" />
          <span className="paiement-stepdot done"><Check size={12} /></span>
          <span className="paiement-stepline done" />
          <span className="paiement-stepdot active">3</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="paiement-layout">
        {/* Col gauche: formulaire */}
        <div className="paiement-main">
          {/* Méthode de paiement */}
          <section className="paiement-section">
            <h2>Mode de paiement</h2>
            <div className="paiement-methods">
              <label className={`paiement-method ${methode === 'carte' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="methode"
                  value="carte"
                  checked={methode === 'carte'}
                  onChange={() => setMethode('carte')}
                />
                <div className="paiement-method-body">
                  <div className="paiement-method-head">
                    <CreditCard size={18} />
                    <strong>Payer maintenant par carte</strong>
                    <span className="paiement-method-secu"><Lock size={10} /> S&eacute;curis&eacute; Stripe</span>
                  </div>
                  <p>Votre cr&eacute;neau est bloqu&eacute; imm&eacute;diatement. Paiement 100% s&eacute;curis&eacute;.</p>
                  <div className="paiement-cards-logos">
                    <span>VISA</span><span>MC</span><span>AMEX</span>
                  </div>
                </div>
              </label>

              <label className={`paiement-method ${methode === 'intervention' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="methode"
                  value="intervention"
                  checked={methode === 'intervention'}
                  onChange={() => setMethode('intervention')}
                />
                <div className="paiement-method-body">
                  <div className="paiement-method-head">
                    <Clock size={18} />
                    <strong>Payer &agrave; l&apos;intervention</strong>
                    <span className="paiement-method-free">Sans engagement</span>
                  </div>
                  <p>Aucun paiement maintenant. R&egrave;glement sur place (CB, esp&egrave;ces, ch&egrave;que).</p>
                </div>
              </label>
            </div>
          </section>

          {/* Formulaire carte */}
          {methode === 'carte' && (
            <section className="paiement-section paiement-card-section">
              <h2>Informations de carte</h2>
              <div className="paiement-card-form">
                <div className="input-group">
                  <label>Num&eacute;ro de carte</label>
                  <div className={`paiement-input-wrap ${brand ? 'has-brand' : ''}`}>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="1234 1234 1234 1234"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                    />
                    {brand && <span className="paiement-brand">{brand}</span>}
                    {!brand && <CreditCard size={16} className="paiement-input-icon" />}
                  </div>
                </div>

                <div className="paiement-card-row">
                  <div className="input-group">
                    <label>Expiration</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM / AA"
                      value={card.exp}
                      onChange={(e) => setCard({ ...card, exp: formatExpiry(e.target.value) })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Code de s&eacute;curit&eacute;</label>
                    <div className="paiement-input-wrap">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="CVC"
                        maxLength={4}
                        value={card.cvc}
                        onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      />
                      <Lock size={14} className="paiement-input-icon" />
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <label>Nom du titulaire</label>
                  <input
                    type="text"
                    autoComplete="cc-name"
                    placeholder="Nom figurant sur la carte"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="paiement-trust">
                <Lock size={12} />
                <span>Paiement s&eacute;curis&eacute; SSL &mdash; vos donn&eacute;es ne transitent jamais par nos serveurs.</span>
              </div>
            </section>
          )}

          {/* Notifications */}
          <section className="paiement-section">
            <h2>Comment recevoir votre confirmation ?</h2>
            <p className="paiement-section-sub">Vous recevrez votre num&eacute;ro de r&eacute;servation et vos identifiants d&apos;espace client.</p>

            <div className="paiement-notif-options">
              <label className={`paiement-notif ${notif.email ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={notif.email}
                  onChange={(e) => setNotif({ ...notif, email: e.target.checked })}
                />
                <div className="paiement-notif-icon"><Mail size={16} /></div>
                <div className="paiement-notif-body">
                  <strong>Par e-mail</strong>
                  <span>{clientEmail} &mdash; Gratuit, recommand&eacute;</span>
                </div>
                <span className="paiement-notif-tag paiement-notif-tag-free">Gratuit</span>
              </label>

              <label className={`paiement-notif ${notif.sms ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={notif.sms}
                  onChange={(e) => setNotif({ ...notif, sms: e.target.checked })}
                />
                <div className="paiement-notif-icon"><MessageSquare size={16} /></div>
                <div className="paiement-notif-body">
                  <strong>Aussi par SMS</strong>
                  <span>{clientTel} &mdash; Plus rapide pour retrouver le lien</span>
                </div>
                <span className="paiement-notif-tag paiement-notif-tag-offer">Offert</span>
              </label>
            </div>
          </section>
        </div>

        {/* Col droite: récap */}
        <aside className="paiement-side">
          <div className="paiement-recap">
            <h3>R&eacute;capitulatif</h3>

            <div className="paiement-recap-item">
              <span className="paiement-recap-label"><Calendar size={13} /> Cr&eacute;neau</span>
              <div className="paiement-recap-value">
                <strong>{formatDateLisible(dateStr)}</strong>
                <span>{creneau}</span>
              </div>
            </div>
            <div className="paiement-recap-item">
              <span className="paiement-recap-label"><MapPin size={13} /> Zone</span>
              <div className="paiement-recap-value">
                <strong>{ville}</strong>
              </div>
            </div>

            <div className="paiement-recap-sep" />

            <div className="paiement-recap-lines">
              <div><span>Nettoyage panneaux solaires</span><span>{prix}&nbsp;&euro;</span></div>
              <div className="paiement-recap-free">
                <span><Check size={11} /> Inspection toiture</span><span>Offerte</span>
              </div>
              <div className="paiement-recap-free">
                <span><Check size={11} /> Rapport photo</span><span>Offert</span>
              </div>
              {state.estRecommande && (
                <div className="paiement-recap-discount">
                  <span>R&eacute;duction cr&eacute;neau recommand&eacute;</span><span>-20&nbsp;&euro;</span>
                </div>
              )}
            </div>

            <div className="paiement-recap-sep" />

            <div className="paiement-recap-total">
              <div>
                <span>Total TTC</span>
                <span className="paiement-recap-total-note">TVA incluse</span>
              </div>
              <strong>{prix}&nbsp;&euro;</strong>
            </div>

            <button
              type="submit"
              className="btn btn-primary paiement-submit"
              disabled={!canSubmit || loading}
            >
              {loading ? (
                <><Loader2 size={16} className="spin" /> Traitement&hellip;</>
              ) : methode === 'carte' ? (
                <><Lock size={14} /> Payer {prix}&nbsp;&euro; en s&eacute;curit&eacute;</>
              ) : (
                <><Check size={14} /> Confirmer ma r&eacute;servation</>
              )}
            </button>

            {error && <p className="paiement-error">{error}</p>}

            <div className="paiement-trust paiement-trust-side">
              <Shield size={12} />
              <span>
                {methode === 'carte'
                  ? <>Paiement cryptographi&eacute; par <strong>Stripe</strong>. 3-D Secure activ&eacute;.</>
                  : <>Aucune carte requise. Vous payez le jour de l&apos;intervention.</>}
              </span>
            </div>

            <button
              type="button"
              className="paiement-callback-link"
              onClick={() => setCallbackOpen(true)}
            >
              <Phone size={12} /> Je pr&eacute;f&egrave;re &ecirc;tre rappel&eacute;
            </button>
          </div>

          <div className="paiement-note">
            <Info size={12} />
            <span>En validant, vous acceptez nos CGV. Vous pouvez annuler gratuitement jusqu&apos;&agrave; 48h avant l&apos;intervention.</span>
          </div>
        </aside>
      </form>

      {callbackOpen && <CallbackModal onClose={() => setCallbackOpen(false)} context="paiement" />}
    </div>
  )
}
