// @ts-expect-error - React is needed for JSX in Jest
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import App from '../App';

// Mock the useDesktopStore hook
const mockInitializeFileSystem = jest.fn();

jest.mock('../stores/useDesktopStore', () => ({
  useDesktopStore: () => ({
    initializeFileSystem: mockInitializeFileSystem,
  }),
}));

// Mock components
jest.mock('../components/Desktop/Desktop', () => ({
  Desktop: () => <div data-testid="desktop">Desktop Component</div>,
}));

jest.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Desktop component wrapped in ErrorBoundary', () => {
    render(<App />);

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('desktop')).toBeInTheDocument();
  });

  test('calls initializeFileSystem on mount', () => {
    render(<App />);

    expect(mockInitializeFileSystem).toHaveBeenCalledTimes(1);
  });
});
