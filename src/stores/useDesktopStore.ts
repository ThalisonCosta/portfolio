import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SystemSettings } from '../types/settings.types';
import { DEFAULT_SETTINGS } from '../types/settings.types';

/**
 * Represents the state of a window in the desktop environment
 */
export interface WindowState {
  /** Unique identifier for the window */
  id: string;
  /** Display title shown in the window title bar */
  title: string;
  /** Component name to render inside the window */
  component: string;
  /** Whether the window is currently open */
  isOpen: boolean;
  /** Whether the window is minimized to the taskbar */
  isMinimized: boolean;
  /** Whether the window is maximized to full screen */
  isMaximized: boolean;
  /** Whether the window can be resized */
  isResizable?: boolean;
  /** Current position of the window on screen */
  position: { x: number; y: number };
  /** Current size dimensions of the window */
  size: { width: number; height: number };
  /** Z-index for window stacking order */
  zIndex: number;
  /** Optional file path for file-based applications */
  filePath?: string;
}

/**
 * Represents a file or folder in the virtual file system
 */
export interface FileSystemItem {
  /** Unique identifier for the file/folder */
  id: string;
  /** Display name of the file/folder */
  name: string;
  /** Type of the item - file or folder */
  type: 'file' | 'folder';
  /** Full path to the item */
  path: string;
  /** Icon identifier for display (legacy emoji support) */
  icon: string;
  /** Path to icon image file */
  iconPath?: string;
  /** File content (only for files) */
  content?: string;
  /** Child items (only for folders) */
  children?: FileSystemItem[];
  /** Position on desktop (for desktop items) */
  position?: { x: number; y: number };
}

/**
 * State interface for the desktop store
 */
interface DesktopState {
  /** Array of currently open windows */
  windows: WindowState[];
  /** Virtual file system structure */
  fileSystem: FileSystemItem[];
  /** Current active directory path */
  currentPath: string;
  /** Array of currently selected item IDs */
  selectedItems: string[];
  /** Next available z-index for new windows */
  nextZIndex: number;
  /** Current theme mode */
  theme: 'light' | 'dark';
  /** Current wallpaper image path */
  wallpaper: string;
  /** Whether a drag operation is in progress */
  isDragging: boolean;
  /** ID of the item currently being dragged */
  draggedItem: string | null;
  /** Whether the start menu is currently open */
  isStartMenuOpen: boolean;
  /** Whether the screensaver (Snake game) is currently active */
  isScreensaverActive: boolean;
  /** Clipboard contents */
  clipboard: {
    items: FileSystemItem[];
    operation: 'copy' | 'cut' | null;
  };
  /** System settings */
  settings: SystemSettings;
  /** RGB timer interval ID */
  rgbTimerInterval: NodeJS.Timeout | null;
}

/**
 * Actions interface for the desktop store
 */
