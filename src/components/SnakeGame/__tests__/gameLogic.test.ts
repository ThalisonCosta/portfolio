import { Direction, GameState, Position } from '../types';
import {
  generateFood,
  getNextPosition,
  isOutOfBounds,
  checkSelfCollision,
  checkFoodCollision,
  calculateSpeed,
  moveSnake,
  isValidDirectionChange,
  initializeGame,
  resetGame,
  saveHighScore,
  loadHighScore,
} from '../utils/gameLogic';
import { DEFAULT_GAME_CONFIG } from '../utils/constants';

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

describe('gameLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('0');
  });

  describe('generateFood', () => {
    it('generates food position within board bounds', () => {
      const snake: Position[] = [{ x: 5, y: 5 }];
      const config = DEFAULT_GAME_CONFIG;

      const food = generateFood(snake, config);

      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(config.boardWidth);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(config.boardHeight);
    });

    it('generates food position that does not collide with snake', () => {
      const snake: Position[] = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];
      const config = DEFAULT_GAME_CONFIG;

      const food = generateFood(snake, config);

      // Food should not be on any snake segment
      const collision = snake.some((segment) => segment.x === food.x && segment.y === food.y);
      expect(collision).toBe(false);
    });
  });

  describe('getNextPosition', () => {
    const position: Position = { x: 5, y: 5 };

    it('moves up correctly', () => {
      const result = getNextPosition(position, Direction.UP);
      expect(result).toEqual({ x: 5, y: 4 });
    });

    it('moves down correctly', () => {
      const result = getNextPosition(position, Direction.DOWN);
      expect(result).toEqual({ x: 5, y: 6 });
    });

    it('moves left correctly', () => {
      const result = getNextPosition(position, Direction.LEFT);
      expect(result).toEqual({ x: 4, y: 5 });
    });

    it('moves right correctly', () => {
      const result = getNextPosition(position, Direction.RIGHT);
      expect(result).toEqual({ x: 6, y: 5 });
    });
  });

  describe('isOutOfBounds', () => {
    const config = DEFAULT_GAME_CONFIG;

    it('returns true for position left of board', () => {
      expect(isOutOfBounds({ x: -1, y: 5 }, config)).toBe(true);
    });

    it('returns true for position right of board', () => {
      expect(isOutOfBounds({ x: config.boardWidth, y: 5 }, config)).toBe(true);
    });

    it('returns true for position above board', () => {
      expect(isOutOfBounds({ x: 5, y: -1 }, config)).toBe(true);
    });

    it('returns true for position below board', () => {
      expect(isOutOfBounds({ x: 5, y: config.boardHeight }, config)).toBe(true);
    });

    it('returns false for valid position', () => {
      expect(isOutOfBounds({ x: 5, y: 5 }, config)).toBe(false);
    });
  });

  describe('checkSelfCollision', () => {
    it('returns true when head collides with body', () => {
      const head: Position = { x: 3, y: 5 };
      const body: Position[] = [
        { x: 4, y: 5 },
        { x: 3, y: 5 }, // Collision here
        { x: 2, y: 5 },
      ];

      expect(checkSelfCollision(head, body)).toBe(true);
    });

    it('returns false when head does not collide with body', () => {
      const head: Position = { x: 1, y: 5 };
      const body: Position[] = [
        { x: 4, y: 5 },
        { x: 3, y: 5 },
        { x: 2, y: 5 },
      ];

      expect(checkSelfCollision(head, body)).toBe(false);
    });
  });

  describe('checkFoodCollision', () => {
    it('returns true when head is at food position', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 5, y: 5 };

      expect(checkFoodCollision(head, food)).toBe(true);
    });

    it('returns false when head is not at food position', () => {
      const head: Position = { x: 5, y: 5 };
      const food: Position = { x: 6, y: 6 };

      expect(checkFoodCollision(head, food)).toBe(false);
    });
  });

  describe('calculateSpeed', () => {
    const config = DEFAULT_GAME_CONFIG;

    it('returns initial speed for score 0', () => {
      expect(calculateSpeed(0, config)).toBe(config.initialSpeed);
    });

    it('decreases speed as score increases', () => {
      const initialSpeed = calculateSpeed(0, config);
      const higherScore = calculateSpeed(config.pointsPerFood * 5, config);

      expect(higherScore).toBeLessThan(initialSpeed);
    });

    it('does not go below minimum speed', () => {
      const veryHighScore = config.pointsPerFood * 100;
      const result = calculateSpeed(veryHighScore, config);

      expect(result).toBeGreaterThanOrEqual(config.minSpeed);
    });
  });

  describe('isValidDirectionChange', () => {
    it('prevents opposite direction changes', () => {
      expect(isValidDirectionChange(Direction.UP, Direction.DOWN)).toBe(false);
      expect(isValidDirectionChange(Direction.DOWN, Direction.UP)).toBe(false);
      expect(isValidDirectionChange(Direction.LEFT, Direction.RIGHT)).toBe(false);
      expect(isValidDirectionChange(Direction.RIGHT, Direction.LEFT)).toBe(false);
    });

    it('allows perpendicular direction changes', () => {
      expect(isValidDirectionChange(Direction.UP, Direction.LEFT)).toBe(true);
      expect(isValidDirectionChange(Direction.UP, Direction.RIGHT)).toBe(true);
      expect(isValidDirectionChange(Direction.DOWN, Direction.LEFT)).toBe(true);
      expect(isValidDirectionChange(Direction.DOWN, Direction.RIGHT)).toBe(true);
    });

    it('allows same direction', () => {
      expect(isValidDirectionChange(Direction.UP, Direction.UP)).toBe(true);
      expect(isValidDirectionChange(Direction.DOWN, Direction.DOWN)).toBe(true);
      expect(isValidDirectionChange(Direction.LEFT, Direction.LEFT)).toBe(true);
      expect(isValidDirectionChange(Direction.RIGHT, Direction.RIGHT)).toBe(true);
    });
  });

  describe('moveSnake', () => {
    const createGameState = () => ({
      snake: [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
      ],
      food: { x: 7, y: 5 },
      direction: Direction.RIGHT,
      nextDirection: Direction.RIGHT,
      gameState: GameState.PLAYING,
      stats: {
        score: 0,
        highScore: 100,
        foodEaten: 0,
        gameTime: 0,
      },
      config: DEFAULT_GAME_CONFIG,
    });

    it('moves snake forward when no food collision', () => {
      const gameState = createGameState();
      const result = moveSnake(gameState);

      expect(result.snake[0]).toEqual({ x: 6, y: 5 }); // New head position
      expect(result.snake.length).toBe(gameState.snake.length); // Same length
      expect(result.gameState).toBe(GameState.PLAYING);
    });

    it('grows snake when food is eaten', () => {
      const gameState = createGameState();
      gameState.food = { x: 6, y: 5 }; // Place food where snake will move

      const result = moveSnake(gameState);

      expect(result.snake.length).toBe(gameState.snake.length + 1); // Snake grew
      expect(result.stats.score).toBe(gameState.config.pointsPerFood);
      expect(result.stats.foodEaten).toBe(1);
      expect(result.food).not.toEqual(gameState.food); // New food generated
    });

    it('ends game on wall collision', () => {
      const gameState = createGameState();
      gameState.snake = [{ x: gameState.config.boardWidth - 1, y: 5 }];
      gameState.direction = Direction.RIGHT;

      const result = moveSnake(gameState);

      expect(result.gameState).toBe(GameState.GAME_OVER);
    });

    it('ends game on self collision', () => {
      const gameState = createGameState();
      // Create a snake that will collide with itself when moving
      gameState.snake = [
        { x: 5, y: 5 }, // head
        { x: 4, y: 5 }, // body
        { x: 3, y: 5 }, // body
        { x: 3, y: 4 }, // body
        { x: 4, y: 4 }, // body
      ];
      gameState.direction = Direction.LEFT; // Will move head to (4, 5) which collides with body

      const result = moveSnake(gameState);

      expect(result.gameState).toBe(GameState.GAME_OVER);
    });

    it('updates high score when score exceeds current high score', () => {
      const gameState = createGameState();
      gameState.stats.highScore = 5; // Set lower high score
      gameState.stats.score = 0; // Start with 0
      gameState.food = { x: 6, y: 5 }; // Place food to be eaten

      const result = moveSnake(gameState);

      // New score should be 0 + pointsPerFood (10), which should exceed 5
      expect(result.stats.score).toBe(10);
      expect(result.stats.highScore).toBe(10);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('snake-game-high-score', '10');
    });
  });

  describe('initializeGame', () => {
    it('creates initial game state with correct values', () => {
      mockLocalStorage.getItem.mockReturnValue('150');

      const gameState = initializeGame();

      expect(gameState.snake.length).toBeGreaterThan(0);
      expect(gameState.direction).toBe(Direction.RIGHT);
      expect(gameState.nextDirection).toBe(Direction.RIGHT);
      expect(gameState.gameState).toBe(GameState.NEW_GAME);
      expect(gameState.stats.score).toBe(0);
      expect(gameState.stats.highScore).toBe(150);
      expect(gameState.stats.foodEaten).toBe(0);
      expect(gameState.stats.gameTime).toBe(0);
    });
  });

  describe('resetGame', () => {
    it('resets game state while preserving high score', () => {
      const gameState = {
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        direction: Direction.LEFT,
        nextDirection: Direction.LEFT,
        gameState: GameState.GAME_OVER,
        stats: {
          score: 200,
          highScore: 300,
          foodEaten: 10,
          gameTime: 120,
        },
        config: DEFAULT_GAME_CONFIG,
      };

      const result = resetGame(gameState);

      expect(result.direction).toBe(Direction.RIGHT);
      expect(result.nextDirection).toBe(Direction.RIGHT);
      expect(result.gameState).toBe(GameState.NEW_GAME);
      expect(result.stats.score).toBe(0);
      expect(result.stats.highScore).toBe(300); // Preserved
      expect(result.stats.foodEaten).toBe(0);
      expect(result.stats.gameTime).toBe(0);
    });
  });

  describe('localStorage functions', () => {
    describe('saveHighScore', () => {
      it('saves score to localStorage', () => {
        saveHighScore(250);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('snake-game-high-score', '250');
      });

      it('handles localStorage errors gracefully', () => {
        mockLocalStorage.setItem.mockImplementation(() => {
          throw new Error('localStorage error');
        });

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        expect(() => saveHighScore(250)).not.toThrow();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });

    describe('loadHighScore', () => {
      it('loads score from localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue('350');

        const result = loadHighScore();

        expect(result).toBe(350);
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('snake-game-high-score');
      });

      it('returns 0 when no score is saved', () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        const result = loadHighScore();

        expect(result).toBe(0);
      });

      it('handles localStorage errors gracefully', () => {
        mockLocalStorage.getItem.mockImplementation(() => {
          throw new Error('localStorage error');
        });

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

        const result = loadHighScore();

        expect(result).toBe(0);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });
  });
});
