import { useDesktopStore } from '../useDesktopStore';

describe('useDesktopStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDesktopStore.setState({
      windows: [],
      fileSystem: [],
      currentPath: '/Desktop',
      selectedItems: [],
      nextZIndex: 1000,
      theme: 'light',
      wallpaper: '/wallpapers/default.jpg',
      isDragging: false,
      draggedItem: null,
      isStartMenuOpen: false,
    });
  });

  test('opens a window with correct properties', () => {
    const { openWindow } = useDesktopStore.getState();
    
    openWindow({
      title: 'Test Window',
      component: 'test',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
    });

    const { windows } = useDesktopStore.getState();
    expect(windows).toHaveLength(1);
    expect(windows[0]).toMatchObject({
      title: 'Test Window',
      component: 'test',
      isOpen: true,
      zIndex: 1000,
    });
  });

  test('closes a window', () => {
    const { openWindow, closeWindow } = useDesktopStore.getState();
    
    openWindow({
      title: 'Test Window',
      component: 'test',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
    });

    const windowId = useDesktopStore.getState().windows[0].id;
    closeWindow(windowId);

    const { windows } = useDesktopStore.getState();
    expect(windows).toHaveLength(0);
  });

  test('minimizes and restores a window', () => {
    const { openWindow, minimizeWindow } = useDesktopStore.getState();
    
    openWindow({
      title: 'Test Window',
      component: 'test',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
    });

    const windowId = useDesktopStore.getState().windows[0].id;
    
    // Minimize
    minimizeWindow(windowId);
    expect(useDesktopStore.getState().windows[0].isMinimized).toBe(true);
    
    // Restore
    minimizeWindow(windowId);
    expect(useDesktopStore.getState().windows[0].isMinimized).toBe(false);
  });

  test('maximizes and restores a window', () => {
    const { openWindow, maximizeWindow } = useDesktopStore.getState();
    
    openWindow({
      title: 'Test Window',
      component: 'test',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
    });

    const windowId = useDesktopStore.getState().windows[0].id;
    
    // Maximize
    maximizeWindow(windowId);
    expect(useDesktopStore.getState().windows[0].isMaximized).toBe(true);
    
    // Restore
    maximizeWindow(windowId);
    expect(useDesktopStore.getState().windows[0].isMaximized).toBe(false);
  });

  test('updates window position', () => {
    const { openWindow, updateWindowPosition } = useDesktopStore.getState();
    
    openWindow({
      title: 'Test Window',
      component: 'test',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
    });

    const windowId = useDesktopStore.getState().windows[0].id;
    updateWindowPosition(windowId, { x: 200, y: 150 });

    const { windows } = useDesktopStore.getState();
    expect(windows[0].position).toEqual({ x: 200, y: 150 });
  });

  test('updates window size', () => {
    const { openWindow, updateWindowSize } = useDesktopStore.getState();
    
    openWindow({
      title: 'Test Window',
      component: 'test',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
    });

    const windowId = useDesktopStore.getState().windows[0].id;
    updateWindowSize(windowId, { width: 500, height: 400 });

    const { windows } = useDesktopStore.getState();
    expect(windows[0].size).toEqual({ width: 500, height: 400 });
  });

  test('brings window to front', () => {
    const { openWindow, bringToFront } = useDesktopStore.getState();
    
    // Open two windows
    openWindow({
      title: 'Window 1',
      component: 'test1',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
    });
    
    openWindow({
      title: 'Window 2',
      component: 'test2',
      isMinimized: false,
      isMaximized: false,
      position: { x: 150, y: 150 },
      size: { width: 400, height: 300 },
    });

    const { windows } = useDesktopStore.getState();
    const window1Id = windows[0].id;
    const initialZIndex = windows[0].zIndex;

    bringToFront(window1Id);

    const updatedWindows = useDesktopStore.getState().windows;
    const window1 = updatedWindows.find(w => w.id === window1Id);
    
    expect(window1?.zIndex).toBeGreaterThan(initialZIndex);
  });

  test('manages selected items', () => {
    const { setSelectedItems, addSelectedItem, removeSelectedItem, clearSelection } = useDesktopStore.getState();
    
    // Set initial selection
    setSelectedItems(['item1', 'item2']);
    expect(useDesktopStore.getState().selectedItems).toEqual(['item1', 'item2']);
    
    // Add item
    addSelectedItem('item3');
    expect(useDesktopStore.getState().selectedItems).toEqual(['item1', 'item2', 'item3']);
    
    // Remove item
    removeSelectedItem('item2');
    expect(useDesktopStore.getState().selectedItems).toEqual(['item1', 'item3']);
    
    // Clear selection
    clearSelection();
    expect(useDesktopStore.getState().selectedItems).toEqual([]);
  });

  test('toggles and closes start menu', () => {
    const { toggleStartMenu, closeStartMenu } = useDesktopStore.getState();
    
    // Initial state should be false
    expect(useDesktopStore.getState().isStartMenuOpen).toBe(false);
    
    // Toggle open
    toggleStartMenu();
    expect(useDesktopStore.getState().isStartMenuOpen).toBe(true);
    
    // Toggle close
    toggleStartMenu();
    expect(useDesktopStore.getState().isStartMenuOpen).toBe(false);
    
    // Toggle open again
    toggleStartMenu();
    expect(useDesktopStore.getState().isStartMenuOpen).toBe(true);
    
    // Close directly
    closeStartMenu();
    expect(useDesktopStore.getState().isStartMenuOpen).toBe(false);
  });

  test('manages theme and wallpaper', () => {
    const { setTheme, setWallpaper } = useDesktopStore.getState();
    
    // Set theme
    setTheme('dark');
    expect(useDesktopStore.getState().theme).toBe('dark');
    
    // Set wallpaper
    setWallpaper('/custom-wallpaper.jpg');
    expect(useDesktopStore.getState().wallpaper).toBe('/custom-wallpaper.jpg');
  });

  test('initializes file system', () => {
    const { initializeFileSystem } = useDesktopStore.getState();
    
    initializeFileSystem();
    
    const { fileSystem } = useDesktopStore.getState();
    expect(fileSystem).toHaveLength(3);
    expect(fileSystem[0].name).toBe('Desktop');
    expect(fileSystem[1].name).toBe('Projects');
    expect(fileSystem[2].name).toBe('Documents');
  });

  test('manages dragging state', () => {
    const { setDragging } = useDesktopStore.getState();
    
    // Start dragging
    setDragging(true, 'item1');
    const state = useDesktopStore.getState();
    expect(state.isDragging).toBe(true);
    expect(state.draggedItem).toBe('item1');
    
    // Stop dragging
    setDragging(false);
    const finalState = useDesktopStore.getState();
    expect(finalState.isDragging).toBe(false);
    expect(finalState.draggedItem).toBe(null);
  });
});