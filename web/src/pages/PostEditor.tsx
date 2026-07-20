import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Save, Image as ImageIcon, Trash, FileText } from 'lucide-react';
import { postService, mediaService, categoryService, tagService, getFullUrl } from '../services/api';
import type { Media, Category, Tag } from '../services/api';
import { RichTextEditor } from '../components/RichTextEditor';
import { GalleryUploader } from '../components/GalleryUploader';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Form, Input, Button, Select, Switch, DatePicker, Collapse, Card, Spin, Modal, Tabs } from 'antd';
import dayjs from 'dayjs';

export async function loader() {
  return null;
}

export const PostEditor: React.FC = () => {
  useLanguage();
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

  // Option lists
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // Watchers for custom rendering (SEO Google preview, etc.)
  const [titleVal, setTitleVal] = useState('');
  const [slugVal, setSlugVal] = useState('');
  const [excerptVal, setExcerptVal] = useState('');
  const [metaTitleVal, setMetaTitleVal] = useState('');
  const [metaDescVal, setMetaDescVal] = useState('');
  const [isDocVal, setIsDocVal] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          categoryService.list(),
          tagService.list()
        ]);
        setAllCategories(catRes.data || []);
        setAllTags(tagRes.data || []);
      } catch (err) {
        console.error('Failed to load filters options', err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const loadPost = async () => {
        setFetching(true);
        try {
          const res = await postService.detail(Number(id));
          const post = res.data;
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
            category_ids: post.categories?.map(c => c.id) || [],
            tag_ids: post.tags?.map(t => t.id) || [],
          });

          // Sync local state for previews
          setTitleVal(post.title || '');
          setSlugVal(post.slug || '');
          setExcerptVal(post.excerpt || '');
          setMetaTitleVal(post.meta_title || '');
          setMetaDescVal(post.meta_desc || '');
          setIsDocVal(post.is_document || false);

          if (post.cover_media) setSelectedCover(post.cover_media);
          if (post.pdf_media) setSelectedPDF(post.pdf_media);
        } catch (err) {
          console.error(err);
          showError('Failed to load post details.');
          navigate('/admin/posts');
        } finally {
          setFetching(false);
        }
      };
      loadPost();
    }
  }, [id, isEdit, form, navigate]);

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



  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" tip="Loading post details..." />
      </div>
    );
  }

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
              {isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">Viết, tối ưu hóa SEO và quản lý các loại bài đăng.</p>
          </div>
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
                <Tabs.TabPane tab="Tiếng Việt (Bản dịch chính)" key="vi">
                  <div className="space-y-4 pt-2">
                    <Form.Item
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tiêu đề bài viết (VI)</span>}
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
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đường dẫn Slug VI</span>
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
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tóm tắt ngắn (VI)</span>}
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
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nội dung bài viết (VI)</span>}
                      name="content"
                    >
                      <RichTextEditor
                        value={form.getFieldValue('content') || ''}
                        onChange={(val) => form.setFieldsValue({ content: val })}
                      />
                    </Form.Item>
                  </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab="English (Translation)" key="en">
                  <div className="space-y-4 pt-2">
                    <Form.Item
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Article Title (EN)</span>}
                      name="title_en"
                    >
                      <Input placeholder="Enter English title..." className="h-10 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                      label={
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Slug EN</span>
                          <span className="text-[10px] text-gray-500 font-normal">Auto-generated from EN title if left empty</span>
                        </div>
                      }
                      name="slug_en"
                    >
                      <Input placeholder="e.g. microservices-architecture" className="h-10 rounded-xl font-mono text-sm" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Short Excerpt (EN)</span>}
                      name="excerpt_en"
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="English summary..."
                        className="rounded-xl resize-none text-sm"
                      />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Article Content (EN)</span>}
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
                header={<span className="text-xs font-black text-slate-700 dark:text-gray-400 uppercase tracking-wider select-none">SEO Metadata Config</span>}
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
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-2">Google Preview Mockup</span>
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
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>

          {/* Config Sidebar (Right) */}
          <div className="space-y-6 select-none">
            {/* Status & Featured Card */}
            <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Publish Settings</h3>
              
              <div className="space-y-4">
                <Form.Item
                  label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Publish Status</span>}
                  name="status"
                >
                  <Select
                    options={[
                      { label: 'Published (Công khai)', value: 'published' },
                      { label: 'Draft (Bản nháp)', value: 'draft' }
                    ]}
                    className="h-10 rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Publish Date & Time (Schedule)</span>}
                  name="published_at"
                >
                  <DatePicker showTime className="w-full h-10 rounded-xl" />
                </Form.Item>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-200">Featured Article</span>
                    <span className="text-[10px] text-gray-500 font-normal">Show on the main landing slider</span>
                  </div>
                  <Form.Item name="is_featured" valuePropName="checked" className="mb-0">
                    <Switch />
                  </Form.Item>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-gray-200">Is PDF Document Post</span>
                    <span className="text-[10px] text-gray-500 font-normal">Attach a PDF file as document</span>
                  </div>
                  <Form.Item name="is_document" valuePropName="checked" className="mb-0">
                    <Switch onChange={setIsDocVal} />
                  </Form.Item>
                </div>

                {isDocVal && (
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 animate-fade-in">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attached PDF File</span>
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
                        Select PDF File
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Cover Image Picker */}
            <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Cover Image</h3>
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
                        Remove Cover
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
                  <span className="text-xs font-bold">Pick Cover Image</span>
                </Button>
              )}
            </Card>

            {/* Categories & Tags Select */}
            <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Taxonomy</h3>
              <div className="space-y-4">
                <Form.Item
                  label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</span>}
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
                  label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tags</span>}
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
              {isEdit ? 'Save Changes' : 'Publish Article'}
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
    </div>
  );
};

export default PostEditor;
