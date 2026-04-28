import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff, Shield } from 'lucide-react'
import { bootstrapClientAccount, getClientAccount, verifyClientPassword } from '../lib/clientAuth'

const COMPTES = {
  'admin@cphpaca.fr': { password: 'admin123', role: 'admin', nom: 'Fares' },
  'karim@cphpaca.fr': { password: 'couvreur123', role: 'couvreur', nom: 'Karim Z.' },
  'client@test.fr': { password: 'client123', role: 'client', nom: 'Jean-Pierre Martin' },
  'prospection@cphpaca.fr': { password: 'prospection123', role: 'prospectrice', nom: 'Nadia Belkacem' },
}

const REMEMBERED_EMAIL_KEY = 'cph_login_remembered_email'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem(REMEMBERED_EMAIL_KEY) || '' } catch { return '' }
  })
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => {
    try { return !!localStorage.getItem(REMEMBERED_EMAIL_KEY) } catch { return false }
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const key = email.toLowerCase()
      const compte = COMPTES[key]

      // Si compte client déjà enregistré dans clientAuth, il a priorité
      // (on ne retombe PAS sur le mdp hardcodé pour éviter un mdp fantôme après changement)
      const existingClient = getClientAccount(key)
      if (existingClient) {
        if (!verifyClientPassword(key, password)) {
          setError('Mot de passe incorrect.')
          setLoading(false)
          return
        }
        localStorage.setItem('user', JSON.stringify({ email: key, role: 'client', nom: existingClient.nom || compte?.nom || 'Client' }))
        if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, key)
        else localStorage.removeItem(REMEMBERED_EMAIL_KEY)
        navigate('/client')
        return
      }

      // Comptes non-client (admin / couvreur / prospectrice) : hardcodé uniquement
      if (compte) {
        if (compte.password !== password) {
          setError('Mot de passe incorrect.')
          setLoading(false)
          return
        }
        // Premier login client démo → bootstrap clientAuth avec le même mdp
        if (compte.role === 'client') {
          bootstrapClientAccount({ email: key, password, nom: compte.nom })
        }
        localStorage.setItem('user', JSON.stringify({ email: key, role: compte.role, nom: compte.nom }))
        if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, key)
        else localStorage.removeItem(REMEMBERED_EMAIL_KEY)
        if (compte.role === 'admin') navigate('/admin')
        else if (compte.role === 'couvreur') navigate('/couvreur')
        else if (compte.role === 'prospectrice') navigate('/prospection')
        else navigate('/client')
        return
      }

      setError('Adresse email inconnue.')
      setLoading(false)
    }, 600)
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
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 8, background: 'var(--accent)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          }}>
            <Shield size={28} color="var(--primary)" />
          </div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {"Contr\u00F4le Provence Habitat"}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            {"Acc\u00E9dez \u00E0 votre espace"}
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: 'white', borderRadius: 'var(--radius)', padding: 36,
          boxShadow: 'var(--shadow-lg)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group">
              <label htmlFor="login-email">Adresse email</label>
              <input
                id="login-email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                inputMode="email"
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'login-error' : undefined}
                  style={{ width: '100%', paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={showPassword}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--gray-400)', padding: 4,
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                id="login-error"
                role="alert"
                aria-live="assertive"
                style={{
                  background: 'var(--red-light)', color: 'var(--red)', padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500,
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                }}
              >
                {error}
              </div>
            )}

            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Se souvenir de mon adresse email</span>
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%', justifyContent: 'center', padding: '16px 28px',
                fontSize: 15, opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Connexion...' : <><LogIn size={16} /> Se connecter</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/mot-de-passe-oublie" style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              {"Mot de passe oubli\u00E9 ?"}
            </Link>
          </div>

          <div className="login-cta-devis">
            <span>Pas encore client&nbsp;?</span>
            <Link to="/devis" className="btn btn-outline btn-sm">
              R&eacute;server une intervention
            </Link>
          </div>
        </div>

        {/* Demo accounts — UNIQUEMENT en dev (vite import.meta.env.DEV).
            En build de prod, ce bloc est éliminé via dead code elimination.
            Sécurité : les mots de passe en clair ne doivent JAMAIS atterrir
            en prod. Pour tester en prod, créer de vrais comptes admin. */}
        {import.meta.env.DEV && (
        <div style={{
          marginTop: 24, background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius)',
          padding: 20,
        }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 12 }}>
            {"Comptes de d\u00E9monstration"}
          </p>
          {[
            { label: 'Admin', email: 'admin@cphpaca.fr', pass: 'admin123' },
            { label: 'Couvreur', email: 'karim@cphpaca.fr', pass: 'couvreur123' },
            { label: 'Client', email: 'client@test.fr', pass: 'client123' },
            { label: 'Prospectrice', email: 'prospection@cphpaca.fr', pass: 'prospection123' },
          ].map((c) => (
            <button
              key={c.label}
              onClick={() => { setEmail(c.email); setPassword(c.pass); setError('') }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 8,
                cursor: 'pointer', transition: 'all 0.2s',
                color: 'white',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: 13, fontWeight: 600, display: 'block' }}>{c.label}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{c.email}</span>
              </div>
              <span style={{
                fontSize: 11, color: 'var(--accent)', fontWeight: 600,
                background: 'rgba(247,187,46,0.1)', padding: '4px 10px', borderRadius: 4,
              }}>
                Remplir
              </span>
            </button>
          ))}
        </div>
        )}

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {"← Retour au site"}
          </a>
        </div>
      </div>
    </div>
  )
}
