import { useState, useEffect, useCallback, useRef } from 'react';
import { Direction, GameState, type SnakeGameState } from '../types';
import { initializeGame, moveSnake, resetGame, calculateSpeed } from '../utils/gameLogic';

/**
 * Main hook for Snake game logic and state management
 */
export const useSnakeGame = () => {
  const [gameState, setGameState] = useState<SnakeGameState>(initializeGame);
  const gameLoopRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);

  /**
   * Start the game
   */
  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gameState: GameState.PLAYING,
    }));
    gameStartTimeRef.current = Date.now();
  }, []);

  /**
   * Pause/unpause the game
   */
  const togglePause = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      gameState: prev.gameState === GameState.PLAYING ? GameState.PAUSED : GameState.PLAYING,
    }));
  }, []);

  /**
   * Restart the game
   */
  const restartGame = useCallback(() => {
    setGameState((prev) => {
      const newState = resetGame(prev);
      return {
        ...newState,
        gameState: GameState.PLAYING,
      };
    });
    gameStartTimeRef.current = Date.now();
  }, []);

  /**
   * Set the next direction for the snake
   */
  const setDirection = useCallback((direction: Direction) => {
    setGameState((prev) => ({
      ...prev,
      nextDirection: direction,
    }));
  }, []);

  /**
   * Game loop function
   */
  const gameLoop = useCallback(
    (timestamp: number) => {
      const currentSpeed = calculateSpeed(gameState.stats.score, gameState.config);

      if (timestamp - lastMoveTimeRef.current >= currentSpeed) {
        setGameState((prev) => {
          if (prev.gameState !== GameState.PLAYING) {
            return prev;
          }

          // Update direction if it changed
          const newDirection = prev.nextDirection;
          const updatedState = {
            ...prev,
            direction: newDirection,
          };

          // Move snake and update game state
          const movedState = moveSnake(updatedState);

          // Update game time
          const gameTime = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
          return {
            ...movedState,
            stats: {
              ...movedState.stats,
              gameTime,
            },
          };
        });

        lastMoveTimeRef.current = timestamp;
      }

      // Continue the game loop if game is playing
      if (gameState.gameState === GameState.PLAYING) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    },
    [gameState.stats.score, gameState.config, gameState.gameState]
  );

  /**
   * Start/stop game loop based on game state
   */
  useEffect(() => {
    if (gameState.gameState === GameState.PLAYING) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameState, gameLoop]);

  /**
   * Cleanup on unmount
   */
  useEffect(
    () => () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    },
    []
  );

  return {
    gameState,
    startGame,
    togglePause,
    restartGame,
    setDirection,
    currentSpeed: calculateSpeed(gameState.stats.score, gameState.config),
  };
};
