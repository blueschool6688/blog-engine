import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import { setCookie } from '../utils/cookie';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  lightBg: string;
  darkBg: string;
}

const DEFAULT_COLORS: ThemeColors = {
  lightBg: '#F8FAFC',
  darkBg: '#090D16',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  updateThemeColors: (newColors: Partial<ThemeColors>) => void;
  resetThemeColors: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rootData = useRouteLoaderData("root") as { theme: Theme; language: string } | null;
  const [theme, setTheme] = useState<Theme>(() => rootData?.theme || 'dark');
  const [colors, setColors] = useState<ThemeColors>(() => {
    if (typeof window !== 'undefined') {
      const savedLight = localStorage.getItem('theme_light_bg');
      const savedDark = localStorage.getItem('theme_dark_bg');
      return {
        lightBg: savedLight || DEFAULT_COLORS.lightBg,
        darkBg: savedDark || DEFAULT_COLORS.darkBg,
      };
    }
    return DEFAULT_COLORS;
  });

  const applyColorsToDOM = (currentTheme: Theme, currentColors: ThemeColors) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.style.setProperty('--custom-light-bg', currentColors.lightBg);
      root.style.setProperty('--custom-dark-bg', currentColors.darkBg);

      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    if (rootData?.theme) {
      setTheme(rootData.theme);
    }
  }, [rootData?.theme]);

  useEffect(() => {
    applyColorsToDOM(theme, colors);
  }, [theme, colors]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setCookie('theme', nextTheme, 365);
    applyColorsToDOM(nextTheme, colors);
  };

  const updateThemeColors = (newColors: Partial<ThemeColors>) => {
    const updated = { ...colors, ...newColors };
    setColors(updated);
    if (newColors.lightBg) localStorage.setItem('theme_light_bg', newColors.lightBg);
    if (newColors.darkBg) localStorage.setItem('theme_dark_bg', newColors.darkBg);
    applyColorsToDOM(theme, updated);
  };

  const resetThemeColors = () => {
    setColors(DEFAULT_COLORS);
    localStorage.removeItem('theme_light_bg');
    localStorage.removeItem('theme_dark_bg');
    applyColorsToDOM(theme, DEFAULT_COLORS);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, updateThemeColors, resetThemeColors }}>
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