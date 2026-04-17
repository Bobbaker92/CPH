const KEYS = {
  prospectionRdvs: 'cph_prospection_rdvs_v1',
  planningInterventions: 'cph_planning_interventions_v1',
}

export function readSyncedData(key, fallbackValue) {
  if (typeof window === 'undefined') return fallbackValue
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallbackValue
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallbackValue
  } catch {
    return fallbackValue
  }
}

export function writeSyncedData(key, value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // noop
  }
}

export function subscribeSyncedData(key, onChange) {
  if (typeof window === 'undefined') return () => {}
  const handler = (event) => {
    if (event.key === key) onChange()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

export const DATA_SYNC_KEYS = KEYS
