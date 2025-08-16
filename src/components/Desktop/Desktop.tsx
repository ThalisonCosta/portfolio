import React, { useState, useCallback, useEffect } from 'react';
import { Taskbar } from '../Taskbar/Taskbar';
import { WindowManager } from '../WindowManager/WindowManager';
import { DesktopIcons } from '../DesktopIcons/DesktopIcons';
import { SnakeGame } from '../SnakeGame/SnakeGame';
import { useDesktopStore, type FileSystemItem } from '../../stores/useDesktopStore';
import { useContextMenu } from '../../hooks/useContextMenu';
import { InputDialog } from '../InputDialog';
import { ConfirmDialog } from '../ConfirmDialog';
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
    theme,
    isScreensaverActive,
    updateIconPosition,
    setDragging,
    createFile,
    createFolder,
    hasClipboardItems,
    pasteFromClipboard,
    getBackgroundStyle,
    removeFileSystemItem,
    renameFileSystemItem,
    fileSystem,
  } = useDesktopStore();

  const { showContextMenu } = useContextMenu();

  // Dialog states
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);

  // Modal states for file operations
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);

  // Developer mode state
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  /**
   * Handle F12 key press to toggle developer mode for easier element inspection
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F12') {
        event.preventDefault();
        setIsDeveloperMode((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /**
   * Handle rename operation
   */
  const handleRename = useCallback((item: FileSystemItem) => {
    setSelectedItem(item);
    setShowRenameDialog(true);
  }, []);

  /**
   * Handle delete operation
   */
  const handleDelete = useCallback((item: FileSystemItem) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  }, []);

  /**
   * Handle rename confirmation
   */
  const handleRenameConfirm = useCallback(
    (newName: string) => {
      if (selectedItem) {
        const success = renameFileSystemItem(selectedItem.path, newName);
        if (success) {
          setShowRenameDialog(false);
          setSelectedItem(null);
        } else {
          console.warn(`Failed to rename ${selectedItem.name} to ${newName}. Name may already exist.`);
        }
      }
    },
    [selectedItem, renameFileSystemItem]
  );

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = useCallback(() => {
    if (selectedItem) {
      const success = removeFileSystemItem(selectedItem.path);
      if (success) {
        setShowDeleteDialog(false);
        setSelectedItem(null);
      } else {
        console.error(`Failed to delete ${selectedItem.name}. Item may not exist.`);
        setShowDeleteDialog(false);
        setSelectedItem(null);
      }
    }
  }, [selectedItem, removeFileSystemItem]);

  /**
   * Handle new folder creation
   */
  const handleNewFolder = useCallback(
    (name: string) => {
      const success = createFolder('/Desktop', name);
      if (success) {
        setShowNewFolderDialog(false);
      }
    },
    [createFolder]
  );

  /**
   * Handle new file creation
   */
  const handleNewFile = useCallback(
    (name: string) => {
      const fileName = name.endsWith('.txt') ? name : `${name}.txt`;
      const success = createFile('/Desktop', fileName, '');
      if (success) {
        setShowNewFileDialog(false);
      }
    },
    [createFile]
  );

  /**
   * Handle paste operation
   */
  const handlePaste = useCallback(() => {
    pasteFromClipboard('/Desktop');
  }, [pasteFromClipboard]);

  /**
   * Handle desktop right-click context menu
   */
  const handleDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [showContextMenu, handlePaste, hasClipboardItems]
  );

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
      className={`desktop ${theme} ${isDeveloperMode ? 'developer-mode' : ''}`}
      style={{ background: getBackgroundStyle() }}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DesktopIcons onRename={handleRename} onDelete={handleDelete} />
      <WindowManager />
      <Taskbar />

      {/* Snake Game Screensaver */}
      {isScreensaverActive && <SnakeGame />}

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

      {/* File Operation Modals */}
      {/* Rename Dialog */}
      <InputDialog
        isVisible={showRenameDialog}
        title={`Rename ${selectedItem?.type === 'folder' ? 'Folder' : 'File'}`}
        label="New name:"
        placeholder="Enter new name"
        initialValue={selectedItem?.name || ''}
        onConfirm={handleRenameConfirm}
        onCancel={() => {
          setShowRenameDialog(false);
          setSelectedItem(null);
        }}
        validate={(value) => {
          if (!value.trim()) return 'Name is required';
          if (value.includes('/') || value.includes('\\')) return 'Invalid characters in name';

          // Check for duplicate names in the same directory
          if (selectedItem) {
            const desktop = fileSystem.find((item) => item.path === '/Desktop');
            const siblings = desktop?.children || [];
            const nameExists = siblings.some((sibling) => sibling.name === value && sibling.id !== selectedItem.id);
            if (nameExists) {
              return 'A file or folder with this name already exists';
            }
          }

          return null;
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isVisible={showDeleteDialog}
        title={`Delete ${selectedItem?.type === 'folder' ? 'Folder' : 'File'}`}
        message={`Are you sure you want to delete "${selectedItem?.name}"?`}
        details={
          selectedItem?.type === 'folder'
            ? 'This will permanently delete the folder and all its contents.'
            : 'This will permanently delete the file.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        destructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedItem(null);
        }}
        items={selectedItem ? [selectedItem.name] : []}
      />
    </div>
  );
};
