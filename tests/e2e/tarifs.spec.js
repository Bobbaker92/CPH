import { test, expect } from './_helpers'

test.describe('Page /tarifs', () => {
  test('charge avec h1 + 3 packs', async ({ page }) => {
    await page.goto('/tarifs')
    await expect(page.locator('h1')).toContainText(/co.te|tarif/i)
    await expect(page.locator('.tarif-card')).toHaveCount(3)
  })

  test('affiche les 2 prix numériques (199 et 179) et "Sur devis"', async ({ page }) => {
    await page.goto('/tarifs')
    await expect(page.locator('.tarif-card').nth(0)).toContainText('199')
    await expect(page.locator('.tarif-card').nth(1)).toContainText('179')
    await expect(page.locator('.tarif-card').nth(2)).toContainText(/Sur devis/i)
  })

  test('CTA réserver/devis pointent vers /devis', async ({ page }) => {
    await page.goto('/tarifs')
    const ctas = page.locator('.tarif-card a[href="/devis"]')
    await expect(ctas).toHaveCount(3)
  })

  test('JSON-LD OfferCatalog injecté', async ({ page }) => {
    await page.goto('/tarifs')
    const json = await page.locator('script#jsonld-tarifs-offers').textContent()
    const parsed = JSON.parse(json)
    expect(parsed['@type']).toBe('OfferCatalog')
    expect(parsed.itemListElement.length).toBe(2) // 2 offres avec prix numériques
  })

  test('le footer landing pointe vers /tarifs', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer.footer a[href="/tarifs"]').click()
    await expect(page).toHaveURL(/\/tarifs/)
  })
})
