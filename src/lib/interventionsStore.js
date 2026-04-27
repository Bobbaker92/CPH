import { updateDemande } from './demandesStore'

const KEY_INTERVENTIONS = 'cph_interventions_v1'
const KEY_OVERRIDES = 'cph_interventions_overrides_v1'
const COUVREUR_UNIQUE = 'Karim Ziani'

const bus = new EventTarget()

export const INTERVENTIONS_INIT = [
  { id: 'i1', date: '2026-05-04', heure: '8h-10h', heureSort: '08:00', client: 'Robert Vidal', ville: 'Marseille 13005', couvreur: COUVREUR_UNIQUE, panneaux: 12, statut: 'confirme' },
  { id: 'i2', date: '2026-05-04', heure: '10h30-12h30', heureSort: '10:30', client: 'Jean-Pierre Martin', ville: 'Marseille 13008', couvreur: COUVREUR_UNIQUE, panneaux: 16, statut: 'confirme' },
  { id: 'i3', date: '2026-05-04', heure: '14h-16h', heureSort: '14:00', client: 'Marie Duval', ville: 'Marseille 13012', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
  { id: 'i6', date: '2026-05-05', heure: '9h-11h', heureSort: '09:00', client: 'Claire Dubois', ville: 'Aix 13100', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'confirme' },
  { id: 'i8', date: '2026-05-05', heure: '14h-16h', heureSort: '14:00', client: 'Isabelle Morel', ville: 'Gardanne 13120', couvreur: COUVREUR_UNIQUE, panneaux: 16, statut: 'confirme' },
  { id: 'i13', date: '2026-05-07', heure: '8h-10h', heureSort: '08:00', client: 'Thomas Roux', ville: 'Aubagne 13400', couvreur: COUVREUR_UNIQUE, panneaux: 14, statut: 'a-confirmer' },
  { id: 'i14', date: '2026-05-07', heure: '10h-12h', heureSort: '10:00', client: 'Nadia Khelif', ville: 'Aubagne 13400', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'confirme' },
  { id: 'i15', date: '2026-05-08', heure: '9h-11h', heureSort: '09:00', client: 'Alain Bernard', ville: 'Aix 13100', couvreur: COUVREUR_UNIQUE, panneaux: 20, statut: 'a-confirmer' },
  { id: 'i16', date: '2026-05-09', heure: '8h-10h', heureSort: '08:00', client: 'Sylvie Mercier', ville: 'Marseille 13004', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
  { id: 'i17', date: '2026-05-09', heure: '10h-12h', heureSort: '10:00', client: 'Bruno Costa', ville: 'Marseille 13006', couvreur: COUVREUR_UNIQUE, panneaux: 12, statut: 'confirme' },
  { id: 'i18', date: '2026-05-09', heure: '14h-16h', heureSort: '14:00', client: 'Fatima Aoudi', ville: 'Marseille 13010', couvreur: COUVREUR_UNIQUE, panneaux: 6, statut: 'confirme' },
  { id: 'i19', date: '2026-05-10', heure: '8h-10h', heureSort: '08:00', client: 'Patrick Leroy', ville: 'Toulon 83000', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'a-confirmer' },
  { id: 'i9', date: '2026-05-12', heure: '8h-9h30', heureSort: '08:00', client: 'Laurent Petit', ville: 'Toulon 83000', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
  { id: 'i10', date: '2026-05-12', heure: '10h-11h30', heureSort: '10:00', client: 'Sophie Blanc', ville: 'Toulon 83200', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'confirme' },
  { id: 'i11', date: '2026-05-12', heure: '13h-14h30', heureSort: '13:00', client: 'Nicolas Fabre', ville: 'Toulon 83500', couvreur: COUVREUR_UNIQUE, panneaux: 6, statut: 'a-confirmer' },
  { id: 'i12', date: '2026-05-12', heure: '15h-16h30', heureSort: '15:00', client: 'Claire Vasseur', ville: 'Toulon 83100', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
  { id: 'i20', date: '2026-05-13', heure: '9h-11h', heureSort: '09:00', client: 'Michel Dupont', ville: 'Nice 06000', couvreur: COUVREUR_UNIQUE, panneaux: 18, statut: 'confirme' },
  { id: 'i21', date: '2026-05-13', heure: '14h-16h', heureSort: '14:00', client: 'Sandra Ricci', ville: 'Nice 06300', couvreur: COUVREUR_UNIQUE, panneaux: 12, statut: 'confirme' },
  { id: 'i22', date: '2026-05-15', heure: '8h-10h', heureSort: '08:00', client: 'Yves Garnier', ville: 'Marseille 13001', couvreur: COUVREUR_UNIQUE, panneaux: 14, statut: 'confirme' },
  { id: 'i23', date: '2026-05-16', heure: '9h-11h', heureSort: '09:00', client: 'Lucie Blanc', ville: 'Aix 13100', couvreur: COUVREUR_UNIQUE, panneaux: 10, statut: 'a-confirmer' },
  { id: 'i24', date: '2026-05-19', heure: '8h-10h', heureSort: '08:00', client: 'Rachid Bouzid', ville: 'Marseille 13003', couvreur: COUVREUR_UNIQUE, panneaux: 8, statut: 'confirme' },
  { id: 'i25', date: '2026-05-20', heure: '10h-12h', heureSort: '10:00', client: 'Chantal Morin', ville: 'Toulon 83000', couvreur: COUVREUR_UNIQUE, panneaux: 16, statut: 'a-confirmer' },
  { id: 'i26', date: '2026-05-22', heure: '8h-10h', heureSort: '08:00', client: 'Henri Faure', ville: 'Nice 06000', couvreur: COUVREUR_UNIQUE, panneaux: 12, statut: 'confirme' },
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

function getPersisted() {
  return safeRead(KEY_INTERVENTIONS, [])
}

function setPersisted(data) {
  safeWrite(KEY_INTERVENTIONS, data)
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

function normalizeId(id) {
  return String(id)
}

function buildUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function heureToSort(heure = '') {
  return heure.replace(/h/, ':').replace(/-.*/, '').replace(/^(\d):/, '0$1:').slice(0, 5)
}

export function getInterventions() {
  const persisted = getPersisted()
  const overrides = getOverrides()

  const mocks = INTERVENTIONS_INIT
    .filter((i) => !overrides.supprimes.includes(normalizeId(i.id)))
    .map((i) => {
      const key = normalizeId(i.id)
      return { ...i, ...(overrides.modifs[key] || {}) }
    })

  return [...mocks, ...persisted]
}

export function addIntervention(data = {}) {
  const newIntervention = {
    id: buildUuid(),
    client: data.client || data.nom || '—',
    tel: data.tel || '—',
    ville: data.ville || '—',
    panneaux: Number(data.panneaux) || 0,
    date: data.date || new Date().toISOString().slice(0, 10),
    heure: data.heure || '8h-10h',
    heureSort: data.heureSort || heureToSort(data.heure || ''),
    couvreur: data.couvreur || COUVREUR_UNIQUE,
    statut: data.statut || 'a-confirmer',
    demandeId: data.demandeId ?? null,
    jour: data.jour || '',
  }

  const persisted = getPersisted()
  setPersisted([...persisted, newIntervention])

  if (newIntervention.demandeId != null) {
    updateDemande(newIntervention.demandeId, { statut: 'planifie' })
  }

  notify()
  return newIntervention
}

export function updateIntervention(id, patch = {}) {
  const key = normalizeId(id)
  const persisted = getPersisted()
  const idx = persisted.findIndex((i) => normalizeId(i.id) === key)

  if (idx >= 0) {
    const next = [...persisted]
    next[idx] = { ...next[idx], ...patch }
    setPersisted(next)
    notify()
    return
  }

  const existsInInit = INTERVENTIONS_INIT.some((i) => normalizeId(i.id) === key)
  if (!existsInInit) return

  const overrides = getOverrides()
  const prevPatch = overrides.modifs[key] || {}
  overrides.modifs[key] = { ...prevPatch, ...patch }
  setOverrides(overrides)
  notify()
}

export function removeIntervention(id) {
  const key = normalizeId(id)
  const persisted = getPersisted()
  const targetPersisted = persisted.find((i) => normalizeId(i.id) === key)

  if (targetPersisted) {
    setPersisted(persisted.filter((i) => normalizeId(i.id) !== key))

    if (targetPersisted.demandeId != null) {
      const stillLinked = getInterventions().some((i) => {
        if (normalizeId(i.id) === key) return false
        return i.demandeId != null && normalizeId(i.demandeId) === normalizeId(targetPersisted.demandeId)
      })
      if (!stillLinked) {
        updateDemande(targetPersisted.demandeId, { statut: 'nouveau' })
      }
    }

    notify()
    return
  }

  const existsInInit = INTERVENTIONS_INIT.some((i) => normalizeId(i.id) === key)
  if (!existsInInit) return

  const initIntervention = getInterventions().find((i) => normalizeId(i.id) === key)
  const overrides = getOverrides()
  if (!overrides.supprimes.includes(key)) {
    overrides.supprimes.push(key)
  }
  delete overrides.modifs[key]
  setOverrides(overrides)

  if (initIntervention?.demandeId != null) {
    const stillLinked = getInterventions().some((i) => {
      if (normalizeId(i.id) === key) return false
      return i.demandeId != null && normalizeId(i.demandeId) === normalizeId(initIntervention.demandeId)
    })
    if (!stillLinked) {
      updateDemande(initIntervention.demandeId, { statut: 'nouveau' })
    }
  }

  notify()
}

export function subscribe(cb) {
  if (typeof cb !== 'function') return () => {}

  const onChange = () => cb()
  const onStorage = (event) => {
    if (event.key === KEY_INTERVENTIONS || event.key === KEY_OVERRIDES) {
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
