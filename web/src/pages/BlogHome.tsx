import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { publicService, settingsService, getFullUrl } from '../services/api';
import type { Post, Category, Tag } from '../services/api';
import {
  Search,
  Calendar,
  X,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Skeleton } from 'antd';

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
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [heroKicker, setHeroKicker] = useState('');
  const [heroTitleLine1, setHeroTitleLine1] = useState('');
  const [heroTitleLine2, setHeroTitleLine2] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const LIMIT = 10;
  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategory = searchParams.get('category') || '';
  const selectedTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('q') || '';
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

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

      if (selectedCategory) {
        items = items.filter((p) =>
          p.categories?.some((c) => c.slug === selectedCategory)
        );
      }
      if (selectedTag) {
        items = items.filter((p) =>
          p.tags?.some((t) => t.slug === selectedTag)
        );
      }

      setPosts(items);
      setTotal(selectedCategory || selectedTag ? items.length : res.data?.total || items.length);
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, selectedTag, searchQuery]);

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

        if (data.slider_images) {
          try {
            const parsed = JSON.parse(data.slider_images);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSliderImages(parsed);
            }
          } catch {
            const split = data.slider_images.split(',').map((s: string) => s.trim()).filter(Boolean);
            if (split.length > 0) {
              setSliderImages(split);
            }
          }
        }
      }
    }).catch(() => { });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderImages]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('q', searchInput.trim());
    } else {
      next.delete('q');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const setFilter = (key: 'category' | 'tag', value: string) => {
    const next = new URLSearchParams();
    if (value) next.set(key, value);
    next.set('page', '1');
    setSearchParams(next);
    setSearchInput('');
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

  const hasActiveFilter = selectedCategory || selectedTag || searchQuery;

  const activeLabel = selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory
    : selectedTag
      ? `#${tags.find((t) => t.slug === selectedTag)?.name || selectedTag}`
      : searchQuery
        ? `"${searchQuery}"`
        : null;

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

      {/* {sliderImages.length > 0 && (
        <div className="relative w-full aspect-[21/9] md:aspect-[24/9] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800/80 group">
          <div className="w-full h-full relative">
            {sliderImages.map((img, idx) => (
              <div
                key={img}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img
                  src={getFullUrl(img)}
                  alt={`Slide banner ${idx + 1}`}
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
              </div>
            ))}
          </div>

          {sliderImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-950 text-white border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % sliderImages.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-950 text-white border border-slate-800 opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5 z-20">
                {sliderImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )} */}

      <div className="space-y-4 select-text">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-28 py-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 focus:border-accentBlue/50 focus:ring-2 focus:ring-accentBlue/20 text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-650 rounded-2xl outline-none text-sm transition-all shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-accentBlue hover:bg-accentBlue/90 text-white text-xs font-bold rounded-xl transition-all"
          >
            {t('search_posts')}
          </button>
        </form>

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
                onClick={() => setFilter('category', cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${selectedCategory === cat.slug
                  ? 'bg-accentBlue text-white border-accentBlue shadow-md shadow-accentBlue/20'
                  : 'bg-white dark:bg-slate-900/40 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-slate-800/80 hover:border-accentBlue/30 hover:text-accentBlue'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 24).map((tag) => (
              <button
                key={tag.id}
                onClick={() => setFilter('tag', tag.slug)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all duration-200 ${selectedTag === tag.slug
                  ? 'bg-accentPurple/20 text-accentPurple border-accentPurple/40'
                  : 'bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-gray-500 border-slate-200 dark:border-slate-800/60 hover:border-accentPurple/30 hover:text-accentPurple'
                  }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}

        {hasActiveFilter && activeLabel && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-gray-500">{t('filtering_by')}</span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-accentBlue/10 text-accentBlue text-xs font-semibold rounded-full border border-accentBlue/20">
              {activeLabel}
              <button onClick={clearFilters} className="hover:text-red-500 transition-colors" aria-label="Xóa bộ lọc">
                <X className="w-3 h-3" />
              </button>
            </span>
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
                    {primaryCategory && (
                      <button
                        onClick={() => setFilter('category', primaryCategory.slug)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accentBlue bg-accentBlue/8 border border-accentBlue/15 px-2.5 py-1 rounded-full hover:bg-accentBlue/15 transition-colors"
                      >
                        {primaryCategory.name}
                      </button>
                    )}

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
                  {/* {post.author ? (
                    <>
                      {post.author.avatar_url ? (
                        <img
                          src={getFullUrl(post.author.avatar_url)}
                          alt={post.author.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || '')}&background=3b82f6&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accentBlue to-accentPurple flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                          {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <span className="text-slate-700 dark:text-gray-300">{post.author.name}</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Guest</span>
                  )} */}
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
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-4" aria-label="Phân trang">
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-gray-400 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:border-accentBlue/30 hover:text-accentBlue disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {t('prev')}
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === 'ellipsis' ? (
                  <span key={`e-${i}`} className="px-2 text-slate-400 text-xs">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === item
                      ? 'bg-accentBlue text-white shadow-md shadow-accentBlue/20'
                      : 'text-slate-600 dark:text-gray-400 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 hover:border-accentBlue/30 hover:text-accentBlue'
                      }`}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-gray-400 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl hover:border-accentBlue/30 hover:text-accentBlue disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {t('next')}
          </button>
        </nav>
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
