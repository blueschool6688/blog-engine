import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLoaderData, useNavigation } from 'react-router';
import { ArrowLeft, Save, Image as ImageIcon, Trash, FileText, Languages, Sparkles } from 'lucide-react';
import { postService, mediaService, categoryService, tagService, translateService, aiService, getFullUrl } from '../services/api';
import type { Media, Category, Tag } from '../services/api';
import { RichTextEditor } from '../components/RichTextEditor';
import { GalleryUploader } from '../components/GalleryUploader';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Form, Input, Button, Select, Switch, DatePicker, Collapse, Card, Spin, Modal, Tabs } from 'antd';
import dayjs from 'dayjs';

export async function clientLoader({ params }: { params: any }) {
  const isEdit = !!params.id;
  try {
    const [catRes, tagRes, postRes] = await Promise.all([
      categoryService.list(),
      tagService.list(),
      isEdit ? postService.detail(Number(params.id)) : Promise.resolve({ data: null })
    ]);
    return {
      categories: catRes.data || [],
      tags: tagRes.data || [],
      post: postRes.data
    };
  } catch (err) {
    console.error('Failed to load data', err);
    return { categories: [], tags: [], post: null, error: true };
  }
}

export const PostEditor: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Media Pickers States
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'cover' | 'pdf' | null>(null);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [selectedCover, setSelectedCover] = useState<Media | null>(null);
  const [selectedPDF, setSelectedPDF] = useState<Media | null>(null);

  const { categories, tags, post } = useLoaderData() as any;
  const navigation = useNavigation();
  const loadingInitial = navigation.state === "loading";

  // Option lists
  const [allCategories, setAllCategories] = useState<Category[]>(categories || []);
  const [allTags, setAllTags] = useState<Tag[]>(tags || []);

  // Watchers for custom rendering (SEO Google preview, etc.)
  const [titleVal, setTitleVal] = useState(post?.title || '');
  const [slugVal, setSlugVal] = useState(post?.slug || '');
  const [excerptVal, setExcerptVal] = useState(post?.excerpt || '');
  const [metaTitleVal, setMetaTitleVal] = useState(post?.meta_title || '');
  const [metaDescVal, setMetaDescVal] = useState(post?.meta_desc || '');
  const [isDocVal, setIsDocVal] = useState(post?.is_document || false);

  // Auto-translate states & functions
  const [translating, setTranslating] = useState(false);
  const [translateProgressText, setTranslateProgressText] = useState('');

  // AI Generate & Summarize states
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  const [extracting, setExtracting] = useState(false);
  const [scoringSEO, setScoringSEO] = useState(false);
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [seoGrade, setSeoGrade] = useState<string>('');
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);

  const translateText = async (text: string, targetLang: 'vi' | 'en'): Promise<string> => {
    if (!text || !text.trim()) return '';
    const res = await translateService.translate({ content: text, target_lang: targetLang });
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Translation failed');
    }
    
    const result = res.data;
    if (result.job_id) {
      const jobId = result.job_id;
      return new Promise<string>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const pollRes = await translateService.pollJob(jobId);
            if (pollRes.success && pollRes.data) {
              if (pollRes.data.status === 'done') {
                clearInterval(interval);
                resolve(pollRes.data.translated_text || '');
              } else if (pollRes.data.status === 'failed') {
                clearInterval(interval);
                reject(new Error(pollRes.data.error || 'Async translation job failed'));
              }
            }
          } catch (err) {
            // Keep polling on temporary errors
          }
        }, 2000);
      });
    }
    return result.translated_text;
  };

  const handleAutoTranslate = async () => {
    const values = form.getFieldsValue();
    const titleVi = values.title;
    const excerptVi = values.excerpt;
    const contentVi = values.content;

    if (!titleVi && !excerptVi && !contentVi) {
      showError(t('fill_fields') || 'Vui lòng nhập nội dung Tiếng Việt trước khi dịch.');
      return;
    }

    setTranslating(true);
    try {
      if (titleVi) {
        setTranslateProgressText(t('table_title') || 'Tiêu đề');
        const titleEn = await translateText(titleVi, 'en');
        form.setFieldsValue({ title_en: titleEn });
      }
      if (excerptVi) {
        setTranslateProgressText(t('editor_excerpt_label') || 'Tóm tắt');
        const excerptEn = await translateText(excerptVi, 'en');
        form.setFieldsValue({ excerpt_en: excerptEn });
      }
      if (contentVi) {
        setTranslateProgressText(t('editor_content_label') || 'Nội dung');
        const contentEn = await translateText(contentVi, 'en');
        form.setFieldsValue({ content_en: contentEn });
      }
      showSuccess(t('editor_translate_success') || 'Đã dịch tự động sang Tiếng Anh thành công!');
    } catch (err: any) {
      console.error(err);
      showError((t('editor_translate_error') || 'Gặp lỗi khi dịch tự động: ') + (err.message || err.toString()));
    } finally {
      setTranslating(false);
      setTranslateProgressText('');
    }
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      showError('Vui lòng nhập chủ đề bài viết!');
      return;
    }

    setGenerating(true);
    try {
      const res = await aiService.generatePost(aiTopic);
      if (res.success && res.data) {
        const postData = res.data;
        form.setFieldsValue({
          title: postData.title_vi,
          title_en: postData.title_en,
          content: postData.content_vi,
          content_en: postData.content_en,
          meta_title: postData.meta_title_vi,
          meta_desc: postData.meta_desc_vi,
          excerpt: postData.excerpt_vi,
          excerpt_en: postData.excerpt_en,
        });

        setTitleVal(postData.title_vi);
        setExcerptVal(postData.excerpt_vi);
        setMetaTitleVal(postData.meta_title_vi);
        setMetaDescVal(postData.meta_desc_vi);

        if (postData.suggested_tags && postData.suggested_tags.length > 0) {
          const matchedTagIds: number[] = [];
          postData.suggested_tags.forEach((tagName) => {
            const matched = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
            if (matched) {
              matchedTagIds.push(matched.id);
            }
          });
          if (matchedTagIds.length > 0) {
            form.setFieldsValue({ tag_ids: matchedTagIds });
          }
        }

        showSuccess('Tạo bài viết nháp thành công bằng AI!');
        setAiModalVisible(false);
        setAiTopic('');
      } else {
        showError(res.message || 'Không thể tạo bài viết.');
      }
    } catch (err: any) {
      console.error(err);
      showError('Gặp lỗi khi tạo bài viết bằng AI: ' + (err.response?.data?.message || err.message || err.toString()));
    } finally {
      setGenerating(false);
    }
  };

  const handleAISummarize = async () => {
    const values = form.getFieldsValue();
    const contentVi = values.content;

    if (!contentVi || !contentVi.trim()) {
      showError('Cần có nội dung Tiếng Việt để tóm tắt!');
      return;
    }

    setSummarizing(true);
    try {
      const res = await aiService.summarize(contentVi, 'both');
      if (res.success && res.data) {
        form.setFieldsValue({
          excerpt: res.data.summary,
          excerpt_en: res.data.summary_en || '',
        });
        setExcerptVal(res.data.summary);
        showSuccess('Đã tóm tắt nội dung bằng AI thành công!');
      } else {
        showError(res.message || 'Không thể tóm tắt nội dung.');
      }
    } catch (err: any) {
      console.error(err);
      showError('Gặp lỗi khi tóm tắt: ' + (err.response?.data?.message || err.message || err.toString()));
    } finally {
      setSummarizing(false);
    }
  };

  const handleExtractKeywords = async () => {
    const content = form.getFieldValue('content');
    if (!content) {
      showError('Please write some content first to extract keywords.');
      return;
    }
    setExtracting(true);
    try {
      const res = await aiService.extractKeywords(content, 'vi');
      if (res.success && res.data) {
        const keywords = res.data.keywords;
        const matchedTagIds: number[] = [];
        keywords.forEach((tagName) => {
          const matched = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          if (matched) {
            matchedTagIds.push(matched.id);
          }
        });
        
        const currentTagIds = form.getFieldValue('tag_ids') || [];
        form.setFieldsValue({ tag_ids: Array.from(new Set([...currentTagIds, ...matchedTagIds])) });
        
        showSuccess('Keywords extracted successfully!');
      }
    } catch (err: any) {
      console.error(err);
      showError('Failed to extract keywords.');
    } finally {
      setExtracting(false);
    }
  };

  const handleScoreSEO = async () => {
    const title = form.getFieldValue('title') || '';
    const metaDesc = form.getFieldValue('meta_desc') || '';
    const content = form.getFieldValue('content') || '';
    
    setScoringSEO(true);
    try {
      const res = await aiService.scoreSEO(title, metaDesc, content);
      if (res.success && res.data) {
        setSeoScore(res.data.score);
        setSeoGrade(res.data.grade);
        setSeoSuggestions(res.data.suggestions || []);
      }
    } catch (err: any) {
      console.error(err);
      showError('Failed to score SEO.');
    } finally {
      setScoringSEO(false);
    }
  };

  useEffect(() => {
    if (isEdit && post) {
      form.setFieldsValue({
        title: post.title,
        title_en: post.title_en || '',
        slug: post.slug,
        slug_en: post.slug_en || '',
        excerpt: post.excerpt || '',
        excerpt_en: post.excerpt_en || '',
        content: post.content || '',
        content_en: post.content_en || '',
        status: post.status,
        cover_media_id: post.cover_media_id || undefined,
        is_featured: post.is_featured || false,
        is_document: post.is_document || false,
        pdf_media_id: post.pdf_media_id || undefined,
        meta_title: post.meta_title || '',
        meta_desc: post.meta_desc || '',
        published_at: post.published_at ? dayjs(post.published_at) : null,
        category_ids: post.categories?.map((c: Category) => c.id) || [],
        tag_ids: post.tags?.map((t: Tag) => t.id) || [],
      });

      if (post.cover_media) setSelectedCover(post.cover_media);
      if (post.pdf_media) setSelectedPDF(post.pdf_media);
    }
  }, [isEdit, post, form]);

  const loadMedia = async () => {
    try {
      const res = await mediaService.list({ limit: 100 });
      setMediaList(res.data?.items || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openMediaPicker = (target: 'cover' | 'pdf') => {
    setMediaTarget(target);
    loadMedia();
    setShowMediaModal(true);
  };

  const handleSelectMedia = (media: Media) => {
    if (mediaTarget === 'cover') {
      setSelectedCover(media);
      form.setFieldsValue({ cover_media_id: media.id });
    } else if (mediaTarget === 'pdf') {
      setSelectedPDF(media);
      form.setFieldsValue({ pdf_media_id: media.id });
    }
    setShowMediaModal(false);
    setMediaTarget(null);
  };

  const removeMedia = (target: 'cover' | 'pdf') => {
    if (target === 'cover') {
      setSelectedCover(null);
      form.setFieldsValue({ cover_media_id: undefined });
    } else if (target === 'pdf') {
      setSelectedPDF(null);
      form.setFieldsValue({ pdf_media_id: undefined });
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      published_at: values.published_at ? values.published_at.toISOString() : null,
      cover_media_id: values.cover_media_id || null,
      pdf_media_id: values.pdf_media_id || null,
    };

    try {
      if (isEdit) {
        await postService.update(Number(id), payload);
        showSuccess('Post updated successfully.');
      } else {
        await postService.create(payload);
        showSuccess('Post created successfully.');
      }
      navigate('/admin/posts');
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to save post.');
    } finally {
      setLoading(false);
    }
  };

  // Render logic continues

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-5 select-none">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/posts"
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-950 text-gray-400 hover:text-white border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEdit ? t('editor_edit_title') : t('editor_create_title')}
            </h1>
            <p className="text-xs text-gray-500 mt-1">Viết, tối ưu hóa SEO và quản lý các loại bài đăng.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            type="primary"
            onClick={() => setAiModalVisible(true)}
            icon={<Sparkles className="w-4 h-4" />}
            className="bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 border-0 rounded-xl flex items-center gap-1.5 h-10 text-sm font-bold shadow-md shadow-accentBlue/10"
          >
            Generate with AI
          </Button>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
              <Tabs defaultActiveKey="vi" className="border-b border-slate-200 dark:border-slate-800/60 mb-4">
                <Tabs.TabPane tab={t('editor_vietnamese_tab')} key="vi">
                  <div className="space-y-4 pt-2">
                    <Form.Item
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor_title_vi')}</span>}
                      name="title"
                      rules={[{ required: true, message: 'Please input Vietnamese title!' }]}
                    >
                      <Input
                        placeholder="Nhập tiêu đề tiếng Việt..."
                        className="h-10 rounded-xl"
                        onChange={(e) => setTitleVal(e.target.value)}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor_slug_vi')}</span>
                          <span className="text-[10px] text-gray-500 font-normal">Tự động tạo từ tiêu đề nếu để trống</span>
                        </div>
                      }
                      name="slug"
                    >
                      <Input
                        placeholder="e.g. kien-truc-microservices"
                        className="h-10 rounded-xl font-mono text-sm"
                        onChange={(e) => setSlugVal(e.target.value)}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor_excerpt_vi')}</span>
                          <Button
                            type="text"
                            size="small"
                            loading={summarizing}
                            onClick={handleAISummarize}
                            icon={<Sparkles className="w-3.5 h-3.5 text-accentBlue" />}
                            className="text-accentBlue hover:text-accentPurple text-xs flex items-center gap-1 p-0 h-auto font-bold"
                          >
                            AI Summarize
                          </Button>
                        </div>
                      }
                      name="excerpt"
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="Tóm tắt ngắn hiển thị tại trang chủ..."
                        className="rounded-xl resize-none text-sm"
                        onChange={(e) => setExcerptVal(e.target.value)}
                      />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor_content_vi')}</span>}
                      name="content"
                    >
                      <RichTextEditor
                        value={form.getFieldValue('content') || ''}
                        onChange={(val) => form.setFieldsValue({ content: val })}
                      />
                    </Form.Item>
                  </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab={t('editor_english_tab')} key="en">
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-end mb-2">
                      <Button
                        type="dashed"
                        loading={translating}
                        onClick={handleAutoTranslate}
                        icon={<Languages className="w-4 h-4" />}
                        className="border-accentBlue text-accentBlue hover:text-accentBlue/80 hover:border-accentBlue/80 rounded-xl flex items-center gap-1.5"
                      >
                        {translating ? `${t('editor_translating')} (${translateProgressText})...` : t('editor_auto_translate')}
                      </Button>
                    </div>

                    <Form.Item
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor_title_en')}</span>}
                      name="title_en"
                    >
                      <Input placeholder="Enter English title..." className="h-10 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                      label={
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor_slug_en')}</span>
                          <span className="text-[10px] text-gray-500 font-normal">Auto-generated from EN title if left empty</span>
                        </div>
                      }
                      name="slug_en"
                    >
                      <Input placeholder="e.g. microservices-architecture" className="h-10 rounded-xl font-mono text-sm" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor_excerpt_en')}</span>}
                      name="excerpt_en"
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="English summary..."
                        className="rounded-xl resize-none text-sm"
                      />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor_content_en')}</span>}
                      name="content_en"
                    >
                      <RichTextEditor
                        value={form.getFieldValue('content_en') || ''}
                        onChange={(val) => form.setFieldsValue({ content_en: val })}
                      />
                    </Form.Item>
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </Card>

            {/* Gallery Section */}
            {isEdit && (
              <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Post Gallery Images</h3>
                <GalleryUploader postId={Number(id)} />
              </Card>
            )}

            {/* SEO Panel */}
            <Collapse ghost expandIconPosition="end">
              <Collapse.Panel
                header={<span className="text-xs font-black text-slate-700 dark:text-gray-400 uppercase tracking-wider select-none">{t('editor_seo_title')}</span>}
                key="seo"
                className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 mb-4 px-2"
              >
                <div className="space-y-4 pt-3 select-none">
                  <Form.Item
                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meta Title</span>}
                    name="meta_title"
                  >
                    <Input
                      placeholder="Title for Google search..."
                      className="h-10 rounded-xl"
                      onChange={(e) => setMetaTitleVal(e.target.value)}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meta Description</span>}
                    name="meta_desc"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Description snippet for Google search..."
                      className="rounded-xl resize-none text-sm"
                      onChange={(e) => setMetaDescVal(e.target.value)}
                    />
                  </Form.Item>

                  {/* Google Preview Widget */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950/40">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-2">{t('editor_google_preview')}</span>
                    <div className="space-y-1">
                      <span className="text-blue-500 dark:text-blue-400 text-sm font-semibold hover:underline block truncate">
                        {metaTitleVal || titleVal || 'Google Search Display Title'}
                      </span>
                      <span className="text-green-600 dark:text-green-500 text-xs block truncate">
                        https://blog.engine/posts/{slugVal || 'example-slug'}
                      </span>
                      <span className="text-gray-500 text-xs block leading-relaxed line-clamp-2">
                        {metaDescVal || excerptVal || 'This snippet will appear under the title in search engine results. Enter meta description to optimize it.'}
                      </span>
                    </div>
                  </div>

                  {/* SEO Score Widget */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950/40">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block">SEO Score AI</span>
                      <Button
                        size="small"
                        loading={scoringSEO}
                        onClick={handleScoreSEO}
                        icon={<Sparkles className="w-3.5 h-3.5" />}
                        className="bg-accentPurple/10 text-accentPurple border-0 text-xs font-bold hover:bg-accentPurple/20 flex items-center gap-1.5"
                      >
                        Analyze SEO
                      </Button>
                    </div>
                    {seoScore !== null && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl font-black ${seoScore >= 80 ? 'text-green-500' : seoScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {seoScore}/100
                          </div>
                          <div className={`px-2 py-0.5 rounded text-xs font-bold ${seoScore >= 80 ? 'bg-green-500/10 text-green-500' : seoScore >= 50 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                            Grade {seoGrade}
                          </div>
                        </div>
                        {seoSuggestions.length > 0 && (
                          <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                            {seoSuggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>

          {/* Config Sidebar (Right) */}
          <div className="space-y-6 select-none">
            {/* Status & Featured Card */}
            <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">{t('editor_publish_settings')}</h3>
              
              <div className="space-y-4">
                <Form.Item
                  label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('table_status')}</span>}
                  name="status"
                >
                  <Select
                    options={[
                      { label: t('filter_published') || 'Published', value: 'published' },
                      { label: t('filter_draft') || 'Draft', value: 'draft' }
                    ]}
                    className="h-10 rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor_schedule_label')}</span>}
                  name="published_at"
                >
                  <DatePicker showTime className="w-full h-10 rounded-xl" />
                </Form.Item>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-200">{t('editor_featured_label')}</span>
                    <span className="text-[10px] text-gray-500 font-normal">Show on the main landing slider</span>
                  </div>
                  <Form.Item name="is_featured" valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-200">{t('editor_is_pdf')}</span>
                    <span className="text-[10px] text-gray-500 font-normal">Attach a PDF file as document</span>
                  </div>
                  <Form.Item name="is_document" valuePropName="checked" className="mb-0">
                    <Switch onChange={setIsDocVal} />
                  </Form.Item>
                </div>

                {isDocVal && (
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 animate-fade-in">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor_pdf_attached')}</span>
                    <Form.Item name="pdf_media_id" className="hidden"><Input /></Form.Item>
                    
                    {selectedPDF ? (
                      <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2 text-red-500 truncate mr-2">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="text-xs truncate font-bold">{selectedPDF.file_name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedia('pdf')}
                          className="text-red-500 hover:text-red-750 p-1 hover:bg-red-500/10 rounded"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="dashed"
                        onClick={() => openMediaPicker('pdf')}
                        className="w-full h-12 flex items-center justify-center gap-1.5 border-dashed border-red-500/35 hover:border-red-500 text-red-500 font-bold rounded-xl"
                      >
                        <FileText className="w-4 h-4" />
                        {t('editor_select_pdf')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Cover Image Picker */}
            <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">{t('editor_cover_label')}</h3>
              <Form.Item name="cover_media_id" className="hidden"><Input /></Form.Item>

              {selectedCover ? (
                <div className="space-y-2">
                  <div className="w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group">
                    <img
                      src={getFullUrl(selectedCover.url)}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="text"
                        danger
                        icon={<Trash className="w-4 h-4" />}
                        onClick={() => removeMedia('cover')}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/30 rounded-xl"
                      >
                        {t('editor_remove_cover')}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  type="dashed"
                  onClick={() => openMediaPicker('cover')}
                  className="w-full aspect-[16/10] flex flex-col items-center justify-center gap-2 border-dashed border-slate-700/60 text-gray-400 hover:text-white rounded-xl"
                >
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                  <span className="text-xs font-bold">{t('editor_pick_cover')}</span>
                </Button>
              )}
            </Card>

            {/* Categories & Tags Select */}
            <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">{t('editor_taxonomy')}</h3>
              <div className="space-y-4">
                <Form.Item
                  label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('categories')}</span>}
                  name="category_ids"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select Categories"
                    options={allCategories.map(c => ({ value: c.id, label: c.name }))}
                    className="w-full rounded-xl"
                    popupClassName="dark:bg-slate-900 border dark:border-slate-850"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('tags')}</span>
                      <Button
                        type="text"
                        size="small"
                        loading={extracting}
                        onClick={handleExtractKeywords}
                        icon={<Sparkles className="w-3.5 h-3.5 text-accentPurple" />}
                        className="text-accentPurple hover:text-accentPurple/80 text-xs flex items-center gap-1 p-0 h-auto font-bold"
                      >
                        Extract
                      </Button>
                    </div>
                  }
                  name="tag_ids"
                >
                  <Select
                    mode="multiple"
                    placeholder="Select or Create Tags"
                    options={allTags.map(t => ({ value: t.id, label: t.name }))}
                    onSearch={() => {}}
                    className="w-full rounded-xl"
                    popupClassName="dark:bg-slate-900 border dark:border-slate-850"
                    onDeselect={() => {}}
                    onSelect={() => {}}
                    // Enable tags creation
                    dropdownRender={(menu) => (
                      <div>
                        {menu}
                        <div className="border-t border-slate-200 dark:border-slate-800/60 p-2 flex items-center justify-between">
                          <span className="text-[10px] text-gray-500">Type in tag search input to create tags directly</span>
                        </div>
                      </div>
                    )}
                  />
                </Form.Item>
              </div>
            </Card>

            {/* Form Save Button */}
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<Save className="w-4 h-4" />}
              className="w-full bg-btn-global hover:brightness-110 border-0 h-11 rounded-xl font-bold flex items-center justify-center gap-1.5 text-white shadow-lg shadow-accentBlue/10"
            >
              {isEdit ? t('save_changes') : t('editor_save')}
            </Button>
          </div>
        </div>
      </Form>

      {/* Media Picker Modal */}
      <Modal
        title={<span className="font-extrabold text-slate-800 dark:text-white select-none">Select Media Item</span>}
        open={showMediaModal}
        onCancel={() => {
          setShowMediaModal(false);
          setMediaTarget(null);
        }}
        footer={null}
        width={750}
        className="select-none"
      >
        <div className="py-4 select-none">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {mediaList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 font-medium text-xs">No media uploads found in library.</div>
            ) : (
              mediaList
                .filter(m => mediaTarget === 'pdf' ? m.mime_type === 'application/pdf' : m.type === 'image')
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMedia(m)}
                    className="aspect-[1:1] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 cursor-pointer hover:border-accentBlue transition-colors flex items-center justify-center p-1 group"
                  >
                    {m.mime_type === 'application/pdf' ? (
                      <div className="flex flex-col items-center justify-center text-red-500 gap-1.5 w-full h-full p-2">
                        <FileText className="w-8 h-8 group-hover:scale-105 transition-transform" />
                        <span className="text-[10px] text-gray-400 text-center truncate w-full font-bold">{m.file_name}</span>
                      </div>
                    ) : (
                      <img
                        src={getFullUrl(m.thumbnail_url || m.url)}
                        alt=""
                        className="w-full h-full object-cover rounded-md group-hover:scale-102 transition-transform"
                      />
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </Modal>

      {/* AI Generate Modal */}
      <Modal
        title={
          <div className="flex items-center gap-1.5 font-black text-slate-800 dark:text-white">
            <Sparkles className="w-5 h-5 text-accentBlue" />
            <span>Sinh bài viết tự động với AI</span>
          </div>
        }
        open={aiModalVisible}
        onCancel={() => {
          if (!generating) {
            setAiModalVisible(false);
            setAiTopic('');
          }
        }}
        footer={[
          <Button key="cancel" disabled={generating} onClick={() => setAiModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={generating}
            onClick={handleAIGenerate}
            className="bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 border-0"
          >
            Tạo bài viết
          </Button>
        ]}
        width={500}
      >
        <div className="py-4 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Nhập chủ đề bạn muốn viết. AI sẽ tự động sinh tiêu đề, nội dung chi tiết dạng HTML, mô tả SEO và đề xuất thẻ bằng cả tiếng Việt và tiếng Anh.
          </p>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Chủ đề bài viết</label>
            <Input.TextArea
              rows={4}
              value={aiTopic}
              disabled={generating}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g. Hướng dẫn thiết lập CI/CD pipeline với GitHub Actions và deploy lên Kubernetes..."
              className="rounded-xl text-sm"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export function HydrateFallback() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-5">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[600px] bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
          <div className="h-48 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default PostEditor;
