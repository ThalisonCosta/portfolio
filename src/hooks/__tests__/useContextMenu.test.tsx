/** @jsxImportSource react */
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useContextMenu } from '../useContextMenu';
import { ContextMenuProvider } from '../../contexts/ContextMenuContext';

// Test wrapper component that provides ContextMenuProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ContextMenuProvider>{children}</ContextMenuProvider>
);

describe('useContextMenu Hook', () => {
  test('returns context menu functions when used within provider', () => {
    const { result } = renderHook(() => useContextMenu(), {
      wrapper: TestWrapper,
    });

    expect(result.current).toMatchObject({
      showContextMenu: expect.any(Function),
      hideContextMenu: expect.any(Function),
      isVisible: expect.any(Boolean),
    });
  });

  test('throws error when used outside provider', () => {
    // Mock console.error to suppress error logging during test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useContextMenu());
    }).toThrow('useContextMenu must be used within a ContextMenuProvider');

    consoleSpy.mockRestore();
  });

  test('initial state has isVisible as false', () => {
    const { result } = renderHook(() => useContextMenu(), {
      wrapper: TestWrapper,
    });

    expect(result.current.isVisible).toBe(false);
  });

  test('provides showContextMenu function that updates context', () => {
    const { result } = renderHook(() => useContextMenu(), {
      wrapper: TestWrapper,
    });

    // Test that showContextMenu is callable
    expect(() => {
      act(() => {
        result.current.showContextMenu({ x: 100, y: 200 }, [{ id: 'test', label: 'Test Item', onClick: () => {} }]);
      });
    }).not.toThrow();
  });

  test('provides hideContextMenu function that updates context', () => {
    const { result } = renderHook(() => useContextMenu(), {
      wrapper: TestWrapper,
    });

    // Test that hideContextMenu is callable
    expect(() => {
      act(() => {
        result.current.hideContextMenu();
      });
    }).not.toThrow();
  });
});
