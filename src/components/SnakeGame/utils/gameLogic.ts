import { Position, Direction, GameConfig, SnakeGameState, GameState } from '../types';
import { DEFAULT_GAME_CONFIG, INITIAL_SNAKE_POSITION, HIGH_SCORE_KEY } from './constants';

/**
 * Generate random food position that doesn't collide with snake
 */
export const generateFood = (snake: Position[], config: GameConfig): Position => {
  let food: Position;
  let attempts = 0;
  const maxAttempts = config.boardWidth * config.boardHeight;

  do {
    food = {
      x: Math.floor(Math.random() * config.boardWidth),
      y: Math.floor(Math.random() * config.boardHeight),
    };
    attempts++;
  } while (attempts < maxAttempts && snake.some((segment) => segment.x === food.x && segment.y === food.y));

  return food;
};

/**
 * Get next position based on current position and direction
 */
export const getNextPosition = (position: Position, direction: Direction): Position => {
  const { x, y } = position;
  switch (direction) {
    case Direction.UP:
      return { x, y: y - 1 };
    case Direction.DOWN:
      return { x, y: y + 1 };
    case Direction.LEFT:
      return { x: x - 1, y };
    case Direction.RIGHT:
      return { x: x + 1, y };
    default:
      return position;
  }
};

/**
 * Check if position is out of bounds
 */
export const isOutOfBounds = (position: Position, config: GameConfig): boolean =>
  position.x < 0 || position.x >= config.boardWidth || position.y < 0 || position.y >= config.boardHeight;

/**
 * Check if snake collides with itself
 */
export const checkSelfCollision = (head: Position, body: Position[]): boolean =>
  body.some((segment) => segment.x === head.x && segment.y === head.y);

/**
 * Check if snake head is at food position
 */
export const checkFoodCollision = (head: Position, food: Position): boolean => head.x === food.x && head.y === food.y;

/**
 * Calculate current game speed based on score
 */
export const calculateSpeed = (score: number, config: GameConfig): number => {
  const foodEaten = Math.floor(score / config.pointsPerFood);
  const speedReduction = foodEaten * config.speedIncrement;
  return Math.max(config.minSpeed, config.initialSpeed - speedReduction);
};

/**
 * Move snake in given direction
 */
export const moveSnake = (gameState: SnakeGameState): SnakeGameState => {
  const { snake, direction, food, stats, config } = gameState;
  const [head] = snake;
  const newHead = getNextPosition(head, direction);

  // Check wall collision
  if (isOutOfBounds(newHead, config)) {
    return {
      ...gameState,
      gameState: GameState.GAME_OVER,
    };
  }

  // Check self collision
  if (checkSelfCollision(newHead, snake)) {
    return {
      ...gameState,
      gameState: GameState.GAME_OVER,
    };
  }

  const newSnake = [newHead, ...snake];
  let newFood = food;
  let newStats = { ...stats };

  // Check food collision
  if (checkFoodCollision(newHead, food)) {
    // Snake grows, don't remove tail
    newFood = generateFood(newSnake, config);
    newStats = {
      ...stats,
      score: stats.score + config.pointsPerFood,
      foodEaten: stats.foodEaten + 1,
    };

    // Update high score if needed
    if (newStats.score > stats.highScore) {
      newStats.highScore = newStats.score;
      saveHighScore(newStats.highScore);
    }
  } else {
    // Remove tail (snake doesn't grow)
    newSnake.pop();
  }

  return {
    ...gameState,
    snake: newSnake,
    food: newFood,
    stats: newStats,
  };
};

/**
 * Check if direction change is valid (not opposite direction)
 */
export const isValidDirectionChange = (currentDirection: Direction, newDirection: Direction): boolean => {
  const opposites = {
    [Direction.UP]: Direction.DOWN,
    [Direction.DOWN]: Direction.UP,
    [Direction.LEFT]: Direction.RIGHT,
    [Direction.RIGHT]: Direction.LEFT,
  };

  return opposites[currentDirection] !== newDirection;
};

/**
 * Initialize new game state
 */
export const initializeGame = (): SnakeGameState => {
  const config = DEFAULT_GAME_CONFIG;
  const snake = [...INITIAL_SNAKE_POSITION];
  const food = generateFood(snake, config);
  const highScore = loadHighScore();

  return {
    snake,
    food,
    direction: Direction.RIGHT,
    nextDirection: Direction.RIGHT,
    gameState: GameState.NEW_GAME,
    stats: {
      score: 0,
      highScore,
      foodEaten: 0,
      gameTime: 0,
    },
    config,
  };
};

/**
 * Save high score to localStorage
 */
export const saveHighScore = (score: number): void => {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch (error) {
    console.warn('Failed to save high score:', error);
  }
};

/**
 * Load high score from localStorage
 */
export const loadHighScore = (): number => {
  try {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  } catch (error) {
    console.warn('Failed to load high score:', error);
    return 0;
  }
};

/**
 * Reset game to initial state
 */
export const resetGame = (gameState: SnakeGameState): SnakeGameState => {
  const { config } = gameState;
  const snake = [...INITIAL_SNAKE_POSITION];
  const food = generateFood(snake, config);

  return {
    ...gameState,
    snake,
    food,
    direction: Direction.RIGHT,
    nextDirection: Direction.RIGHT,
    gameState: GameState.NEW_GAME,
    stats: {
      score: 0,
      highScore: gameState.stats.highScore, // Keep existing high score
      foodEaten: 0,
      gameTime: 0,
    },
  };
};
