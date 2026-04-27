import { findParrainageByInvite, updateParrainage } from './parrainagesStore'

const KEY_CLIENTS = 'cph_clients_v1'
const KEY_OVERRIDES = 'cph_clients_overrides_v1'

const bus = new EventTarget()

export const CLIENTS_INIT = [
  { id: 1, nom: 'Jean-Pierre Martin', tel: '06 12 34 56 78', email: 'jp.martin@free.fr', ville: 'Marseille 13008', adresse: '12 rue Paradis', interventions: 3, ca: 597, derniere: '12/03/2026', statut: 'actif', notes: 'Client régulier, 2 panneaux supplémentaires prévus.' },
  { id: 2, nom: 'Marie Duval', tel: '06 98 76 54 32', email: 'm.duval@gmail.com', ville: 'Marseille 13012', adresse: '8 bd National', interventions: 2, ca: 398, derniere: '04/02/2026', statut: 'actif', notes: '' },
  { id: 3, nom: 'Robert Vidal', tel: '06 11 22 33 44', email: 'rvidal@orange.fr', ville: 'Marseille 13005', adresse: '45 rue de Rome', interventions: 4, ca: 3397, derniere: '28/03/2026', statut: 'vip', notes: 'Signataire d\'un contrat couverture 3200 € en mars.' },
  { id: 4, nom: 'Sophie Blanc', tel: '07 88 99 00 11', email: 's.blanc@yahoo.fr', ville: 'Marseille 13004', adresse: '3 avenue du Prado', interventions: 1, ca: 199, derniere: '15/01/2026', statut: 'nouveau', notes: '' },
  { id: 5, nom: 'Paul Roche', tel: '06 55 44 33 22', email: 'paul.r@laposte.net', ville: 'Aubagne 13400', adresse: '28 chemin des Oliviers', interventions: 2, ca: 398, derniere: '22/03/2026', statut: 'actif', notes: '' },
  { id: 6, nom: 'Ahmed Mansour', tel: '07 22 33 44 55', email: 'a.mansour@gmail.com', ville: 'Aix 13100', adresse: '14 cours Mirabeau', interventions: 1, ca: 199, derniere: '18/05/2026', statut: 'nouveau', notes: 'Contact par téléphone suite pub locale.' },
  { id: 7, nom: 'Nathalie Perrin', tel: '06 77 88 99 00', email: 'n.perrin@free.fr', ville: 'Aix 13090', adresse: '5 avenue Malacrida', interventions: 3, ca: 1797, derniere: '10/03/2026', statut: 'actif', notes: '' },
  { id: 8, nom: 'Marc Lefebvre', tel: '06 33 22 11 00', email: 'marc.l@orange.fr', ville: 'Toulon 83000', adresse: '22 rue Picot', interventions: 2, ca: 4399, derniere: '05/04/2026', statut: 'vip', notes: 'Gros contrat rives + faîtage signé.' },
]

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function notify() {
  bus.dispatchEvent(new Event('change'))
}

function normalizeId(id) {
  return String(id)
}

function normalizeTel(tel = '') {
  return String(tel).replace(/\D/g, '')
}

function buildUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function notBlank(value) {
  if (value == null) return false
  const str = String(value).trim()
  return str !== '' && str !== '—'
}

function getPersisted() {
  return safeRead(KEY_CLIENTS, [])
}

function setPersisted(clients) {
  safeWrite(KEY_CLIENTS, clients)
}

function getOverrides() {
  const parsed = safeRead(KEY_OVERRIDES, {})
  return {
    modifs: parsed?.modifs && typeof parsed.modifs === 'object' ? parsed.modifs : {},
    supprimes: Array.isArray(parsed?.supprimes) ? parsed.supprimes : [],
  }
}

function setOverrides(overrides) {
  safeWrite(KEY_OVERRIDES, overrides)
}

function withDefaults(data = {}) {
  return {
    nom: data.nom || '—',
    tel: data.tel || '—',
    email: data.email || '—',
    ville: data.ville || '—',
    adresse: data.adresse || '—',
    interventions: Number(data.interventions) || 0,
    ca: Number(data.ca) || 0,
    derniere: data.derniere || '—',
    statut: data.statut || 'nouveau',
    notes: data.notes || '',
  }
}

