import { test, expect } from '@playwright/test';

test.describe('Desktop Environment', () => {
  test('should load the desktop interface', async ({ page }) => {
    await page.goto('/');

    // Check that desktop is present
    await expect(page.locator('.desktop')).toBeVisible();

    // Check that taskbar is present
    await expect(page.locator('.taskbar')).toBeVisible();

    // Check start button is present
    await expect(page.locator('.start-button')).toBeVisible();

    // Check clock is present
    await expect(page.locator('.clock')).toBeVisible();
  });

  test('should open a window when double-clicking desktop icon', async ({ page }) => {
    await page.goto('/');

    // Wait for desktop to load
    await expect(page.locator('.desktop')).toBeVisible();

    // Find and double-click a desktop icon
    const firstIcon = page.locator('.desktop-icon').first();
    if (await firstIcon.isVisible()) {
      await firstIcon.dblclick();

      // Check that a window opened
      await expect(page.locator('.window')).toBeVisible();
    }
  });

  test('should show system time in taskbar', async ({ page }) => {
    await page.goto('/');

    const clock = page.locator('.clock');
    await expect(clock).toBeVisible();

    // Check that time format is reasonable (HH:MM or HH:MM AM/PM format)
    const timeText = await clock.textContent();
    expect(timeText).toMatch(/^\d{1,2}:\d{2}( (AM|PM))?$/);
  });
});
