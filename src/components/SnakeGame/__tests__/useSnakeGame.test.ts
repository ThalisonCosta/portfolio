import { renderHook, act } from '@testing-library/react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { Direction, GameState } from '../types';

// Mock the game logic utilities
jest.mock('../utils/gameLogic', () => ({
  initializeGame: jest.fn(() => ({
    snake: [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
    ],
    food: { x: 7, y: 7 },
    direction: Direction.RIGHT,
    nextDirection: Direction.RIGHT,
    gameState: GameState.NEW_GAME,
    stats: {
      score: 0,
      highScore: 0,
      foodEaten: 0,
      gameTime: 0,
    },
    config: {
      boardWidth: 20,
      boardHeight: 20,
      initialSpeed: 200,
      minSpeed: 50,
      speedIncrement: 10,
      pointsPerFood: 10,
    },
  })),
  moveSnake: jest.fn((gameState) => {
    const newGameTime = gameState.stats.gameTime + 1;
    return {
      ...gameState,
      snake: [
        { x: 6, y: 5 },
        { x: 5, y: 5 },
      ],
      stats: {
        ...gameState.stats,
        gameTime: newGameTime,
      },
    };
  }),
  resetGame: jest.fn((gameState) => ({
    ...gameState,
    snake: [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
    ],
    gameState: GameState.NEW_GAME,
    stats: {
      score: 0,
      highScore: gameState.stats.highScore,
      foodEaten: 0,
      gameTime: 0,
    },
  })),
  calculateSpeed: jest.fn((score, config) => {
    const foodEaten = Math.floor(score / config.pointsPerFood);
    const speedReduction = foodEaten * config.speedIncrement;
    return Math.max(config.minSpeed, config.initialSpeed - speedReduction);
  }),
}));

// Mock requestAnimationFrame and cancelAnimationFrame
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

describe('useSnakeGame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    animationFrameCallback = null;
  });

  afterEach(() => {
    // Cleanup any running animation frames
    if (animationFrameCallback) {
      mockCancelAnimationFrame(1);
    }
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useSnakeGame());

    expect(result.current.gameState.gameState).toBe(GameState.NEW_GAME);
    expect(result.current.gameState.snake).toHaveLength(2);
    expect(result.current.gameState.direction).toBe(Direction.RIGHT);
    expect(result.current.gameState.stats.score).toBe(0);
    expect(typeof result.current.currentSpeed).toBe('number');
  });

  it('starts game when startGame is called', () => {
    const { result } = renderHook(() => useSnakeGame());

    act(() => {
      result.current.startGame();
    });

    expect(result.current.gameState.gameState).toBe(GameState.PLAYING);
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('toggles pause state when togglePause is called', () => {
    const { result } = renderHook(() => useSnakeGame());

    // Start the game first
    act(() => {
      result.current.startGame();
    });

    expect(result.current.gameState.gameState).toBe(GameState.PLAYING);

    // Pause the game
    act(() => {
      result.current.togglePause();
    });

    expect(result.current.gameState.gameState).toBe(GameState.PAUSED);

    // Resume the game
    act(() => {
      result.current.togglePause();
    });

    expect(result.current.gameState.gameState).toBe(GameState.PLAYING);
  });

  it('restarts game when restartGame is called', () => {
    const { result } = renderHook(() => useSnakeGame());

    // Start and modify game state
    act(() => {
      result.current.startGame();
      result.current.setDirection(Direction.UP);
    });

    // Restart the game
    act(() => {
      result.current.restartGame();
    });

    expect(result.current.gameState.gameState).toBe(GameState.PLAYING);
    expect(result.current.gameState.stats.score).toBe(0);
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('sets direction when setDirection is called', () => {
    const { result } = renderHook(() => useSnakeGame());

    act(() => {
      result.current.setDirection(Direction.UP);
    });

    expect(result.current.gameState.nextDirection).toBe(Direction.UP);
  });

  it('starts animation frame when game is playing', () => {
    const { result } = renderHook(() => useSnakeGame());

    act(() => {
      result.current.startGame();
    });

    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('cancels animation frame when game is paused', () => {
    const { result } = renderHook(() => useSnakeGame());

    // Start the game
    act(() => {
      result.current.startGame();
    });

    // Clear previous calls
    mockCancelAnimationFrame.mockClear();

    // Pause the game
    act(() => {
      result.current.togglePause();
    });

    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('calls game loop when playing', () => {
    const { result } = renderHook(() => useSnakeGame());

    // Start the game
    act(() => {
      result.current.startGame();
    });

    // Check that animation frame was requested
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
    expect(result.current.gameState.gameState).toBe(GameState.PLAYING);
  });

  it('calculates current speed correctly', () => {
    const { result } = renderHook(() => useSnakeGame());

    expect(typeof result.current.currentSpeed).toBe('number');
    expect(result.current.currentSpeed).toBeGreaterThan(0);
  });

  it('does not move snake when game is not playing', () => {
    const { result } = renderHook(() => useSnakeGame());

    // Game starts in NEW_GAME state, not PLAYING
    const initialSnakePosition = result.current.gameState.snake[0];

    // Simulate animation frame callback
    if (animationFrameCallback) {
      act(() => {
        animationFrameCallback!(1000);
      });
    }

    // Snake should not have moved
    expect(result.current.gameState.snake[0]).toEqual(initialSnakePosition);
  });

  it('cleans up animation frame on unmount', () => {
    const { result, unmount } = renderHook(() => useSnakeGame());

    // Start the game to create an animation frame
    act(() => {
      result.current.startGame();
    });

    // Clear previous calls
    mockCancelAnimationFrame.mockClear();

    // Unmount the hook
    unmount();

    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('updates direction in game state during move', () => {
    const { result } = renderHook(() => useSnakeGame());

    // Start the game
    act(() => {
      result.current.startGame();
    });

    // Set a new direction
    act(() => {
      result.current.setDirection(Direction.UP);
    });

    // Simulate animation frame callback to trigger move
    if (animationFrameCallback) {
      act(() => {
        animationFrameCallback!(1000);
      });
    }

    expect(result.current.gameState.direction).toBe(Direction.UP);
  });

  it('continues game loop when game is playing', () => {
    const { result } = renderHook(() => useSnakeGame());

    // Start the game
    act(() => {
      result.current.startGame();
    });

    // Clear initial call
    mockRequestAnimationFrame.mockClear();

    // Simulate animation frame callback
    if (animationFrameCallback) {
      act(() => {
        animationFrameCallback!(1000);
      });
    }

    // Should request another animation frame to continue the loop
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('cancels animation frame when game is paused', () => {
    const { result } = renderHook(() => useSnakeGame());

    // Start the game
    act(() => {
      result.current.startGame();
    });

    // Pause the game
    act(() => {
      result.current.togglePause();
    });

    // Check that game is paused
    expect(result.current.gameState.gameState).toBe(GameState.PAUSED);
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });
});
