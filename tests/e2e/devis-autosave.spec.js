import { test, expect } from './_helpers'

test.describe('Funnel /devis — auto-save brouillon', () => {
  test('quitter en cours puis revenir → état restauré', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/devis')

    // Étape 1 : choisir un nombre de panneaux
    const choice = page.locator('.choice-card').first()
    await choice.click()
    await page.locator('button:has-text("Continuer")').click()

    // Attendre que le debounce 400ms du save passe
    await page.waitForTimeout(550)

    // Quitter
    await page.goto('/')
    await page.goto('/devis')

    // Bandeau "Brouillon restauré" doit être visible
    await expect(page.locator('.funnel-draft-banner')).toBeVisible()
    await expect(page.locator('.funnel-draft-banner')).toContainText(/brouillon/i)

    // Le step doit être étape 2 (la précédente sélection est conservée)
    await expect(page.locator('text=/Étape 2/i').first()).toBeVisible()
  })

  test('le bouton "Recommencer à zéro" vide le brouillon', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/devis')
    await page.locator('.choice-card').first().click()
    await page.locator('button:has-text("Continuer")').click()
    await page.waitForTimeout(550)
    await page.goto('/devis') // re-entrée → bandeau

    await expect(page.locator('.funnel-draft-banner')).toBeVisible()
    await page.locator('button:has-text("Recommencer")').click()

    // Bandeau disparait, on revient à l'étape 1
    await expect(page.locator('.funnel-draft-banner')).toBeHidden()
    await expect(page.locator('text=/Étape 1/i').first()).toBeVisible()

    // localStorage doit être vidé
    const draft = await page.evaluate(() => localStorage.getItem('cph_devis_draft_v1'))
    expect(draft).toBeNull()
  })

  test('ne sauve PAS de brouillon si aucune réponse', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/devis')
    // Pas de click — juste arrivée sur la page
    await page.waitForTimeout(600) // dépasse le debounce 400ms
    const draft = await page.evaluate(() => localStorage.getItem('cph_devis_draft_v1'))
    expect(draft).toBeNull()
  })
})
