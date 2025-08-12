import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface WindowState {
  id: string;
  title: string;
  component: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  icon: string;
  content?: string;
  children?: FileSystemItem[];
  position?: { x: number; y: number };
}

interface DesktopState {
  windows: WindowState[];
  fileSystem: FileSystemItem[];
  currentPath: string;
  selectedItems: string[];
  nextZIndex: number;
  theme: 'light' | 'dark';
  wallpaper: string;
  isDragging: boolean;
  draggedItem: string | null;
  isStartMenuOpen: boolean;
}

interface DesktopActions {
  openWindow: (windowConfig: Omit<WindowState, 'id' | 'zIndex' | 'isOpen'>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  bringToFront: (id: string) => void;
  setCurrentPath: (path: string) => void;
  setSelectedItems: (items: string[]) => void;
  addSelectedItem: (item: string) => void;
  removeSelectedItem: (item: string) => void;
  clearSelection: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setWallpaper: (wallpaper: string) => void;
  initializeFileSystem: () => void;
  updateIconPosition: (id: string, position: { x: number; y: number }) => void;
  setDragging: (isDragging: boolean, itemId?: string) => void;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
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
        name: 'About Me.txt',
        type: 'file',
        path: '/Desktop/About Me.txt',
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
    }),
    {
      name: 'desktop-store',
    }
  )
);
