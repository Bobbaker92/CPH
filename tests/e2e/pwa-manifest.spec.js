import { test, expect } from './_helpers'

test.describe('PWA manifest', () => {
  test('le link rel=manifest pointe vers /manifest.webmanifest', async ({ page }) => {
    await page.goto('/')
    const manifest = page.locator('link[rel="manifest"]')
    await expect(manifest).toHaveAttribute('href', '/manifest.webmanifest')
  })

  test('le manifest est servi et contient les champs PWA essentiels', async ({ page, request }) => {
    const res = await request.get('/manifest.webmanifest')
    expect(res.ok()).toBeTruthy()
    const data = await res.json()

    expect(data.name).toBeTruthy()
    expect(data.short_name).toBeTruthy()
    expect(data.start_url).toBe('/')
    expect(data.display).toBe('standalone')
    expect(data.theme_color).toBeTruthy()
    expect(data.background_color).toBeTruthy()
    expect(Array.isArray(data.icons)).toBeTruthy()
    expect(data.icons.length).toBeGreaterThan(0)
  })

  test('les meta apple-mobile-web-app sont présents', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute('content', 'yes')
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', /favicon/)
  })
})
