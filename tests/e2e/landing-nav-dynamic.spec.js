import { test, expect } from './_helpers'

test.describe('Landing nav — bouton Mon espace dynamique', () => {
  test('visiteur anonyme → "Mon espace" → /connexion', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    const btn = page.locator('.nav-desktop a:has-text("Mon espace")')
    await expect(btn).toBeVisible()
    await expect(btn).toHaveAttribute('href', '/connexion')
  })

  test('client connecté → "Bonjour {prénom}" → /client', async ({ page, context }) => {
    await context.clearCookies()
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        email: 'client@test.fr', role: 'client', nom: 'Marie Dupont',
      }))
    })
    await page.goto('/')
    const btn = page.locator('.nav-desktop a').filter({ hasText: /Bonjour Marie/ })
    await expect(btn).toBeVisible()
    await expect(btn).toHaveAttribute('href', '/client')
  })

  test('admin connecté → "Bonjour {prénom}" → /admin', async ({ page, context }) => {
    await context.clearCookies()
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        email: 'admin@cphpaca.fr', role: 'admin', nom: 'Fares',
      }))
    })
    await page.goto('/')
    const btn = page.locator('.nav-desktop a').filter({ hasText: /Bonjour Fares/ })
    await expect(btn).toHaveAttribute('href', '/admin')
  })

  test('couvreur connecté → "Bonjour {prénom}" → /couvreur', async ({ page, context }) => {
    await context.clearCookies()
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        email: 'karim@cphpaca.fr', role: 'couvreur', nom: 'Karim Ziani',
      }))
    })
    await page.goto('/')
    const btn = page.locator('.nav-desktop a').filter({ hasText: /Bonjour Karim/ })
    await expect(btn).toHaveAttribute('href', '/couvreur')
  })
})
