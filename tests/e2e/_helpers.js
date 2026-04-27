import { test as base, expect } from '@playwright/test'

/**
 * Fixture custom : auto-accepte le consentement cookies via addInitScript
 * AVANT que la page charge, pour éviter que le bandeau couvre les éléments
 * cliquables (FAB, liens en bas de page, etc.).
 *
 * Pour les tests qui veulent tester le bandeau lui-même, importer le `test`
 * standard de @playwright/test au lieu de celui-ci.
 *
 * Usage :
 *   import { test, expect } from './_helpers'
 *   test('mon test', async ({ page }) => { ... })
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          'cph_cookie_consent_v1',
          JSON.stringify({
            choice: 'accepted',
            categories: { necessary: true, analytics: true },
            timestamp: Date.now(),
          })
        )
      } catch {
        // localStorage indisponible — bandeau s'affichera, OK pour tests admin
      }
    })
    await use(page)
  },
})

export { expect }
