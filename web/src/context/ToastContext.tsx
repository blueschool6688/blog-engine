import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'warning', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const showError = useCallback((msg: string) => addToast('error', msg), [addToast]);
  const showWarning = useCallback((msg: string) => addToast('warning', msg), [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let bgClass = '';
          let borderClass = '';
          let textClass = '';
          let Icon = CheckCircle;

          switch (toast.type) {
            case 'success':
              bgClass = 'bg-emerald-950/95 text-emerald-100';
              borderClass = 'border-emerald-500/30';
              textClass = 'text-emerald-400 hover:text-emerald-200';
              Icon = CheckCircle;
              break;
            case 'error':
              bgClass = 'bg-rose-950/95 text-rose-100';
              borderClass = 'border-rose-500/30';
              textClass = 'text-rose-400 hover:text-rose-200';
              Icon = AlertCircle;
              break;
            case 'warning':
              bgClass = 'bg-amber-950/95 text-amber-100';
              borderClass = 'border-amber-500/30';
              textClass = 'text-amber-400 hover:text-amber-200';
              Icon = AlertTriangle;
              break;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 ${bgClass} ${borderClass}`}
              style={{
                animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-current" />
              <div className="flex-1 text-sm font-medium leading-5">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${textClass}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      {/* CSS Animation injection */}
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
