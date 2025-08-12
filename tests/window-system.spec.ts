import { test, expect } from '@playwright/test';

test.describe('Window System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.desktop')).toBeVisible();
  });

  test('should handle different window sizes for different applications', async ({ page }) => {
    // Open start menu
    await page.click('.start-button');
    await expect(page.locator('.start-menu')).toBeVisible();

    // Launch calculator (should be compact)
    await page.click('button:has-text("Calculator")');
    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    await expect(calculatorWindow).toBeVisible();

    const calcBox = await calculatorWindow.boundingBox();
    expect(calcBox!.width).toBe(320);
    expect(calcBox!.height).toBe(460);

    // Launch another app (should be larger)
    await page.click('.start-button');
    await page.click('button:has-text("File Explorer")');
    const explorerWindow = page.locator('.window[data-component="explorer"]');
    await expect(explorerWindow).toBeVisible();

    const explorerBox = await explorerWindow.boundingBox();
    expect(explorerBox!.width).toBe(800);
    expect(explorerBox!.height).toBe(600);
  });

  test('should apply component-specific window constraints', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');

    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    await expect(calculatorWindow).toBeVisible();

    // Check that data-component attribute is set
    const dataComponent = await calculatorWindow.getAttribute('data-component');
    expect(dataComponent).toBe('calculator');

    // Check calculator-specific styling is applied
    const windowStyles = await calculatorWindow.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        minWidth: styles.minWidth,
        minHeight: styles.minHeight,
        borderRadius: styles.borderRadius,
      };
    });

    expect(windowStyles.minWidth).toBe('280px');
    expect(windowStyles.minHeight).toBe('430px');
    expect(windowStyles.borderRadius).toBe('6px');
  });

  test('should handle non-resizable windows', async ({ page }) => {
    // Launch calculator (non-resizable)
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');

    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    await expect(calculatorWindow).toBeVisible();

    // Resize handle should not be visible
    const resizeHandle = calculatorWindow.locator('.window-resize-handle');
    await expect(resizeHandle).not.toBeVisible();

    // Launch resizable window for comparison
    await page.click('.start-button');
    await page.click('button:has-text("File Explorer")');

    const explorerWindow = page.locator('.window[data-component="explorer"]');
    await expect(explorerWindow).toBeVisible();

    // Resize handle should be visible for regular windows
    const explorerResizeHandle = explorerWindow.locator('.window-resize-handle');
    await expect(explorerResizeHandle).toBeVisible();
  });

  test('should manage window z-index correctly', async ({ page }) => {
    // Launch multiple windows
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');

    await page.click('.start-button');
    await page.click('button:has-text("File Explorer")');

    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    const explorerWindow = page.locator('.window[data-component="explorer"]');

    await expect(calculatorWindow).toBeVisible();
    await expect(explorerWindow).toBeVisible();

    // Get initial z-index values
    const calcZIndex = await calculatorWindow.evaluate((el) => window.getComputedStyle(el).zIndex);
    const explorerZIndex = await explorerWindow.evaluate((el) => window.getComputedStyle(el).zIndex);

    // Explorer should be on top (launched second)
    expect(parseInt(explorerZIndex)).toBeGreaterThan(parseInt(calcZIndex));

    // Click calculator header to bring it to front (use force to avoid interception)
    await calculatorWindow.locator('.window-header').click({ force: true });

    // Wait for z-index to update
    await page.waitForTimeout(100);

    const newCalcZIndex = await calculatorWindow.evaluate((el) => window.getComputedStyle(el).zIndex);

    // Calculator should now be on top
    expect(parseInt(newCalcZIndex)).toBeGreaterThan(parseInt(explorerZIndex));
  });

  test('should handle window dragging', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');

    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    await expect(calculatorWindow).toBeVisible();

    // Get initial position
    const initialBox = await calculatorWindow.boundingBox();
    expect(initialBox).not.toBeNull();

    // Drag window by header
    const windowHeader = calculatorWindow.locator('.window-header');
    await windowHeader.dragTo(page.locator('.desktop'), {
      targetPosition: { x: 400, y: 200 },
      force: true,
    });

    // Wait for drag to complete
    await page.waitForTimeout(100);

    // Check new position
    const newBox = await calculatorWindow.boundingBox();
    expect(newBox).not.toBeNull();

    // Window should have moved
    const movedSignificantly = Math.abs(newBox!.x - initialBox!.x) > 50 || Math.abs(newBox!.y - initialBox!.y) > 50;
    expect(movedSignificantly).toBe(true);
  });

  test('should handle window controls (minimize, maximize, close)', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');

    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    await expect(calculatorWindow).toBeVisible();

    // Test minimize
    await page.click('.window-control.minimize');
    await expect(calculatorWindow).not.toBeVisible();

    // Check taskbar shows minimized window (adjust selector as needed)
    const taskbarButton = page.locator('.taskbar-item:has-text("Calculator")');
    await expect(taskbarButton).toBeVisible();

    // Restore from taskbar
    await taskbarButton.click();
    await expect(calculatorWindow).toBeVisible();

    // Test maximize (calculator should not allow maximize since it's non-resizable)
    const maximizeButton = calculatorWindow.locator('.window-control.maximize');
    
    // Check that maximize button is disabled
    expect(await maximizeButton.isDisabled()).toBe(true);
    
    // Window should remain the same size (non-resizable)
    const boxAfterMaximize = await calculatorWindow.boundingBox();
    expect(boxAfterMaximize!.width).toBe(320);
    expect(boxAfterMaximize!.height).toBe(460);

    // Test close
    await page.click('.window-control.close');
    await expect(calculatorWindow).not.toBeVisible();
  });

  test('should maintain window boundaries', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');

    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    await expect(calculatorWindow).toBeVisible();

    // Try to drag window off-screen (use force to avoid interception issues)
    const windowHeader = calculatorWindow.locator('.window-header');
    await windowHeader.dragTo(page.locator('.desktop'), {
      targetPosition: { x: 50, y: 50 },
      force: true,
    });

    await page.waitForTimeout(100);

    // Window should stay within bounds
    const finalBox = await calculatorWindow.boundingBox();
    expect(finalBox!.x).toBeGreaterThanOrEqual(0);
    expect(finalBox!.y).toBeGreaterThanOrEqual(0);
  });

  test('should handle multiple applications properly', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');

    // Launch different application
    await page.click('.start-button');
    await page.click('button:has-text("File Explorer")');

    // Both windows should be visible
    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    const explorerWindow = page.locator('.window[data-component="explorer"]');

    await expect(calculatorWindow).toBeVisible();
    await expect(explorerWindow).toBeVisible();

    // They should have different positions
    const calcBox = await calculatorWindow.boundingBox();
    const explorerBox = await explorerWindow.boundingBox();

    expect(calcBox!.x !== explorerBox!.x || calcBox!.y !== explorerBox!.y).toBe(true);
  });
});
