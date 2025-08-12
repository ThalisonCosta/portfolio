import React from 'react';
import { render } from '@testing-library/react';
import { Desktop } from '../Desktop';

// Mock the useDesktopStore hook
jest.mock('../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => ({
    wallpaper: '/wallpapers/default.jpg',
    theme: 'light',
    windows: [],
    fileSystem: [
      {
        id: 'desktop',
        name: 'Desktop',
        type: 'folder',
        path: '/Desktop',
        icon: 'folder',
        children: []
      }
    ],
    clearSelection: jest.fn(),
    openWindow: jest.fn(),
  }),
}));

describe('Desktop Component', () => {
  test('renders desktop environment', () => {
    render(<Desktop />);
    
    const desktopElement = document.querySelector('.desktop');
    expect(desktopElement).toBeInTheDocument();
    expect(desktopElement).toHaveClass('desktop', 'light');
  });

  test('has correct background style', () => {
    render(<Desktop />);
    
    const desktopElement = document.querySelector('.desktop');
    expect(desktopElement).toHaveStyle({
      backgroundImage: 'url(/wallpapers/default.jpg)'
    });
  });
});