import React, { useEffect, useRef } from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import './StartMenu.css';

export const StartMenu: React.FC = () => {
  const { isStartMenuOpen, closeStartMenu, openWindow } = useDesktopStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeStartMenu();
      }
    };

    if (isStartMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStartMenuOpen, closeStartMenu]);

  const handleAppClick = (appName: string, component: string) => {
    openWindow({
      title: appName,
      component,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
    });
    closeStartMenu();
  };

  if (!isStartMenuOpen) return null;

  return (
    <div className="start-menu-overlay">
      <div className="start-menu" ref={menuRef}>
        <div className="start-menu-header">
          <div className="user-profile">
            <div className="user-avatar">👤</div>
            <span className="user-name">User</span>
          </div>
        </div>

        <div className="start-menu-content">
          <div className="pinned-apps">
            <h3>Pinned</h3>
            <div className="app-grid">
              <button className="app-button" onClick={() => handleAppClick('File Explorer', 'explorer')}>
                <span className="app-icon">📁</span>
                <span className="app-name">File Explorer</span>
              </button>
              <button className="app-button" onClick={() => handleAppClick('About Me', 'about')}>
                <span className="app-icon">📄</span>
                <span className="app-name">About Me</span>
              </button>
              <button className="app-button" onClick={() => handleAppClick('Projects', 'projects')}>
                <span className="app-icon">💼</span>
                <span className="app-name">Projects</span>
              </button>
              <button className="app-button" onClick={() => handleAppClick('Contact', 'contact')}>
                <span className="app-icon">📧</span>
                <span className="app-name">Contact</span>
              </button>
              <button className="app-button" onClick={() => handleAppClick('Settings', 'settings')}>
                <span className="app-icon">⚙️</span>
                <span className="app-name">Settings</span>
              </button>
              <button className="app-button" onClick={() => handleAppClick('Calculator', 'calculator')}>
                <span className="app-icon">🧮</span>
                <span className="app-name">Calculator</span>
              </button>
            </div>
          </div>

          <div className="recommended-section">
            <h3>Recommended</h3>
            <div className="recommended-items">
              <div className="recommended-item">
                <span className="recommended-icon">📄</span>
                <div className="recommended-info">
                  <span className="recommended-name">Resume.pdf</span>
                  <span className="recommended-desc">Recently modified</span>
                </div>
              </div>
              <div className="recommended-item">
                <span className="recommended-icon">💻</span>
                <div className="recommended-info">
                  <span className="recommended-name">Portfolio Project</span>
                  <span className="recommended-desc">Recently opened</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="start-menu-footer">
          <button className="power-button" title="Power options">
            <span className="power-icon">⏻</span>
          </button>
        </div>
      </div>
    </div>
  );
};
