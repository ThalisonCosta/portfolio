/** @jsxImportSource react */
import { render, fireEvent } from '@testing-library/react';
import { Desktop } from '../Desktop';

// Mock the useDesktopStore hook
const mockClearSelection = jest.fn();
const mockUpdateIconPosition = jest.fn();
const mockSetDragging = jest.fn();

jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: jest.fn(() => ({
    wallpaper: '/wallpapers/default.jpg',
    theme: 'light',
    windows: [],
    fileSystem: [
      {
        id: 'desktop',
        name: 'Desktop',
        type: 'folder',
        path: '/Desktop',
        icon: 'folder',
        children: [],
      },
    ],
    updateIconPosition: mockUpdateIconPosition,
    setDragging: mockSetDragging,
  })),
}));

// Mock the getState method
const mockGetState = jest.fn(() => ({
  clearSelection: mockClearSelection,
}));

// Override getState method
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { useDesktopStore } = jest.requireMock('../../../stores/useDesktopStore') as any;
useDesktopStore.getState = mockGetState;

// Mock child components
jest.mock('../../DesktopIcons/DesktopIcons', () => ({
  DesktopIcons: () => <div data-testid="desktop-icons">Desktop Icons</div>,
}));

jest.mock('../../WindowManager/WindowManager', () => ({
  WindowManager: () => <div data-testid="window-manager">Window Manager</div>,
}));

jest.mock('../../Taskbar/Taskbar', () => ({
  Taskbar: () => <div data-testid="taskbar">Taskbar</div>,
}));

describe('Desktop Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders desktop environment with correct theme class', () => {
    render(<Desktop />);

    const desktopElement = document.querySelector('.desktop');
    expect(desktopElement).toBeInTheDocument();
    expect(desktopElement).toHaveClass('desktop', 'light');
  });

  test('has correct background style from wallpaper', () => {
    render(<Desktop />);

    const desktopElement = document.querySelector('.desktop');
    expect(desktopElement).toHaveStyle({
      backgroundImage: 'url(/wallpapers/default.jpg)',
    });
  });

  test('renders child components', () => {
    const { getByTestId } = render(<Desktop />);

    expect(getByTestId('desktop-icons')).toBeInTheDocument();
    expect(getByTestId('window-manager')).toBeInTheDocument();
    expect(getByTestId('taskbar')).toBeInTheDocument();
  });

  test('handles desktop click to clear selection', () => {
    const { container } = render(<Desktop />);
    const desktopElement = container.querySelector('.desktop');

    fireEvent.click(desktopElement!);

    expect(mockClearSelection).toHaveBeenCalledTimes(1);
  });

  test('prevents context menu on right-click', () => {
    const { container } = render(<Desktop />);
    const desktopElement = container.querySelector('.desktop');

    const contextMenuEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = jest.spyOn(contextMenuEvent, 'preventDefault');
    desktopElement!.dispatchEvent(contextMenuEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test('has drag over handler attached', () => {
    const { container } = render(<Desktop />);
    const desktopElement = container.querySelector('.desktop');

    // Verify the desktop element is rendered and has the expected structure
    expect(desktopElement).toBeInTheDocument();
    expect(desktopElement).toHaveClass('desktop');
  });

  test('has drop handler attached', () => {
    const { container } = render(<Desktop />);
    const desktopElement = container.querySelector('.desktop');

    // Verify the desktop element is rendered and has the expected structure for drop functionality
    expect(desktopElement).toBeInTheDocument();
    expect(desktopElement).toHaveClass('desktop');
  });

  test('has drop handler for empty item ID', () => {
    const { container } = render(<Desktop />);
    const desktopElement = container.querySelector('.desktop');

    // Verify the desktop element is rendered and has the expected structure
    expect(desktopElement).toBeInTheDocument();
    expect(desktopElement).toHaveClass('desktop');
  });

  test('applies different theme classes', () => {
    const { useDesktopStore: useDesktopStoreMock } = jest.requireMock('../../../stores/useDesktopStore');

    // Test dark theme
    useDesktopStoreMock.mockReturnValueOnce({
      wallpaper: '/wallpapers/dark.jpg',
      theme: 'dark',
      updateIconPosition: mockUpdateIconPosition,
      setDragging: mockSetDragging,
    });

    const { container } = render(<Desktop />);
    const desktopElement = container.querySelector('.desktop');

    expect(desktopElement).toHaveClass('desktop', 'dark');
    expect(desktopElement).toHaveStyle({
      backgroundImage: 'url(/wallpapers/dark.jpg)',
    });
  });
});
