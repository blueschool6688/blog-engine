import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useRouteLoaderData } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, LogIn, Sun, Moon, ArrowUp, Menu, X, MapPin, CloudSun, CloudRain } from 'lucide-react';
import { settingsService, getFullUrl } from '../services/api';
import { Snowfall } from '@namnguyenthanhwork/react-snowfall-effect';
import { RagChatbot } from '../components/RagChatbot';

interface WeatherData {
  city: string;
  temp: number;
  code: number;
}

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loaderData = useRouteLoaderData("root-layout") as { settings?: Record<string, string> };
  const settings = loaderData?.settings || {};
  const [weatherInfo, setWeatherInfo] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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



  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-5 flex flex-col transition-colors duration-300 selection:bg-accentBlue/25 selection:text-accentBlue" style={{ backgroundColor: theme === 'dark' ? 'var(--custom-dark-bg)' : 'var(--custom-light-bg)' }}>
      {settings?.snowfall_enabled && (
        <Snowfall
          snowflakeCount={parseInt(settings?.snowfall_count || '150', 10)}
          // snowflakeShape={(settings?.snowfall_shape as any) || 'circle'}
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
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KICA8cGF0aCBkPSJNMTIgMlY1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik05IDVDOSAzLjUgMTAuMyAyIDEyIDJDMTMuNyAyIDE1IDMuNSAxNSA1IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik05IDVIMTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxwYXRoIGQ9Ik04IDdDOCA1LjggMTYgNS44IDE2IDdDMTcuNSA5IDE3LjUgMTUgMTYgMTdDMTYgMTguNSA4IDE4LjUgOCAxN0M2LjUgMTUgNi41IDkgOCA3WiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CiAgPHBhdGggZD0iTTEyIDdWMTciIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgPHBhdGggZD0iTTEwIDdDMTAuOCAxMCAxMC44IDE0IDEwIDE3IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxwYXRoIGQ9Ik0xNCA3QzEzLjIgMTAgMTMuMiAxNCAxNCAxNyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8cGF0aCBkPSJNOSAxN0gxNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHBhdGggZD0iTTEyIDE3VjIxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogIDxwYXRoIGQ9Ik0xMC41IDIxTDEyIDIyTDEzLjUgMjEiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==',
          ]}
          zIndex={9999}
        />
      )}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 dark:bg-[#090D16]/90 border-b border-slate-200/80 dark:border-slate-800/60 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setMobileMenuOpen(false)}>
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

            <div className={`w-8 h-8 rounded-lg from-accentBlue to-accentPurple flex items-center justify-center shadow-lg shadow-accentBlue/20 group-hover:scale-105 transition-all duration-200 ${settings.logo_url ? 'hidden' : ''}`}>
              <span className="font-extrabold text-white text-xs">
                {getSiteName().substring(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="font-extrabold text-lg leading-none tracking-tight">
              <span className="text-slate-600 dark:text-slate-50">{getSiteName()}</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {[
              { name: t('articles'), path: '/' },
              { name: t('authors'), path: '/authors' },
              { name: t('feedback'), path: '/feedback' },
            ].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'text-accentBlue bg-accentBlue/8 dark:bg-accentBlue/12'
                    : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 rounded-xl text-xs select-none">
            {/* Location & Weather */}
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
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

            {/* Date info */}
            <div className="text-slate-500 dark:text-gray-400 font-semibold capitalize text-[11px]">
              {formattedDate}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-[#151B2C]/40 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold text-slate-700 dark:text-gray-300 transition-all select-none"
              title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              {language === 'vi' ? 'EN' : 'VI'}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-800/80 transition-all duration-200"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {/* {isAuthenticated ? (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-btn-global hover:opacity-90 transition-all duration-200 shadow-md shadow-accentBlue/25"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t('admin_cms')}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-btn-global hover:opacity-90 transition-all duration-200 shadow-md shadow-accentBlue/25"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('login')}</span>
              </Link>
            )} */}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/60 bg-white dark:bg-[#090D16] px-4 py-4 space-y-2 animate-fade-in">
            {[
              { name: t('articles'), path: '/' },
              { name: t('authors'), path: '/authors' },
              { name: t('feedback'), path: '/feedback' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all"
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-slate-100 dark:border-slate-800/50 pt-2">
              {isAuthenticated ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-accentBlue bg-accentBlue/8 hover:bg-accentBlue/12 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin CMS
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-accentBlue bg-accentBlue/8 hover:bg-accentBlue/12 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10">
        <div className="fixed top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-accentBlue/4 blur-[150px] pointer-events-none -z-10" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-accentPurple/4 blur-[150px] pointer-events-none -z-10" />

        <Outlet />
      </main>

      <footer className="bg-white dark:bg-[#06080F] border-t border-slate-200/80 dark:border-slate-800/60 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-slate-200/60 dark:border-slate-800/40 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-extrabold text-base">
                <span className="">{getSiteName()}</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-gray-500 leading-relaxed max-w-sm">
              {settings.site_description || 'Welcome to our engineering blog. We share technical tutorials and design guides.'}
            </p>
            <div className="text-xs text-gray-400 dark:text-gray-600">
              {settings.footer_copyright || `© ${new Date().getFullYear()} DevOps.vn. All rights reserved.`}
            </div>

            {settings.footer_facebook_url || settings.footer_github_url || settings.footer_linkedin_url || settings.footer_twitter_url && (
              <div className="flex space-x-3.5 pt-2">
                {settings.footer_facebook_url && (
                  <a
                    href={settings.footer_facebook_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-accentBlue transition-colors p-1"
                  >
                    Facebook
                  </a>
                )}
                {settings.footer_github_url && (
                  <a
                    href={settings.footer_github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-accentBlue transition-colors p-1"
                  >
                    Github
                  </a>
                )}
                {settings.footer_linkedin_url && (
                  <a
                    href={settings.footer_linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-accentBlue transition-colors p-1"
                  >
                    Linkedin
                  </a>
                )}
                {settings.footer_twitter_url && (
                  <a
                    href={settings.footer_twitter_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-accentBlue transition-colors p-1"
                  >
                    Twitter
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-750 dark:text-gray-400">Navigation</h4>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-gray-500">
              <li><Link to="/" className="hover:text-primary-global transition-colors">{t('latest_articles')}</Link></li>
              <li><Link to="/authors" className="hover:text-primary-global transition-colors">{t('meet_the_authors')}</Link></li>
              <li><Link to="/feedback" className="hover:text-primary-global transition-colors">{t('submit_feedback')}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-750 dark:text-gray-400">Resources</h4>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-gray-500">
              <li><Link to="/login" className="hover:text-primary-global transition-colors">{t('admin_cms')}</Link></li>
              <li><Link to="/" className="hover:text-primary-global transition-colors">{t('terms_of_service')}</Link></li>
              <li><Link to="/" className="hover:text-primary-global transition-colors">{t('privacy_policy')}</Link></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        style={{ opacity: showScrollTop ? 1 : 0, pointerEvents: showScrollTop ? 'auto' : 'none' }}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-accentBlue text-white hover:bg-accentBlue/90 hover:scale-105 shadow-lg shadow-accentBlue/30 transition-all duration-300 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      <RagChatbot />
    </div>
  );
};
export default PublicLayout;