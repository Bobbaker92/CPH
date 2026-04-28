import { test, expect } from './_helpers'

test.describe('Articles connexes (fin BlogArticle)', () => {
  test('un article affiche jusqu\'à 3 articles connexes', async ({ page }) => {
    await page.goto('/blog/pourquoi-nettoyer-panneaux-solaires')
    await page.locator('.related-articles').scrollIntoViewIfNeeded()
    await expect(page.locator('.related-articles')).toBeVisible()
    const cards = page.locator('.related-article-card')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)
    expect(count).toBeLessThanOrEqual(3)
  })

  test('cliquer un article connexe navigue vers son slug', async ({ page }) => {
    await page.goto('/blog/pourquoi-nettoyer-panneaux-solaires')
    await page.locator('.related-articles').scrollIntoViewIfNeeded()
    const firstCard = page.locator('.related-article-card').first()
    const href = await firstCard.getAttribute('href')
    expect(href).toMatch(/\/blog\/[a-z0-9-]+/)
    expect(href).not.toBe('/blog/pourquoi-nettoyer-panneaux-solaires') // pas l'article courant
  })

  test('chaque carte affiche catégorie + titre + temps de lecture', async ({ page }) => {
    await page.goto('/blog/pourquoi-nettoyer-panneaux-solaires')
    const card = page.locator('.related-article-card').first()
    await expect(card.locator('.related-article-cat')).toBeVisible()
    await expect(card.locator('h4')).toBeVisible()
    await expect(card.locator('.related-article-meta')).toContainText(/min/)
  })
})
