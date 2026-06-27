/**
 * E2E: Examples index page — verifies all examples are listed and navigable.
 */
import { test, expect } from "@playwright/test";

const BASIC_COUNT = 20;
const ADVANCED_COUNT = 10;
const TOTAL_EXAMPLES = BASIC_COUNT + ADVANCED_COUNT;

test.describe("Examples Index Page", () => {
  test("loads the index page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/uploop-vided Examples/);
  });

  test("shows heading and subtitle", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("uploop-vided Examples");
    await expect(page.locator(".subtitle").first()).toContainText(
      "Generative AI-driven",
    );
  });

  test("has Basic and Advanced sections", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("h2").filter({ hasText: "Basic Examples" }),
    ).toBeVisible();
    await expect(
      page.locator("h2").filter({ hasText: "Advanced Examples" }),
    ).toBeVisible();
  });

  test("has Editor Workspace link at top of Basic section", async ({
    page,
  }) => {
    await page.goto("/");
    const firstCard = page.locator(".example-card").first();
    await expect(firstCard).toContainText("Editor Workspace");
    await expect(firstCard).toHaveAttribute("href", "editor/");
  });

  test(`lists all ${BASIC_COUNT} basic examples`, async ({ page }) => {
    await page.goto("/");
    // Basic section cards (including editor)
    const basicSection = page
      .locator("h2")
      .filter({ hasText: "Basic Examples" });
    const basicList = basicSection.locator("+ .example-list");
    const cards = basicList.locator(".example-card");
    await expect(cards).toHaveCount(BASIC_COUNT + 1); // +1 for editor
  });

  test(`lists all ${ADVANCED_COUNT} advanced examples`, async ({ page }) => {
    await page.goto("/");
    // The second .example-list on the page is the advanced section
    const allLists = page.locator(".example-list");
    const count = await allLists.count();
    expect(count).toBeGreaterThanOrEqual(2);
    const advCards = allLists.nth(1).locator(".example-card");
    await expect(advCards).toHaveCount(ADVANCED_COUNT);
  });

  test("no console errors on index page", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    expect(errors).toHaveLength(0);
  });

  test("all example links are valid and have href", async ({ page }) => {
    await page.goto("/");
    const links = page.locator(".example-card");
    const count = await links.count();
    expect(count).toBeGreaterThan(30);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).toBeTruthy();
    }
  });
});