interface DesktopActions {
  /** Opens a new window with the specified configuration */
  openWindow: (windowConfig: Omit<WindowState, 'id' | 'zIndex' | 'isOpen'>) => void;
  /** Closes a window by its ID */
  closeWindow: (id: string) => void;
  /** Minimizes or restores a window by its ID */
  minimizeWindow: (id: string) => void;
  /** Maximizes or restores a window by its ID */
  maximizeWindow: (id: string) => void;
  /** Updates the position of a window */
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  /** Updates the size of a window */
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  /** Brings a window to the front of the z-order */
  bringToFront: (id: string) => void;
  /** Sets the current active directory path */
  setCurrentPath: (path: string) => void;
  /** Sets the currently selected items */
  setSelectedItems: (items: string[]) => void;
  /** Adds an item to the selection */
  addSelectedItem: (item: string) => void;
  /** Removes an item from the selection */
  removeSelectedItem: (item: string) => void;
  /** Clears all selected items */
  clearSelection: () => void;
  /** Sets the desktop theme */
  setTheme: (theme: 'light' | 'dark') => void;
  /** Sets the desktop wallpaper */
  setWallpaper: (wallpaper: string) => void;
  /** Initializes the file system with default structure */
  initializeFileSystem: () => void;
  /** Updates the position of a desktop icon */
  updateIconPosition: (id: string, position: { x: number; y: number }) => void;
  /** Sets the dragging state and optional dragged item */
  setDragging: (isDragging: boolean, itemId?: string) => void;
  /** Toggles the start menu open/closed state */
  toggleStartMenu: () => void;
  /** Closes the start menu */
  closeStartMenu: () => void;
  /** Activates the screensaver (Snake game) */
  activateScreensaver: () => void;
  /** Deactivates the screensaver (Snake game) */
  deactivateScreensaver: () => void;
  /** Creates a new file in the file system */
  createFile: (path: string, name: string, content?: string) => boolean;
  /** Creates a new folder in the file system */
  createFolder: (path: string, name: string) => boolean;
  /** Removes a file or folder from the file system */
  removeFileSystemItem: (path: string) => boolean;
  /** Renames a file or folder in the file system */
  renameFileSystemItem: (path: string, newName: string) => boolean;
  /** Updates the content of a file */
  updateFileContent: (path: string, content: string) => boolean;
  /** Saves file with new name and location */
  saveFileAs: (folderPath: string, fileName: string, content: string) => boolean;
  /** Copies items to clipboard */
  copyToClipboard: (paths: string[]) => void;
  /** Cuts items to clipboard */
  cutToClipboard: (paths: string[]) => void;
  /** Pastes items from clipboard to target path */
  pasteFromClipboard: (targetPath: string) => boolean;
  /** Clears the clipboard */
  clearClipboard: () => void;
  /** Checks if clipboard has items */
  hasClipboardItems: () => boolean;
  /** Updates system settings */
  updateSettings: (settings: Partial<SystemSettings>) => void;
  /** Starts RGB timer */
  startRGBTimer: () => void;
  /** Stops RGB timer */
  stopRGBTimer: () => void;
  /** Gets current background style */
  getBackgroundStyle: () => string;
}

