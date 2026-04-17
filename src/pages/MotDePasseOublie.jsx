import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Mail, ArrowLeft, Send, Check, Inbox, ChevronDown, ChevronUp, Copy, ArrowRight } from 'lucide-react'
import { getClientAccount, resetClientPasswordByAdmin } from '../lib/clientAuth'

export default function MotDePasseOublie() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = (value) => {
    navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      const key = email.trim().toLowerCase()
      const existing = getClientAccount(key)
      if (existing) {
        const { password } = resetClientPasswordByAdmin(key)
        setSubmitted({ email: key, password, known: true })
      } else {
        setSubmitted({ email: key, password: null, known: false })
      }
      setLoading(false)
    }, 700)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 8, background: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Shield size={28} color="var(--primary)" />
          </div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Mot de passe oubli&eacute;
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            {submitted ? "V\u00e9rifiez votre bo\u00eete mail" : "Indiquez l'adresse email de votre compte"}
          </p>
        </div>

        {!submitted && (
          <div style={{
            background: 'white', borderRadius: 'var(--radius)', padding: 32,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="input-group">
                <label>Adresse email</label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <p style={{fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5, margin: 0}}>
                Si un compte existe avec cette adresse, nous vous enverrons un nouveau mot de passe temporaire.
                L&apos;ancien mot de passe sera aussit&ocirc;t r&eacute;voqu&eacute;.
              </p>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{width: '100%', justifyContent: 'center', padding: '14px 28px', fontSize: 14, opacity: loading ? 0.7 : 1}}
              >
                {loading ? 'Envoi...' : <><Send size={14} /> Recevoir un nouveau mot de passe</>}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <Link to="/connexion" style={{ fontSize: 13, color: 'var(--gray-500)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={13} /> Retour &agrave; la connexion
              </Link>
            </div>
          </div>
        )}

        {submitted && (
          <div style={{
            background: 'white', borderRadius: 'var(--radius)', padding: 28,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div className="confirm-credentials-sent" style={{marginBottom: 14}}>
              <div className="confirm-credentials-sent-icon"><Mail size={18} /></div>
              <div className="confirm-credentials-sent-body">
                <strong>Un email a &eacute;t&eacute; envoy&eacute; &agrave; <em>{submitted.email}</em></strong>
                <span>
                  {submitted.known
                    ? "Vous y trouverez un nouveau mot de passe. L'ancien n'est plus valide."
                    : "Si un compte existe \u00e0 cette adresse, vous recevrez un email d'ici quelques minutes. Pensez \u00e0 v\u00e9rifier vos spams."}
                </span>
              </div>
            </div>

            {/* Aperçu maquette uniquement si compte trouvé */}
            {submitted.known && submitted.password && (
              <div className="confirm-card confirm-email-preview" style={{padding: 0, marginBottom: 14}}>
                <button className="confirm-email-preview-head" onClick={() => setShowPreview(s => !s)}>
                  <div className="confirm-email-preview-head-left">
                    <Inbox size={18} />
                    <div>
                      <strong>Aper&ccedil;u de l&rsquo;email envoy&eacute;</strong>
                      <span>D&eacute;mo maquette &mdash; en prod, cet encart dispara&icirc;t</span>
                    </div>
                  </div>
                  {showPreview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {showPreview && (
                  <div className="confirm-email-preview-body">
                    <div className="confirm-email-headers">
                      <div><span>De</span><em>CPH Solar &lt;noreply@cphpaca.fr&gt;</em></div>
                      <div><span>&Agrave;</span><em>{submitted.email}</em></div>
                      <div><span>Objet</span><em>R&eacute;initialisation de votre mot de passe</em></div>
                    </div>
                    <div className="confirm-email-body-text">
                      <p>Bonjour,</p>
                      <p>Vous avez demand&eacute; la r&eacute;initialisation de votre mot de passe. Voici votre nouveau mot de passe temporaire :</p>
                      <div className="confirm-email-creds">
                        <div><span>Identifiant</span><code>{submitted.email}</code></div>
                        <div><span>Mot de passe</span><code>{submitted.password}</code>
                          <button className="icon-btn" onClick={() => copy(submitted.password)} title="Copier">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <p>Nous vous recommandons de le modifier depuis votre espace client apr&egrave;s connexion.</p>
                      <p>Si vous n&rsquo;&ecirc;tes pas &agrave; l&rsquo;origine de cette demande, contactez-nous au 04 12 16 06 30.</p>
                      <p>&Agrave; tr&egrave;s vite,<br/>L&rsquo;&eacute;quipe CPH Solar</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={() => navigate('/connexion')}
              style={{width: '100%', justifyContent: 'center', padding: 14, fontSize: 14}}
            >
              Retour &agrave; la connexion <ArrowRight size={14} />
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            &larr; Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}
