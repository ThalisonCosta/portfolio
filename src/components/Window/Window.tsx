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
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, windowX: 0, windowY: 0 });
  const [resizeDirection, setResizeDirection] = useState('');

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
    (e: React.MouseEvent, direction: string) => {
      e.stopPropagation();
      bringToFront(windowState.id);
      setIsResizing(true);
      setResizeDirection(direction);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: windowState.size.width,
        height: windowState.size.height,
        windowX: windowState.position.x,
        windowY: windowState.position.y,
      });
    },
    [windowState.id, windowState.size, windowState.position, bringToFront]
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

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.windowX;
        let newY = resizeStart.windowY;

        // Handle different resize directions
        switch (resizeDirection) {
          case 'right':
            newWidth = Math.max(minWidth, resizeStart.width + deltaX);
            break;
          case 'left':
            newWidth = Math.max(minWidth, resizeStart.width - deltaX);
            newX = Math.min(resizeStart.windowX + deltaX, resizeStart.windowX + resizeStart.width - minWidth);
            break;
          case 'bottom':
            newHeight = Math.max(minHeight, resizeStart.height + deltaY);
            break;
          case 'top':
            newHeight = Math.max(minHeight, resizeStart.height - deltaY);
            newY = Math.min(resizeStart.windowY + deltaY, resizeStart.windowY + resizeStart.height - minHeight);
            break;
          case 'bottom-right':
            newWidth = Math.max(minWidth, resizeStart.width + deltaX);
            newHeight = Math.max(minHeight, resizeStart.height + deltaY);
            break;
          case 'bottom-left':
            newWidth = Math.max(minWidth, resizeStart.width - deltaX);
            newHeight = Math.max(minHeight, resizeStart.height + deltaY);
            newX = Math.min(resizeStart.windowX + deltaX, resizeStart.windowX + resizeStart.width - minWidth);
            break;
          case 'top-right':
            newWidth = Math.max(minWidth, resizeStart.width + deltaX);
            newHeight = Math.max(minHeight, resizeStart.height - deltaY);
            newY = Math.min(resizeStart.windowY + deltaY, resizeStart.windowY + resizeStart.height - minHeight);
            break;
          case 'top-left':
            newWidth = Math.max(minWidth, resizeStart.width - deltaX);
            newHeight = Math.max(minHeight, resizeStart.height - deltaY);
            newX = Math.min(resizeStart.windowX + deltaX, resizeStart.windowX + resizeStart.width - minWidth);
            newY = Math.min(resizeStart.windowY + deltaY, resizeStart.windowY + resizeStart.height - minHeight);
            break;
          default:
            // Default case for bottom-right (original behavior)
            newWidth = Math.max(minWidth, resizeStart.width + deltaX);
            newHeight = Math.max(minHeight, resizeStart.height + deltaY);
            break;
        }

        // Apply boundary constraints
        newX = Math.max(0, Math.min(window.innerWidth - newWidth, newX));
        newY = Math.max(0, Math.min(window.innerHeight - newHeight - 48, newY)); // 48px for taskbar

        updateWindowSize(windowState.id, { width: newWidth, height: newHeight });
        if (newX !== resizeStart.windowX || newY !== resizeStart.windowY) {
          updateWindowPosition(windowState.id, { x: newX, y: newY });
        }
      }
    },
    [
      isDragging,
      isResizing,
      resizeDirection,
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
    setResizeDirection('');
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
        <>
          {/* Edge handles */}
          <div
            className="resize-handle resize-handle-top"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
            role="button"
            aria-label="Resize window from top"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-right"
            onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
            role="button"
            aria-label="Resize window from right"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-bottom"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
            role="button"
            aria-label="Resize window from bottom"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-left"
            onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
            role="button"
            aria-label="Resize window from left"
            tabIndex={0}
          />

          {/* Corner handles */}
          <div
            className="resize-handle resize-handle-top-left"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
            role="button"
            aria-label="Resize window from top-left"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-top-right"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
            role="button"
            aria-label="Resize window from top-right"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-bottom-left"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
            role="button"
            aria-label="Resize window from bottom-left"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-bottom-right"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
            role="button"
            aria-label="Resize window from bottom-right"
            tabIndex={0}
          />
        </>
      )}
    </div>
  );
});

Window.displayName = 'Window';
