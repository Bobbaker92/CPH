import { useState, useMemo, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { getClientAccount } from '../../lib/clientAuth'
import { addClient, findClientByEmail, findClientByTel, getClients } from '../../lib/clientsStore'
import { addParrainage, getParrainages, subscribe as subscribeParrainages } from '../../lib/parrainagesStore'

function telValide(tel = '') {
  return String(tel).replace(/\D/g, '').length >= 9
}

function getSessionClient() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.role !== 'client' || !user.email) return null

  const byEmail = findClientByEmail(user.email)
  if (byEmail) return byEmail

  const compte = getClientAccount(user.email)
  if (compte?.tel) {
    const byTel = findClientByTel(compte.tel)
    if (byTel) return byTel
  }

  const byNom = getClients().find((client) => client.nom?.toLowerCase() === String(user.nom || '').toLowerCase())
  if (byNom) return byNom

  return addClient({
    nom: user.nom || compte?.nom || 'Client',
    tel: compte?.tel || '—',
    email: user.email,
    ville: '—',
    adresse: '—',
  })
}

export default function ClientRecommander() {
  const [copied, setCopied] = useState(false)
  const [inviteNom, setInviteNom] = useState('')
  const [inviteTel, setInviteTel] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [parrainages, setParrainages] = useState(() => getParrainages())

  const lien = 'https://cphpaca.fr/parrainage'

  useEffect(() => {
    const unsubscribe = subscribeParrainages(() => setParrainages(getParrainages()))
    return () => unsubscribe()
  }, [])

  const clientActif = useMemo(() => getSessionClient(), [])

  const mesParrainages = useMemo(() => {
    if (!clientActif) return []
    return parrainages.filter((p) => String(p.parrainClientId) === String(clientActif.id))
  }, [clientActif, parrainages])

  const stats = useMemo(() => {
    const total = mesParrainages.length
    const valides = mesParrainages.filter((p) => p.statut === 'valide' || p.statut === 'paye').length
    const credit = mesParrainages
      .filter((p) => p.statut === 'paye')
      .reduce((sum, p) => sum + (Number(p.bonus) || 0), 0)

    return { total, valides, credit }
  }, [mesParrainages])

  const handleCopy = () => {
    navigator.clipboard.writeText(lien)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!clientActif) {
      setError('Session client introuvable. Reconnectez-vous puis réessayez.')
      return
    }
    if (!inviteNom.trim()) {
      setError('Renseignez le nom de votre proche.')
      return
    }
    if (!telValide(inviteTel)) {
      setError('Renseignez un numéro de téléphone valide.')
      return
    }

    addParrainage({
      parrainClientId: clientActif.id,
      parrainNom: clientActif.nom || '—',
      parrainTel: clientActif.tel || '—',
      inviteNom: inviteNom.trim(),
      inviteTel: inviteTel.trim(),
      statut: 'envoye',
      bonus: 30,
      dateConversion: null,
      interventionId: null,
    })

    setInviteNom('')
    setInviteTel('')
    setSuccess('Invitation envoyée. Nous avons enregistré votre parrainage.')
  }

  return (
    <>
      <div className="page-header">
        <h1>Recommandez-nous</h1>
        <p>Invitez un proche et obtenez 30&nbsp;&euro; de crédit après intervention validée.</p>
      </div>

      <div className="referral-box" style={{ marginBottom: 24 }}>
        <h3>30&nbsp;&euro; offerts pour vos proches</h3>
        <p>
          Partagez votre lien personnel. Votre proche bénéficie d&apos;une offre dédiée, et vous recevez 30&nbsp;&euro;
          de remise sur votre prochaine intervention.
        </p>

        <div className="referral-link">
          <code>{lien}</code>
          <button className="btn btn-sm btn-primary" onClick={handleCopy}>
            {copied ? <><Check size={14} /> Copié</> : <><Copy size={14} /> Copier</>}
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16, marginBottom: 16 }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Nom du proche</label>
            <input
              type="text"
              placeholder="Ex. Camille Durand"
              value={inviteNom}
              onChange={(e) => setInviteNom(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Téléphone du proche</label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={inviteTel}
              onChange={(e) => setInviteTel(e.target.value)}
            />
          </div>
          {error && <div style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>{error}</div>}
          {success && <div style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>{success}</div>}
          <button type="submit" className="btn btn-primary">Envoyer l&apos;invitation</button>
        </form>

        <div className="referral-stats">
          <div className="referral-stat">
            <span className="val">{stats.total}</span>
            <span className="lbl">Parrainages</span>
          </div>
          <div className="referral-stat">
            <span className="val">{stats.valides}</span>
            <span className="lbl">Conversions</span>
          </div>
          <div className="referral-stat">
            <span className="val">{stats.credit}&nbsp;&euro;</span>
            <span className="lbl">Crédit disponible</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Historique</h3>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: 'var(--gray-500)' }}>Contact</th>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: 'var(--gray-500)' }}>Statut</th>
              <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, color: 'var(--gray-500)' }}>Bonus</th>
            </tr>
          </thead>
          <tbody>
            {mesParrainages.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '12px 0', color: 'var(--gray-500)', fontSize: 13 }}>
                  Aucun parrainage enregistré pour le moment.
                </td>
              </tr>
            )}
            {mesParrainages.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: '12px 0', fontSize: 14 }}>{item.inviteNom}</td>
                <td style={{ padding: '12px 0' }}>
                  <span className={`badge ${item.statut === 'envoye' ? 'badge-gray' : item.statut === 'inscrit' ? 'badge-blue' : item.statut === 'valide' ? 'badge-green' : 'badge-orange'}`}>
                    {item.statut}
                  </span>
                </td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>
                  -{Number(item.bonus) || 0}&nbsp;&euro;
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ background: 'var(--gray-50)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Conditions</h3>
        <ul style={{ fontSize: 13, color: 'var(--gray-500)', paddingLeft: 20, lineHeight: 2 }}>
          <li>Le bonus est validé à la planification de l&apos;intervention de votre proche.</li>
          <li>Le crédit est utilisable sur votre prochaine intervention CPH.</li>
          <li>Cumul possible selon vos recommandations.</li>
        </ul>
      </div>
    </>
  )
}
