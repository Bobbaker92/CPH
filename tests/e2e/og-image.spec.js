import { test, expect } from './_helpers'

test.describe('Open Graph image', () => {
  test('le fichier /og-image.svg est servi avec un Content-Type SVG', async ({ request }) => {
    const res = await request.get('/og-image.svg')
    expect(res.ok()).toBeTruthy()
    expect(res.headers()['content-type']).toMatch(/svg/i)
    const body = await res.text()
    expect(body).toContain('<svg')
    expect(body).toContain('CPH Solar')
  })

  test('les meta og:image et twitter:image sont présents', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-image/)
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200')
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630')
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /og-image/)
  })

  test('og:image:alt contient une description significative', async ({ page }) => {
    await page.goto('/')
    const alt = await page.locator('meta[property="og:image:alt"]').getAttribute('content')
    expect(alt).toMatch(/CPH/i)
    expect(alt.length).toBeGreaterThan(20)
  })
})
