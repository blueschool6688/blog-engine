import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, LogIn, Sun, Moon, ArrowUp, Menu, X } from 'lucide-react';
import { settingsService, getFullUrl } from '../services/api';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsService.get();
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { language, setLanguage, t } = useLanguage();

  const getSiteName = () => {
    return settings.site_name || 'Blogs';
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D0E14] text-slate-800 dark:text-gray-200 flex flex-col transition-colors duration-300 selection:bg-accentBlue/25 selection:text-accentBlue">
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 dark:bg-[#0D0E14]/90 border-b border-slate-200/80 dark:border-slate-800/60 shadow-sm transition-all duration-300">
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
              <span className="">{getSiteName()}</span>
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
          <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800/60 bg-white dark:bg-[#0D0E14] px-4 py-4 space-y-2 animate-fade-in">
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

      <footer className="bg-white dark:bg-[#0A0B10] border-t border-slate-200/80 dark:border-slate-800/60 relative z-10 transition-colors duration-300">
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
    </div>
  );
};
export default PublicLayout;