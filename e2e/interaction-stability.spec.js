/**
 * E2E: Interaction stability — verifies clicking buttons and
 * changing inputs does NOT make the view disappear.
 *
 * Uses page.evaluate() to avoid Playwright stale-element retry
 * loops caused by component re-renders replacing innerHTML.
 */
import { test, expect } from "@playwright/test";

// Test key examples from each category
const INTERACTION_TESTS = [
  { name: "01-slideshow", path: "01-slideshow/" },
  { name: "02-multitrack-timeline", path: "02-multitrack-timeline/" },
  { name: "05-keyframe-animation", path: "05-keyframe-animation/" },
  { name: "06-layer-compositor", path: "06-layer-compositor/" },
  { name: "12-fade-transitions", path: "12-fade-transitions/" },
  { name: "17-playlist-player", path: "17-playlist-player/" },
  { name: "31-music-bars", path: "multimedia/31-music-bars/" },
  { name: "35-video-glitch", path: "multimedia/35-video-glitch/" },
  { name: "41-text-kinetic", path: "multimedia/41-text-kinetic/" },
  { name: "50-multimedia-mixer", path: "multimedia/50-multimedia-mixer/" },
];

for (const ex of INTERACTION_TESTS) {
  test.describe(`Interaction: ${ex.name}`, () => {
    test("buttons click without breaking view", async ({ page }) => {
      await page.goto(`/${ex.path}`);
      await page.waitForTimeout(2500);

      // Click first 3 visible buttons via evaluate (avoids Playwright stale-element retry)
      const result = await page.evaluate(() => {
        const buttons = document.querySelectorAll("button");
        const results = [];
        for (const btn of buttons) {
          if (btn.offsetParent === null) continue; // hidden
          if (results.length >= 3) break;
          btn.click();
          results.push(btn.textContent?.trim().slice(0, 30) || "(button)");
        }
        return results;
      });

      await page.waitForTimeout(500);

      // Verify body still has content
      const bodyHTML = await page.locator("body").innerHTML();
      expect(bodyHTML.length).toBeGreaterThan(200);
      expect(result.length).toBeGreaterThan(0);
    });

    test("sliders change without breaking view", async ({ page }) => {
      await page.goto(`/${ex.path}`);
      await page.waitForTimeout(2500);

      const sliderCount = await page.locator('input[type="range"]').count();
      if (sliderCount === 0) return;

      // Change first 3 sliders via evaluate
      await page.evaluate(() => {
        const sliders = document.querySelectorAll('input[type="range"]');
        let i = 0;
        for (const s of sliders) {
          if (i >= 3) break;
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value",
          ).set;
          nativeInputValueSetter.call(s, "75");
          s.dispatchEvent(new Event("input", { bubbles: true }));
          i++;
        }
      });

      await page.waitForTimeout(500);

      const bodyHTML = await page.locator("body").innerHTML();
      expect(bodyHTML.length).toBeGreaterThan(200);
    });
  });
}

// Full scan: all 40 basic + multimedia examples — click first button, verify no crash
const ALL_EXAMPLES = [
  ...Array.from({ length: 20 }, (_, i) => ({
    num: i + 1,
    path: `${String(i + 1).padStart(2, "0")}-`,
  })),
  ...Array.from({ length: 20 }, (_, i) => ({
    num: 31 + i,
    path: `multimedia/${31 + i}-`,
  })),
];

for (const ex of ALL_EXAMPLES) {
  test(`example ${ex.num}: click does not break`, async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const resp = await page.goto(`/${ex.path}`, {
      waitUntil: "domcontentloaded",
    });
    if (!resp || resp.status() === 404) return;

    await page.waitForTimeout(2500);

    // Click first visible button via evaluate
    await page.evaluate(() => {
      const btn = document.querySelector("button");
      if (btn) btn.click();
    });

    await page.waitForTimeout(500);

    const errors = pageErrors.filter(
      (e) => !e.includes("play() request was interrupted"),
    );
    expect(errors).toHaveLength(0);

    const bodyHTML = await page.locator("body").innerHTML();
    expect(bodyHTML.length).toBeGreaterThan(200);
  });
}
