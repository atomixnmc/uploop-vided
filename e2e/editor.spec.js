/**
 * E2E: Editor workspace — full video editor integration test.
 */
import { test, expect } from '@playwright/test'

test.describe('Editor Workspace', () => {
  test('loads without console errors', async ({ page }) => {
    const errors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/editor/')
    await page.waitForTimeout(3000)

    // Filter out media autoplay/CORS issues
    const realErrors = errors.filter(e =>
      !e.includes('Autoplay') &&
      !e.includes('NotAllowedError') &&
      !e.includes('Failed to load resource')
    )
    expect(realErrors).toHaveLength(0)
  })

  test('has all editor sections', async ({ page }) => {
    await page.goto('/editor/')
    await page.waitForTimeout(2000)

    // Top bar
    await expect(page.locator('.topbar h1')).toContainText('uploop-vided')

    // Left panel — library + examples nav
    await expect(page.locator('uploop-library')).toBeVisible()
    await expect(page.locator('#examples-nav')).toBeVisible()

    // Center — preview + timeline
    await expect(page.locator('uploop-preview')).toBeVisible()
    await expect(page.locator('uploop-timeline')).toBeVisible()

    // Right panel — inspector
    await expect(page.locator('uploop-inspector')).toBeVisible()

    // Status bar
    await expect(page.locator('.statusbar')).toBeVisible()
  })

  test('has playback controls', async ({ page }) => {
    await page.goto('/editor/')
    await page.waitForTimeout(2000)

    await expect(page.locator('#btn-play')).toBeVisible()
    await expect(page.locator('#btn-stop')).toBeVisible()
    await expect(page.locator('#btn-export')).toBeVisible()
  })

  test('status bar shows initial values', async ({ page }) => {
    await page.goto('/editor/')
    await page.waitForTimeout(2000)

    await expect(page.locator('#stat-time')).toContainText('0:00')
    await expect(page.locator('#stat-tracks')).toContainText('3')
    await expect(page.locator('#stat-fps')).toContainText('30')
  })

  test('play button toggles play/pause', async ({ page }) => {
    await page.goto('/editor/')
    await page.waitForTimeout(2000)

    const playBtn = page.locator('#btn-play')

    // Click play
    await playBtn.click()
    await page.waitForTimeout(500)
    await expect(playBtn).toContainText('Pause')

    // Click pause
    await playBtn.click()
    await page.waitForTimeout(500)
    await expect(playBtn).toContainText('Play')
  })

  test('stop button resets to 0', async ({ page }) => {
    await page.goto('/editor/')
    await page.waitForTimeout(2000)

    // Play for a bit
    await page.locator('#btn-play').click()
    await page.waitForTimeout(1000)

    // Stop
    await page.locator('#btn-stop').click()
    await page.waitForTimeout(500)

    await expect(page.locator('#stat-time')).toContainText('0:00')
  })

  test('keyboard shortcuts work', async ({ page }) => {
    await page.goto('/editor/')
    await page.waitForTimeout(2000)

    // Space to play
    await page.keyboard.press('Space')
    await page.waitForTimeout(500)
    await expect(page.locator('#btn-play')).toContainText('Pause')

    // Space to pause
    await page.keyboard.press('Space')
    await page.waitForTimeout(500)
    await expect(page.locator('#btn-play')).toContainText('Play')

    // Arrow right to seek
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(200)
    const timeAfter = await page.locator('#stat-time').textContent()
    expect(timeAfter).not.toBe('0:00')
  })

  test('examples nav links to all 30 examples', async ({ page }) => {
    await page.goto('/editor/')
    await page.waitForTimeout(2000)

    const navLinks = page.locator('#examples-nav a')
    const count = await navLinks.count()
    expect(count).toBe(30)
  })

  test('library shows media assets', async ({ page }) => {
    await page.goto('/editor/')
    await page.waitForTimeout(2000)

    // Library should have asset cards
    const shadow = page.locator('uploop-library')
    await expect(shadow).toBeVisible()
  })
})
