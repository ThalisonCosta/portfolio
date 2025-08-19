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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.target === headerRef.current || headerRef.current?.contains(e.target as Node)) {
        bringToFront(windowState.id);
        setIsDragging(true);
        const touch = e.touches[0] as Touch;
        setDragStart({
          x: touch.clientX - windowState.position.x,
          y: touch.clientY - windowState.position.y,
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

  const handleResizeTouchStart = useCallback(
    (e: React.TouchEvent, direction: string) => {
      e.stopPropagation();
      bringToFront(windowState.id);
      setIsResizing(true);
      setResizeDirection(direction);
      const touch = e.touches[0] as Touch;
      setResizeStart({
        x: touch.clientX,
        y: touch.clientY,
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
        // Mobile-aware boundary calculations
        const isMobile = window.innerWidth <= 768;
        const taskbarHeight = isMobile ? 60 : 48; // Larger taskbar on mobile
        const margin = isMobile ? 10 : 0; // Keep some margin on mobile
        
        // Calculate available space
        const maxX = window.innerWidth - windowState.size.width - margin;
        const maxY = window.innerHeight - windowState.size.height - taskbarHeight - margin;
        
        // Calculate new position with mobile-friendly constraints
        const newX = Math.max(margin, Math.min(maxX, e.clientX - dragStart.x));
        const newY = Math.max(margin, Math.min(maxY, e.clientY - dragStart.y));
        
        updateWindowPosition(windowState.id, { x: newX, y: newY });
      } else if (isResizing && !windowState.isMaximized && windowState.isResizable !== false) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        // Apply component-specific minimum sizes with mobile awareness
        const isMobile = window.innerWidth <= 768;
        let minWidth: number;
        let minHeight: number;
        
        if (isMobile) {
          minWidth = windowState.component === 'calculator' ? 250 : 280;
          minHeight = windowState.component === 'calculator' ? 350 : 180;
        } else {
          minWidth = windowState.component === 'calculator' ? 280 : 300;
          minHeight = windowState.component === 'calculator' ? 430 : 200;
        }
        
        // Mobile maximum sizes to prevent overflow
        const maxWidth = isMobile ? window.innerWidth - 20 : window.innerWidth;
        const maxHeight = isMobile ? window.innerHeight - 80 : window.innerHeight;

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.windowX;
        let newY = resizeStart.windowY;

        // Handle different resize directions with mobile constraints
        switch (resizeDirection) {
          case 'right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            break;
          case 'left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - deltaX));
            newX = Math.min(resizeStart.windowX + deltaX, resizeStart.windowX + resizeStart.width - minWidth);
            break;
          case 'bottom':
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            break;
          case 'top':
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
            newY = Math.min(resizeStart.windowY + deltaY, resizeStart.windowY + resizeStart.height - minHeight);
            break;
          case 'bottom-right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            break;
          case 'bottom-left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            newX = Math.min(resizeStart.windowX + deltaX, resizeStart.windowX + resizeStart.width - minWidth);
            break;
          case 'top-right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
            newY = Math.min(resizeStart.windowY + deltaY, resizeStart.windowY + resizeStart.height - minHeight);
            break;
          case 'top-left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
            newX = Math.min(resizeStart.windowX + deltaX, resizeStart.windowX + resizeStart.width - minWidth);
            newY = Math.min(resizeStart.windowY + deltaY, resizeStart.windowY + resizeStart.height - minHeight);
            break;
          default:
            // Default case for bottom-right (original behavior)
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            break;
        }

        // Apply mobile-aware boundary constraints
        const margin = isMobile ? 10 : 0;
        const taskbarHeight = isMobile ? 60 : 48;
        newX = Math.max(margin, Math.min(window.innerWidth - newWidth - margin, newX));
        newY = Math.max(margin, Math.min(window.innerHeight - newHeight - taskbarHeight - margin, newY));

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

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && !windowState.isMaximized) {
        const touch = e.touches[0] as Touch;
        // Mobile-aware boundary calculations
        const isMobile = window.innerWidth <= 768;
        const taskbarHeight = isMobile ? 60 : 48;
        const margin = isMobile ? 10 : 0;
        
        // Calculate available space
        const maxX = window.innerWidth - windowState.size.width - margin;
        const maxY = window.innerHeight - windowState.size.height - taskbarHeight - margin;
        
        // Calculate new position with mobile-friendly constraints
        const newX = Math.max(margin, Math.min(maxX, touch.clientX - dragStart.x));
        const newY = Math.max(margin, Math.min(maxY, touch.clientY - dragStart.y));
        
        updateWindowPosition(windowState.id, { x: newX, y: newY });
      } else if (isResizing && !windowState.isMaximized && windowState.isResizable !== false) {
        const touch = e.touches[0] as Touch;
        const deltaX = touch.clientX - resizeStart.x;
        const deltaY = touch.clientY - resizeStart.y;

        // Apply component-specific minimum sizes with mobile awareness
        const isMobile = window.innerWidth <= 768;
        let minWidth: number;
        let minHeight: number;
        
        if (isMobile) {
          minWidth = windowState.component === 'calculator' ? 250 : 280;
          minHeight = windowState.component === 'calculator' ? 350 : 180;
        } else {
          minWidth = windowState.component === 'calculator' ? 280 : 300;
          minHeight = windowState.component === 'calculator' ? 430 : 200;
        }
        
        // Mobile maximum sizes to prevent overflow
        const maxWidth = isMobile ? window.innerWidth - 20 : window.innerWidth;
        const maxHeight = isMobile ? window.innerHeight - 80 : window.innerHeight;

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.windowX;
        let newY = resizeStart.windowY;

        // Handle different resize directions with mobile constraints
        switch (resizeDirection) {
          case 'right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            break;
          case 'left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - deltaX));
            newX = Math.min(resizeStart.windowX + deltaX, resizeStart.windowX + resizeStart.width - minWidth);
            break;
          case 'bottom':
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            break;
          case 'top':
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
            newY = Math.min(resizeStart.windowY + deltaY, resizeStart.windowY + resizeStart.height - minHeight);
            break;
          case 'bottom-right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            break;
          case 'bottom-left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            newX = Math.min(resizeStart.windowX + deltaX, resizeStart.windowX + resizeStart.width - minWidth);
            break;
          case 'top-right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
            newY = Math.min(resizeStart.windowY + deltaY, resizeStart.windowY + resizeStart.height - minHeight);
            break;
          case 'top-left':
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height - deltaY));
            newX = Math.min(resizeStart.windowX + deltaX, resizeStart.windowX + resizeStart.width - minWidth);
            newY = Math.min(resizeStart.windowY + deltaY, resizeStart.windowY + resizeStart.height - minHeight);
            break;
          default:
            newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStart.width + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, resizeStart.height + deltaY));
            break;
        }

        // Apply mobile-aware boundary constraints
        const margin = isMobile ? 10 : 0;
        const taskbarHeight = isMobile ? 60 : 48;
        newX = Math.max(margin, Math.min(window.innerWidth - newWidth - margin, newX));
        newY = Math.max(margin, Math.min(window.innerHeight - newHeight - taskbarHeight - margin, newY));

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

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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

  // Mobile-aware window positioning and sizing
  const isMobile = window.innerWidth <= 768;
  const taskbarHeight = isMobile ? 60 : 48;
  
  const windowStyle: React.CSSProperties = {
    position: 'absolute',
    left: windowState.isMaximized ? 0 : windowState.position.x,
    top: windowState.isMaximized ? 0 : windowState.position.y,
    width: windowState.isMaximized ? '100vw' : windowState.size.width,
    height: windowState.isMaximized ? `calc(100vh - ${taskbarHeight}px)` : windowState.size.height,
    zIndex: windowState.zIndex,
    // Ensure window doesn't exceed viewport on mobile
    maxWidth: isMobile ? `calc(100vw - 20px)` : 'none',
    maxHeight: isMobile ? `calc(100vh - ${taskbarHeight + 20}px)` : 'none',
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
        onTouchStart={handleTouchStart}
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
            onTouchStart={(e) => handleResizeTouchStart(e, 'top')}
            role="button"
            aria-label="Resize window from top"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-right"
            onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'right')}
            role="button"
            aria-label="Resize window from right"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-bottom"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'bottom')}
            role="button"
            aria-label="Resize window from bottom"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-left"
            onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'left')}
            role="button"
            aria-label="Resize window from left"
            tabIndex={0}
          />

          {/* Corner handles */}
          <div
            className="resize-handle resize-handle-top-left"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'top-left')}
            role="button"
            aria-label="Resize window from top-left"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-top-right"
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'top-right')}
            role="button"
            aria-label="Resize window from top-right"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-bottom-left"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'bottom-left')}
            role="button"
            aria-label="Resize window from bottom-left"
            tabIndex={0}
          />
          <div
            className="resize-handle resize-handle-bottom-right"
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'bottom-right')}
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
