import { test, expect } from '@playwright/test';

test.describe('Calculator Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.desktop')).toBeVisible();
  });

  test('should launch calculator from start menu with correct dimensions', async ({ page }) => {
    // Open start menu
    await page.click('.start-button');
    await expect(page.locator('.start-menu')).toBeVisible();

    // Click calculator app
    await page.click('button:has-text("Calculator")');

    // Wait for calculator window to open
    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    await expect(calculatorWindow).toBeVisible();

    // Check window dimensions
    const windowBox = await calculatorWindow.boundingBox();
    expect(windowBox).not.toBeNull();
    expect(windowBox!.width).toBe(320);
    expect(windowBox!.height).toBe(460);

    // Verify calculator is non-resizable
    const resizeHandle = calculatorWindow.locator('.window-resize-handle');
    await expect(resizeHandle).not.toBeVisible();
  });

  test('should display all calculator buttons correctly', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');
    await expect(page.locator('.calculator-app')).toBeVisible();

    const calculator = page.locator('.calculator-app');

    // Check all number buttons
    for (let i = 0; i <= 9; i++) {
      await expect(calculator.locator(`button:has-text("${i}")`)).toBeVisible();
    }

    // Check operation buttons
    await expect(calculator.locator('button:has-text("+")')).toBeVisible();
    await expect(calculator.locator('button:has-text("-")')).toBeVisible();
    await expect(calculator.locator('button:has-text("×")')).toBeVisible();
    await expect(calculator.locator('button:has-text("÷")')).toBeVisible();
    await expect(calculator.locator('button:has-text("=")')).toBeVisible();

    // Check function buttons within calculator
    await expect(calculator.locator('button:has-text("AC")')).toBeVisible();
    await expect(calculator.locator('button').filter({ hasText: /^C$/ })).toBeVisible();
    await expect(calculator.locator('button:has-text("⌫")')).toBeVisible();
    await expect(calculator.locator('button:has-text(".")')).toBeVisible();

    // Check display elements
    await expect(page.locator('.display-value')).toBeVisible();
    await expect(page.locator('.history-display')).toBeVisible();
  });

  test('should perform basic arithmetic operations', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');
    await expect(page.locator('.calculator-app')).toBeVisible();

    const calculator = page.locator('.calculator-app');
    const display = page.locator('.display-value');

    // Test addition: 5 + 3 = 8
    await calculator.locator('button:has-text("5")').click();
    await calculator.locator('button:has-text("+")').click();
    await calculator.locator('button:has-text("3")').click();
    await calculator.locator('button:has-text("=")').click();

    await expect(display).toHaveText('8');

    // Test multiplication: 4 × 6 = 24
    await calculator.locator('button:has-text("AC")').click();
    await calculator.locator('button:has-text("4")').click();
    await calculator.locator('button:has-text("×")').click();
    await calculator.locator('button:has-text("6")').click();
    await calculator.locator('button:has-text("=")').click();

    await expect(display).toHaveText('24');
  });

  test('should show history of operations', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');
    await expect(page.locator('.calculator-app')).toBeVisible();

    const calculator = page.locator('.calculator-app');
    const historyDisplay = page.locator('.history-display');

    // Perform operation and check history
    await calculator.locator('button:has-text("7")').click();
    await calculator.locator('button:has-text("+")').click();

    // History should show the operation
    await expect(historyDisplay).toHaveText('7 +');

    await calculator.locator('button:has-text("2")').click();
    await calculator.locator('button:has-text("=")').click();

    // History should show complete expression
    await expect(historyDisplay).toHaveText('7 + 2 =');
    await expect(page.locator('.display-value')).toHaveText('9');
  });

  test('should handle backspace functionality', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');
    await expect(page.locator('.calculator-app')).toBeVisible();

    const display = page.locator('.display-value');

    // Enter multiple digits
    await page.click('button:has-text("1")');
    await page.click('button:has-text("2")');
    await page.click('button:has-text("3")');
    await expect(display).toHaveText('123');

    // Test backspace removes last digit
    await page.click('button:has-text("⌫")');
    await expect(display).toHaveText('12');

    await page.click('button:has-text("⌫")');
    await expect(display).toHaveText('1');

    await page.click('button:has-text("⌫")');
    await expect(display).toHaveText('0');
  });

  test('should support keyboard input', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');
    await expect(page.locator('.calculator-app')).toBeVisible();

    const display = page.locator('.display-value');

    // Test number input via keyboard
    await page.keyboard.press('5');
    await page.keyboard.press('+');
    await page.keyboard.press('3');
    await page.keyboard.press('Enter');

    await expect(display).toHaveText('8');

    // Test multiplication via keyboard
    await page.keyboard.press('Escape'); // Clear all
    await page.keyboard.press('4');
    await page.keyboard.press('*'); // Asterisk for multiply
    await page.keyboard.press('2');
    await page.keyboard.press('=');

    await expect(display).toHaveText('8');

    // Test backspace via keyboard
    await page.keyboard.press('1');
    await page.keyboard.press('2');
    await page.keyboard.press('3');
    await page.keyboard.press('Backspace');

    await expect(display).toHaveText('12');
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');
    await expect(page.locator('.calculator-app')).toBeVisible();

    const display = page.locator('.display-value');

    // Test division by zero
    await page.click('button:has-text("5")');
    await page.click('button:has-text("÷")');
    await page.click('button:has-text("0")');
    await page.click('button:has-text("=")');

    await expect(display).toHaveText('Error');

    // Test recovery from error
    await page.click('button:has-text("AC")');
    await page.click('button:has-text("2")');
    await expect(display).toHaveText('2');
  });

  test('should handle decimal numbers correctly', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');
    await expect(page.locator('.calculator-app')).toBeVisible();

    const display = page.locator('.display-value');

    // Test decimal input
    await page.click('button:has-text("3")');
    await page.click('button:has-text(".")');
    await page.click('button:has-text("5")');
    await expect(display).toHaveText('3.5');

    // Test decimal arithmetic
    await page.click('button:has-text("+")');
    await page.click('button:has-text("2")');
    await page.click('button:has-text(".")');
    await page.click('button:has-text("5")');
    await page.click('button:has-text("=")');

    await expect(display).toHaveText('6');

    // Test multiple decimal points prevention
    await page.click('button:has-text("AC")');
    await page.click('button:has-text("5")');
    await page.click('button:has-text(".")');
    await page.click('button:has-text("2")');
    await page.click('button:has-text(".")'); // Should be ignored
    await page.click('button:has-text("3")');

    await expect(display).toHaveText('5.23');
  });

  test('should maintain compact layout without scrolling', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');

    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    await expect(calculatorWindow).toBeVisible();

    // Check that calculator content fits within window without scrolling
    const calculator = page.locator('.calculator-app');
    const windowContent = page.locator('.window-content');

    const calculatorBox = await calculator.boundingBox();
    const windowBox = await windowContent.boundingBox();

    expect(calculatorBox).not.toBeNull();
    expect(windowBox).not.toBeNull();

    // Calculator should fit within window content area
    expect(calculatorBox!.height).toBeLessThanOrEqual(windowBox!.height);
    expect(calculatorBox!.width).toBeLessThanOrEqual(windowBox!.width);

    // Check that equals button is visible and positioned correctly
    const equalsButton = page.locator('button:has-text("=")');
    await expect(equalsButton).toBeVisible();

    const equalsBox = await equalsButton.boundingBox();
    expect(equalsBox).not.toBeNull();

    // Equals button should be within or very close to the calculator area (allow small margin)
    expect(equalsBox!.y + equalsBox!.height).toBeLessThanOrEqual(calculatorBox!.y + calculatorBox!.height + 10);
  });

  test('should handle chained operations', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');
    await expect(page.locator('.calculator-app')).toBeVisible();

    const display = page.locator('.display-value');

    // Test chained operations: 2 + 3 × 4 = 20
    await page.click('button:has-text("2")');
    await page.click('button:has-text("+")');
    await page.click('button:has-text("3")');
    await page.click('button:has-text("×")'); // Should calculate 2+3=5 first

    await expect(display).toHaveText('5');

    await page.click('button:has-text("4")');
    await page.click('button:has-text("=")');

    await expect(display).toHaveText('20');
  });

  test('should close calculator window properly', async ({ page }) => {
    // Launch calculator
    await page.click('.start-button');
    await page.click('button:has-text("Calculator")');

    const calculatorWindow = page.locator('.window[data-component="calculator"]');
    await expect(calculatorWindow).toBeVisible();

    // Close the window
    await page.click('.window-control.close');

    // Window should be closed
    await expect(calculatorWindow).not.toBeVisible();
  });
});
