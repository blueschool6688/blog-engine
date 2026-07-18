import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Plus, Edit2, Trash2, Star, Search } from 'lucide-react';
import { postService, categoryService, tagService, getFullUrl } from '../services/api';
import type { Post, Category, Tag } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Table, Button, Input, Select, Modal, Space, Tag as AntdTag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export async function loader() {
  return null;
}

export const PostList: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [tagFilter, setTagFilter] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // Selection & Modal states
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // Fetch categories & tags for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          categoryService.list(),
          tagService.list()
        ]);
        setAllCategories(catRes.data || []);
        setAllTags(tagRes.data || []);
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    };
    fetchFilters();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const response = await postService.list(
        offset,
        limit,
        statusFilter,
        debouncedSearchQuery,
        categoryFilter,
        tagFilter
      );
      setPosts(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Failed to load posts', err);
      showError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, statusFilter, debouncedSearchQuery, categoryFilter, tagFilter]);

  // Bulk actions
  const handleBulkAction = async (action: 'publish' | 'draft' | 'delete') => {
    if (selectedRowKeys.length === 0) return;
    setIsBulkLoading(true);
    try {
      const ids = selectedRowKeys.map(key => Number(key));
      if (action === 'delete') {
        await Promise.all(ids.map(id => postService.delete(id)));
        showSuccess('Selected posts deleted successfully');
      } else {
        await Promise.all(ids.map(id => postService.update(id, { status: action === 'publish' ? 'published' : 'draft' })));
        showSuccess(`Selected posts status updated to ${action}`);
      }
      setSelectedRowKeys([]);
      fetchPosts();
    } catch (err) {
      console.error('Bulk action failed', err);
      showError('Failed to complete bulk action');
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Single delete
  const handleDeleteConfirm = async () => {
    if (!deletePostId) return;
    try {
      await postService.delete(deletePostId);
      showSuccess(t('post_deleted_success') || 'Deleted post successfully');
      setDeletePostId(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
      showError(t('post_deleted_error') || 'Failed to delete post');
    }
  };

  // Table row selection
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Table Columns config
  const columns: ColumnsType<Post> = [
    {
      title: 'Cover',
      dataIndex: 'cover_media',
      key: 'cover_media',
      width: 80,
      render: (_: any, record: Post) => {
        if (record.cover_media) {
          return (
            <div className="w-12 h-12 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800">
              <img
                src={getFullUrl(record.cover_media.thumbnail_url || record.cover_media.url)}
                alt=""
                className="object-cover w-full h-full"
              />
            </div>
          );
        }
        return (
          <div className="w-12 h-12 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-center">
            <Plus className="w-4 h-4 text-gray-650" />
          </div>
        );
      }
    },
    {
      title: t('table_title'),
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Post) => (
        <div className="space-y-1">
          <span className="font-bold text-slate-850 dark:text-gray-200 block text-[13.5px] hover:text-accentBlue transition-colors">
            <Link to={`/admin/posts/edit/${record.id}`}>{text}</Link>
          </span>
          <div className="flex gap-2">
            {record.is_featured && (
              <AntdTag color="amber" className="flex items-center gap-1 border-0 uppercase font-black text-[9px] px-2 py-0.5 tracking-wide">
                <Star className="w-2.5 h-2.5 fill-current" />
                Featured
              </AntdTag>
            )}
            <span className="text-[10px] text-gray-500 font-mono">
              views: {record.view_count || 0}
            </span>
          </div>
        </div>
      )
    },
    {
      title: t('table_author'),
      dataIndex: ['author', 'name'],
      key: 'author',
      width: 140,
      render: (text: string) => <span className="text-xs text-gray-500 font-semibold">{text || '-'}</span>
    },
    {
      title: t('table_category'),
      dataIndex: 'categories',
      key: 'categories',
      width: 150,
      render: (_: any, record: Post) => {
        const cat = record.categories?.[0];
        return cat ? (
          <AntdTag color="purple" className="rounded-lg border-0 font-bold px-2.5 py-0.5 text-xs">
            {cat.name}
          </AntdTag>
        ) : (
          <span className="text-gray-500 text-xs">-</span>
        );
      }
    },
    {
      title: t('table_status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const isPublished = status === 'published';
        return (
          <AntdTag color={isPublished ? 'success' : 'warning'} className="rounded-lg border-0 uppercase font-bold tracking-wider px-2 py-0.5 text-[9px]">
            {isPublished ? 'Published' : 'Draft'}
          </AntdTag>
        );
      }
    },
    {
      title: t('table_actions'),
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_: any, record: Post) => (
        <Space size="middle">
          <Tooltip title="Edit Post">
            <Button
              type="text"
              icon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/admin/posts/edit/${record.id}`)}
              className="bg-slate-800 hover:bg-slate-700/80 text-gray-300 flex items-center justify-center p-2 rounded-lg border border-slate-750"
            />
          </Tooltip>
          <Tooltip title="Delete Post">
            <Button
              type="text"
              danger
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setDeletePostId(record.id)}
              className="bg-dangerRed/10 hover:bg-dangerRed/20 text-dangerRed flex items-center justify-center p-2 rounded-lg border border-dangerRed/20"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('posts_management')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">{t('posts_management_desc')}</p>
        </div>
        <Link
          to="/admin/posts/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-btn-global hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-accentBlue/10 select-none"
        >
          <Plus className="w-4 h-4" />
          <span>{t('create_post')}</span>
        </Link>
      </div>

      {/* Main Glassmorphic Wrapper */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-900/30 p-4 space-y-4">

        {/* Bulk Action Toolbar */}
        {selectedRowKeys.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800/50 p-3.5 rounded-xl flex items-center justify-between animate-fade-in z-20">
            <div className="flex items-center space-x-3 select-none">
              <span className="text-xs bg-accentBlue/15 border border-accentBlue/25 text-accentBlue px-2.5 py-1 rounded-full font-semibold">
                {selectedRowKeys.length} Selected
              </span>
              <Button
                type="text"
                size="small"
                onClick={() => setSelectedRowKeys([])}
                className="text-xs text-gray-400 hover:text-white font-medium"
              >
                Clear
              </Button>
            </div>

            <Space>
              <Button
                loading={isBulkLoading}
                onClick={() => handleBulkAction('publish')}
                className="bg-slate-850 hover:bg-slate-800 border-slate-800 text-successGreen hover:text-successGreen text-xs h-9 rounded-xl font-bold"
              >
                {t('filter_published')}
              </Button>
              <Button
                loading={isBulkLoading}
                onClick={() => handleBulkAction('draft')}
                className="bg-slate-850 hover:bg-slate-800 border-slate-800 text-warningYellow hover:text-warningYellow text-xs h-9 rounded-xl font-bold"
              >
                {t('filter_draft')}
              </Button>
              <Button
                danger
                loading={isBulkLoading}
                onClick={() => handleBulkAction('delete')}
                className="bg-dangerRed/10 border-dangerRed/20 text-dangerRed text-xs h-9 rounded-xl font-bold"
              >
                {t('bulk_delete')}
              </Button>
            </Space>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status select */}
            <Select
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
              options={[
                { label: t('filter_all'), value: '' },
                { label: t('filter_published'), value: 'published' },
                { label: t('filter_draft'), value: 'draft' }
              ]}
              className="w-36 h-9 rounded-xl"
            />

            {/* Category Filter */}
            <Select
              placeholder="All Categories"
              allowClear
              value={categoryFilter}
              onChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}
              className="w-44 h-9"
            >
              {allCategories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>

            {/* Tag Filter */}
            <Select
              placeholder="All Tags"
              allowClear
              value={tagFilter}
              onChange={(val) => { setTagFilter(val); setCurrentPage(1); }}
              className="w-40 h-9"
            >
              {allTags.map(tag => (
                <Select.Option key={tag.id} value={tag.id}>{tag.name}</Select.Option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Search Box */}
            <Input
              placeholder="Search posts..."
              prefix={<Search className="w-3.5 h-3.5 text-gray-500 mr-1" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-64 h-9 rounded-xl"
            />
            <div className="text-xs text-gray-500 shrink-0 font-mono">Total: {total}</div>
          </div>
        </div>

        {/* Ant Design Table */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: limit,
            total: total,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            className: "select-none"
          }}
          className="border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden bg-transparent"
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title={<span className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2 select-none"><Trash2 className="w-5 h-5 text-dangerRed" /> Delete Article?</span>}
        open={deletePostId !== null}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeletePostId(null)}
        okText={t('btn_delete') || 'Delete'}
        cancelText={t('btn_cancel') || 'Cancel'}
        okButtonProps={{ danger: true, className: "rounded-xl font-bold h-9" }}
        cancelButtonProps={{ className: "rounded-xl font-bold h-9" }}
        className="select-none"
      >
        <p className="text-sm text-gray-500 mt-3 mb-2 font-medium leading-relaxed select-text">
          Are you sure you want to permanently delete this article? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default PostList;
