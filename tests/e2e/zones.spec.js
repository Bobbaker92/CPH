import { test, expect } from './_helpers'

test.describe('Page /zones', () => {
  test('charge avec 6 départements', async ({ page }) => {
    await page.goto('/zones')
    await expect(page.locator('h1')).toContainText(/intervenons/i)
    await expect(page.locator('.zone-card')).toHaveCount(6)
  })

  test('contient Marseille, Toulon, Nice, Avignon', async ({ page }) => {
    await page.goto('/zones')
    await expect(page.locator('.zones-grid')).toContainText('Marseille')
    await expect(page.locator('.zones-grid')).toContainText('Toulon')
    await expect(page.locator('.zones-grid')).toContainText('Nice')
    await expect(page.locator('.zones-grid')).toContainText('Avignon')
  })

  test('CTA tel et /devis présents', async ({ page }) => {
    await page.goto('/zones')
    await expect(page.locator('.zones-cta a[href^="tel:"]')).toBeVisible()
    await expect(page.locator('.zones-cta a[href="/devis"]')).toBeVisible()
  })

  test('le footer landing pointe vers /zones', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer.footer a[href="/zones"]').click()
    await expect(page).toHaveURL(/\/zones/)
  })
})
