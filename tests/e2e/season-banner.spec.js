import { test, expect } from './_helpers'

test.describe('Season banner (top landing)', () => {
  test('s\'affiche par défaut au premier chargement', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.locator('.season-banner')).toBeVisible()
    // Doit contenir un emoji + un message + un CTA
    await expect(page.locator('.season-banner-emoji')).toBeVisible()
    await expect(page.locator('.season-banner-cta')).toHaveAttribute('href', '/devis')
  })

  test('cliquer la croix le cache et stocke le dismiss en localStorage', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await expect(page.locator('.season-banner')).toBeVisible()

    await page.locator('.season-banner-close').dispatchEvent('click')
    await expect(page.locator('.season-banner')).toBeHidden({ timeout: 3000 })

    const dismissed = await page.evaluate(() => localStorage.getItem('cph_season_banner_dismissed_v1'))
    expect(dismissed).toBeTruthy()
  })

  test('si dismiss en localStorage récent, ne pas afficher au reload', async ({ page, context }) => {
    await context.clearCookies()
    await page.addInitScript(() => {
      localStorage.setItem('cph_season_banner_dismissed_v1', String(Date.now()))
    })
    await page.goto('/')
    await expect(page.locator('.season-banner')).toBeHidden()
  })
})
