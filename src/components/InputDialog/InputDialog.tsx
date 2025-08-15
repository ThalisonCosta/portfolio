import React, { useState, useEffect, useRef, useCallback } from 'react';
import './InputDialog.css';

/**
 * Props for InputDialog component
 */
interface InputDialogProps {
  /** Whether the dialog is visible */
  isVisible: boolean;
  /** Dialog title */
  title: string;
  /** Input label */
  label: string;
  /** Initial value for the input */
  initialValue?: string;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Callback when user confirms the input */
  onConfirm: (value: string) => void;
  /** Callback when user cancels the dialog */
  onCancel: () => void;
  /** Whether the input is required */
  required?: boolean;
  /** Maximum length for the input */
  maxLength?: number;
  /** Validation function that returns error message or null */
  validate?: (value: string) => string | null;
}

/**
 * Windows 11-style input dialog component
 * 
 * Features:
 * - Fluent Design styling with backdrop blur
 * - Form validation with error messages
 * - Keyboard shortcuts (Enter to confirm, Escape to cancel)
 * - Focus management and accessibility
 * - Character limit display
 */
export const InputDialog: React.FC<InputDialogProps> = ({
  isVisible,
  title,
  label,
  initialValue = '',
  placeholder,
  onConfirm,
  onCancel,
  required = true,
  maxLength = 255,
  validate,
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  /**
   * Reset state when dialog becomes visible
   */
  useEffect(() => {
    if (isVisible) {
      setValue(initialValue);
      setError(null);
    }
  }, [isVisible, initialValue]);

  /**
   * Validate input value
   */
  const validateInput = useCallback((inputValue: string): string | null => {
    if (required && !inputValue.trim()) {
      return 'This field is required';
    }

    if (inputValue.length > maxLength) {
      return `Maximum length is ${maxLength} characters`;
    }

    // Custom validation
    if (validate) {
      return validate(inputValue);
    }

    return null;
  }, [required, maxLength, validate]);

  /**
   * Handle confirmation
   */
  const handleConfirm = useCallback(() => {
    const validationError = validateInput(value);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    onConfirm(value.trim());
  }, [value, validateInput, onConfirm]);

  /**
   * Focus input when dialog becomes visible
   */
  useEffect(() => {
    if (isVisible && inputRef.current) {
      // Small delay to ensure dialog is rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isVisible]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, value, handleConfirm, onCancel]);

  /**
   * Handle click outside to cancel
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onCancel]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  if (!isVisible) return null;

  const charactersRemaining = maxLength - value.length;
  const isValid = !validateInput(value);

  return (
    <div className="input-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div ref={dialogRef} className="input-dialog">
        <div className="input-dialog-header">
          <h2 id="dialog-title" className="input-dialog-title">
            {title}
          </h2>
        </div>

        <div className="input-dialog-content">
          <div className="input-dialog-field">
            <label htmlFor="dialog-input" className="input-dialog-label">
              {label}
            </label>
            <input
              ref={inputRef}
              id="dialog-input"
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              maxLength={maxLength}
              className={`input-dialog-input ${error ? 'error' : ''}`}
              aria-describedby={error ? 'input-error' : 'input-hint'}
              aria-invalid={!!error}
            />
            
            {error && (
              <div id="input-error" className="input-dialog-error" role="alert">
                {error}
              </div>
            )}
            
            <div id="input-hint" className="input-dialog-hint">
              {charactersRemaining} characters remaining
            </div>
          </div>
        </div>

        <div className="input-dialog-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="input-dialog-button input-dialog-button-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid}
            className="input-dialog-button input-dialog-button-primary"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

InputDialog.displayName = 'InputDialog';