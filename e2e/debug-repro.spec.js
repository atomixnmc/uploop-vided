/**
 * E2E: Minimal repro for view-disappears-on-click bug.
 */
import { test, expect } from '@playwright/test'

test('minimal counter: click button does not make view disappear', async ({ page }) => {
  const errors = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/debug-repro/')
  await page.waitForTimeout(1500)

  // Initial state: view should be visible
  const root = page.locator('#root')
  await expect(root).toBeVisible()
  const initialHTML = await root.innerHTML()
  expect(initialHTML.length).toBeGreaterThan(20)
  expect(initialHTML).toContain('Count')

  // Click the +1 button
  const btn = root.locator('button')
  await expect(btn).toBeVisible()
  await btn.click()

  // Wait for re-render
  await page.waitForTimeout(500)

  // VERIFY: view still has content AND count updated
  const afterHTML = await root.innerHTML()
  console.log('before:', initialHTML.substring(0, 80))
  console.log('after:', afterHTML.substring(0, 80))
  console.log('page errors:', errors)

  expect(afterHTML.length).toBeGreaterThan(20)
  expect(afterHTML).toContain('Count')
  // Count should have incremented
  expect(afterHTML).toContain('1')

  // Click again
  await btn.click()
  await page.waitForTimeout(500)

  const after2HTML = await root.innerHTML()
  expect(after2HTML.length).toBeGreaterThan(20)
  expect(after2HTML).toContain('Count')
  expect(after2HTML).toContain('2')

  expect(errors).toHaveLength(0)
})

test('minimal counter: clicks 10 times without breaking', async ({ page }) => {
  const errors = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/debug-repro/')
  await page.waitForTimeout(1500)

  const btn = page.locator('#root button')
  for (let i = 0; i < 10; i++) {
    await btn.click()
    await page.waitForTimeout(150)
    const html = await page.locator('#root').innerHTML()
    expect(html.length).toBeGreaterThan(20)
    expect(html).toContain(String(i + 1))
  }
  expect(errors).toHaveLength(0)
})
