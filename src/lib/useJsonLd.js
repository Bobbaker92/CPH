import { useEffect } from 'react'

/**
 * Injecte un bloc <script type="application/ld+json"> dans le <head>.
 * Identifié par `id` pour pouvoir être remplacé/supprimé proprement
 * lors du démontage du composant.
 *
 * Utilisé pour les rich snippets Google (Breadcrumb, Article, FAQ, etc.)
 * sur les pages publiques.
 */
export default function useJsonLd(id, payload) {
  useEffect(() => {
    if (!id || !payload) return undefined

    const elementId = `jsonld-${id}`
    let el = document.head.querySelector(`script#${elementId}`)
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = elementId
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(payload)

    return () => {
      const node = document.head.querySelector(`script#${elementId}`)
      if (node) node.remove()
    }
  }, [id, payload])
}
