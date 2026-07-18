import React, { useEffect, useState } from 'react';
import { Folder, Edit2, Trash2, Plus } from 'lucide-react';
import { categoryService } from '../services/api';
import type { Category } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Table, Form, Input, Button, Space, Tooltip, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export async function loader() {
  return null;
}

export const Categories: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form] = Form.useForm();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.list();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
      showError('Failed to retrieve categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.resetFields();
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Delete Category?',
      content: 'Are you sure you want to permanently delete this category? Articles under this category will not be deleted but will lose their category association.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      okButtonProps: { className: "rounded-xl font-bold h-9" },
      cancelButtonProps: { className: "rounded-xl font-bold h-9" },
      onOk: async () => {
        try {
          await categoryService.delete(id);
          showSuccess('Category deleted successfully.');
          setCategories(prev => prev.filter((c) => c.id !== id));
          if (editingId === id) {
            handleCancelEdit();
          }
        } catch (err) {
          console.error(err);
          showError('Failed to delete category.');
        }
      }
    });
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      if (editingId !== null) {
        const res = await categoryService.update(editingId, values);
        if (res.success) {
          showSuccess('Category updated successfully.');
          setCategories(prev => prev.map((c) => (c.id === editingId ? res.data : c)));
          handleCancelEdit();
        }
      } else {
        const res = await categoryService.create(values);
        if (res.success) {
          showSuccess('Category created successfully.');
          setCategories(prev => [...prev, res.data]);
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

  const columns: ColumnsType<Category> = [
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: Category) => (
        <div className="space-y-1">
          <span className="font-bold text-slate-850 dark:text-gray-200 block text-xs md:text-[13.5px]">
            {text}
          </span>
          <span className="text-[10px] font-mono text-gray-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full select-all">
            {record.slug}
          </span>
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: any) => <span className="text-xs text-gray-500 font-medium">{text || '-'}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      align: 'right',
      render: (_: any, record: Category) => (
        <Space size="small">
          <Tooltip title="Edit Category">
            <Button
              type="text"
              icon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => handleEdit(record)}
              className="bg-slate-850 hover:bg-slate-800 text-gray-300 flex items-center justify-center p-2 rounded-lg border border-slate-800"
            />
          </Tooltip>
          <Tooltip title="Delete Category">
            <Button
              type="text"
              danger
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => handleDelete(record.id)}
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
      <div className="flex items-center space-x-3 select-none">
        <div className="w-10 h-10 rounded-xl bg-accentBlue/10 flex items-center justify-center text-accentBlue">
          <Folder className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('categories') || 'Categories'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">Organize articles and topics within technical categories</p>
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
            {editingId !== null ? 'Edit Category' : 'Create Category'}
          </h3>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item
              label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category Name</span>}
              name="name"
              rules={[{ required: true, message: 'Please input category name!' }]}
            >
              <Input placeholder="e.g. Cloud Architecture" className="h-10 rounded-xl" />
            </Form.Item>

            <Form.Item
              label={
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Slug (Optional)</span>
                  <span className="text-[10px] text-gray-500 font-normal">Auto-generated from name if left empty</span>
                </div>
              }
              name="slug"
            >
              <Input placeholder="e.g. cloud-architecture" className="h-10 rounded-xl font-mono text-sm" />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description (Optional)</span>}
              name="description"
            >
              <Input.TextArea
                rows={3}
                placeholder="Short description for SEO and archive cards..."
                className="rounded-xl resize-none text-sm"
              />
            </Form.Item>

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
                  className="bg-btn-global hover:brightness-110 border-0 h-9 rounded-xl font-bold flex items-center gap-1"
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

export default Categories;
