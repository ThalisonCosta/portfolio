import { createContext } from 'react';
import type { ContextMenuItem } from '../components/ContextMenu';

/**
 * Context menu state interface
 */
export interface ContextMenuState {
  isVisible: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
}

/**
 * Context menu context interface
 */
export interface ContextMenuContextType {
  /** Current context menu state */
  state: ContextMenuState;
  /** Show context menu at specified position with items */
  showContextMenu: (position: { x: number; y: number }, items: ContextMenuItem[]) => void;
  /** Hide context menu */
  hideContextMenu: () => void;
  /** Check if context menu is visible */
  isVisible: boolean;
}

// Create context with default values
export const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);