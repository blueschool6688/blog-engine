import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
        <h3 className="text-lg font-bold text-slate-850 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 dark:hover:bg-slate-950 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl text-sm font-semibold transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
