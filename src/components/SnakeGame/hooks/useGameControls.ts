import { useEffect, useCallback } from 'react';
import { Direction, GameState } from '../types';
import { GAME_CONTROLS } from '../utils/constants';
import { isValidDirectionChange } from '../utils/gameLogic';

interface UseGameControlsProps {
  currentDirection: Direction;
  gameState: GameState;
  onDirectionChange: (direction: Direction) => void;
  onPause: () => void;
  onRestart: () => void;
  onExit: () => void;
}

/**
 * Hook to handle keyboard controls for the Snake game
 */
export const useGameControls = ({
  currentDirection,
  gameState,
  onDirectionChange,
  onPause,
  onRestart,
  onExit,
}: UseGameControlsProps) => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const { code, key } = event;

      // Prevent default browser behavior for game keys
      if (Object.values(GAME_CONTROLS).flat().includes(code) || Object.values(GAME_CONTROLS).flat().includes(key)) {
        event.preventDefault();
      }

      // Exit game (always available)
      if (GAME_CONTROLS.exit.includes(code) || GAME_CONTROLS.exit.includes(key)) {
        onExit();
        return;
      }

      // Restart game (available when game over)
      if (
        gameState === GameState.GAME_OVER &&
        (GAME_CONTROLS.restart.includes(code) || GAME_CONTROLS.restart.includes(key))
      ) {
        onRestart();
        return;
      }

      // Pause/unpause (available during gameplay)
      if (
        (gameState === GameState.PLAYING || gameState === GameState.PAUSED) &&
        (GAME_CONTROLS.pause.includes(code) || GAME_CONTROLS.pause.includes(key))
      ) {
        onPause();
        return;
      }

      // Direction controls (only during active gameplay)
      if (gameState === GameState.PLAYING || gameState === GameState.NEW_GAME) {
        let newDirection: Direction | null = null;

        if (GAME_CONTROLS.up.includes(code) || GAME_CONTROLS.up.includes(key)) {
          newDirection = Direction.UP;
        } else if (GAME_CONTROLS.down.includes(code) || GAME_CONTROLS.down.includes(key)) {
          newDirection = Direction.DOWN;
        } else if (GAME_CONTROLS.left.includes(code) || GAME_CONTROLS.left.includes(key)) {
          newDirection = Direction.LEFT;
        } else if (GAME_CONTROLS.right.includes(code) || GAME_CONTROLS.right.includes(key)) {
          newDirection = Direction.RIGHT;
        }

        if (newDirection && isValidDirectionChange(currentDirection, newDirection)) {
          onDirectionChange(newDirection);
        }
      }
    },
    [currentDirection, gameState, onDirectionChange, onPause, onRestart, onExit]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Return control mappings for display in UI
  return {
    controls: {
      movement: 'Arrow Keys / WASD / hjkl',
      pause: 'Space',
      restart: 'R (when game over)',
      exit: 'Escape',
    },
  };
};
