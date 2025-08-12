/** @jsxImportSource react */
import { render, fireEvent, screen } from '@testing-library/react';
import { CalculatorApp } from '../CalculatorApp';

describe('CalculatorApp', () => {
  const getDisplayValue = () => {
    const display = document.querySelector('.display-value');
    return display?.textContent || '';
  };

  beforeEach(() => {
    render(<CalculatorApp />);
  });

  describe('Basic UI Rendering', () => {
    test('renders calculator display', () => {
      const display = document.querySelector('.display-value');
      expect(display).toBeInTheDocument();
      expect(display).toHaveTextContent('0');
    });

    test('renders all number buttons', () => {
      const numberButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
      numberButtons.forEach((num) => {
        const button = screen.getByRole('button', { name: num });
        expect(button).toBeInTheDocument();
      });
      // Zero button has different selector because it has "btn-zero" class
      const zeroButton = screen.getByRole('button', { name: '0' });
      expect(zeroButton).toBeInTheDocument();
    });

    test('renders all operation buttons', () => {
      expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '-' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '÷' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '=' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '%' })).toBeInTheDocument();
    });

    test('renders function buttons', () => {
      expect(screen.getByRole('button', { name: 'AC' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'C' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '.' })).toBeInTheDocument();
    });
  });

  describe('Number Input', () => {
    test('displays single digit when clicked', () => {
      const button5 = screen.getByRole('button', { name: '5' });
      fireEvent.click(button5);

      expect(getDisplayValue()).toBe('5');
    });

    test('displays multiple digits when clicked in sequence', () => {
      const button1 = screen.getByRole('button', { name: '1' });
      const button2 = screen.getByRole('button', { name: '2' });
      const button3 = screen.getByRole('button', { name: '3' });

      fireEvent.click(button1);
      fireEvent.click(button2);
      fireEvent.click(button3);

      expect(getDisplayValue()).toBe('123');
    });

    test('replaces initial zero with first digit', () => {
      const button7 = screen.getByRole('button', { name: '7' });
      fireEvent.click(button7);

      expect(getDisplayValue()).toBe('7');
    });
  });

  describe('Decimal Point Input', () => {
    test('adds decimal point to integer', () => {
      const button5 = screen.getByRole('button', { name: '5' });
      const decimalButton = screen.getByRole('button', { name: '.' });

      fireEvent.click(button5);
      fireEvent.click(decimalButton);

      expect(getDisplayValue()).toBe('5.');
    });

    test('prevents multiple decimal points', () => {
      const button5 = screen.getByRole('button', { name: '5' });
      const decimalButton = screen.getByRole('button', { name: '.' });
      const button3 = screen.getByRole('button', { name: '3' });

      fireEvent.click(button5);
      fireEvent.click(decimalButton);
      fireEvent.click(button3);
      fireEvent.click(decimalButton); // Should be ignored

      expect(getDisplayValue()).toBe('5.3');
    });

    test('adds decimal point to zero', () => {
      const decimalButton = screen.getByRole('button', { name: '.' });
      fireEvent.click(decimalButton);

      expect(getDisplayValue()).toBe('0.');
    });
  });

  describe('Basic Arithmetic Operations', () => {
    test('performs addition correctly', () => {
      const button2 = screen.getByRole('button', { name: '2' });
      const button3 = screen.getByRole('button', { name: '3' });
      const addButton = screen.getByRole('button', { name: '+' });
      const equalsButton = screen.getByRole('button', { name: '=' });

      fireEvent.click(button2);
      fireEvent.click(addButton);
      fireEvent.click(button3);
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('5');
    });

    test('performs subtraction correctly', () => {
      const button8 = screen.getByRole('button', { name: '8' });
      const button3 = screen.getByRole('button', { name: '3' });
      const subtractButton = screen.getByRole('button', { name: '-' });
      const equalsButton = screen.getByRole('button', { name: '=' });

      fireEvent.click(button8);
      fireEvent.click(subtractButton);
      fireEvent.click(button3);
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('5');
    });

    test('performs multiplication correctly', () => {
      const button4 = screen.getByRole('button', { name: '4' });
      const button6 = screen.getByRole('button', { name: '6' });
      const multiplyButton = screen.getByRole('button', { name: '×' });
      const equalsButton = screen.getByRole('button', { name: '=' });

      fireEvent.click(button4);
      fireEvent.click(multiplyButton);
      fireEvent.click(button6);
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('24');
    });

    test('performs division correctly', () => {
      const button8 = screen.getByRole('button', { name: '8' });
      const button2 = screen.getByRole('button', { name: '2' });
      const divideButton = screen.getByRole('button', { name: '÷' });
      const equalsButton = screen.getByRole('button', { name: '=' });

      fireEvent.click(button8);
      fireEvent.click(divideButton);
      fireEvent.click(button2);
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('4');
    });
  });

  describe('Decimal Arithmetic', () => {
    test('handles decimal addition', () => {
      const button2 = screen.getByRole('button', { name: '2' });
      const button5 = screen.getByRole('button', { name: '5' });
      const button1 = screen.getByRole('button', { name: '1' });
      const decimalButton = screen.getByRole('button', { name: '.' });
      const addButton = screen.getByRole('button', { name: '+' });
      const equalsButton = screen.getByRole('button', { name: '=' });

      fireEvent.click(button2);
      fireEvent.click(decimalButton);
      fireEvent.click(button5);
      fireEvent.click(addButton);
      fireEvent.click(button1);
      fireEvent.click(decimalButton);
      fireEvent.click(button5);
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('4');
    });

    test('handles decimal division with proper precision', () => {
      const button1 = screen.getByRole('button', { name: '1' });
      const button3 = screen.getByRole('button', { name: '3' });
      const divideButton = screen.getByRole('button', { name: '÷' });
      const equalsButton = screen.getByRole('button', { name: '=' });

      fireEvent.click(button1);
      fireEvent.click(divideButton);
      fireEvent.click(button3);
      fireEvent.click(equalsButton);

      const displayValue = getDisplayValue();
      expect(displayValue).toMatch(/0\.333333/);
    });
  });

  describe('Percentage Calculations', () => {
    test('converts number to percentage', () => {
      const button5 = screen.getByRole('button', { name: '5' });
      const button0 = screen.getByRole('button', { name: '0' });
      const percentButton = screen.getByRole('button', { name: '%' });

      fireEvent.click(button5);
      fireEvent.click(button0);
      fireEvent.click(percentButton);

      expect(getDisplayValue()).toBe('0.5');
    });

    test('handles percentage of decimal numbers', () => {
      const button2 = screen.getByRole('button', { name: '2' });
      const button5 = screen.getByRole('button', { name: '5' });
      const decimalButton = screen.getByRole('button', { name: '.' });
      const percentButton = screen.getByRole('button', { name: '%' });

      fireEvent.click(button2);
      fireEvent.click(button5);
      fireEvent.click(decimalButton);
      fireEvent.click(button5);
      fireEvent.click(percentButton);

      expect(getDisplayValue()).toBe('0.255');
    });
  });

  describe('Clear Functions', () => {
    test('C button clears current entry', () => {
      const button1 = screen.getByRole('button', { name: '1' });
      const button2 = screen.getByRole('button', { name: '2' });
      const button3 = screen.getByRole('button', { name: '3' });
      const clearButton = screen.getByRole('button', { name: 'C' });

      fireEvent.click(button1);
      fireEvent.click(button2);
      fireEvent.click(button3);
      fireEvent.click(clearButton);

      expect(getDisplayValue()).toBe('0');
    });

    test('AC button clears all calculator state', () => {
      const button5 = screen.getByRole('button', { name: '5' });
      const addButton = screen.getByRole('button', { name: '+' });
      const button3 = screen.getByRole('button', { name: '3' });
      const allClearButton = screen.getByRole('button', { name: 'AC' });

      fireEvent.click(button5);
      fireEvent.click(addButton);
      fireEvent.click(button3);
      fireEvent.click(allClearButton);

      expect(getDisplayValue()).toBe('0');

      // Test that operation was cleared by adding another number
      const button2 = screen.getByRole('button', { name: '2' });
      const equalsButton = screen.getByRole('button', { name: '=' });
      fireEvent.click(button2);
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('2');
    });
  });

  describe('Chain Operations', () => {
    test('performs chained operations without equals', () => {
      const button2 = screen.getByRole('button', { name: '2' });
      const button3 = screen.getByRole('button', { name: '3' });
      const button4 = screen.getByRole('button', { name: '4' });
      const addButton = screen.getByRole('button', { name: '+' });
      const multiplyButton = screen.getByRole('button', { name: '×' });

      fireEvent.click(button2);
      fireEvent.click(addButton);
      fireEvent.click(button3);
      fireEvent.click(multiplyButton); // Should calculate 2+3=5 and continue with multiply

      expect(getDisplayValue()).toBe('5');

      fireEvent.click(button4);
      const equalsButton = screen.getByRole('button', { name: '=' });
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('20');
    });
  });

  describe('Error Handling', () => {
    test('handles division by zero', () => {
      const button5 = screen.getByRole('button', { name: '5' });
      const button0 = screen.getByRole('button', { name: '0' });
      const divideButton = screen.getByRole('button', { name: '÷' });
      const equalsButton = screen.getByRole('button', { name: '=' });

      fireEvent.click(button5);
      fireEvent.click(divideButton);
      fireEvent.click(button0);
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('Error');
    });

    test('recovers from error state', () => {
      const button5 = screen.getByRole('button', { name: '5' });
      const button0 = screen.getByRole('button', { name: '0' });
      const button2 = screen.getByRole('button', { name: '2' });
      const divideButton = screen.getByRole('button', { name: '÷' });
      const equalsButton = screen.getByRole('button', { name: '=' });
      const allClearButton = screen.getByRole('button', { name: 'AC' });

      // Create error
      fireEvent.click(button5);
      fireEvent.click(divideButton);
      fireEvent.click(button0);
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('Error');

      // Clear and continue
      fireEvent.click(allClearButton);
      fireEvent.click(button2);

      expect(getDisplayValue()).toBe('2');
    });
  });

  describe('Keyboard Support', () => {
    test('handles number key input', () => {
      fireEvent.keyDown(document, { key: '7' });
      expect(getDisplayValue()).toBe('7');
    });

    test('handles operation key input', () => {
      fireEvent.keyDown(document, { key: '5' });
      fireEvent.keyDown(document, { key: '+' });
      fireEvent.keyDown(document, { key: '3' });
      fireEvent.keyDown(document, { key: 'Enter' });

      expect(getDisplayValue()).toBe('8');
    });

    test('handles multiply key with asterisk', () => {
      fireEvent.keyDown(document, { key: '4' });
      fireEvent.keyDown(document, { key: '*' });
      fireEvent.keyDown(document, { key: '3' });
      fireEvent.keyDown(document, { key: '=' });

      expect(getDisplayValue()).toBe('12');
    });

    test('handles divide key with slash', () => {
      fireEvent.keyDown(document, { key: '8' });
      fireEvent.keyDown(document, { key: '/' });
      fireEvent.keyDown(document, { key: '2' });
      fireEvent.keyDown(document, { key: 'Enter' });

      expect(getDisplayValue()).toBe('4');
    });

    test('handles escape key for all clear', () => {
      fireEvent.keyDown(document, { key: '5' });
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(getDisplayValue()).toBe('0');
    });

    test('handles backspace for clear entry', () => {
      fireEvent.keyDown(document, { key: '1' });
      fireEvent.keyDown(document, { key: '2' });
      fireEvent.keyDown(document, { key: '3' });
      fireEvent.keyDown(document, { key: 'Backspace' });

      expect(getDisplayValue()).toBe('0');
    });

    test('handles percentage key', () => {
      fireEvent.keyDown(document, { key: '2' });
      fireEvent.keyDown(document, { key: '0' });
      fireEvent.keyDown(document, { key: '%' });

      expect(getDisplayValue()).toBe('0.2');
    });
  });

  describe('Edge Cases', () => {
    test('handles result replacement on new number input', () => {
      const button5 = screen.getByRole('button', { name: '5' });
      const button2 = screen.getByRole('button', { name: '2' });
      const button7 = screen.getByRole('button', { name: '7' });
      const addButton = screen.getByRole('button', { name: '+' });
      const equalsButton = screen.getByRole('button', { name: '=' });

      fireEvent.click(button5);
      fireEvent.click(addButton);
      fireEvent.click(button2);
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('7');

      // New number should replace result
      fireEvent.click(button7);
      expect(getDisplayValue()).toBe('7');
    });

    test('handles operation change before second operand', () => {
      const button5 = screen.getByRole('button', { name: '5' });
      const addButton = screen.getByRole('button', { name: '+' });
      const multiplyButton = screen.getByRole('button', { name: '×' });
      const button3 = screen.getByRole('button', { name: '3' });
      const equalsButton = screen.getByRole('button', { name: '=' });

      fireEvent.click(button5);
      fireEvent.click(addButton);
      fireEvent.click(multiplyButton); // Should change operation from + to ×
      fireEvent.click(button3);
      fireEvent.click(equalsButton);

      expect(getDisplayValue()).toBe('15'); // 5 × 3 = 15
    });

    test('handles very large numbers with scientific notation', () => {
      const button9 = screen.getByRole('button', { name: '9' });
      const multiplyButton = screen.getByRole('button', { name: '×' });
      const equalsButton = screen.getByRole('button', { name: '=' });

      // Create a very large number by repeated multiplication
      fireEvent.click(button9);
      for (let i = 0; i < 15; i++) {
        fireEvent.click(multiplyButton);
        fireEvent.click(button9);
        fireEvent.click(equalsButton);
      }

      // Should display in scientific notation for very large numbers
      const displayValue = getDisplayValue();
      expect(displayValue.includes('e+') || displayValue === 'Infinity' || displayValue.length > 15).toBeTruthy();
    });
  });
});
