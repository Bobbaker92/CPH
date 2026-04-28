import { useContext } from 'react'
import { ToastContext } from './ToastContext'

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      success: () => 0, error: () => 0, info: () => 0, dismiss: () => {},
    }
  }
  return ctx
}
