import React, { useState, useCallback, type ReactNode } from 'react';
import { ContextMenu, type ContextMenuItem } from '../components/ContextMenu';
import { ContextMenuContext, type ContextMenuState, type ContextMenuContextType } from './contextMenuTypes';

/**
 * Props for ContextMenuProvider
 */
interface ContextMenuProviderProps {
  children: ReactNode;
}

/**
 * Context menu provider component for global context menu state management
 * 
 * This provider allows any component in the app to show context menus
 * without having to manage state locally. It renders a single context menu
 * component that can be controlled from anywhere in the component tree.
 */
export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({ children }) => {
  const [state, setState] = useState<ContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    items: [],
  });

  /**
   * Show context menu at specified position with provided items
   */
  const showContextMenu = useCallback((position: { x: number; y: number }, items: ContextMenuItem[]) => {
    setState({
      isVisible: true,
      position,
      items,
    });
  }, []);

  /**
   * Hide context menu
   */
  const hideContextMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  const contextValue: ContextMenuContextType = {
    state,
    showContextMenu,
    hideContextMenu,
    isVisible: state.isVisible,
  };

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
      <ContextMenu
        isVisible={state.isVisible}
        position={state.position}
        items={state.items}
        onClose={hideContextMenu}
      />
    </ContextMenuContext.Provider>
  );
};

