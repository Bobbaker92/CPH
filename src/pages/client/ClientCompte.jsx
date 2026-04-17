import { useState } from 'react'
import { User, Lock, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { changeClientPassword, getClientAccount } from '../../lib/clientAuth'

export default function ClientCompte() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const account = getClientAccount(user.email)

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [status, setStatus] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setStatus(null)

    if (newPwd !== confirmPwd) {
      setStatus({ type: 'error', msg: 'Les deux nouveaux mots de passe ne correspondent pas.' })
      return
    }
    if (newPwd.length < 6) {
      setStatus({ type: 'error', msg: 'Le nouveau mot de passe doit faire au moins 6 caractères.' })
      return
    }
    const result = changeClientPassword(user.email, currentPwd, newPwd)
    if (!result.ok) {
      if (result.reason === 'wrong_password') {
        setStatus({ type: 'error', msg: 'Mot de passe actuel incorrect.' })
      } else if (result.reason === 'too_short') {
        setStatus({ type: 'error', msg: 'Le nouveau mot de passe doit faire au moins 6 caractères.' })
      } else {
        setStatus({ type: 'error', msg: 'Impossible de modifier le mot de passe.' })
      }
      return
    }
    setStatus({ type: 'success', msg: 'Mot de passe modifié avec succès.' })
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
  }

  return (
    <div className="client-compte-page">
      <div className="page-header">
        <h1>Mon compte</h1>
        <p>G&eacute;rez vos informations personnelles et votre mot de passe.</p>
      </div>

      <div className="client-compte-grid">
        <section className="client-compte-card">
          <div className="client-compte-card-head">
            <div className="client-compte-card-icon"><User size={18} /></div>
            <div>
              <h2>Informations du compte</h2>
              <p>Ces informations sont utilis&eacute;es pour votre suivi client.</p>
            </div>
          </div>
          <div className="client-compte-infos">
            <div className="client-compte-row">
              <span>Nom</span>
              <strong>{account?.nom || user.nom || '—'}</strong>
            </div>
            <div className="client-compte-row">
              <span>Email de connexion</span>
              <strong>{user.email}</strong>
            </div>
            <div className="client-compte-row">
              <span>T&eacute;l&eacute;phone</span>
              <strong>{account?.tel || '—'}</strong>
            </div>
            <div className="client-compte-row">
              <span>Compte cr&eacute;&eacute; le</span>
              <strong>{account?.createdAt ? new Date(account.createdAt).toLocaleDateString('fr-FR') : '—'}</strong>
            </div>
          </div>
          <p className="client-compte-note">
            Pour modifier vos informations, contactez-nous au <a href="tel:0412160630">04 12 16 06 30</a>.
          </p>
        </section>

        <section className="client-compte-card">
          <div className="client-compte-card-head">
            <div className="client-compte-card-icon"><Lock size={18} /></div>
            <div>
              <h2>Modifier mon mot de passe</h2>
              <p>Choisissez un mot de passe d&rsquo;au moins 6 caract&egrave;res.</p>
            </div>
          </div>

          <form className="client-compte-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Mot de passe actuel</label>
              <div className="client-compte-pwd-wrap">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="client-compte-pwd-toggle" onClick={() => setShowCurrent(s => !s)}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Nouveau mot de passe</label>
              <div className="client-compte-pwd-wrap">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
                <button type="button" className="client-compte-pwd-toggle" onClick={() => setShowNew(s => !s)}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Confirmer le nouveau mot de passe</label>
              <input
                type={showNew ? 'text' : 'password'}
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            {status && (
              <div className={`client-compte-status client-compte-status-${status.type}`}>
                {status.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{status.msg}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary client-compte-submit">
              <Lock size={14} /> Enregistrer le nouveau mot de passe
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
