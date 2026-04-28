import { test, expect } from './_helpers'

test.describe('Login — remember email + CTA devis', () => {
  test('checkbox "Se souvenir" persiste l\'email après login', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/connexion')

    await page.locator('#login-email').fill('admin@cphpaca.fr')
    await page.locator('#login-password').fill('admin123')
    await page.locator('.login-remember input[type="checkbox"]').check()
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/admin/, { timeout: 5000 })

    const remembered = await page.evaluate(() => localStorage.getItem('cph_login_remembered_email'))
    expect(remembered).toBe('admin@cphpaca.fr')
  })

  test('si email mémorisé, le champ est pré-rempli au retour', async ({ page, context }) => {
    await context.clearCookies()
    await page.addInitScript(() => {
      localStorage.setItem('cph_login_remembered_email', 'admin@cphpaca.fr')
    })
    await page.goto('/connexion')
    const val = await page.locator('#login-email').inputValue()
    expect(val).toBe('admin@cphpaca.fr')
    // Et la checkbox doit être cochée
    await expect(page.locator('.login-remember input[type="checkbox"]')).toBeChecked()
  })

  test('CTA "Réserver une intervention" pointe vers /devis', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/connexion')
    const cta = page.locator('.login-cta-devis a[href="/devis"]')
    await expect(cta).toBeVisible()
    await expect(cta).toContainText(/r.server/i)
  })
})
