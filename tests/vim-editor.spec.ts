import { test, expect } from '@playwright/test';

/**
 * Vim Editor Tests
 * Tests for vim functionality within the terminal application
 */

test.describe('Vim Editor Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the desktop
    await page.goto('/');
    await expect(page.locator('.desktop')).toBeVisible();

    // Open terminal from start menu
    await page.click('.start-button');
    await expect(page.locator('.start-menu')).toBeVisible();

    // Click terminal app
    await page.click('button:has-text("Terminal")');

    // Wait for terminal window to open
    await expect(page.locator('.window[data-component="terminal"]')).toBeVisible();

    // Wait for terminal input to be ready
    await expect(page.locator('.terminal-input')).toBeVisible();

    // Start vim by typing the vim command
    await page.fill('.terminal-input', 'vim test.txt');
    await page.press('.terminal-input', 'Enter');

    // Wait for vim editor to load
    await page.waitForSelector('.vim-editor', { timeout: 10000 });

    // Enter insert mode
    await page.press('.vim-editor', 'i');
  });

  test('should handle Enter key to create new lines', async ({ page }) => {
    // Type some initial text
    await page.type('.vim-editor', 'First line');

    // Press Enter to create new line
    await page.press('.vim-editor', 'Enter');

    // Type text on second line
    await page.type('.vim-editor', 'Second line');

    // Check that status bar shows 2 lines (more reliable than counting DOM elements)
    await expect(page.locator('.vim-status-bar')).toContainText('2 lines');

    // Check that current line (line 2) contains the second line text
    const currentLineContent = await page.locator('.vim-line').first().textContent();
    expect(currentLineContent).toContain('Second line');

    // Navigate to first line to verify it exists
    await page.press('.vim-editor', 'ArrowUp');

    // Small delay for navigation
    await page.waitForTimeout(100);

    // Check that we're now on line 1 and can see first line content
    const firstLineContent = await page.locator('.vim-line').first().textContent();
    expect(firstLineContent).toContain('First line');
  });

  test('should handle multiple consecutive Enter key presses', async ({ page }) => {
    // Type initial text
    await page.type('.vim-editor', 'Line 1');

    // Press Enter multiple times
    await page.press('.vim-editor', 'Enter');
    await page.press('.vim-editor', 'Enter');
    await page.press('.vim-editor', 'Enter');

    // Type text after empty lines
    await page.type('.vim-editor', 'Line 5');

    // Check that we have 5 lines total (including empty ones)
    await expect(page.locator('.vim-status-bar')).toContainText('5 lines');

    // Check that cursor is visible and positioned correctly
    const cursor = await page.locator('.vim-cursor');
    expect(cursor).toBeVisible();

    // Check that current line shows the text we typed
    const currentLineContent = await page.locator('.vim-line').first().textContent();
    expect(currentLineContent).toContain('Line 5');
  });

  test('should create line breaks at cursor position', async ({ page }) => {
    // Type text
    await page.type('.vim-editor', 'Hello World');

    // Move cursor to middle of text using arrow keys
    await page.press('.vim-editor', 'ArrowLeft');
    await page.press('.vim-editor', 'ArrowLeft');
    await page.press('.vim-editor', 'ArrowLeft');
    await page.press('.vim-editor', 'ArrowLeft');
    await page.press('.vim-editor', 'ArrowLeft'); // Cursor should be after "Hello "

    // Press Enter to split line
    await page.press('.vim-editor', 'Enter');

    // Check that we now have 2 lines
    await expect(page.locator('.vim-status-bar')).toContainText('2 lines');

    // Check current line (line 2) contains "World"
    const currentLineContent = await page.locator('.vim-line').first().textContent();
    expect(currentLineContent).toContain('World');

    // Navigate up to check first line contains "Hello"
    await page.press('.vim-editor', 'ArrowUp');
    await page.waitForTimeout(100);

    const firstLineContent = await page.locator('.vim-line').first().textContent();
    expect(firstLineContent).toContain('Hello');
  });

  test('should auto-scroll to keep new lines visible', async ({ page }) => {
    // Add many lines to test scrolling
    for (let i = 1; i <= 30; i++) {
      await page.type('.vim-editor', `Line ${i}`);
      await page.press('.vim-editor', 'Enter');

      // Small delay to allow rendering
      await page.waitForTimeout(50);
    }

    // Check that cursor is still visible after all entries
    const cursor = await page.locator('.vim-cursor');
    expect(cursor).toBeVisible();

    // Verify we have 31 lines total (30 with text + 1 empty at end)
    await expect(page.locator('.vim-status-bar')).toContainText('31 lines');

    // Check that we can see we're at the bottom of the file
    await expect(page.locator('.vim-status-bar')).toContainText('31,1');
  });

  test('should maintain cursor position on new line', async ({ page }) => {
    // Type text and press Enter
    await page.type('.vim-editor', 'Test line');
    await page.press('.vim-editor', 'Enter');

    // Cursor should be at the beginning of new line (column 0)
    const cursor = await page.locator('.vim-cursor');
    expect(cursor).toBeVisible();

    // Check position shows line 2, column 1
    await expect(page.locator('.vim-status-bar')).toContainText('2,1');

    // Type on new line to verify cursor position
    await page.type('.vim-editor', 'New line text');

    // Check that current line contains the new text
    const currentLineContent = await page.locator('.vim-line').first().textContent();
    expect(currentLineContent).toContain('New line text');
  });

  test('should work with Enter key in different vim modes', async ({ page }) => {
    // Test in insert mode (already in insert mode from beforeEach)
    await page.type('.vim-editor', 'Insert mode');
    await page.press('.vim-editor', 'Enter');
    await page.type('.vim-editor', 'New line in insert');

    // Switch to normal mode
    await page.press('.vim-editor', 'Escape');

    // Verify we're in normal mode
    await expect(page.locator('.vim-status-bar')).toContainText('NORMAL');

    // Enter insert mode again and test Enter
    await page.press('.vim-editor', 'i');
    await expect(page.locator('.vim-status-bar')).toContainText('INSERT');

    await page.press('.vim-editor', 'Enter');
    await page.type('.vim-editor', 'Another line');

    // Verify we have 4 lines total
    await expect(page.locator('.vim-status-bar')).toContainText('4 lines');
  });

  test('should handle Enter key with empty lines', async ({ page }) => {
    // Press Enter on empty editor
    await page.press('.vim-editor', 'Enter');
    await page.press('.vim-editor', 'Enter');

    // Add text after empty lines
    await page.type('.vim-editor', 'Text after empties');

    // Check that we have 3 lines (2 empty + 1 with text)
    await expect(page.locator('.vim-status-bar')).toContainText('3 lines');

    // Check that current line has the text we typed
    const currentLineContent = await page.locator('.vim-line').first().textContent();
    expect(currentLineContent).toContain('Text after empties');
  });
});
