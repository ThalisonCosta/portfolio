import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  /** Icon identifier for display */
  icon: string;
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
  /** Creates a new file in the file system */
  createFile: (path: string, name: string, content?: string) => boolean;
  /** Creates a new folder in the file system */
  createFolder: (path: string, name: string) => boolean;
  /** Removes a file or folder from the file system */
  removeFileSystemItem: (path: string) => boolean;
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
        id: 'resume',
        name: 'Resume.pdf',
        type: 'file',
        path: '/Desktop/Resume.pdf',
        icon: 'pdf',
        position: { x: 200, y: 100 },
      },
      {
        id: 'contact',
        name: 'Contact.lnk',
        type: 'file',
        path: '/Desktop/Contact.lnk',
        icon: 'link',
        position: { x: 300, y: 100 },
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
              const collisionItem = otherItems.find((item) => item.position && checkCollision(position, item.position));

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
            case 'pdf':
              return 'pdf';
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

        // Helper function to find folder recursively by path
        const findFolderByPath = (items: FileSystemItem[], targetPath: string): FileSystemItem | null => {
          for (const item of items) {
            if (item.path === targetPath && item.type === 'folder') {
              return item;
            }
            if (item.children && targetPath.startsWith(`${item.path}/`)) {
              const found = findFolderByPath(item.children, targetPath);
              if (found) return found;
            }
          }
          return null;
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

          return {
            fileSystem: removeFromFolder(state.fileSystem),
          };
        });

        return success;
      },
    }),
    {
      name: 'desktop-store',
    }
  )
);
