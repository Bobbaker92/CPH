import { test, expect } from './_helpers'

test.describe('Boutons de partage social blog', () => {
  test('un article affiche les boutons de partage', async ({ page }) => {
    await page.goto('/blog/pourquoi-nettoyer-panneaux-solaires')
    await expect(page.locator('.blog-share')).toBeVisible()
    await expect(page.locator('.blog-share-btn')).toHaveCount(4) // Twitter + LinkedIn + Facebook + Copy
  })

  test('Twitter pointe vers twitter.com/intent/tweet', async ({ page }) => {
    await page.goto('/blog/pourquoi-nettoyer-panneaux-solaires')
    const link = page.locator('.blog-share a[aria-label="Partager sur Twitter"]')
    await expect(link).toHaveAttribute('href', /twitter\.com\/intent\/tweet/)
    await expect(link).toHaveAttribute('href', /cphpaca\.fr/)
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('LinkedIn pointe vers linkedin sharing', async ({ page }) => {
    await page.goto('/blog/pourquoi-nettoyer-panneaux-solaires')
    const link = page.locator('.blog-share a[aria-label="Partager sur LinkedIn"]')
    await expect(link).toHaveAttribute('href', /linkedin\.com\/sharing/)
  })

  test('Facebook pointe vers facebook sharer', async ({ page }) => {
    await page.goto('/blog/pourquoi-nettoyer-panneaux-solaires')
    const link = page.locator('.blog-share a[aria-label="Partager sur Facebook"]')
    await expect(link).toHaveAttribute('href', /facebook\.com\/sharer/)
  })
})
