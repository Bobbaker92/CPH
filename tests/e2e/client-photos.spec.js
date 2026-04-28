import { test, expect } from './_helpers'

async function loginClient(page) {
  await page.goto('/connexion')
  await page.locator('#login-email').fill('client@test.fr')
  await page.locator('#login-password').fill('client123')
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(/\/client/, { timeout: 5000 })
}

test.describe('Client /photos — slider avant/après + lightbox', () => {
  test('le slider avant/après est rendu avec les 2 images', async ({ page }) => {
    await loginClient(page)
    await page.goto('/client/photos')
    await expect(page.locator('.ba-slider')).toBeVisible()
    await expect(page.locator('.ba-slider-img.ba-slider-after')).toBeVisible()
    await expect(page.locator('.ba-slider-handle')).toBeVisible()
  })

  test('flèches clavier modifient la position du slider', async ({ page }) => {
    await loginClient(page)
    await page.goto('/client/photos')
    const slider = page.locator('.ba-slider')
    await slider.focus()
    await expect(slider).toHaveAttribute('aria-valuenow', '50')
    await page.keyboard.press('ArrowRight')
    const after = await slider.getAttribute('aria-valuenow')
    expect(parseInt(after)).toBeGreaterThan(50)
  })

  test('cliquer une vignette ouvre la lightbox plein écran', async ({ page }) => {
    await loginClient(page)
    await page.goto('/client/photos')
    await page.locator('.photo-thumb').first().click()
    await expect(page.locator('.photo-lightbox')).toBeVisible()
    await expect(page.locator('.photo-lightbox img')).toBeVisible()
  })

  test('Escape ferme la lightbox', async ({ page }) => {
    await loginClient(page)
    await page.goto('/client/photos')
    await page.locator('.photo-thumb').first().click()
    await expect(page.locator('.photo-lightbox')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.photo-lightbox')).toBeHidden()
  })
})
