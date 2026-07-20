import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import { setCookie } from '../utils/cookie';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rootData = useRouteLoaderData("root") as { theme: Theme; language: string } | null;
  const [theme, setTheme] = useState<Theme>(() => rootData?.theme || 'dark');

  useEffect(() => {
    if (rootData?.theme) {
      setTheme(rootData.theme);
    }
  }, [rootData?.theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setCookie('theme', nextTheme, 365);

    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (nextTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};