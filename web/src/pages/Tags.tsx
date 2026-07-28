import React, { useState } from 'react';
import { useLoaderData, useSearchParams, useRevalidator } from 'react-router';
import { Tag as TagIcon, Plus, RotateCcw, AlertTriangle } from 'lucide-react';
import { tagService } from '../services/api';
import type { Tag } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Form, Input, Button, Tag as AntdTag, Spin, Modal, Switch, Tooltip } from 'antd';

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const includeDeleted = url.searchParams.get('deleted') === 'true';
  try {
    const res = await tagService.list(includeDeleted);
    return { tags: res.data || [] };
  } catch (err) {
    console.error('Failed to load tags', err);
    return { tags: [] };
  }
}

export const Tags: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  const { tags } = useLoaderData() as any;
  const { revalidate, state } = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const showDeleted = searchParams.get('deleted') === 'true';
  
  const loading = state === 'loading';
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm();

  const handleCreate = async (values: { name: string }) => {
    const trimmed = values.name.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      await tagService.create({ name: trimmed });
      showSuccess(`Tag "${trimmed}" created successfully.`);
      revalidate();
      form.resetFields();
    } catch (err: any) {
      console.error('Failed to create tag', err);
      showError(err.response?.data?.message || 'Failed to create tag.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, name: string, force = false) => {
    Modal.confirm({
      title: force ? 'Permanently Delete Tag?' : 'Delete Tag?',
      content: force 
        ? `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`
        : `Are you sure you want to delete the tag "${name}"? You can restore it later.`,
      okText: force ? 'Force Delete' : 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await tagService.delete(id, force);
          showSuccess(force ? `Tag "${name}" permanently deleted.` : `Tag "${name}" soft-deleted.`);
          revalidate();
        } catch (err: any) {
          console.error(err);
          showError(err.response?.data?.message || 'Failed to delete tag.');
        }
      }
    });
  };

  const handleRestore = async (id: number, name: string) => {
    try {
      await tagService.restore(id);
      showSuccess(`Tag "${name}" restored successfully.`);
      revalidate();
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to restore tag.');
    }
  };

  const activeTags = tags.filter(t => !t.deleted_at);
  const deletedTags = tags.filter(t => !!t.deleted_at);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="flex items-center space-x-3">
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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tags flex chips container (Left - 2 columns) */}
        <div className="lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-6 h-fit min-h-[220px]">
          <h3 className="text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4 select-none">
            {t('active_tags')} ({activeTags.length})
          </h3>
          
          {loading ? (
            <div className="py-12 text-center">
              <Spin size="medium" />
              <p className="text-xs text-gray-500 mt-2 select-none">Retrieving tags...</p>
            </div>
          ) : activeTags.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl select-none mb-6">
              <TagIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-xs text-gray-500">No active tags found. Add one on the right.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5 mb-6">
              {activeTags.map((tag) => (
                <AntdTag
                  key={tag.id}
                  closable
                  onClose={(e: any) => {
                    e.preventDefault();
                    handleDelete(tag.id, tag.name, false);
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

          {showDeleted && (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 select-none">
                {t('deleted_tags')} ({deletedTags.length})
              </h3>
              {deletedTags.length === 0 ? (
                <p className="text-xs text-gray-500 select-none">No soft-deleted tags.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {deletedTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="rounded-lg bg-red-500/10 text-red-500 font-bold px-3 py-1.5 text-xs flex items-center gap-2 border border-red-500/20"
                    >
                      <span>{tag.name}</span>
                      <span className="text-[9px] text-red-400 font-mono font-normal">({tag.slug})</span>
                      <div className="flex gap-1.5 ml-2 border-l border-red-500/20 pl-2">
                        <Tooltip title="Restore Tag">
                          <button
                            onClick={() => handleRestore(tag.id, tag.name)}
                            className="hover:text-emerald-500 transition-colors p-0.5"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </Tooltip>
                        <Tooltip title="Force Delete Permanently">
                          <button
                            onClick={() => handleDelete(tag.id, tag.name, true)}
                            className="hover:text-red-650 transition-colors p-0.5"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Tag Form Card (Right - 1 column) */}
        <div className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30 h-fit select-none">
          <h3 className="text-lg font-bold text-slate-800 dark:text-gray-200 mb-4">
            {t('create_tag')}
          </h3>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
            requiredMark={false}
          >
            <Form.Item
              label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('tag_name')}</span>}
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
                className="bg-btn-global hover:brightness-110 border-0 h-10 rounded-xl font-bold flex items-center justify-center gap-1 text-white"
              >
                {t('create_tag')}
              </Button>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div>
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[220px] animate-pulse bg-slate-200 dark:bg-slate-800/50" />
        <div className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[220px] animate-pulse bg-slate-200 dark:bg-slate-800/50" />
      </div>
    </div>
  );
}

export default Tags;
