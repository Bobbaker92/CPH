import { test, expect } from './_helpers'

test.describe('FAQ landing', () => {
  test('section FAQ visible avec au moins 6 questions', async ({ page }) => {
    await page.goto('/')
    await page.locator('#faq').scrollIntoViewIfNeeded()
    await expect(page.locator('#faq')).toBeVisible()
    const items = page.locator('#faq .faq-item')
    await expect.poll(async () => await items.count()).toBeGreaterThanOrEqual(6)
  })

  test('cliquer une question l\'ouvre (accordéon natif <details>)', async ({ page }) => {
    await page.goto('/')
    await page.locator('#faq').scrollIntoViewIfNeeded()
    const firstItem = page.locator('#faq .faq-item').first()

    await expect(firstItem).not.toHaveAttribute('open', '')
    await firstItem.locator('summary').click()
    await expect(firstItem).toHaveAttribute('open', '')
  })

  test('le JSON-LD FAQPage est injecté dans le head', async ({ page }) => {
    await page.goto('/')
    const jsonLd = await page.locator('script#jsonld-landing-faq').textContent()
    expect(jsonLd).toBeTruthy()
    const parsed = JSON.parse(jsonLd)
    expect(parsed['@type']).toBe('FAQPage')
    expect(parsed.mainEntity.length).toBeGreaterThanOrEqual(6)
  })
})
