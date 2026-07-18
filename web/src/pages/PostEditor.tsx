import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { ArrowLeft, Save, Loader, Image as ImageIcon, X, Trash } from 'lucide-react';
import { postService, mediaService, categoryService, tagService, getFullUrl } from '../services/api';
import type { Media, Category, Tag } from '../services/api';
import { RichTextEditor } from '../components/RichTextEditor';
import { GalleryUploader } from '../components/GalleryUploader';
import { useLanguage } from '../context/LanguageContext';

export async function loader() {
  return null;
}

const stripHtml = (html?: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

const postSchema = zod.object({
  title: zod.string().min(1, 'Title is required').max(255, 'Title is too long'),
  slug: zod.string().max(255, 'Slug is too long').optional(),
  content: zod.string().optional(),
  status: zod.enum(['draft', 'published']),
  cover_media_id: zod.number().optional().nullable(),
  meta_title: zod.string().max(255, 'Meta title is too long').optional().default(''),
  meta_desc: zod.string().optional().default(''),
  excerpt: zod.string().optional().default(''),
  is_featured: zod.boolean().optional().default(false),
  published_at: zod.string().optional().nullable().default(''),
});

type PostFormValues = zod.infer<typeof postSchema>;

export const PostEditor: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // Categories & Tags state
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      status: 'draft',
      cover_media_id: null,
      meta_title: '',
      meta_desc: '',
      excerpt: '',
      is_featured: false,
      published_at: '',
    },
  });

  const watchCoverMediaId = watch('cover_media_id');
  const contentValue = watch('content') || '';
  const watchTitle = watch('title') || '';
  const watchSlug = watch('slug') || '';
  const watchMetaTitle = watch('meta_title') || '';
  const watchMetaDesc = watch('meta_desc') || '';
  const watchExcerpt = watch('excerpt') || '';
  const watchContent = watch('content') || '';
  const [seoOpen, setSeoOpen] = useState(false);

  // Load categories and tags lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          categoryService.list(),
          tagService.list()
        ]);
        setAllCategories(catRes.data || []);
        setAllTags(tagRes.data || []);
      } catch (err) {
        console.error('Failed to load categories/tags lists', err);
      }
    };
    fetchData();
  }, []);

  // Load post details if editing
  useEffect(() => {
    if (isEdit) {
      const loadPost = async () => {
        setFetching(true);
        try {
          const res = await postService.detail(Number(id));
          const post = res.data;
          setValue('title', post.title);
          setValue('slug', post.slug);
          setValue('content', post.content);
          setValue('status', post.status);
          setValue('cover_media_id', post.cover_media_id || null);
          setValue('meta_title', post.meta_title || '');
          setValue('meta_desc', post.meta_desc || '');
          setValue('excerpt', post.excerpt || '');
          setValue('is_featured', post.is_featured || false);
          if (post.published_at) {
            const dateObj = new Date(post.published_at);
            const tzOffset = dateObj.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(dateObj.getTime() - tzOffset)).toISOString().slice(0, 16);
            setValue('published_at', localISOTime);
          } else {
            setValue('published_at', '');
          }
          if (post.cover_media) {
            setSelectedMedia(post.cover_media);
          }
          if (post.categories) {
            setSelectedCategoryIds(post.categories.map((c) => c.id));
          }
          if (post.tags) {
            setSelectedTagIds(post.tags.map((t) => t.id));
          }
        } catch (err) {
          console.error('Failed to load post', err);
          alert('Failed to load post details');
          navigate('/admin/posts');
        } finally {
          setFetching(false);
        }
      };
      loadPost();
    }
  }, [id, isEdit, setValue, navigate]);

  // Filter tags for autocomplete
  useEffect(() => {
    if (!tagInput.trim()) {
      setTagSuggestions([]);
      return;
    }
    const filtered = allTags.filter(
      (t) =>
        t.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTagIds.includes(t.id)
    );
    setTagSuggestions(filtered);
  }, [tagInput, allTags, selectedTagIds]);

  const addTagById = (tagId: number) => {
    if (!selectedTagIds.includes(tagId)) {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
    setTagInput('');
  };

  const handleTagInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = tagInput.trim();
      if (!value) return;

      const existing = allTags.find((t) => t.name.toLowerCase() === value.toLowerCase());
      if (existing) {
        addTagById(existing.id);
      } else {
        try {
          const res = await tagService.create({ name: value });
          const newTag = res.data;
          setAllTags([...allTags, newTag]);
          setSelectedTagIds([...selectedTagIds, newTag.id]);
          setTagInput('');
        } catch (err) {
          console.error('Failed to quick-create tag', err);
        }
      }
    }
  };

  const removeTagById = (tagId: number) => {
    setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
  };

  const openMediaModal = async () => {
    setShowMediaModal(true);
    try {
      const res = await mediaService.list();
      setMediaList((res.data || []).filter((m) => m.status === 'completed'));
    } catch (err) {
      console.error('Failed to load media list', err);
    }
  };

  const selectMedia = (media: Media) => {
    setSelectedMedia(media);
    setValue('cover_media_id', media.id);
    setShowMediaModal(false);
  };

  const removeCoverImage = () => {
    setSelectedMedia(null);
    setValue('cover_media_id', null);
  };

  const onSubmit = async (values: PostFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        published_at: values.published_at ? new Date(values.published_at).toISOString() : null,
        category_ids: selectedCategoryIds,
        tag_ids: selectedTagIds,
      };
      if (isEdit) {
        await postService.update(Number(id), payload);
      } else {
        await postService.create(payload);
      }
      navigate('/admin/posts');
    } catch (err) {
      console.error('Failed to save post', err);
      alert('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-accentBlue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-gray-500 font-sans">Loading post details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/posts"
            className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 rounded-xl text-gray-400 hover:text-gray-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-850 dark:text-gray-100">
              {isEdit ? t('editor_edit_title') : t('editor_create_title')}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEdit ? 'Update details of your post.' : 'Write a new article.'}
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 disabled:opacity-55 text-white font-medium px-5 py-3 rounded-xl transition-all shadow-md shadow-accentBlue/10"
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{loading ? t('loading') : t('editor_save')}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-slate-800/50 rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                {t('editor_title_label')}
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder={t('editor_title_placeholder')}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-3 px-4 outline-none transition-all"
              />
              {errors.title?.message && (
                <p className="text-xs text-dangerRed mt-1">{String(errors.title.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                {t('editor_slug_label')}
              </label>
              <input
                type="text"
                {...register('slug')}
                placeholder="custom-slug-here"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-3 px-4 outline-none transition-all font-mono text-sm"
              />
              <p className="text-[10px] text-gray-500">
                Leave empty to automatically generate from the title.
              </p>
              {errors.slug?.message && (
                <p className="text-xs text-dangerRed mt-1">{String(errors.slug.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                {t('editor_content_label')}
              </label>
              <RichTextEditor
                value={contentValue}
                onChange={(val) => setValue('content', val, { shouldDirty: true })}
              />
            </div>
          </div>

          {/* SEO & Publishing Settings */}
          <div className="glass-panel border border-slate-800/50 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex items-center justify-between p-6 text-left border-b border-slate-800/30 bg-slate-900/10 hover:bg-slate-900/30 transition-colors"
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-200">SEO & Publishing Settings</h3>
                <p className="text-xs text-gray-500 font-sans mt-0.5">Configure search appearances and publication schedules.</p>
              </div>
              <span className="text-gray-400 font-medium text-xs">{seoOpen ? 'Hide' : 'Show'}</span>
            </button>

            {seoOpen && (
              <div className="p-6 space-y-6">
                {/* Excerpt */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('editor_excerpt_label')}
                  </label>
                  <textarea
                    {...register('excerpt')}
                    rows={3}
                    placeholder={t('editor_excerpt_placeholder')}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-3 px-4 outline-none transition-all text-sm resize-none"
                  />
                  <p className="text-[10px] text-gray-500">
                    A brief description of your post used in lists and search results.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meta Title */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        SEO Meta Title
                      </label>
                      <span className={`text-[10px] ${(watchMetaTitle || '').length > 60 ? 'text-amber-500' : 'text-gray-500'}`}>
                        {(watchMetaTitle || '').length} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      {...register('meta_title')}
                      placeholder="SEO Meta Title..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-3 px-4 outline-none transition-all text-sm"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                        SEO Meta Description
                      </label>
                      <span className={`text-[10px] ${(watchMetaDesc || '').length > 160 ? 'text-amber-500' : 'text-gray-500'}`}>
                        {(watchMetaDesc || '').length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      {...register('meta_desc')}
                      rows={2}
                      placeholder="SEO Meta Description..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-3 px-4 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Published At */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Publish Date & Time (Schedule)
                    </label>
                    <input
                      type="datetime-local"
                      {...register('published_at')}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 rounded-xl py-3 px-4 outline-none transition-all text-sm"
                    />
                    <p className="text-[10px] text-gray-500">
                      Set a future date to schedule publication, or leave blank to publish immediately.
                    </p>
                  </div>

                  {/* Is Featured Toggle */}
                  <div className="flex items-center space-x-3 h-full md:pt-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('is_featured')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accentBlue"></div>
                      <span className="ml-3 text-sm font-semibold text-slate-700 dark:text-gray-300">Mark as Featured Post</span>
                    </label>
                  </div>
                </div>

                {/* Google Search Preview */}
                <div className="space-y-3 pt-4 border-t border-slate-800/40">
                  <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider block">
                    Google Search Preview
                  </label>
                  <div className="bg-white text-black p-5 rounded-xl border border-gray-200 shadow-sm max-w-2xl font-sans">
                    <div className="text-[14px] text-gray-600 mb-1 flex items-center space-x-1 truncate">
                      <span>https://yourblog.com</span>
                      <span className="text-gray-400">&rsaquo;</span>
                      <span>posts</span>
                      <span className="text-gray-400">&rsaquo;</span>
                      <span className="text-gray-500 truncate">{watchSlug || watchTitle || 'post-slug'}</span>
                    </div>
                    <div className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight truncate mb-1">
                      {watchMetaTitle || watchTitle || 'Post Title'}
                    </div>
                    <div className="text-[14px] text-[#4d5156] leading-relaxed break-words font-sans">
                      {watchMetaDesc || watchExcerpt || stripHtml(watchContent) || 'Please enter a meta description or excerpt to preview search snippet here...'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isEdit && (
            <GalleryUploader postId={Number(id)} />
          )}
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="glass-panel border border-slate-800/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Publish Status</h3>
            <select
              {...register('status')}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 rounded-xl py-3 px-4 outline-none transition-all"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Categories */}
          <div className="glass-panel border border-slate-800/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Categories</h3>
            {allCategories.length === 0 ? (
              <p className="text-xs text-gray-500">No categories found.</p>
            ) : (
              <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                {allCategories.map((cat) => {
                  const isChecked = selectedCategoryIds.includes(cat.id);
                  return (
                    <label key={cat.id} className="flex items-center space-x-3 cursor-pointer text-sm text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== cat.id));
                          } else {
                            setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                          }
                        }}
                        className="rounded border-slate-800 bg-slate-950 text-accentBlue focus:ring-accentBlue/40 focus:ring-offset-0 focus:ring-1"
                      />
                      <span className="font-sans">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="glass-panel border border-slate-800/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Tags</h3>

            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTagIds.map((id) => {
                  const tag = allTags.find((t) => t.id === id);
                  if (!tag) return null;
                  return (
                    <span
                      key={id}
                      className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-750 dark:text-gray-300 text-xs px-2.5 py-1 rounded-xl"
                    >
                      <span>{tag.name}</span>
                      <button
                        type="button"
                        onClick={() => removeTagById(id)}
                        className="hover:text-dangerRed transition-colors pl-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                placeholder="Type tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-3 px-4 outline-none transition-all text-sm"
              />

              {tagSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[150px] overflow-y-auto">
                  {tagSuggestions.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => addTagById(tag.id)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm text-slate-750 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100 transition-colors"
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel border border-slate-800/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Cover Image</h3>

            {selectedMedia ? (
              <div className="space-y-3">
                <div className="aspect-video w-full rounded-xl bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden relative group">
                  <img
                    src={getFullUrl(selectedMedia.url)}
                    alt=""
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute top-2 right-2 p-1.5 bg-dangerRed/80 hover:bg-dangerRed text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Remove image"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={openMediaModal}
                  className="w-full text-center text-xs font-semibold text-accentBlue hover:underline"
                >
                  Change Cover Image
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openMediaModal}
                className="w-full aspect-video rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 hover:border-accentBlue/40 flex flex-col items-center justify-center p-4 transition-all group"
              >
                <ImageIcon className="w-8 h-8 text-slate-500 dark:text-gray-600 group-hover:text-accentBlue/70 transition-colors mb-2" />
                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 dark:text-gray-500 dark:group-hover:text-gray-300">
                  Select Cover Image
                </span>
              </button>
            )}
          </div>
        </div>
      </form>

      {showMediaModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-slate-800/80 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center bg-slate-100/30 dark:bg-slate-900/20">
              <div>
                <h3 className="font-bold text-lg text-slate-850 dark:text-gray-100">Select Cover Media</h3>
                <p className="text-xs text-gray-500 font-sans">Pick an image from the library to set as post cover.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/35 dark:hover:border-slate-700 rounded-lg text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {mediaList.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 font-sans">No processed media files available.</p>
                  <Link to="/admin/media" onClick={() => setShowMediaModal(false)} className="text-accentBlue hover:underline text-xs mt-2 inline-block">
                    Go upload media files first
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {mediaList.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => selectMedia(media)}
                      className={`aspect-square rounded-xl bg-slate-950 border overflow-hidden relative hover:scale-105 transition-all flex items-center justify-center group ${watchCoverMediaId === media.id
                        ? 'border-accentBlue ring-2 ring-accentBlue/25'
                        : 'border-slate-800 hover:border-slate-700'
                        }`}
                    >
                      <img
                        src={getFullUrl(media.thumbnail_url || media.url)}
                        alt=""
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white">
                        Choose
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostEditor;
