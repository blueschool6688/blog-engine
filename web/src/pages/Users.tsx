import React, { useState } from 'react';
import { useLoaderData, useSearchParams, useRevalidator, useNavigation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService, getFullUrl } from '../services/api';
import type { User } from '../services/api';
import { Table, Button, Modal, Form, Input, Select, Switch, Tag as AntdTag, Tooltip, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus, Edit2, Shield, AlertOctagon, Mail, Lock, User as UserIcon } from 'lucide-react';

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const roleFilter = url.searchParams.get('role') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    const res = await userService.list(offset, limit, roleFilter);
    if (res.success && res.data) {
      return { users: res.data.items || [], total: res.data.total || 0 };
    }
  } catch (err) {
    console.error('Failed to retrieve user list', err);
  }
  return { users: [], total: 0 };
}

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const { users, total } = useLoaderData() as any;
  const { revalidate, state } = useRevalidator();
  const navigation = useNavigation();
  const loading = navigation.state === 'loading';
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFilter = searchParams.get('role') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = 10;

  // Create/Edit Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  const [form] = Form.useForm();

  if (currentUser?.role !== 'admin') {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-dangerRed/10 border border-dangerRed/25 rounded-full flex items-center justify-center mx-auto text-dangerRed animate-pulse">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-100">Access Denied</h3>
        <p className="text-sm text-gray-500 font-sans leading-relaxed">
          You do not have administrative privileges to access user account management. Please contact your system administrator.
        </p>
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      nickname: user.nickname || '',
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (values: any) => {
    setModalLoading(true);
    try {
      if (editingUser) {
        // Update user
        await userService.update(editingUser.id, {
          name: values.name,
          nickname: values.nickname,
          role: values.role,
          is_active: values.is_active,
        });
        showSuccess('User account updated successfully');
      } else {
        // Create user
        await userService.create({
          name: values.name,
          nickname: values.nickname,
          email: values.email,
          password: values.password,
          role: values.role,
        });
        showSuccess('New user account created successfully');
      }
      setIsModalOpen(false);
      revalidate();
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Failed to save user account');
    } finally {
      setModalLoading(false);
    }
  };

  const toggleUserStatus = async (user: User, checked: boolean) => {
    try {
      await userService.update(user.id, {
        name: user.name,
        nickname: user.nickname || '',
        role: user.role,
        is_active: checked,
      });
      showSuccess(`Successfully ${checked ? 'activated' : 'deactivated'} user ${user.name}`);
      revalidate();
    } catch (err) {
      console.error(err);
      showError('Failed to change user status');
    }
  };

  // Helper avatar fallback
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Member',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: User) => (
        <div className="flex items-center space-x-3 select-none">
          <Avatar
            src={record.avatar_url ? getFullUrl(record.avatar_url) : undefined}
            className="bg-slate-800 text-white font-extrabold flex items-center justify-center shrink-0 border border-slate-700 w-9 h-9"
          >
            {getInitial(record.name)}
          </Avatar>
          <div className="min-w-0">
            <span className="font-bold text-sm text-slate-850 dark:text-gray-255 block truncate">
              {record.name}
            </span>
            <span className="text-xs text-gray-500 block truncate font-semibold">
              @{record.nickname || 'no-nick'}
              {record.id === currentUser.id && (
                <span className="ml-1 text-[9px] font-black text-accentPurple uppercase tracking-wider">
                  (You)
                </span>
              )}
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
      render: (text: any) => <span className="text-xs text-gray-400 font-medium">{text}</span>
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: any) => {
        const isAdmin = role === 'admin';
        return (
          <AntdTag color={isAdmin ? 'blue' : 'orange'} className="rounded-lg border-0 uppercase font-black tracking-wider text-[9px] px-2.5 py-0.5">
            <span className="flex items-center gap-1">
              {isAdmin && <Shield className="w-2.5 h-2.5" />}
              {isAdmin ? 'Admin' : 'Editor'}
            </span>
          </AntdTag>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 140,
      render: (isActive: any, record: User) => (
        <Tooltip title={record.id === currentUser.id ? "Cannot deactivate yourself" : "Toggle active status"}>
          <Switch
            checked={isActive}
            disabled={record.id === currentUser.id}
            onChange={(checked: boolean) => toggleUserStatus(record, checked)}
            size="small"
          />
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_: any, record: User) => (
        <Tooltip title="Edit Member Info">
          <Button
            type="text"
            icon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={() => openEditModal(record)}
            className="bg-slate-800 hover:bg-slate-700/85 text-gray-300 flex items-center justify-center p-2 rounded-lg border border-slate-750"
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Member Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage system administrators, editors, and nickname handles</p>
        </div>
        <Button
          type="primary"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4" />}
          className="bg-btn-global hover:brightness-110 border-0 h-10 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accentBlue/10"
        >
          Add New Member
        </Button>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-900/30 p-4 space-y-4">
        
        {/* Filters bar */}
        <div className="flex justify-between items-center select-none pb-2">
          <Select
            value={roleFilter}
            onChange={(val: string) => { 
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (val) next.set('role', val);
                else next.delete('role');
                next.set('page', '1');
                return next;
              });
            }}
            options={[
              { label: 'All Roles', value: '' },
              { label: 'Admin', value: 'admin' },
              { label: 'Editor', value: 'editor' }
            ]}
            className="w-40 h-9"
          />
          <div className="text-xs text-gray-500 font-mono">Total Members: {total}</div>
        </div>

        {/* Ant Design Table */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: limit,
            total: total,
            onChange: (page: number) => {
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.set('page', String(page));
                return next;
              });
            },
            showSizeChanger: false,
            className: "select-none"
          }}
          className="border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden bg-transparent"
        />
      </div>

      {/* Add / Edit Member Modal */}
      <Modal
        title={
          <span className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2 select-none">
            {editingUser ? 'Edit Member Profile' : 'Add New System Member'}
          </span>
        }
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={modalLoading}
        okText={editingUser ? 'Save Changes' : 'Create Account'}
        cancelText="Cancel"
        okButtonProps={{ className: "rounded-xl font-bold h-9 bg-btn-global border-0 hover:brightness-105" }}
        cancelButtonProps={{ className: "rounded-xl font-bold h-9" }}
        destroyOnClose
        className="select-none"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalSubmit}
          initialValues={{ role: 'editor', is_active: true }}
          requiredMark={false}
          className="pt-4 space-y-3"
        >
          <Form.Item
            label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please input display name!' }]}
          >
            <Input
              prefix={<UserIcon className="w-4 h-4 text-gray-500 mr-1 shrink-0" />}
              placeholder="e.g. John Doe"
              className="h-10 rounded-xl"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nickname (Required, lowercase without space)</span>}
            name="nickname"
            rules={[
              { required: true, message: 'Please input nickname handle!' },
              { pattern: /^[a-z0-9_.-]+$/, message: 'Nickname must be lowercase alphanumeric, dashes, dots, or underscores only.' }
            ]}
          >
            <Input
              prefix={<span className="text-xs text-gray-500 font-bold mr-1 shrink-0">@</span>}
              placeholder="e.g. johndoe"
              className="h-10 rounded-xl"
            />
          </Form.Item>

          {!editingUser && (
            <>
              <Form.Item
                label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</span>}
                name="email"
                rules={[
                  { required: true, message: 'Please input email!' },
                  { type: 'email', message: 'Please input a valid email!' }
                ]}
              >
                <Input
                  prefix={<Mail className="w-4 h-4 text-gray-500 mr-1 shrink-0" />}
                  placeholder="name@example.com"
                  className="h-10 rounded-xl"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</span>}
                name="password"
                rules={[
                  { required: true, message: 'Please input password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<Lock className="w-4 h-4 text-gray-500 mr-1 shrink-0" />}
                  placeholder="Min 6 characters..."
                  className="h-10 rounded-xl"
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Role</span>}
            name="role"
            rules={[{ required: true }]}
          >
            <Select className="h-10">
              <Select.Option value="admin">System Administrator</Select.Option>
              <Select.Option value="editor">Content Editor</Select.Option>
            </Select>
          </Form.Item>

          {editingUser && (
            <Form.Item
              label={<span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Active</span>}
              name="is_active"
              valuePropName="checked"
            >
              <Switch size="small" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export function HydrateFallback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
        </div>
      </div>
      <div className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" />
    </div>
  );
}

export default Users;
