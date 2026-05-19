import { test, expect } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL

test.describe('PlaylistShare smoke', () => {
  test.beforeEach(({ page: _page }, testInfo) => {
    test.skip(!baseURL, 'Set PLAYWRIGHT_BASE_URL (e.g. http://127.0.0.1:3000) to run E2E')
    testInfo.setTimeout(60_000)
  })

  test('home page loads', async ({ page }) => {
    await page.goto(`${baseURL}/`)
    await expect(page.locator('body')).toBeVisible()
  })

  test('discover page loads', async ({ page }) => {
    await page.goto(`${baseURL}/discover`)
    await expect(page.locator('body')).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto(`${baseURL}/auth/login`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('share flow UI (authenticated — set E2E_EMAIL / E2E_PASSWORD)', async ({ page }) => {
    const email = process.env.E2E_EMAIL
    const password = process.env.E2E_PASSWORD
    test.skip(!email || !password, 'Set E2E_EMAIL and E2E_PASSWORD for authenticated smoke')

    await page.goto(`${baseURL!}/auth/login`)
    await page.getByLabel(/email/i).fill(email!)
    await page.getByLabel(/password/i).fill(password!)
    await page.getByRole('button', { name: /sign in|log in/i }).click()

    await page.waitForURL(`${baseURL}/**`, { timeout: 15_000 })
    await page.goto(`${baseURL}/discover`)

    const shareButton = page.getByRole('button', { name: /share/i }).first()
    if (await shareButton.isVisible()) {
      await shareButton.click()
      const contextField = page.getByPlaceholder(/context|story|why/i).first()
      if (await contextField.isVisible()) {
        await contextField.fill('E2E smoke test share context — at least ten chars')
        await expect(contextField).toHaveValue(/ten chars/)
      }
    }
  })
})
