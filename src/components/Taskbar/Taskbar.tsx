import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import { StartMenu } from '../StartMenu/StartMenu';
import { Calendar } from '../Calendar/Calendar';
import win11Logo from '../../assets/win11.png';
import './Taskbar.css';

/**
 * Taskbar component that displays the bottom taskbar with running applications,
 * start button, system clock, and date. Provides window management functionality
 * similar to Windows taskbar.
 */
export const Taskbar: React.FC = React.memo(() => {
  const { windows, minimizeWindow, bringToFront, toggleStartMenu, settings, openWindow } = useDesktopStore();

  // Calendar state
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dateTimeRef = useRef<HTMLDivElement>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTaskbarClick = (windowId: string) => {
    const window = windows.find((w) => w.id === windowId);
    if (window) {
      if (window.isMinimized) {
        minimizeWindow(windowId);
      }
      bringToFront(windowId);
    }
  };

  const getFormattedTime = () => {
    try {
      return new Intl.DateTimeFormat(settings.language.language, {
        timeStyle: settings.datetime.timeFormat,
        hour12: settings.datetime.hour12Format,
        timeZone: settings.datetime.timezone,
      }).format(currentTime);
    } catch {
      return currentTime.toLocaleTimeString();
    }
  };

  const getFormattedDate = () => {
    try {
      return new Intl.DateTimeFormat(settings.language.language, {
        dateStyle: settings.datetime.dateFormat,
        timeZone: settings.datetime.timezone,
      }).format(currentTime);
    } catch {
      return currentTime.toLocaleDateString();
    }
  };

  /**
   * Toggle calendar visibility
   */
  const toggleCalendar = useCallback(() => {
    setIsCalendarVisible((prev) => !prev);
  }, []);

  /**
   * Close calendar
   */
  const closeCalendar = useCallback(() => {
    setIsCalendarVisible(false);
  }, []);

  /**
   * Handle opening File Explorer from pinned taskbar button
   */
  const handleFileExplorerClick = useCallback(() => {
    const { windows } = useDesktopStore.getState();

    // Check if File Explorer is already open
    const existingFileExplorer = windows.find((window) => window.component === 'explorer');

    if (existingFileExplorer) {
      // If File Explorer is already open, bring it to front and restore if minimized
      if (existingFileExplorer.isMinimized) {
        minimizeWindow(existingFileExplorer.id); // This toggles minimize state
      }
      bringToFront(existingFileExplorer.id);
    } else {
      // If no File Explorer is open, create a new one
      const windowCount = windows.length;
      const offset = windowCount * 30; // Stagger windows by 30px

      openWindow({
        title: 'File Explorer',
        component: 'explorer',
        icon: '📁',
        isMinimized: false,
        isMaximized: false,
        position: { x: 100 + offset, y: 100 + offset },
        size: { width: 800, height: 600 },
        isResizable: true,
      });
    }
  }, [openWindow, minimizeWindow, bringToFront]);

  /**
   * Check if File Explorer is currently open
   */
  const isFileExplorerOpen = windows.some((window) => window.component === 'explorer');

  /**
   * Get the currently focused window (window with highest zIndex)
   */
  const focusedWindow = windows.reduce(
    (highest, current) => {
      if (!highest || current.zIndex > highest.zIndex) {
        return current;
      }
      return highest;
    },
    null as (typeof windows)[0] | null
  );

  /**
   * Get calendar position relative to date/time area
   */
  const getCalendarPosition = useCallback(() => {
    if (!dateTimeRef.current) return undefined;

    const rect = dateTimeRef.current.getBoundingClientRect();
    return {
      x: rect.right,
      y: rect.top,
    };
  }, []);

  return (
    <>
      <div className="taskbar">
        <div className="taskbar-left"></div>

        <div className="taskbar-center">
          <button className="start-button" onClick={toggleStartMenu} aria-label="Start menu">
            <img src={win11Logo} alt="Windows 11" className="start-icon" />
          </button>
          <button
            className={`taskbar-item pinned-item ${isFileExplorerOpen ? 'open' : ''} ${focusedWindow?.component === 'explorer' ? 'focused' : ''}`}
            onClick={handleFileExplorerClick}
            title="File Explorer"
            aria-label="Open File Explorer"
          >
            <span className="taskbar-icon" aria-hidden="true">
              📁
            </span>
          </button>
          <div className="taskbar-apps">
            {windows
              .filter((window) => window.component !== 'explorer')
              .slice(0, 8)
              .map((window) => (
                <button
                  key={window.id}
                  className={`taskbar-item open ${focusedWindow?.id === window.id ? 'focused' : ''} ${window.isMinimized ? 'minimized' : ''}`}
                  onClick={() => handleTaskbarClick(window.id)}
                  title={window.title}
                >
                  <span className="taskbar-icon" aria-hidden="true">
                    {window.icon || '📄'}
                  </span>
                </button>
              ))}
          </div>
        </div>

        <div className="taskbar-right">
          <div
            ref={dateTimeRef}
            className="system-tray"
            onClick={toggleCalendar}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCalendar();
              }
            }}
            aria-label="Open calendar"
            title="Click to open calendar"
          >
            <span className="clock">{getFormattedTime()}</span>
            <span className="date">{getFormattedDate()}</span>
          </div>
        </div>
      </div>
      <StartMenu />
      <Calendar isVisible={isCalendarVisible} onClose={closeCalendar} position={getCalendarPosition()} />
    </>
  );
});

Taskbar.displayName = 'Taskbar';
