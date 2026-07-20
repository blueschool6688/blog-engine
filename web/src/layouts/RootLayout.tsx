import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { settingsService } from '../services/api';
import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const RootLayout: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchGlobalTheme = async () => {
      try {
        const res = await settingsService.get();
        if (res.success && res.data) {
          const s = res.data;
          if (s.theme_primary_color) {
            setPrimaryColor(s.theme_primary_color);
            document.documentElement.style.setProperty('--primary-color', s.theme_primary_color);
          }
          if (s.theme_button_bg) {
            document.documentElement.style.setProperty('--btn-bg', s.theme_button_bg);
          }
          if (s.theme_text_color) {
            document.documentElement.style.setProperty('--text-color', s.theme_text_color);
          }
        }
      } catch (err) {
        console.error('Failed to load global colors', err);
      }
    };
    fetchGlobalTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ConfigProvider
          theme={{
            algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
              colorPrimary: primaryColor,
              borderRadius: 12,
            },
          }}
        >
          <AuthProvider>
            <LanguageProvider>
              <ToastProvider>
                <Outlet />
              </ToastProvider>
            </LanguageProvider>
          </AuthProvider>
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;