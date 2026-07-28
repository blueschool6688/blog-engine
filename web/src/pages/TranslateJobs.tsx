import React, { useEffect } from 'react';
import { useLoaderData, useSearchParams, useRevalidator, useNavigation } from 'react-router';
import { Table, Button, Card, Tag, Space, Modal, Tooltip, message } from 'antd';
import { Languages, RefreshCw, Trash2, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { translateService } from '../services/api';
import type { TranslateJob } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import dayjs from 'dayjs';

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const res = await translateService.listJobs({ offset, limit });
    if (res.success && res.data) {
      const items = res.data.items || [];
      const total = res.data.total || 0;
      const pendingCount = items.filter((j: any) => j.status === 'pending').length;
      const processingCount = items.filter((j: any) => j.status === 'processing').length;
      const doneCount = items.filter((j: any) => j.status === 'done').length;
      const failedCount = items.filter((j: any) => j.status === 'failed').length;

      return {
        jobs: items,
        total,
        metrics: {
          pending: pendingCount,
          processing: processingCount,
          done: doneCount,
          failed: failedCount,
        }
      };
    }
  } catch (err) {
    console.error('Failed to load translate jobs', err);
  }
  return {
    jobs: [],
    total: 0,
    metrics: { pending: 0, processing: 0, done: 0, failed: 0 }
  };
}
export const TranslateJobs: React.FC = () => {
  const { language } = useLanguage();
  const { jobs, total, metrics } = useLoaderData() as any;
  const { revalidate } = useRevalidator();
  const navigation = useNavigation();
  const loading = navigation.state === 'loading';
  
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;

  useEffect(() => {
    // Auto-refresh every 5 seconds to show progress
    const interval = setInterval(() => {
      revalidate();
    }, 5000);
    return () => clearInterval(interval);
  }, [revalidate]);

  const handleRetry = async (jobId: string) => {
    try {
      const res = await translateService.retryJob(jobId);
      if (res.success) {
        message.success(language === 'vi' ? 'Đã kích hoạt thử lại thành công!' : 'Job retry triggered successfully!');
        revalidate();
      }
    } catch (err: any) {
      console.error(err);
      message.error(language === 'vi' ? 'Không thể thử lại job này.' : 'Failed to retry job.');
    }
  };

  const handleDelete = (jobId: string) => {
    Modal.confirm({
      title: language === 'vi' ? 'Xóa tiến trình dịch' : 'Delete Translate Job',
      content: language === 'vi' 
        ? 'Bạn có chắc chắn muốn xóa tiến trình dịch này khỏi cơ sở dữ liệu?' 
        : 'Are you sure you want to delete this translation job from the database?',
      okText: language === 'vi' ? 'Xóa' : 'Delete',
      okType: 'danger',
      cancelText: language === 'vi' ? 'Hủy' : 'Cancel',
      onOk: async () => {
        try {
          const res = await translateService.deleteJob(jobId);
          if (res.success) {
            message.success(language === 'vi' ? 'Đã xóa tiến trình thành công!' : 'Job deleted successfully!');
            revalidate();
          }
        } catch (err: any) {
          console.error(err);
          message.error(language === 'vi' ? 'Không thể xóa job này.' : 'Failed to delete job.');
        }
      }
    });
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Tag color="default" className="flex items-center gap-1 w-max font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING</span>
          </Tag>
        );
      case 'processing':
        return (
          <Tag color="processing" className="flex items-center gap-1 w-max font-bold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>PROCESSING</span>
          </Tag>
        );
      case 'done':
        return (
          <Tag color="success" className="flex items-center gap-1 w-max font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>DONE</span>
          </Tag>
        );
      case 'failed':
        return (
          <Tag color="error" className="flex items-center gap-1 w-max font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>FAILED</span>
          </Tag>
        );
      default:
        return <Tag color="default">{status.toUpperCase()}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Job ID',
      dataIndex: 'job_id',
      key: 'job_id',
      className: 'font-mono text-xs text-gray-500',
      width: 160,
      render: (id: string) => (
        <Tooltip title={id}>
          <span>{id.substring(0, 8)}...{id.substring(id.length - 8)}</span>
        </Tooltip>
      ),
    },
    {
      title: language === 'vi' ? 'Nội dung (Trích đoạn)' : 'Content Snippet',
      dataIndex: 'content',
      key: 'content',
      className: 'text-xs text-slate-700 dark:text-slate-300',
      render: (text: string) => {
        const plainText = text.replace(/<[^>]*>/g, '');
        return plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;
      },
    },
    {
      title: language === 'vi' ? 'Dịch từ/sang' : 'Direction',
      key: 'direction',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: TranslateJob) => (
        <Tag color="purple" className="font-bold">
          {(record.source_lang || 'VI').toUpperCase()} → {record.target_lang.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: language === 'vi' ? 'Trạng thái' : 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: language === 'vi' ? 'Ngày khởi tạo' : 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      className: 'text-xs text-gray-500',
      render: (dateStr: string) => dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: language === 'vi' ? 'Thao tác' : 'Actions',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: TranslateJob) => (
        <Space size="middle">
          {record.status !== 'done' && (
            <Tooltip title={language === 'vi' ? 'Chạy lại job' : 'Retry Job'}>
              <Button
                type="text"
                icon={<Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                onClick={() => handleRetry(record.job_id)}
                className="hover:bg-emerald-500/10 rounded-lg"
              />
            </Tooltip>
          )}
          <Tooltip title={language === 'vi' ? 'Xóa job' : 'Delete Job'}>
            <Button
              type="text"
              danger
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => handleDelete(record.job_id)}
              className="hover:bg-red-500/10 rounded-lg"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase">{language === 'vi' ? 'Đang chờ' : 'Pending'}</span>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-black text-slate-850 dark:text-white mt-2">{metrics.pending}</p>
        </Card>

        <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-500 font-bold uppercase">{language === 'vi' ? 'Đang xử lý' : 'Processing'}</span>
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{metrics.processing}</p>
        </Card>

        <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-500 font-bold uppercase">{language === 'vi' ? 'Hoàn thành' : 'Completed'}</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{metrics.done}</p>
        </Card>

        <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-500 font-bold uppercase">{language === 'vi' ? 'Lỗi' : 'Failed'}</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{metrics.failed}</p>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-accentBlue" />
            <h2 className="text-base font-extrabold text-slate-850 dark:text-white">
              {language === 'vi' ? 'Danh sách tiến trình dịch AI' : 'AI Translation Job Queue'}
            </h2>
          </div>
          <Button
            type="primary"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => revalidate()}
            loading={loading}
            className="bg-btn-global border-0 rounded-xl"
          >
            {language === 'vi' ? 'Làm mới' : 'Refresh'}
          </Button>
        </div>

        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            onChange: (p) => {
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.set('page', String(p));
                return next;
              });
            },
            showSizeChanger: false,
          }}
          className="premium-table"
        />
      </Card>
    </div>
  );
};

export function HydrateFallback() {
  return (
    <div className="space-y-6 select-none">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[90px] animate-pulse bg-slate-200 dark:bg-slate-800/50" />
        ))}
      </div>
      <div className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" />
    </div>
  );
}

export default TranslateJobs;
