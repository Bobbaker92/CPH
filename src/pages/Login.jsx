import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff, Shield } from 'lucide-react'

const COMPTES = {
  'admin@cphpaca.fr': { password: 'admin123', role: 'admin', nom: 'Fares' },
  'karim@cphpaca.fr': { password: 'couvreur123', role: 'couvreur', nom: 'Karim Z.' },
  'client@test.fr': { password: 'client123', role: 'client', nom: 'Jean-Pierre Martin' },
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const compte = COMPTES[email.toLowerCase()]
      if (!compte) {
        setError('Adresse email inconnue.')
        setLoading(false)
        return
      }
      if (compte.password !== password) {
        setError('Mot de passe incorrect.')
        setLoading(false)
        return
      }

      localStorage.setItem('user', JSON.stringify({ email, role: compte.role, nom: compte.nom }))

      if (compte.role === 'admin') navigate('/admin')
      else if (compte.role === 'couvreur') navigate('/couvreur')
      else navigate('/client')
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
              <label>Adresse email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--gray-400)', padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'var(--red-light)', color: 'var(--red)', padding: '10px 14px',
                borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500,
              }}>
                {error}
              </div>
            )}

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
            <a href="#" style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              {"Mot de passe oubli\u00E9 ?"}
            </a>
          </div>
        </div>

        {/* Demo accounts */}
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
