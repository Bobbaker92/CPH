const KEY_DEMANDES = 'cph_demandes_v1'
const KEY_OVERRIDES = 'cph_demandes_overrides_v1'

const bus = new EventTarget()

export const DEMANDES_INIT = [
  {
    id: 107, nom: 'Louise Arnaud', tel: '06 98 12 34 56', email: '—',
    ville: 'Marseille 13006', adresse: '—',
    panneaux: '—', tuile: '—', integration: 'unknown', etage: '—',
    dateRecu: 'Aujourd\'hui 11:14', statut: 'nouveau', source: 'Rappel demandé', notes: 'Dispo : après-midi. Source : bouton flottant landing.',
  },
  {
    id: 108, nom: 'Mathieu Gilles', tel: '07 44 55 66 77', email: 'mgilles@free.fr',
    ville: 'Aubagne 13400', adresse: '—',
    panneaux: '16-24', tuile: 'canal', integration: 'integre', etage: 'etage',
    dateRecu: 'Aujourd\'hui 10:05', statut: 'nouveau', source: 'Paiement abandonné', notes: 'Arrivé jusqu\'à la CB. Créneau choisi : 12 mai 10h-12h. N\'a pas finalisé.',
  },
  {
    id: 101, nom: 'Pierre Vidal', tel: '06 12 34 56 78', email: 'p.vidal@free.fr',
    ville: 'Marseille 13008', adresse: '12 rue Paradis',
    panneaux: '10-16', tuile: 'romane', integration: 'surimposition', etage: 'plain-pied',
    dateRecu: 'Aujourd\'hui 10:42', statut: 'nouveau', source: 'Formulaire', notes: '',
  },
  {
    id: 102, nom: 'Sophie Lambert', tel: '07 88 21 45 90', email: 'sophie.l@gmail.com',
    ville: 'Aix-en-Provence', adresse: '5 chemin des Pinsons',
    panneaux: '16-24', tuile: 'canal', integration: 'integre', etage: 'etage',
    dateRecu: 'Aujourd\'hui 09:15', statut: 'nouveau', source: 'Formulaire',
    notes: 'Panneaux intégrés, attention étanchéité',
  },
  {
    id: 103, nom: 'Stéphane Bennani', tel: '06 45 78 12 03', email: 's.bennani@orange.fr',
    ville: 'Aubagne 13400', adresse: '28 avenue de la Liberté',
    panneaux: '6-10', tuile: 'redland', integration: 'surimposition', etage: 'plain-pied',
    dateRecu: 'Hier 16:30', statut: 'a-rappeler', source: 'Formulaire',
    notes: 'Pas de réponse au 1er appel',
  },
  {
    id: 104, nom: 'Isabelle Morel', tel: '06 77 44 22 11', email: 'imorel@yahoo.fr',
    ville: 'Gardanne 13120', adresse: '3 allée des Oliviers',
    panneaux: '24+', tuile: 'plate', integration: 'unknown', etage: 'immeuble',
    dateRecu: 'Hier 14:08', statut: 'planifie', source: 'Téléphone',
    notes: 'RDV le 18 mai 8h-10h avec Karim',
  },
  {
    id: 105, nom: 'Julien Roussel', tel: '06 22 11 00 77', email: 'j.roussel@laposte.net',
    ville: 'Toulon 83000', adresse: '45 rue Anatole France',
    panneaux: '10-16', tuile: 'canal', integration: 'surimposition', etage: 'etage',
    dateRecu: 'Il y a 2 jours', statut: 'planifie', source: 'Formulaire',
    notes: '',
  },
  {
    id: 106, nom: 'Carla Neves', tel: '07 01 23 45 67', email: 'carla.n@hotmail.fr',
    ville: 'Nice 06000', adresse: '8 boulevard Gambetta',
    panneaux: '6-10', tuile: 'bac-acier', integration: 'surimposition', etage: 'plain-pied',
    dateRecu: 'Il y a 3 jours', statut: 'refuse', source: 'Formulaire',
    notes: 'Client a choisi un autre prestataire',
  },
  {
    id: 109, nom: 'Sabrina Cohen', tel: '06 01 02 03 04', email: 'scohen@yahoo.fr',
    ville: 'Aix 13100', adresse: '—',
    panneaux: '10-16', tuile: '—', integration: 'unknown', etage: '—',
    dateRecu: 'Il y a 4 jours', statut: 'a-rappeler', source: 'Formulaire abandonné',
    notes: 'A rempli 3 étapes sur 5 (panneaux, maison, toiture) puis quitté. Tel saisi à l\'étape 5.',
  },
]

