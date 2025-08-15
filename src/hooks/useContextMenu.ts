import { useContext } from 'react';
import { ContextMenuContext } from '../contexts/contextMenuTypes';

/**
 * Hook to access context menu functionality
 *
 * @throws {Error} If used outside of ContextMenuProvider
 * @returns Context menu controls and state
 */
export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);

  if (context === undefined) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }

  return context;
};
