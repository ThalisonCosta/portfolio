// @ts-expect-error - React is needed for JSX in Jest
import React, { useEffect } from 'react';
import { Desktop } from './components/Desktop/Desktop';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ContextMenuProvider } from './contexts/ContextMenuContext';
import { useDesktopStore } from './stores/useDesktopStore';
import './i18n/config';
import './App.css';

function App() {
  const { initializeFileSystem } = useDesktopStore();

  useEffect(() => {
    initializeFileSystem();
  }, [initializeFileSystem]);

  return (
    <ErrorBoundary>
      <ContextMenuProvider>
        <Desktop />
      </ContextMenuProvider>
    </ErrorBoundary>
  );
}

export default App;
