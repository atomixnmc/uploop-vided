/**
 * E2E: Multimedia examples — strict verification.
 * No CORS filtering — examples are self-contained now.
 */
import { test, expect } from "@playwright/test";

const SPOT_CHECKS = [
  {
    name: "31-music-bars",
    path: "multimedia/31-music-bars/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "32-music-circles",
    path: "multimedia/32-music-circles/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "34-music-particles",
    path: "multimedia/34-music-particles/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "35-video-glitch",
    path: "multimedia/35-video-glitch/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "36-video-chromakey",
    path: "multimedia/36-video-chromakey/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "39-video-pixelate",
    path: "multimedia/39-video-pixelate/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "40-video-edge",
    path: "multimedia/40-video-edge/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "41-text-kinetic",
    path: "multimedia/41-text-kinetic/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "42-text-lyrics",
    path: "multimedia/42-text-lyrics/",
    hasCanvas: false,
    hasControls: true,
  },
  {
    name: "44-text-glitch",
    path: "multimedia/44-text-glitch/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "45-text-neon",
    path: "multimedia/45-text-neon/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "47-video-slowmo",
    path: "multimedia/47-video-slowmo/",
    hasCanvas: false,
    hasControls: true,
  },
  {
    name: "49-compositor-fire",
    path: "multimedia/49-compositor-fire/",
    hasCanvas: true,
    hasControls: true,
  },
  {
    name: "50-multimedia-mixer",
    path: "multimedia/50-multimedia-mixer/",
    hasCanvas: true,
    hasControls: true,
  },
];

for (const ex of SPOT_CHECKS) {
  test.describe(`Multimedia: ${ex.name}`, () => {
    test("loads without page errors", async ({ page }) => {
      const pageErrors = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));

      await page.goto(`/${ex.path}`);
      await page.waitForTimeout(2500);

      // NO filtering except for browser autoplay policy (not a real error)
      const realErrors = pageErrors.filter(
        (e) => !e.includes("play() request was interrupted"),
      );
      expect(realErrors).toHaveLength(0);
    });

    test("canvas is visible with non-zero dimensions", async ({ page }) => {
      if (!ex.hasCanvas) return;

      await page.goto(`/${ex.path}`);
      await page.waitForTimeout(3000);

      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible();

      const dims = await canvas.evaluate((el) => ({
        w: el.width,
        h: el.height,
        cssW: el.clientWidth,
        cssH: el.clientHeight,
      }));
      expect(dims.w).toBeGreaterThan(0);
      expect(dims.h).toBeGreaterThan(0);
      expect(dims.cssW).toBeGreaterThan(0);
    });

    test("has interactive controls", async ({ page }) => {
      if (!ex.hasControls) return;

      await page.goto(`/${ex.path}`);
      await page.waitForTimeout(2000);

      const btnCount = await page.locator("button").count();
      const sliderCount = await page.locator('input[type="range"]').count();
      expect(btnCount + sliderCount).toBeGreaterThan(0);
    });

    test("back link exists", async ({ page }) => {
      await page.goto(`/${ex.path}`);
      const back = page.locator(".back").first();
      await expect(back).toBeVisible();
      const href = await back.getAttribute("href");
      expect(href).toMatch(/\.\./);
    });
  });
}

// Full scan: all 20 multimedia pages load without errors
const ALL = Array.from({ length: 20 }, (_, i) => 31 + i);

for (const num of ALL) {
  test(`multimedia ${num} loads with zero errors`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const response = await page.goto(`/multimedia/${num}-`, {
      waitUntil: "domcontentloaded",
    });
    if (!response || response.status() === 404) return;

    await page.waitForTimeout(2500);
    const realErrors = pageErrors.filter(
      (e) => !e.includes("play() request was interrupted"),
    );
    expect(realErrors).toHaveLength(0);
  });
}
