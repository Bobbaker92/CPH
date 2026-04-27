import { useEffect } from 'react'

const SITE = 'https://cphpaca.fr'
const DEFAULT_TITLE = 'CPH Solar — Nettoyage de panneaux solaires en région PACA'

function setMeta(selector, attrName, value) {
  if (!value) return
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    const [, key] = selector.match(/\[([\w:-]+)="([^"]+)"\]/) || []
    if (key === 'name' || key === 'property') {
      const m = selector.match(/\[(\w+)="([^"]+)"\]/)
      if (m) tag.setAttribute(m[1], m[2])
    }
    document.head.appendChild(tag)
  }
  tag.setAttribute(attrName, value)
}

function setCanonical(href) {
  if (!href) return
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

/**
 * Hook SEO minimaliste sans dépendance externe.
 * Patche document.title + meta description + Open Graph + canonical
 * + meta robots (pour les pages noindex).
 *
 * Au démontage, restore le titre par défaut. Les meta sont écrasées par la
 * page suivante, donc pas de cleanup nécessaire pour elles.
 */
export default function useSeo({
  title,
  description,
  path = '',
  noindex = false,
  ogImage,
} = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | CPH Solar` : DEFAULT_TITLE
    document.title = fullTitle

    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:url"]', 'content', `${SITE}${path}`)
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', description)
    if (ogImage) setMeta('meta[property="og:image"]', 'content', ogImage)
    setCanonical(`${SITE}${path}`)

    // Pages privées / légales : ne pas indexer
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex,follow' : 'index,follow')

    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title, description, path, noindex, ogImage])
}
