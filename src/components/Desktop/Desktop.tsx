import React from 'react';
import { Taskbar } from '../Taskbar/Taskbar';
import { WindowManager } from '../WindowManager/WindowManager';
import { DesktopIcons } from '../DesktopIcons/DesktopIcons';
import { useDesktopStore } from '../../stores/useDesktopStore';
import './Desktop.css';

export const Desktop: React.FC = () => {
  const { wallpaper, theme } = useDesktopStore();

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      useDesktopStore.getState().clearSelection();
    }
  };

  return (
    <div 
      className={`desktop ${theme}`}
      style={{ backgroundImage: `url(${wallpaper})` }}
      onClick={handleDesktopClick}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <DesktopIcons />
      <WindowManager />
      <Taskbar />
    </div>
  );
};