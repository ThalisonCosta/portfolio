/** @jsxImportSource react */
import { render, fireEvent, screen } from '@testing-library/react';
import { Window } from '../Window';

// Mock the useDesktopStore hook
const mockActions = {
  closeWindow: jest.fn(),
  minimizeWindow: jest.fn(),
  maximizeWindow: jest.fn(),
  updateWindowPosition: jest.fn(),
  updateWindowSize: jest.fn(),
  bringToFront: jest.fn(),
};

jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => mockActions,
}));

// Mock ApplicationManager component
jest.mock('../../ApplicationManager/ApplicationManager', () => ({
  ApplicationManager: ({ component }: { component: string }) => (
    <div data-testid="application-manager">{component}</div>
  ),
}));

const createMockWindowState = (overrides = {}) => ({
  id: 'test-window-1',
  title: 'Test Window',
  component: 'TestApp',
  isOpen: true,
  isMinimized: false,
  isMaximized: false,
  position: { x: 100, y: 100 },
  size: { width: 600, height: 400 },
  zIndex: 1000,
  ...overrides,
});

describe('Window Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders window with correct title', () => {
    const windowState = createMockWindowState({ title: 'My Test Window' });
    render(<Window windowState={windowState} />);

    expect(screen.getByText('My Test Window')).toBeInTheDocument();
  });

  test('renders application manager with correct component', () => {
    const windowState = createMockWindowState({ component: 'TextEditor' });
    render(<Window windowState={windowState} />);

    const appManager = screen.getByTestId('application-manager');
    expect(appManager).toBeInTheDocument();
    expect(appManager).toHaveTextContent('TextEditor');
  });

  test('does not render when window is minimized', () => {
    const windowState = createMockWindowState({ isMinimized: true });
    const { container } = render(<Window windowState={windowState} />);

    expect(container.firstChild).toBeNull();
  });

  test('applies maximized styles when window is maximized', () => {
    const windowState = createMockWindowState({ isMaximized: true });
    render(<Window windowState={windowState} />);

    const windowElement = screen.getByText('Test Window').closest('.window');
    expect(windowElement).toHaveClass('maximized');
  });

  test('window control buttons trigger correct actions', () => {
    const windowState = createMockWindowState();
    render(<Window windowState={windowState} />);

    // Test close button
    const closeButton = screen.getByTitle('Close window');
    fireEvent.click(closeButton);
    expect(mockActions.closeWindow).toHaveBeenCalledWith('test-window-1');

    // Test minimize button
    const minimizeButton = screen.getByTitle('Minimize window');
    fireEvent.click(minimizeButton);
    expect(mockActions.minimizeWindow).toHaveBeenCalledWith('test-window-1');

    // Test maximize button
    const maximizeButton = screen.getByTitle('Maximize window');
    fireEvent.click(maximizeButton);
    expect(mockActions.maximizeWindow).toHaveBeenCalledWith('test-window-1');
  });

  test('double-clicking header maximizes window', () => {
    const windowState = createMockWindowState();
    render(<Window windowState={windowState} />);

    const header = screen.getByText('Test Window').closest('.window-header');
    if (header) fireEvent.doubleClick(header);
    expect(mockActions.maximizeWindow).toHaveBeenCalledWith('test-window-1');
  });

  test('clicking window brings it to front', () => {
    const windowState = createMockWindowState();
    render(<Window windowState={windowState} />);

    const windowElement = screen.getByText('Test Window').closest('.window');
    if (windowElement) fireEvent.click(windowElement);
    expect(mockActions.bringToFront).toHaveBeenCalledWith('test-window-1');
  });

  test('shows resize handle when not maximized', () => {
    const windowState = createMockWindowState({ isMaximized: false });
    const { container } = render(<Window windowState={windowState} />);

    const resizeHandle = container.querySelector('.window-resize-handle');
    expect(resizeHandle).toBeInTheDocument();
  });

  test('hides resize handle when maximized', () => {
    const windowState = createMockWindowState({ isMaximized: true });
    const { container } = render(<Window windowState={windowState} />);

    const resizeHandle = container.querySelector('.window-resize-handle');
    expect(resizeHandle).not.toBeInTheDocument();
  });

  test('window has correct position and size styles', () => {
    const windowState = createMockWindowState({
      position: { x: 200, y: 150 },
      size: { width: 800, height: 600 },
      zIndex: 1500,
    });
    const { container } = render(<Window windowState={windowState} />);

    const windowElement = container.querySelector('.window') as HTMLElement;
    if (windowElement) {
      expect(windowElement.style.left).toBe('200px');
      expect(windowElement.style.top).toBe('150px');
      expect(windowElement.style.width).toBe('800px');
      expect(windowElement.style.height).toBe('600px');
      expect(windowElement.style.zIndex).toBe('1500');
    }
  });

  test('maximized window uses full viewport dimensions', () => {
    const windowState = createMockWindowState({ isMaximized: true });
    const { container } = render(<Window windowState={windowState} />);

    const windowElement = container.querySelector('.window') as HTMLElement;
    if (windowElement) {
      expect(windowElement.style.left).toBe('0px');
      expect(windowElement.style.top).toBe('0px');
      expect(windowElement.style.width).toBe('100vw');
      expect(windowElement.style.height).toBe('calc(100vh - 48px)');
    }
  });
});
