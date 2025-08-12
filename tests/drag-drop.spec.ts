/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test, expect } from '@playwright/test';

test.describe('Desktop Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.desktop')).toBeVisible();
  });

  test('should make desktop icons draggable', async ({ page }) => {
    const firstIcon = page.locator('.desktop-icon').first();
    await expect(firstIcon).toBeVisible();

    // Check that the icon has draggable attribute
    const draggableAttr = await firstIcon.getAttribute('draggable');
    expect(draggableAttr).toBe('true');
  });

  test('should allow dragging an icon to a new position', async ({ page }) => {
    const firstIcon = page.locator('.desktop-icon').first();
    await expect(firstIcon).toBeVisible();

    // Get initial position
    const initialBox = await firstIcon.boundingBox();
    expect(initialBox).not.toBeNull();

    // Perform drag and drop
    await firstIcon.dragTo(page.locator('.desktop'), {
      targetPosition: { x: 400, y: 300 },
    });

    // Wait a bit for the position to update
    await page.waitForTimeout(100);

    // Get new position
    const newBox = await firstIcon.boundingBox();
    expect(newBox).not.toBeNull();

    // Verify the icon moved to a different position
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const movedSignificantly = Math.abs(newBox!.x - initialBox!.x) > 50 || Math.abs(newBox!.y - initialBox!.y) > 50;

    expect(movedSignificantly).toBe(true);
  });

  test('should apply dragging visual feedback', async ({ page }) => {
    const firstIcon = page.locator('.desktop-icon').first();
    await expect(firstIcon).toBeVisible();

    // Start dragging
    await firstIcon.hover();
    await page.mouse.down();

    // Check for dragging class
    await expect(firstIcon).toHaveClass(/dragging/);

    // Check visual changes during drag
    const opacity = await firstIcon.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeLessThan(1);

    // End drag
    await page.mouse.up();

    // Verify dragging class is removed
    await expect(firstIcon).not.toHaveClass(/dragging/);
  });

  test('should preserve icon functionality after drag', async ({ page }) => {
    const firstIcon = page.locator('.desktop-icon').first();
    await expect(firstIcon).toBeVisible();

    // Drag the icon
    await firstIcon.dragTo(page.locator('.desktop'), {
      targetPosition: { x: 300, y: 200 },
    });

    // Wait for drag to complete
    await page.waitForTimeout(100);

    // Double-click should still work
    await firstIcon.dblclick();

    // Check that a window opened
    await expect(page.locator('.window')).toBeVisible({ timeout: 5000 });
  });

  test('should keep icons within desktop boundaries', async ({ page }) => {
    const firstIcon = page.locator('.desktop-icon').first();
    const desktop = page.locator('.desktop');

    await expect(firstIcon).toBeVisible();
    await expect(desktop).toBeVisible();

    const desktopBox = await desktop.boundingBox();
    expect(desktopBox).not.toBeNull();

    // Try to drag to an extreme position outside the desktop
    await firstIcon.dragTo(desktop, {
      targetPosition: { x: desktopBox!.width + 100, y: desktopBox!.height + 100 },
    });

    await page.waitForTimeout(100);

    // Check that icon is still within desktop bounds
    const iconBox = await firstIcon.boundingBox();
    expect(iconBox).not.toBeNull();

    expect(iconBox!.x).toBeGreaterThanOrEqual(0);
    expect(iconBox!.y).toBeGreaterThanOrEqual(0);
    expect(iconBox!.x + iconBox!.width).toBeLessThanOrEqual(desktopBox!.width);
    expect(iconBox!.y + iconBox!.height).toBeLessThanOrEqual(desktopBox!.height);
  });

  test('should handle multiple icons independently', async ({ page }) => {
    const icons = page.locator('.desktop-icon');
    const iconCount = await icons.count();

    if (iconCount >= 2) {
      const firstIcon = icons.nth(0);
      const secondIcon = icons.nth(1);

      // Get initial positions
      const firstInitialBox = await firstIcon.boundingBox();
      const secondInitialBox = await secondIcon.boundingBox();

      // Drag first icon
      await firstIcon.dragTo(page.locator('.desktop'), {
        targetPosition: { x: 250, y: 150 },
      });

      await page.waitForTimeout(100);

      // Check that only first icon moved
      const firstNewBox = await firstIcon.boundingBox();
      const secondNewBox = await secondIcon.boundingBox();

      expect(firstNewBox!.x).not.toBeCloseTo(firstInitialBox!.x, 5);
      expect(secondNewBox!.x).toBeCloseTo(secondInitialBox!.x, 5);
      expect(secondNewBox!.y).toBeCloseTo(secondInitialBox!.y, 5);
    }
  });

  test('should prevent text selection during drag', async ({ page }) => {
    const firstIcon = page.locator('.desktop-icon').first();
    await expect(firstIcon).toBeVisible();

    // Check CSS user-select property
    const userSelect = await firstIcon.evaluate((el) => window.getComputedStyle(el).userSelect);
    expect(userSelect).toBe('none');
  });

  test('should show proper cursor states', async ({ page }) => {
    const firstIcon = page.locator('.desktop-icon').first();
    await expect(firstIcon).toBeVisible();

    // Normal state should have pointer cursor
    await firstIcon.hover();
    const normalCursor = await firstIcon.evaluate((el) => window.getComputedStyle(el).cursor);
    expect(normalCursor).toBe('pointer');

    // During drag should have grabbing cursor
    await page.mouse.down();
    const draggingCursor = await firstIcon.evaluate((el) => window.getComputedStyle(el).cursor);
    expect(draggingCursor).toBe('grabbing');

    await page.mouse.up();
  });
});
