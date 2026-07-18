import React, { useEffect, useState } from 'react';
import { MessageSquare, CornerDownRight, Send } from 'lucide-react';
import { commentService } from '../services/api';
import type { Comment, ReactionCount } from '../services/api';
import { useToast } from '../context/ToastContext';

interface CommentSectionProps {
  postId: number;
}

const EMOJIS = [
  { key: 'like', label: '👍', title: 'Like' },
  { key: 'love', label: '❤️', title: 'Love' },
  { key: 'wow', label: '😲', title: 'Wow' },
  { key: 'haha', label: '😂', title: 'Haha' },
  { key: 'sad', label: '😢', title: 'Sad' },
];

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyName, setReplyName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    try {
      const [commentsRes, reactionsRes] = await Promise.all([
        commentService.listComments(postId),
        commentService.getReactions(postId),
      ]);
      setComments(commentsRes.data || []);
      setReactions(reactionsRes.data || []);
    } catch (err) {
      console.error('Failed to load comments/reactions', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [postId]);

  const handleReact = async (emoji: string) => {
    try {
      const res = await commentService.react(postId, emoji);
      setReactions(res.data || []);
    } catch (err) {
      console.error(err);
      showError('Failed to toggle reaction.');
    }
  };

  const handlePostComment = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    const commentContent = parentId ? replyContent : content;
    const authorName = parentId ? replyName : name;
    const authorEmail = parentId ? replyEmail : email;

    if (!commentContent.trim()) {
      showError('Comment content cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await commentService.postComment(postId, {
        author_name: authorName || 'Anonymous Guest',
        author_email: authorEmail || 'guest@example.com',
        content: commentContent,
        parent_id: parentId,
      });

      showSuccess(res.message || 'Comment posted successfully.');

      if (parentId) {
        setReplyContent('');
        setReplyName('');
        setReplyEmail('');
        setReplyingToId(null);
      } else {
        setContent('');
        setName('');
        setEmail('');
      }

      loadData();
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const getEmojiCount = (emojiKey: string) => {
    const found = reactions.find((r) => r.emoji === emojiKey);
    return found ? found.count : 0;
  };

  const hasReacted = (emojiKey: string) => {
    const found = reactions.find((r) => r.emoji === emojiKey);
    return found ? found.reacted : false;
  };

  return (
    <div className="space-y-8 mt-12 border-t border-slate-200 dark:border-slate-800/80 pt-8 max-w-4xl mx-auto transition-colors duration-200">
      {/* ── Reactions Section ── */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800/40 rounded-2xl p-4 bg-white/40 dark:bg-slate-900/10">
        <h4 className="text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-3">Reactions</h4>
        <div className="flex flex-wrap gap-3">
          {EMOJIS.map((emoji) => {
            const count = getEmojiCount(emoji.key);
            const reacted = hasReacted(emoji.key);
            return (
              <button
                key={emoji.key}
                onClick={() => handleReact(emoji.key)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                  reacted
                    ? 'bg-accentBlue/10 border-accentBlue text-accentBlue scale-105 shadow-md shadow-accentBlue/5'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:border-slate-350 dark:hover:border-slate-700'
                }`}
                title={emoji.title}
              >
                <span className="text-base">{emoji.label}</span>
                <span className="text-xs font-semibold font-mono">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Post Comment Form ── */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800/40 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/10 space-y-4">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accentBlue" />
          <span>Để lại bình luận</span>
        </h4>
        <form onSubmit={(e) => handlePostComment(e)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Tên của bạn (tùy chọn)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-800 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl py-2 px-4 outline-none text-sm transition-all"
            />
            <input
              type="email"
              placeholder="Email của bạn (tùy chọn - không hiển thị)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-800 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl py-2 px-4 outline-none text-sm transition-all"
            />
          </div>
          <div className="relative">
            <textarea
              placeholder="Chia sẻ suy nghĩ của bạn..."
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-850 dark:text-gray-205 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl py-3 px-4 outline-none text-sm transition-all resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="absolute right-3 bottom-3 p-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 disabled:opacity-50 text-white rounded-lg transition-all shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* ── Comments List ── */}
      <div className="space-y-6">
        <h4 className="text-sm font-semibold text-slate-400 dark:text-gray-400">Bình luận ({comments.length})</h4>

        {comments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-gray-650 text-xs font-sans">
            Chưa có bình luận nào. Hãy là người đầu tiên bắt đầu cuộc trò chuyện!
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                {/* Parent Comment */}
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-750 flex items-center justify-center font-bold text-xs text-accentBlue shrink-0">
                    {(comment.author_name || 'G').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-gray-200">{comment.author_name || 'Khách'}</span>
                      <span className="text-[10px] text-slate-400 dark:text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed bg-white/60 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-900/60 rounded-xl p-3">
                      {comment.content}
                    </p>
                    <button
                      onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                      className="text-[11px] text-accentBlue hover:underline font-semibold pl-1"
                    >
                      Phản hồi
                    </button>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingToId === comment.id && (
                  <div className="ml-10 flex space-x-2 items-start bg-slate-100/50 dark:bg-slate-950/20 p-4 border border-slate-200 dark:border-slate-900 rounded-2xl">
                    <div className="shrink-0 pt-2">
                      <CornerDownRight className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                    </div>
                    <form onSubmit={(e) => handlePostComment(e, comment.id)} className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Tên của bạn (tùy chọn)"
                          value={replyName}
                          onChange={(e) => setReplyName(e.target.value)}
                          className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-800 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl py-1.5 px-3 outline-none text-xs transition-all"
                        />
                        <input
                          type="email"
                          placeholder="Email của bạn (tùy chọn)"
                          value={replyEmail}
                          onChange={(e) => setReplyEmail(e.target.value)}
                          className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-800 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl py-1.5 px-3 outline-none text-xs transition-all"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Viết phản hồi..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          required
                          className="flex-1 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-2 px-3 outline-none text-xs transition-all"
                        />
                        <button
                          type="submit"
                          disabled={submitting}
                          className="bg-gradient-to-r from-accentBlue to-accentPurple text-white font-semibold px-4 rounded-xl text-xs hover:brightness-110 transition-all"
                        >
                          Gửi
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Sub Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-10 space-y-4 border-l border-slate-200 dark:border-slate-800/80 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-3">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-850 border border-slate-350 dark:border-slate-800 flex items-center justify-center font-bold text-[10px] text-accentPurple shrink-0">
                          {(reply.author_name || 'G').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800 dark:text-gray-300">{reply.author_name || 'Khách'}</span>
                            <span className="text-[9px] text-slate-400 dark:text-gray-600">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-gray-450 leading-relaxed bg-white/60 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-900/40 rounded-xl p-2.5">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
