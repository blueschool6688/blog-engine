import React, { useEffect, useState } from 'react';
import { commentService } from '../services/api';
import type { Comment } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

export async function loader() {
  return null;
}
import {
  MessageSquare,
  Check,
  X as XIcon,
  Trash2,
  Clock,
  Loader,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const CommentModeration: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // default to pending for moderation priority
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  // Single delete state
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);

  const { showSuccess, showError } = useToast();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const res = await commentService.listAll({
        status: statusFilter || undefined,
        offset,
        limit,
      });
      if (res.success && res.data) {
        setComments(res.data.items || []);
        setTotal(res.data.total || 0);
      }

      // Fetch pending count separately
      const countRes = await commentService.getPendingCount();
      if (countRes.success && countRes.data) {
        setPendingCount(countRes.data.count || 0);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [statusFilter, page]);

  const handleApprove = async (id: number) => {
    try {
      await commentService.approve(id);
      showSuccess('Comment approved successfully');
      fetchComments();
    } catch (err) {
      console.error(err);
      showError('Failed to approve comment');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await commentService.reject(id);
      showSuccess('Comment rejected successfully');
      fetchComments();
    } catch (err) {
      console.error(err);
      showError('Failed to reject comment');
    }
  };

  const confirmDelete = async () => {
    if (deleteCommentId === null) return;
    try {
      await commentService.deleteComment(deleteCommentId);
      showSuccess('Comment deleted permanently');
      fetchComments();
    } catch (err) {
      console.error(err);
      showError('Failed to delete comment');
    } finally {
      setDeleteCommentId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteCommentId !== null}
        title="Delete Comment"
        message="Are you sure you want to permanently delete this comment? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteCommentId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Comment Moderation
          </h2>
          <p className="text-sm text-gray-500 mt-1">Review reader comments, approve quality contributions, or reject spam.</p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl text-amber-500 text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
            <AlertCircle className="w-4 h-4" />
            <span>{pendingCount} Pending Reviews</span>
          </div>
        )}
      </div>

      {/* Filters and List */}
      <div className="glass-panel border border-slate-800/50 rounded-2xl overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/50 bg-slate-100/30 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 rounded-xl self-start">
            {[
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' },
              { label: 'All', value: '' },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => {
                  setStatusFilter(btn.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === btn.value
                    ? 'bg-white dark:bg-slate-800 text-accentBlue shadow-sm'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-850 dark:hover:text-gray-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchComments}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="text-xs text-gray-500">Total: {total}</div>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="p-12 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-accentBlue mb-4" />
            <p className="text-sm text-gray-500">Loading comments list...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center border-dashed border-slate-800 rounded-2xl">
            <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-300">No comments found</h3>
            <p className="text-xs text-gray-600 mt-1 font-sans">No comments match the selected filter status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/50 text-xs font-semibold text-gray-400 uppercase bg-slate-900/10">
                  <th className="p-4 w-[180px]">Author</th>
                  <th className="p-4">Comment Content</th>
                  <th className="p-4 w-[120px]">Spam Score</th>
                  <th className="p-4 w-[100px]">Status</th>
                  <th className="p-4 w-[130px]">Created At</th>
                  <th className="p-4 text-right w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {comments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="p-4 align-top">
                      <p className="font-semibold text-sm text-gray-200">{item.author_name}</p>
                      <p className="text-[10px] text-gray-500 font-sans mt-0.5">Post ID: {item.post_id}</p>
                    </td>
                    <td className="p-4 align-top text-sm text-gray-300 font-sans leading-relaxed whitespace-pre-wrap max-w-lg break-words">
                      {item.content}
                    </td>
                    <td className="p-4 align-top text-sm font-sans">
                      {item.spam_score !== undefined && item.spam_score !== null ? (
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.spam_score >= 0.85
                              ? 'bg-red-500/15 border border-red-500/25 text-red-500'
                              : item.spam_score >= 0.5
                              ? 'bg-amber-500/15 border border-amber-500/25 text-amber-500'
                              : 'bg-green-500/15 border border-green-500/25 text-green-500'
                          }`}>
                            {item.spam_score >= 0.85 ? 'Spam 🚨' : item.spam_score >= 0.5 ? 'Suspicious ⚠️' : 'Safe ✓'}
                          </span>
                          <p className="text-[10px] text-gray-500 font-medium">Score: {(item.spam_score * 100).toFixed(0)}%</p>
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-4 align-top text-sm">
                      {item.status === 'approved' ? (
                        <span className="inline-flex items-center space-x-1 text-successGreen bg-successGreen/10 border border-successGreen/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <Check className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      ) : item.status === 'rejected' ? (
                        <span className="inline-flex items-center space-x-1 text-dangerRed bg-dangerRed/10 border border-dangerRed/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <XIcon className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-warningYellow bg-warningYellow/10 border border-warningYellow/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-top text-xs text-gray-500 font-sans">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {item.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="p-2 bg-successGreen/10 hover:bg-successGreen/20 border border-successGreen/30 rounded-lg text-successGreen transition-all"
                            title="Approve comment"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {item.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(item.id)}
                            className="p-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 rounded-lg text-gray-400 hover:text-white transition-all"
                            title="Reject comment"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteCommentId(item.id)}
                          className="p-2 bg-dangerRed/10 hover:bg-dangerRed/20 border border-dangerRed/30 rounded-lg text-dangerRed transition-all"
                          title="Delete comment permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {total > limit && (
          <div className="p-4 border-t border-slate-800/50 bg-slate-900/10 flex justify-between items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500 font-medium">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              disabled={page * limit >= total}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModeration;
