import { GameConfig, GameControls } from '../types';

/**
 * Default game configuration
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  boardWidth: 20,
  boardHeight: 20,
  initialSpeed: 150, // milliseconds between moves
  minSpeed: 50,
  speedIncrement: 5, // speed increase per food eaten
  pointsPerFood: 10,
};

/**
 * Game control key mappings
 */
export const GAME_CONTROLS: GameControls = {
  up: ['ArrowUp', 'KeyW', 'KeyK'],
  down: ['ArrowDown', 'KeyS', 'KeyJ'],
  left: ['ArrowLeft', 'KeyA', 'KeyH'],
  right: ['ArrowRight', 'KeyD', 'KeyL'],
  pause: [' ', 'Space'],
  restart: ['KeyR'],
  exit: ['Escape'],
};

/**
 * Initial snake position (center of board)
 */
export const INITIAL_SNAKE_POSITION = [
  { x: Math.floor(DEFAULT_GAME_CONFIG.boardWidth / 2), y: Math.floor(DEFAULT_GAME_CONFIG.boardHeight / 2) },
];

/**
 * Local storage key for high score
 */
export const HIGH_SCORE_KEY = 'snake-game-high-score';

/**
 * Game colors
 */
export const GAME_COLORS = {
  background: '#000000',
  snake: '#00ff00',
  snakeBorder: '#008800',
  food: '#ff0000',
  text: '#ffffff',
  grid: '#333333',
};

/**
 * Game board cell size in pixels
 */
export const CELL_SIZE = 20;
