import { test, expect } from './_helpers'

test.describe('Skip link (accessibilité clavier)', () => {
  test('le skip link existe et pointe vers #main-content', async ({ page }) => {
    await page.goto('/')
    const skip = page.locator('a.skip-link')
    await expect(skip).toHaveAttribute('href', '#main-content')
    await expect(skip).toContainText(/contenu principal/i)
  })

  test('le skip link est invisible visuellement par défaut (top négatif)', async ({ page }) => {
    await page.goto('/')
    const skip = page.locator('a.skip-link')
    const box = await skip.boundingBox()
    expect(box).not.toBeNull()
    // Position top négative ou hors viewport
    expect(box.y).toBeLessThan(0)
  })

  test('le skip link devient visible au focus', async ({ page }) => {
    await page.goto('/')
    await page.locator('a.skip-link').focus()
    // Attente de la transition CSS (top: -100px → 12px en 180ms)
    await page.waitForTimeout(250)
    const box = await page.locator('a.skip-link').boundingBox()
    expect(box.y).toBeGreaterThanOrEqual(0)
  })

  test('activer le skip link au clavier (focus + Enter) navigue vers #main-content', async ({ page }) => {
    await page.goto('/')
    // Simule un usage clavier : focus puis Enter (le click classique est
    // bloqué par Playwright car le skip link est position:absolute hors viewport)
    await page.locator('a.skip-link').focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#main-content$/)
    await expect(page.locator('#main-content')).toBeVisible()
  })

  test('Blog a aussi un #main-content', async ({ page }) => {
    await page.goto('/blog')
    await expect(page.locator('#main-content')).toBeAttached()
  })

  test('BlogArticle a aussi un #main-content', async ({ page }) => {
    await page.goto('/blog/pourquoi-nettoyer-panneaux-solaires')
    await expect(page.locator('#main-content')).toBeAttached()
  })
})
