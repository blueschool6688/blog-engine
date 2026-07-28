import React, { useState } from 'react';
import { useLoaderData, useSearchParams, useRevalidator } from 'react-router';
import { Folder, Edit2, Trash2, Plus, RotateCcw, AlertTriangle } from 'lucide-react';
import { categoryService } from '../services/api';
import type { Category } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Table, Form, Input, Button, Space, Tooltip, Modal, Select, Tabs, Switch, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const includeDeleted = url.searchParams.get('deleted') === 'true';
  try {
    const res = await categoryService.list(includeDeleted);
    return { categories: res.data || [] };
  } catch (err) {
    console.error('Failed to load categories', err);
    return { categories: [] };
  }
}

export const Categories: React.FC = () => {
  const { t, language } = useLanguage();
  const { showSuccess, showError } = useToast();

  const { categories } = useLoaderData() as any;
  const { revalidate, state } = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const showDeleted = searchParams.get('deleted') === 'true';
  
  const loading = state === 'loading';
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form] = Form.useForm();

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    form.setFieldsValue({
      name: category.name,
      name_en: category.name_en || '',
      slug: category.slug,
      slug_en: category.slug_en || '',
      description: category.description || '',
      description_en: category.description_en || '',
      parent_id: category.parent_id || undefined,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.resetFields();
  };

  const handleDelete = (id: number, force = false) => {
    Modal.confirm({
      title: force ? 'Permanently Delete Category?' : 'Delete Category (Soft Delete)?',
      content: force 
        ? 'Are you sure you want to permanently delete this category? This action cannot be undone.'
        : 'Are you sure you want to delete this category? You can restore it later from the deleted view.',
      okText: force ? 'Force Delete' : 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await categoryService.delete(id, force);
          showSuccess(force ? 'Category permanently deleted.' : 'Category soft-deleted successfully.');
          revalidate();
          if (editingId === id) {
            handleCancelEdit();
          }
        } catch (err: any) {
          console.error(err);
          showError(err.response?.data?.message || 'Failed to delete category.');
        }
      }
    });
  };

  const handleRestore = async (id: number) => {
    try {
      await categoryService.restore(id);
      showSuccess('Category restored successfully.');
      revalidate();
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to restore category.');
    }
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    // Convert undefined parent_id to null
    const payload = {
      ...values,
      parent_id: values.parent_id || null,
    };
    try {
      if (editingId !== null) {
        const res = await categoryService.update(editingId, payload);
        if (res.success) {
          showSuccess('Category updated successfully.');
          revalidate();
          handleCancelEdit();
        }
      } else {
        const res = await categoryService.create(payload);
        if (res.success) {
          showSuccess('Category created successfully.');
          revalidate();
          form.resetFields();
        }
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  // Filter possible parents (cannot be itself or a child of itself to avoid loops)
  const getParentOptions = () => {
    return categories
      .filter((c) => !c.deleted_at && c.id !== editingId)
      .map((c) => ({
        value: c.id,
        label: `${c.name} ${c.name_en ? `(${c.name_en})` : ''}`,
      }));
  };

  const columns: ColumnsType<Category> = [
    {
      title: t('category_name'),
      key: 'name',
      render: (_, record: Category) => (
        <div className="space-y-1">
          <div className="font-bold text-slate-850 dark:text-gray-200 text-xs md:text-[13.5px]">
            {record.name} {record.name_en && <span className="text-gray-400 font-normal">/ {record.name_en}</span>}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-[10px] font-mono text-gray-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full select-all">
              {record.slug}
            </span>
            {record.slug_en && (
              <span className="text-[10px] font-mono text-gray-400 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full select-all">
                en: {record.slug_en}
              </span>
            )}
            {record.deleted_at && (
              <Tag color="red" className="text-[9px] py-0 px-1 border-0 m-0">Deleted</Tag>
            )}
          </div>
        </div>
      )
    },
    {
      title: t('parent_category'),
      dataIndex: ['parent', 'name'],
      key: 'parent',
      render: (_, record: Category) => {
        if (record.parent) {
          return (
            <Tag color="blue" className="text-[10px]">
              {record.parent.name}
            </Tag>
          );
        }
        return <span className="text-gray-400 text-xs">-</span>;
      }
    },
    {
      title: t('description'),
      key: 'description',
      ellipsis: true,
      render: (_, record: Category) => {
        const desc = language === 'en' ? record.description_en || record.description : record.description;
        return <span className="text-xs text-gray-500 font-medium">{desc || '-'}</span>;
      }
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 130,
      align: 'right',
      render: (_: any, record: Category) => {
        if (record.deleted_at) {
          return (
            <Space size="small">
              <Tooltip title="Restore Category">
                <Button
                  type="text"
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => handleRestore(record.id)}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center p-2 rounded-lg border border-emerald-500/20"
                />
              </Tooltip>
              <Tooltip title="Force Delete Permanently">
                <Button
                  type="text"
                  danger
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                  onClick={() => handleDelete(record.id, true)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center p-2 rounded-lg border border-red-500/20"
                />
              </Tooltip>
            </Space>
          );
        }

        return (
          <Space size="small">
            <Tooltip title="Edit Category">
              <Button
                type="text"
                icon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => handleEdit(record)}
                className="bg-slate-850 hover:bg-slate-800 text-gray-300 flex items-center justify-center p-2 rounded-lg border border-slate-800"
              />
            </Tooltip>
            <Tooltip title="Soft Delete">
              <Button
                type="text"
                danger
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => handleDelete(record.id, false)}
                className="bg-dangerRed/10 hover:bg-dangerRed/20 text-dangerRed flex items-center justify-center p-2 rounded-lg border border-dangerRed/20"
              />
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accentBlue/10 flex items-center justify-center text-accentBlue">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('categories') || 'Categories'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">Organize articles and topics within hierarchical categories</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-xl px-4 py-2 w-fit">
          <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">{t('show_deleted')}</span>
          <Switch 
            checked={showDeleted} 
            onChange={(checked) => {
              const next = new URLSearchParams(searchParams);
              if (checked) next.set('deleted', 'true');
              else next.delete('deleted');
              setSearchParams(next);
            }} 
            size="small" 
          />
        </div>
      </div>

      {/* 2 Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Categories List (Left - 2 columns) */}
        <div className="lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4 h-fit">
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8, showSizeChanger: false, className: "select-none" }}
            className="border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden bg-transparent"
          />
        </div>

        {/* Create/Edit Form (Right - 1 column) */}
        <div className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30 h-fit select-none">
          <h3 className="text-lg font-bold text-slate-800 dark:text-gray-200 mb-4 flex items-center gap-1.5">
            {editingId !== null ? t('edit_category') : t('create_category')}
          </h3>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item
              label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('parent_category')}</span>}
              name="parent_id"
            >
              <Select
                placeholder="None (Root Category)"
                options={getParentOptions()}
                allowClear
                className="h-10 rounded-xl"
                popupClassName="dark:bg-slate-900 border dark:border-slate-850"
              />
            </Form.Item>

            <Tabs defaultActiveKey="vi" size="small" className="border-b border-slate-200 dark:border-slate-800/60 mb-2">
              <Tabs.TabPane tab="Tiếng Việt" key="vi">
                <div className="space-y-4 pt-2">
                  <Form.Item
                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tên chuyên mục (VI)</span>}
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên chuyên mục!' }]}
                  >
                    <Input placeholder="Ví dụ: Kiến trúc đám mây" className="h-10 rounded-xl" />
                  </Form.Item>

                  <Form.Item
                    label={
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Slug VI (Tùy chọn)</span>
                        <span className="text-[10px] text-gray-500 font-normal">Tự động tạo từ tên nếu để trống</span>
                      </div>
                    }
                    name="slug"
                  >
                    <Input placeholder="Ví dụ: kien-truc-dam-may" className="h-10 rounded-xl font-mono text-sm" />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mô tả (VI)</span>}
                    name="description"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Mô tả ngắn cho chuyên mục hiển thị..."
                      className="rounded-xl resize-none text-sm"
                    />
                  </Form.Item>
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab="English" key="en">
                <div className="space-y-4 pt-2">
                  <Form.Item
                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category Name (EN)</span>}
                    name="name_en"
                  >
                    <Input placeholder="e.g. Cloud Architecture" className="h-10 rounded-xl" />
                  </Form.Item>

                  <Form.Item
                    label={
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Slug EN (Optional)</span>
                        <span className="text-[10px] text-gray-500 font-normal">Auto-generated if left empty</span>
                      </div>
                    }
                    name="slug_en"
                  >
                    <Input placeholder="e.g. cloud-architecture" className="h-10 rounded-xl font-mono text-sm" />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description (EN)</span>}
                    name="description_en"
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Short description in English..."
                      className="rounded-xl resize-none text-sm"
                    />
                  </Form.Item>
                </div>
              </Tabs.TabPane>
            </Tabs>

            <Form.Item className="pt-2 mb-0">
              <Space className="w-full justify-end">
                {editingId !== null && (
                  <Button onClick={handleCancelEdit} className="rounded-xl font-bold h-9">
                    Cancel
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="bg-btn-global hover:brightness-110 border-0 h-9 rounded-xl font-bold flex items-center gap-1 text-white"
                >
                  {editingId !== null ? 'Save Changes' : 'Create Category'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export function HydrateFallback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div>
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" />
        <div className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" />
      </div>
    </div>
  );
}

export default Categories;
