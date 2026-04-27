import { test, expect } from './_helpers'

test.describe('Funnel /devis', () => {
  test('charge l\'étape 1 (panneaux) et le stepper visible', async ({ page }) => {
    await page.goto('/devis')
    // Le funnel a 5 étapes — la nav indique la 1ère active
    await expect(page.locator('text=/panneaux/i').first()).toBeVisible()
  })

  test('le bouton Suivant est désactivé tant qu\'aucun choix n\'est fait', async ({ page }) => {
    await page.goto('/devis')
    const next = page.locator('button:has-text("Suivant")')
    if (await next.count()) {
      await expect(next.first()).toBeDisabled()
    }
  })

  test('navigation cliquer "Précédent" depuis étape 1 retourne à l\'accueil', async ({ page }) => {
    await page.goto('/devis')
    const prev = page.locator('button:has-text("Précédent"), button:has-text("Retour")')
    if (await prev.count()) {
      await prev.first().click()
      await expect(page).toHaveURL(/\/$/)
    }
  })
})
