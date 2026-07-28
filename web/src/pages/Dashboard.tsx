import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Plus,
  Upload,
  Folder,
  Tag as TagIcon,
  HardDrive,
  Eye,
  Edit2,
  Calendar
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { dashboardService, getFullUrl } from '../services/api';
import type { Post } from '../services/api';
import { Skeleton } from 'antd';

export async function loader() {
  return null;
}

interface DashboardStatsState {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  mediaCount: number;
  categoryCount: number;
  tagCount: number;
  storageUsageMB: number;
  postsByMonth: { month: string; count: number }[];
  viewsByDay: { date: string; count: number }[];
  recentPosts: Post[];
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsState>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    mediaCount: 0,
    categoryCount: 0,
    tagCount: 0,
    storageUsageMB: 0,
    postsByMonth: [],
    viewsByDay: [],
    recentPosts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        if (res.success && res.data) {
          const d = res.data;
          setStats({
            totalPosts: d.total_posts,
            publishedPosts: d.published_posts,
            draftPosts: d.draft_posts,
            mediaCount: d.media_count,
            categoryCount: d.category_count,
            tagCount: d.tag_count,
            storageUsageMB: d.storage_usage_mb,
            postsByMonth: d.posts_by_month,
            viewsByDay: d.views_by_day || [],
            recentPosts: d.recent_posts || [],
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      color: 'from-accentBlue/20 to-accentBlue/5',
      border: 'hover:border-accentBlue/50 hover:shadow-accentBlue/5',
      iconColor: 'text-accentBlue',
    },
    {
      title: 'Published Posts',
      value: stats.publishedPosts,
      icon: CheckCircle,
      color: 'from-successGreen/20 to-successGreen/5',
      border: 'hover:border-successGreen/50 hover:shadow-successGreen/5',
      iconColor: 'text-successGreen',
    },
    {
      title: 'Draft Posts',
      value: stats.draftPosts,
      icon: Clock,
      color: 'from-warningYellow/20 to-warningYellow/5',
      border: 'hover:border-warningYellow/50 hover:shadow-warningYellow/5',
      iconColor: 'text-warningYellow',
    },
    {
      title: 'Categories',
      value: stats.categoryCount,
      icon: Folder,
      color: 'from-amber-500/20 to-amber-500/5',
      border: 'hover:border-amber-500/50 hover:shadow-amber-500/5',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Tags',
      value: stats.tagCount,
      icon: TagIcon,
      color: 'from-rose-500/20 to-rose-500/5',
      border: 'hover:border-rose-500/50 hover:shadow-rose-500/5',
      iconColor: 'text-rose-500',
    },
    {
      title: 'Media Files',
      value: stats.mediaCount,
      icon: ImageIcon,
      color: 'from-accentPurple/20 to-accentPurple/5',
      border: 'hover:border-accentPurple/50 hover:shadow-accentPurple/5',
      iconColor: 'text-accentPurple',
    },
    {
      title: 'Storage Usage',
      value: `${stats.storageUsageMB.toFixed(2)} MB`,
      icon: HardDrive,
      color: 'from-cyan-500/20 to-cyan-500/5',
      border: 'hover:border-cyan-500/50 hover:shadow-cyan-500/5',
      iconColor: 'text-cyan-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-sm text-gray-500 mt-1">Real-time statistics, monthly analytics, and site status overview.</p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card.border}`}
            >
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.title}
                </p>
                {loading ? (
                  <Skeleton active paragraph={false} title={{ width: '4rem' }} className="mt-2" />
                ) : (
                  <h3 className="text-2xl font-bold mt-1 text-slate-850 dark:text-gray-100">{card.value}</h3>
                )}
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center shrink-0 shadow-sm`}
              >
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Page Views Chart (Recharts Area) */}
        <div className="lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 bg-slate-900/30">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-gray-200">Daily Page Views</h3>
            <p className="text-xs text-gray-500 mt-0.5">Tracking website traffic and readership logs over the last 30 days.</p>
          </div>
          <div className="h-[280px] w-full pt-4">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton active paragraph={{ rows: 6 }} title={false} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.viewsByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={9}
                    tickLine={false}
                    tickFormatter={(tick) => {
                      // Shorten date from YYYY-MM-DD to MM-DD
                      if (!tick || tick.length < 10) return tick;
                      return tick.substring(5);
                    }}
                  />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#viewsGlow)"
                  />
                  <defs>
                    <linearGradient id="viewsGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50 flex flex-col justify-between bg-slate-900/30">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-gray-200">Quick Actions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Shortcuts to common operations.</p>
          </div>
          <div className="space-y-4 py-6">
            <Link
              to="/admin/posts/new"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white font-medium py-3 px-5 rounded-xl transition-all shadow-md shadow-accentBlue/10 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Post</span>
            </Link>
            <Link
              to="/admin/media"
              className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 text-slate-750 dark:text-gray-100 font-medium py-3 px-5 rounded-xl transition-all text-sm"
            >
              <Upload className="w-4 h-4 text-accentPurple" />
              <span>Upload Media Files</span>
            </Link>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 text-[10px] text-gray-500">
            Current system version: 1.0.5 &bull; Operational
          </div>
        </div>
      </div>

      {/* Recent Posts List */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 bg-slate-900/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-gray-200">Recent Posts</h3>
            <p className="text-xs text-gray-500 mt-0.5">Quick lookup of the latest created articles.</p>
          </div>
          <Link
            to="/admin/posts"
            className="text-xs font-semibold text-accentBlue hover:text-accentBlue/80 transition-colors"
          >
            View All Posts
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-slate-950/40 border border-slate-800/40 rounded-xl">
                <Skeleton active avatar={{ size: 40, shape: 'square' }} paragraph={{ rows: 1, width: '60%' }} title={{ width: '80%' }} />
              </div>
            ))}
          </div>
        ) : stats.recentPosts.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">No posts created yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            {stats.recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-slate-950/40 border border-slate-800/40 hover:border-slate-800 rounded-xl transition-all gap-4"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  {/* Cover Preview */}
                  {post.cover_media ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-900 flex items-center justify-center">
                      <img
                        src={getFullUrl(post.cover_media.thumbnail_url || post.cover_media.url)}
                        alt=""
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-slate-800 bg-slate-900/50 shrink-0 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-800 dark:text-gray-200 truncate max-w-sm text-sm">
                      {post.title}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.view_count || 0} views
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4">
                  {/* Status Badge */}
                  {post.status === 'published' ? (
                    <span className="inline-flex items-center bg-successGreen/10 border border-successGreen/20 text-successGreen text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-warningYellow/10 border border-warningYellow/20 text-warningYellow text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                      Draft
                    </span>
                  )}
                  {/* Edit Action */}
                  <Link
                    to={`/admin/posts/edit/${post.id}`}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-500 dark:text-gray-400 hover:text-accentBlue transition-colors shrink-0"
                    title="Edit post"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
