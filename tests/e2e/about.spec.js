import { test, expect } from './_helpers'

test.describe('Page /a-propos', () => {
  test('charge avec h1 + lead', async ({ page }) => {
    await page.goto('/a-propos')
    await expect(page.locator('h1')).toContainText(/Karim/i)
    await expect(page.locator('.about-lede')).toContainText(/12 ans|800/)
  })

  test('affiche les 4 stats', async ({ page }) => {
    await page.goto('/a-propos')
    await expect(page.locator('.about-stat')).toHaveCount(4)
  })

  test('affiche les 4 certifications', async ({ page }) => {
    await page.goto('/a-propos')
    await expect(page.locator('.about-certif')).toHaveCount(4)
    await expect(page.locator('.about-certifs')).toContainText(/Qualibat/)
    await expect(page.locator('.about-certifs')).toContainText(/RGE/)
    await expect(page.locator('.about-certifs')).toContainText(/Décennale/)
  })

  test('CTA téléphone et /devis présents', async ({ page }) => {
    await page.goto('/a-propos')
    await expect(page.locator('.about-cta a[href^="tel:"]')).toBeVisible()
    await expect(page.locator('.about-cta a[href="/devis"]')).toBeVisible()
  })

  test('le JSON-LD Person est injecté', async ({ page }) => {
    await page.goto('/a-propos')
    const jsonLd = await page.locator('script#jsonld-about-person').textContent()
    const parsed = JSON.parse(jsonLd)
    expect(parsed['@type']).toBe('Person')
    expect(parsed.name).toBe('Karim Ziani')
  })

  test('le footer landing pointe vers /a-propos', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer.footer a[href="/a-propos"]').click()
    await expect(page).toHaveURL(/\/a-propos/)
  })
})
