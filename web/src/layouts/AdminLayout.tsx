import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router';
import { LayoutDashboard, Image, FileText, Folder, Tag, Heart, LogOut, Settings, Users, ActivitySquare, MessageSquare, Sun, Moon, Languages, Bot } from 'lucide-react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getFullUrl } from '../services/api';
import { Layout, Menu, Button, Dropdown, Avatar, Typography } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const auth = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const isAdmin = auth.user?.role === 'admin';
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: t('dashboard'), path: '/admin', icon: LayoutDashboard },
    { name: t('posts'), path: '/admin/posts', icon: FileText },
    { name: t('media_library'), path: '/admin/media', icon: Image },
    { name: t('categories'), path: '/admin/categories', icon: Folder },
    { name: t('tags'), path: '/admin/tags', icon: Tag },
    { name: t('comments'), path: '/admin/comments', icon: MessageSquare },
    { name: t('feedbacks'), path: '/admin/feedbacks', icon: Heart },
    { name: t('translate_jobs'), path: '/admin/translate-jobs', icon: Languages },
    { name: t('settings'), path: '/admin/settings', icon: Settings },
    ...(isAdmin ? [
      { name: t('users'), path: '/admin/users', icon: Users },
      { name: t('audit_logs'), path: '/admin/audit-logs', icon: ActivitySquare },
      { name: t('chat_logs'), path: '/admin/chat-logs', icon: Bot },
    ] : []),
  ];

  /** Returns the display initial(s) for the avatar fallback */
  const getInitial = (): string => {
    const name = auth.user?.name;
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  };

  const getPageTitle = () => {
    const segment = location.pathname.replace('/admin/', '').split('/')[0];
    if (location.pathname === '/admin') return t('dashboard');
    if (segment === 'posts') return t('posts');
    if (segment === 'media') return t('media_library');
    if (segment === 'categories') return t('categories');
    if (segment === 'tags') return t('tags');
    if (segment === 'comments') return t('comments');
    if (segment === 'feedbacks') return t('feedbacks');
    if (segment === 'settings') return t('settings');
    if (segment === 'users') return t('users');
    if (segment === 'audit-logs') return t('audit_logs');
    if (segment === 'translate-jobs') return t('translate_jobs');
    if (segment === 'chat-logs') return t('chat_logs');
    return segment;
  };

  const items = menuItems.map((item) => {
    const Icon = item.icon;
    return {
      key: item.path,
      icon: <Icon className="w-4 h-4" />,
      label: <Link to={item.path}>{item.name}</Link>,
    };
  });

  const getSelectedKeys = () => {
    const sortedItems = [...menuItems].sort((a, b) => b.path.length - a.path.length);
    for (const item of sortedItems) {
      if (item.path === '/admin') {
        if (location.pathname === '/admin') return ['/admin'];
      } else if (location.pathname.startsWith(item.path)) {
        return [item.path];
      }
    }
    return ['/admin'];
  };

  const profileDropdownItems = [
    {
      key: 'info',
      label: (
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 select-none">
          <p className="text-xs font-semibold text-slate-700 dark:text-gray-250 leading-tight">
            {auth.user?.name ?? 'Admin User'}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-gray-500 capitalize mt-0.5">
            {auth.user?.role ?? 'System Administrator'}
          </p>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'sign-out',
      danger: true,
      icon: <LogOut className="w-3.5 h-3.5" />,
      label: t('sign_out'),
      onClick: auth.logout,
    }
  ];

  return (
    <Layout className="min-h-screen font-sans">
      {/* Sidebar Sider */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme={theme}
        className="border-r border-slate-200 dark:border-slate-800/50 shadow-sm transition-all duration-200"
        width={250}
        trigger={null}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/50 overflow-hidden shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accentBlue to-accentPurple flex items-center justify-center shadow-lg shadow-accentBlue/20 shrink-0">
              <span className="font-bold text-white text-base">B</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-gray-250 dark:to-gray-400 bg-clip-text text-transparent transition-opacity duration-200">
                CMS Admin
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <Menu
          mode="inline"
          theme={theme}
          selectedKeys={getSelectedKeys()}
          items={items}
          className="border-none py-4 px-2"
          style={{ height: 'calc(100vh - 64px)', overflowY: 'auto' }}
        />
      </Sider>

      <Layout className="flex flex-col min-w-0">
        {/* Header */}
        <Header
          className="h-16 flex items-center justify-between px-6 z-10"
          style={{
            background: theme === 'dark' ? 'var(--custom-dark-bg, #090D16)' : 'var(--custom-light-bg, #fff)',
            borderBottom: `1px solid ${theme === 'dark' ? '#1f2937' : '#e5e7eb'}`,
            padding: '0 24px',
          }}
        >
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined className="w-4 h-4" /> : <MenuFoldOutlined className="w-4 h-4" />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white"
            />
            <Title
              level={5}
              className="!m-0 !font-semibold text-slate-850 dark:text-gray-100 capitalize"
            >
              {getPageTitle()}
            </Title>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-gray-300 transition-all select-none rounded-xl"
              title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
              {language === 'vi' ? 'EN' : 'VI'}
            </Button>

            <Button
              type="text"
              icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              onClick={toggleTheme}
              className="text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white flex items-center justify-center p-2 rounded-xl"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            />

            <div className="w-px h-6 bg-slate-250 dark:bg-slate-700/60" />

            <Dropdown
              menu={{ items: profileDropdownItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity py-1.5 px-2 rounded-lg">
                <Avatar
                  src={auth.user?.avatar_url ? getFullUrl(auth.user.avatar_url) : undefined}
                  className="bg-slate-200 dark:bg-slate-800 text-accentBlue font-bold border border-slate-350 dark:border-slate-700/50"
                >
                  {!auth.user?.avatar_url && getInitial()}
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-700 dark:text-gray-250 leading-tight">
                    {auth.user?.name ?? 'Admin User'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 capitalize">
                    {auth.user?.role ?? 'System Administrator'}
                  </p>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Page Content */}
        <Content
          className="overflow-auto p-6 md:p-8"
          style={{
            background: theme === 'dark' ? '#020617' : '#f8fafc',
          }}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;