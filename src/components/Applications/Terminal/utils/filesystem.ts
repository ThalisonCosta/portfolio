import type { TerminalFileSystemItem } from '../types';
import type { FileSystemItem } from '../../../../stores/useDesktopStore';

/**
 * File system utility functions for terminal operations
 */
export class FileSystemUtils {
  /**
   * Convert desktop store file system item to terminal file system item
   */
  static convertToTerminalItem(item: FileSystemItem): TerminalFileSystemItem {
    return {
      name: item.name,
      isDirectory: item.type === 'folder',
      path: item.path,
      permissions: 'rwxr-xr-x', // Mock permissions
      size: item.content?.length || 0,
      modified: new Date(),
    };
  }

  /**
   * Resolve a path relative to current directory
   */
  static resolvePath(currentPath: string, targetPath: string): string {
    if (targetPath.startsWith('/')) {
      return this.normalizePath(targetPath);
    }

    if (targetPath === '.') {
      return currentPath;
    }

    if (targetPath === '..') {
      const parts = currentPath.split('/').filter(Boolean);
      parts.pop();
      return `/${parts.join('/')}`;
    }

    if (targetPath.startsWith('./')) {
      targetPath = targetPath.substring(2);
    }

    if (targetPath.startsWith('../')) {
      const parts = currentPath.split('/').filter(Boolean);
      const targetParts = targetPath.split('/');

      for (const part of targetParts) {
        if (part === '..') {
          parts.pop();
        } else if (part !== '.') {
          parts.push(part);
        }
      }

      return `/${parts.join('/')}`;
    }

    return this.normalizePath(`${currentPath}/${targetPath}`);
  }

  /**
   * Normalize a path by removing duplicate slashes and resolving . and ..
   */
  static normalizePath(path: string): string {
    const parts = path.split('/').filter(Boolean);
    const normalized: string[] = [];

    for (const part of parts) {
      if (part === '.') {
        continue;
      }
      if (part === '..') {
        normalized.pop();
      } else {
        normalized.push(part);
      }
    }

    return `/${normalized.join('/')}`;
  }

  /**
   * Get the parent directory of a path
   */
  static getParentDirectory(path: string): string {
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    return `/${parts.join('/')}`;
  }

  /**
   * Get the filename from a path
   */
  static getFilename(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1] || '';
  }

  /**
   * Check if a path is a subdirectory of another path
   */
  static isSubdirectory(parentPath: string, childPath: string): boolean {
    const normalizedParent = this.normalizePath(parentPath);
    const normalizedChild = this.normalizePath(childPath);

    if (normalizedParent === normalizedChild) {
      return false;
    }

    return normalizedChild.startsWith(`${normalizedParent}/`);
  }

  /**
   * Find an item in the file system by path
   */
  static findItemByPath(fileSystem: FileSystemItem[], path: string): FileSystemItem | null {
    const normalizedPath = this.normalizePath(path);

    const findRecursive = (items: FileSystemItem[]): FileSystemItem | null => {
      for (const item of items) {
        if (item.path === normalizedPath) {
          return item;
        }
        if (item.children && normalizedPath.startsWith(`${item.path}/`)) {
          const found = findRecursive(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findRecursive(fileSystem);
  }

  /**
   * Get all items in a directory
   */
  static getDirectoryContents(fileSystem: FileSystemItem[], path: string): TerminalFileSystemItem[] {
    const item = this.findItemByPath(fileSystem, path);
    if (!item || item.type !== 'folder' || !item.children) {
      return [];
    }

    return item.children.map((child) => this.convertToTerminalItem(child));
  }

  /**
   * Check if a path exists in the file system
   */
  static pathExists(fileSystem: FileSystemItem[], path: string): boolean {
    return this.findItemByPath(fileSystem, path) !== null;
  }

  /**
   * Check if a path is a directory
   */
  static isDirectory(fileSystem: FileSystemItem[], path: string): boolean {
    const item = this.findItemByPath(fileSystem, path);
    return item?.type === 'folder';
  }

  /**
   * Get file content
   */
  static getFileContent(fileSystem: FileSystemItem[], path: string): string | null {
    const item = this.findItemByPath(fileSystem, path);
    if (!item || item.type !== 'file') {
      return null;
    }
    // Return empty string for files with no content, null only for missing files
    return item.content ?? '';
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Format file permissions for display
   */
  static formatPermissions(permissions: string): string {
    // Convert rwxrwxrwx format to drwxrwxrwx for directories
    return permissions;
  }

  /**
   * Get file extension
   */
  static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
  }

  /**
   * Check if a file is executable based on extension (mock implementation)
   */
  static isExecutable(filename: string): boolean {
    const extension = this.getFileExtension(filename);
    const executableExtensions = ['exe', 'bat', 'cmd', 'sh', 'py', 'js', 'rb', 'pl'];
    return executableExtensions.includes(extension);
  }

  /**
   * Generate autocomplete suggestions for file paths
   */
  static getPathCompletions(fileSystem: FileSystemItem[], currentPath: string, partial: string): string[] {
    let searchPath = currentPath;
    let searchPattern = partial;

    // Handle absolute paths
    if (partial.startsWith('/')) {
      const lastSlash = partial.lastIndexOf('/');
      searchPath = partial.substring(0, lastSlash) || '/';
      searchPattern = partial.substring(lastSlash + 1);
    } else if (partial.includes('/')) {
      // Handle relative paths with directories
      const lastSlash = partial.lastIndexOf('/');
      const relativePath = partial.substring(0, lastSlash);
      searchPath = this.resolvePath(currentPath, relativePath);
      searchPattern = partial.substring(lastSlash + 1);
    }

    const items = this.getDirectoryContents(fileSystem, searchPath);

    return items
      .filter((item) => item.name.toLowerCase().startsWith(searchPattern.toLowerCase()))
      .map((item) => {
        const fullName = item.isDirectory ? `${item.name}/` : item.name;

        // Return appropriate path format
        if (partial.startsWith('/')) {
          return searchPath === '/' ? `/${fullName}` : `${searchPath}/${fullName}`;
        }
        if (partial.includes('/')) {
          const lastSlash = partial.lastIndexOf('/');
          return partial.substring(0, lastSlash + 1) + fullName;
        }
        return fullName;
      })
      .sort((a, b) => {
        // Directories first, then files
        const aIsDir = a.endsWith('/');
        const bIsDir = b.endsWith('/');
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });
  }
}
