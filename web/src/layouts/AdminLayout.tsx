import React from 'react';
import { Link, useLocation, Outlet } from 'react-router';
import { LayoutDashboard, Image, FileText, Folder, Tag, Heart, LogOut, Settings, Users, ActivitySquare, MessageSquare, Sun, Moon, Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getFullUrl } from '../services/api';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const auth = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const isAdmin = auth.user?.role === 'admin';

  const menuItems = [
    { name: t('dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: t('posts'), path: '/admin/posts', icon: FileText },
    { name: t('media_library'), path: '/admin/media', icon: Image },
    { name: t('categories'), path: '/admin/categories', icon: Folder },
    { name: t('tags'), path: '/admin/tags', icon: Tag },
    { name: t('comments'), path: '/admin/comments', icon: MessageSquare },
    { name: t('feedbacks'), path: '/admin/feedbacks', icon: Heart },
    { name: t('translate_jobs'), path: '/admin/translate-jobs', icon: Languages },
    { name: t('settings'), path: '/admin/settings', icon: Settings },
    ...(isAdmin ? [
      { name: t('users'), path: '/admin/users', icon: Users },
      { name: t('audit_logs'), path: '/admin/audit-logs', icon: ActivitySquare },
    ] : []),
  ];

  /** Returns the display initial(s) for the avatar fallback */
  const getInitial = (): string => {
    const name = auth.user?.name;
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  };

  const getPageTitle = () => {
    const segment = location.pathname.replace('/admin/', '').split('/')[0];
    if (location.pathname === '/admin') return t('dashboard');
    if (segment === 'posts') return t('posts');
    if (segment === 'media') return t('media_library');
    if (segment === 'categories') return t('categories');
    if (segment === 'tags') return t('tags');
    if (segment === 'comments') return t('comments');
    if (segment === 'feedbacks') return t('feedbacks');
    if (segment === 'settings') return t('settings');
    if (segment === 'users') return t('users');
    if (segment === 'audit-logs') return t('audit_logs');
    if (segment === 'translate-jobs') return t('translate_jobs');
    return segment;
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-black text-slate-800 dark:text-gray-150 transition-colors duration-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-200 dark:border-slate-800/50 flex flex-col z-20">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accentBlue to-accentPurple flex items-center justify-center shadow-lg shadow-accentBlue/20">
              <span className="font-bold text-white text-base">B</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-gray-250 dark:to-gray-400 bg-clip-text text-transparent">
              CMS Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-gradient-to-r from-accentBlue/20 to-accentPurple/10 border-l-4 border-accentBlue text-accentBlue'
                  : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
                  }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-accentBlue' : 'text-slate-400 dark:text-gray-450 group-hover:text-slate-650 dark:group-hover:text-gray-200'
                    }`}
                />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 glass-header border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-8 z-10">
          <h1 className="text-lg font-semibold text-slate-850 dark:text-gray-100 capitalize">
            {getPageTitle()}
          </h1>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-gray-300 transition-all select-none"
              title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              {language === 'vi' ? 'EN' : 'VI'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-200"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700/60" />

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/50 overflow-hidden flex items-center justify-center font-bold text-accentBlue shrink-0">
                {auth.user?.avatar_url ? (
                  <img
                    src={getFullUrl(auth.user.avatar_url)}
                    alt={auth.user.name ?? 'User avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitial()
                )}
              </div>

              {/* Name & Role */}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-700 dark:text-gray-250 leading-tight">
                  {auth.user?.name ?? 'Admin User'}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 capitalize">
                  {auth.user?.role ?? 'System Administrator'}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700/60" />

            {/* Logout Button */}
            <button
              onClick={auth.logout}
              title={t('sign_out')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-dangerRed hover:bg-dangerRed/10 border border-slate-200 dark:border-transparent dark:hover:border-dangerRed/20 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('sign_out')}</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;