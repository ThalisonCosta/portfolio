/** @jsxImportSource react */
import { render, screen, fireEvent } from '@testing-library/react';
import { FileExplorerApp } from '../FileExplorerApp';
import { ContextMenuProvider } from '../../../contexts/ContextMenuContext';

// Mock the useDesktopStore hook
jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => ({
    fileSystem: [
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
            content: 'Welcome to my portfolio!',
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
        ],
      },
      {
        id: 'projects',
        name: 'Projects',
        type: 'folder',
        path: '/Projects',
        icon: 'folder',
        children: [],
      },
    ],
    createFile: jest.fn(),
    createFolder: jest.fn(),
    removeFileSystemItem: jest.fn(),
    renameFileSystemItem: jest.fn(),
    copyToClipboard: jest.fn(),
    cutToClipboard: jest.fn(),
    pasteFromClipboard: jest.fn(),
    clipboard: { items: [], operation: null },
  }),
}));

const renderFileExplorer = () => {
  return render(
    <ContextMenuProvider>
      <FileExplorerApp />
    </ContextMenuProvider>
  );
};

describe('FileExplorerApp Component', () => {
  test('renders file explorer toolbar', () => {
    renderFileExplorer();

    expect(screen.getByTitle('Back')).toBeInTheDocument();
    expect(screen.getByTitle('Forward')).toBeInTheDocument();
    expect(screen.getByTitle('Up')).toBeInTheDocument();
    expect(screen.getByTitle('Toggle Sidebar')).toBeInTheDocument();
  });

  test('renders address bar with breadcrumbs', () => {
    renderFileExplorer();

    const breadcrumbs = screen.getByText('Computer').closest('.address-breadcrumbs');
    expect(breadcrumbs).toBeInTheDocument();
    expect(breadcrumbs).toHaveTextContent('Computer');
    expect(breadcrumbs).toHaveTextContent('Desktop');
  });

  test('renders search input', () => {
    renderFileExplorer();

    expect(screen.getByPlaceholderText('Search files...')).toBeInTheDocument();
  });

  test('displays file operation buttons', () => {
    renderFileExplorer();

    expect(screen.getByTitle('New Folder')).toBeInTheDocument();
    expect(screen.getByTitle('New File')).toBeInTheDocument();
    expect(screen.getByTitle('Copy (Ctrl+C)')).toBeInTheDocument();
    expect(screen.getByTitle('Cut (Ctrl+X)')).toBeInTheDocument();
    expect(screen.getByTitle('Paste (Ctrl+V)')).toBeInTheDocument();
    expect(screen.getByTitle('Delete (Del)')).toBeInTheDocument();
  });

  test('displays view mode buttons', () => {
    renderFileExplorer();

    expect(screen.getByTitle('Grid View')).toBeInTheDocument();
    expect(screen.getByTitle('List View')).toBeInTheDocument();
    expect(screen.getByTitle('Details View')).toBeInTheDocument();
  });

  test('shows file system content', () => {
    renderFileExplorer();

    expect(screen.getByText('About.txt')).toBeInTheDocument();
    expect(screen.getByText('Resume.pdf')).toBeInTheDocument();
  });

  test('shows sidebar with folder tree', () => {
    renderFileExplorer();

    const sidebar = screen.getByText('Folders').closest('.file-explorer-sidebar');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveTextContent('Desktop');
    expect(sidebar).toHaveTextContent('Projects');
  });

  test('toggles sidebar visibility', () => {
    renderFileExplorer();

    const sidebarToggle = screen.getByTitle('Toggle Sidebar');

    // Initially, sidebar should be visible
    expect(screen.getByText('Folders')).toBeInTheDocument();

    // Click to hide sidebar
    fireEvent.click(sidebarToggle);

    // After clicking, sidebar should be hidden
    expect(screen.queryByText('Folders')).not.toBeInTheDocument();
  });

  test('displays status bar with item count', () => {
    renderFileExplorer();

    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  test('changes view mode when clicking view buttons', () => {
    renderFileExplorer();

    const listViewButton = screen.getByTitle('List View');
    fireEvent.click(listViewButton);

    const fileDisplay = screen.getByText('About.txt').closest('.file-display');
    expect(fileDisplay).toHaveClass('file-display--list');
  });
});