const defaultFileSystem: FileSystemItem[] = [
  {
    id: 'desktop',
    name: 'Desktop',
    type: 'folder',
    path: '/Desktop',
    icon: 'folder',
    children: [
      {
        id: 'about-me',
        name: 'About.txt',
        type: 'file',
        path: '/Desktop/About.txt',
        icon: 'text',
        content: "Welcome to my portfolio! I'm a passionate developer...",
        position: { x: 100, y: 100 },
      },
      {
        id: 'contact',
        name: 'Contact.lnk',
        type: 'file',
        path: '/Desktop/Contact.lnk',
        icon: 'link',
        position: { x: 300, y: 100 },
      },
      {
        id: 'about',
        name: 'About.lnk',
        type: 'file',
        path: '/Desktop/About.lnk',
        icon: 'link',
        position: { x: 200, y: 100 },
      },
      {
        id: 'text-editor-app',
        name: 'Text Editor',
        type: 'file',
        path: '/Desktop/Text Editor.app',
        icon: 'app',
        content: 'TextEditor',
        position: { x: 100, y: 200 },
      },
      {
        id: 'settings-app',
        name: 'Settings',
        type: 'file',
        path: '/Desktop/Settings.app',
        icon: 'app',
        content: 'SettingsApp',
        position: { x: 200, y: 200 },
      },
      {
        id: 'test-md-file',
        name: 'Test.md',
        type: 'file',
        path: '/Desktop/Test.md',
        icon: 'markdown',
        content:
          '# Test Markdown File\\n\\nThis is a test markdown file to verify the system works correctly.\\n\\n## Features\\n\\n- **Bold text**\\n- *Italic text*\\n- [Links](https://example.com)\\n\\n```javascript\\nconsole.log(\"Hello, World!\");\\n```\\n\\n> This is a blockquote\\n\\n---\\n\\nEnd of test file.',
        position: { x: 400, y: 100 },
      },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    type: 'folder',
    path: '/Projects',
    icon: 'folder',
    children: [
      {
        id: 'web-dev',
        name: 'Web Development',
        type: 'folder',
        path: '/Projects/Web Development',
        icon: 'folder',
        children: [],
      },
      {
        id: 'mobile-apps',
        name: 'Mobile Apps',
        type: 'folder',
        path: '/Projects/Mobile Apps',
        icon: 'folder',
        children: [],
      },
    ],
  },
  {
    id: 'documents',
    name: 'Documents',
    type: 'folder',
    path: '/Documents',
    icon: 'folder',
    children: [
      {
        id: 'skills',
        name: 'Skills.md',
        type: 'file',
        path: '/Documents/Skills.md',
        icon: 'markdown',
        content:
          '# Technical Skills\n\n## Frontend\n- React/TypeScript\n- JavaScript/HTML/CSS\n\n## Backend\n- Node.js\n- Python\n\n## Tools\n- Git/GitHub\n- Docker',
      },
    ],
  },
];

export const useDesktopStore = create<DesktopState & DesktopActions>()(
  devtools(
    persist(
      (set, get) => ({
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
        isScreensaverActive: false,
        clipboard: {
          items: [],
          operation: null,
        },
        settings: DEFAULT_SETTINGS,
        rgbTimerInterval: null,

        openWindow: (windowConfig) => {
          const { nextZIndex } = get();
          const newWindow: WindowState = {
            ...windowConfig,
            id: `window-${Date.now()}-${Math.random()}`,
            isOpen: true,
            zIndex: nextZIndex,
          };

          set((state) => ({
            windows: [...state.windows, newWindow],
            nextZIndex: nextZIndex + 1,
          }));
        },

        closeWindow: (id) => {
          set((state) => ({
            windows: state.windows.filter((window) => window.id !== id),
          }));
        },

        minimizeWindow: (id) => {
          set((state) => ({
            windows: state.windows.map((window) =>
              window.id === id ? { ...window, isMinimized: !window.isMinimized } : window
            ),
          }));
        },

        maximizeWindow: (id) => {
          set((state) => ({
            windows: state.windows.map((window) =>
              window.id === id ? { ...window, isMaximized: !window.isMaximized } : window
            ),
          }));
        },

        updateWindowPosition: (id, position) => {
          set((state) => ({
            windows: state.windows.map((window) => (window.id === id ? { ...window, position } : window)),
          }));
        },

        updateWindowSize: (id, size) => {
          set((state) => ({
            windows: state.windows.map((window) => (window.id === id ? { ...window, size } : window)),
          }));
        },

        bringToFront: (id) => {
          const { nextZIndex } = get();
          set((state) => ({
            windows: state.windows.map((window) => (window.id === id ? { ...window, zIndex: nextZIndex } : window)),
            nextZIndex: nextZIndex + 1,
          }));
        },

        setCurrentPath: (path) => set({ currentPath: path }),

        setSelectedItems: (items) => set({ selectedItems: items }),

        addSelectedItem: (item) => {
          set((state) => ({
            selectedItems: [...state.selectedItems, item],
          }));
        },

        removeSelectedItem: (item) => {
          set((state) => ({
            selectedItems: state.selectedItems.filter((i) => i !== item),
          }));
        },

        clearSelection: () => set({ selectedItems: [] }),

        setTheme: (theme) => set({ theme }),

        setWallpaper: (wallpaper) => set({ wallpaper }),

        initializeFileSystem: () => set({ fileSystem: defaultFileSystem }),

        updateIconPosition: (id, position) => {
          set((state) => {
            const ICON_SIZE = 80;
            const COLLISION_THRESHOLD = 60;

            const checkCollision = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
              const distance = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
              return distance < COLLISION_THRESHOLD;
            };

            const findSafePosition = (
              desiredPos: { x: number; y: number },
              excludeId: string,
              items: FileSystemItem[]
            ) => {
              // eslint-disable-next-line prefer-const
              let safePos = { ...desiredPos };
              let attempts = 0;
              const maxAttempts = 20;

              while (attempts < maxAttempts) {
                const hasCollision = items.some(
                  (item) => item.id !== excludeId && item.position && checkCollision(safePos, item.position)
                );

                if (!hasCollision) {
                  return safePos;
                }

                safePos.y += ICON_SIZE + 10;
                attempts++;
              }

              return safePos;
            };

            const updatedFileSystem = state.fileSystem.map((folder) => {
              if (folder.children) {
                const desktopItems = folder.children;
                const draggedItem = desktopItems.find((item) => item.id === id);

                if (!draggedItem) return folder;

                const otherItems = desktopItems.filter((item) => item.id !== id);
                const collisionItem = otherItems.find(
                  (item) => item.position && checkCollision(position, item.position)
                );

                let updatedChildren = [...desktopItems];

                if (collisionItem && collisionItem.position) {
                  const newCollisionPosition = findSafePosition(
                    { x: collisionItem.position.x, y: collisionItem.position.y + ICON_SIZE + 10 },
                    collisionItem.id,
                    otherItems.filter((item) => item.id !== collisionItem.id)
                  );

                  updatedChildren = updatedChildren.map((item) => {
                    if (item.id === collisionItem.id) {
                      return { ...item, position: newCollisionPosition };
                    }
                    if (item.id === id) {
                      return { ...item, position };
                    }
                    return item;
                  });
                } else {
                  updatedChildren = updatedChildren.map((item) => (item.id === id ? { ...item, position } : item));
                }

                return {
                  ...folder,
                  children: updatedChildren,
                };
              }
              return folder;
            });

            return { fileSystem: updatedFileSystem };
          });
        },

        setDragging: (isDragging, itemId) => {
          set({ isDragging, draggedItem: itemId || null });
        },

        toggleStartMenu: () => {
          set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen }));
        },

        closeStartMenu: () => {
          set({ isStartMenuOpen: false });
        },

        activateScreensaver: () => {
          set({ isScreensaverActive: true, isStartMenuOpen: false });
        },

        deactivateScreensaver: () => {
          set({ isScreensaverActive: false });
        },

        createFile: (path, name, content = '') => {
          // Normalize path by removing trailing slashes
          const normalizedPath = path.replace(/\/+$/, '') || '/';

          // Helper function to find next available desktop position
          const findNextDesktopPosition = (existingItems: FileSystemItem[]): { x: number; y: number } => {
            const ICON_SIZE = 80;
            const MARGIN = 20;
            const START_X = 100;
            const START_Y = 100;
            const MAX_COLUMNS = 8;

            const usedPositions = existingItems.filter((item) => item.position).map((item) => item.position!);

            for (let row = 0; row < 10; row++) {
              for (let col = 0; col < MAX_COLUMNS; col++) {
                const x = START_X + col * (ICON_SIZE + MARGIN);
                const y = START_Y + row * (ICON_SIZE + MARGIN);

                const isOccupied = usedPositions.some(
                  (pos) => Math.abs(pos.x - x) < ICON_SIZE && Math.abs(pos.y - y) < ICON_SIZE
                );

                if (!isOccupied) {
                  return { x, y };
                }
              }
            }

            return { x: START_X, y: START_Y };
          };

          // Helper function to get file icon based on extension
          const getFileIcon = (fileName: string): string => {
            const ext = fileName.split('.').pop()?.toLowerCase();
            switch (ext) {
              case 'txt':
                return 'text';
              case 'md':
                return 'markdown';
              case 'js':
              case 'ts':
                return 'code';
              case 'html':
              case 'css':
                return 'web';
              case 'png':
              case 'jpg':
              case 'jpeg':
              case 'gif':
                return 'image';
              default:
                return 'file';
            }
          };

          // Helper function to update file system recursively
          const updateFileSystemRecursively = (items: FileSystemItem[], targetPath: string): FileSystemItem[] =>
            items.map((item) => {
              if (item.path === targetPath && item.type === 'folder') {
                // Check if file already exists
                const fileExists = item.children?.some((child) => child.name === name);
                if (fileExists) {
                  return item;
                }

                const newFile: FileSystemItem = {
                  id: `file-${Date.now()}-${Math.random()}`,
                  name,
                  type: 'file',
                  path: `${targetPath}/${name}`,
                  icon: getFileIcon(name),
                  content,
                  position: targetPath === '/Desktop' ? findNextDesktopPosition(item.children || []) : undefined,
                };

                success = true;
                return {
                  ...item,
                  children: [...(item.children || []), newFile],
                };
              }

              if (item.children && targetPath.startsWith(`${item.path}/`)) {
                return {
                  ...item,
                  children: updateFileSystemRecursively(item.children, targetPath),
                };
              }

              return item;
            });

          let success = false;

          set((state) => ({
            fileSystem: updateFileSystemRecursively(state.fileSystem, normalizedPath),
          }));

          return success;
        },

        createFolder: (path, name) => {
          // Normalize path by removing trailing slashes
          const normalizedPath = path.replace(/\/+$/, '') || '/';

          // Helper function to find next available desktop position
          const findNextDesktopPosition = (existingItems: FileSystemItem[]): { x: number; y: number } => {
            const ICON_SIZE = 80;
            const MARGIN = 20;
            const START_X = 100;
            const START_Y = 100;
            const MAX_COLUMNS = 8;

            const usedPositions = existingItems.filter((item) => item.position).map((item) => item.position!);

            for (let row = 0; row < 10; row++) {
              for (let col = 0; col < MAX_COLUMNS; col++) {
                const x = START_X + col * (ICON_SIZE + MARGIN);
                const y = START_Y + row * (ICON_SIZE + MARGIN);

                const isOccupied = usedPositions.some(
                  (pos) => Math.abs(pos.x - x) < ICON_SIZE && Math.abs(pos.y - y) < ICON_SIZE
                );

                if (!isOccupied) {
                  return { x, y };
                }
              }
            }

            return { x: START_X, y: START_Y };
          };

          // Helper function to update file system recursively
          const updateFileSystemRecursively = (items: FileSystemItem[], targetPath: string): FileSystemItem[] =>
            items.map((item) => {
              if (item.path === targetPath && item.type === 'folder') {
                // Check if folder already exists
                const folderExists = item.children?.some((child) => child.name === name);
                if (folderExists) {
                  return item;
                }

                const newFolder: FileSystemItem = {
                  id: `folder-${Date.now()}-${Math.random()}`,
                  name,
                  type: 'folder',
                  path: `${targetPath}/${name}`,
                  icon: 'folder',
                  children: [],
                  position: targetPath === '/Desktop' ? findNextDesktopPosition(item.children || []) : undefined,
                };

                success = true;
                return {
                  ...item,
                  children: [...(item.children || []), newFolder],
                };
              }

              if (item.children && targetPath.startsWith(`${item.path}/`)) {
                return {
                  ...item,
                  children: updateFileSystemRecursively(item.children, targetPath),
                };
              }

              return item;
            });

          let success = false;

          set((state) => ({
            fileSystem: updateFileSystemRecursively(state.fileSystem, normalizedPath),
          }));

          return success;
        },

        removeFileSystemItem: (path) => {
          let success = false;

          set((state) => {
            const removeFromFolder = (items: FileSystemItem[]): FileSystemItem[] =>
              items.filter((item) => {
                if (item.path === path) {
                  success = true;
                  return false;
                }
                if (item.children) {
                  item.children = removeFromFolder(item.children);
                }
                return true;
              });

            const updatedFileSystem = removeFromFolder(state.fileSystem);
            return {
              fileSystem: updatedFileSystem,
            };
          });

          return success;
        },

        renameFileSystemItem: (path, newName) => {
          // Validate new name
          if (!newName.trim()) {
            return false;
          }

          let success = false;

          set((state) => {
            const renameInFolder = (items: FileSystemItem[]): FileSystemItem[] =>
              items.map((item) => {
                if (item.path === path) {
                  // Check if sibling with same name already exists
                  const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
                  const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;

                  // Get parent folder
                  const parentFolder = state.fileSystem.find((f) => f.path === parentPath && f.type === 'folder');
                  const siblings = parentFolder?.children || [];

                  // Check for name conflict (excluding current item)
                  const nameExists = siblings.some((sibling) => sibling.name === newName && sibling.id !== item.id);

                  if (nameExists) {
                    return item; // Don't rename if name already exists
                  }

                  success = true;

                  // Create updated item with new name and path
                  const updatedItem = {
                    ...item,
                    name: newName,
                    path: newPath,
                  };

                  // If it's a folder, update all children paths recursively
                  if (item.type === 'folder' && item.children) {
                    const updateChildrenPaths = (
                      children: FileSystemItem[],
                      oldParentPath: string,
                      newParentPath: string
                    ): FileSystemItem[] =>
                      children.map((child) => ({
                        ...child,
                        path: child.path.replace(oldParentPath, newParentPath),
                        children: child.children
                          ? updateChildrenPaths(child.children, oldParentPath, newParentPath)
                          : undefined,
                      }));

                    updatedItem.children = updateChildrenPaths(item.children, path, newPath);
                  }

                  return updatedItem;
                }

                // Recursively search in children
                if (item.children) {
                  return {
                    ...item,
                    children: renameInFolder(item.children),
                  };
                }

                return item;
              });

            const updatedFileSystem = renameInFolder(state.fileSystem);
            return {
              fileSystem: updatedFileSystem,
            };
          });

          return success;
        },

        copyToClipboard: (paths) => {
          const state = get();

          // Helper function to find items by path
          const findItemsByPaths = (fileSystemItems: FileSystemItem[], targetPaths: string[]): FileSystemItem[] => {
            const foundItems: FileSystemItem[] = [];

            const searchInItems = (items: FileSystemItem[]) => {
              for (const item of items) {
                if (targetPaths.includes(item.path)) {
                  foundItems.push({ ...item });
                }
                if (item.children) {
                  searchInItems(item.children);
                }
              }
            };

            searchInItems(fileSystemItems);
            return foundItems;
          };

          const foundItems = findItemsByPaths(state.fileSystem, paths);

          set((state) => ({
            ...state,
            clipboard: {
              items: foundItems,
              operation: 'copy',
            },
          }));
        },

        cutToClipboard: (paths) => {
          const state = get();

          // Helper function to find items by path
          const findItemsByPaths = (fileSystemItems: FileSystemItem[], targetPaths: string[]): FileSystemItem[] => {
            const foundItems: FileSystemItem[] = [];

            const searchInItems = (items: FileSystemItem[]) => {
              for (const item of items) {
                if (targetPaths.includes(item.path)) {
                  foundItems.push({ ...item });
                }
                if (item.children) {
                  searchInItems(item.children);
                }
              }
            };

            searchInItems(fileSystemItems);
            return foundItems;
          };

          const foundItems = findItemsByPaths(state.fileSystem, paths);

          set((state) => ({
            ...state,
            clipboard: {
              items: foundItems,
              operation: 'cut',
            },
          }));
        },

        pasteFromClipboard: (targetPath) => {
          const state = get();
          const { clipboard } = state;

          if (!clipboard.items.length || !clipboard.operation) {
            return false;
          }

          let success = false;

          // Helper function to generate unique name if conflict exists
          const generateUniqueName = (baseName: string, existingNames: string[]): string => {
            if (!existingNames.includes(baseName)) {
              return baseName;
            }

            const nameParts = baseName.split('.');
            const extension = nameParts.length > 1 ? `.${nameParts.pop()}` : '';
            const nameWithoutExt = nameParts.join('.');

            let counter = 1;
            let newName = `${nameWithoutExt} (${counter})${extension}`;

            while (existingNames.includes(newName)) {
              counter++;
              newName = `${nameWithoutExt} (${counter})${extension}`;
            }

            return newName;
          };

          // Helper function to find next available desktop position
          const findNextDesktopPosition = (existingItems: FileSystemItem[]): { x: number; y: number } => {
            const ICON_SIZE = 80;
            const MARGIN = 20;
            const START_X = 100;
            const START_Y = 100;
            const MAX_COLUMNS = 8;

            const usedPositions = existingItems.filter((item) => item.position).map((item) => item.position!);

            for (let row = 0; row < 10; row++) {
              for (let col = 0; col < MAX_COLUMNS; col++) {
                const x = START_X + col * (ICON_SIZE + MARGIN);
                const y = START_Y + row * (ICON_SIZE + MARGIN);

                const isOccupied = usedPositions.some(
                  (pos) => Math.abs(pos.x - x) < ICON_SIZE && Math.abs(pos.y - y) < ICON_SIZE
                );

                if (!isOccupied) {
                  return { x, y };
                }
              }
            }

            return { x: START_X, y: START_Y };
          };

          set((state) => {
            const pasteToFolder = (items: FileSystemItem[]): FileSystemItem[] =>
              items.map((item) => {
                if (item.path === targetPath && item.type === 'folder') {
                  const existingNames = item.children?.map((child) => child.name) || [];
                  const newChildren = [...(item.children || [])];

                  // Add clipboard items to target folder
                  for (const clipboardItem of clipboard.items) {
                    const uniqueName = generateUniqueName(clipboardItem.name, existingNames);
                    const newPath = targetPath === '/' ? `/${uniqueName}` : `${targetPath}/${uniqueName}`;

                    const newItem: FileSystemItem = {
                      ...clipboardItem,
                      id: `${clipboardItem.type}-${Date.now()}-${Math.random()}`,
                      name: uniqueName,
                      path: newPath,
                      position: targetPath === '/Desktop' ? findNextDesktopPosition(newChildren) : undefined,
                    };

                    // If it's a folder, update all children paths recursively
                    if (newItem.type === 'folder' && newItem.children) {
                      const updateChildrenPaths = (
                        children: FileSystemItem[],
                        oldParentPath: string,
                        newParentPath: string
                      ): FileSystemItem[] =>
                        children.map((child) => ({
                          ...child,
                          id: `${child.type}-${Date.now()}-${Math.random()}`,
                          path: child.path.replace(oldParentPath, newParentPath),
                          children: child.children
                            ? updateChildrenPaths(child.children, oldParentPath, newParentPath)
                            : undefined,
                        }));

                      newItem.children = updateChildrenPaths(newItem.children, clipboardItem.path, newPath);
                    }

                    newChildren.push(newItem);
                    existingNames.push(uniqueName);
                  }

                  success = true;
                  return {
                    ...item,
                    children: newChildren,
                  };
                }

                if (item.children && targetPath.startsWith(`${item.path}/`)) {
                  return {
                    ...item,
                    children: pasteToFolder(item.children),
                  };
                }

                return item;
              });

            const newFileSystem = pasteToFolder(state.fileSystem);

            // If it was a cut operation, remove original items
            let finalFileSystem = newFileSystem;
            if (clipboard.operation === 'cut' && success) {
              const removeFromFolder = (items: FileSystemItem[]): FileSystemItem[] =>
                items.filter((item) => {
                  const shouldRemove = clipboard.items.some((clipItem) => clipItem.path === item.path);
                  if (shouldRemove) {
                    return false;
                  }
                  if (item.children) {
                    item.children = removeFromFolder(item.children);
                  }
                  return true;
                });

              finalFileSystem = removeFromFolder(newFileSystem);
            }

            return {
              ...state,
              fileSystem: finalFileSystem,
              clipboard: success && clipboard.operation === 'cut' ? { items: [], operation: null } : state.clipboard,
            };
          });

          return success;
        },

        updateFileContent: (path, content) => {
          let success = false;

          const updateFileSystemRecursively = (items: FileSystemItem[]): FileSystemItem[] =>
            items.map((item) => {
              if (item.path === path && item.type === 'file') {
                success = true;
                return {
                  ...item,
                  content,
                };
              }

              if (item.children) {
                return {
                  ...item,
                  children: updateFileSystemRecursively(item.children),
                };
              }

              return item;
            });

          set((state) => ({
            fileSystem: updateFileSystemRecursively(state.fileSystem),
          }));

          return success;
        },

        saveFileAs: (folderPath, fileName, content) => {
          // Normalize folder path
          const normalizedFolderPath = folderPath.replace(/\/+$/, '') || '/';
          const fullFilePath = `${normalizedFolderPath}/${fileName}`;

          let success = false;

          // Helper function to get file icon based on extension
          const getFileIcon = (fileName: string): string => {
            const extension = fileName.split('.').pop()?.toLowerCase();
            switch (extension) {
              case 'txt':
                return 'text';
              case 'html':
              case 'htm':
                return 'html';
              case 'md':
              case 'markdown':
                return 'markdown';
              case 'js':
              case 'jsx':
                return 'javascript';
              case 'css':
                return 'css';
              case 'json':
                return 'json';
              default:
                return 'text';
            }
          };

          // Helper function to find next available desktop position
          const findNextDesktopPosition = (existingItems: FileSystemItem[]): { x: number; y: number } => {
            const ICON_SIZE = 80;
            const MARGIN = 20;
            const START_X = 100;
            const START_Y = 300; // Start below existing icons
            const MAX_COLUMNS = 8;

            const usedPositions = existingItems.filter((item) => item.position).map((item) => item.position!);

            for (let row = 0; row < 10; row++) {
              for (let col = 0; col < MAX_COLUMNS; col++) {
                const x = START_X + col * (ICON_SIZE + MARGIN);
                const y = START_Y + row * (ICON_SIZE + MARGIN);

                const isOccupied = usedPositions.some(
                  (pos) => Math.abs(pos.x - x) < ICON_SIZE && Math.abs(pos.y - y) < ICON_SIZE
                );

                if (!isOccupied) {
                  return { x, y };
                }
              }
            }

            return { x: START_X, y: START_Y };
          };

          // Helper function to update file system recursively
          const updateFileSystemRecursively = (items: FileSystemItem[], targetPath: string): FileSystemItem[] =>
            items.map((item) => {
              if (item.path === targetPath && item.type === 'folder') {
                // Check if file already exists
                const fileExists = item.children?.some((child) => child.name === fileName);
                if (fileExists) {
                  // Update existing file
                  const updatedChildren = item.children!.map((child) =>
                    child.name === fileName ? { ...child, content } : child
                  );
                  success = true;
                  return {
                    ...item,
                    children: updatedChildren,
                  };
                } else {
                  // Create new file
                  const newFile: FileSystemItem = {
                    id: `file-${Date.now()}-${Math.random()}`,
                    name: fileName,
                    type: 'file',
                    path: fullFilePath,
                    icon: getFileIcon(fileName),
                    content,
                    position: targetPath === '/Desktop' ? findNextDesktopPosition(item.children || []) : undefined,
                  };

                  success = true;
                  return {
                    ...item,
                    children: [...(item.children || []), newFile],
                  };
                }
              }

              if (item.children && targetPath.startsWith(`${item.path}/`)) {
                return {
                  ...item,
                  children: updateFileSystemRecursively(item.children, targetPath),
                };
              }

              return item;
            });

          set((state) => ({
            fileSystem: updateFileSystemRecursively(state.fileSystem, normalizedFolderPath),
          }));

          return success;
        },

        clearClipboard: () => {
          set((state) => ({
            ...state,
            clipboard: {
              items: [],
              operation: null,
            },
          }));
        },

        hasClipboardItems: () => {
          const state = get();
          return state.clipboard.items.length > 0;
        },

        updateSettings: (newSettings) => {
          const state = get();
          const updatedSettings = {
            ...state.settings,
            ...newSettings,
            desktop: { ...state.settings.desktop, ...newSettings.desktop },
            language: { ...state.settings.language, ...newSettings.language },
            datetime: { ...state.settings.datetime, ...newSettings.datetime },
          };

          set({ settings: updatedSettings });

          // Update RGB timer if settings changed
          if (newSettings.desktop?.rgbTimer) {
            if (updatedSettings.desktop.rgbTimer.enabled) {
              get().startRGBTimer();
            } else {
              get().stopRGBTimer();
            }
          }
        },

        startRGBTimer: () => {
          const { settings, rgbTimerInterval } = get();

          // Clear existing timer
          if (rgbTimerInterval) {
            clearInterval(rgbTimerInterval);
          }

          if (!settings.desktop.rgbTimer.enabled) return;

          let colorIndex = 0;
          const interval = setInterval(() => {
            const { settings } = get();
            const colors = settings.desktop.rgbTimer.colors;

            if (colors.length === 0) return;

            const currentColor = colors[colorIndex % colors.length];
            colorIndex++;

            set((state) => ({
              settings: {
                ...state.settings,
                desktop: {
                  ...state.settings.desktop,
                  backgroundColor: currentColor,
                },
              },
            }));
          }, settings.desktop.rgbTimer.interval);

          set({ rgbTimerInterval: interval });
        },

        stopRGBTimer: () => {
          const { rgbTimerInterval } = get();
          if (rgbTimerInterval) {
            clearInterval(rgbTimerInterval);
            set({ rgbTimerInterval: null });
          }
        },

        getBackgroundStyle: () => {
          const { settings } = get();
          const { desktop } = settings;

          if (desktop.gradient.enabled) {
            const { type, angle, colors } = desktop.gradient;
            const colorStops = colors.map((stop) => `${stop.color} ${stop.position}%`).join(', ');

            if (type === 'linear') {
              return `linear-gradient(${angle}deg, ${colorStops})`;
            } else {
              return `radial-gradient(circle, ${colorStops})`;
            }
          }

          return desktop.backgroundColor;
        },
      }),
      {
        name: 'desktop-store',
        partialize: (state) => ({
          settings: state.settings,
          theme: state.theme,
        }),
      }
    )
  )
);
