/**
 * Position coordinates for snake segments and food
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Direction enum for snake movement
 */
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

/**
 * Game state enum
 */
export enum GameState {
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  NEW_GAME = 'NEW_GAME',
}

/**
 * Snake game configuration
 */
export interface GameConfig {
  boardWidth: number;
  boardHeight: number;
  initialSpeed: number;
  minSpeed: number;
  speedIncrement: number;
  pointsPerFood: number;
}

/**
 * Game statistics
 */
export interface GameStats {
  score: number;
  highScore: number;
  foodEaten: number;
  gameTime: number;
}

/**
 * Complete game state
 */
export interface SnakeGameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  gameState: GameState;
  stats: GameStats;
  config: GameConfig;
}

/**
 * Game controls mapping
 */
export interface GameControls {
  up: string[];
  down: string[];
  left: string[];
  right: string[];
  pause: string[];
  restart: string[];
  exit: string[];
}
