import React, { useState } from 'react';
import { Spin, Tooltip } from 'antd';
import { Languages, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';
import { useTranslate } from '../hooks/useTranslate';
import { useLanguage } from '../context/LanguageContext';

interface TranslateToggleProps {
  /** Nội dung HTML cần dịch (dangerouslySetInnerHTML content) */
  content: string;
  /** className bổ sung cho wrapper ngoài */
  className?: string;
}

/**
 * TranslateToggle — Component cho phép người dùng dịch nội dung bài viết sang ngôn ngữ còn lại.
 *
 * Tính năng:
 * - Lazy loading: chỉ gọi API khi người dùng bấm nút
 * - Tự động phát hiện async mode (nội dung dài > 3000 chars)
 * - Loading states: spinner ngắn (sync) và "Đang xử lý..." (async job)
 * - Cache badge: hiển thị ✓ Cached khi kết quả từ Memcached
 * - Partial badge: hiển thị ⚠ Partial khi có ≥1 chunk fallback về gốc
 * - Fallback: cảnh báo màu vàng + nội dung gốc khi dịch lỗi hoàn toàn
 */
const TranslateToggle: React.FC<TranslateToggleProps> = ({ content, className }) => {
  const { language } = useLanguage();
  const [showTranslated, setShowTranslated] = useState(false);

  // Ngôn ngữ đích luôn là ngôn ngữ ngược lại với UI hiện tại
  const targetLang = language === 'vi' ? 'en' : 'vi';
  const targetLabel = language === 'vi' ? 'English' : 'Tiếng Việt';
  const currentLabel = language === 'vi' ? 'Tiếng Việt' : 'English';

  const { translatedText, progress, isLoading, error, isFromCache, isPartial } = useTranslate(
    content,
    targetLang,
    showTranslated
  );

  const handleToggle = () => {
    setShowTranslated(prev => !prev);
  };

  // Nội dung hiển thị: bản dịch nếu có, nếu không thì nội dung gốc
  const displayContent = showTranslated && translatedText ? translatedText : content;

  // Label của nút theo trạng thái
  const buttonLabel = (() => {
    if (progress === 'loading') return 'Đang kết nối...';
    if (progress === 'processing') return 'Đang dịch nội dung dài...';
    if (showTranslated) return `← ${currentLabel}`;
    return `Dịch sang ${targetLabel}`;
  })();

  return (
    <div className={className}>
      {/* Thanh điều khiển */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/40">
        {/* Label ngôn ngữ hiện tại */}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-600 flex items-center gap-1.5">
          <Languages className="w-3.5 h-3.5" />
          {showTranslated && translatedText ? targetLabel : currentLabel}
        </span>

        <div className="flex items-center gap-2">
          {/* Badge: Partial warning */}
          {showTranslated && isPartial && !isLoading && (
            <Tooltip title="Một số phần không thể dịch — hiển thị nội dung gốc tại những vị trí đó">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-2.5 h-2.5" />
                Partial
              </span>
            </Tooltip>
          )}

          {/* Badge: Cache hit */}
          {showTranslated && isFromCache && !isLoading && !isPartial && (
            <Tooltip title="Kết quả từ cache — không tốn API call">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Cached
              </span>
            </Tooltip>
          )}

          {/* Badge: Async processing */}
          {progress === 'processing' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 px-2 py-0.5 rounded-full">
              <Layers className="w-2.5 h-2.5" />
              Nội dung dài
            </span>
          )}

          {/* Nút toggle */}
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`
              inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border
              transition-all duration-200 select-none
              ${showTranslated && !isLoading
                ? 'bg-accentBlue text-white border-accentBlue shadow-sm shadow-accentBlue/20'
                : 'bg-white dark:bg-slate-900/40 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-slate-800/60 hover:border-accentBlue/50 hover:text-accentBlue dark:hover:text-accentBlue'
              }
              ${isLoading ? 'opacity-70 cursor-wait' : 'cursor-pointer'}
            `}
            aria-label={showTranslated ? `Switch back to ${currentLabel}` : `Translate to ${targetLabel}`}
          >
            {isLoading ? (
              <>
                <Spin size="small" />
                <span>{buttonLabel}</span>
              </>
            ) : (
              <>
                <Languages className="w-3.5 h-3.5" />
                <span>{buttonLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thông báo khi đang xử lý nội dung dài (async job) */}
      {progress === 'processing' && (
        <div className="flex items-center gap-2.5 mb-4 p-3 bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-700/40 rounded-xl text-xs text-blue-700 dark:text-blue-400">
          <Spin size="small" />
          <span>
            Đang dịch nội dung dài, vui lòng chờ trong giây lát...
          </span>
        </div>
      )}

      {/* Cảnh báo khi dịch lỗi hoàn toàn — vẫn hiển thị nội dung gốc */}
      {showTranslated && progress === 'failed' && error && (
        <div className="flex items-start gap-2.5 mb-4 p-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/40 rounded-xl text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Không thể kết nối dịch vụ AI. Đang hiển thị nội dung gốc.</span>
        </div>
      )}

      {/* Khu vực nội dung */}
      <div
        className={`post-content transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
    </div>
  );
};

export default TranslateToggle;
