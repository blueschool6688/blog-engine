import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
export async function loader() {
  return null;
}

export const NotFound: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D0E14] text-slate-800 dark:text-gray-200 flex flex-col justify-between font-sans transition-colors duration-300 relative overflow-hidden select-none">
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-accentBlue/6 blur-[150px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-accentPurple/6 blur-[150px] pointer-events-none -z-10 animate-pulse" />

      <header className="max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-end z-10 shrink-0">
        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#151B2C]/40 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold text-slate-700 dark:text-gray-300 transition-all shadow-sm"
          title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
          {language === 'vi' ? 'EN' : 'VI'}
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 z-10">
        <div className="max-w-md w-full glass-panel border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 md:p-10 text-center space-y-6 bg-white/60 dark:bg-slate-900/30 shadow-2xl relative">

          <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/15 animate-bounce">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-tr from-accentBlue via-accentPurple to-pink-500 bg-clip-text text-transparent drop-shadow-sm select-none">
              404
            </h1>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {t('page_not_found')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed font-sans">
              {t('page_not_found_desc')}
            </p>
          </div>

          <div className="bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold font-sans">
              {t('redirecting_home').replace('{seconds}', String(countdown))}
            </p>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accentBlue to-accentPurple transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(countdown / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-650 dark:text-gray-300 rounded-xl text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('back')}</span>
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-btn-global hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-accentBlue/10"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('back_to_home')}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
