import { test, expect } from './_helpers'

test.describe('Calculateur ROI landing', () => {
  test('section ROI visible avec slider et pills', async ({ page }) => {
    await page.goto('/')
    await page.locator('#roi-calculateur').scrollIntoViewIfNeeded()
    await expect(page.locator('#roi-calculateur')).toBeVisible()
    await expect(page.locator('#roi-kwc')).toBeVisible()
    await expect(page.locator('.roi-pill')).toHaveCount(4)
  })

  test('changer le slider met à jour la valeur affichée', async ({ page }) => {
    await page.goto('/')
    await page.locator('#roi-calculateur').scrollIntoViewIfNeeded()
    const slider = page.locator('#roi-kwc')
    await slider.fill('12')
    await expect(page.locator('.roi-value')).toContainText('12')
  })

  test('cliquer un niveau d\'encrassement le sélectionne', async ({ page }) => {
    await page.goto('/')
    await page.locator('#roi-calculateur').scrollIntoViewIfNeeded()
    const pillImportant = page.locator('.roi-pill').filter({ hasText: 'Important' }).first()
    await pillImportant.click()
    await expect(pillImportant).toHaveClass(/active/)
  })

  test('le résultat €/an se recalcule en fonction des inputs', async ({ page }) => {
    await page.goto('/')
    await page.locator('#roi-calculateur').scrollIntoViewIfNeeded()
    await page.locator('#roi-kwc').fill('6')
    await page.locator('.roi-pill').filter({ hasText: 'Modéré' }).first().click()
    // 6 kWc * 1580 kWh/kWc * 12% * 0.21 € ≈ 239 €
    const value = await page.locator('.roi-stat').first().locator('.roi-stat-value').textContent()
    expect(parseInt(value.replace(/\D/g, ''))).toBeGreaterThan(150)
    expect(parseInt(value.replace(/\D/g, ''))).toBeLessThan(350)
  })

  test('le CTA "Réserver mon nettoyage" pointe vers /devis', async ({ page }) => {
    await page.goto('/')
    await page.locator('#roi-calculateur').scrollIntoViewIfNeeded()
    const cta = page.locator('.roi-cta')
    await expect(cta).toHaveAttribute('href', '/devis')
  })
})
