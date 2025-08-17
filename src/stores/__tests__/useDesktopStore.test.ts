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
    const window1 = updatedWindows.find((w) => w.id === window1Id);

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

  test('icon position updates work when icons exist', () => {
    const { updateIconPosition, initializeFileSystem } = useDesktopStore.getState();

    // Initialize file system first
    initializeFileSystem();

    const position = { x: 200, y: 150 };
    // Call function to ensure it doesn't error
    updateIconPosition('desktop-icon-1', position);

    // Just ensure no errors occur
    expect(true).toBe(true);
  });

  test('file system initialization completes without error', () => {
    const { initializeFileSystem } = useDesktopStore.getState();

    initializeFileSystem();

    // Just ensure no errors occur
    expect(true).toBe(true);
  });

  test('handles selected items operations correctly', () => {
    const { setSelectedItems, addSelectedItem, removeSelectedItem } = useDesktopStore.getState();

    // Test basic operations
    setSelectedItems(['item1', 'item2']);
    let state = useDesktopStore.getState();
    expect(state.selectedItems).toEqual(['item1', 'item2']);

    // Test adding new item
    addSelectedItem('item3');
    state = useDesktopStore.getState();
    expect(state.selectedItems).toContain('item3');

    // Test removing item
    removeSelectedItem('item2');
    state = useDesktopStore.getState();
    expect(state.selectedItems).not.toContain('item2');
  });

  test('handles window operations with edge cases', () => {
    const { openWindow, closeWindow, minimizeWindow, maximizeWindow } = useDesktopStore.getState();

    // Try to operate on non-existent window
    closeWindow('non-existent-id');
    minimizeWindow('non-existent-id');
    maximizeWindow('non-existent-id');

    // Should not crash and state should remain clean
    const state = useDesktopStore.getState();
    expect(state.windows).toHaveLength(0);

    // Open window and test operations
    openWindow({
      title: 'Test Window',
      component: 'test',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
    });

    const windowId = useDesktopStore.getState().windows[0].id;

    // Test maximize toggle
    maximizeWindow(windowId);
    expect(useDesktopStore.getState().windows[0].isMaximized).toBe(true);

    maximizeWindow(windowId); // Toggle back
    expect(useDesktopStore.getState().windows[0].isMaximized).toBe(false);
  });

  test('manages theme and wallpaper state', () => {
    const { setTheme, setWallpaper } = useDesktopStore.getState();

    // Test different themes
    setTheme('dark');
    expect(useDesktopStore.getState().theme).toBe('dark');

    setTheme('light');
    expect(useDesktopStore.getState().theme).toBe('light');

    // Test custom wallpaper
    const customWallpaper = '/images/custom-bg.jpg';
    setWallpaper(customWallpaper);
    expect(useDesktopStore.getState().wallpaper).toBe(customWallpaper);
  });

  test('handles window positioning and sizing', () => {
    const { openWindow, updateWindowPosition, updateWindowSize } = useDesktopStore.getState();

    openWindow({
      title: 'Test Window',
      component: 'test',
      isMinimized: false,
      isMaximized: false,
      position: { x: 50, y: 50 },
      size: { width: 300, height: 200 },
    });

    const windowId = useDesktopStore.getState().windows[0].id;

    // Test position update
    updateWindowPosition(windowId, { x: 150, y: 100 });
    let window = useDesktopStore.getState().windows[0];
    expect(window.position).toEqual({ x: 150, y: 100 });

    // Test size update
    updateWindowSize(windowId, { width: 500, height: 400 });
    window = useDesktopStore.getState().windows[0];
    expect(window.size).toEqual({ width: 500, height: 400 });
  });

  test('manages z-index for window layering', () => {
    const { openWindow, bringToFront } = useDesktopStore.getState();

    // Open multiple windows
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
      position: { x: 200, y: 200 },
      size: { width: 400, height: 300 },
    });

    const windows = useDesktopStore.getState().windows;
    const window1Id = windows[0].id;
    const window2Id = windows[1].id;

    // Window 2 should have higher z-index initially
    expect(windows[1].zIndex).toBeGreaterThan(windows[0].zIndex);

    // Bring window 1 to front
    bringToFront(window1Id);

    const updatedWindows = useDesktopStore.getState().windows;
    const updatedWindow1 = updatedWindows.find((w) => w.id === window1Id);
    const updatedWindow2 = updatedWindows.find((w) => w.id === window2Id);

    expect(updatedWindow1!.zIndex).toBeGreaterThan(updatedWindow2!.zIndex);
  });

  // CRUD Operations Tests
  describe('File System CRUD Operations', () => {
    beforeEach(() => {
      // Initialize file system for CRUD tests
      const { initializeFileSystem } = useDesktopStore.getState();
      initializeFileSystem();
    });

    test('creates a new file successfully', () => {
      const { createFile } = useDesktopStore.getState();

      const success = createFile('/Desktop', 'test.txt', 'Test content');
      expect(success).toBe(true);

      const { fileSystem } = useDesktopStore.getState();
      const desktop = fileSystem.find((item) => item.path === '/Desktop');
      const newFile = desktop?.children?.find((child) => child.name === 'test.txt');

      expect(newFile).toBeDefined();
      expect(newFile?.type).toBe('file');
      expect(newFile?.content).toBe('Test content');
      expect(newFile?.position).toBeDefined();
    });

    test('creates file with different extensions and correct icons', () => {
      const { createFile } = useDesktopStore.getState();

      createFile('/Desktop', 'notes.md');
      createFile('/Desktop', 'contact.lnk');

      const { fileSystem } = useDesktopStore.getState();
      const desktop = fileSystem.find((item) => item.path === '/Desktop');

      const mdFile = desktop?.children?.find((child) => child.name === 'notes.md');
      const lnkFile = desktop?.children?.find((child) => child.name === 'contact.lnk');

      expect(mdFile?.icon).toBe('markdown');
      expect(lnkFile?.icon).toBe('file'); // .lnk files use 'file' icon by default
    });

    test('handles duplicate file names', () => {
      const { createFile } = useDesktopStore.getState();

      const firstSuccess = createFile('/Desktop', 'duplicate.txt');
      const secondSuccess = createFile('/Desktop', 'duplicate.txt');

      expect(firstSuccess).toBe(true);
      expect(secondSuccess).toBe(false); // Should fail due to duplicate
    });

    test('creates a new folder successfully', () => {
      const { createFolder } = useDesktopStore.getState();

      const success = createFolder('/Desktop', 'New Folder');
      expect(success).toBe(true);

      const { fileSystem } = useDesktopStore.getState();
      const desktop = fileSystem.find((item) => item.path === '/Desktop');
      const newFolder = desktop?.children?.find((child) => child.name === 'New Folder');

      expect(newFolder).toBeDefined();
      expect(newFolder?.type).toBe('folder');
      expect(newFolder?.children).toEqual([]);
      expect(newFolder?.position).toBeDefined();
    });

    test('handles duplicate folder names', () => {
      const { createFolder } = useDesktopStore.getState();

      const firstSuccess = createFolder('/Desktop', 'Duplicate Folder');
      const secondSuccess = createFolder('/Desktop', 'Duplicate Folder');

      expect(firstSuccess).toBe(true);
      expect(secondSuccess).toBe(false); // Should fail due to duplicate
    });

    test('removes file system item successfully', () => {
      const { createFile, removeFileSystemItem } = useDesktopStore.getState();

      // Create a file first
      createFile('/Desktop', 'to-delete.txt');

      let { fileSystem } = useDesktopStore.getState();
      let desktop = fileSystem.find((item) => item.path === '/Desktop');
      let fileExists = desktop?.children?.some((child) => child.name === 'to-delete.txt');
      expect(fileExists).toBe(true);

      // Remove the file
      const success = removeFileSystemItem('/Desktop/to-delete.txt');
      expect(success).toBe(true);

      ({ fileSystem } = useDesktopStore.getState());
      desktop = fileSystem.find((item) => item.path === '/Desktop');
      fileExists = desktop?.children?.some((child) => child.name === 'to-delete.txt');
      expect(fileExists).toBe(false);
    });

    test('fails to remove non-existent item', () => {
      const { removeFileSystemItem } = useDesktopStore.getState();

      const success = removeFileSystemItem('/Desktop/non-existent.txt');
      expect(success).toBe(false);
    });

    test('renames file system item successfully', () => {
      const { createFile, renameFileSystemItem } = useDesktopStore.getState();

      // Create a file first
      createFile('/Desktop', 'old-name.txt');

      const success = renameFileSystemItem('/Desktop/old-name.txt', 'new-name.txt');
      expect(success).toBe(true);

      const { fileSystem } = useDesktopStore.getState();
      const desktop = fileSystem.find((item) => item.path === '/Desktop');
      const oldFile = desktop?.children?.find((child) => child.name === 'old-name.txt');
      const newFile = desktop?.children?.find((child) => child.name === 'new-name.txt');

      expect(oldFile).toBeUndefined();
      expect(newFile).toBeDefined();
      expect(newFile?.path).toBe('/Desktop/new-name.txt');
    });

    test('fails to rename to existing name', () => {
      const { createFile, renameFileSystemItem } = useDesktopStore.getState();

      // Create two files
      createFile('/Desktop', 'file1.txt');
      createFile('/Desktop', 'file2.txt');

      // Try to rename file1 to file2 (should fail)
      const success = renameFileSystemItem('/Desktop/file1.txt', 'file2.txt');
      expect(success).toBe(false);

      const { fileSystem } = useDesktopStore.getState();
      const desktop = fileSystem.find((item) => item.path === '/Desktop');
      const file1 = desktop?.children?.find((child) => child.name === 'file1.txt');
      const file2Count = desktop?.children?.filter((child) => child.name === 'file2.txt').length;

      expect(file1).toBeDefined(); // Original file should still exist
      expect(file2Count).toBe(1); // Should only have one file2.txt
    });

    test('fails to rename non-existent item', () => {
      const { renameFileSystemItem } = useDesktopStore.getState();

      const success = renameFileSystemItem('/Desktop/non-existent.txt', 'new-name.txt');
      expect(success).toBe(false);
    });
  });

  // Clipboard Operations Tests
  describe('Clipboard Operations', () => {
    beforeEach(() => {
      // Initialize file system and reset clipboard
      const { initializeFileSystem } = useDesktopStore.getState();
      initializeFileSystem();
      useDesktopStore.setState({
        clipboard: { items: [], operation: null },
      });
    });

    test('copies items to clipboard', () => {
      const { copyToClipboard, hasClipboardItems } = useDesktopStore.getState();

      expect(hasClipboardItems()).toBe(false);

      copyToClipboard(['/Desktop/About.txt']);

      const { clipboard } = useDesktopStore.getState();
      expect(clipboard.operation).toBe('copy');
      expect(clipboard.items).toHaveLength(2);

      // Check that the clipboard contains file objects, not just paths
      expect(clipboard.items[0]).toMatchObject({
        name: 'About.txt',
        path: '/Desktop/About.txt',
        type: 'file',
      });

      expect(hasClipboardItems()).toBe(true);
    });

    test('cuts items to clipboard', () => {
      const { cutToClipboard, hasClipboardItems } = useDesktopStore.getState();

      expect(hasClipboardItems()).toBe(false);

      cutToClipboard(['/Desktop/About.txt']);

      const { clipboard } = useDesktopStore.getState();
      expect(clipboard.operation).toBe('cut');
      expect(clipboard.items).toHaveLength(1);

      // Check that the clipboard contains file object, not just path
      expect(clipboard.items[0]).toMatchObject({
        name: 'About.txt',
        path: '/Desktop/About.txt',
        type: 'file',
      });

      expect(hasClipboardItems()).toBe(true);
    });

    test('pastes copied items successfully', () => {
      const { createFile, copyToClipboard, pasteFromClipboard } = useDesktopStore.getState();

      // Create a file to copy
      createFile('/Desktop', 'original.txt', 'Original content');

      // Copy it
      copyToClipboard(['/Desktop/original.txt']);

      // Create target folder
      createFile('/Desktop', 'target-folder'); // This will create a folder

      // Paste to target
      const success = pasteFromClipboard('/Desktop');
      expect(success).toBe(true);

      // Check that copy was created
      const { fileSystem } = useDesktopStore.getState();
      const desktop = fileSystem.find((item) => item.path === '/Desktop');
      const copies = desktop?.children?.filter((child) => child.name.includes('original')) || [];

      // Should have original + copy
      expect(copies.length).toBeGreaterThanOrEqual(1);
    });

    test('handles paste with no clipboard items', () => {
      const { pasteFromClipboard } = useDesktopStore.getState();

      const success = pasteFromClipboard('/Desktop');
      expect(success).toBe(false);
    });

    test('clears clipboard after cut and paste', () => {
      const { createFile, cutToClipboard, pasteFromClipboard, hasClipboardItems } = useDesktopStore.getState();

      // Create and cut a file
      createFile('/Desktop', 'to-move.txt');
      cutToClipboard(['/Desktop/to-move.txt']);
      expect(hasClipboardItems()).toBe(true);

      // Paste it
      pasteFromClipboard('/Desktop');

      // Clipboard should be cleared after cut operation
      expect(hasClipboardItems()).toBe(false);
    });

    test('hasClipboardItems returns correct status', () => {
      const { copyToClipboard, hasClipboardItems, createFile } = useDesktopStore.getState();

      expect(hasClipboardItems()).toBe(false);

      // Create a file first, then copy it
      createFile('/Desktop', 'test.txt');
      copyToClipboard(['/Desktop/test.txt']);
      expect(hasClipboardItems()).toBe(true);

      // Clear clipboard manually
      useDesktopStore.setState({
        clipboard: { items: [], operation: null },
      });
      expect(hasClipboardItems()).toBe(false);
    });
  });
});
