import React, { useEffect, useRef } from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import './StartMenu.css';

/**
 * StartMenu component that displays a Windows-like start menu with pinned applications,
 * recommended items, and power options. Handles click-outside behavior to close the menu
 * and provides application launching functionality.
 */
export const StartMenu: React.FC = React.memo(() => {
  const { isStartMenuOpen, closeStartMenu, openWindow, activateScreensaver } = useDesktopStore();
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
    const { windows } = useDesktopStore.getState();

    // Calculator gets compact dimensions, others use default
    const isCalculator = component === 'calculator';

    // Calculate position offset based on existing windows to prevent overlaps
    const windowCount = windows.length;
    const offset = windowCount * 30; // Stagger windows by 30px

    const windowConfig = {
      title: appName,
      component,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + offset, y: 100 + offset },
      size: isCalculator ? { width: 320, height: 460 } : { width: 800, height: 600 },
      isResizable: true, // All apps are now resizable, maximize behavior handled specifically for calculator
    };

    openWindow(windowConfig);
    closeStartMenu();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeStartMenu();
    }
  };

  if (!isStartMenuOpen) return null;

  return (
    <div
      className="start-menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-menu-title"
      onKeyDown={handleKeyDown}
    >
      <div className="start-menu" ref={menuRef}>
        <div className="start-menu-header">
          <div className="user-profile">
            <div className="user-avatar" aria-hidden="true">
              👤
            </div>
            <span className="user-name">User</span>
          </div>
        </div>

        <div className="start-menu-content">
          <div className="pinned-apps">
            <h3 id="start-menu-title">Pinned</h3>
            <div className="app-grid" role="grid" aria-label="Pinned applications">
              <button
                className="app-button"
                onClick={() => handleAppClick('File Explorer', 'explorer')}
                aria-label="Open File Explorer"
                type="button"
              >
                <span className="app-icon" aria-hidden="true">
                  📁
                </span>
                <span className="app-name">File Explorer</span>
              </button>
              <button
                className="app-button"
                onClick={() => handleAppClick('About', 'about')}
                aria-label="Open About"
                type="button"
              >
                <span className="app-icon" aria-hidden="true">
                  📄
                </span>
                <span className="app-name">About</span>
              </button>
              <button
                className="app-button"
                onClick={() => handleAppClick('Projects', 'projects')}
                aria-label="Open Projects"
                type="button"
              >
                <span className="app-icon" aria-hidden="true">
                  💼
                </span>
                <span className="app-name">Projects</span>
              </button>
              <button
                className="app-button"
                onClick={() => handleAppClick('Contact', 'contact')}
                aria-label="Open Contact"
                type="button"
              >
                <span className="app-icon" aria-hidden="true">
                  📧
                </span>
                <span className="app-name">Contact</span>
              </button>
              <button
                className="app-button"
                onClick={() => handleAppClick('Settings', 'settings')}
                aria-label="Open Settings"
                type="button"
              >
                <span className="app-icon" aria-hidden="true">
                  ⚙️
                </span>
                <span className="app-name">Settings</span>
              </button>
              <button
                className="app-button"
                onClick={() => handleAppClick('Calculator', 'calculator')}
                aria-label="Open Calculator"
                type="button"
              >
                <span className="app-icon" aria-hidden="true">
                  🧮
                </span>
                <span className="app-name">Calculator</span>
              </button>
              <button
                className="app-button"
                onClick={() => handleAppClick('Terminal', 'terminal')}
                aria-label="Open Terminal"
                type="button"
              >
                <span className="app-icon" aria-hidden="true">
                  🖥️
                </span>
                <span className="app-name">Terminal</span>
              </button>
            </div>
          </div>

          <div className="recommended-section">
            <h3>Recommended</h3>
            <div className="recommended-items" role="list" aria-label="Recommended items">
              <div className="recommended-item" role="listitem" tabIndex={0} aria-label="Resume.pdf, recently modified">
                <span className="recommended-icon" aria-hidden="true">
                  📄
                </span>
                <div className="recommended-info">
                  <span className="recommended-name">Resume.pdf</span>
                  <span className="recommended-desc">Recently modified</span>
                </div>
              </div>
              <div
                className="recommended-item"
                role="listitem"
                tabIndex={0}
                aria-label="Portfolio Project, recently opened"
              >
                <span className="recommended-icon" aria-hidden="true">
                  💻
                </span>
                <div className="recommended-info">
                  <span className="recommended-name">Portfolio Project</span>
                  <span className="recommended-desc">Recently opened</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="start-menu-footer">
          <button
            className="power-button"
            title="Activate Snake Game Screensaver"
            aria-label="Activate Snake Game Screensaver"
            type="button"
            onClick={activateScreensaver}
          >
            <span className="power-icon" aria-hidden="true">
              ⏻
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

StartMenu.displayName = 'StartMenu';
