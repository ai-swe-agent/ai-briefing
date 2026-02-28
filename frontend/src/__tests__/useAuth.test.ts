import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthState } from '../hooks/useAuth';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useAuthState', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with null token when localStorage is empty', () => {
    const { result } = renderHook(() => useAuthState());
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should initialize with token from localStorage', () => {
    localStorageMock.setItem('jwt', 'existing-token');
    const { result } = renderHook(() => useAuthState());
    expect(result.current.token).toBe('existing-token');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should set token in state and localStorage', () => {
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.setToken('new-token');
    });

    expect(result.current.token).toBe('new-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('jwt', 'new-token');
  });

  it('should remove token on logout', () => {
    localStorageMock.setItem('jwt', 'token-to-remove');
    const { result } = renderHook(() => useAuthState());

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('jwt');
  });
});
