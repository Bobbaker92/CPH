import { test, expect } from '@playwright/test'

test.describe('Modale "Être rappelé"', () => {
  test('s\'ouvre via le bouton flottant', async ({ page }) => {
    await page.goto('/')
    await page.locator('button.callback-fab').click()
    await expect(page.locator('.callback-modal')).toBeVisible()
    await expect(page.locator('.callback-modal h2')).toContainText(/rappel/i)
  })

  test('le bouton submit est désactivé tant que les champs sont vides', async ({ page }) => {
    await page.goto('/')
    await page.locator('button.callback-fab').click()
    const submitBtn = page.locator('.callback-modal button[type="submit"]')
    await expect(submitBtn).toBeDisabled()
  })

  test('valide la saisie nom + tel et affiche l\'écran de succès', async ({ page }) => {
    await page.goto('/')
    await page.locator('button.callback-fab').click()

    await page.locator('.callback-modal input[type="text"]').fill('Jean Dupont')
    await page.locator('.callback-modal input[type="tel"]').fill('06 12 34 56 78')

    const submitBtn = page.locator('.callback-modal button[type="submit"]')
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    // Loading puis succès
    await expect(page.locator('.callback-success')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('.callback-success')).toContainText(/Jean/)
  })

  test('se ferme via le bouton Annuler', async ({ page }) => {
    await page.goto('/')
    await page.locator('button.callback-fab').click()
    await expect(page.locator('.callback-modal')).toBeVisible()

    await page.locator('.callback-modal button:has-text("Annuler")').click()
    await expect(page.locator('.callback-modal')).toBeHidden()
  })

  test('se ferme via la touche Escape', async ({ page }) => {
    await page.goto('/')
    await page.locator('button.callback-fab').click()
    await expect(page.locator('.callback-modal')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('.callback-modal')).toBeHidden()
  })
})
