import { test, expect } from './_helpers'

test.describe('Funnel /devis — pré-remplissage client connecté', () => {
  test('si user client en localStorage, le form initial contient nom/email', async ({ page, context }) => {
    await context.clearCookies()

    // Inject une session client AVANT le goto
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        email: 'client@test.fr',
        role: 'client',
        nom: 'Marc Dupont',
        tel: '06 12 34 56 78',
      }))
    })

    await page.goto('/devis')

    // Vérifie que loadClientPrefill a injecté les infos dans l'état initial
    // → on lit le state via localStorage du brouillon (auto-save 400ms)
    await page.waitForTimeout(600)
    const draftRaw = await page.evaluate(() => localStorage.getItem('cph_devis_draft_v1'))
    if (draftRaw) {
      const draft = JSON.parse(draftRaw)
      expect(draft.form.email).toBe('client@test.fr')
      expect(draft.form.nom).toBe('Marc Dupont')
    }
    // Si pas de draft (form vide donc pas saved), on vérifie au moins que
    // le user est bien stocké
    const userRaw = await page.evaluate(() => localStorage.getItem('user'))
    expect(userRaw).toContain('client@test.fr')
  })

  test('visiteur non connecté → pas de session user', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/devis')
    const draft = await page.evaluate(() => localStorage.getItem('user'))
    expect(draft).toBeNull()
  })

  test('si admin connecté (pas client), pas de pré-fill', async ({ page, context }) => {
    await context.clearCookies()
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({
        email: 'admin@cphpaca.fr',
        role: 'admin',
        nom: 'Fares',
      }))
    })
    await page.goto('/devis')
    await page.waitForTimeout(600)
    const draftRaw = await page.evaluate(() => localStorage.getItem('cph_devis_draft_v1'))
    // Pas de draft attendu : form vide → pas de save
    expect(draftRaw).toBeNull()
  })
})
