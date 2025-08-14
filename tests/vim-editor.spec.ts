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
    
    // Check that vim buffer contains both lines
    const vimLines = await page.locator('.vim-line').count();
    expect(vimLines).toBeGreaterThanOrEqual(2);
    
    // Check content of first line
    const firstLineContent = await page.locator('.vim-line').nth(0).textContent();
    expect(firstLineContent).toContain('First line');
    
    // Check content of second line
    const secondLineContent = await page.locator('.vim-line').nth(1).textContent();
    expect(secondLineContent).toContain('Second line');
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
    
    // Check that we have at least 5 lines (including empty ones)
    const vimLines = await page.locator('.vim-line').count();
    expect(vimLines).toBeGreaterThanOrEqual(5);
    
    // Check that cursor is visible and positioned correctly
    const cursor = await page.locator('.vim-cursor');
    expect(cursor).toBeVisible();
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
    
    // Check that line was split correctly
    const firstLineContent = await page.locator('.vim-line').nth(0).textContent();
    const secondLineContent = await page.locator('.vim-line').nth(1).textContent();
    
    expect(firstLineContent).toContain('Hello');
    expect(secondLineContent).toContain('World');
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
    
    // Verify we have many lines
    const vimLines = await page.locator('.vim-line').count();
    expect(vimLines).toBeGreaterThanOrEqual(30);
  });

  test('should maintain cursor position on new line', async ({ page }) => {
    // Type text and press Enter
    await page.type('.vim-editor', 'Test line');
    await page.press('.vim-editor', 'Enter');
    
    // Cursor should be at the beginning of new line (column 0)
    const cursor = await page.locator('.vim-cursor');
    expect(cursor).toBeVisible();
    
    // Type on new line to verify cursor position
    await page.type('.vim-editor', 'New line text');
    
    const secondLineContent = await page.locator('.vim-line').nth(1).textContent();
    expect(secondLineContent).toContain('New line text');
  });

  test('should work with Enter key in different vim modes', async ({ page }) => {
    // Test in insert mode (already in insert mode from beforeEach)
    await page.type('.vim-editor', 'Insert mode');
    await page.press('.vim-editor', 'Enter');
    await page.type('.vim-editor', 'New line in insert');
    
    // Switch to normal mode
    await page.press('.vim-editor', 'Escape');
    
    // Enter insert mode again and test Enter
    await page.press('.vim-editor', 'i');
    await page.press('.vim-editor', 'Enter');
    await page.type('.vim-editor', 'Another line');
    
    // Verify all lines exist
    const vimLines = await page.locator('.vim-line').count();
    expect(vimLines).toBeGreaterThanOrEqual(3);
  });

  test('should handle Enter key with empty lines', async ({ page }) => {
    // Press Enter on empty editor
    await page.press('.vim-editor', 'Enter');
    await page.press('.vim-editor', 'Enter');
    
    // Add text after empty lines
    await page.type('.vim-editor', 'Text after empties');
    
    // Check that empty lines and text line exist
    const vimLines = await page.locator('.vim-line').count();
    expect(vimLines).toBeGreaterThanOrEqual(3);
    
    // Check that last line has the text
    const lastLineIndex = vimLines - 1;
    const lastLineContent = await page.locator('.vim-line').nth(lastLineIndex).textContent();
    expect(lastLineContent).toContain('Text after empties');
  });

});