import React, { useState } from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import type { FileSystemItem } from '../../stores/useDesktopStore';
import './DesktopIcons.css';

export const DesktopIcons: React.FC = () => {
  const { fileSystem, openWindow, updateIconPosition, setDragging, isDragging, draggedItem } = useDesktopStore();
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    const desktop = fileSystem.find(item => item.path === '/Desktop');
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
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDragging(true, item.id);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragEnd = () => {
    setDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <div className="desktop-icons">
      {getDesktopItems().map((item) => (
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
        >
          <div className="icon">
            {item.type === 'folder' ? '📁' : getIconForFile(item.name)}
          </div>
          <div className="icon-label">{item.name}</div>
        </div>
      ))}
    </div>
  );
};