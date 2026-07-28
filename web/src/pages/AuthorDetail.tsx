import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { publicService, getFullUrl } from '../services/api';
import type { Author, Post } from '../services/api';
import { Mail, Calendar, Eye, ChevronLeft, ChevronRight, User as UserIcon, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Skeleton } from 'antd';

export async function loader() {
  return null;
}

export const AuthorDetail: React.FC = () => {
  const { t, language } = useLanguage();
  const { nickname } = useParams<{ nickname: string }>();

  const [author, setAuthor] = useState<Author | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadingAuthor, setLoadingAuthor] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!nickname) return;
      setLoadingAuthor(true);
      try {
        const res = await publicService.getAuthorByNickname(nickname);
        if (res.success && res.data) {
          setAuthor(res.data);
        }
      } catch (err) {
        console.error('Failed to load author details', err);
      } finally {
        setLoadingAuthor(false);
      }
    };
    fetchAuthor();
  }, [nickname]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!nickname) return;
      setLoadingPosts(true);
      try {
        const offset = (page - 1) * limit;
        const res = await publicService.getPosts({
          nickname: nickname,
          offset,
          limit,
        });
        if (res.success && res.data) {
          setPosts(res.data.items || []);
          setTotalPosts(res.data.total || 0);
        }
      } catch (err) {
        console.error('Failed to load author posts', err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [nickname, page]);

  const totalPages = Math.ceil(totalPosts / limit);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 select-none">
      <div>
        <Link
          to="/authors"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('back_to_authors')}</span>
        </Link>
      </div>

      {loadingAuthor ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* sidebar skeleton */}
          <div className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 space-y-6 bg-white/40 dark:bg-slate-900/30">
            <div className="flex flex-col items-center text-center space-y-4">
              <Skeleton.Avatar active size={112} shape="circle" />
              <Skeleton active paragraph={{ rows: 2, width: ['70%', '50%'] }} title={{ width: '60%' }} />
            </div>
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
          {/* posts skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <Skeleton active paragraph={false} title={{ width: '40%' }} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4">
                    <Skeleton.Image active style={{ width: '100%', height: '100%' }} className="!w-full !h-full" />
                  </div>
                  <Skeleton active paragraph={{ rows: 2 }} title />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !author ? (
        <div className="py-12 text-center text-gray-500">
          <p>{t('no_authors')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start select-text">
          <div className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 space-y-6 bg-white/40 dark:bg-slate-900/30 lg:sticky lg:top-[90px]">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-28 h-28 rounded-full border-4 border-accentBlue/20 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-950/40 shadow-xl">
                {author?.avatar_url ? (
                  <img
                    src={getFullUrl(author.avatar_url)}
                    alt={author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-accentBlue text-4xl">
                    {author?.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-850 dark:text-white">{author?.name}</h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50 text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider uppercase mt-2 select-none">
                  <UserIcon className="w-3 h-3" />
                  <span>{language === 'vi' ? 'Tác giả / Thành viên' : 'Author / Contributor'}</span>
                </div>
              </div>

              <a
                href={`mailto:${author?.email}`}
                className="flex items-center space-x-2 text-xs text-accentBlue hover:underline py-1.5 px-4 bg-accentBlue/5 rounded-xl transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>{author?.email}</span>
              </a>
            </div>

            <hr className="border-slate-100 dark:border-slate-800/40" />

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider select-none">
                {t('biography')}
              </h3>
              <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                {author?.bio || t('no_bio')}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/40">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-accentPurple" />
                <h3 className="text-sm md:text-base font-bold text-slate-850 dark:text-white">
                  {t('articles_written_by')} {author?.name ? author.name.split(' ')[0] : ''}
                </h3>
              </div>
              <div className="flex items-center gap-3 select-none">
                <span className="text-xs bg-slate-100 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-lg font-semibold">
                  {totalPosts} {t('posts')}
                </span>
              </div>
            </div>

            {loadingPosts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl">
                    <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4">
                      <Skeleton.Image active style={{ width: '100%', height: '100%' }} className="!w-full !h-full" />
                    </div>
                    <Skeleton active paragraph={{ rows: 2 }} title />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => {
                  const coverUrl = post.cover_media?.url;

                  return (
                    <article
                      key={post.id}
                      className="group flex flex-col justify-between p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-accentBlue/30 dark:hover:border-accentBlue/20 hover:shadow-lg transition-all duration-200 bg-white/40 dark:bg-slate-900/30"
                    >
                      <div className="space-y-4">
                        <Link
                          to={`/posts/${post.slug}`}
                          className="block aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/60"
                        >
                          <img
                            src={getFullUrl(coverUrl || '')}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                            loading="lazy"
                          />
                        </Link>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(post.published_at || post.created_at)}
                            </span>
                            {post.view_count !== undefined && (
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {post.view_count} {t('views')}
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-extrabold text-slate-850 dark:text-white line-clamp-2 group-hover:text-accentBlue transition-colors leading-snug">
                            <Link to={`/posts/${post.slug}`}>{language === 'en' ? (post.title_en || post.title) : post.title}</Link>
                          </h4>

                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {language === 'en' ? (post.excerpt_en || post.excerpt || 'Read full article...') : (post.excerpt || 'Đọc toàn bộ bài viết...')}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/40 select-none">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-750 dark:text-gray-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('prev')}</span>
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-750 dark:text-gray-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <span>{t('next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorDetail;
