/** @jsxImportSource react */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StartMenu } from '../StartMenu';

const mockCloseStartMenu = jest.fn();
const mockOpenWindow = jest.fn();
const mockGetState = jest.fn(() => ({
  windows: [] as Array<unknown>,
}));

jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: jest.fn(() => ({
    isStartMenuOpen: true,
    closeStartMenu: mockCloseStartMenu,
    openWindow: mockOpenWindow,
  })),
}));

// Override getState method
const { useDesktopStore: useDesktopStoreMock } = jest.requireMock('../../../stores/useDesktopStore');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(useDesktopStoreMock as any).getState = mockGetState;

describe('StartMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when start menu is closed', () => {
    useDesktopStoreMock.mockReturnValueOnce({
      isStartMenuOpen: false,
      closeStartMenu: mockCloseStartMenu,
      openWindow: mockOpenWindow,
    });

    const { container } = render(<StartMenu />);
    expect(container.firstChild).toBeNull();
  });

  test('renders start menu with correct structure when open', () => {
    render(<StartMenu />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Pinned')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  test('renders all pinned applications', () => {
    render(<StartMenu />);

    const appButtons = ['File Explorer', 'About', 'Projects', 'Contact', 'Settings', 'Calculator', 'Terminal'];

    appButtons.forEach((appName) => {
      expect(screen.getByText(appName)).toBeInTheDocument();
    });
  });

  test('renders recommended items', () => {
    render(<StartMenu />);

    expect(screen.getByText('Resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('Recently modified')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Project')).toBeInTheDocument();
    expect(screen.getByText('Recently opened')).toBeInTheDocument();
  });

  test('renders power button', () => {
    render(<StartMenu />);

    const powerButton = screen.getByLabelText('Power options');
    expect(powerButton).toBeInTheDocument();
  });

  test('handles app clicks and opens windows', () => {
    render(<StartMenu />);

    const calculatorButton = screen.getByText('Calculator');
    fireEvent.click(calculatorButton);

    expect(mockOpenWindow).toHaveBeenCalledWith({
      title: 'Calculator',
      component: 'calculator',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 320, height: 460 },
      isResizable: true,
    });
    expect(mockCloseStartMenu).toHaveBeenCalled();
  });

  test('handles non-calculator app clicks with different dimensions', () => {
    render(<StartMenu />);

    const fileExplorerButton = screen.getByText('File Explorer');
    fireEvent.click(fileExplorerButton);

    expect(mockOpenWindow).toHaveBeenCalledWith({
      title: 'File Explorer',
      component: 'explorer',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      isResizable: true,
    });
    expect(mockCloseStartMenu).toHaveBeenCalled();
  });

  test('handles terminal app click', () => {
    render(<StartMenu />);

    const terminalButton = screen.getByText('Terminal');
    fireEvent.click(terminalButton);

    expect(mockOpenWindow).toHaveBeenCalledWith({
      title: 'Terminal',
      component: 'terminal',
      isMinimized: false,
      isMaximized: false,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      isResizable: true,
    });
    expect(mockCloseStartMenu).toHaveBeenCalled();
  });

  test('staggers window positions based on existing windows', () => {
    mockGetState.mockReturnValueOnce({
      windows: [{ id: 'test-1' }, { id: 'test-2' }], // 2 existing windows
    });

    render(<StartMenu />);

    const aboutButton = screen.getByText('About');
    fireEvent.click(aboutButton);

    expect(mockOpenWindow).toHaveBeenCalledWith({
      title: 'About',
      component: 'about',
      isMinimized: false,
      isMaximized: false,
      position: { x: 160, y: 160 }, // 100 + (2 * 30)
      size: { width: 800, height: 600 },
      isResizable: true,
    });
  });

  test('closes menu on Escape key press', () => {
    render(<StartMenu />);

    const startMenu = screen.getByRole('dialog');
    fireEvent.keyDown(startMenu, { key: 'Escape' });

    expect(mockCloseStartMenu).toHaveBeenCalled();
  });

  test('closes menu when clicking outside', async () => {
    render(<StartMenu />);

    // Click outside the menu
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(mockCloseStartMenu).toHaveBeenCalled();
    });
  });

  test('does not close menu when clicking inside', async () => {
    render(<StartMenu />);

    const insideElement = screen.getByText('User');

    fireEvent.mouseDown(insideElement);

    // Wait a bit to ensure the handler doesn't fire
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockCloseStartMenu).not.toHaveBeenCalled();
  });

  test('has correct accessibility attributes', () => {
    render(<StartMenu />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'start-menu-title');

    const appGrid = screen.getByRole('grid');
    expect(appGrid).toHaveAttribute('aria-label', 'Pinned applications');

    const recommendedList = screen.getByRole('list');
    expect(recommendedList).toHaveAttribute('aria-label', 'Recommended items');
  });

  test('cleanup removes event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = render(<StartMenu />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  test('does not add event listener when menu is closed', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

    useDesktopStoreMock.mockReturnValueOnce({
      isStartMenuOpen: false,
      closeStartMenu: mockCloseStartMenu,
      openWindow: mockOpenWindow,
    });

    render(<StartMenu />);

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('mousedown', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });
});
