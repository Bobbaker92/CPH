import { useEffect, useState } from 'react'

const KEY = 'cph_cookie_consent_v1'
const TTL_MS = 13 * 30 * 24 * 60 * 60 * 1000 // 13 mois (recommandation CNIL)

const bus = new EventTarget()

const DEFAULT_CATEGORIES = {
  necessary: true, // toujours actif, non désactivable
  analytics: false, // mesure d'audience, optionnel
}

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.timestamp) return null
    if (Date.now() - parsed.timestamp > TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function write(consent) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...consent, timestamp: Date.now() }))
    bus.dispatchEvent(new Event('change'))
  } catch {
    // localStorage indisponible (mode privé strict) : on ne peut pas persister
  }
}

export function getConsent() {
  return read()
}

export function setConsent(choice, categories = {}) {
  write({
    choice, // 'accepted' | 'refused' | 'customized'
    categories: { ...DEFAULT_CATEGORIES, ...categories, necessary: true },
  })
}

export function clearConsent() {
  try {
    localStorage.removeItem(KEY)
    bus.dispatchEvent(new Event('change'))
  } catch {
    // ignore
  }
}

export function useCookieConsent() {
  const [consent, setConsentState] = useState(() => read())

  useEffect(() => {
    const onChange = () => setConsentState(read())
    bus.addEventListener('change', onChange)
    window.addEventListener('storage', (e) => {
      if (e.key === KEY) onChange()
    })
    return () => bus.removeEventListener('change', onChange)
  }, [])

  return {
    consent,
    accept: () => setConsent('accepted', { analytics: true }),
    refuse: () => setConsent('refused', { analytics: false }),
    customize: (categories) => setConsent('customized', categories),
    reopen: clearConsent,
  }
}
