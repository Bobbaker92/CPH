import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  CheckCircle, Calendar, MapPin, Mail, MessageSquare, Copy, Check, ArrowRight,
  User, Key, Shield, Download, Phone, Sun, Eye, EyeOff
} from 'lucide-react'

const JOURS_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt', 'septembre', 'octobre', 'novembre', 'd\u00E9cembre']
function formatDateLisible(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${JOURS_LONG[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
}

// Génère un ID lisible
function genReservation() {
  const y = new Date().getFullYear()
  const n = Math.floor(1000 + Math.random() * 9000)
  return `CPH-${y}-${n}`
}

// Mot de passe temporaire façon "Adj-Nom-1234"
function genPassword() {
  const words = ['Soleil', 'Toit', 'Azur', 'Mistral', 'Olivier', 'Provence']
  const w = words[Math.floor(Math.random() * words.length)]
  const n = Math.floor(1000 + Math.random() * 9000)
  return `${w}-${n}`
}

export default function Confirmation() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state || {}

  // Fallback
  const dateStr = state.date || '2026-05-04'
  const creneau = state.creneau || '10h-12h'
  const ville = state.ville || 'Marseille'
  const prix = state.prix || 199
  const paiement = state.paiement || { mode: 'intervention' }
  const notif = state.notif || { email: true, sms: false }
  const email = state.email || 'pierre.vidal@free.fr'
  const tel = state.tel || '06 12 34 56 78'

  const [showPwd, setShowPwd] = useState(false)
  const [copied, setCopied] = useState('')

  const [reservationId] = useState(() => genReservation())
  const [password] = useState(() => genPassword())

  const copy = (value, key) => {
    navigator.clipboard?.writeText(value)
    setCopied(key)
    setTimeout(() => setCopied(''), 1800)
  }

  return (
    <div className="confirm-page">
      {/* Hero success */}
      <section className="confirm-hero">
        <div className="confirm-hero-inner">
          <div className="confirm-success-icon">
            <CheckCircle size={36} />
          </div>
          <h1>R&eacute;servation confirm&eacute;e</h1>
          <p>
            Merci ! Votre intervention est bien enregistr&eacute;e.
            {paiement.mode === 'carte'
              ? <> Paiement de <strong>{prix}&nbsp;&euro;</strong> re&ccedil;u par <strong>{paiement.brand || 'carte'}</strong>{paiement.last4 ? <> &mdash; &bull;&bull;&bull;&bull;&nbsp;{paiement.last4}</> : null}.</>
              : <> Vous r&eacute;glerez <strong>{prix}&nbsp;&euro;</strong> le jour de l&apos;intervention.</>}
          </p>

          <div className="confirm-reservation-id">
            <span className="confirm-id-label">N&deg; de r&eacute;servation</span>
            <span className="confirm-id-value">{reservationId}</span>
            <button className="confirm-copy-btn" onClick={() => copy(reservationId, 'id')}>
              {copied === 'id' ? <><Check size={13} /> Copi&eacute;</> : <><Copy size={13} /> Copier</>}
            </button>
          </div>
        </div>
      </section>

      <div className="confirm-body">
        {/* Créneau */}
        <div className="confirm-card">
          <h2>Votre rendez-vous</h2>
          <div className="confirm-rdv">
            <div className="confirm-rdv-date">
              <Calendar size={22} />
              <div>
                <strong>{formatDateLisible(dateStr)}</strong>
                <span>Cr&eacute;neau {creneau}</span>
              </div>
            </div>
            <div className="confirm-rdv-ville">
              <MapPin size={16} />
              <span>{ville}</span>
            </div>
          </div>
          <div className="confirm-rdv-actions">
            <button className="btn btn-sm btn-outline"><Download size={13} /> Ajouter &agrave; mon agenda</button>
            <a href="tel:0412160630" className="btn btn-sm btn-ghost"><Phone size={13} /> Nous contacter</a>
          </div>
        </div>

        {/* Canaux envoyés */}
        <div className="confirm-card">
          <h2>Confirmation envoy&eacute;e</h2>
          <div className="confirm-channels">
            {notif.email && (
              <div className="confirm-channel">
                <div className="confirm-channel-icon"><Mail size={16} /></div>
                <div className="confirm-channel-body">
                  <strong>E-mail envoy&eacute;</strong>
                  <span>Envoy&eacute; &agrave; <em>{email}</em></span>
                </div>
                <span className="badge badge-green">D&eacute;livr&eacute;</span>
              </div>
            )}
            {notif.sms && (
              <div className="confirm-channel">
                <div className="confirm-channel-icon"><MessageSquare size={16} /></div>
                <div className="confirm-channel-body">
                  <strong>SMS envoy&eacute;</strong>
                  <span>Envoy&eacute; au <em>{tel}</em></span>
                </div>
                <span className="badge badge-green">D&eacute;livr&eacute;</span>
              </div>
            )}
            {!notif.email && !notif.sms && (
              <div className="confirm-channel">
                <div className="confirm-channel-icon"><Mail size={16} /></div>
                <div className="confirm-channel-body">
                  <strong>Aucune notification choisie</strong>
                  <span>Vos identifiants sont uniquement affich&eacute;s ci-dessous.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Identifiants espace client */}
        <div className="confirm-card confirm-credentials-card">
          <div className="confirm-card-head">
            <div>
              <h2>Votre espace client</h2>
              <p>Suivez votre intervention, t&eacute;l&eacute;chargez vos photos et votre rapport.</p>
            </div>
            <div className="confirm-card-icon">
              <User size={20} />
            </div>
          </div>

          <div className="confirm-credentials">
            <div className="confirm-credential">
              <div className="confirm-credential-label">
                <Mail size={12} /> Identifiant
              </div>
              <div className="confirm-credential-value">
                <code>{email}</code>
                <button className="icon-btn" onClick={() => copy(email, 'email')} title="Copier">
                  {copied === 'email' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <div className="confirm-credential">
              <div className="confirm-credential-label">
                <Key size={12} /> Mot de passe temporaire
              </div>
              <div className="confirm-credential-value">
                <code>{showPwd ? password : '\u2022'.repeat(password.length)}</code>
                <button className="icon-btn" onClick={() => setShowPwd(s => !s)} title={showPwd ? 'Masquer' : 'Afficher'}>
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button className="icon-btn" onClick={() => copy(password, 'pwd')} title="Copier">
                  {copied === 'pwd' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="confirm-credentials-note">
            <Shield size={12} />
            <span>Ce mot de passe est <strong>temporaire</strong>. Vous pourrez le modifier &agrave; votre premi&egrave;re connexion.</span>
          </div>

          <button className="btn btn-primary confirm-cta" onClick={() => navigate('/client')}>
            Acc&eacute;der &agrave; mon espace client <ArrowRight size={16} />
          </button>
        </div>

        {/* Prochaines étapes */}
        <div className="confirm-card confirm-steps-card">
          <h2>Et maintenant ?</h2>
          <ol className="confirm-steps">
            <li>
              <span className="confirm-step-num">1</span>
              <div>
                <strong>Vous recevez votre confirmation</strong>
                <p>Email{notif.sms ? ' et SMS' : ''} avec tous les d&eacute;tails et vos identifiants.</p>
              </div>
            </li>
            <li>
              <span className="confirm-step-num">2</span>
              <div>
                <strong>Rappel la veille</strong>
                <p>Nous vous confirmons l&apos;heure d&apos;arriv&eacute;e de l&apos;&eacute;quipe 24h avant.</p>
              </div>
            </li>
            <li>
              <span className="confirm-step-num">3</span>
              <div>
                <strong>Intervention + rapport</strong>
                <p>Nettoyage + inspection toiture. Rapport photo envoy&eacute; sous 48h sur votre espace.</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Parrainage */}
        <div className="confirm-card confirm-referral">
          <div className="confirm-referral-icon"><Sun size={22} /></div>
          <div>
            <h3>Parrainez vos voisins, gagnez 30&nbsp;&euro;</h3>
            <p>Pour chaque voisin qui r&eacute;serve via votre lien, nous vous offrons 30&nbsp;&euro; sur votre prochaine intervention.</p>
          </div>
          <Link to="/client/recommander" className="btn btn-sm btn-dark">D&eacute;couvrir</Link>
        </div>
      </div>
    </div>
  )
}
