import { test, expect } from './_helpers'

test.describe('Blog', () => {
  test('/blog liste plusieurs articles', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.locator('h1')).toContainText(/blog/i)
    // Au moins 3 articles attendus dans la maquette
    const articles = page.locator('article')
    await expect.poll(async () => await articles.count(), { timeout: 5000 }).toBeGreaterThanOrEqual(3)
  })

  test('cliquer un article navigue vers /blog/:slug', async ({ page }) => {
    await page.goto('/blog')
    const firstArticleLink = page.locator('a[href^="/blog/"]').first()
    await firstArticleLink.click()
    await expect(page).toHaveURL(/\/blog\/[a-z0-9-]+/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('un article inconnu affiche le DEFAULT', async ({ page }) => {
    await page.goto('/blog/article-qui-nexiste-pas')
    // L'app affiche le DEFAULT (titre "Article", contenu placeholder)
    await expect(page.locator('text=/Article/i').first()).toBeVisible()
  })

  test('chaque article a un CTA "Réserver mon nettoyage"', async ({ page }) => {
    await page.goto('/blog/pourquoi-nettoyer-panneaux-solaires')
    await expect(page.locator('a[href="/devis"]').first()).toBeVisible()
  })
})
