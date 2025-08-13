import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useDesktopStore, type WindowState } from '../../stores/useDesktopStore';
import { ApplicationManager } from '../ApplicationManager/ApplicationManager';
import './Window.css';

/**
 * Props for the Window component
 */
interface WindowProps {
  /** The state object containing window configuration and properties */
  windowState: WindowState;
}

/**
 * Window component that represents a draggable, resizable window in the desktop environment.
 * Handles window operations like minimizing, maximizing, closing, dragging, and resizing.
 *
 * @param props - The component props
 * @param props.windowState - The current state of the window including position, size, and status
 */
export const Window: React.FC<WindowProps> = React.memo(({ windowState }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, updateWindowPosition, updateWindowSize, bringToFront } =
    useDesktopStore();

  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === headerRef.current || headerRef.current?.contains(e.target as Node)) {
        bringToFront(windowState.id);
        setIsDragging(true);
        setDragStart({
          x: e.clientX - windowState.position.x,
          y: e.clientY - windowState.position.y,
        });
      }
    },
    [windowState.id, windowState.position, bringToFront]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      bringToFront(windowState.id);
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: windowState.size.width,
        height: windowState.size.height,
      });
    },
    [windowState.id, windowState.size, bringToFront]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && !windowState.isMaximized) {
        // Calculate new position with boundary constraints
        const newX = Math.max(0, Math.min(window.innerWidth - windowState.size.width, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(window.innerHeight - windowState.size.height - 48, e.clientY - dragStart.y)); // 48px for taskbar
        updateWindowPosition(windowState.id, { x: newX, y: newY });
      } else if (isResizing && !windowState.isMaximized && windowState.isResizable !== false) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        // Apply component-specific minimum sizes
        const minWidth = windowState.component === 'calculator' ? 280 : 300;
        const minHeight = windowState.component === 'calculator' ? 430 : 200;

        const newWidth = Math.max(minWidth, resizeStart.width + deltaX);
        const newHeight = Math.max(minHeight, resizeStart.height + deltaY);
        updateWindowSize(windowState.id, { width: newWidth, height: newHeight });
      }
    },
    [
      isDragging,
      isResizing,
      windowState.id,
      windowState.isMaximized,
      windowState.isResizable,
      windowState.component,
      windowState.size,
      dragStart,
      resizeStart,
      updateWindowPosition,
      updateWindowSize,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleClose = () => closeWindow(windowState.id);
  const handleMinimize = () => minimizeWindow(windowState.id);
  const handleMaximize = () => {
    // Don't allow maximizing calculator specifically
    if (windowState.component !== 'calculator') {
      maximizeWindow(windowState.id);
    }
  };

  if (windowState.isMinimized) {
    return null;
  }

  const windowStyle: React.CSSProperties = {
    position: 'absolute',
    left: windowState.isMaximized ? 0 : windowState.position.x,
    top: windowState.isMaximized ? 0 : windowState.position.y,
    width: windowState.isMaximized ? '100vw' : windowState.size.width,
    height: windowState.isMaximized ? 'calc(100vh - 48px)' : windowState.size.height,
    zIndex: windowState.zIndex,
  };

  function getMaximizeTitle({ component, isMaximized }: WindowState): string {
    if (component === 'calculator') return 'Cannot maximize calculator';
    return isMaximized ? 'Restore window' : 'Maximize window';
  }

  return (
    <div
      ref={windowRef}
      className={`window ${windowState.isMaximized ? 'maximized' : ''}`}
      style={windowStyle}
      onClick={() => bringToFront(windowState.id)}
      data-component={windowState.component}
      role="dialog"
      aria-labelledby={`window-title-${windowState.id}`}
      aria-modal="false"
      tabIndex={-1}
    >
      <div
        ref={headerRef}
        className="window-header"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleMaximize}
        role="banner"
        aria-label="Window header"
      >
        <div id={`window-title-${windowState.id}`} className="window-title">
          {windowState.title}
        </div>
        <div className="window-controls" role="toolbar" aria-label="Window controls">
          <button
            className="window-control minimize"
            onClick={handleMinimize}
            title="Minimize window"
            aria-label="Minimize window"
            type="button"
          >
            ⎯
          </button>
          <button
            className="window-control maximize"
            onClick={handleMaximize}
            title={getMaximizeTitle(windowState)}
            aria-label={getMaximizeTitle(windowState)}
            type="button"
            disabled={windowState.component === 'calculator'}
          >
            {windowState.isMaximized ? '❐' : '□'}
          </button>
          <button
            className="window-control close"
            onClick={handleClose}
            title="Close window"
            aria-label="Close window"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="window-content" role="main" aria-label={`${windowState.title} content`}>
        <ApplicationManager component={windowState.component} windowId={windowState.id} />
      </div>

      {!windowState.isMaximized && windowState.isResizable !== false && (
        <div
          className="window-resize-handle"
          onMouseDown={handleResizeMouseDown}
          role="button"
          aria-label="Resize window"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // Focus handling for keyboard resize could be implemented here
            }
          }}
        />
      )}
    </div>
  );
});

Window.displayName = 'Window';
