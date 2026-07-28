import React, { useState } from 'react';
import { Link, useSearchParams, useLoaderData, useNavigation } from 'react-router';
import { publicService, settingsService } from '../services/api';
import type { Post, Category, Tag } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Pagination, Input, Card, Tag as AntTag } from 'antd';
import { PostCard, PostCardSkeleton } from '../components/PostCard';

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const LIMIT = 6;
  const offset = (currentPage - 1) * LIMIT;
  const selectedCategories = searchParams.get('category') ? searchParams.get('category')!.split(',').filter(Boolean) : [];
  const selectedTags = searchParams.get('tag') ? searchParams.get('tag')!.split(',').filter(Boolean) : [];
  const searchQuery = searchParams.get('q') || '';

  const params: any = {
    offset,
    limit: LIMIT,
  };
  if (searchQuery) params.search = searchQuery;

  try {
    const [postsRes, catRes, tagRes, settingsRes] = await Promise.all([
      publicService.getPosts(params),
      publicService.getCategories(),
      publicService.getTags(),
      settingsService.getPublic()
    ]);

    let items = postsRes.data?.items || [];
    if (selectedCategories.length > 0) {
      items = items.filter((p: any) =>
        p.categories?.some((c: any) => selectedCategories.includes(c.slug))
      );
    }
    if (selectedTags.length > 0) {
      items = items.filter((p: any) =>
        p.tags?.some((t: any) => selectedTags.includes(t.slug))
      );
    }

    const total = selectedCategories.length > 0 || selectedTags.length > 0 ? items.length : postsRes.data?.total || items.length;

    return {
      posts: items,
      total,
      categories: catRes.data || [],
      tags: tagRes.data || [],
      settings: settingsRes.data || null
    };
  } catch (err) {
    return {
      posts: [],
      total: 0,
      categories: [],
      tags: [],
      settings: null
    };
  }
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
  const { t, language } = useLanguage();
  const { posts, total, categories, tags, settings } = useLoaderData() as any;
  const navigation = useNavigation();
  const loading = navigation.state === "loading";

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  
  const LIMIT = 6;
  const currentPage = parseInt(searchParams.get('page') || '1');
  const selectedCategories = searchParams.get('category') ? searchParams.get('category')!.split(',').filter(Boolean) : [];
  const selectedTags = searchParams.get('tag') ? searchParams.get('tag')!.split(',').filter(Boolean) : [];
  const searchQuery = searchParams.get('q') || '';

  const heroKicker = settings?.hero_kicker || '';
  const heroTitleLine1 = settings?.hero_title_line1 || '';
  const heroTitleLine2 = settings?.hero_title_line2 || '';
  const heroSubtitle = settings?.hero_subtitle || '';

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

      <Card className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-sm">
        <div className="space-y-4 select-text">
          <div className="w-full">
            <Input.Search
              placeholder={t('search_placeholder')}
              enterButton={t('search_posts')}
              size="large"
              allowClear
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

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mr-1">
                {t('categories') || 'Categories'}:
              </span>
              <AntTag.CheckableTag
                checked={!hasActiveFilter}
                onChange={clearFilters}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold border transition-all ${!hasActiveFilter
                  ? '!bg-accentBlue !text-white'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-gray-400 hover:text-accentBlue'
                  }`}
              >
                {t('all_posts')}
              </AntTag.CheckableTag>
              {categories.map((cat: Category) => {
                const isSelected = selectedCategories.includes(cat.slug);
                return (
                  <AntTag.CheckableTag
                    key={cat.id}
                    checked={isSelected}
                    onChange={() => toggleFilter('category', cat.slug)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${isSelected
                      ? '!bg-accentBlue !text-white'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-gray-400 hover:text-accentBlue'
                      }`}
                  >
                    {cat.name}
                  </AntTag.CheckableTag>
                );
              })}
            </div>
          )}

          {/* Tags Multi-Select filters */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center pt-1 border-t border-slate-100 dark:border-slate-800/40">
              <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mr-1">
                {t('tags') || 'Tags'}:
              </span>
              {tags.slice(0, 24).map((tag: Tag) => {
                const isSelected = selectedTags.includes(tag.slug);
                return (
                  <AntTag.CheckableTag
                    key={tag.id}
                    checked={isSelected}
                    onChange={() => toggleFilter('tag', tag.slug)}
                    className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-all ${isSelected
                      ? '!bg-accentPurple !text-white'
                      : 'bg-slate-100/70 dark:bg-slate-800/40 text-slate-500 dark:text-gray-400 hover:text-accentPurple'
                      }`}
                  >
                    #{tag.name}
                  </AntTag.CheckableTag>
                );
              })}
            </div>
          )}

          {/* Active Filter Chips */}
          {hasActiveFilter && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/40">
              <span className="text-xs text-slate-400 font-semibold">{t('filtering_by')}:</span>
              {selectedCategories.map((catSlug) => (
                <AntTag
                  key={catSlug}
                  closable
                  onClose={() => toggleFilter('category', catSlug)}
                  color="blue"
                  className="rounded-full px-2.5 py-0.5 font-semibold text-xs m-0"
                >
                  {categories.find((c: Category) => c.slug === catSlug)?.name || catSlug}
                </AntTag>
              ))}
              {selectedTags.map((tagSlug) => (
                <AntTag
                  key={tagSlug}
                  closable
                  onClose={() => toggleFilter('tag', tagSlug)}
                  color="purple"
                  className="rounded-full px-2.5 py-0.5 font-semibold text-xs m-0"
                >
                  #{tags.find((t: Tag) => t.slug === tagSlug)?.name || tagSlug}
                </AntTag>
              ))}
              {searchQuery && (
                <AntTag
                  closable
                  onClose={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('q');
                    setSearchParams(next);
                    setSearchInput('');
                  }}
                  color="default"
                  className="rounded-full px-2.5 py-0.5 font-semibold text-xs m-0"
                >
                  "{searchQuery}"
                </AntTag>
              )}
              <AntTag
                color="error"
                className="cursor-pointer font-bold text-xs m-0 rounded-full px-2.5 py-0.5"
                onClick={clearFilters}
              >
                Clear all
              </AntTag>
            </div>
          )}
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <PostCardSkeleton key={i} />
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
          {posts.map((post: Post) => (
            <PostCard
              key={post.id}
              post={post}
              language={language}
              t={t}
              formatRelative={formatRelative}
              estimateReadTime={estimateReadTime}
              toggleFilter={toggleFilter}
            />
          ))}
        </div>
      )}

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
    </div>
  );
};

export function HydrateFallback() {
  return (
    <div className="mx-auto space-y-8 select-none max-w-7xl px-4 pt-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default BlogHome;