export const SOURCE_META = {
  Formulaire: { cls: 'source-form', icon: '📝' },
  Téléphone: { cls: 'source-phone', icon: '📞' },
  Manuel: { cls: 'source-manual', icon: '👤' },
  'Rappel demandé': { cls: 'source-callback', icon: '📞' },
  'Formulaire abandonné': { cls: 'source-abandon', icon: '⚠️' },
  'Paiement abandonné': { cls: 'source-hot', icon: '🔥' },
}

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

function getLeadsPersistes() {
  return safeRead(KEY_DEMANDES, [])
}

function getOverrides() {
  const parsed = safeRead(KEY_OVERRIDES, {})
  return {
    modifs: parsed?.modifs && typeof parsed.modifs === 'object' ? parsed.modifs : {},
    supprimes: Array.isArray(parsed?.supprimes) ? parsed.supprimes : [],
  }
}

function setLeadsPersistes(leads) {
  safeWrite(KEY_DEMANDES, leads)
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

function withDefaults(data = {}) {
  return {
    nom: data.nom || '—',
    tel: data.tel || '—',
    email: data.email || '—',
    ville: data.ville || '—',
    adresse: data.adresse || '—',
    panneaux: data.panneaux || '—',
    tuile: data.tuile || '—',
    integration: data.integration || 'unknown',
    etage: data.etage || '—',
    notes: data.notes || data.note || '',
  }
}

export function getDemandes() {
  const leads = getLeadsPersistes()
  const overrides = getOverrides()
  const supprimesSet = new Set(overrides.supprimes.map((id) => normalizeId(id)))

  const mocks = DEMANDES_INIT
    .filter((d) => !supprimesSet.has(normalizeId(d.id)))
    .map((d) => {
      const key = normalizeId(d.id)
      return { ...d, ...(overrides.modifs[key] || {}) }
    })

  return [...leads, ...mocks]
}

export function addDemande(data = {}) {
  const nouvelleDemande = {
    id: buildUuid(),
    ...withDefaults(data),
    dateRecu: 'À l\'instant',
    statut: data.statut || 'nouveau',
    source: data.source || 'Rappel demandé',
  }

  const leads = getLeadsPersistes()
  setLeadsPersistes([nouvelleDemande, ...leads])
  notify()
  return nouvelleDemande
}

export function updateDemande(id, patch = {}) {
  const demandeId = normalizeId(id)
  const leads = getLeadsPersistes()
  const idx = leads.findIndex((d) => normalizeId(d.id) === demandeId)

  if (idx >= 0) {
    const next = [...leads]
    next[idx] = { ...next[idx], ...patch }
    setLeadsPersistes(next)
    notify()
    return
  }

  const existeDansMocks = DEMANDES_INIT.some((d) => normalizeId(d.id) === demandeId)
  if (!existeDansMocks) return

  const overrides = getOverrides()
  const modifsExistantes = overrides.modifs[demandeId] || {}
  overrides.modifs[demandeId] = { ...modifsExistantes, ...patch }
  setOverrides(overrides)
  notify()
}

export function removeDemande(id) {
  const demandeId = normalizeId(id)
  const leads = getLeadsPersistes()
  const idx = leads.findIndex((d) => normalizeId(d.id) === demandeId)

  if (idx >= 0) {
    const next = leads.filter((d) => normalizeId(d.id) !== demandeId)
    setLeadsPersistes(next)
    notify()
    return
  }

  const existeDansMocks = DEMANDES_INIT.some((d) => normalizeId(d.id) === demandeId)
  if (!existeDansMocks) return

  const overrides = getOverrides()
  if (!overrides.supprimes.some((idValue) => normalizeId(idValue) === demandeId)) {
    overrides.supprimes.push(demandeId)
  }
  delete overrides.modifs[demandeId]
  setOverrides(overrides)
  notify()
}

export function subscribe(cb) {
  if (typeof cb !== 'function') return () => {}

  const onChange = () => cb()
  const onStorage = (event) => {
    if (event.key === KEY_DEMANDES || event.key === KEY_OVERRIDES) {
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
