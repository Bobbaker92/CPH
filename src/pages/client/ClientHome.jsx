import { useEffect, useMemo, useState } from 'react'
import { Calendar, MapPin, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getClientAccount } from '../../lib/clientAuth'
import { getClients, subscribe as subscribeClients, findClientByEmail, findClientByTel } from '../../lib/clientsStore'
import { getInterventions, subscribe as subscribeInterventions } from '../../lib/interventionsStore'

function normalizeId(id) {
  return String(id)
}

function formatDateLong(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateShort(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR')
}

function getPrenom(nom = '') {
  return String(nom || '').trim().split(/\s+/)[0] || 'Client'
}

function statusLabel(statut = '') {
  if (statut === 'terminee' || statut === 'termine') return 'Terminée'
  if (statut === 'en-cours') return 'En cours'
  if (statut === 'a-confirmer') return 'À confirmer'
  if (statut === 'confirme') return 'Planifiée'
  if (statut === 'annulee') return 'Annulée'
  return statut || '—'
}

function statusBadge(statut = '') {
  if (statut === 'terminee' || statut === 'termine') return 'badge-green'
  if (statut === 'en-cours') return 'badge-blue'
  if (statut === 'a-confirmer') return 'badge-orange'
  if (statut === 'confirme') return 'badge-blue'
  return 'badge-gray'
}

function resolveClientFromSession(user, clients) {
  if (!user?.email) return null

  const byEmail = findClientByEmail(user.email)
  if (byEmail) return byEmail

  const compte = getClientAccount(user.email)
  if (compte?.tel) {
    const byTel = findClientByTel(compte.tel)
    if (byTel) return byTel
  }

  const nomRef = String(user.nom || compte?.nom || '').trim().toLowerCase()
  if (nomRef) {
    const byNom = clients.find((c) => String(c.nom || '').trim().toLowerCase() === nomRef)
    if (byNom) return byNom
  }

  return null
}

export default function ClientHome() {
  const navigate = useNavigate()
  const [clients, setClients] = useState(() => getClients())
  const [interventions, setInterventions] = useState(() => getInterventions())

  const sessionUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  useEffect(() => {
    if (sessionUser?.role !== 'client' || !sessionUser?.email) {
      navigate('/connexion', { replace: true })
      return
    }

    const unsubClients = subscribeClients(() => setClients(getClients()))
    const unsubInterventions = subscribeInterventions(() => setInterventions(getInterventions()))

    return () => {
      unsubClients()
      unsubInterventions()
    }
  }, [navigate, sessionUser?.email, sessionUser?.role])

  const client = useMemo(() => resolveClientFromSession(sessionUser, clients), [clients, sessionUser])

  const interventionsClient = useMemo(() => {
    if (!client) return []
    const id = normalizeId(client.id)
    return interventions
      .filter((i) => i.clientId != null && normalizeId(i.clientId) === id)
      .slice()
      .sort((a, b) => {
        const dateCmp = String(a.date || '').localeCompare(String(b.date || ''))
        if (dateCmp !== 0) return dateCmp
        return String(a.heureSort || a.heure || '').localeCompare(String(b.heureSort || b.heure || ''))
      })
  }, [client, interventions])

  const prochaineIntervention = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return interventionsClient.find((i) => {
      if (!i.date) return false
      const d = new Date(`${i.date}T00:00:00`)
      return d >= today && i.statut !== 'annulee'
    }) || null
  }, [interventionsClient])

  const historique = useMemo(() => {
    return [...interventionsClient].sort((a, b) => {
      const dateCmp = String(b.date || '').localeCompare(String(a.date || ''))
      if (dateCmp !== 0) return dateCmp
      return String(b.heureSort || b.heure || '').localeCompare(String(a.heureSort || a.heure || ''))
    })
  }, [interventionsClient])

  const bilan = useMemo(() => {
    const total = interventionsClient.length
    const montant = total * 199
    return { total, montant }
  }, [interventionsClient])

  const ctaState = useMemo(() => ({
    prefill: {
      nom: client?.nom || '',
      tel: client?.tel || '',
      email: client?.email || '',
      ville: client?.ville || '',
    },
  }), [client])

  if (sessionUser?.role !== 'client' || !sessionUser?.email) return null

  return (
    <>
      <div className="page-header">
        <h1>Bonjour, {getPrenom(client?.nom || sessionUser.nom || 'Client')}</h1>
        <p>{client?.ville || 'Voici le suivi de vos interventions.'}</p>
      </div>

      <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Prochaine intervention</h3>
            {prochaineIntervention ? (
              <div style={{ display: 'flex', gap: 24, fontSize: 14, color: 'var(--gray-600)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={15} /> {formatDateLong(prochaineIntervention.date)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={15} /> {prochaineIntervention.heure || '—'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={15} /> {prochaineIntervention.ville || '—'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Couvreur : {prochaineIntervention.couvreur || '—'}</span>
              </div>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Aucune intervention planifiée pour le moment.</p>
            )}
          </div>
          <span className={`badge ${statusBadge(prochaineIntervention?.statut)}`}>{statusLabel(prochaineIntervention?.statut)}</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Historique des interventions</h3>
        <div className="timeline">
          {historique.length === 0 && (
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Aucune intervention liée</h4>
                <p>Votre historique apparaîtra ici dès votre première planification.</p>
              </div>
            </div>
          )}
          {historique.map((item) => (
            <div key={item.id} className="timeline-item">
              <div className={`timeline-dot ${item.statut === 'terminee' || item.statut === 'termine' ? 'active' : 'current'}`}></div>
              <div className="timeline-content">
                <h4>{formatDateShort(item.date)} • {item.heure || '—'}</h4>
                <p>{item.ville || '—'} • {statusLabel(item.statut)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Bilan</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{bilan.total}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Interventions totales</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{bilan.montant.toLocaleString('fr-FR')} €</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Montant cumulé estimé</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Link to="/client/photos" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Photos avant / après</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>Disponibles après intervention</p>
          </div>
          <ChevronRight size={18} color="var(--gray-400)" />
        </Link>

        <Link to="/client/rapport" className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Rapport toiture</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>Envoyé sous 48h après intervention</p>
          </div>
          <ChevronRight size={18} color="var(--gray-400)" />
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => navigate('/devis', { state: ctaState })}
        >
          Réserver une nouvelle intervention
        </button>
      </div>
    </>
  )
}
