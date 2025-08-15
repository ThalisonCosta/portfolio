import React, { useState, useCallback } from 'react';
import { useDesktopStore, type FileSystemItem } from '../../stores/useDesktopStore';
import { useContextMenu } from '../../hooks/useContextMenu';
import { InputDialog } from '../InputDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import type { ContextMenuItem } from '../ContextMenu';
import './DesktopIcons.css';

/**
 * DesktopIcons component that renders draggable icons on the desktop.
 * Handles icon interactions like double-click to open applications,
 * drag and drop positioning, and visual feedback for drag operations.
 * Provides right-click context menu for CRUD operations.
 */
export const DesktopIcons: React.FC = React.memo(() => {
  const { 
    fileSystem, 
    openWindow, 
    setDragging, 
    isDragging, 
    draggedItem,
    copyToClipboard,
    cutToClipboard,
    removeFileSystemItem,
    renameFileSystemItem,
  } = useDesktopStore();
  
  const { showContextMenu } = useContextMenu();
  
  // Dialog states
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);

  /**
   * Handle icon double click
   */
  const handleIconDoubleClick = useCallback((item: FileSystemItem) => {
    if (item.type === 'file') {
      let component = 'TextEditor';

      switch (item.name.split('.').pop()) {
        case 'txt':
          component = 'TextEditor';
          break;
        case 'pdf':
          component = 'PDFViewer';
          break;
        case 'md':
          component = 'MarkdownViewer';
          break;
        case 'lnk':
          component = 'ContactForm';
          break;
        default:
          component = 'TextEditor';
      }

      openWindow({
        title: item.name,
        component,
        isMinimized: false,
        isMaximized: false,
        position: { x: 200, y: 100 },
        size: { width: 600, height: 400 },
      });
    } else if (item.type === 'folder') {
      openWindow({
        title: `File Explorer - ${item.name}`,
        component: 'FileExplorer',
        isMinimized: false,
        isMaximized: false,
        position: { x: 150, y: 80 },
        size: { width: 800, height: 600 },
      });
    }
  }, [openWindow]);

  /**
   * Handle copy operation
   */
  const handleCopy = useCallback((item: FileSystemItem) => {
    copyToClipboard([item.path]);
  }, [copyToClipboard]);

  /**
   * Handle cut operation
   */
  const handleCut = useCallback((item: FileSystemItem) => {
    cutToClipboard([item.path]);
  }, [cutToClipboard]);

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
  const handleRenameConfirm = useCallback((newName: string) => {
    if (selectedItem) {
      const success = renameFileSystemItem(selectedItem.path, newName);
      if (success) {
        setShowRenameDialog(false);
        setSelectedItem(null);
      }
    }
  }, [selectedItem, renameFileSystemItem]);

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = useCallback(() => {
    if (selectedItem) {
      const success = removeFileSystemItem(selectedItem.path);
      if (success) {
        setShowDeleteDialog(false);
        setSelectedItem(null);
      }
    }
  }, [selectedItem, removeFileSystemItem]);

  /**
   * Handle icon context menu
   */
  const handleIconContextMenu = useCallback((e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent desktop context menu
    
    const menuItems: ContextMenuItem[] = [
      {
        id: 'open',
        label: 'Open',
        icon: '📖',
        onClick: () => handleIconDoubleClick(item),
      },
      {
        id: 'separator-1',
        label: '',
        separator: true,
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: '✏️',
        shortcut: 'F2',
        onClick: () => handleRename(item),
      },
      {
        id: 'separator-2',
        label: '',
        separator: true,
      },
      {
        id: 'copy',
        label: 'Copy',
        icon: '📋',
        shortcut: 'Ctrl+C',
        onClick: () => handleCopy(item),
      },
      {
        id: 'cut',
        label: 'Cut',
        icon: '✂️',
        shortcut: 'Ctrl+X',
        onClick: () => handleCut(item),
      },
      {
        id: 'separator-3',
        label: '',
        separator: true,
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: '🗑️',
        shortcut: 'Delete',
        onClick: () => handleDelete(item),
      },
    ];

    showContextMenu({ x: e.clientX, y: e.clientY }, menuItems);
  }, [showContextMenu, handleIconDoubleClick, handleRename, handleCopy, handleCut, handleDelete]);

  const getDesktopItems = () => {
    const desktop = fileSystem.find((item) => item.path === '/Desktop');
    return desktop?.children || [];
  };

  const getIconForFile = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'txt':
        return '📄';
      case 'pdf':
        return '📋';
      case 'md':
        return '📝';
      case 'lnk':
        return '🔗';
      default:
        return '📄';
    }
  };

  const handleDragStart = (e: React.DragEvent, item: FileSystemItem) => {
    setDragging(true, item.id);

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: FileSystemItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleIconDoubleClick(item);
    }
  };

  return (
    <div className="desktop-icons" role="grid" aria-label="Desktop icons">
      {getDesktopItems().map((item, _index) => (
        <div
          key={item.id}
          className={`desktop-icon ${isDragging && draggedItem === item.id ? 'dragging' : ''}`}
          style={{
            left: item.position?.x || 50,
            top: item.position?.y || 50,
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragEnd={handleDragEnd}
          onDoubleClick={() => handleIconDoubleClick(item)}
          onContextMenu={(e) => handleIconContextMenu(e, item)}
          onKeyDown={(e) => handleKeyDown(e, item)}
          role="gridcell"
          tabIndex={0}
          aria-label={`${item.name}, ${item.type === 'folder' ? 'folder' : 'file'}`}
          aria-describedby={`icon-description-${item.id}`}
        >
          <div className="icon" aria-hidden="true">
            {item.type === 'folder' ? '📁' : getIconForFile(item.name)}
          </div>
          <div className="icon-label" id={`icon-description-${item.id}`}>
            {item.name}
          </div>
        </div>
      ))}
      
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
          return null;
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isVisible={showDeleteDialog}
        title={`Delete ${selectedItem?.type === 'folder' ? 'Folder' : 'File'}`}
        message={`Are you sure you want to delete "${selectedItem?.name}"?`}
        details={selectedItem?.type === 'folder' ? 'This will permanently delete the folder and all its contents.' : 'This will permanently delete the file.'}
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
});

DesktopIcons.displayName = 'DesktopIcons';
