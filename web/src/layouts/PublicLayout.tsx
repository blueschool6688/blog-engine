import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useRouteLoaderData } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, LogIn, Sun, Moon, Menu as MenuIcon, X as XIcon, MapPin, CloudSun, CloudRain } from 'lucide-react';
import { settingsService, getFullUrl } from '../services/api';
import { Snowfall } from '@namnguyenthanhwork/react-snowfall-effect';
import { RagChatbot } from '../components/RagChatbot';
import { Layout, Menu, Button, Drawer, Space, FloatButton, Row, Col, Typography } from 'antd';

const { Header, Content, Footer } = Layout;
const { Paragraph } = Typography;

interface WeatherData {
  city: string;
  temp: number;
  code: number;
}

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loaderData = useRouteLoaderData("root-layout") as { settings?: Record<string, string> };
  const settings = loaderData?.settings || {};
  const [weatherInfo, setWeatherInfo] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Fetch Location & Weather (Open-Meteo & IP Geolocation)
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number, cityName: string) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        if (data && data.current_weather) {
          setWeatherInfo({
            city: cityName,
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode,
          });
        }
      } catch (e) {
        console.error('Failed to fetch weather', e);
      } finally {
        setLoadingWeather(false);
      }
    };

    const fallbackIPLocation = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (ipData && ipData.latitude && ipData.longitude) {
          await fetchWeather(ipData.latitude, ipData.longitude, ipData.city || 'TP HCM');
        } else {
          await fetchWeather(10.8231, 106.6297, 'TP HCM');
        }
      } catch {
        await fetchWeather(10.8231, 106.6297, 'TP HCM');
      }
    };

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchWeather(position.coords.latitude, position.coords.longitude, 'Vị trí của bạn');
        },
        () => {
          fallbackIPLocation();
        },
        { timeout: 5000 }
      );
    } else {
      fallbackIPLocation();
    }
  }, []);

  const { language, setLanguage, t } = useLanguage();

  const formattedDate = new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  const getSiteName = () => {
    return settings.site_name || 'Blogs';
  };

  const navItems = [
    {
      key: '/',
      label: (
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `px-3 text-sm font-semibold transition-all duration-200 flex items-center h-full ${
              isActive ? 'text-accentBlue' : 'text-slate-600 dark:text-gray-400'
            }`
          }
        >
          {t('articles')}
        </NavLink>
      ),
    },
    {
      key: '/authors',
      label: (
        <NavLink
          to="/authors"
          className={({ isActive }) =>
            `px-3 text-sm font-semibold transition-all duration-200 flex items-center h-full ${
              isActive ? 'text-accentBlue' : 'text-slate-600 dark:text-gray-400'
            }`
          }
        >
          {t('authors')}
        </NavLink>
      ),
    },
    {
      key: '/feedback',
      label: (
        <NavLink
          to="/feedback"
          className={({ isActive }) =>
            `px-3 text-sm font-semibold transition-all duration-200 flex items-center h-full ${
              isActive ? 'text-accentBlue' : 'text-slate-600 dark:text-gray-400'
            }`
          }
        >
          {t('feedback')}
        </NavLink>
      ),
    },
  ];

  return (
    <Layout
      className="min-h-screen transition-colors duration-300 selection:bg-accentBlue/25 selection:text-accentBlue"
      style={{
        backgroundColor: theme === 'dark' ? 'var(--custom-dark-bg, #090D16)' : 'var(--custom-light-bg, #F8FAFC)',
      }}
    >
      {settings?.snowfall_enabled && (
        <Snowfall
          snowflakeCount={parseInt(settings?.snowfall_count || '150', 10)}
          fps={parseInt(settings?.snowfall_fps || '60', 10)}
          gravity={parseFloat(settings?.snowfall_gravity || '1')}
          size={{
            min: parseFloat(settings?.snowfall_size_min || '5'),
            max: parseFloat(settings?.snowfall_size_max || '15')
          }}
          speed={{
            min: parseFloat(settings?.snowfall_speed_min || '1'),
            max: parseFloat(settings?.snowfall_speed_max || '3')
          }}
          wind={{
            min: parseFloat(settings?.snowfall_wind_min || '-1'),
            max: parseFloat(settings?.snowfall_wind_max || '1')
          }}
          colors={settings?.snowfall_color ? settings.snowfall_color.split(',').map(c => c.trim()) : [theme === 'dark' ? '#ffffff' : '#a0aec0']}
          images={[
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTIgMlY1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik05IDVDOSAzLjUgMTAuMyAyIDEyIDJDMTMuNyAyIDE1IDMuNSAxNSA1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik05IDVIMTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxwYXRoIGQ9Ik04IDdDOCA1LjggMTYgNS44IDE2IDdDMTcuNSA5IDE3LjUgMTUgMTYgMTdDMTYgMTguNSA4IDE4LjUgOCAxN0M2LjUgMTUgNi41IDkgOCA3WiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJMTyA3VjE3IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxwYXRoIGQ9Ik0xMCA3QzEwLjggMTAgMTAuOCAxNCAxMCAxNyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8cGF0aCBkPSJNMTQgN0MxMy4yIDEwIDEzLjIgMTQgMTQgMTciIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgPHBhdGggZD0iTTkgMTdIMTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxwYXRoIGQ9Ik0xMiAxN1YyMSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8cGF0aCBkPSJNMTAuNSAyMUwxMiAyMkwxMy41IDIxIiBzdHJva2U9IndoaXRlIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=',
          ]}
          zIndex={9999}
        />
      )}

      <Header
        className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/60 shadow-sm transition-all duration-300 flex items-center justify-between"
        style={{
          background: theme === 'dark' ? 'rgba(9, 13, 22, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          padding: '0 24px',
          height: '60px',
          lineHeight: '60px',
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            {settings.logo_url ? (
              <img
                src={getFullUrl(settings.logo_url)}
                alt={getSiteName()}
                className="w-8 h-8 rounded-lg object-contain shadow-lg shadow-accentBlue/10 group-hover:scale-105 transition-all duration-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}

            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r from-accentBlue to-accentPurple flex items-center justify-center shadow-lg shadow-accentBlue/20 group-hover:scale-105 transition-all duration-200 ${settings.logo_url ? 'hidden' : ''}`}>
              <span className="font-extrabold text-white text-xs">
                {getSiteName().substring(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="font-extrabold text-lg leading-none tracking-tight">
              <span className="text-slate-600 dark:text-slate-50">{getSiteName()}</span>
            </span>
          </Link>

          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
            className="border-none bg-transparent flex-1 hidden md:flex justify-start pl-6 custom-public-menu"
            style={{ height: '60px', lineHeight: '60px' }}
          />

          <div className="hidden lg:flex items-center gap-3 px-3 h-9 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 rounded-xl text-xs select-none">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium font-sans">
              <MapPin className="w-3.5 h-3.5 text-accentBlue" />
              <span>{weatherInfo ? weatherInfo.city : (loadingWeather ? '...' : 'TP HCM')}</span>
              {weatherInfo?.temp !== undefined ? (
                <div className="flex items-center gap-1 ml-1 text-slate-800 dark:text-slate-100 font-bold">
                  {weatherInfo.code <= 3 ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  ) : weatherInfo.code >= 51 ? (
                    <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <CloudSun className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{weatherInfo.temp}°C</span>
                </div>
              ) : null}
            </div>
            <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700" />
            <div className="text-slate-500 dark:text-gray-400 font-semibold capitalize text-[11px] font-sans">
              {formattedDate}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-gray-300 select-none rounded-xl"
              title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              {language === 'vi' ? 'EN' : 'VI'}
            </Button>
            <Button
              type="text"
              onClick={toggleTheme}
              className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center p-2 rounded-xl"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            />
            <Button
              type="text"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-500 dark:text-gray-400 flex items-center justify-center p-2 rounded-xl"
              icon={mobileMenuOpen ? <XIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
            />
          </div>
        </div>
      </Header>

      <Drawer
        title={getSiteName()}
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        styles={{
          body: {
            padding: '24px 16px',
            backgroundColor: theme === 'dark' ? '#090D16' : '#fff',
          },
          header: {
            backgroundColor: theme === 'dark' ? '#090D16' : '#fff',
            borderBottom: `1px solid ${theme === 'dark' ? '#1f2937' : '#e5e7eb'}`,
          }
        }}
        className="mobile-drawer"
      >
        <Space direction="vertical" className="w-full" size="middle">
          {[
            { name: t('articles'), path: '/' },
            { name: t('authors'), path: '/authors' },
            { name: t('feedback'), path: '/feedback' },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all w-full"
            >
              {item.name}
            </Link>
          ))}
          <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 w-full">
            {isAuthenticated ? (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-btn-global transition-all w-full shadow-md shadow-accentBlue/25"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin CMS
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-btn-global transition-all w-full shadow-md shadow-accentBlue/25"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </Space>
      </Drawer>

      <Content className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10">
        <div className="fixed top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-accentBlue/4 blur-[150px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-accentPurple/4 blur-[150px] pointer-events-none -z-10" />
        <Outlet />
      </Content>

      <Footer
        className="bg-white dark:bg-[#06080F] border-t border-slate-200/80 dark:border-slate-800/60 relative z-10 transition-colors duration-300"
        style={{ padding: '40px 24px' }}
      >
        <div className="max-w-7xl mx-auto">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12} className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <span className="font-extrabold text-base">
                  <span>{getSiteName()}</span>
                </span>
              </Link>
              <Paragraph className="!text-xs !text-slate-500 dark:!text-gray-500 leading-relaxed max-w-sm">
                {settings.site_description || 'Welcome to our engineering blog. We share technical tutorials and design guides.'}
              </Paragraph>
              <div className="text-xs text-gray-400 dark:text-gray-600">
                {settings.footer_copyright || `© ${new Date().getFullYear()} DevOps.vn. All rights reserved.`}
              </div>

              {settings.footer_facebook_url || settings.footer_github_url || settings.footer_linkedin_url || settings.footer_twitter_url ? (
                <Space size="middle" className="pt-2">
                  {settings.footer_facebook_url && (
                    <a
                      href={settings.footer_facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-accentBlue transition-colors text-xs"
                    >
                      Facebook
                    </a>
                  )}
                  {settings.footer_github_url && (
                    <a
                      href={settings.footer_github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-accentBlue transition-colors text-xs"
                    >
                      Github
                    </a>
                  )}
                  {settings.footer_linkedin_url && (
                    <a
                      href={settings.footer_linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-accentBlue transition-colors text-xs"
                    >
                      Linkedin
                    </a>
                  )}
                  {settings.footer_twitter_url && (
                    <a
                      href={settings.footer_twitter_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-accentBlue transition-colors text-xs"
                    >
                      Twitter
                    </a>
                  )}
                </Space>
              ) : null}
            </Col>

            <Col xs={12} md={6} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-400">Navigation</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 dark:text-gray-500 list-none p-0 m-0">
                <li><Link to="/" className="hover:text-accentBlue transition-colors">{t('latest_articles')}</Link></li>
                <li><Link to="/authors" className="hover:text-accentBlue transition-colors">{t('meet_the_authors')}</Link></li>
                <li><Link to="/feedback" className="hover:text-accentBlue transition-colors">{t('submit_feedback')}</Link></li>
              </ul>
            </Col>

            <Col xs={12} md={6} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-400">Resources</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 dark:text-gray-500 list-none p-0 m-0">
                <li><Link to="/login" className="hover:text-accentBlue transition-colors">{t('admin_cms')}</Link></li>
                <li><Link to="/" className="hover:text-accentBlue transition-colors">{t('terms_of_service')}</Link></li>
                <li><Link to="/" className="hover:text-accentBlue transition-colors">{t('privacy_policy')}</Link></li>
              </ul>
            </Col>
          </Row>
        </div>
      </Footer>

      <FloatButton.BackTop duration={300} visibilityHeight={400} />

      <RagChatbot />
    </Layout>
  );
};

export default PublicLayout;