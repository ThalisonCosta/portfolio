import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useDesktopStore, type WindowState } from '../../stores/useDesktopStore';
import { ApplicationManager } from '../ApplicationManager/ApplicationManager';
import './Window.css';

interface WindowProps {
  windowState: WindowState;
}

export const Window: React.FC<WindowProps> = ({ windowState }) => {
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
        const newX = e.clientX - dragStart.x;
        const newY = Math.max(0, e.clientY - dragStart.y);
        updateWindowPosition(windowState.id, { x: newX, y: newY });
      } else if (isResizing && !windowState.isMaximized) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(300, resizeStart.width + deltaX);
        const newHeight = Math.max(200, resizeStart.height + deltaY);
        updateWindowSize(windowState.id, { width: newWidth, height: newHeight });
      }
    },
    [
      isDragging,
      isResizing,
      windowState.id,
      windowState.isMaximized,
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
  const handleMaximize = () => maximizeWindow(windowState.id);

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

  return (
    <div
      ref={windowRef}
      className={`window ${windowState.isMaximized ? 'maximized' : ''}`}
      style={windowStyle}
      onClick={() => bringToFront(windowState.id)}
    >
      <div ref={headerRef} className="window-header" onMouseDown={handleMouseDown} onDoubleClick={handleMaximize}>
        <div className="window-title">{windowState.title}</div>
        <div className="window-controls">
          <button className="window-control minimize" onClick={handleMinimize} title="Minimize">
            ⎯
          </button>
          <button
            className="window-control maximize"
            onClick={handleMaximize}
            title={windowState.isMaximized ? 'Restore' : 'Maximize'}
          >
            {windowState.isMaximized ? '❐' : '□'}
          </button>
          <button className="window-control close" onClick={handleClose} title="Close">
            ✕
          </button>
        </div>
      </div>

      <div className="window-content">
        <ApplicationManager component={windowState.component} windowId={windowState.id} />
      </div>

      {!windowState.isMaximized && <div className="window-resize-handle" onMouseDown={handleResizeMouseDown} />}
    </div>
  );
};
