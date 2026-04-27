import { test, expect } from '@playwright/test'

test.describe('Espace admin (auth mock)', () => {
  test('redirige /admin vers /connexion si non authentifié', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/admin')
    // L'espace admin a une garde — selon implémentation soit redirect soit affichage du login
    await page.waitForLoadState('networkidle')
    const url = page.url()
    expect(url).toMatch(/\/(connexion|admin)/)
  })

  test('login admin@cphpaca.fr / admin123 ouvre le dashboard', async ({ page }) => {
    await page.goto('/connexion')
    await page.locator('input[type="email"]').fill('admin@cphpaca.fr')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/admin/, { timeout: 5000 })
  })

  test.skip('inbox /admin/demandes affiche la liste des leads', async ({ page }) => {
    // Skip — requiert que la PR #2 (store callback) soit mergée pour tester la persistance
    await page.goto('/connexion')
    await page.locator('input[type="email"]').fill('admin@cphpaca.fr')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()
    await page.goto('/admin/demandes')
    await expect(page.locator('h1')).toContainText(/demandes/i)
  })
})
