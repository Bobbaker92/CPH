import { test, expect } from './_helpers'

test.describe('Page 404', () => {
  test('une URL inconnue affiche la page NotFound', async ({ page }) => {
    await page.goto('/route-qui-nexiste-pas-du-tout')
    await expect(page.locator('text=/404/').first()).toBeVisible()
    await expect(page.locator('h1')).toContainText(/n.existe pas/i)
  })

  test('a un CTA pour retourner à l\'accueil', async ({ page }) => {
    await page.goto('/url-bidon')
    const home = page.locator('a[href="/"]').first()
    await expect(home).toBeVisible()
    await home.click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('a un CTA pour /devis', async ({ page }) => {
    await page.goto('/encore-une-url-bidon')
    await expect(page.locator('a[href="/devis"]').first()).toBeVisible()
  })

  test('affiche le téléphone et l\'email', async ({ page }) => {
    await page.goto('/inconnue')
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible()
    await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible()
  })
})
