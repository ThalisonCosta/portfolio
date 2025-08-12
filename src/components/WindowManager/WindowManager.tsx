import React from 'react';
import { Window } from '../Window/Window';
import { useDesktopStore } from '../../stores/useDesktopStore';

export const WindowManager: React.FC = () => {
  const { windows } = useDesktopStore();

  return (
    <>
      {windows.map((window) => (
        <Window key={window.id} windowState={window} />
      ))}
    </>
  );
};
