import { test, expect } from './_helpers'

test.describe('Pages légales', () => {
  const LEGAL_PAGES = [
    { path: '/mentions-legales', titre: /mentions légales/i, mustContain: /SIREN|SIRET|Aubagne/i },
    { path: '/cgv', titre: /conditions générales/i, mustContain: /199|TTC|rétractation/i },
    { path: '/confidentialite', titre: /confidentialité/i, mustContain: /RGPD|CNIL|données/i },
  ]

  for (const { path, titre, mustContain } of LEGAL_PAGES) {
    test(`${path} : affiche le titre et contenu réglementaire`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('h1')).toContainText(titre)
      await expect(page.locator('body')).toContainText(mustContain)
    })

    test(`${path} : a un lien retour vers l'accueil`, async ({ page }) => {
      await page.goto(path)
      const backLink = page.locator('a:has-text("accueil"), a:has-text("Retour")').first()
      await expect(backLink).toBeVisible()
    })
  }

  test('le footer landing pointe vers /mentions-legales', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer.footer a[href="/mentions-legales"]').click()
    await expect(page).toHaveURL(/\/mentions-legales/)
  })

  test('le footer landing pointe vers /cgv', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer.footer a[href="/cgv"]').click()
    await expect(page).toHaveURL(/\/cgv/)
  })

  test('le footer landing pointe vers /confidentialite', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer.footer a[href="/confidentialite"]').click()
    await expect(page).toHaveURL(/\/confidentialite/)
  })
})
