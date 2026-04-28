import { test, expect } from './_helpers'

test.describe('Newsletter signup (footer landing)', () => {
  test('formulaire visible avec email + bouton', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.locator('.newsletter-section').scrollIntoViewIfNeeded()
    await expect(page.locator('.newsletter-card')).toBeVisible()
    await expect(page.locator('.newsletter-input-row input[type="email"]')).toBeVisible()
    await expect(page.locator('.newsletter-input-row button')).toBeVisible()
  })

  test('inscription : valide l\'email + persiste en localStorage + remerciement', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.locator('.newsletter-section').scrollIntoViewIfNeeded()

    await page.locator('.newsletter-input-row input').fill('test@example.com')
    await page.locator('.newsletter-input-row button').click()

    await expect(page.locator('.newsletter-thanks')).toBeVisible({ timeout: 2000 })
    await expect(page.locator('.newsletter-thanks')).toContainText(/test@example\.com/)

    const stored = await page.evaluate(() => localStorage.getItem('cph_newsletter_v1'))
    expect(stored).toContain('test@example.com')
  })

  test('si déjà inscrit, affiche directement le remerciement', async ({ page, context }) => {
    await context.clearCookies()
    await page.addInitScript(() => {
      localStorage.setItem('cph_newsletter_v1', JSON.stringify({
        email: 'deja@inscrit.fr',
        subscribedAt: new Date().toISOString(),
      }))
    })
    await page.goto('/')
    await page.locator('.newsletter-section').scrollIntoViewIfNeeded()
    await expect(page.locator('.newsletter-thanks')).toBeVisible()
    await expect(page.locator('.newsletter-thanks')).toContainText(/deja@inscrit\.fr/)
  })

  test('email invalide → pas de submit (HTML5 validation)', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.locator('.newsletter-section').scrollIntoViewIfNeeded()
    await page.locator('.newsletter-input-row input').fill('pas-un-email')
    await page.locator('.newsletter-input-row button').click()
    // L'email est invalide → le form ne submit pas, le remerciement n'apparait pas
    await expect(page.locator('.newsletter-thanks')).toBeHidden()
  })
})
