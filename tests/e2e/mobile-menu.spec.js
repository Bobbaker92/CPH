import { test, expect } from '@playwright/test'

// Émule iPhone via viewport + isMobile sans dépendre de WebKit
// (qui n'est pas installé en CI minimal — chromium suffit).
test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
})

test.describe('Menu mobile', () => {
  test('le bouton burger est visible sur mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('button.nav-burger')).toBeVisible()
  })

  test('cliquer le burger ouvre le menu', async ({ page }) => {
    await page.goto('/')
    await page.locator('button.nav-burger').click()
    await expect(page.locator('.mobile-menu')).toBeVisible()
    await expect(page.locator('.mobile-menu')).toContainText(/Accueil/i)
    await expect(page.locator('.mobile-menu')).toContainText(/Blog/i)
  })

  test('cliquer la croix ferme le menu', async ({ page }) => {
    await page.goto('/')
    await page.locator('button.nav-burger').click()
    await expect(page.locator('.mobile-menu')).toBeVisible()

    await page.locator('button.mobile-menu-close').click()
    await expect(page.locator('.mobile-menu')).toBeHidden()
  })

  test('cliquer sur le backdrop ferme le menu', async ({ page }) => {
    await page.goto('/')
    await page.locator('button.nav-burger').click()
    await expect(page.locator('.mobile-menu-backdrop')).toBeVisible()

    await page.locator('.mobile-menu-backdrop').click()
    await expect(page.locator('.mobile-menu')).toBeHidden()
  })

  test('le menu mobile contient un lien tel: cliquable', async ({ page }) => {
    await page.goto('/')
    await page.locator('button.nav-burger').click()
    const phoneLink = page.locator('.mobile-menu a[href^="tel:"]')
    await expect(phoneLink).toBeVisible()
    await expect(phoneLink).toHaveAttribute('href', /^tel:0/)
  })

  test('le bouton flottant rappel reste visible sur mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('button.callback-fab')).toBeVisible()
  })
})
