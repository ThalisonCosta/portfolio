import React, { useMemo } from 'react';
import { useDesktopStore } from '../../stores/useDesktopStore';
import { useSnakeGame } from './hooks/useSnakeGame';
import { useGameControls } from './hooks/useGameControls';
import { GameState } from './types';
import { CELL_SIZE } from './utils/constants';
import './SnakeGame.css';

/**
 * Snake Game Screensaver Component
 *
 * A full-screen Snake game that serves as a screensaver.
 * Features multiple control schemes and score persistence.
 */
export const SnakeGame: React.FC = () => {
  const { deactivateScreensaver } = useDesktopStore();
  const { gameState, startGame, togglePause, restartGame, setDirection, currentSpeed } = useSnakeGame();

  // Handle game controls
  const { controls } = useGameControls({
    currentDirection: gameState.direction,
    gameState: gameState.gameState,
    onDirectionChange: setDirection,
    onPause: togglePause,
    onRestart: restartGame,
    onExit: deactivateScreensaver,
  });

  // Create game board grid
  const gameBoard = useMemo(() => {
    const { config, snake, food } = gameState;
    const board: string[][] = [];

    // Initialize empty board
    for (let y = 0; y < config.boardHeight; y++) {
      board[y] = [];
      for (let x = 0; x < config.boardWidth; x++) {
        board[y][x] = 'empty';
      }
    }

    // Place snake segments
    snake.forEach((segment, index) => {
      if (segment.x >= 0 && segment.x < config.boardWidth && segment.y >= 0 && segment.y < config.boardHeight) {
        board[segment.y][segment.x] = index === 0 ? 'snake-head' : 'snake';
      }
    });

    // Place food
    if (food.x >= 0 && food.x < config.boardWidth && food.y >= 0 && food.y < config.boardHeight) {
      board[food.y][food.x] = 'food';
    }

    return board;
  }, [gameState]);

  // Handle start game on first key press
  const handleStartGame = () => {
    if (gameState.gameState === GameState.NEW_GAME) {
      startGame();
    }
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Game state messages
  const getGameStateMessage = () => {
    switch (gameState.gameState) {
      case GameState.NEW_GAME:
        return {
          message: 'Ready to Play',
          instruction: 'Press any arrow key, WASD, or hjkl to start',
          className: 'new-game',
        };
      case GameState.PAUSED:
        return {
          message: 'Paused',
          instruction: 'Press Space to continue',
          className: 'paused',
        };
      case GameState.GAME_OVER:
        return {
          message: 'Game Over',
          instruction: 'Press R to restart or Escape to exit',
          className: 'game-over',
        };
      default:
        return null;
    }
  };

  const stateMessage = getGameStateMessage();

  return (
    <div className="snake-game-overlay" onClick={handleStartGame}>
      <div className="exit-hint">Press ESC to exit</div>

      <div className="snake-game-container">
        {/* Game Header */}
        <div className="snake-game-header">
          <h1 className="snake-game-title">SNAKE</h1>

          <div className="snake-game-stats">
            <div className="stat-item">
              <span className="stat-label">Score</span>
              <span className="stat-value">{gameState.stats.score.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">High Score</span>
              <span className="stat-value">{gameState.stats.highScore.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Time</span>
              <span className="stat-value">{formatTime(gameState.stats.gameTime)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Speed</span>
              <span className="stat-value">{Math.round(1000 / currentSpeed)} fps</span>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="snake-game-board">
          <div
            className="snake-game-grid"
            style={{
              gridTemplateColumns: `repeat(${gameState.config.boardWidth}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${gameState.config.boardHeight}, ${CELL_SIZE}px)`,
            }}
          >
            {gameBoard.flat().map((cellType, index) => (
              <div key={index} className={`snake-cell ${cellType}`} />
            ))}
          </div>
        </div>

        {/* Game State Messages */}
        {stateMessage && (
          <div className="snake-game-message">
            <div className={`game-state-message ${stateMessage.className}`}>{stateMessage.message}</div>
            <div className="game-instruction">{stateMessage.instruction}</div>
          </div>
        )}

        {/* Controls Display */}
        <div className="snake-game-controls">
          <h3 className="controls-title">Controls</h3>
          <div className="controls-grid">
            <div className="control-item">
              <span className="control-label">Movement:</span>
              <span className="control-keys">{controls.movement}</span>
            </div>
            <div className="control-item">
              <span className="control-label">Pause:</span>
              <span className="control-keys">{controls.pause}</span>
            </div>
            <div className="control-item">
              <span className="control-label">Restart:</span>
              <span className="control-keys">{controls.restart}</span>
            </div>
            <div className="control-item">
              <span className="control-label">Exit:</span>
              <span className="control-keys">{controls.exit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SnakeGame.displayName = 'SnakeGame';
