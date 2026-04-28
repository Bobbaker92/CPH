import { useState, useCallback, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { ToastContext } from './ToastContext'

/**
 * Système de toast notifications minimaliste.
 *
 * Usage :
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 *
 * Dans n'importe quel composant :
 *   const toast = useToast()
 *   toast.success('Message')
 *   toast.error('Erreur')
 *   toast.info('Info')
 *
 * Les toasts s'auto-ferment après 4 secondes (configurable).
 * Empilés en haut à droite (desktop) / en bas (mobile).
 */

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((type, message, opts = {}) => {
    const id = nextId++
    const duration = opts.duration ?? 4000
    setToasts((current) => [...current, { id, type, message }])
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }, [remove])

  const api = {
    success: (msg, opts) => push('success', msg, opts),
    error: (msg, opts) => push('error', msg, opts),
    info: (msg, opts) => push('info', msg, opts),
    dismiss: remove,
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const ICONS = {
  success: <CheckCircle size={18} />,
  error: <AlertTriangle size={18} />,
  info: <Info size={18} />,
}

function ToastItem({ toast, onClose }) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => () => setLeaving(true), [])
  return (
    <div
      className={`toast toast-${toast.type} ${leaving ? 'toast-leaving' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast-icon" aria-hidden="true">{ICONS[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Fermer la notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}
