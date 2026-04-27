const KEY_PARRAINAGES = 'cph_parrainages_v1'
const KEY_OVERRIDES = 'cph_parrainages_overrides_v1'

const bus = new EventTarget()

export const PARRAINAGES_INIT = [
  {
    id: 1,
    parrainClientId: 1,
    parrainNom: 'Jean-Pierre Martin',
    parrainTel: '06 12 34 56 78',
    inviteNom: 'Pierre Vidal',
    inviteTel: '06 12 34 56 78',
    statut: 'inscrit',
    dateEnvoi: '10/04/2026',
    dateConversion: null,
    bonus: 30,
    interventionId: null,
  },
  {
    id: 2,
    parrainClientId: 3,
    parrainNom: 'Robert Vidal',
    parrainTel: '06 11 22 33 44',
    inviteNom: 'Sophie Lambert',
    inviteTel: '07 88 21 45 90',
    statut: 'valide',
    dateEnvoi: '08/04/2026',
    dateConversion: '18/04/2026',
    bonus: 30,
    interventionId: 'i10',
  },
  {
    id: 3,
    parrainClientId: 2,
    parrainNom: 'Marie Duval',
    parrainTel: '06 98 76 54 32',
    inviteNom: 'Clara Meunier',
    inviteTel: '06 20 30 40 50',
    statut: 'envoye',
    dateEnvoi: '05/04/2026',
    dateConversion: null,
    bonus: 30,
    interventionId: null,
  },
  {
    id: 4,
    parrainClientId: 8,
    parrainNom: 'Marc Lefebvre',
    parrainTel: '06 33 22 11 00',
    inviteNom: 'Julien Roussel',
    inviteTel: '06 22 11 00 77',
    statut: 'valide',
    dateEnvoi: '02/04/2026',
    dateConversion: '12/04/2026',
    bonus: 30,
    interventionId: 'i14',
  },
  {
    id: 5,
    parrainClientId: 7,
    parrainNom: 'Nathalie Perrin',
    parrainTel: '06 77 88 99 00',
    inviteNom: 'Ahmed Mansour',
    inviteTel: '07 22 33 44 55',
    statut: 'paye',
    dateEnvoi: '28/03/2026',
    dateConversion: '09/04/2026',
    bonus: 30,
    interventionId: 'i17',
  },
  {
    id: 6,
    parrainClientId: 5,
    parrainNom: 'Paul Roche',
    parrainTel: '06 55 44 33 22',
    inviteNom: '(en attente)',
    inviteTel: '—',
    statut: 'envoye',
    dateEnvoi: '20/03/2026',
    dateConversion: null,
    bonus: 30,
    interventionId: null,
  },
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

function getPersisted() {
  return safeRead(KEY_PARRAINAGES, [])
}

function setPersisted(parrainages) {
  safeWrite(KEY_PARRAINAGES, parrainages)
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

function notify() {
  bus.dispatchEvent(new Event('change'))
}

function withDefaults(data = {}) {
  return {
    parrainClientId: data.parrainClientId ?? null,
    parrainNom: data.parrainNom || '—',
    parrainTel: data.parrainTel || '—',
    inviteNom: data.inviteNom || '—',
    inviteTel: data.inviteTel || '—',
    statut: data.statut || 'envoye',
    dateEnvoi: data.dateEnvoi || new Date().toLocaleDateString('fr-FR'),
    dateConversion: data.dateConversion ?? null,
    bonus: Number(data.bonus) || 30,
    interventionId: data.interventionId ?? null,
  }
}

export function getParrainages() {
  const persisted = getPersisted()
  const overrides = getOverrides()
  const supprimesSet = new Set(overrides.supprimes.map((id) => normalizeId(id)))

  const mocks = PARRAINAGES_INIT
    .filter((item) => !supprimesSet.has(normalizeId(item.id)))
    .map((item) => {
      const key = normalizeId(item.id)
      return { ...item, ...(overrides.modifs[key] || {}) }
    })

  return [...persisted, ...mocks]
}

function findParrainageById(id) {
  const key = normalizeId(id)
  return getParrainages().find((item) => normalizeId(item.id) === key) || null
}

export function findParrainageByInvite(tel) {
  const cible = normalizeTel(tel)
  if (!cible) return null

  const statusRank = { envoye: 1, inscrit: 2, valide: 3, paye: 4 }
  const candidats = getParrainages()
    .filter((item) => normalizeTel(item.inviteTel) === cible)
    .sort((a, b) => {
      const rankA = statusRank[a.statut] || 99
      const rankB = statusRank[b.statut] || 99
      if (rankA !== rankB) return rankA - rankB
      return String(b.dateEnvoi || '').localeCompare(String(a.dateEnvoi || ''))
    })

  return candidats[0] || null
}

export function addParrainage(data = {}) {
  const newParrainage = {
    id: buildUuid(),
    ...withDefaults(data),
  }

  const persisted = getPersisted()
  setPersisted([newParrainage, ...persisted])
  notify()
  return newParrainage
}

export function updateParrainage(id, patch = {}) {
  const key = normalizeId(id)
  const persisted = getPersisted()
  const idx = persisted.findIndex((item) => normalizeId(item.id) === key)

  if (idx >= 0) {
    const next = [...persisted]
    next[idx] = { ...next[idx], ...patch }
    setPersisted(next)
    notify()
    return next[idx]
  }

  const existsInInit = PARRAINAGES_INIT.some((item) => normalizeId(item.id) === key)
  if (!existsInInit) return null

  const overrides = getOverrides()
  const prevPatch = overrides.modifs[key] || {}
  overrides.modifs[key] = { ...prevPatch, ...patch }
  setOverrides(overrides)
  notify()
  return findParrainageById(key)
}

export function removeParrainage(id) {
  const key = normalizeId(id)
  const persisted = getPersisted()
  const idx = persisted.findIndex((item) => normalizeId(item.id) === key)

  if (idx >= 0) {
    setPersisted(persisted.filter((item) => normalizeId(item.id) !== key))
    notify()
    return
  }

  const existsInInit = PARRAINAGES_INIT.some((item) => normalizeId(item.id) === key)
  if (!existsInInit) return

  const overrides = getOverrides()
  if (!overrides.supprimes.some((idValue) => normalizeId(idValue) === key)) {
    overrides.supprimes.push(key)
  }
  delete overrides.modifs[key]
  setOverrides(overrides)
  notify()
}

export function subscribe(cb) {
  if (typeof cb !== 'function') return () => {}

  const onChange = () => cb()
  const onStorage = (event) => {
    if (event.key === KEY_PARRAINAGES || event.key === KEY_OVERRIDES) {
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
