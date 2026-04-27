import { test, expect } from './_helpers'

test.describe('Landing /', () => {
  test('charge la page et affiche le hero', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/CPH|solaire/i)

    // Hero : titre principal contient "panneaux solaires" et la région
    const h1 = page.locator('h1').first()
    await expect(h1).toContainText(/panneaux solaires/i)
    await expect(h1).toContainText(/PACA/i)
  })

  test('affiche le tarif 199 € en hero', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=/199.*€/').first()).toBeVisible()
  })

  test('le bouton flottant "Être rappelé" est visible', async ({ page }) => {
    await page.goto('/')
    const fab = page.locator('button.callback-fab')
    await expect(fab).toBeVisible()
  })

  test('le footer affiche l\'adresse Aubagne', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer.footer').scrollIntoViewIfNeeded()
    await expect(page.locator('footer')).toContainText(/Aubagne/i)
    await expect(page.locator('footer')).toContainText(/13400/)
  })

  test('le funnel /devis est accessible', async ({ page }) => {
    // Direct nav — la landing utilise navigate() programmatique sur certains CTAs,
    // un selector "Link to=/devis" peut rater. On vérifie juste que la route répond.
    await page.goto('/devis')
    await expect(page.url()).toContain('/devis')
    // Le funnel doit afficher au moins le label "Panneaux" (étape 1)
    await expect(page.locator('text=/panneaux/i').first()).toBeVisible()
  })

  test('navigation vers /blog', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href="/blog"]').first().click()
    await expect(page).toHaveURL(/\/blog$/)
    await expect(page.locator('h1')).toContainText(/blog/i)
  })
})
