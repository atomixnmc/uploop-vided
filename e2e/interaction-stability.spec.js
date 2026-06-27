/**
 * E2E: Button/interaction stability — verifies clicking buttons
 * and changing inputs does NOT make the view disappear.
 */
import { test, expect } from '@playwright/test'

// Test key examples from each category
const INTERACTION_TESTS = [
  { name: '01-slideshow', path: '01-slideshow/', click: 'button', check: '.stage, canvas, [data-ref], h1, h2, .slide' },
  { name: '02-multitrack-timeline', path: '02-multitrack-timeline/', click: 'button', check: '.stage, canvas, h1, h2' },
  { name: '05-keyframe-animation', path: '05-keyframe-animation/', click: 'button', check: 'canvas, button' },
  { name: '06-layer-compositor', path: '06-layer-compositor/', click: 'button', check: 'canvas, button, input' },
  { name: '12-fade-transitions', path: '12-fade-transitions/', click: 'button', check: 'button' },
  { name: '17-playlist-player', path: '17-playlist-player/', click: 'button', check: 'button, video' },
  { name: '31-music-bars', path: 'multimedia/31-music-bars/', click: 'button', check: 'canvas, button' },
  { name: '35-video-glitch', path: 'multimedia/35-video-glitch/', click: 'button', check: 'canvas, button' },
  { name: '41-text-kinetic', path: 'multimedia/41-text-kinetic/', click: 'button', check: 'canvas' },
  { name: '50-multimedia-mixer', path: 'multimedia/50-multimedia-mixer/', click: 'button', check: 'canvas, button' },
]

for (const ex of INTERACTION_TESTS) {
  test.describe(`Interaction: ${ex.name}`, () => {
    test('view remains visible after clicking buttons', async ({ page }) => {
      await page.goto(`/${ex.path}`)
      await page.waitForTimeout(3000)

      // Find all visible buttons
      const buttons = page.locator('button').filter({ hasVisible: true })
      const btnCount = await buttons.count()

      if (btnCount === 0) {
        // No buttons to test — just verify content exists
        const checkEls = ex.check.split(', ')
        for (const sel of checkEls) {
          await expect(page.locator(sel.trim()).first()).toBeVisible({ timeout: 3000 })
        }
        return
      }

      // Click each button once, verify view stays
      for (let i = 0; i < Math.min(btnCount, 5); i++) {
        const btn = buttons.nth(i)

        // Skip if hidden or disabled
        const isVisible = await btn.isVisible()
        if (!isVisible) continue

        await btn.click({ timeout: 2000 })
        await page.waitForTimeout(500)

        // Verify at least one checked element is still visible
        const checkEls = ex.check.split(', ')
        let found = false
        for (const sel of checkEls) {
          const el = page.locator(sel.trim()).first()
          if (await el.count() > 0 && await el.isVisible()) {
            found = true
            break
          }
        }
        expect(found).toBe(true)
      }
    })

    test('view remains after interacting with sliders', async ({ page }) => {
      await page.goto(`/${ex.path}`)
      await page.waitForTimeout(3000)

      const sliders = page.locator('input[type="range"]')
      const count = await sliders.count()

      for (let i = 0; i < Math.min(count, 3); i++) {
        const slider = sliders.nth(i)
        if (!(await slider.isVisible())) continue

        // Change slider value
        await slider.fill('50')
        await page.waitForTimeout(300)

        // Content must still be visible
        const checkEls = ex.check.split(', ')
        let found = false
        for (const sel of checkEls) {
          const el = page.locator(sel.trim()).first()
          if (await el.count() > 0 && await el.isVisible()) {
            found = true
            break
          }
        }
        expect(found).toBe(true)
      }
    })
  })
}

// Full scan: all examples — click first button, verify no crash
const ALL_EXAMPLES = [
  ...Array.from({ length: 20 }, (_, i) => ({ num: i + 1, path: `${String(i + 1).padStart(2, '0')}-` })),
  ...Array.from({ length: 20 }, (_, i) => ({ num: 31 + i, path: `multimedia/${31 + i}-` })),
]

for (const ex of ALL_EXAMPLES) {
  test(`example ${ex.num}: button click does not remove content`, async ({ page }) => {
    const pageErrors = []
    page.on('pageerror', (err) => pageErrors.push(err.message))

    const resp = await page.goto(`/${ex.path}`, { waitUntil: 'domcontentloaded' })
    if (!resp || resp.status() === 404) return

    await page.waitForTimeout(2500)

    // Filter autoplay
    const errors = pageErrors.filter(e => !e.includes('play() request was interrupted'))
    expect(errors).toHaveLength(0)

    // Try clicking first visible button
    const btn = page.locator('button').filter({ hasVisible: true }).first()
    if (await btn.count() > 0) {
      await btn.click({ timeout: 1000 })
      await page.waitForTimeout(500)
    }

    // Body must still have content (not empty)
    const bodyHTML = await page.locator('body').innerHTML()
    expect(bodyHTML.length).toBeGreaterThan(100)
  })
}
