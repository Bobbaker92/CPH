// Note : ce fichier IMPORTE le test brut de Playwright (pas le fixture
// _helpers.js qui auto-accepte les cookies), pour pouvoir tester le
// bandeau lui-même.
import { test, expect } from '@playwright/test'

test.describe('Bandeau cookies CNIL', () => {
  test.beforeEach(async ({ context }) => {
    // Vide localStorage pour que le bandeau apparaisse à chaque test
    await context.clearCookies()
  })

  test('s\'affiche en bas de page à la 1ère visite', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.cookie-banner')).toBeVisible()
    await expect(page.locator('.cookie-banner')).toContainText(/cookies/i)
  })

  test('contient les 3 boutons CNIL : Personnaliser, Tout refuser, Tout accepter', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.cookie-banner button:has-text("Personnaliser")')).toBeVisible()
    await expect(page.locator('.cookie-banner button:has-text("Tout refuser")')).toBeVisible()
    await expect(page.locator('.cookie-banner button:has-text("Tout accepter")')).toBeVisible()
  })

  test('cliquer "Tout accepter" cache le bandeau et persiste le choix', async ({ page }) => {
    await page.goto('/')
    await page.locator('.cookie-banner button:has-text("Tout accepter")').click()
    await expect(page.locator('.cookie-banner')).toBeHidden()

    // Refresh : le bandeau ne réapparaît pas
    await page.reload()
    await expect(page.locator('.cookie-banner')).toBeHidden()

    // Vérification du contenu localStorage
    const stored = await page.evaluate(() => localStorage.getItem('cph_cookie_consent_v1'))
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored)
    expect(parsed.choice).toBe('accepted')
    expect(parsed.categories.analytics).toBe(true)
  })

  test('cliquer "Tout refuser" enregistre choice=refused', async ({ page }) => {
    await page.goto('/')
    await page.locator('.cookie-banner button:has-text("Tout refuser")').click()
    await expect(page.locator('.cookie-banner')).toBeHidden()

    const stored = await page.evaluate(() => localStorage.getItem('cph_cookie_consent_v1'))
    const parsed = JSON.parse(stored)
    expect(parsed.choice).toBe('refused')
    expect(parsed.categories.analytics).toBe(false)
  })

  test('cliquer "Personnaliser" ouvre la modale détails', async ({ page }) => {
    await page.goto('/')
    await page.locator('.cookie-banner button:has-text("Personnaliser")').click()
    await expect(page.locator('.cookie-modal')).toBeVisible()
    await expect(page.locator('.cookie-modal')).toContainText(/Préférences cookies/i)
    await expect(page.locator('.cookie-modal')).toContainText(/Nécessaires/i)
  })

  test('le bandeau est caché sur les espaces privés (/admin)', async ({ page }) => {
    // /admin nécessite login mais redirige et le bandeau ne doit PAS apparaître
    // sur les routes privées même non authentifié (cf. PRIVATE_PREFIXES)
    await page.goto('/admin')
    await expect(page.locator('.cookie-banner')).toBeHidden()
  })

  test('"Gérer mes cookies" en footer rouvre le bandeau après acceptation', async ({ page }) => {
    await page.goto('/')
    await page.locator('.cookie-banner button:has-text("Tout accepter")').click()
    await expect(page.locator('.cookie-banner')).toBeHidden()

    // Le bouton "Gérer mes cookies" est dans le footer landing
    await page.locator('footer.footer button.cookie-reopen').click()
    await expect(page.locator('.cookie-banner')).toBeVisible()
  })
})
