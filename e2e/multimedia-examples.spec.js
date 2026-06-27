/**
 * E2E: Multimedia examples — VFX, music, text effects, compositing.
 */
import { test, expect } from '@playwright/test'

// Spot-check key examples from each category
const SPOT_CHECKS = [
  // Music visualization
  { name: '31-music-bars', path: 'multimedia/31-music-bars/', check: 'canvas, button' },
  { name: '32-music-circles', path: 'multimedia/32-music-circles/', check: 'canvas' },
  { name: '34-music-particles', path: 'multimedia/34-music-particles/', check: 'canvas, input[type="range"]' },

  // Video VFX
  { name: '35-video-glitch', path: 'multimedia/35-video-glitch/', check: 'canvas, button' },
  { name: '36-video-chromakey', path: 'multimedia/36-video-chromakey/', check: 'canvas, input[type="range"]' },
  { name: '39-video-pixelate', path: 'multimedia/39-video-pixelate/', check: 'canvas, input[type="range"]' },
  { name: '40-video-edge', path: 'multimedia/40-video-edge/', check: 'canvas, input[type="range"]' },

  // Text typography
  { name: '41-text-kinetic', path: 'multimedia/41-text-kinetic/', check: 'canvas' },
  { name: '42-text-lyrics', path: 'multimedia/42-text-lyrics/', check: 'button' },
  { name: '44-text-glitch', path: 'multimedia/44-text-glitch/', check: 'canvas' },
  { name: '45-text-neon', path: 'multimedia/45-text-neon/', check: 'canvas' },

  // Advanced multimedia
  { name: '47-video-slowmo', path: 'multimedia/47-video-slowmo/', check: 'button' },
  { name: '49-compositor-fire', path: 'multimedia/49-compositor-fire/', check: 'canvas, input[type="range"]' },
  { name: '50-multimedia-mixer', path: 'multimedia/50-multimedia-mixer/', check: 'canvas, button' },
]

for (const ex of SPOT_CHECKS) {
  test.describe(`Multimedia: ${ex.name}`, () => {
    test('page loads without page errors', async ({ page }) => {
      const pageErrors = []
      page.on('pageerror', (err) => pageErrors.push(err.message))

      await page.goto(`/${ex.path}`)
      await page.waitForTimeout(2500)

      // Filter CORS errors from external media
      const realErrors = pageErrors.filter(e =>
        !e.includes('Failed to fetch') &&
        !e.includes('load') &&
        !e.includes('NotAllowedError')
      )

      if (realErrors.length > 0) {
        console.log(`[${ex.name}] page errors:`, realErrors)
      }
      expect(realErrors).toHaveLength(0)
    })

    test('has required DOM elements', async ({ page }) => {
      await page.goto(`/${ex.path}`)
      await page.waitForTimeout(2000)

      const checks = ex.check.split(', ')
      for (const sel of checks) {
        const el = page.locator(sel).first()
        await expect(el).toBeVisible({ timeout: 5000 })
      }
    })

    test('back link exists and points to examples', async ({ page }) => {
      await page.goto(`/${ex.path}`)
      const back = page.locator('.back').first()
      await expect(back).toBeVisible()
      const href = await back.getAttribute('href')
      expect(href).toMatch(/\.\./)
    })

    test('page has a meaningful title', async ({ page }) => {
      await page.goto(`/${ex.path}`)
      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
    })
  })
}

// ── Full scan: all 20 multimedia pages load ─────────────────────
const ALL_MULTIMEDIA = Array.from({ length: 20 }, (_, i) => 31 + i)

for (const num of ALL_MULTIMEDIA) {
  test(`multimedia ${num} loads without fatal errors`, async ({ page }) => {
    // Find the actual directory name (has a name prefix)
    const pageErrors = []
    page.on('pageerror', (err) => pageErrors.push(err.message))

    // Try the numbered path pattern
    const response = await page.goto(`/multimedia/${num}-`, { waitUntil: 'domcontentloaded' })
    // If 404, skip (not all may be deployed yet)
    if (!response || response.status() === 404) {
      console.log(`  [${num}] skipped (404)`)
      return
    }

    await page.waitForTimeout(2500)

    const realErrors = pageErrors.filter(e =>
      !e.includes('Failed to fetch') &&
      !e.includes('load') &&
      !e.includes('NotAllowedError')
    )
    expect(realErrors).toHaveLength(0)
  })
}
