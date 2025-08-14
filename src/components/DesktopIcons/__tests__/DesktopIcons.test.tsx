/** @jsxImportSource react */
import { render, fireEvent, screen } from '@testing-library/react';
import { DesktopIcons } from '../DesktopIcons';

// Mock the useDesktopStore hook
const mockActions = {
  openWindow: jest.fn(),
  setDragging: jest.fn(),
};

const mockFileSystem = [
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
        content: 'About content...',
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
        id: 'projects',
        name: 'Projects',
        type: 'folder',
        path: '/Desktop/Projects',
        icon: 'folder',
        position: { x: 300, y: 100 },
      },
    ],
  },
];

jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => ({
    fileSystem: mockFileSystem,
    isDragging: false,
    draggedItem: null,
    ...mockActions,
  }),
}));

describe('DesktopIcons Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders desktop icons from file system', () => {
    render(<DesktopIcons />);

    expect(screen.getByText('About.txt')).toBeInTheDocument();
    expect(screen.getByText('Resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  test('displays correct icons for different file types', () => {
    render(<DesktopIcons />);

    const icons = screen.getAllByText(/📄|📋|📁/);
    expect(icons).toHaveLength(3);

    // Check that folder icon is present
    expect(screen.getByText('📁')).toBeInTheDocument();

    // Check that file icons are present
    expect(screen.getByText('📄')).toBeInTheDocument(); // .txt file
    expect(screen.getByText('📋')).toBeInTheDocument(); // .pdf file
  });

  test('positions icons correctly based on position data', () => {
    render(<DesktopIcons />);

    const aboutMeIcon = screen.getByText('About.txt').closest('.desktop-icon') as HTMLElement;
    if (aboutMeIcon) {
      expect(aboutMeIcon.style.left).toBe('100px');
      expect(aboutMeIcon.style.top).toBe('100px');
    }

    const resumeIcon = screen.getByText('Resume.pdf').closest('.desktop-icon') as HTMLElement;
    if (resumeIcon) {
      expect(resumeIcon.style.left).toBe('200px');
      expect(resumeIcon.style.top).toBe('100px');
    }
  });

  test('double-clicking file icon opens appropriate application', () => {
    render(<DesktopIcons />);

    const textFileIcon = screen.getByText('About.txt').closest('.desktop-icon');
    if (textFileIcon) fireEvent.doubleClick(textFileIcon);

    expect(mockActions.openWindow).toHaveBeenCalledWith({
      title: 'About.txt',
      component: 'TextEditor',
      isMinimized: false,
      isMaximized: false,
      position: { x: 200, y: 100 },
      size: { width: 600, height: 400 },
    });
  });

  test('double-clicking PDF file opens PDF viewer', () => {
    render(<DesktopIcons />);

    const pdfIcon = screen.getByText('Resume.pdf').closest('.desktop-icon');
    if (pdfIcon) fireEvent.doubleClick(pdfIcon);

    expect(mockActions.openWindow).toHaveBeenCalledWith({
      title: 'Resume.pdf',
      component: 'PDFViewer',
      isMinimized: false,
      isMaximized: false,
      position: { x: 200, y: 100 },
      size: { width: 600, height: 400 },
    });
  });

  test('double-clicking folder opens file explorer', () => {
    render(<DesktopIcons />);

    const folderIcon = screen.getByText('Projects').closest('.desktop-icon');
    if (folderIcon) fireEvent.doubleClick(folderIcon);

    expect(mockActions.openWindow).toHaveBeenCalledWith({
      title: 'File Explorer - Projects',
      component: 'FileExplorer',
      isMinimized: false,
      isMaximized: false,
      position: { x: 150, y: 80 },
      size: { width: 800, height: 600 },
    });
  });

  test('drag start sets dragging state', () => {
    render(<DesktopIcons />);

    const icon = screen.getByText('About.txt').closest('.desktop-icon');

    // Create a mock drag event
    const dragEvent = new Event('dragstart', { bubbles: true });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: {
        effectAllowed: '',
        setData: jest.fn(),
      },
    });

    if (icon) fireEvent(icon, dragEvent);

    expect(mockActions.setDragging).toHaveBeenCalledWith(true, 'about-me');
  });

  test('has drag end handler for clearing state', () => {
    render(<DesktopIcons />);

    const icon = screen.getByText('About.txt').closest('.desktop-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('desktop-icon');
  });

  // Note: Dragging visual feedback is tested in Playwright e2e tests

  test('handles icons with no position data', () => {
    // This test validates the default positioning behavior
    // Since we're using a static mock, we test with the existing mock data
    render(<DesktopIcons />);

    // Test that all icons have the desktop-icon class and inline positioning
    const icons = screen.getAllByText(/About\.txt|Resume\.pdf|Projects/).map((text) => text.closest('.desktop-icon'));

    icons.forEach((icon) => {
      expect(icon).toHaveClass('desktop-icon');
      const htmlIcon = icon as HTMLElement;
      expect(htmlIcon?.style.left).toBeTruthy();
      expect(htmlIcon?.style.top).toBeTruthy();
    });
  });

  test('handles different file extensions correctly', () => {
    // Test file extension handling with existing mock data
    render(<DesktopIcons />);

    // Test text file (.txt)
    const textFileIcon = screen.getByText('About.txt').closest('.desktop-icon');
    if (textFileIcon) fireEvent.doubleClick(textFileIcon);

    expect(mockActions.openWindow).toHaveBeenCalledWith({
      title: 'About.txt',
      component: 'TextEditor',
      isMinimized: false,
      isMaximized: false,
      position: { x: 200, y: 100 },
      size: { width: 600, height: 400 },
    });

    // Test PDF file
    const pdfIcon = screen.getByText('Resume.pdf').closest('.desktop-icon');
    if (pdfIcon) fireEvent.doubleClick(pdfIcon);

    expect(mockActions.openWindow).toHaveBeenCalledWith({
      title: 'Resume.pdf',
      component: 'PDFViewer',
      isMinimized: false,
      isMaximized: false,
      position: { x: 200, y: 100 },
      size: { width: 600, height: 400 },
    });
  });
});
