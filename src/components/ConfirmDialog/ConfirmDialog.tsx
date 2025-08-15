import React, { useEffect, useRef, useCallback } from 'react';
import './ConfirmDialog.css';

/**
 * Props for ConfirmDialog component
 */
interface ConfirmDialogProps {
  /** Whether the dialog is visible */
  isVisible: boolean;
  /** Dialog title */
  title: string;
  /** Main message to display */
  message: string;
  /** Optional additional details */
  details?: string;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Whether the action is destructive (uses warning styling) */
  destructive?: boolean;
  /** Icon to display in the dialog */
  icon?: string;
  /** Callback when user confirms the action */
  onConfirm: () => void;
  /** Callback when user cancels the action */
  onCancel: () => void;
  /** Items being affected (for displaying count) */
  items?: string[];
}

/**
 * Windows 11-style confirmation dialog component
 *
 * Features:
 * - Fluent Design styling with backdrop blur
 * - Support for destructive actions with warning colors
 * - Keyboard shortcuts (Enter to confirm, Escape to cancel)
 * - Focus management and accessibility
 * - Item count display for batch operations
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isVisible,
  title,
  message,
  details,
  confirmText = 'OK',
  cancelText = 'Cancel',
  destructive = false,
  icon,
  onConfirm,
  onCancel,
  items = [],
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Focus confirm button when dialog becomes visible
   */
  useEffect(() => {
    if (isVisible && confirmButtonRef.current) {
      // Small delay to ensure dialog is rendered
      setTimeout(() => {
        confirmButtonRef.current?.focus();
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
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onConfirm, onCancel]);

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
   * Handle confirmation
   */
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  if (!isVisible) return null;

  // Determine default icon based on destructive prop
  const displayIcon = icon !== undefined ? icon : (destructive ? '⚠️' : 'ℹ️');

  return (
    <div className="confirm-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div ref={dialogRef} className={`confirm-dialog ${destructive ? 'destructive' : ''}`}>
        <div className="confirm-dialog-header">
          {displayIcon && (
            <div className="confirm-dialog-icon" aria-hidden="true">
              {displayIcon}
            </div>
          )}
          <h2 id="dialog-title" className="confirm-dialog-title">
            {title}
          </h2>
        </div>

        <div className="confirm-dialog-content">
          <p className="confirm-dialog-message">{message}</p>

          {details && <p className="confirm-dialog-details">{details}</p>}

          {items.length > 0 && (
            <div className="confirm-dialog-items">
              <p className="confirm-dialog-items-header">
                {items.length === 1 ? 'Item to be affected:' : `${items.length} items to be affected:`}
              </p>
              <ul className="confirm-dialog-items-list">
                {items.slice(0, 5).map((item, index) => (
                  <li key={index} className="confirm-dialog-items-item">
                    {item}
                  </li>
                ))}
                {items.length > 5 && (
                  <li className="confirm-dialog-items-more">...and {items.length - 5} more items</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="confirm-dialog-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="confirm-dialog-button confirm-dialog-button-secondary"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            className={`confirm-dialog-button ${destructive ? 'confirm-dialog-button-destructive' : 'confirm-dialog-button-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.displayName = 'ConfirmDialog';
