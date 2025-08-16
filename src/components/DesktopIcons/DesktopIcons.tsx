import React, { useCallback } from 'react';
import { useDesktopStore, type FileSystemItem } from '../../stores/useDesktopStore';
import { useContextMenu } from '../../hooks/useContextMenu';
import type { ContextMenuItem } from '../ContextMenu';
import './DesktopIcons.css';

// Icon imports
import folderIcon from '../../assets/icons/folder.svg';
import textIcon from '../../assets/icons/text.svg';
import htmlIcon from '../../assets/icons/html.svg';
import markdownIcon from '../../assets/icons/markdown.svg';
import javascriptIcon from '../../assets/icons/javascript.svg';
import cssIcon from '../../assets/icons/css.svg';
import jsonIcon from '../../assets/icons/json.svg';
import pdfIcon from '../../assets/icons/pdf.svg';
import imageIcon from '../../assets/icons/image.svg';
import archiveIcon from '../../assets/icons/archive.svg';
import appIcon from '../../assets/icons/app.svg';
import texteditorIcon from '../../assets/icons/texteditor.svg';
import linkIcon from '../../assets/icons/link.svg';
import defaultIcon from '../../assets/icons/default.svg';

/**
 * Props for DesktopIcons component
 */
interface DesktopIconsProps {
  onRename: (item: FileSystemItem) => void;
  onDelete: (item: FileSystemItem) => void;
}

/**
 * DesktopIcons component that renders draggable icons on the desktop.
 * Handles icon interactions like double-click to open applications,
 * drag and drop positioning, and visual feedback for drag operations.
 * Provides right-click context menu for CRUD operations.
 */
export const DesktopIcons: React.FC<DesktopIconsProps> = React.memo(({ onRename, onDelete }) => {
  const { fileSystem, openWindow, setDragging, isDragging, draggedItem, copyToClipboard, cutToClipboard } =
    useDesktopStore();

  const { showContextMenu } = useContextMenu();

  /**
   * Handle icon double click
   */
  const handleIconDoubleClick = useCallback(
    (item: FileSystemItem) => {
      if (item.type === 'file') {
        let component = 'FileViewer';

        // Check if it's an application file
        if (item.name.split('.').pop() === 'app' && item.content) {
          component = item.content; // Use the content as component name
        } else {
          // Regular file handling
          switch (item.name.split('.').pop()) {
            case 'txt':
            case 'html':
            case 'htm':
            case 'md':
            case 'markdown':
              component = 'FileViewer';
              break;
            case 'pdf':
              component = 'PDFViewer';
              break;
            case 'lnk':
              component = 'ContactForm';
              break;
            default:
              component = 'FileViewer';
          }
        }

        openWindow({
          title: item.name,
          component,
          isMinimized: false,
          isMaximized: false,
          position: { x: 200, y: 100 },
          size: { width: 600, height: 400 },
          filePath: item.path,
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
    },
    [openWindow]
  );

  /**
   * Handle copy operation
   */
  const handleCopy = useCallback(
    (item: FileSystemItem) => {
      copyToClipboard([item.path]);
    },
    [copyToClipboard]
  );

  /**
   * Handle cut operation
   */
  const handleCut = useCallback(
    (item: FileSystemItem) => {
      cutToClipboard([item.path]);
    },
    [cutToClipboard]
  );

  /**
   * Check if file is editable in TextEditor
   */
  const isEditableInTextEditor = (fileName: string): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const editableExtensions = [
      'txt',
      'html',
      'htm',
      'md',
      'markdown',
      'js',
      'jsx',
      'ts',
      'tsx',
      'css',
      'scss',
      'sass',
      'json',
      'xml',
    ];
    return extension ? editableExtensions.includes(extension) : false;
  };

  /**
   * Handle opening file with TextEditor
   */
  const handleOpenWithTextEditor = useCallback(
    (item: FileSystemItem) => {
      openWindow({
        title: `TextEditor - ${item.name}`,
        component: 'TextEditorApp',
        isMinimized: false,
        isMaximized: false,
        position: { x: 250, y: 150 },
        size: { width: 800, height: 600 },
        filePath: item.path,
      });
    },
    [openWindow]
  );

  /**
   * Handle icon context menu
   */
  const handleIconContextMenu = useCallback(
    (e: React.MouseEvent, item: FileSystemItem) => {
      e.preventDefault();
      e.stopPropagation(); // Prevent desktop context menu

      const menuItems: ContextMenuItem[] = [
        {
          id: 'open',
          label: 'Open',
          icon: '📖',
          onClick: () => handleIconDoubleClick(item),
        },
      ];

      // Add "Open with TextEditor" option for editable files
      if (item.type === 'file' && isEditableInTextEditor(item.name)) {
        menuItems.push({
          id: 'open-with-texteditor',
          label: 'Abrir com TextEditor',
          icon: '📝',
          onClick: () => handleOpenWithTextEditor(item),
        });
      }

      menuItems.push(
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
          onClick: () => onRename(item),
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
          onClick: () => onDelete(item),
        }
      );

      showContextMenu({ x: e.clientX, y: e.clientY }, menuItems);
    },
    [showContextMenu, handleIconDoubleClick, handleOpenWithTextEditor, onRename, handleCopy, handleCut, onDelete]
  );

  const getDesktopItems = () => {
    const desktop = fileSystem.find((item) => item.path === '/Desktop');
    return desktop?.children || [];
  };

  const getIconForFile = (fileName: string, fileContent?: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    // Special case for TextEditor app
    if (extension === 'app' && fileContent === 'TextEditor') {
      return texteditorIcon;
    }

    switch (extension) {
      case 'txt':
        return textIcon;
      case 'html':
      case 'htm':
        return htmlIcon;
      case 'md':
      case 'markdown':
        return markdownIcon;
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return javascriptIcon;
      case 'css':
      case 'scss':
      case 'sass':
        return cssIcon;
      case 'json':
        return jsonIcon;
      case 'xml':
        return textIcon;
      case 'pdf':
        return pdfIcon;
      case 'lnk':
        return linkIcon;
      case 'app':
        return appIcon;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return imageIcon;
      case 'zip':
      case 'rar':
      case '7z':
        return archiveIcon;
      case 'exe':
      case 'msi':
        return appIcon;
      default:
        return defaultIcon;
    }
  };

  const handleDragStart = (e: React.DragEvent, item: FileSystemItem) => {
    // Determine if this is an app or regular file
    const isApp = item.name.endsWith('.app') && item.content;

    setDragging(true, item.id);

    if (isApp) {
      // For app files, set drag data for pinning to taskbar
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          type: 'desktop-app',
          appInfo: {
            name: item.name.replace('.app', ''),
            component: item.content,
            icon: getIconForFile(item.name, item.content),
          },
        })
      );
    } else {
      // For regular files, use move for repositioning
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.id);
    }
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
          data-testid={item.content === 'SettingsApp' ? 'settings-app' : undefined}
        >
          <div className="icon" aria-hidden="true">
            <img
              src={item.type === 'folder' ? folderIcon : getIconForFile(item.name, item.content)}
              alt=""
              className="icon-image"
              draggable={false}
            />
          </div>
          <div className="icon-label" id={`icon-description-${item.id}`}>
            {item.name}
          </div>
        </div>
      ))}
    </div>
  );
});

DesktopIcons.displayName = 'DesktopIcons';
