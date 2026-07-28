import React from 'react';
import { useLoaderData, useSearchParams, useRevalidator, useNavigation } from 'react-router';
import { feedbackService } from '../services/api';
import type { Feedback } from '../services/api';
import { useToast } from '../context/ToastContext';
import { MessageSquare, Star, Trash2, CheckCircle2, Archive, Loader, RefreshCw } from 'lucide-react';

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status') || '';
  const limit = 15;
  const offset = 0; // Pagination can be added later

  try {
    const res = await feedbackService.listFeedbacks({
      status: statusFilter || undefined,
      offset,
      limit,
    });
    if (res.success && res.data) {
      return { feedbacks: res.data.items || [] };
    }
  } catch (err: any) {
    console.error('Failed to fetch feedbacks', err);
  }
  return { feedbacks: [] };
}

export const FeedbacksAdmin: React.FC = () => {
  const { showSuccess, showError } = useToast();
  
  const { feedbacks } = useLoaderData() as { feedbacks: Feedback[] };
  const { revalidate } = useRevalidator();
  const navigation = useNavigation();
  const loading = navigation.state === 'loading';

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const handleUpdateStatus = async (id: number, status: 'reviewed' | 'archived') => {
    try {
      const res = await feedbackService.updateFeedbackStatus(id, status);
      if (res.success) {
        showSuccess(`Feedback marked as ${status}`);
        revalidate();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update feedback status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this feedback?')) return;
    try {
      const res = await feedbackService.deleteFeedback(id);
      if (res.success) {
        showSuccess('Feedback deleted successfully');
        revalidate();
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete feedback');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-white">User Feedbacks</h2>
          <p className="text-sm text-gray-400">View and moderate reader suggestions, reviews, and bug reports.</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (e.target.value) next.set('status', e.target.value);
                else next.delete('status');
                return next;
              });
            }}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-gray-250 rounded-xl text-sm focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={() => revalidate()}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-850 dark:hover:text-gray-200 transition-all disabled:opacity-50"
            title="Refresh feedbacks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-900/30">
        {loading && feedbacks.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Loader className="w-10 h-10 animate-spin text-accentBlue mx-auto" />
            <p className="text-sm text-gray-500">Retrieving feedbacks list...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-sm text-gray-500">No feedbacks found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/50 text-xs font-semibold text-gray-450 uppercase bg-slate-100/50 dark:bg-slate-900/10">
                  <th className="py-4 px-6">Sender</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Message</th>
                  <th className="py-4 px-6">Submitted</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {feedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    {/* Sender details */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800 dark:text-gray-150">{fb.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]" title={fb.email}>
                        {fb.email}
                      </div>
                    </td>

                    {/* Star Rating */}
                    <td className="py-4 px-6">
                      <div className="flex space-x-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Subject & Message Content */}
                    <td className="py-4 px-6 max-w-sm">
                      {fb.subject && (
                        <div className="font-semibold text-xs text-accentPurple mb-0.5 truncate">
                          {fb.subject}
                        </div>
                      )}
                      <p className="text-xs text-slate-700 dark:text-gray-300 whitespace-pre-line line-clamp-3">
                        {fb.content}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {formatDate(fb.created_at)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          fb.status === 'pending'
                            ? 'bg-warningYellow/10 text-warningYellow border border-warningYellow/20'
                            : fb.status === 'reviewed'
                            ? 'bg-successGreen/10 text-successGreen border border-successGreen/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-gray-400'
                        }`}
                      >
                        {fb.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {fb.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(fb.id, 'reviewed')}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-lg text-successGreen transition-colors"
                            title="Mark as reviewed"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {fb.status !== 'archived' && (
                          <button
                            onClick={() => handleUpdateStatus(fb.id, 'archived')}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-lg text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors"
                            title="Archive feedback"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(fb.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-lg text-gray-500 hover:text-dangerRed transition-colors"
                          title="Delete feedback"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export function HydrateFallback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
        </div>
      </div>
      <div className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" />
    </div>
  );
}

export default FeedbacksAdmin;
