import React, { useState, useCallback } from 'react';
import { Taskbar } from '../Taskbar/Taskbar';
import { WindowManager } from '../WindowManager/WindowManager';
import { DesktopIcons } from '../DesktopIcons/DesktopIcons';
import { useDesktopStore } from '../../stores/useDesktopStore';
import { useContextMenu } from '../../hooks/useContextMenu';
import { InputDialog } from '../InputDialog';
import type { ContextMenuItem } from '../ContextMenu';
import './Desktop.css';

/**
 * Desktop component that serves as the main container for the Windows-like desktop environment.
 * Handles desktop interactions, wallpaper display, and coordinates between child components.
 * Manages drag and drop operations for desktop icons and window interactions.
 * Provides context menu functionality for CRUD operations.
 */
export const Desktop: React.FC = () => {
  const { 
    wallpaper, 
    theme, 
    updateIconPosition, 
    setDragging,
    createFile,
    createFolder,
    hasClipboardItems,
    pasteFromClipboard,
  } = useDesktopStore();
  
  const { showContextMenu } = useContextMenu();
  
  // Dialog states
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);

  /**
   * Handle new folder creation
   */
  const handleNewFolder = useCallback((name: string) => {
    const success = createFolder('/Desktop', name);
    if (success) {
      setShowNewFolderDialog(false);
    }
  }, [createFolder]);

  /**
   * Handle new file creation
   */
  const handleNewFile = useCallback((name: string) => {
    const fileName = name.endsWith('.txt') ? name : `${name}.txt`;
    const success = createFile('/Desktop', fileName, '');
    if (success) {
      setShowNewFileDialog(false);
    }
  }, [createFile]);

  /**
   * Handle paste operation
   */
  const handlePaste = useCallback(() => {
    pasteFromClipboard('/Desktop');
  }, [pasteFromClipboard]);

  /**
   * Handle desktop right-click context menu
   */
  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    const menuItems: ContextMenuItem[] = [
      {
        id: 'new-folder',
        label: 'New Folder',
        icon: '📁',
        onClick: () => setShowNewFolderDialog(true),
      },
      {
        id: 'new-file',
        label: 'New Text File',
        icon: '📄',
        onClick: () => setShowNewFileDialog(true),
      },
      {
        id: 'separator-1',
        label: '',
        separator: true,
      },
      {
        id: 'paste',
        label: 'Paste',
        icon: '📋',
        shortcut: 'Ctrl+V',
        onClick: handlePaste,
        disabled: !hasClipboardItems(),
      },
      {
        id: 'separator-2',
        label: '',
        separator: true,
      },
      {
        id: 'refresh',
        label: 'Refresh',
        icon: '🔄',
        shortcut: 'F5',
        onClick: () => window.location.reload(),
      },
    ];

    showContextMenu({ x: e.clientX, y: e.clientY }, menuItems);
  }, [showContextMenu, handlePaste, hasClipboardItems]);

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      useDesktopStore.getState().clearSelection();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');

    if (itemId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left - 40, rect.width - 80));
      const y = Math.max(0, Math.min(e.clientY - rect.top - 40, rect.height - 80));

      updateIconPosition(itemId, { x, y });
    }

    setDragging(false);
  };

  return (
    <div
      className={`desktop ${theme}`}
      style={{ backgroundImage: `url(${wallpaper})` }}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DesktopIcons />
      <WindowManager />
      <Taskbar />
      
      {/* New Folder Dialog */}
      <InputDialog
        isVisible={showNewFolderDialog}
        title="New Folder"
        label="Folder name:"
        placeholder="Enter folder name"
        initialValue="New Folder"
        onConfirm={handleNewFolder}
        onCancel={() => setShowNewFolderDialog(false)}
        validate={(value) => {
          if (!value.trim()) return 'Folder name is required';
          if (value.includes('/') || value.includes('\\')) return 'Invalid characters in folder name';
          return null;
        }}
      />
      
      {/* New File Dialog */}
      <InputDialog
        isVisible={showNewFileDialog}
        title="New Text File"
        label="File name:"
        placeholder="Enter file name"
        initialValue="New Document.txt"
        onConfirm={handleNewFile}
        onCancel={() => setShowNewFileDialog(false)}
        validate={(value) => {
          if (!value.trim()) return 'File name is required';
          if (value.includes('/') || value.includes('\\')) return 'Invalid characters in file name';
          return null;
        }}
      />
    </div>
  );
};