export function getClients() {
  const persisted = getPersisted()
  const overrides = getOverrides()
  const supprimesSet = new Set(overrides.supprimes.map((id) => normalizeId(id)))

  const mocks = CLIENTS_INIT
    .filter((c) => !supprimesSet.has(normalizeId(c.id)))
    .map((c) => {
      const key = normalizeId(c.id)
      return { ...c, ...(overrides.modifs[key] || {}) }
    })

  return [...persisted, ...mocks]
}

function findClientById(id) {
  const clientId = normalizeId(id)
  return getClients().find((client) => normalizeId(client.id) === clientId) || null
}

export function findClientByTel(tel) {
  const telNorm = normalizeTel(tel)
  if (!telNorm) return null
  return getClients().find((client) => normalizeTel(client.tel) === telNorm) || null
}

export function findClientByEmail(email) {
  const target = String(email || '').trim().toLowerCase()
  if (!target) return null
  return getClients().find((client) => String(client.email || '').trim().toLowerCase() === target) || null
}

export function updateClient(id, patch = {}) {
  const clientId = normalizeId(id)
  const persisted = getPersisted()
  const idx = persisted.findIndex((c) => normalizeId(c.id) === clientId)

  if (idx >= 0) {
    const next = [...persisted]
    next[idx] = { ...next[idx], ...patch }
    setPersisted(next)
    notify()
    return next[idx]
  }

  const existsInInit = CLIENTS_INIT.some((c) => normalizeId(c.id) === clientId)
  if (!existsInInit) return null

  const overrides = getOverrides()
  const previous = overrides.modifs[clientId] || {}
  overrides.modifs[clientId] = { ...previous, ...patch }
  setOverrides(overrides)
  notify()
  return findClientById(clientId)
}

export function addClient(data = {}) {
  const defaults = withDefaults(data)
  const existingByTel = findClientByTel(defaults.tel)

  if (existingByTel) {
    const patch = {}
    ;['nom', 'tel', 'email', 'ville', 'adresse', 'notes', 'statut'].forEach((field) => {
      const incoming = defaults[field]
      if (notBlank(incoming)) {
        patch[field] = incoming
      }
    })
    if (defaults.derniere && defaults.derniere !== '—') patch.derniere = defaults.derniere
    if (Number.isFinite(defaults.interventions) && defaults.interventions > 0) {
      patch.interventions = Math.max(Number(existingByTel.interventions) || 0, defaults.interventions)
    }
    if (Number.isFinite(defaults.ca) && defaults.ca > 0) {
      patch.ca = Math.max(Number(existingByTel.ca) || 0, defaults.ca)
    }

    const merged = Object.keys(patch).length > 0
      ? (updateClient(existingByTel.id, patch) || findClientById(existingByTel.id))
      : existingByTel
    const parrainage = findParrainageByInvite(merged?.tel || defaults.tel)
    if (parrainage?.statut === 'envoye') {
      updateParrainage(parrainage.id, { statut: 'inscrit' })
    }
    return merged
  }

  const newClient = {
    id: buildUuid(),
    ...defaults,
  }

  const persisted = getPersisted()
  setPersisted([newClient, ...persisted])
  const parrainage = findParrainageByInvite(newClient.tel)
  if (parrainage?.statut === 'envoye') {
    updateParrainage(parrainage.id, { statut: 'inscrit' })
  }
  notify()
  return newClient
}

export function removeClient(id) {
  const clientId = normalizeId(id)
  const persisted = getPersisted()
  const idx = persisted.findIndex((c) => normalizeId(c.id) === clientId)

  if (idx >= 0) {
    setPersisted(persisted.filter((c) => normalizeId(c.id) !== clientId))
    notify()
    return
  }

  const existsInInit = CLIENTS_INIT.some((c) => normalizeId(c.id) === clientId)
  if (!existsInInit) return

  const overrides = getOverrides()
  if (!overrides.supprimes.some((idValue) => normalizeId(idValue) === clientId)) {
    overrides.supprimes.push(clientId)
  }
  delete overrides.modifs[clientId]
  setOverrides(overrides)
  notify()
}

export function subscribe(cb) {
  if (typeof cb !== 'function') return () => {}

  const onChange = () => cb()
  const onStorage = (event) => {
    if (event.key === KEY_CLIENTS || event.key === KEY_OVERRIDES) {
      cb()
    }
  }

  bus.addEventListener('change', onChange)
  window.addEventListener('storage', onStorage)

  return () => {
    bus.removeEventListener('change', onChange)
    window.removeEventListener('storage', onStorage)
  }
}
