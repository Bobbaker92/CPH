import { useState } from 'react'
import { Mail, Check, Send } from 'lucide-react'

const SUBSCRIBED_KEY = 'cph_newsletter_v1'

/**
 * Capture email pour newsletter — version mock pour la maquette.
 * Stocke localement : la liste sera reprise lors du branchement IONOS.
 *
 * Persistance : on garde l'email + timestamp en localStorage.
 * Affichage : si déjà inscrit, on remplace le formulaire par un message
 * de remerciement.
 */
function getSubscription() {
  try {
    const raw = localStorage.getItem(SUBSCRIBED_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function NewsletterSignup() {
  const [subscribed, setSubscribed] = useState(() => getSubscription())
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (subscribed?.email) {
    return (
      <div className="newsletter-card newsletter-thanks">
        <Check size={18} />
        <div>
          <strong>Merci pour votre inscription&nbsp;!</strong>
          <span>Vous recevrez nos conseils saisonniers à l&rsquo;adresse {subscribed.email}.</span>
        </div>
      </div>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    setSubmitting(true)
    setTimeout(() => {
      try {
        localStorage.setItem(SUBSCRIBED_KEY, JSON.stringify({
          email: email.trim().toLowerCase(),
          subscribedAt: new Date().toISOString(),
        }))
      } catch {
        // ignore
      }
      setSubscribed({ email: email.trim().toLowerCase() })
      setSubmitting(false)
    }, 600)
  }

  return (
    <form className="newsletter-card" onSubmit={submit}>
      <div className="newsletter-head">
        <Mail size={18} />
        <div>
          <strong>Recevez nos conseils saisonniers</strong>
          <span>1 email par trimestre — pas de spam, pas de revente.</span>
        </div>
      </div>
      <div className="newsletter-input-row">
        <input
          type="email"
          required
          placeholder="votre@email.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Adresse email"
        />
        <button
          type="submit"
          className="btn btn-sm"
          disabled={submitting}
        >
          {submitting ? '...' : <><Send size={13} /> S&rsquo;inscrire</>}
        </button>
      </div>
    </form>
  )
}
