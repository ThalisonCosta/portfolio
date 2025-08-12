import React from 'react';
import { useDesktopStore, type FileSystemItem } from '../../stores/useDesktopStore';
import './DesktopIcons.css';

/**
 * DesktopIcons component that renders draggable icons on the desktop.
 * Handles icon interactions like double-click to open applications,
 * drag and drop positioning, and visual feedback for drag operations.
 */
export const DesktopIcons: React.FC = React.memo(() => {
  const { fileSystem, openWindow, setDragging, isDragging, draggedItem } = useDesktopStore();

  const handleIconDoubleClick = (item: FileSystemItem) => {
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
  };

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
    </div>
  );
});

DesktopIcons.displayName = 'DesktopIcons';
