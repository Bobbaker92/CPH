const ACCOUNTS_KEY = 'cph_client_accounts_v1'

function hashPassword(pwd) {
  let h = 0x811c9dc5
  for (let i = 0; i < pwd.length; i++) {
    h ^= pwd.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

function readAll() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(accounts) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // quota exceeded — ignore in maquette
  }
}

function generatePassword() {
  const words = ['Soleil', 'Toit', 'Azur', 'Mistral', 'Olivier', 'Provence', 'Calanque', 'Garrigue']
  const w = words[Math.floor(Math.random() * words.length)]
  const n = Math.floor(1000 + Math.random() * 9000)
  return `${w}-${n}`
}

export function getClientAccount(email) {
  if (!email) return null
  return readAll()[email.toLowerCase()] || null
}

export function createClientAccount({ email, nom, tel, reservationId }) {
  const key = email.toLowerCase()
  const accounts = readAll()
  if (accounts[key]) {
    return { account: accounts[key], password: null, reused: true }
  }
  const password = generatePassword()
  const account = {
    email: key,
    nom: nom || '',
    tel: tel || '',
    reservationId: reservationId || '',
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  }
  accounts[key] = account
  writeAll(accounts)
  return { account, password, reused: false }
}

export function verifyClientPassword(email, password) {
  const account = getClientAccount(email)
  if (!account) return false
  return account.passwordHash === hashPassword(password)
}

export function changeClientPassword(email, currentPassword, newPassword) {
  const key = email.toLowerCase()
  const accounts = readAll()
  const account = accounts[key]
  if (!account) return { ok: false, reason: 'not_found' }
  if (account.passwordHash !== hashPassword(currentPassword)) {
    return { ok: false, reason: 'wrong_password' }
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, reason: 'too_short' }
  }
  accounts[key] = {
    ...account,
    passwordHash: hashPassword(newPassword),
    passwordUpdatedAt: new Date().toISOString(),
  }
  writeAll(accounts)
  return { ok: true }
}

export function resetClientPasswordByAdmin(email, { nom, tel } = {}) {
  const key = email.toLowerCase()
  const accounts = readAll()
  const newPassword = generatePassword()
  const existing = accounts[key] || {
    email: key,
    nom: nom || '',
    tel: tel || '',
    reservationId: '',
    createdAt: new Date().toISOString(),
  }
  accounts[key] = {
    ...existing,
    nom: existing.nom || nom || '',
    tel: existing.tel || tel || '',
    passwordHash: hashPassword(newPassword),
    passwordUpdatedAt: new Date().toISOString(),
    resetByAdmin: true,
  }
  writeAll(accounts)
  return { account: accounts[key], password: newPassword, created: !accounts[key].createdAt || accounts[key].createdAt === accounts[key].passwordUpdatedAt }
}

export const CLIENT_AUTH_INTERNAL = { ACCOUNTS_KEY, hashPassword, generatePassword }
