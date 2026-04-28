import { test, expect } from './_helpers'
import fs from 'node:fs'
import path from 'node:path'

const SHOTS = path.resolve('tests/e2e/_smoke-screenshots')
fs.mkdirSync(SHOTS, { recursive: true })
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false })

test('Process complet — visiteur → /devis → /reservation → /paiement → /confirmation', async ({ page, context }) => {
  test.setTimeout(120000)
  await context.clearCookies()

  // ─── 1. LANDING ──────────────────────────────────────────────────
  await page.goto('/')
  await expect(page.locator('h1').first()).toContainText(/panneaux solaires/i)
  // Vérif fix #51 : tel ne déborde pas du form-card
  const tel = page.locator('.form-card input[type="tel"]').first()
  const card = page.locator('.form-card').first()
  const telBox = await tel.boundingBox()
  const cardBox = await card.boundingBox()
  expect(telBox.x + telBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1)
  await shot(page, '01-landing')
  console.log('✓ 1/9 Landing OK — tel ne déborde pas')

  // ─── 2. DEVIS ÉTAPE 1 : panneaux ─────────────────────────────────
  await page.goto('/devis')
  await page.locator('.choice-card').first().click()
  await shot(page, '02-step1-panneaux')
  await page.locator('button:has-text("Continuer")').click()
  console.log('✓ 2/9 Étape 1 (panneaux) OK')

  // ─── 3. ÉTAPE 2 : maison + accès ─────────────────────────────────
  await page.locator('.choice-card').first().click()
  await page.locator('.choice-card').nth(3).click()
  await page.waitForTimeout(150)
  await shot(page, '03-step2-maison')
  await page.locator('button:has-text("Continuer")').click()
  console.log('✓ 3/9 Étape 2 (maison) OK')

  // ─── 4. ÉTAPE 3 : tuile + intégration ────────────────────────────
  await page.locator('.choice-card').first().click()
  await page.locator('.choice-card').nth(6).click()
  await page.waitForTimeout(150)
  await shot(page, '04-step3-toiture')
  await page.locator('button:has-text("Continuer")').click()
  console.log('✓ 4/9 Étape 3 (toiture) OK')

  // ─── 5. ÉTAPE 4 : code postal ────────────────────────────────────
  await page.locator('input[placeholder*="13"]').first().fill('13008')
  await page.waitForTimeout(900)
  await shot(page, '05-step4-localisation')
  await page.locator('button:has-text("Continuer")').click()
  console.log('✓ 5/9 Étape 4 (localisation) OK')

  // ─── 6. ÉTAPE 5 : BLOQUÉ sans email ──────────────────────────────
  await expect(page.locator('text=/Vos coordonn/i').first()).toBeVisible({ timeout: 5000 })
  await page.locator('input[placeholder*="Jean-Pierre"]').first().fill('test5')
  await page.locator('input[type="tel"]').first().fill('06 12 34 56 78')

  const submitBtn = page.locator('button:has-text("Choisir mon créneau")')
  await expect(submitBtn).toBeDisabled()
  // Message attendu : "Renseignez votre email…"
  await expect(page.locator('text=/email/i').first()).toBeVisible()
  await shot(page, '06-step5-bloqué-sans-email')
  console.log('✓ 6/9 Étape 5 BLOQUÉE sans email — fix #52 OK')

  // ─── 7. ÉTAPE 5 : avec email valide ──────────────────────────────
  await page.locator('input[type="email"]').first().fill('test5@example.com')
  await expect(submitBtn).toBeEnabled()
  await shot(page, '07-step5-ok')
  await submitBtn.click()
  await expect(page).toHaveURL(/\/reservation/, { timeout: 5000 })
  await shot(page, '08-reservation')
  console.log('✓ 7/9 /reservation atteinte')

  // ─── 8. RÉSERVATION + PAIEMENT ───────────────────────────────────
  // Cliquer une date "available" ou "recommended" dans le calendrier
  const day = page.locator('.calendar-day.available, .calendar-day.recommended').first()
  await day.waitFor({ state: 'visible', timeout: 5000 })
  await day.click()
  await page.waitForTimeout(300)
  await shot(page, '09a-reservation-day-selected')

  // Choisir un créneau (8h-10h)
  const creneauBtn = page.locator('button:has-text("8h - 10h"), button:has-text("10h - 12h")').first()
  await creneauBtn.click()
  await page.waitForTimeout(300)
  await shot(page, '09b-reservation-creneau-selected')

  // Bouton "Confirmer ma réservation"
  const confirmBtn = page.locator('button:has-text("Confirmer ma réservation")')
  await expect(confirmBtn).toBeVisible({ timeout: 3000 })
  await confirmBtn.click()
  await expect(page).toHaveURL(/\/paiement/, { timeout: 8000 })
  await shot(page, '10-paiement')
  console.log('✓ 8/9 /paiement atteinte')

  // Choisir paiement à l'intervention si possible
  const intervRadio = page.locator('input[value="intervention"]').first()
  if (await intervRadio.count()) {
    await intervRadio.click().catch(() => {})
  } else {
    const intervLabel = page.locator('label:has-text("intervention")').first()
    if (await intervLabel.count()) await intervLabel.click().catch(() => {})
  }
  const finalSubmit = page.locator('form button[type="submit"]').last()
  await finalSubmit.click()
  await expect(page).toHaveURL(/\/confirmation/, { timeout: 10000 })
  await shot(page, '11-confirmation')

  // ─── 9. VÉRIF CONFIRMATION : email saisi présent, fallback absent ─
  const body = await page.locator('body').textContent()
  expect(body).toContain('test5@example.com')
  expect(body).not.toContain('pierre.vidal@free.fr')
  await expect(page.locator('text=/CPH-\\d{4}-\\d{4}/').first()).toBeVisible()
  console.log('✓ 9/9 /confirmation : email "test5@example.com" affiché, PAS de "pierre.vidal@free.fr"')
})
