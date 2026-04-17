import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  CheckCircle, Calendar, MapPin, Mail, MessageSquare, Copy, Check, ArrowRight,
  User, Shield, Download, Phone, Sun, Inbox, ChevronDown, ChevronUp
} from 'lucide-react'
import { createClientAccount } from '../lib/clientAuth'

const JOURS_LONG = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt', 'septembre', 'octobre', 'novembre', 'd\u00E9cembre']
function formatDateLisible(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${JOURS_LONG[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
}

function genReservation() {
  const y = new Date().getFullYear()
  const n = Math.floor(1000 + Math.random() * 9000)
  return `CPH-${y}-${n}`
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

  const [copied, setCopied] = useState('')
  const [showEmailPreview, setShowEmailPreview] = useState(false)

  const [reservationId] = useState(() => genReservation())
  const [accountInfo] = useState(() => createClientAccount({
    email, nom: state.nom || '', tel, reservationId: undefined,
  }))
  const generatedPassword = accountInfo.password
  const accountReused = accountInfo.reused

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

          <div className="confirm-credentials-sent">
            <div className="confirm-credentials-sent-icon"><Mail size={18} /></div>
            <div className="confirm-credentials-sent-body">
              <strong>Vos identifiants viennent d&rsquo;&ecirc;tre envoy&eacute;s &agrave; <em>{email}</em></strong>
              <span>
                {accountReused
                  ? 'Vous avez d\u00E9j\u00E0 un compte avec cette adresse. Utilisez le mot de passe que vous aviez d\u00E9fini.'
                  : 'Ouvrez votre bo\u00EEte mail : vous y trouverez votre email de connexion et un mot de passe. Pensez \u00E0 v\u00E9rifier vos spams si vous ne le voyez pas.'}
              </span>
            </div>
          </div>

          <div className="confirm-credentials-note">
            <Shield size={12} />
            <span>Pour votre s&eacute;curit&eacute;, votre mot de passe n&apos;est <strong>jamais affich&eacute; &agrave; l&apos;&eacute;cran</strong>. Vous pourrez le modifier depuis votre espace client.</span>
          </div>

          <button className="btn btn-primary confirm-cta" onClick={() => navigate('/connexion')}>
            Me connecter &agrave; mon espace <ArrowRight size={16} />
          </button>
        </div>

        {/* Aperçu maquette de l'email — uniquement si nouveau compte */}
        {generatedPassword && (
          <div className="confirm-card confirm-email-preview">
            <button className="confirm-email-preview-head" onClick={() => setShowEmailPreview(s => !s)}>
              <div className="confirm-email-preview-head-left">
                <Inbox size={18} />
                <div>
                  <strong>Aper&ccedil;u de l&rsquo;email envoy&eacute;</strong>
                  <span>D&eacute;mo maquette &mdash; en prod, cet encart dispara&icirc;t</span>
                </div>
              </div>
              {showEmailPreview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showEmailPreview && (
              <div className="confirm-email-preview-body">
                <div className="confirm-email-headers">
                  <div><span>De</span><em>CPH Solar &lt;noreply@cphpaca.fr&gt;</em></div>
                  <div><span>&Agrave;</span><em>{email}</em></div>
                  <div><span>Objet</span><em>Vos identifiants de connexion &mdash; CPH Solar</em></div>
                </div>
                <div className="confirm-email-body-text">
                  <p>Bonjour,</p>
                  <p>Votre intervention est bien confirm&eacute;e. Voici vos identifiants pour acc&eacute;der &agrave; votre espace client :</p>
                  <div className="confirm-email-creds">
                    <div><span>Identifiant</span><code>{email}</code></div>
                    <div><span>Mot de passe</span><code>{generatedPassword}</code>
                      <button className="icon-btn" onClick={() => copy(generatedPassword, 'pwd')} title="Copier">
                        {copied === 'pwd' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <p>Vous pourrez modifier votre mot de passe &agrave; tout moment depuis votre espace.</p>
                  <p>&Agrave; tr&egrave;s vite,<br/>L&rsquo;&eacute;quipe CPH Solar</p>
                </div>
              </div>
            )}
          </div>
        )}

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
