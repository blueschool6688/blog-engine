import React, { useState } from 'react';
import { feedbackService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Star, Send, MessageSquare, Loader, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

export async function loader() {
  return null;
}

export const FeedbackNew: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) {
      showError(t('fill_fields'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await feedbackService.sendFeedback({
        name,
        email,
        subject: subject.trim() || undefined,
        content,
        rating,
      });

      if (res.success) {
        setSubmitted(true);
        showSuccess(t('feedback_success'));
      } else {
        showError(t('feedback_error') || 'Failed');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || t('something_went_wrong') || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 text-center space-y-5 bg-white/40 dark:bg-slate-900/30">
          <div className="w-16 h-16 bg-successGreen/10 dark:bg-successGreen/20 text-successGreen rounded-full flex items-center justify-center mx-auto shadow-lg shadow-successGreen/10 animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-850 dark:text-white">{t('feedback_sent')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('feedback_success_desc')}
          </p>
          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-accentBlue/10"
            >
              {t('back_to_home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-accentBlue/10 dark:bg-accentBlue/20 text-accentBlue rounded-full shadow-inner mb-2">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('submit_feedback')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t('feedback_desc')}
          </p>
        </div>

        <div className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 md:p-8 bg-white/40 dark:bg-slate-900/30">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Rating Selector */}
            <div className="space-y-2 flex flex-col items-center py-4 bg-slate-100/40 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-slate-800/30">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                {t('overall_rating')}
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 hover:scale-125 transition-transform duration-100"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= (hoverRating ?? rating)
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-gray-400 dark:text-gray-600'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {rating === 5 && t('excellent')}
                {rating === 4 && t('good')}
                {rating === 3 && t('average')}
                {rating === 2 && t('poor')}
                {rating === 1 && t('terrible')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('your_name')} <span className="text-dangerRed">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('email_address')} <span className="text-dangerRed">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                {t('subject_optional')}
              </label>
              <input
                type="text"
                placeholder={t('subject_optional')}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                {t('your_feedback_msg')} <span className="text-dangerRed">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-accentBlue/10 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{t('send_feedback')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackNew;
