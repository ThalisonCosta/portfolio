import { useEffect } from 'react';
import { Desktop } from './components/Desktop/Desktop';
import { useDesktopStore } from './stores/useDesktopStore';
import './App.css';

function App() {
  const { initializeFileSystem } = useDesktopStore();

  useEffect(() => {
    initializeFileSystem();
  }, [initializeFileSystem]);

  return <Desktop />;
}

export default App;
