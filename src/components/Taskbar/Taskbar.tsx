import React from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import { StartMenu } from '../StartMenu/StartMenu';
import './Taskbar.css';

export const Taskbar: React.FC = () => {
  const { windows, minimizeWindow, bringToFront, toggleStartMenu } = useDesktopStore();

  const handleTaskbarClick = (windowId: string) => {
    const window = windows.find((w) => w.id === windowId);
    if (window) {
      if (window.isMinimized) {
        minimizeWindow(windowId);
      }
      bringToFront(windowId);
    }
  };

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div className="taskbar">
        <div className="taskbar-left">
          <div className="taskbar-apps">
            {windows
              .filter((w) => !w.isMinimized)
              .slice(0, 3)
              .map((window) => (
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
        </div>

        <div className="taskbar-center">
          <button className="start-button" onClick={toggleStartMenu} aria-label="Start menu">
            <span className="start-icon">⊞</span>
          </button>
        </div>

        <div className="taskbar-right">
          <div className="system-tray">
            <span className="clock">{getCurrentTime()}</span>
            <span className="date">{getCurrentDate()}</span>
          </div>
        </div>
      </div>
      <StartMenu />
    </>
  );
};
