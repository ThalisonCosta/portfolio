import { renderHook, act } from '@testing-library/react';
import { useGameControls } from '../hooks/useGameControls';
import { Direction, GameState } from '../types';

describe('useGameControls', () => {
  const mockOnDirectionChange = jest.fn();
  const mockOnPause = jest.fn();
  const mockOnRestart = jest.fn();
  const mockOnExit = jest.fn();

  const defaultProps = {
    currentDirection: Direction.RIGHT, // Use RIGHT so we can test UP, DOWN, LEFT
    gameState: GameState.PLAYING,
    onDirectionChange: mockOnDirectionChange,
    onPause: mockOnPause,
    onRestart: mockOnRestart,
    onExit: mockOnExit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns correct control descriptions', () => {
    const { result } = renderHook(() => useGameControls(defaultProps));

    expect(result.current.controls.movement).toBe('Arrow Keys / WASD / hjkl');
    expect(result.current.controls.pause).toBe('Space');
    expect(result.current.controls.restart).toBe('R (when game over)');
    expect(result.current.controls.exit).toBe('Escape');
  });

  describe('Arrow key controls', () => {
    it('handles up arrow key', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.UP);
    });

    it('handles down arrow key', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.DOWN);
    });

    it('handles left arrow key', () => {
      // Use UP direction so left is valid
      const propsForLeft = { ...defaultProps, currentDirection: Direction.UP };
      renderHook(() => useGameControls(propsForLeft));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.LEFT);
    });

    it('handles right arrow key', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.RIGHT);
    });
  });

  describe('WASD controls', () => {
    it('handles W key for up movement', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'w', code: 'KeyW' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.UP);
    });

    it('handles A key for left movement', () => {
      const propsForLeft = { ...defaultProps, currentDirection: Direction.UP };
      renderHook(() => useGameControls(propsForLeft));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.LEFT);
    });

    it('handles S key for down movement', () => {
      const propsForDown = { ...defaultProps, currentDirection: Direction.LEFT };
      renderHook(() => useGameControls(propsForDown));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 's', code: 'KeyS' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.DOWN);
    });

    it('handles D key for right movement', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'd', code: 'KeyD' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.RIGHT);
    });
  });

  describe('Vim (hjkl) controls', () => {
    it('handles H key for left movement', () => {
      const propsForLeft = { ...defaultProps, currentDirection: Direction.UP };
      renderHook(() => useGameControls(propsForLeft));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'h', code: 'KeyH' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.LEFT);
    });

    it('handles J key for down movement', () => {
      const propsForDown = { ...defaultProps, currentDirection: Direction.LEFT };
      renderHook(() => useGameControls(propsForDown));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'j', code: 'KeyJ' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.DOWN);
    });

    it('handles K key for up movement', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'k', code: 'KeyK' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.UP);
    });

    it('handles L key for right movement', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'l', code: 'KeyL' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.RIGHT);
    });
  });

  describe('Game control actions', () => {
    it('handles spacebar for pause', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space' });
        document.dispatchEvent(event);
      });

      expect(mockOnPause).toHaveBeenCalled();
    });

    it('handles R key for restart', () => {
      const propsGameOver = { ...defaultProps, gameState: GameState.GAME_OVER };
      renderHook(() => useGameControls(propsGameOver));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'r', code: 'KeyR' });
        document.dispatchEvent(event);
      });

      expect(mockOnRestart).toHaveBeenCalled();
    });

    it('handles uppercase R key for restart', () => {
      const propsGameOver = { ...defaultProps, gameState: GameState.GAME_OVER };
      renderHook(() => useGameControls(propsGameOver));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'R', code: 'KeyR' });
        document.dispatchEvent(event);
      });

      expect(mockOnRestart).toHaveBeenCalled();
    });

    it('handles Escape key for exit', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' });
        document.dispatchEvent(event);
      });

      expect(mockOnExit).toHaveBeenCalled();
    });
  });

  describe('Direction validation', () => {
    it('prevents opposite direction changes', () => {
      const propsMovingRight = {
        ...defaultProps,
        currentDirection: Direction.RIGHT,
      };

      renderHook(() => useGameControls(propsMovingRight));

      // Try to move left (opposite to right)
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).not.toHaveBeenCalled();
    });

    it('allows perpendicular direction changes', () => {
      const propsMovingRight = {
        ...defaultProps,
        currentDirection: Direction.RIGHT,
      };

      renderHook(() => useGameControls(propsMovingRight));

      // Try to move up (perpendicular to right)
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.UP);
    });

    it('allows same direction changes', () => {
      const propsMovingRight = {
        ...defaultProps,
        currentDirection: Direction.RIGHT,
      };

      renderHook(() => useGameControls(propsMovingRight));

      // Try to move right (same direction)
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.RIGHT);
    });
  });

  describe('Game state handling', () => {
    it('allows movement keys when game is in NEW_GAME state', () => {
      const propsNewGame = {
        ...defaultProps,
        gameState: GameState.NEW_GAME,
      };

      renderHook(() => useGameControls(propsNewGame));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.UP);
    });

    it('allows movement keys when game is PLAYING', () => {
      const propsPlaying = {
        ...defaultProps,
        gameState: GameState.PLAYING,
      };

      renderHook(() => useGameControls(propsPlaying));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.UP);
    });

    it('ignores movement keys when game is PAUSED', () => {
      const propsPaused = {
        ...defaultProps,
        gameState: GameState.PAUSED,
      };

      renderHook(() => useGameControls(propsPaused));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).not.toHaveBeenCalled();
    });

    it('ignores movement keys when game is GAME_OVER', () => {
      const propsGameOver = {
        ...defaultProps,
        gameState: GameState.GAME_OVER,
      };

      renderHook(() => useGameControls(propsGameOver));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).not.toHaveBeenCalled();
    });
  });

  describe('Event listener cleanup', () => {
    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => useGameControls(defaultProps));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Case insensitive handling', () => {
    it('handles uppercase WASD keys', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'W', code: 'KeyW' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.UP);
    });

    it('handles uppercase hjkl keys', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'K', code: 'KeyK' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).toHaveBeenCalledWith(Direction.UP);
    });
  });

  describe('Ignored keys', () => {
    it('ignores unhandled keys', () => {
      renderHook(() => useGameControls(defaultProps));

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' });
        document.dispatchEvent(event);
      });

      expect(mockOnDirectionChange).not.toHaveBeenCalled();
      expect(mockOnPause).not.toHaveBeenCalled();
      expect(mockOnRestart).not.toHaveBeenCalled();
      expect(mockOnExit).not.toHaveBeenCalled();
    });
  });
});
