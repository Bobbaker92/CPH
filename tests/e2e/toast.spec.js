import { test, expect } from './_helpers'

async function loginAdmin(page) {
  await page.goto('/connexion')
  await page.locator('#login-email').fill('admin@cphpaca.fr')
  await page.locator('#login-password').fill('admin123')
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 5000 })
}

test.describe('Toast notifications', () => {
  test('changer le statut d\'une demande affiche un toast success', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/demandes')

    // Ouvrir le menu d'actions de la 1ère demande et cliquer "Marquer planifié"
    const firstCard = page.locator('.demande-card').first()
    await firstCard.locator('.action-menu > button').first().click()
    await page.locator('text=/Marquer planifi/i').first().click()

    // Toast attendu
    const toast = page.locator('.toast.toast-success')
    await expect(toast).toBeVisible({ timeout: 3000 })
    await expect(toast).toContainText(/Statut mis à jour|Planifi/i)
  })

  test('le toast disparaît après ~4 secondes', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/demandes')
    const firstCard = page.locator('.demande-card').first()
    await firstCard.locator('.action-menu > button').first().click()
    await page.locator('text=/Marquer planifi/i').first().click()

    await expect(page.locator('.toast').first()).toBeVisible({ timeout: 3000 })
    // Toast auto-dismiss à 4000ms
    await expect(page.locator('.toast')).toHaveCount(0, { timeout: 5500 })
  })

  test('cliquer la croix du toast le ferme immédiatement', async ({ page }) => {
    await loginAdmin(page)
    await page.goto('/admin/demandes')
    const firstCard = page.locator('.demande-card').first()
    await firstCard.locator('.action-menu > button').first().click()
    await page.locator('text=/Marquer nouveau/i').first().click()

    const toast = page.locator('.toast').first()
    await expect(toast).toBeVisible()
    await toast.locator('.toast-close').click()
    await expect(toast).toBeHidden({ timeout: 1000 })
  })
})
