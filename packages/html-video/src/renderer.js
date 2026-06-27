/**
 * Renderer — captures frames via headless Chromium (Puppeteer).
 *
 * Uses Puppeteer to open a headless browser, inject the composition's HTML
 * for each frame, and capture screenshots. Frames are saved as PNG buffers
 * which are then piped to ffmpeg for encoding.
 *
 * Phase 1: Single-frame capture via puppeteer.launch()
 * Phase 2: Stream frames via puppeteer.connect() for live streaming
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { encodeVideo } from './encoder.js'

// ---------------------------------------------------------------------------
// Puppeteer — dynamically imported so it remains an optional peer dependency
// ---------------------------------------------------------------------------

/**
 * Dynamically import puppeteer. Throws a helpful error if not installed.
 * @returns {Promise<import('puppeteer')>}
 */
async function getPuppeteer() {
  try {
    const puppeteer = await import('puppeteer')
    return puppeteer.default || puppeteer
  } catch {
    throw new Error(
      'puppeteer is required for rendering. Install: npm install puppeteer',
    )
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Zero-pad a number to the given number of digits.
 * @param {number} n
 * @param {number} digits
 * @returns {string}
 */
function pad(n, digits) {
  return String(n).padStart(digits, '0')
}

/**
 * Build the full HTML document string sent to the browser.
 * Injects a base reset so the viewport fill is predictable.
 * @param {string} bodyHTML — composition HTML
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
function buildPageHTML(bodyHTML, width, height) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
</style>
</head>
<body>${bodyHTML}</body>
</html>`
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render a single frame and return a PNG buffer.
 *
 * If a pre-launched `puppeteer` object ({ browser, page }) is provided it will
 * be reused — the caller is responsible for cleanup.  Otherwise a fresh
 * headless Chromium instance is launched for this frame and torn down before
 * returning.
 *
 * @param {object} opts
 * @param {import('./composition.js').Composition} opts.composition
 * @param {number} opts.frame — frame number
 * @param {{ browser: import('puppeteer').Browser, page: import('puppeteer').Page }} [opts.puppeteer]
 * @returns {Promise<Buffer>} PNG image buffer
 */
export async function renderFrame({ composition, frame, puppeteer }) {
  const time = composition.frameToTime(frame)
  const bodyHTML = await composition.render(frame, time)

  let ownedBrowser = false
  /** @type {import('puppeteer').Browser} */
  let browser
  /** @type {import('puppeteer').Page} */
  let page

  try {
    if (puppeteer) {
      browser = puppeteer.browser
      page = puppeteer.page
    } else {
      const pu = await getPuppeteer()
      browser = await pu.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      ownedBrowser = true
      page = await browser.newPage()
    }

    await page.setViewport({
      width: composition.width,
      height: composition.height,
      deviceScaleFactor: 1,
    })

    const html = buildPageHTML(bodyHTML, composition.width, composition.height)
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    const buffer = await page.screenshot({ type: 'png' })
    return Buffer.from(buffer)
  } finally {
    if (ownedBrowser) {
      // Only close the page we created
      if (page && !page.isClosed()) {
        await page.close().catch(() => {})
      }
      if (browser) {
        await browser.close().catch(() => {})
      }
    }
  }
}

/**
 * Render all frames of a composition to a directory.
 *
 * Launches Puppeteer once and reuses the same browser + page for every frame.
 * Frames are saved as `frame-0001.png`, `frame-0002.png`, etc.
 *
 * @param {object} opts
 * @param {import('./composition.js').Composition} opts.composition
 * @param {string} opts.outputDir — directory for frame PNGs
 * @param {{ frame: number, total: number, percent: number }} [opts.onProgress]
 * @param {number} [opts.concurrency=1] — number of frames to render in parallel
 * @returns {Promise<string[]>} array of output file paths
 */
export async function renderFrames({
  composition,
  outputDir,
  onProgress,
  concurrency = 1,
}) {
  fs.mkdirSync(outputDir, { recursive: true })

  const total = composition.frameCount
  if (total === 0) return []

  const pu = await getPuppeteer()
  /** @type {import('puppeteer').Browser} */
  let browser
  /** @type {import('puppeteer').Page[]} */
  const pages = []

  try {
    browser = await pu.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    // Pre-open pages up to concurrency limit
    const pageCount = Math.min(concurrency, total)
    for (let i = 0; i < pageCount; i++) {
      const page = await browser.newPage()
      await page.setViewport({
        width: composition.width,
        height: composition.height,
        deviceScaleFactor: 1,
      })
      pages.push(page)
    }

    /** @type {string[]} */
    const outputFiles = []
    const digits = String(total).length

    // Worker — renders one frame on an available page and writes the PNG
    /**
     * @param {number} frame
     * @param {import('puppeteer').Page} page
     */
    async function renderOne(frame, page) {
      const time = composition.frameToTime(frame)
      const bodyHTML = await composition.render(frame, time)
      const html = buildPageHTML(bodyHTML, composition.width, composition.height)

      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })

      const screenshot = await page.screenshot({ type: 'png' })
      const filename = `frame-${pad(frame + 1, digits)}.png`
      const filepath = path.join(outputDir, filename)
      fs.writeFileSync(filepath, screenshot)
      outputFiles[frame] = filepath

      if (onProgress) {
        const done = outputFiles.filter(Boolean).length
        onProgress({ frame, total, percent: Math.round((done / total) * 100) })
      }
    }

    // Simple bounded-concurrency loop
    let cursor = 0

    /**
     * @param {import('puppeteer').Page} page
     */
    async function consume(page) {
      while (cursor < total) {
        const f = cursor++
        await renderOne(f, page)
      }
    }

    await Promise.all(pages.map((p) => consume(p)))

    return outputFiles.filter(Boolean)
  } finally {
    for (const p of pages) {
      if (!p.isClosed()) await p.close().catch(() => {})
    }
    if (browser) await browser.close().catch(() => {})
  }
}

/**
 * Render a composition to a video file (single high-level invocation).
 *
 * Handles the full pipeline:
 * 1. Launch headless Chromium
 * 2. Render every frame to PNG
 * 3. Encode to MP4 via ffmpeg (calls `encodeVideo` from `./encoder.js`)
 * 4. Clean up intermediate PNGs (unless `keepFrames` is set)
 *
 * @param {object} opts
 * @param {import('./composition.js').Composition} opts.composition
 * @param {string} opts.output — output file path (e.g. 'output.mp4')
 * @param {string} [opts.tempDir] — temp directory for frames (default: os.tmpdir())
 * @param {{ frame: number, total: number, percent: number }} [opts.onProgress]
 * @param {boolean} [opts.keepFrames=false] — keep intermediate PNG files
 * @param {number} [opts.concurrency=1]
 * @returns {Promise<string>} output file path
 */
export async function renderVideo({
  composition,
  output,
  tempDir,
  onProgress,
  keepFrames = false,
  concurrency = 1,
}) {
  const framesDir =
    tempDir || path.join(os.tmpdir(), `uploop-frames-${Date.now()}`)

  fs.mkdirSync(framesDir, { recursive: true })

  try {
    const frames = await renderFrames({
      composition,
      outputDir: framesDir,
      onProgress,
      concurrency,
    })

    if (frames.length === 0) {
      throw new Error('No frames were rendered')
    }

    const format = output.endsWith('.webm') ? 'webm' : 'mp4'

    await encodeVideo({
      frames,
      output,
      fps: composition.fps,
      width: composition.width,
      height: composition.height,
      format,
    })

    return output
  } finally {
    if (!keepFrames) {
      fs.rmSync(framesDir, { recursive: true, force: true })
    }
  }
}
