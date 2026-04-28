import { test, expect } from './_helpers'

test.describe('Landing nav — bouton logout', () => {
  test('user connecté → bouton logout visible avec icône', async ({ page, context }) => {
    await context.clearCookies()
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        email: 'client@test.fr', role: 'client', nom: 'Marie',
      }))
    })
    await page.goto('/')
    const logoutBtn = page.locator('.nav-logout-btn')
    await expect(logoutBtn).toBeVisible()
    await expect(logoutBtn).toHaveAttribute('aria-label', /déconnecter/i)
  })

  test('cliquer logout vide localStorage.user et bascule en "Mon espace"', async ({ page, context }) => {
    await context.clearCookies()
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        email: 'client@test.fr', role: 'client', nom: 'Marie',
      }))
    })
    await page.goto('/')
    await expect(page.locator('text=/Bonjour Marie/i').first()).toBeVisible()

    await page.locator('.nav-logout-btn').click()

    // Le bouton "Bonjour Marie" disparaît
    await expect(page.locator('.nav-user-group')).toBeHidden()
    // Et "Mon espace" → /connexion réapparaît
    await expect(page.locator('.nav-desktop a:has-text("Mon espace")')).toBeVisible()

    // localStorage.user vidé
    const user = await page.evaluate(() => localStorage.getItem('user'))
    expect(user).toBeNull()
  })

  test('visiteur anonyme → pas de bouton logout', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.locator('.nav-logout-btn')).toHaveCount(0)
  })
})
