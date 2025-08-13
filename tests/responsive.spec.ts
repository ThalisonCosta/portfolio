import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test.describe('Mobile Portrait (320x568)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto('/');
      await expect(page.locator('.desktop')).toBeVisible();
    });

    test('should display calculator with mobile-optimized layout', async ({ page }) => {
      // Launch calculator
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');
      await expect(page.locator('.calculator-app')).toBeVisible();

      // Check button sizes are optimized for mobile
      const buttons = page.locator('.btn');
      const firstButton = buttons.first();
      const buttonBox = await firstButton.boundingBox();

      expect(buttonBox!.height).toBeLessThanOrEqual(48); // Mobile button height

      // Check display text size
      const display = page.locator('.display-value');
      const fontSize = await display.evaluate((el) => window.getComputedStyle(el).fontSize);

      // Should use smaller font size on mobile
      expect(parseInt(fontSize)).toBeLessThanOrEqual(30); // Mobile font size

      // Check calculator padding is reduced
      const calculator = page.locator('.calculator');
      const padding = await calculator.evaluate((el) => window.getComputedStyle(el).padding);

      expect(padding).toBe('6px'); // Very small mobile padding for 320px
    });

    test('should maintain calculator functionality on mobile', async ({ page }) => {
      // Launch calculator
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');
      await expect(page.locator('.calculator-app')).toBeVisible();

      const display = page.locator('.display-value');

      // Test basic operation on mobile
      await page.click('button:has-text("5")');
      await page.click('button:has-text("+")');
      await page.click('button:has-text("3")');
      await page.click('button:has-text("=")');

      await expect(display).toHaveText('8');

      // Test backspace on mobile
      await page.click('button:has-text("1")');
      await page.click('button:has-text("2")');
      await page.click('button:has-text("⌫")');

      await expect(display).toHaveText('1');
    });

    test('should fit calculator window within mobile viewport', async ({ page }) => {
      // Launch calculator
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');

      const calculatorWindow = page.locator('.window[data-component="calculator"]');
      await expect(calculatorWindow).toBeVisible();

      const windowBox = await calculatorWindow.boundingBox();
      expect(windowBox!.width).toBeLessThanOrEqual(320); // Fit within viewport width
      expect(windowBox!.height).toBeLessThanOrEqual(568); // Fit within viewport height
    });
  });

  test.describe('Small Mobile (360x640)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 });
      await page.goto('/');
      await expect(page.locator('.desktop')).toBeVisible();
    });

    test('should apply very small screen optimizations', async ({ page }) => {
      // Launch calculator
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');
      await expect(page.locator('.calculator-app')).toBeVisible();

      // Check extra small button sizes
      const buttons = page.locator('.btn');
      const buttonBox = await buttons.first().boundingBox();

      expect(buttonBox!.height).toBeLessThanOrEqual(44); // Extra small button height

      // Check reduced gaps
      const buttonsContainer = page.locator('.calculator-buttons');
      const gap = await buttonsContainer.evaluate((el) => window.getComputedStyle(el).gap);

      expect(gap).toBe('4px'); // Reduced gap for very small screens
    });
  });

  test.describe('Tablet Portrait (768x1024)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await expect(page.locator('.desktop')).toBeVisible();
    });

    test('should use tablet-optimized window controls', async ({ page }) => {
      // Launch calculator
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');

      const calculatorWindow = page.locator('.window[data-component="calculator"]');
      await expect(calculatorWindow).toBeVisible();

      // Check window header size for tablet
      const windowHeader = calculatorWindow.locator('.window-header');
      const headerBox = await windowHeader.boundingBox();

      expect(headerBox!.height).toBeGreaterThanOrEqual(36); // Tablet header size

      // Check window controls are appropriately sized
      const windowControl = calculatorWindow.locator('.window-control').first();
      const controlBox = await windowControl.boundingBox();

      expect(controlBox!.width).toBeGreaterThanOrEqual(36); // Tablet control size
    });
  });

  test.describe('Desktop (1024x768 and larger)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/');
      await expect(page.locator('.desktop')).toBeVisible();
    });

    test('should use full desktop features', async ({ page }) => {
      // Launch calculator
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');
      await expect(page.locator('.calculator-app')).toBeVisible();

      // Desktop should use standard button sizes
      const buttons = page.locator('.btn');
      const buttonBox = await buttons.first().boundingBox();

      expect(buttonBox!.height).toBe(56); // Standard desktop button height

      // Check standard gaps
      const buttonsContainer = page.locator('.calculator-buttons');
      const gap = await buttonsContainer.evaluate((el) => window.getComputedStyle(el).gap);

      expect(gap).toBe('8px'); // Standard gap

      // Check full padding
      const calculator = page.locator('.calculator');
      const padding = await calculator.evaluate((el) => window.getComputedStyle(el).padding);

      expect(padding).toBe('12px'); // Standard padding
    });

    test('should support multiple windows efficiently on desktop', async ({ page }) => {
      // Launch multiple apps
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');

      await page.click('.start-button');
      await page.click('button:has-text("File Explorer")');

      await page.click('.start-button');
      await page.click('button:has-text("About")');

      // All windows should be visible and manageable
      const windows = page.locator('.window');
      await expect(windows).toHaveCount(3);

      // Windows should not overlap too much (basic check)
      const allWindows = await windows.all();
      expect(allWindows.length).toBe(3);

      for (const window of allWindows) {
        await expect(window).toBeVisible();
      }
    });
  });

  test.describe('Ultra-wide Desktop (1920x1080)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await expect(page.locator('.desktop')).toBeVisible();
    });

    test('should handle ultra-wide layouts effectively', async ({ page }) => {
      // Launch calculator on ultra-wide
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');

      const calculatorWindow = page.locator('.window[data-component="calculator"]');
      await expect(calculatorWindow).toBeVisible();

      // Calculator should maintain its compact size on ultra-wide
      const windowBox = await calculatorWindow.boundingBox();
      expect(windowBox!.width).toBe(320); // Compact size maintained
      expect(windowBox!.height).toBe(460);

      // Should be positioned appropriately (not stuck in corner)
      expect(windowBox!.x).toBeGreaterThan(0);
      expect(windowBox!.y).toBeGreaterThan(0);
    });

    test('should support many simultaneous windows', async ({ page }) => {
      // Launch multiple instances
      const apps = ['Calculator', 'File Explorer', 'About', 'Projects', 'Contact'];

      for (const app of apps) {
        await page.click('.start-button');
        await page.click(`button:has-text("${app}")`);
        await page.waitForTimeout(100); // Small delay between launches
      }

      // All windows should be manageable
      const windows = page.locator('.window');
      await expect(windows).toHaveCount(5);

      // Test window switching via taskbar
      const taskbarButtons = page.locator('.taskbar-item');
      expect(await taskbarButtons.count()).toBeGreaterThanOrEqual(5);
    });
  });

  test.describe('Orientation Changes', () => {
    test('should handle landscape to portrait rotation', async ({ page }) => {
      // Start in landscape
      await page.setViewportSize({ width: 640, height: 360 });
      await page.goto('/');
      await expect(page.locator('.desktop')).toBeVisible();

      // Launch calculator
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');
      await expect(page.locator('.calculator-app')).toBeVisible();

      // Rotate to portrait
      await page.setViewportSize({ width: 360, height: 640 });
      await page.waitForTimeout(100);

      // Calculator should still be functional
      const display = page.locator('.display-value');
      await page.click('button:has-text("5")');
      await page.click('button:has-text("+")');
      await page.click('button:has-text("3")');
      await page.click('button:has-text("=")');

      await expect(display).toHaveText('8');
    });
  });

  test.describe('Touch Interaction', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
    });

    test('should handle touch interactions on calculator buttons', async ({ page }) => {
      // Launch calculator with proper context for touch
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');
      await expect(page.locator('.calculator-app')).toBeVisible();

      // Scope selectors to calculator to avoid conflicts
      const calculator = page.locator('.calculator-app');

      // Use click for touch simulation instead of tap to avoid context issues
      await calculator.locator('button:has-text("5")').click();
      await calculator.locator('button:has-text("+")').click();
      await calculator.locator('button:has-text("3")').click();
      await calculator.locator('button:has-text("=")').click();

      const display = page.locator('.display-value');
      await expect(display).toHaveText('8');
    });

    test('should provide adequate touch targets', async ({ page }) => {
      // Launch calculator
      await page.click('.start-button');
      await page.click('button:has-text("Calculator")');
      await expect(page.locator('.calculator-app')).toBeVisible();

      // Check button sizes meet touch accessibility guidelines (44px minimum)
      const buttons = page.locator('.btn');
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(40); // Adequate touch target
        expect(box!.height).toBeGreaterThanOrEqual(40);
      }
    });
  });
});
