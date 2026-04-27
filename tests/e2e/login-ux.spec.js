import { test, expect } from './_helpers'

test.describe('Login UX & accessibilité', () => {
  test('le champ email a le focus à l\'arrivée sur /connexion', async ({ page }) => {
    await page.goto('/connexion')
    const focused = await page.evaluate(() => document.activeElement?.id)
    expect(focused).toBe('login-email')
  })

  test('les inputs ont autocomplete et inputmode', async ({ page }) => {
    await page.goto('/connexion')
    await expect(page.locator('#login-email')).toHaveAttribute('autocomplete', 'email')
    await expect(page.locator('#login-email')).toHaveAttribute('inputmode', 'email')
    await expect(page.locator('#login-password')).toHaveAttribute('autocomplete', 'current-password')
  })

  test('le bouton "afficher mot de passe" a aria-label et aria-pressed', async ({ page }) => {
    await page.goto('/connexion')
    const toggle = page.locator('button[aria-label*="mot de passe"]')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('#login-password')).toHaveAttribute('type', 'text')
  })

  test('un mauvais mot de passe affiche un message d\'erreur role="alert"', async ({ page }) => {
    await page.goto('/connexion')
    await page.locator('#login-email').fill('admin@cphpaca.fr')
    await page.locator('#login-password').fill('mauvais-mdp')
    await page.locator('button[type="submit"]').click()

    const alert = page.locator('[role="alert"]')
    await expect(alert).toBeVisible({ timeout: 3000 })
    await expect(alert).toContainText(/incorrect|invalide|erreur|mot de passe/i)

    // Les inputs doivent passer en aria-invalid="true"
    await expect(page.locator('#login-email')).toHaveAttribute('aria-invalid', 'true')
  })

  test('les champs labels sont liés via htmlFor (cliquer le label focus le champ)', async ({ page }) => {
    await page.goto('/connexion')
    await page.locator('label[for="login-password"]').click()
    const focused = await page.evaluate(() => document.activeElement?.id)
    expect(focused).toBe('login-password')
  })
})
