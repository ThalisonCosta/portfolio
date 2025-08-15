import React, { useEffect, useRef, useCallback } from 'react';
import './ContextMenu.css';

/**
 * Represents a context menu item configuration
 */
export interface ContextMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label for the menu item */
  label: string;
  /** Icon to display (emoji or icon class) */
  icon?: string;
  /** Click handler for the menu item */
  onClick?: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether this is a separator */
  separator?: boolean;
  /** Keyboard shortcut to display */
  shortcut?: string;
}

/**
 * Props for ContextMenu component
 */
interface ContextMenuProps {
  /** Whether the context menu is visible */
  isVisible: boolean;
  /** Position of the context menu */
  position: { x: number; y: number };
  /** Array of menu items to display */
  items: ContextMenuItem[];
  /** Callback when the menu should be closed */
  onClose: () => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Windows 11-style context menu component
 *
 * Features:
 * - Fluent Design styling with rounded corners and shadows
 * - Keyboard navigation support
 * - Click-outside-to-close behavior
 * - Automatic positioning to stay within viewport
 * - Smooth animations
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({ isVisible, position, items, onClose, className = '' }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const focusedItemRef = useRef<number>(-1);

  /**
   * Adjust menu position to stay within viewport bounds
   */
  const getAdjustedPosition = useCallback((x: number, y: number) => {
    if (!menuRef.current) return { x, y };

    const menu = menuRef.current;
    const { innerWidth, innerHeight } = window;
    const { offsetWidth, offsetHeight } = menu;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + offsetWidth > innerWidth) {
      adjustedX = innerWidth - offsetWidth - 10;
    }
    if (adjustedX < 10) {
      adjustedX = 10;
    }

    // Adjust vertical position
    if (y + offsetHeight > innerHeight) {
      adjustedY = innerHeight - offsetHeight - 10;
    }
    if (adjustedY < 10) {
      adjustedY = 10;
    }

    return { x: adjustedX, y: adjustedY };
  }, []);

  /**
   * Handle click outside to close menu
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const validItems = items.filter((item) => !item.separator && !item.disabled);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          focusedItemRef.current = Math.min(focusedItemRef.current + 1, validItems.length - 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          focusedItemRef.current = Math.max(focusedItemRef.current - 1, 0);
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedItemRef.current >= 0 && focusedItemRef.current < validItems.length) {
            const item = validItems[focusedItemRef.current];
            if (item.onClick) {
              item.onClick();
              onClose();
            }
          }
          break;
        default:
          // Do nothing for other keys
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, items, onClose]);

  /**
   * Handle menu item click
   */
  const handleItemClick = useCallback(
    (item: ContextMenuItem) => {
      if (item.disabled || item.separator) return;

      if (item.onClick) {
        item.onClick();
      }
      onClose();
    },
    [onClose]
  );

  /**
   * Focus the menu when it becomes visible
   */
  useEffect(() => {
    if (isVisible && menuRef.current) {
      menuRef.current.focus();
      focusedItemRef.current = -1;
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const adjustedPosition = getAdjustedPosition(position.x, position.y);

  return (
    <div
      ref={menuRef}
      className={`context-menu ${className}`}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      role="menu"
      tabIndex={-1}
      aria-label="Context menu"
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={`separator-${index}`} className="context-menu-separator" role="separator" />;
        }

        const validItemIndex = items.slice(0, index).filter((i) => !i.separator && !i.disabled).length;
        const isFocused = focusedItemRef.current === validItemIndex;

        return (
          <div
            key={item.id}
            className={`context-menu-item ${item.disabled ? 'disabled' : ''} ${isFocused ? 'focused' : ''}`}
            onClick={() => handleItemClick(item)}
            role="menuitem"
            aria-disabled={item.disabled}
            tabIndex={-1}
          >
            {item.icon && (
              <span className="context-menu-icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="context-menu-label">{item.label}</span>
            {item.shortcut && (
              <span className="context-menu-shortcut" aria-hidden="true">
                {item.shortcut}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

ContextMenu.displayName = 'ContextMenu';
