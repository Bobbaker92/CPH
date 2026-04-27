#!/usr/bin/env node
/**
 * Génère public/sitemap.xml à partir des routes publiques connues
 * + parse les slugs d'articles dans src/pages/Blog.jsx.
 *
 * Lancé via `npm run prebuild`.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SITE = process.env.SITE_URL || 'https://cphpaca.fr'
const TODAY = new Date().toISOString().slice(0, 10)

// Routes publiques statiques (priorité + fréquence inspirées du parcours commercial)
const STATIC_ROUTES = [
  { path: '/',                  priority: '1.0', changefreq: 'weekly' },
  { path: '/devis',             priority: '0.9', changefreq: 'monthly' },
  { path: '/blog',              priority: '0.8', changefreq: 'weekly' },
  { path: '/mentions-legales',  priority: '0.3', changefreq: 'yearly' },
  { path: '/cgv',               priority: '0.3', changefreq: 'yearly' },
  { path: '/confidentialite',   priority: '0.3', changefreq: 'yearly' },
]

// Routes à NE JAMAIS lister (cohérence avec robots.txt)
// /paiement, /confirmation, /connexion, /mot-de-passe-oublie : tunnel privé
// /admin/*, /client/*, /couvreur, /prospection : derrière auth

function extractBlogSlugs() {
  const blogPath = resolve(ROOT, 'src/pages/Blog.jsx')
  try {
    const content = readFileSync(blogPath, 'utf8')
    const slugs = []
    const regex = /slug:\s*['"]([a-z0-9-]+)['"]/g
    let m
    while ((m = regex.exec(content)) !== null) {
      slugs.push(m[1])
    }
    return slugs
  } catch (err) {
    console.warn(`[sitemap] impossible de lire ${blogPath} — articles ignorés`)
    return []
  }
}

function urlElement({ path, priority, changefreq, lastmod = TODAY }) {
  const loc = `${SITE}${path}`
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

function buildSitemap() {
  const blogUrls = extractBlogSlugs().map((slug) => ({
    path: `/blog/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
  }))

  const all = [...STATIC_ROUTES, ...blogUrls]

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...all.map(urlElement),
    '</urlset>',
    '',
  ].join('\n')
}

function main() {
  const outDir = resolve(ROOT, 'public')
  mkdirSync(outDir, { recursive: true })
  const outFile = resolve(outDir, 'sitemap.xml')
  writeFileSync(outFile, buildSitemap(), 'utf8')

  const slugs = extractBlogSlugs()
  console.log(`[sitemap] ${STATIC_ROUTES.length} routes statiques + ${slugs.length} articles → ${outFile}`)
}

main()
