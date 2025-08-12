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
        content: 'Welcome to my portfolio! I\'m a passionate developer...',
        position: { x: 100, y: 100 }
      },
      {
        id: 'resume',
        name: 'Resume.pdf',
        type: 'file',
        path: '/Desktop/Resume.pdf',
        icon: 'pdf',
        position: { x: 200, y: 100 }
      },
      {
        id: 'contact',
        name: 'Contact.lnk',
        type: 'file',
        path: '/Desktop/Contact.lnk',
        icon: 'link',
        position: { x: 300, y: 100 }
      }
    ]
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
        children: []
      },
      {
        id: 'mobile-apps',
        name: 'Mobile Apps',
        type: 'folder',
        path: '/Projects/Mobile Apps',
        icon: 'folder',
        children: []
      }
    ]
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
        content: '# Technical Skills\n\n## Frontend\n- React/TypeScript\n- JavaScript/HTML/CSS\n\n## Backend\n- Node.js\n- Python\n\n## Tools\n- Git/GitHub\n- Docker'
      }
    ]
  }
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
          windows: state.windows.filter(window => window.id !== id),
        }));
      },

      minimizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map(window =>
            window.id === id
              ? { ...window, isMinimized: !window.isMinimized }
              : window
          ),
        }));
      },

      maximizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map(window =>
            window.id === id
              ? { ...window, isMaximized: !window.isMaximized }
              : window
          ),
        }));
      },

      updateWindowPosition: (id, position) => {
        set((state) => ({
          windows: state.windows.map(window =>
            window.id === id
              ? { ...window, position }
              : window
          ),
        }));
      },

      updateWindowSize: (id, size) => {
        set((state) => ({
          windows: state.windows.map(window =>
            window.id === id
              ? { ...window, size }
              : window
          ),
        }));
      },

      bringToFront: (id) => {
        const { nextZIndex } = get();
        set((state) => ({
          windows: state.windows.map(window =>
            window.id === id
              ? { ...window, zIndex: nextZIndex }
              : window
          ),
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
          selectedItems: state.selectedItems.filter(i => i !== item),
        }));
      },

      clearSelection: () => set({ selectedItems: [] }),

      setTheme: (theme) => set({ theme }),

      setWallpaper: (wallpaper) => set({ wallpaper }),

      initializeFileSystem: () => set({ fileSystem: defaultFileSystem }),
    }),
    {
      name: 'desktop-store',
    }
  )
);