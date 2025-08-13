import { test, expect } from '@playwright/test';

test.describe('Terminal Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.desktop')).toBeVisible();
  });

  test('should launch terminal from start menu', async ({ page }) => {
    // Open start menu
    await page.click('.start-button');
    await expect(page.locator('.start-menu')).toBeVisible();

    // Click terminal app
    await page.click('button:has-text("Terminal")');

    // Wait for terminal window to open
    const terminalWindow = page.locator('.window[data-component="terminal"]');
    await expect(terminalWindow).toBeVisible();

    // Check window has correct title
    await expect(terminalWindow.locator('.window-title')).toHaveText('Terminal');
  });

  test('should display terminal prompt', async ({ page }) => {
    // Launch terminal
    await page.click('.start-button');
    await page.click('button:has-text("Terminal")');

    // Wait for terminal to load
    await expect(page.locator('.terminal-app')).toBeVisible();

    // Check for terminal header
    const header = page.locator('.terminal-header');
    await expect(header).toBeVisible();
  });

  test('should handle terminal input', async ({ page }) => {
    // Launch terminal
    await page.click('.start-button');
    await page.click('button:has-text("Terminal")');

    // Wait for terminal to load
    await expect(page.locator('.terminal-app')).toBeVisible();

    // Check for input field
    const input = page.locator('.terminal-input');
    await expect(input).toBeVisible();

    // Type a command
    await input.type('help');

    // Press Enter
    await input.press('Enter');

    // Check that output appears
    await expect(page.locator('.terminal-output')).toBeVisible();
  });

  test('should close terminal window properly', async ({ page }) => {
    // Launch terminal
    await page.click('.start-button');
    await page.click('button:has-text("Terminal")');

    const terminalWindow = page.locator('.window[data-component="terminal"]');
    await expect(terminalWindow).toBeVisible();

    // Close the window
    await page.click('.window-control.close');

    // Window should be closed
    await expect(terminalWindow).not.toBeVisible();
  });

  test('should support basic linux commands', async ({ page }) => {
    // Launch terminal
    await page.click('.start-button');
    await page.click('button:has-text("Terminal")');

    // Wait for terminal to load
    await expect(page.locator('.terminal-app')).toBeVisible();

    const input = page.locator('.terminal-input');

    // Test pwd command
    await input.type('pwd');
    await input.press('Enter');

    // Should show current directory
    await expect(page.locator('.terminal-output')).toContainText('/');

    // Test ls command
    await input.type('ls');
    await input.press('Enter');

    // Should show directory listing
    await expect(page.locator('.terminal-output')).toBeVisible();
  });

  test('should support basic windows commands', async ({ page }) => {
    // Launch terminal
    await page.click('.start-button');
    await page.click('button:has-text("Terminal")');

    // Wait for terminal to load
    await expect(page.locator('.terminal-app')).toBeVisible();

    const input = page.locator('.terminal-input');

    // Test dir command
    await input.type('dir');
    await input.press('Enter');

    // Should show directory listing
    await expect(page.locator('.terminal-output')).toBeVisible();
  });

  test('should maintain terminal window dimensions', async ({ page }) => {
    // Launch terminal
    await page.click('.start-button');
    await page.click('button:has-text("Terminal")');

    const terminalWindow = page.locator('.window[data-component="terminal"]');
    await expect(terminalWindow).toBeVisible();

    // Check window dimensions (should be 800x600 by default)
    const windowBox = await terminalWindow.boundingBox();
    expect(windowBox).not.toBeNull();
    expect(windowBox!.width).toBe(800);
    expect(windowBox!.height).toBe(600);

    // Verify terminal is resizable
    const resizeHandle = terminalWindow.locator('.window-resize-handle');
    await expect(resizeHandle).toBeVisible();
  });
});
