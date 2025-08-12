import React, { useState, useCallback, useEffect } from 'react';

/**
 * Interface representing the calculator's internal state
 */
interface CalculatorState {
  /** Current display value */
  display: string;
  /** Previous operand for calculations */
  previousValue: number | null;
  /** Current operation selected */
  operation: string | null;
  /** Whether the next input should replace the display */
  waitingForOperand: boolean;
  /** Whether the display shows the result of a calculation */
  isResult: boolean;
}

/**
 * Calculator application component that provides a fully functional calculator
 * with basic arithmetic operations and percentage calculations.
 *
 * Features:
 * - Basic arithmetic: +, -, ×, ÷
 * - Percentage calculations
 * - Decimal point support
 * - Keyboard support
 * - Clear and All Clear functions
 * - Error handling for edge cases
 */
export const CalculatorApp: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
    isResult: false,
  });

  /**
   * Handles number input from buttons or keyboard
   */
  const inputNumber = useCallback((num: string) => {
    setState((prevState) => {
      const { display, waitingForOperand, isResult } = prevState;

      if (waitingForOperand || isResult) {
        return {
          ...prevState,
          display: num,
          waitingForOperand: false,
          isResult: false,
        };
      }

      return {
        ...prevState,
        display: display === '0' ? num : `${display}${num}`,
        isResult: false,
      };
    });
  }, []);

  /**
   * Handles decimal point input
   */
  const inputDecimal = useCallback(() => {
    setState((prevState) => {
      const { display, waitingForOperand, isResult } = prevState;

      if (waitingForOperand || isResult) {
        return {
          ...prevState,
          display: '0.',
          waitingForOperand: false,
          isResult: false,
        };
      }

      if (display.indexOf('.') === -1) {
        return {
          ...prevState,
          display: `${display}.`,
          isResult: false,
        };
      }

      return prevState;
    });
  }, []);

  /**
   * Clears the current input (CE function)
   */
  const clear = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      display: '0',
    }));
  }, []);

  /**
   * Clears all calculator state (AC function)
   */
  const clearAll = useCallback(() => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      isResult: false,
    });
  }, []);

  /**
   * Performs arithmetic calculations
   */
  const calculate = useCallback((firstOperand: number, secondOperand: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '×':
        return firstOperand * secondOperand;
      case '÷':
        if (secondOperand === 0) {
          throw new Error('Cannot divide by zero');
        }
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  }, []);

  /**
   * Handles operation input (+, -, ×, ÷)
   */
  const performOperation = useCallback(
    (nextOperation: string) => {
      setState((prevState) => {
        const { display, previousValue, operation, waitingForOperand } = prevState;
        const inputValue = parseFloat(display);

        if (previousValue === null) {
          return {
            ...prevState,
            previousValue: inputValue,
            operation: nextOperation,
            waitingForOperand: true,
          };
        }

        if (operation && waitingForOperand) {
          return {
            ...prevState,
            operation: nextOperation,
          };
        }

        try {
          const result = calculate(previousValue, inputValue, operation || '+');
          const formattedResult = Number(result.toPrecision(12)).toString();

          return {
            ...prevState,
            display: formattedResult,
            previousValue: result,
            operation: nextOperation,
            waitingForOperand: true,
            isResult: false,
          };
        } catch {
          return {
            ...prevState,
            display: 'Error',
            previousValue: null,
            operation: null,
            waitingForOperand: true,
            isResult: true,
          };
        }
      });
    },
    [calculate]
  );

  /**
   * Handles equals operation
   */
  const performEquals = useCallback(() => {
    setState((prevState) => {
      const { display, previousValue, operation } = prevState;
      const inputValue = parseFloat(display);

      if (previousValue !== null && operation) {
        try {
          const result = calculate(previousValue, inputValue, operation);
          const formattedResult = Number(result.toPrecision(12)).toString();

          return {
            ...prevState,
            display: formattedResult,
            previousValue: null,
            operation: null,
            waitingForOperand: true,
            isResult: true,
          };
        } catch {
          return {
            ...prevState,
            display: 'Error',
            previousValue: null,
            operation: null,
            waitingForOperand: true,
            isResult: true,
          };
        }
      }

      return prevState;
    });
  }, [calculate]);

  /**
   * Handles percentage calculation
   */
  const performPercentage = useCallback(() => {
    setState((prevState) => {
      const { display } = prevState;
      const value = parseFloat(display);
      const result = value / 100;
      const formattedResult = Number(result.toPrecision(12)).toString();

      return {
        ...prevState,
        display: formattedResult,
        isResult: true,
      };
    });
  }, []);

  /**
   * Handles keyboard input
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();

      if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        performEquals();
      } else if (e.key === '%') {
        performPercentage();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === 'Backspace') {
        clear();
      }
    },
    [inputNumber, inputDecimal, performOperation, performEquals, performPercentage, clearAll, clear]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const formatDisplay = (value: string): string => {
    if (value === 'Error') return value;

    const num = parseFloat(value);
    if (isNaN(num)) return '0';

    // Handle very large or very small numbers
    if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
      return num.toExponential(5);
    }

    return value;
  };

  return (
    <div className="calculator-app">
      <div className="calculator">
        <div className="calculator-display">
          <div className="display-value" title={state.display}>
            {formatDisplay(state.display)}
          </div>
        </div>

        <div className="calculator-buttons">
          {/* First row */}
          <button className="btn btn-function" onClick={clearAll} title="Clear All (Escape)">
            AC
          </button>
          <button className="btn btn-function" onClick={clear} title="Clear Entry (Backspace)">
            C
          </button>
          <button className="btn btn-function" onClick={performPercentage} title="Percentage (%)">
            %
          </button>
          <button className="btn btn-operation" onClick={() => performOperation('÷')} title="Divide (/)">
            ÷
          </button>

          {/* Second row */}
          <button className="btn btn-number" onClick={() => inputNumber('7')} title="7">
            7
          </button>
          <button className="btn btn-number" onClick={() => inputNumber('8')} title="8">
            8
          </button>
          <button className="btn btn-number" onClick={() => inputNumber('9')} title="9">
            9
          </button>
          <button className="btn btn-operation" onClick={() => performOperation('×')} title="Multiply (*)">
            ×
          </button>

          {/* Third row */}
          <button className="btn btn-number" onClick={() => inputNumber('4')} title="4">
            4
          </button>
          <button className="btn btn-number" onClick={() => inputNumber('5')} title="5">
            5
          </button>
          <button className="btn btn-number" onClick={() => inputNumber('6')} title="6">
            6
          </button>
          <button className="btn btn-operation" onClick={() => performOperation('-')} title="Subtract (-)">
            -
          </button>

          {/* Fourth row */}
          <button className="btn btn-number" onClick={() => inputNumber('1')} title="1">
            1
          </button>
          <button className="btn btn-number" onClick={() => inputNumber('2')} title="2">
            2
          </button>
          <button className="btn btn-number" onClick={() => inputNumber('3')} title="3">
            3
          </button>
          <button className="btn btn-operation" onClick={() => performOperation('+')} title="Add (+)">
            +
          </button>

          {/* Fifth row */}
          <button className="btn btn-number btn-zero" onClick={() => inputNumber('0')} title="0">
            0
          </button>
          <button className="btn btn-number" onClick={inputDecimal} title="Decimal point (.)">
            .
          </button>
          <button className="btn btn-equals" onClick={performEquals} title="Equals (Enter)">
            =
          </button>
        </div>
      </div>

      <style>{`
        .calculator-app {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          padding: 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .calculator {
          background: #2d3748;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05);
          max-width: 320px;
          width: 100%;
        }

        .calculator-display {
          background: #1a202c;
          border-radius: 12px;
          padding: 24px 20px;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .display-value {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          font-size: 2.5rem;
          font-weight: 300;
          color: white;
          text-align: right;
          min-height: 1.2em;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.2;
        }

        .calculator-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .btn {
          height: 64px;
          border: none;
          border-radius: 12px;
          font-size: 1.25rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          position: relative;
          overflow: hidden;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .btn:active {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.5s;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-number {
          background: #4a5568;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-number:hover {
          background: #5a6578;
        }

        .btn-operation {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 700;
        }

        .btn-operation:hover {
          background: linear-gradient(135deg, #7c93f0 0%, #8659b8 100%);
        }

        .btn-function {
          background: linear-gradient(135deg, #fd746c 0%, #ff9068 100%);
          color: white;
          font-weight: 700;
        }

        .btn-function:hover {
          background: linear-gradient(135deg, #fd8680 0%, #ff9e7c 100%);
        }

        .btn-equals {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          font-weight: 700;
          grid-column: span 2;
        }

        .btn-equals:hover {
          background: linear-gradient(135deg, #1ba89c 0%, #4af48b 100%);
        }

        .btn-zero {
          grid-column: span 2;
        }

        @media (max-width: 480px) {
          .calculator {
            margin: 10px;
            padding: 16px;
          }

          .calculator-display {
            padding: 20px 16px;
          }

          .display-value {
            font-size: 2rem;
          }

          .btn {
            height: 56px;
            font-size: 1.1rem;
          }

          .calculator-buttons {
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};
