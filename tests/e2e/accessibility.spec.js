import { test, expect } from './_helpers'

/**
 * Tests d'accessibilité basiques (sans axe-core pour rester sans deps).
 * Couvre les vérifications structurelles minimales attendues sur tout site
 * commercial public (RGAA niveau de base).
 */
test.describe('Accessibilité', () => {
  const PUBLIC_PAGES = ['/', '/blog', '/devis', '/connexion', '/mentions-legales', '/cgv', '/confidentialite']

  for (const path of PUBLIC_PAGES) {
    test(`${path} a un attribut lang fr sur <html>`, async ({ page }) => {
      await page.goto(path)
      const lang = await page.locator('html').getAttribute('lang')
      expect(lang).toMatch(/^fr/)
    })
  }

  // /connexion n'a pas de h1 (page form simple) — exclu volontairement
  for (const path of ['/', '/blog', '/devis', '/mentions-legales', '/cgv', '/confidentialite']) {
    test(`${path} contient au moins un <h1>`, async ({ page }) => {
      await page.goto(path)
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThanOrEqual(1)
    })
  }

  test('les boutons icône ont un aria-label', async ({ page }) => {
    await page.goto('/')
    // Burger menu mobile (le bouton existe même en desktop, juste display:none)
    const burger = page.locator('button.nav-burger')
    await expect(burger).toHaveAttribute('aria-label', /menu/i)
  })

  test('le bouton "Être rappelé" a un aria-label', async ({ page }) => {
    await page.goto('/')
    const fab = page.locator('button.callback-fab')
    await expect(fab).toHaveAttribute('aria-label', /rappel/i)
  })

  test('toutes les images ont un attribut alt', async ({ page }) => {
    await page.goto('/devis') // page riche en images de tuiles
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      // alt="" est OK pour les images décoratives, alt manquant non
      expect(alt).not.toBeNull()
    }
  })
})
