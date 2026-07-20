import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { publicService, settingsService, getFullUrl } from '../services/api';
import type { Post, Category, Tag } from '../services/api';
import {
  Calendar,
  X,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Skeleton, Pagination, Input } from 'antd';

export async function loader() {
  return null;
}

function formatRelative(dateStr: string, t: any): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return t('today');
    if (diffDays < 7) return `${diffDays} ${t('days_ago')}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t('weeks_ago')}`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${t('months_ago')}`;
    return `${Math.floor(diffDays / 365)} ${t('years_ago')}`;
  } catch {
    return dateStr;
  }
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const BlogHome: React.FC = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  const [heroKicker, setHeroKicker] = useState('');
  const [heroTitleLine1, setHeroTitleLine1] = useState('');
  const [heroTitleLine2, setHeroTitleLine2] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const LIMIT = 10;
  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategories = searchParams.get('category') ? searchParams.get('category')!.split(',').filter(Boolean) : [];
  const selectedTags = searchParams.get('tag') ? searchParams.get('tag')!.split(',').filter(Boolean) : [];
  const searchQuery = searchParams.get('q') || '';

  const loadPosts = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * LIMIT;
      const params: Parameters<typeof publicService.getPosts>[0] = {
        offset,
        limit: LIMIT,
      };
      if (searchQuery) params.search = searchQuery;
      const res = await publicService.getPosts(params);
      if (signal?.aborted) return;

      let items = res.data?.items || [];

      if (selectedCategories.length > 0) {
        items = items.filter((p) =>
          p.categories?.some((c) => selectedCategories.includes(c.slug))
        );
      }
      if (selectedTags.length > 0) {
        items = items.filter((p) =>
          p.tags?.some((t) => selectedTags.includes(t.slug))
        );
      }

      setPosts(items);
      setTotal(selectedCategories.length > 0 || selectedTags.length > 0 ? items.length : res.data?.total || items.length);
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategories.join(','), selectedTags.join(','), searchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    loadPosts(controller.signal);
    return () => controller.abort();
  }, [loadPosts]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      publicService.getCategories(),
      publicService.getTags(),
    ]).then(([catRes, tagRes]) => {
      if (cancelled) return;
      setCategories(catRes.data || []);
      setTags(tagRes.data || []);
    }).catch(() => { });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    settingsService.get().then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        const data = res.data;
        setHeroKicker(data.hero_kicker || '');
        setHeroTitleLine1(data.hero_title_line1 || '');
        setHeroTitleLine2(data.hero_title_line2 || '');
        setHeroSubtitle(data.hero_subtitle || '');
      }
    }).catch(() => { });
    return () => { cancelled = true; };
  }, []);

  const toggleFilter = (key: 'category' | 'tag', value: string) => {
    const next = new URLSearchParams(searchParams);
    const currentList = next.get(key) ? next.get(key)!.split(',').filter(Boolean) : [];
    const index = currentList.indexOf(value);
    if (index > -1) {
      currentList.splice(index, 1);
    } else {
      currentList.push(value);
    }
    if (currentList.length > 0) {
      next.set(key, currentList.join(','));
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilter = selectedCategories.length > 0 || selectedTags.length > 0 || searchQuery;

  return (
    <div className="mx-auto space-y-8 select-none">
      <section className="text-center py-10 md:py-14 space-y-4 select-text">
        {heroKicker && (
          <p className="text-xs font-extrabold uppercase tracking-wider text-accentBlue/90 sm:text-sm">
            {heroKicker}
          </p>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          {heroTitleLine1 && <span className="block">{heroTitleLine1}</span>}
          {heroTitleLine2 && (
            <span className="block bg-gradient-to-r from-accentBlue via-[#3b82f6] to-accentPurple bg-clip-text text-transparent">
              {heroTitleLine2}
            </span>
          )}
        </h1>
        {heroSubtitle && (
          <p className="max-w-xl mx-auto text-sm text-slate-500 dark:text-gray-400 font-medium">
            {heroSubtitle}
          </p>
        )}
      </section>

      <div className="space-y-4 select-text">
        {/* Redesigned Premium Search Bar */}
        <div className="w-full search-container relative group">
          <Input.Search
            placeholder={t('search_placeholder')}
            enterButton={t('search_posts')}
            size="large"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={(value) => {
              const next = new URLSearchParams(searchParams);
              if (value.trim()) {
                next.set('q', value.trim());
              } else {
                next.delete('q');
              }
              next.set('page', '1');
              setSearchParams(next);
            }}
            className="rounded-2xl overflow-hidden search-input-antd premium-search"
          />
        </div>

        {/* Categories Multi-Select filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={clearFilters}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${!hasActiveFilter
                ? 'bg-accentBlue text-white border-accentBlue shadow-md shadow-accentBlue/20'
                : 'bg-white dark:bg-slate-900/40 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-slate-800/80 hover:border-accentBlue/30 hover:text-accentBlue'
                }`}
            >
              {t('all_posts')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => toggleFilter('category', cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${selectedCategories.includes(cat.slug)
                  ? 'bg-accentBlue text-white border-accentBlue shadow-md shadow-accentBlue/20'
                  : 'bg-white dark:bg-slate-900/40 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-slate-800/80 hover:border-accentBlue/30 hover:text-accentBlue'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Tags Multi-Select filters */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 24).map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleFilter('tag', tag.slug)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all duration-200 ${selectedTags.includes(tag.slug)
                  ? 'bg-accentPurple/20 text-accentPurple border-accentPurple/40'
                  : 'bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-gray-500 border-slate-200 dark:border-slate-800/60 hover:border-accentPurple/30 hover:text-accentPurple'
                  }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Removable filter badges for active selections */}
        {hasActiveFilter && (
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/30">
            <span className="text-xs text-slate-500 dark:text-gray-500">{t('filtering_by')}</span>
            {selectedCategories.map(catSlug => (
              <span key={catSlug} className="flex items-center gap-1.5 px-2.5 py-1 bg-accentBlue/10 text-accentBlue text-xs font-semibold rounded-full border border-accentBlue/20">
                {categories.find(c => c.slug === catSlug)?.name || catSlug}
                <button onClick={() => toggleFilter('category', catSlug)} className="hover:text-red-500 transition-colors" aria-label="Remove category">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedTags.map(tagSlug => (
              <span key={tagSlug} className="flex items-center gap-1.5 px-2.5 py-1 bg-accentPurple/10 text-accentPurple text-xs font-semibold rounded-full border border-accentPurple/20">
                #{tags.find(t => t.slug === tagSlug)?.name || tagSlug}
                <button onClick={() => toggleFilter('tag', tagSlug)} className="hover:text-red-500 transition-colors" aria-label="Remove tag">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {searchQuery && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-550/10 text-slate-500 text-xs font-semibold rounded-full border border-slate-500/20">
                "{searchQuery}"
                <button onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('q');
                  setSearchParams(next);
                  setSearchInput('');
                }} className="hover:text-red-500 transition-colors" aria-label="Remove search query">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-semibold ml-2">Clear all</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-5 p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl animate-pulse">
              <Skeleton />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-5xl">📭</div>
          <p className="text-slate-500 dark:text-gray-500 text-sm font-medium">{t('no_posts')}</p>
          {hasActiveFilter && (
            <button onClick={clearFilters} className="text-accentBlue text-sm font-semibold hover:underline">
              {t('clear_filter_try_again')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => {
            const coverUrl = post.cover_media?.url ? getFullUrl(post.cover_media.url) : '';
            const readTime = estimateReadTime(post.content || post.excerpt || '');
            const primaryCategory = post.categories?.[0];

            return (
              <article
                key={post.id}
                className="group flex flex-col justify-between p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-accentBlue/30 dark:hover:border-accentBlue/20 hover:shadow-lg hover:shadow-accentBlue/5 dark:hover:shadow-none transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/posts/${post.slug}`}
                    className="block aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/60"
                  >
                    <img
                      src={coverUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      loading="lazy"
                    />
                  </Link>

                  {/* Content details */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {primaryCategory && (
                        <button
                          onClick={() => toggleFilter('category', primaryCategory.slug)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accentBlue bg-accentBlue/8 border border-accentBlue/15 px-2.5 py-1 rounded-full hover:bg-accentBlue/15 transition-colors"
                        >
                          {primaryCategory.name}
                        </button>
                      )}

                      {/* Render tag list and truncate if more than 3 tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag.id} className="text-[10px] bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-gray-400 px-2 py-0.5 rounded font-medium">
                              #{tag.name}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-gray-500 px-2 py-0.5 rounded font-mono font-bold">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <Link to={`/posts/${post.slug}`}>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-accentBlue transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>

                    {post.excerpt && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 dark:text-gray-600 pt-4 border-t border-slate-100 dark:border-slate-800/30 mt-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatRelative(post.published_at || post.created_at, t)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {readTime} {t('read_time_mins')}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ─── Pagination ─── */}
      {total > LIMIT && (
        <div className="flex justify-center pt-8 select-none">
          <Pagination
            current={currentPage}
            pageSize={LIMIT}
            total={total}
            onChange={(page) => setPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-900/80 hover:bg-slate-850 text-gray-300 hover:text-white border border-slate-800 transition-all z-[110]"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxImg}
            alt="Lightbox review"
            className="max-w-[92%] max-h-[92%] object-contain rounded-xl shadow-2xl border border-slate-800/40 animate-scale-up animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default BlogHome;
