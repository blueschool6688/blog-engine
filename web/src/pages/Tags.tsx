import React, { useEffect, useState } from 'react';
import { Tag as TagIcon, Plus } from 'lucide-react';
import { tagService } from '../services/api';
import type { Tag } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Form, Input, Button, Tag as AntdTag, Spin, Modal } from 'antd';

export async function loader() {
  return null;
}

export const Tags: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm();

  const loadTags = async () => {
    setLoading(true);
    try {
      const res = await tagService.list();
      setTags(res.data || []);
    } catch (err) {
      console.error('Failed to load tags', err);
      showError('Failed to retrieve tags.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreate = async (values: { name: string }) => {
    const trimmed = values.name.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      const res = await tagService.create({ name: trimmed });
      showSuccess(`Tag "${trimmed}" created successfully.`);
      setTags(prev => [...prev, res.data]);
      form.resetFields();
    } catch (err: any) {
      console.error('Failed to create tag', err);
      showError(err.response?.data?.message || 'Failed to create tag.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Modal.confirm({
      title: 'Delete Tag?',
      content: `Are you sure you want to permanently delete the tag "${name}"? Articles linked with this tag will not be deleted.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      okButtonProps: { className: "rounded-xl font-bold h-9" },
      cancelButtonProps: { className: "rounded-xl font-bold h-9" },
      onOk: async () => {
        try {
          await tagService.delete(id);
          showSuccess(`Tag "${name}" deleted successfully.`);
          setTags(prev => prev.filter((t) => t.id !== id));
        } catch (err) {
          console.error(err);
          showError('Failed to delete tag.');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 select-none">
        <div className="w-10 h-10 rounded-xl bg-accentBlue/10 flex items-center justify-center text-accentBlue">
          <TagIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('tags') || 'Tags'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage keywords, labels, and tags to classify blog posts</p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tags flex chips container (Left - 2 columns) */}
        <div className="lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-6 h-fit min-h-[220px]">
          <h3 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4 select-none">
            Active Tags ({tags.length})
          </h3>
          
          {loading ? (
            <div className="py-12 text-center">
              <Spin size="medium" />
              <p className="text-xs text-gray-500 mt-2 select-none">Retrieving tags...</p>
            </div>
          ) : tags.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl select-none">
              <TagIcon className="w-12 h-12 text-gray-650 mx-auto mb-3" />
              <p className="text-xs text-gray-500">No tags found. Add one on the right.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {tags.map((tag) => (
                <AntdTag
                  key={tag.id}
                  closable
                  onClose={(e: any) => {
                    e.preventDefault();
                    handleDelete(tag.id, tag.name);
                  }}
                  color="blue"
                  className="rounded-lg border-0 font-bold px-3 py-1 text-xs select-all flex items-center gap-1.5 dark:bg-slate-900 dark:text-accentBlue"
                >
                  {tag.name}
                  <span className="text-[10px] text-gray-500 font-mono font-normal">
                    ({tag.slug})
                  </span>
                </AntdTag>
              ))}
            </div>
          )}
        </div>

        {/* Add Tag Form Card (Right - 1 column) */}
        <div className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30 h-fit select-none">
          <h3 className="text-lg font-bold text-slate-800 dark:text-gray-200 mb-4">
            Create Tag
          </h3>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
            requiredMark={false}
          >
            <Form.Item
              label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tag Name</span>}
              name="name"
              rules={[
                { required: true, message: 'Please input tag name!' },
                { max: 100, message: 'Tag name is too long!' }
              ]}
            >
              <Input placeholder="e.g. Kubernetes" className="h-10 rounded-xl" />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                block
                icon={<Plus className="w-3.5 h-3.5" />}
                className="bg-btn-global hover:brightness-110 border-0 h-10 rounded-xl font-bold flex items-center justify-center gap-1"
              >
                Create Tag
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Tags;
