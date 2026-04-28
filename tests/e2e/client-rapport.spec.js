import { test, expect } from './_helpers'

async function loginClient(page) {
  await page.goto('/connexion')
  await page.locator('#login-email').fill('client@test.fr')
  await page.locator('#login-password').fill('client123')
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(/\/client/, { timeout: 5000 })
}

test.describe('Client /rapport — layout pro + impression', () => {
  test('le bouton "Imprimer" est visible', async ({ page }) => {
    await loginClient(page)
    await page.goto('/client/rapport')
    await expect(page.locator('button:has-text("Imprimer")').first()).toBeVisible()
  })

  test('les infos client sont affichées', async ({ page }) => {
    await loginClient(page)
    await page.goto('/client/rapport')
    await expect(page.locator('.rapport-client-info')).toBeVisible()
    await expect(page.locator('.rapport-client-info')).toContainText(/Marie Dupont|client/i)
    await expect(page.locator('.rapport-client-info')).toContainText(/Karim/i)
  })

  test('la signature couvreur est présente', async ({ page }) => {
    await loginClient(page)
    await page.goto('/client/rapport')
    await expect(page.locator('.rapport-signature')).toBeVisible()
    await expect(page.locator('.rapport-signature-pad')).toContainText(/Karim/i)
  })

  test('cliquer "Imprimer" appelle window.print()', async ({ page }) => {
    await loginClient(page)
    await page.goto('/client/rapport')

    // Mock window.print pour vérifier qu'il est appelé
    await page.evaluate(() => { window.__printCalled = false; window.print = () => { window.__printCalled = true } })
    await page.locator('button:has-text("Imprimer")').first().click()
    const called = await page.evaluate(() => window.__printCalled)
    expect(called).toBe(true)
  })
})
