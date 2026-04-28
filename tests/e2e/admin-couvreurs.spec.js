import { test, expect } from './_helpers'

async function loginAdmin(page) {
  await page.goto('/connexion')
  await page.locator('#login-email').fill('admin@cphpaca.fr')
  await page.locator('#login-password').fill('admin123')
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 5000 })
}

test.describe('Admin /couvreurs', () => {
  test('affiche au moins 1 couvreur (Karim)', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/couvreurs')
    await expect(page.locator('h1')).toContainText(/couvreurs/i)
    await expect(page.locator('.couvreur-card')).toHaveCount(1)
    await expect(page.locator('.couvreur-card')).toContainText(/Karim/)
  })

  test('le CA affiché correspond au nb d\'interventions terminées x 199', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/couvreurs')
    const ca = await page.locator('.couvreur-stats').first().locator('.couvreur-stat-val').nth(2).textContent()
    const caNum = parseInt(ca.replace(/\D/g, ''))
    // Multiple de 199 attendu (peut être 0 si aucune intervention terminée)
    expect(caNum % 199).toBe(0)
  })

  test('le bouton "Voir planning" affiche le compte d\'interventions', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/couvreurs')
    const btn = page.locator('button:has-text("Voir planning")').first()
    await expect(btn).toBeVisible()
    // Format attendu : "Voir planning (X)" avec X numérique
    const text = await btn.textContent()
    expect(text).toMatch(/Voir planning \(\d+\)/)
  })

  test('les zones et certifications sont affichées', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/couvreurs')
    const card = page.locator('.couvreur-card').first()
    await expect(card).toContainText(/Marseille|Aubagne|Aix|Toulon/)
    await expect(card).toContainText(/Qualibat/)
  })
})
