import { render, screen, fireEvent, act } from '@testing-library/react';
import { SnakeGame } from '../SnakeGame';
import { useDesktopStore } from '../../../stores/useDesktopStore';

// Mock the desktop store
jest.mock('../../../stores/useDesktopStore');
const mockUseDesktopStore = useDesktopStore as jest.MockedFunction<typeof useDesktopStore>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock requestAnimationFrame
let animationFrameCallback: ((timestamp: number) => void) | null = null;
const mockRequestAnimationFrame = jest.fn((callback: (timestamp: number) => void) => {
  animationFrameCallback = callback;
  return 1;
});

const mockCancelAnimationFrame = jest.fn();

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
  writable: true,
});

describe('SnakeGame', () => {
  const mockDeactivateScreensaver = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('0');

    mockUseDesktopStore.mockReturnValue({
      deactivateScreensaver: mockDeactivateScreensaver,
    } as ReturnType<typeof useDesktopStore>);

    // Reset animation frame callback
    animationFrameCallback = null;
  });

  afterEach(() => {
    // Cleanup any running animation frames
    if (animationFrameCallback) {
      mockCancelAnimationFrame(1);
    }
  });

  it('renders snake game overlay with all UI elements', () => {
    render(<SnakeGame />);

    // Check main overlay
    expect(screen.getByText('Press ESC to exit')).toBeInTheDocument();
    expect(screen.getByText('SNAKE')).toBeInTheDocument();

    // Check stats section
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('High Score')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();

    // Check controls section
    expect(screen.getByText('Controls')).toBeInTheDocument();
    expect(screen.getByText('Movement:')).toBeInTheDocument();
    expect(screen.getByText('Pause:')).toBeInTheDocument();
    expect(screen.getByText('Restart:')).toBeInTheDocument();
    expect(screen.getByText('Exit:')).toBeInTheDocument();
  });

  it('displays new game state message initially', () => {
    render(<SnakeGame />);

    expect(screen.getByText('Ready to Play')).toBeInTheDocument();
    expect(screen.getByText('Press any arrow key, WASD, or hjkl to start')).toBeInTheDocument();
  });

  it('handles arrow key press', () => {
    render(<SnakeGame />);

    // Simulate arrow key press
    act(() => {
      fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
    });

    // Component should render without error
    expect(screen.getByText('SNAKE')).toBeInTheDocument();
  });

  it('handles WASD key press', () => {
    render(<SnakeGame />);

    // Simulate W key press
    act(() => {
      fireEvent.keyDown(document, { key: 'w', code: 'KeyW' });
    });

    // Component should render without error
    expect(screen.getByText('SNAKE')).toBeInTheDocument();
  });

  it('handles vim keys (hjkl) press', () => {
    render(<SnakeGame />);

    // Simulate h key press (left in vim)
    act(() => {
      fireEvent.keyDown(document, { key: 'h', code: 'KeyH' });
    });

    // Component should render without error
    expect(screen.getByText('SNAKE')).toBeInTheDocument();
  });

  it('handles pause key press', () => {
    render(<SnakeGame />);

    // Simulate spacebar press
    act(() => {
      fireEvent.keyDown(document, { key: ' ', code: 'Space' });
    });

    // The pause functionality should be triggered (tested in hooks)
    // Just verify the component renders without error
    expect(screen.getByText('SNAKE')).toBeInTheDocument();
  });

  it('exits game when escape key is pressed', () => {
    render(<SnakeGame />);

    // Simulate escape key press
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    });

    expect(mockDeactivateScreensaver).toHaveBeenCalled();
  });

  it('handles R key press for restart', () => {
    render(<SnakeGame />);

    // Simulate R key press
    act(() => {
      fireEvent.keyDown(document, { key: 'r', code: 'KeyR' });
    });

    // Component should render without error
    expect(screen.getByText('SNAKE')).toBeInTheDocument();
  });

  it('renders game board with correct grid structure', () => {
    render(<SnakeGame />);

    const gameGrid = document.querySelector('.snake-game-grid');
    expect(gameGrid).toBeInTheDocument();

    // Should have cells for the entire game board
    const cells = document.querySelectorAll('.snake-cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('displays score and stats correctly', () => {
    render(<SnakeGame />);

    // Initial score should be 0
    const scoreElements = screen.getAllByText('0');
    expect(scoreElements.length).toBeGreaterThanOrEqual(1);

    // Time should start at 00:00
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('applies correct CSS classes for full-screen overlay', () => {
    render(<SnakeGame />);

    const overlay = document.querySelector('.snake-game-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('snake-game-overlay');
  });

  it('starts game when clicking on overlay', () => {
    render(<SnakeGame />);

    const overlay = document.querySelector('.snake-game-overlay');

    act(() => {
      fireEvent.click(overlay!);
    });

    // Game should start
    expect(screen.queryByText('Ready to Play')).not.toBeInTheDocument();
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('loads high score from localStorage on mount', () => {
    mockLocalStorage.getItem.mockReturnValue('500');

    render(<SnakeGame />);

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('snake-game-high-score');
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('handles localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    // Console.warn should be called, but component should still render
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<SnakeGame />);

    expect(screen.getByText('SNAKE')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
