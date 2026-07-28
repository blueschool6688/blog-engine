import React, { useEffect, useState } from 'react';
import { Outlet, useLoaderData } from 'react-router';
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

export async function loader() {
  try {
    const res = await settingsService.getPublic();
    if (res.success && res.data) {
      return { settings: res.data };
    }
  } catch (err) {
    console.error('Failed to load global colors', err);
  }
  return { settings: {} };
}

export const RootLayout: React.FC = () => {
  const loaderData = useLoaderData() as { settings?: Record<string, string> };
  const settings = loaderData?.settings || {};
  const [primaryColor, setPrimaryColor] = useState(settings.theme_primary_color || '#3b82f6');
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
    if (settings.theme_primary_color) {
      document.documentElement.style.setProperty('--primary-color', settings.theme_primary_color);
    }
    if (settings.theme_button_bg) {
      document.documentElement.style.setProperty('--btn-bg', settings.theme_button_bg);
    }
    if (settings.theme_text_color) {
      document.documentElement.style.setProperty('--text-color', settings.theme_text_color);
    }
  }, [settings]);

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