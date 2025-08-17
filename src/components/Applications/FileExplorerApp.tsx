import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDesktopStore, type FileSystemItem } from '../../stores/useDesktopStore';
import { InputDialog } from '../InputDialog';
import { ConfirmDialog } from '../ConfirmDialog';
import { useContextMenu } from '../../hooks/useContextMenu';
import './FileExplorer/FileExplorer.css';

/** View modes for the file explorer */
export type ViewMode = 'grid' | 'list' | 'details';

/** Sort options for files */
export type SortBy = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

/** File operation types */
export type FileOperation = 'copy' | 'cut' | 'paste' | 'delete' | 'rename' | 'new-folder' | 'new-file';

/** File Explorer state interface */
interface FileExplorerState {
  currentPath: string;
  selectedItems: string[];
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  isRenaming: string | null;
  showNewFolderDialog: boolean;
  showNewFileDialog: boolean;
  showDeleteDialog: boolean;
  navigationHistory: string[];
  historyIndex: number;
  showSidebar: boolean;
  expandedFolders: Set<string>;
}

/**
 * Windows 11-style File Explorer application component.
 *
 * Features:
 * - Full file system navigation
 * - Multiple view modes (Grid, List, Details)
 * - File operations (Create, Rename, Delete, Copy, Paste)
 * - Drag & drop support
 * - Context menus
 * - Search and filtering
 * - Breadcrumb navigation
 * - Keyboard shortcuts
 */
