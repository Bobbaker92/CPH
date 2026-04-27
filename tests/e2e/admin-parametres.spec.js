import { test, expect } from './_helpers'

async function loginAdmin(page) {
  await page.goto('/connexion')
  await page.locator('#login-email').fill('admin@cphpaca.fr')
  await page.locator('#login-password').fill('admin123')
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 5000 })
}

test.describe('Admin /parametres', () => {
  test('la page se charge avec les sections Stats / Export / Import / Reset', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/parametres')
    await expect(page.locator('h1')).toContainText(/param/i)
    await expect(page.locator('text=/État actuel/i').first()).toBeVisible()
    await expect(page.locator('text=/Exporter/i').first()).toBeVisible()
    await expect(page.locator('text=/Importer/i').first()).toBeVisible()
    await expect(page.locator('text=/Réinitialiser/i').first()).toBeVisible()
  })

  test('le bouton "Réinitialiser" demande confirmation au premier clic', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/parametres')
    const resetBtn = page.locator('button:has-text("Réinitialiser")').first()
    await resetBtn.click()
    await expect(page.locator('button:has-text("Cliquer")').first()).toBeVisible()
  })

  test('export JSON déclenche un téléchargement', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/parametres')
    const downloadPromise = page.waitForEvent('download')
    await page.locator('button:has-text("Télécharger le JSON")').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/cph-export-\d{4}-\d{2}-\d{2}\.json/)
  })

  test('le lien Paramètres est dans la sidebar admin', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin')
    await expect(page.locator('a[href="/admin/parametres"]').first()).toBeVisible()
  })
})
