import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../services/api';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  nickname?: string;
  email: string;
  avatar_url: string | null;
  bio?: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * On mount, try to restore session from localStorage.
   * Calls /auth/me with the stored token. If invalid, clears state.
   */
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<{ data: User }>('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.data);
      } catch {
        // Token is invalid or expired — clear it
        localStorage.removeItem('access_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Log in by POSTing credentials to /auth/login.
   * Stores the returned access_token and sets user state.
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const response = await api.post<{ data: { access_token: string; user: User } }>('/auth/login', {
      email,
      password,
    });

    const { access_token, user: loggedInUser } = response.data.data;

    localStorage.setItem('access_token', access_token);
    setUser(loggedInUser);
  }, []);

  /**
   * Log out: POST /auth/logout, clear token, reset user state, navigate to /login.
   */
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await api.post('/auth/logout', null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Ignore logout API errors — we still clear local state
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>. Make sure it wraps your router.');
  }
  return ctx;
};
