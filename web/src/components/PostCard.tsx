import React from 'react';
import { Link } from 'react-router';
import { Card, Skeleton, Badge, Tag as AntTag, Space, Typography } from 'antd';
import { Calendar, Clock, FileText, ArrowRight } from 'lucide-react';
import type { Post } from '../services/api';
import { getFullUrl } from '../services/api';

const { Paragraph, Title } = Typography;

interface PostCardProps {
  post: Post;
  language: 'vi' | 'en';
  t: (key: string) => string;
  formatRelative: (dateStr: string, t: any) => string;
  estimateReadTime: (html: string) => number;
  toggleFilter: (type: 'category' | 'tag', value: string) => void;
}

export const PostCardSkeleton: React.FC = () => {
  return (
    <Card
      hoverable={false}
      className="h-full border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white/70 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm"
      styles={{ body: { padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' } }}
      cover={
        <div className="aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center p-4">
          <Skeleton.Button active block style={{ height: '100%', borderRadius: '12px' }} />
        </div>
      }
    >
      <div className="space-y-4 flex-1">
        <Space size={6}>
          <Skeleton.Button active size="small" style={{ width: 80, borderRadius: 12 }} />
          <Skeleton.Button active size="small" style={{ width: 60, borderRadius: 6 }} />
        </Space>
        <Skeleton active title={{ width: '90%' }} paragraph={{ rows: 2, width: ['100%', '70%'] }} />
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 mt-4 flex justify-between items-center">
        <Skeleton.Input active size="small" style={{ width: 120 }} />
        <Skeleton.Input active size="small" style={{ width: 70 }} />
      </div>
    </Card>
  );
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  language,
  t,
  formatRelative,
  estimateReadTime,
  toggleFilter,
}) => {
  const coverUrl = post.cover_media?.thumbnail_url
    ? getFullUrl(post.cover_media.thumbnail_url)
    : post.cover_media?.url
    ? getFullUrl(post.cover_media.url)
    : '';
  const readTime = estimateReadTime(post.content || post.excerpt || '');
  const primaryCategory = post.categories?.[0];
  const isPDF = !!post.is_document;
  const titleText = language === 'en' ? (post.title_en || post.title) : post.title;
  const excerptText = language === 'en' ? (post.excerpt_en || post.excerpt) : post.excerpt;

  const renderCover = () => {
    if (coverUrl) {
      return (
        <Link to={`/posts/${post.slug}`} className="block aspect-[16/10] overflow-hidden relative group/img">
          <img
            src={coverUrl}
            alt={titleText}
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-xs font-bold flex items-center gap-1">
              {t('read_more') || 'Read Article'} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      );
    }

    if (isPDF) {
      return (
        <Link
          to={`/posts/${post.slug}`}
          className="flex items-center justify-center aspect-[16/10] overflow-hidden bg-gradient-to-br from-red-950/40 via-slate-900/60 to-slate-950 border-b border-red-500/20 group/pdf"
        >
          <div className="flex flex-col items-center gap-2 text-red-400/80 group-hover/pdf:scale-105 transition-transform">
            <FileText className="w-12 h-12 stroke-[1.5]" />
            <span className="text-xs font-extrabold uppercase tracking-wider">PDF Document</span>
          </div>
        </Link>
      );
    }

    return null;
  };

  const cardInner = (
    <Card
      hoverable
      className="group h-full border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/40 hover:border-accentBlue/40 dark:hover:border-accentBlue/30 hover:shadow-xl hover:shadow-accentBlue/10 transition-all duration-300 flex flex-col justify-between"
      styles={{
        body: { padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 },
      }}
      cover={renderCover()}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {primaryCategory && (
            <AntTag
              color="processing"
              className="m-0 border-accentBlue/20 bg-accentBlue/10 text-accentBlue font-bold text-[10px] uppercase tracking-wider rounded-full px-2.5 py-0.5 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                toggleFilter('category', primaryCategory.slug);
              }}
            >
              {primaryCategory.name}
            </AntTag>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <AntTag
                  key={tag.id}
                  className="m-0 border-0 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-gray-400 font-medium text-[10px] rounded px-2 py-0.5 cursor-pointer hover:text-accentBlue transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFilter('tag', tag.slug);
                  }}
                >
                  #{tag.name}
                </AntTag>
              ))}
              {post.tags.length > 2 && (
                <AntTag className="m-0 border-0 bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-gray-500 font-bold text-[10px] rounded px-1.5 py-0.5">
                  +{post.tags.length - 2}
                </AntTag>
              )}
            </div>
          )}
        </div>

        <Link to={`/posts/${post.slug}`} className="block group-hover:text-accentBlue transition-colors">
          <Title
            level={5}
            className="!m-0 !font-extrabold !text-slate-900 dark:!text-white group-hover:!text-accentBlue transition-colors !leading-snug line-clamp-2"
          >
            {titleText}
          </Title>
        </Link>

        {excerptText && (
          <Paragraph
            ellipsis={{ rows: 2 }}
            className="!m-0 !text-xs !text-slate-500 dark:!text-gray-400 !leading-relaxed"
          >
            {excerptText}
          </Paragraph>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-gray-500 pt-4 border-t border-slate-100 dark:border-slate-800/40 mt-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatRelative(post.published_at || post.created_at, t)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {readTime} {t('read_time_mins')}
        </span>
      </div>
    </Card>
  );

  if (isPDF) {
    return (
      <Badge.Ribbon
        text={
          <span className="flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase">
            <FileText className="w-3 h-3" />
            PDF
          </span>
        }
        color="red"
        placement="end"
      >
        {cardInner}
      </Badge.Ribbon>
    );
  }

  return cardInner;
};

export default PostCard;