export const FileExplorerApp: React.FC = () => {
  // Desktop store integration
  const {
    fileSystem,
    createFile,
    createFolder,
    removeFileSystemItem,
    renameFileSystemItem,
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
    clipboard,
  } = useDesktopStore();

  // Context menu integration
  const { showContextMenu } = useContextMenu();

  // File Explorer state
  const [state, setState] = useState<FileExplorerState>({
    currentPath: '/Desktop',
    selectedItems: [],
    viewMode: 'grid',
    sortBy: 'name',
    sortOrder: 'asc',
    searchQuery: '',
    isRenaming: null,
    showNewFolderDialog: false,
    showNewFileDialog: false,
    showDeleteDialog: false,
    navigationHistory: ['/Desktop'],
    historyIndex: 0,
    showSidebar: true,
    expandedFolders: new Set(['/Desktop']),
  });

  /**
   * Get current directory items
   */
  const currentDirectory = useMemo(() => {
    const findDirectory = (items: FileSystemItem[], path: string): FileSystemItem | null => {
      for (const item of items) {
        if (item.path === path && item.type === 'folder') {
          return item;
        }
        if (item.children && path.startsWith(`${item.path}/`)) {
          const found = findDirectory(item.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    return findDirectory(fileSystem, state.currentPath);
  }, [fileSystem, state.currentPath]);

  /**
   * Get filtered and sorted directory contents
   */
  const directoryContents = useMemo(() => {
    if (!currentDirectory?.children) return [];

    let items = [...currentDirectory.children];

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(query));
    }

    // Apply sorting
    items.sort((a, b) => {
      let comparison = 0;

      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type': {
          // Folders first, then by extension
          if (a.type !== b.type) {
            comparison = a.type === 'folder' ? -1 : 1;
          } else {
            const aExt = a.name.includes('.') ? a.name.split('.').pop() || '' : '';
            const bExt = b.name.includes('.') ? b.name.split('.').pop() || '' : '';
            comparison = aExt.localeCompare(bExt);
          }
          break;
        }
        case 'size': {
          // Folders are treated as 0 size
          const aSize = a.type === 'folder' ? 0 : a.content?.length || 0;
          const bSize = b.type === 'folder' ? 0 : b.content?.length || 0;
          comparison = aSize - bSize;
          break;
        }
        case 'date':
          // For now, use name as fallback since we don't have creation dates
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [currentDirectory, state.searchQuery, state.sortBy, state.sortOrder]);

  /**
   * Navigate to a specific path
   */
  const navigateToPath = useCallback((path: string) => {
    setState((prev) => {
      const newHistory = prev.navigationHistory.slice(0, prev.historyIndex + 1);
      newHistory.push(path);

      return {
        ...prev,
        currentPath: path,
        selectedItems: [],
        navigationHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  /**
   * Navigate back in history
   */
  const navigateBack = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          currentPath: prev.navigationHistory[newIndex],
          selectedItems: [],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  /**
   * Navigate forward in history
   */
  const navigateForward = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex < prev.navigationHistory.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          currentPath: prev.navigationHistory[newIndex],
          selectedItems: [],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  /**
   * Navigate up one level
   */
  const navigateUp = useCallback(() => {
    const parentPath = state.currentPath.split('/').slice(0, -1).join('/') || '/';
    if (parentPath !== state.currentPath) {
      navigateToPath(parentPath);
    }
  }, [state.currentPath, navigateToPath]);

  /**
   * Handle item selection
   */
  const handleItemSelect = useCallback((itemId: string, isMultiSelect: boolean = false) => {
    setState((prev) => {
      if (isMultiSelect) {
        const isSelected = prev.selectedItems.includes(itemId);
        return {
          ...prev,
          selectedItems: isSelected
            ? prev.selectedItems.filter((id) => id !== itemId)
            : [...prev.selectedItems, itemId],
        };
      }
      return {
        ...prev,
        selectedItems: [itemId],
      };
    });
  }, []);

  /**
   * Handle double-click on item (navigate or open)
   */
  const handleItemDoubleClick = useCallback(
    (item: FileSystemItem) => {
      if (item.type === 'folder') {
        navigateToPath(item.path);
        return;
      }
      // For files, could implement opening in appropriate app
    },
    [navigateToPath]
  );

  /**
   * Handle file operations
   */
  const handleFileOperation = useCallback(
    (operation: FileOperation, _itemPath?: string) => {
      switch (operation) {
        case 'new-folder':
          setState((prev) => ({ ...prev, showNewFolderDialog: true }));
          break;
        case 'new-file':
          setState((prev) => ({ ...prev, showNewFileDialog: true }));
          break;
        case 'delete':
          if (state.selectedItems.length > 0) {
            setState((prev) => ({ ...prev, showDeleteDialog: true }));
          }
          break;
        case 'copy':
          if (state.selectedItems.length > 0) {
            const selectedPaths = state.selectedItems
              .map((id) => directoryContents.find((item) => item.id === id)?.path)
              .filter(Boolean) as string[];
            copyToClipboard(selectedPaths);
          }
          break;
        case 'cut':
          if (state.selectedItems.length > 0) {
            const selectedPaths = state.selectedItems
              .map((id) => directoryContents.find((item) => item.id === id)?.path)
              .filter(Boolean) as string[];
            cutToClipboard(selectedPaths);
          }
          break;
        case 'paste':
          pasteFromClipboard(state.currentPath);
          break;
        case 'rename':
          if (state.selectedItems.length === 1) {
            setState((prev) => ({ ...prev, isRenaming: state.selectedItems[0] }));
          }
          break;
        default:
          // Handle unknown operations
          break;
      }
    },
    [state.selectedItems, state.currentPath, directoryContents, copyToClipboard, cutToClipboard, pasteFromClipboard]
  );

  /**
   * Get breadcrumb items from current path
   */
  const breadcrumbItems = useMemo(() => {
    const pathParts = state.currentPath.split('/').filter(Boolean);
    const items: Array<{ name: string; path: string }> = [{ name: 'Computer', path: '/' }];

    let currentPath = '';
    for (const part of pathParts) {
      currentPath += `/${part}`;
      items.push({ name: part, path: currentPath });
    }

    return items;
  }, [state.currentPath]);

  /**
   * Toggle folder expansion in the sidebar tree
   */
  const toggleFolderExpansion = useCallback((folderPath: string) => {
    setState((prev) => {
      const newExpanded = new Set(prev.expandedFolders);
      if (newExpanded.has(folderPath)) {
        newExpanded.delete(folderPath);
      } else {
        newExpanded.add(folderPath);
      }
      return { ...prev, expandedFolders: newExpanded };
    });
  }, []);

  /**
   * Get folder tree items for sidebar
   */
  const folderTreeItems = useMemo(() => {
    const buildTreeItems = (
      items: FileSystemItem[],
      level: number = 0
    ): Array<{ item: FileSystemItem; level: number; hasChildren: boolean }> => {
      const result: Array<{ item: FileSystemItem; level: number; hasChildren: boolean }> = [];

      const folders = items.filter((item) => item.type === 'folder').sort((a, b) => a.name.localeCompare(b.name));

      for (const folder of folders) {
        const hasChildren = (folder.children || []).some((child) => child.type === 'folder');
        result.push({ item: folder, level, hasChildren });

        if (state.expandedFolders.has(folder.path) && folder.children) {
          result.push(...buildTreeItems(folder.children, level + 1));
        }
      }

      return result;
    };

    return buildTreeItems(fileSystem);
  }, [fileSystem, state.expandedFolders]);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, showSidebar: !prev.showSidebar }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case 'c':
            event.preventDefault();
            handleFileOperation('copy');
            break;
          case 'x':
            event.preventDefault();
            handleFileOperation('cut');
            break;
          case 'v':
            event.preventDefault();
            handleFileOperation('paste');
            break;
          case 'a':
            event.preventDefault();
            setState((prev) => ({
              ...prev,
              selectedItems: directoryContents.map((item) => item.id),
            }));
            break;
          default:
            // Ignore other Ctrl key combinations
            break;
        }
      } else {
        switch (event.key) {
          case 'Delete':
            handleFileOperation('delete');
            break;
          case 'F2':
            handleFileOperation('rename');
            break;
          case 'Backspace':
            navigateUp();
            break;
          default:
            // Ignore other keys
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFileOperation, navigateUp, directoryContents]);

  return (
    <div className="file-explorer">
      {/* Toolbar */}
      <div className="file-explorer-toolbar">
        <div className="toolbar-section">
          <button className="toolbar-button" onClick={navigateBack} disabled={state.historyIndex === 0} title="Back">
            ◀
          </button>
          <button
            className="toolbar-button"
            onClick={navigateForward}
            disabled={state.historyIndex === state.navigationHistory.length - 1}
            title="Forward"
          >
            ▶
          </button>
          <button
            className="toolbar-button"
            onClick={navigateUp}
            disabled={state.currentPath === '/' || state.currentPath === ''}
            title="Up"
          >
            ⬆
          </button>
          <button
            className={`toolbar-button ${state.showSidebar ? 'active' : ''}`}
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            📁 Sidebar
          </button>
        </div>

        <div className="toolbar-section">
          <button className="toolbar-button" onClick={() => handleFileOperation('new-folder')} title="New Folder">
            📁+ New Folder
          </button>
          <button className="toolbar-button" onClick={() => handleFileOperation('new-file')} title="New File">
            📄+ New File
          </button>
        </div>

        <div className="toolbar-section">
          <button
            className="toolbar-button"
            onClick={() => handleFileOperation('copy')}
            disabled={state.selectedItems.length === 0}
            title="Copy (Ctrl+C)"
          >
            📋 Copy
          </button>
          <button
            className="toolbar-button"
            onClick={() => handleFileOperation('cut')}
            disabled={state.selectedItems.length === 0}
            title="Cut (Ctrl+X)"
          >
            ✂ Cut
          </button>
          <button
            className="toolbar-button"
            onClick={() => handleFileOperation('paste')}
            disabled={!clipboard.items.length}
            title="Paste (Ctrl+V)"
          >
            📋 Paste
          </button>
          <button
            className="toolbar-button"
            onClick={() => handleFileOperation('delete')}
            disabled={state.selectedItems.length === 0}
            title="Delete (Del)"
          >
            🗑 Delete
          </button>
        </div>

        <div className="toolbar-section">
          <button
            className={`toolbar-button ${state.viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setState((prev) => ({ ...prev, viewMode: 'grid' }))}
            title="Grid View"
          >
            ⊞
          </button>
          <button
            className={`toolbar-button ${state.viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setState((prev) => ({ ...prev, viewMode: 'list' }))}
            title="List View"
          >
            ≡
          </button>
          <button
            className={`toolbar-button ${state.viewMode === 'details' ? 'active' : ''}`}
            onClick={() => setState((prev) => ({ ...prev, viewMode: 'details' }))}
            title="Details View"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Address Bar */}
      <div className="file-explorer-address-bar">
        <div className="address-breadcrumbs">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.path}>
              <button className="breadcrumb-item" onClick={() => navigateToPath(item.path)}>
                {item.name}
              </button>
              {index < breadcrumbItems.length - 1 && <span className="breadcrumb-separator">▶</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search files..."
            value={state.searchQuery}
            onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="file-explorer-main">
        {/* Sidebar */}
        {state.showSidebar && (
          <div className="file-explorer-sidebar">
            <div className="sidebar-header">
              <span className="sidebar-title">Folders</span>
            </div>
            <div className="folder-tree">
              {folderTreeItems.map(({ item, level, hasChildren }) => (
                <div
                  key={item.id}
                  className={`tree-item ${state.currentPath === item.path ? 'active' : ''}`}
                  style={{ paddingLeft: `${level * 16 + 8}px` }}
                  onClick={() => navigateToPath(item.path)}
                >
                  <div className="tree-item-content">
                    {hasChildren && (
                      <button
                        className="tree-expand-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolderExpansion(item.path);
                        }}
                      >
                        {state.expandedFolders.has(item.path) ? '▼' : '▶'}
                      </button>
                    )}
                    {!hasChildren && <span className="tree-spacer"></span>}
                    <span className="tree-icon">📁</span>
                    <span className="tree-label">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Content Area */}
        <div className="file-explorer-content">
          {/* File Grid/List */}
          <div className={`file-display file-display--${state.viewMode}`}>
            {directoryContents.length === 0 ? (
              <div className="empty-folder">
                <p>This folder is empty</p>
              </div>
            ) : (
              directoryContents.map((item) => (
                <div
                  key={item.id}
                  className={`file-item ${state.selectedItems.includes(item.id) ? 'selected' : ''} ${
                    state.isRenaming === item.id ? 'renaming' : ''
                  }`}
                  onClick={(e) => handleItemSelect(item.id, e.ctrlKey)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleItemSelect(item.id);
                    showContextMenu({ x: e.clientX, y: e.clientY }, [
                      {
                        id: 'open',
                        label: 'Open',
                        onClick: () => handleItemDoubleClick(item),
                      },
                      { id: 'separator1', label: '', separator: true },
                      {
                        id: 'rename',
                        label: 'Rename',
                        onClick: () => handleFileOperation('rename'),
                      },
                      {
                        id: 'delete',
                        label: 'Delete',
                        onClick: () => handleFileOperation('delete'),
                      },
                      { id: 'separator2', label: '', separator: true },
                      {
                        id: 'copy',
                        label: 'Copy',
                        onClick: () => handleFileOperation('copy'),
                      },
                      {
                        id: 'cut',
                        label: 'Cut',
                        onClick: () => handleFileOperation('cut'),
                      },
                    ]);
                  }}
                >
                  <div className="file-icon">{item.type === 'folder' ? '📁' : getFileIcon(item.name)}</div>
                  <div className="file-name">
                    {state.isRenaming === item.id ? (
                      <input
                        type="text"
                        className="rename-input"
                        defaultValue={item.name}
                        onBlur={(e) => {
                          const newName = e.target.value.trim();
                          if (newName && newName !== item.name) {
                            renameFileSystemItem(item.path, newName);
                          }
                          setState((prev) => ({ ...prev, isRenaming: null }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          } else if (e.key === 'Escape') {
                            setState((prev) => ({ ...prev, isRenaming: null }));
                          }
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      item.name
                    )}
                  </div>
                  {state.viewMode === 'details' && (
                    <>
                      <div className="file-type">{item.type}</div>
                      <div className="file-size">
                        {item.type === 'folder' ? '' : formatFileSize(item.content?.length || 0)}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="file-explorer-status-bar">
        <span>
          {directoryContents.length} item{directoryContents.length !== 1 ? 's' : ''}
          {state.selectedItems.length > 0 && <>, {state.selectedItems.length} selected</>}
        </span>
      </div>

      {/* Dialogs */}
      <InputDialog
        isVisible={state.showNewFolderDialog}
        title="Create New Folder"
        label="Folder name:"
        placeholder="New folder"
        onConfirm={(name) => {
          createFolder(state.currentPath, name);
          setState((prev) => ({ ...prev, showNewFolderDialog: false }));
        }}
        onCancel={() => setState((prev) => ({ ...prev, showNewFolderDialog: false }))}
        validate={(name) => {
          if (!name.trim()) return 'Folder name is required';
          if (directoryContents.some((item) => item.name === name.trim())) {
            return 'A folder with this name already exists';
          }
          return null;
        }}
      />

      <InputDialog
        isVisible={state.showNewFileDialog}
        title="Create New File"
        label="File name:"
        placeholder="New file.txt"
        onConfirm={(name) => {
          createFile(state.currentPath, name, '');
          setState((prev) => ({ ...prev, showNewFileDialog: false }));
        }}
        onCancel={() => setState((prev) => ({ ...prev, showNewFileDialog: false }))}
        validate={(name) => {
          if (!name.trim()) return 'File name is required';
          if (directoryContents.some((item) => item.name === name.trim())) {
            return 'A file with this name already exists';
          }
          return null;
        }}
      />

      <ConfirmDialog
        isVisible={state.showDeleteDialog}
        title="Delete Items"
        message={`Are you sure you want to delete ${state.selectedItems.length} item${state.selectedItems.length !== 1 ? 's' : ''}?`}
        onConfirm={() => {
          state.selectedItems.forEach((itemId) => {
            const item = directoryContents.find((i) => i.id === itemId);
            if (item) {
              removeFileSystemItem(item.path);
            }
          });
          setState((prev) => ({ ...prev, showDeleteDialog: false, selectedItems: [] }));
        }}
        onCancel={() => setState((prev) => ({ ...prev, showDeleteDialog: false }))}
      />
    </div>
  );
};

/**
 * Get appropriate file icon based on file extension
 */
function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'txt':
    case 'md':
      return '📄';
    case 'doc':
    case 'docx':
      return '📘';
    case 'xls':
    case 'xlsx':
      return '📗';
    case 'ppt':
    case 'pptx':
      return '📙';
    case 'zip':
    case 'rar':
    case '7z':
      return '📦';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return '🖼';
    case 'mp3':
    case 'wav':
    case 'flac':
      return '🎵';
    case 'mp4':
    case 'avi':
    case 'mkv':
    case 'mov':
      return '🎬';
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return '⚡';
    case 'html':
    case 'css':
      return '🌐';
    case 'py':
      return '🐍';
    case 'java':
      return '☕';
    case 'cpp':
    case 'c':
      return '🔧';
    default:
      return '📋';
  }
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
