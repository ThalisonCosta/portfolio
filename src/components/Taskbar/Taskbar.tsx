import React from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import './Taskbar.css';

export const Taskbar: React.FC = () => {
  const { windows, minimizeWindow, bringToFront } = useDesktopStore();

  const handleTaskbarClick = (windowId: string) => {
    const window = windows.find(w => w.id === windowId);
    if (window) {
      if (window.isMinimized) {
        minimizeWindow(windowId);
      }
      bringToFront(windowId);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="taskbar">
      <div className="taskbar-left">
        <button 
          className="start-button"
          onClick={() => {
            // TODO: Open start menu
            console.log('Start menu clicked');
          }}
        >
          <span className="start-icon">⊞</span>
        </button>
      </div>
      
      <div className="taskbar-center">
        {windows.filter(w => !w.isMinimized).map((window) => (
          <button
            key={window.id}
            className="taskbar-item"
            onClick={() => handleTaskbarClick(window.id)}
            title={window.title}
          >
            {window.title}
          </button>
        ))}
      </div>
      
      <div className="taskbar-right">
        <div className="system-tray">
          <span className="clock">{getCurrentTime()}</span>
        </div>
      </div>
    </div>
  );
};