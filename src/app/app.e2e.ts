import { test, expect } from "@playwright/test";

test.describe("Lumen Bloom Bootstrap Smoke Test", () => {
  test("should render the home screen with canvas and UI elements", async ({ page }) => {
    // Go to development server
    await page.goto("/");

    // Check title
    await expect(page).toHaveTitle("Lumen Bloom — 빛의 탄생");

    // Assert main menu is visible
    const mainMenu = page.locator("#main-menu");
    await expect(mainMenu).toBeVisible();
    await expect(mainMenu).not.toHaveClass(/hidden/);

    // Assert Canvas is present
    const canvas = page.locator("#game-canvas");
    await expect(canvas).toBeAttached();

    // Click Start button
    const startBtn = page.locator("#btn-start");
    await startBtn.click({ force: true });

    // Main menu should hide
    await expect(mainMenu).toHaveClass(/hidden/);

    // HUD overlay should display
    const hud = page.locator("#hud-overlay");
    await expect(hud).toBeVisible();
    await expect(hud).not.toHaveClass(/hidden/);
  });
});
