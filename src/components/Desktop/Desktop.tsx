import React from 'react';
import { Taskbar } from '../Taskbar/Taskbar';
import { WindowManager } from '../WindowManager/WindowManager';
import { DesktopIcons } from '../DesktopIcons/DesktopIcons';
import { useDesktopStore } from '../../stores/useDesktopStore';
import './Desktop.css';

export const Desktop: React.FC = () => {
  const { wallpaper, theme, updateIconPosition, setDragging } = useDesktopStore();

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
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <DesktopIcons />
      <WindowManager />
      <Taskbar />
    </div>
  );
};