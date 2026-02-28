import { useState, useCallback, useEffect, createContext, useContext } from 'react';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const JWT_STORAGE_KEY = 'jwt';

function getStoredToken(): string | null {
  return localStorage.getItem(JWT_STORAGE_KEY);
}

export function useAuthState(): AuthContextType {
  const [token, setTokenState] = useState<string | null>(() => getStoredToken());

  useEffect(() => {
    if (token) {
      localStorage.setItem(JWT_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(JWT_STORAGE_KEY);
    }
  }, [token]);

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
  }, []);

  return {
    token,
    isAuthenticated: token !== null,
    setToken,
    logout,
  };
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
