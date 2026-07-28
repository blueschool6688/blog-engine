import React, { useState } from 'react';
import { useLoaderData, useSearchParams, useRevalidator, useNavigation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { auditService } from '../services/api';
import type { AuditLog as AuditLogType } from '../services/api';

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const entityTypeFilter = url.searchParams.get('entity_type') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 15;
  const offset = (page - 1) * limit;

  try {
    const res = await auditService.list({
      offset,
      limit,
      entity_type: entityTypeFilter || undefined,
    });
    if (res.success && res.data) {
      return { logs: res.data.items || [], total: res.data.total || 0 };
    }
  } catch (err) {
    console.error('Failed to retrieve system audit logs', err);
  }
  return { logs: [], total: 0 };
}
import {
  FileText,
  Activity,
  User as UserIcon,
  Settings,
  Image as ImageIcon,
  Key,
  Eye,
  RefreshCw,
  X,
  AlertOctagon,
  Loader
} from 'lucide-react';

export const AuditLog: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const { logs, total } = useLoaderData() as any;
  const { revalidate, state } = useRevalidator();
  const navigation = useNavigation();
  const loading = navigation.state === 'loading';
  
  const [searchParams, setSearchParams] = useSearchParams();
  const entityTypeFilter = searchParams.get('entity_type') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 15;

  // Detail Modal state
  const [viewingLog, setViewingLog] = useState<AuditLogType | null>(null);



  // Auth Guard
  if (currentUser?.role !== 'admin') {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-dangerRed/10 border border-dangerRed/25 rounded-full flex items-center justify-center mx-auto text-dangerRed">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-100">Access Denied</h3>
        <p className="text-sm text-gray-500 font-sans leading-relaxed">
          You do not have administrative privileges to view system audit logs. Please contact your system administrator.
        </p>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('post')) return FileText;
    if (act.includes('media')) return ImageIcon;
    if (act.includes('user')) return UserIcon;
    if (act.includes('setting')) return Settings;
    if (act.includes('password') || act.includes('login')) return Key;
    return Activity;
  };

  const getActionBadgeColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.startsWith('create') || act.includes('attach') || act.includes('add')) {
      return 'bg-successGreen/15 border-successGreen/25 text-successGreen';
    }
    if (act.startsWith('update') || act.includes('edit') || act.includes('reorder')) {
      return 'bg-warningYellow/15 border-warningYellow/25 text-warningYellow';
    }
    if (act.startsWith('delete') || act.includes('detach') || act.includes('remove') || act.includes('reject')) {
      return 'bg-dangerRed/15 border-dangerRed/25 text-dangerRed';
    }
    return 'bg-accentBlue/15 border-accentBlue/25 text-accentBlue';
  };

  return (
    <div className="space-y-6">
      {/* Detail JSON Modal */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] animate-scale-up">
            <button
              onClick={() => setViewingLog(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-850 dark:text-white mb-4 pr-10">
              Audit Log Details: <span className="text-xs font-mono font-normal text-gray-500">#{viewingLog.id}</span>
            </h3>

            <div className="flex-1 overflow-auto bg-slate-950/80 border border-slate-850 p-4 rounded-2xl text-xs font-mono text-gray-300">
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-850">
                <div>
                  <span className="text-gray-500 block">Performed By:</span>
                  <span className="text-gray-200">User ID: {viewingLog.user_id || 'System / Public'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">IP Address:</span>
                  <span className="text-gray-200">{viewingLog.ip_address || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Action / Target:</span>
                  <span className="text-gray-200">{viewingLog.action} ({viewingLog.entity_type || 'system'})</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Timestamp:</span>
                  <span className="text-gray-200">{new Date(viewingLog.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block mb-2">Payload / State Changes:</span>
                {viewingLog.changes ? (
                  <pre className="overflow-x-auto p-3 bg-slate-950 border border-slate-900 rounded-xl leading-relaxed whitespace-pre-wrap max-h-[40vh] text-sky-400">
                    {JSON.stringify(viewingLog.changes, null, 2)}
                  </pre>
                ) : (
                  <span className="text-gray-600">No changes logged for this action.</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-2">
              <button
                type="button"
                onClick={() => setViewingLog(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 dark:hover:bg-slate-950 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl text-xs font-semibold transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            System Audit Log
          </h2>
          <p className="text-sm text-gray-500 mt-1">Review historical actions, profile edits, posts adjustments, and configuration changes.</p>
        </div>
      </div>

      {/* Filters and List */}
      <div className="glass-panel border border-slate-800/50 rounded-2xl overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/50 bg-slate-100/30 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  if (e.target.value) next.set('entity_type', e.target.value);
                  else next.delete('entity_type');
                  next.set('page', '1');
                  return next;
                });
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 text-slate-700 dark:text-gray-300 rounded-xl py-2 px-3 outline-none text-xs"
            >
              <option value="">All Categories</option>
              <option value="post">Posts Actions</option>
              <option value="media">Media Actions</option>
              <option value="user">User Accounts</option>
              <option value="setting">System Settings</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => revalidate()}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors"
              title="Refresh log"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="text-xs text-gray-500">Total logs: {total}</div>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="p-12 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-accentBlue mb-4" />
            <p className="text-sm text-gray-500">Loading audit history...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center border-dashed border-slate-800 rounded-2xl">
            <Activity className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-300">No logs found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/50 text-xs font-semibold text-gray-400 uppercase bg-slate-900/10">
                  <th className="p-4 w-[60px] text-center">Icon</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4 text-center">Entity ID</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {logs.map((item) => {
                  const ActionIcon = getActionIcon(item.action);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="p-4 w-[60px] text-center">
                        <div className="w-8 h-8 rounded-lg border border-slate-800/50 bg-slate-900/50 flex items-center justify-center text-gray-400 mx-auto">
                          <ActionIcon className="w-4 h-4" />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex border px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getActionBadgeColor(item.action)}`}>
                          {item.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-400 capitalize">{item.entity_type || '-'}</td>
                      <td className="p-4 text-sm text-gray-400 font-mono text-center">{item.entity_id || '-'}</td>
                      <td className="p-4 text-sm text-gray-500 font-mono">{item.ip_address || '-'}</td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setViewingLog(item)}
                          className="p-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                          title="View detail JSON"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {total > limit && (
          <div className="p-4 border-t border-slate-800/50 bg-slate-900/10 flex justify-between items-center">
            <button
              disabled={page === 1}
              onClick={() => {
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.set('page', String(page - 1));
                  return next;
                });
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500 font-medium">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              disabled={page * limit >= total}
              onClick={() => {
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.set('page', String(page + 1));
                  return next;
                });
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export function HydrateFallback() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
        </div>
      </div>
      <div className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" />
    </div>
  );
}

export default AuditLog;
