import { test, expect } from '@playwright/test';

test.describe('Settings App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the desktop to load
    await page.waitForSelector('.desktop');
  });

  test('opens settings app from desktop', async ({ page }) => {
    // Double-click on Settings app icon
    await page.dblclick('[data-testid="settings-app"]', { timeout: 10000 });

    // Wait for settings window to open
    await page.waitForSelector('.settings-app', { timeout: 5000 });

    // Check that settings window is visible
    await expect(page.locator('.settings-app')).toBeVisible();
    await expect(page.locator('text=⚙️ Settings')).toBeVisible();
  });

  test('navigates between settings tabs', async ({ page }) => {
    // Open settings app
    await page.dblclick('[data-testid="settings-app"]', { timeout: 10000 });
    await page.waitForSelector('.settings-app');

    // Check desktop tab is active by default
    await expect(page.locator('.settings-app__tab--active')).toContainText('Desktop');

    // Click language tab
    await page.click('text=Language & Region');
    await expect(page.locator('.settings-app__tab--active')).toContainText('Language & Region');

    // Click datetime tab
    await page.click('text=Date & Time');
    await expect(page.locator('.settings-app__tab--active')).toContainText('Date & Time');
  });

  test('changes desktop background color', async ({ page }) => {
    // Open settings app
    await page.dblclick('[data-testid="settings-app"]', { timeout: 10000 });
    await page.waitForSelector('.settings-app');

    // Get initial background style
    const initialBg = await page.locator('.desktop').getAttribute('style');

    // Find and interact with color picker
    const colorInput = page.locator('input[type="color"]').first();
    await colorInput.fill('#ff0000');

    // Wait a bit for the change to apply
    await page.waitForTimeout(500);

    // Check that background changed
    const newBg = await page.locator('.desktop').getAttribute('style');
    expect(newBg).not.toBe(initialBg);
    expect(newBg).toContain('#ff0000');
  });

  test('enables gradient mode', async ({ page }) => {
    // Open settings app
    await page.dblclick('[data-testid="settings-app"]', { timeout: 10000 });
    await page.waitForSelector('.settings-app');

    // Enable gradient mode
    await page.check('text=Gradient Mode');

    // Check that gradient controls appear
    await expect(page.locator('text=Linear')).toBeVisible();
    await expect(page.locator('text=Radial')).toBeVisible();
    await expect(page.locator('text=Gradient Colors')).toBeVisible();
  });

  test('changes language', async ({ page }) => {
    // Open settings app
    await page.dblclick('[data-testid="settings-app"]', { timeout: 10000 });
    await page.waitForSelector('.settings-app');

    // Go to language tab
    await page.click('text=Language & Region');

    // Click on Spanish language option
    await page.click('text=Español');

    // Wait for language change
    await page.waitForTimeout(1000);

    // Check that interface changed to Spanish (check header)
    await expect(page.locator('text=⚙️ Configuración')).toBeVisible();
  });

  test('enables RGB timer', async ({ page }) => {
    // Open settings app
    await page.dblclick('[data-testid="settings-app"]', { timeout: 10000 });
    await page.waitForSelector('.settings-app');

    // Enable RGB timer
    await page.check('text=Enable automatic color changing');

    // Check that timer controls appear
    await expect(page.locator('text=Change interval')).toBeVisible();
    await expect(page.locator('text=Timer Colors')).toBeVisible();

    // Wait to see if background starts changing
    const initialBg = await page.locator('.desktop').getAttribute('style');
    await page.waitForTimeout(2000);
    const newBg = await page.locator('.desktop').getAttribute('style');

    // Background should change due to RGB timer
    expect(newBg).not.toBe(initialBg);
  });

  test('changes timezone in datetime settings', async ({ page }) => {
    // Open settings app
    await page.dblclick('[data-testid="settings-app"]', { timeout: 10000 });
    await page.waitForSelector('.settings-app');

    // Go to datetime tab
    await page.click('text=Date & Time');

    // Change timezone
    await page.selectOption('select', 'America/New_York');

    // Check that timezone changed in preview
    await expect(page.locator('text=Timezone: America/New_York')).toBeVisible();
  });

  test('saves and loads color presets', async ({ page }) => {
    // Open settings app
    await page.dblclick('[data-testid="settings-app"]', { timeout: 10000 });
    await page.waitForSelector('.settings-app');

    // Set a custom color
    const colorInput = page.locator('input[type="color"]').first();
    await colorInput.fill('#ff6600');

    // Save as preset
    await page.click('text=💾 Save Preset');
    await page.fill('input[placeholder*="Preset Name"]', 'Orange Theme');
    await page.click('text=Save');

    // Verify preset appears in list
    await expect(page.locator('text=Orange Theme')).toBeVisible();

    // Change color to something else
    await colorInput.fill('#0000ff');

    // Load the preset
    await page.click('text=Orange Theme >> .. >> text=Load');

    // Verify color changed back
    await page.waitForTimeout(500);
    const bgStyle = await page.locator('.desktop').getAttribute('style');
    expect(bgStyle).toContain('#ff6600');
  });
});
