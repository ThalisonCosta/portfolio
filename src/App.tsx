// @ts-expect-error - React is needed for JSX in Jest
import React, { useEffect } from 'react';
import { Desktop } from './components/Desktop/Desktop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useDesktopStore } from './stores/useDesktopStore';
import './App.css';

function App() {
  const { initializeFileSystem } = useDesktopStore();

  useEffect(() => {
    initializeFileSystem();
  }, [initializeFileSystem]);

  return (
    <ErrorBoundary>
      <Desktop />
    </ErrorBoundary>
  );
}

export default App;
