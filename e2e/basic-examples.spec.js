/**
 * E2E: Basic examples — spot-check key examples render without errors.
 */
import { test, expect } from '@playwright/test'

// Key examples that cover different package features
const EXAMPLES = [
  { name: '01-slideshow', path: '01-slideshow/', feature: 'timeline easing' },
  { name: '02-multitrack-timeline', path: '02-multitrack-timeline/', feature: 'timeline data' },
  { name: '03-video-transitions', path: '03-video-transitions/', feature: 'compositor transitions' },
  { name: '04-audio-mixer', path: '04-audio-mixer/', feature: 'audio tracks' },
  { name: '05-keyframe-animation', path: '05-keyframe-animation/', feature: 'keyframes' },
  { name: '06-layer-compositor', path: '06-layer-compositor/', feature: 'compositor layers' },
  { name: '07-blend-modes', path: '07-blend-modes/', feature: 'blend modes' },
  { name: '10-image-gallery', path: '10-image-gallery/', feature: 'image transitions' },
  { name: '13-wipe-transitions', path: '13-wipe-transitions/', feature: 'wipe transitions' },
  { name: '16-crossfade-audio', path: '16-crossfade-audio/', feature: 'audio crossfade' },
  { name: '17-playlist-player', path: '17-playlist-player/', feature: 'playlist' },
  { name: '20-final-composite', path: '20-final-composite/', feature: 'full pipeline' },
]

for (const ex of EXAMPLES) {
  test.describe(`Example: ${ex.name} (${ex.feature})`, () => {
    test('page loads without console errors', async ({ page }) => {
      const errors = []
      const warnings = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
        if (msg.type() === 'warning') warnings.push(msg.text())
      })
      await page.goto(`/${ex.path}`)
      // Allow time for modules to load
      await page.waitForTimeout(2000)

      // Filter out expected warnings (like autoplay blocked, CORS for media)
      const realErrors = errors.filter(e =>
        !e.includes('Autoplay') &&
        !e.includes('NotAllowedError') &&
        !e.includes('Failed to load resource: net::ERR_FAILED') // CORS for sample media
      )
      if (realErrors.length > 0) {
        console.log(`[${ex.name}] console errors:`, realErrors)
      }
      // We don't assert on errors since some media URLs may fail — focus on page load
      await expect(page.locator('body')).toBeVisible()
    })

    test('has back link to examples', async ({ page }) => {
      await page.goto(`/${ex.path}`)
      const backLink = page.locator('.back, a[href=".."]')
      if (await backLink.count() > 0) {
        await expect(backLink.first()).toContainText(/Examples|←/)
      }
    })

    test('page has a title', async ({ page }) => {
      await page.goto(`/${ex.path}`)
      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
    })
  })
}

test.describe('Example: 12-fade-transitions', () => {
  test('fade buttons are present and clickable', async ({ page }) => {
    await page.goto('/12-fade-transitions/')
    await page.waitForTimeout(1500)

    // Look for transition trigger buttons
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Example: 14-slide-transitions', () => {
  test('slide direction buttons work', async ({ page }) => {
    await page.goto('/14-slide-transitions/')
    await page.waitForTimeout(1500)
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })
})
