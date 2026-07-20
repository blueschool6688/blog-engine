import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { publicService, getFullUrl } from '../services/api';
import type { Post, Category } from '../services/api';
import { CommentSection } from '../components/CommentSection';
import TranslateToggle from '../components/TranslateToggle';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  ChevronRight,
  Home,
  Copy,
  List,
  Image,
  X,
  FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Spin } from 'antd';

export async function loader() {
  return null;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractLang(className: string): string {
  const m = className.match(/language-([a-z0-9+#-]+)/i);
  return m ? m[1].toUpperCase() : 'CODE';
}

function parseToc(html: string): TocItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headings = doc.querySelectorAll('h2, h3');
  const items: TocItem[] = [];
  headings.forEach((el) => {
    const text = el.textContent?.trim() || '';
    const id = text.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F]+/gi, '-').replace(/^-|-$/g, '');
    if (id) items.push({ id, text, level: parseInt(el.tagName[1]) });
  });
  return items;
}

function processHtml(html: string, language: 'vi' | 'en'): string {
  if (typeof document === 'undefined') return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('h2, h3, h4').forEach((el) => {
    const text = el.textContent?.trim() || '';
    const id = text.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F]+/gi, '-').replace(/^-|-$/g, '');
    el.id = id;
  });

  doc.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    const lang = extractLang(code?.className || '');

    const wrapper = doc.createElement('div');
    wrapper.className = 'post-code-wrapper';

    const copyLabel = language === 'vi' ? 'Sao chép' : 'Copy';
    const copyTitle = language === 'vi' ? 'Sao chép code' : 'Copy code';

    const header = doc.createElement('div');
    header.className = 'post-code-header';
    header.innerHTML = `<span class="post-code-lang">${lang}</span><button class="post-copy-btn" data-copy="true" title="${copyTitle}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> <span class="copy-label">${copyLabel}</span></button>`;

    pre.classList.add('post-code-block');
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });

  doc.querySelectorAll('code:not(pre code)').forEach((code) => {
    code.classList.add('post-inline-code');
  });

  doc.querySelectorAll('blockquote').forEach((bq) => {
    bq.classList.add('post-blockquote');
  });

  doc.querySelectorAll('img').forEach((img) => {
    img.classList.add('post-image', 'cursor-zoom-in');
    img.setAttribute('loading', 'lazy');

    const rawSrc = img.getAttribute('src') || '';
    const absoluteSrc = getFullUrl(rawSrc);
    img.setAttribute('src', absoluteSrc);
  });

  doc.querySelectorAll('table').forEach((table) => {
    table.classList.add('post-table');
    const wrap = doc.createElement('div');
    wrap.className = 'post-table-wrapper';
    table.parentNode?.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  return doc.body.innerHTML;
}


const buildCategoryBreadcrumbs = (cat: Category | null): Category[] => {
  const crumbs: Category[] = [];
  let current = cat;
  while (current) {
    crumbs.unshift(current);
    current = current.parent || null;
  }
  return crumbs;
};

function formatRelative(dateStr: string, t: any): string {
  try {
    const date = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diffDays < 1) return t('today');
    if (diffDays < 7) return `${diffDays} ${t('days_ago')}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t('weeks_ago')}`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${t('months_ago')}`;
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

function estimateReadTime(html: string): number {
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const BlogPostDetail: React.FC = () => {
  const { t, language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [processedHtml, setProcessedHtml] = useState('');
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${targetId}`);
      setActiveId(targetId);
    }
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    publicService.getPostBySlug(slug)
      .then((res) => {
        const p = res.data;
        setPost(p);
        const rawHtml = p.content || '';
        setProcessedHtml(processHtml(rawHtml, language));
        setToc(parseToc(rawHtml));
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [slug, navigate, language]);

  useEffect(() => {
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.classList.contains('post-image')) {
        e.preventDefault();
        setLightboxImg(target.getAttribute('src') || null);
      }
    };
    const container = document.querySelector('.post-content');
    container?.addEventListener('click', handleImageClick);
    return () => container?.removeEventListener('click', handleImageClick);
  }, [processedHtml]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImg(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopyClick = useCallback((e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest('[data-copy="true"]') as HTMLButtonElement | null;
    if (!btn) return;
    const pre = btn.closest('.post-code-wrapper')?.querySelector('pre');
    if (!pre) return;
    const text = pre.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      const label = btn.querySelector('.copy-label');
      const copiedText = language === 'vi' ? 'Đã sao chép!' : 'Copied!';
      const copyText = language === 'vi' ? 'Sao chép' : 'Copy';
      if (label) label.textContent = copiedText;
      btn.classList.add('copied');
      setTimeout(() => {
        if (label) label.textContent = copyText;
        btn.classList.remove('copied');
      }, 2200);
    });
  }, [language]);

  useEffect(() => {
    if (toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-15% 0% -70% 0%', threshold: 0 }
    );
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc, processedHtml]);

  useEffect(() => {
    document.addEventListener('click', handleCopyClick);
    return () => document.removeEventListener('click', handleCopyClick);
  }, [handleCopyClick]);

  if (loading || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 animate-pulse">
        <Spin size="large" />
      </div>
    );
  }

  const readTime = estimateReadTime(post.content || '');
  const primaryCategory = post.categories?.[0];

  return (
    <>
      <style>{`
        /* ── Headings ── */
        .post-content h2 {
          font-size: 1.45rem; font-weight: 800;
          color: #0f172a; margin: 2.5rem 0 1rem;
          padding-bottom: 0.55rem;
          border-bottom: 1.5px solid #e2e8f0;
          line-height: 1.3; scroll-margin-top: 5rem;
        }
        .dark .post-content h2 { color: #f1f5f9; border-bottom-color: #1e293b; }
        .post-content h3 {
          font-size: 1.15rem; font-weight: 700;
          color: #1e293b; margin: 2rem 0 0.75rem;
          line-height: 1.4; scroll-margin-top: 5rem;
        }
        .dark .post-content h3 { color: #e2e8f0; }
        .post-content h4 {
          font-size: 1rem; font-weight: 700;
          color: #334155; margin: 1.5rem 0 0.5rem;
          scroll-margin-top: 5rem;
        }
        .dark .post-content h4 { color: #cbd5e1; }

        /* ── Paragraphs ── */
        .post-content p {
          font-size: 1rem; line-height: 1.9;
          color: #374151; margin-bottom: 1.3rem;
        }
        .dark .post-content p { color: #9ca3af; }

        /* ── Lists ── */
        .post-content ul, .post-content ol {
          padding-left: 1.6rem; margin-bottom: 1.3rem;
        }
        .post-content ul { list-style-type: disc; }
        .post-content ol { list-style-type: decimal; }
        .post-content li {
          font-size: 0.95rem; line-height: 1.85;
          color: #374151; margin-bottom: 0.4rem;
        }
        .dark .post-content li { color: #9ca3af; }

        /* ── Links ── */
        .post-content a {
          color: #2563eb; text-decoration: underline;
          text-underline-offset: 3px; transition: color 0.15s;
        }
        .post-content a:hover { color: #1d4ed8; }
        .dark .post-content a { color: #60a5fa; }
        .dark .post-content a:hover { color: #93c5fd; }

        /* ── Blockquote ── */
        .post-blockquote {
          border-left: 4px solid #2563eb;
          background: #eff6ff;
          border-radius: 0 0.875rem 0.875rem 0;
          padding: 1.1rem 1.4rem;
          margin: 1.75rem 0;
          font-style: italic;
          color: #1e3a8a;
        }
        .dark .post-blockquote {
          background: rgba(30,41,59,0.5);
          border-left-color: #3b82f6;
          color: #93c5fd;
        }
        .post-blockquote p { color: inherit !important; margin-bottom: 0 !important; }

        /* ── Code Wrapper ── */
        .post-code-wrapper {
          margin: 1.75rem 0;
          border-radius: 0.875rem;
          overflow: hidden;
          border: 1px solid #1e293b;
          box-shadow: 0 4px 24px rgba(0,0,0,0.22);
        }
        .post-code-header {
          display: flex; align-items: center;
          justify-content: space-between;
          background: #161b27;
          padding: 0.55rem 1rem;
          border-bottom: 1px solid #1e293b;
        }
        .post-code-lang {
          font-size: 0.62rem; font-weight: 700;
          font-family: monospace; letter-spacing: 0.12em;
          text-transform: uppercase; color: #64748b;
          background: #0f172a; padding: 0.18rem 0.55rem;
          border-radius: 0.3rem; border: 1px solid #1e293b;
        }
        .post-copy-btn {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.68rem; font-weight: 600;
          color: #64748b; background: transparent;
          border: 1px solid transparent; border-radius: 0.4rem;
          padding: 0.28rem 0.6rem; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
        }
        .post-copy-btn:hover {
          color: #e2e8f0; background: #1e293b; border-color: #334155;
        }
        .post-copy-btn.copied { color: #22c55e; }
        .post-code-block {
          background: #0d1117 !important;
          padding: 1.25rem 1.5rem !important;
          overflow-x: auto; margin: 0 !important;
          border-radius: 0 !important; border: none !important;
          font-size: 0.82rem !important; line-height: 1.8 !important;
          font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace !important;
          color: #e2e8f0 !important;
        }
        .post-code-block code {
          background: transparent !important; color: inherit !important;
          padding: 0 !important; border-radius: 0 !important;
          font-size: inherit !important;
        }

        /* ── Inline Code ── */
        .post-inline-code {
          background: #fef2f2; color: #dc2626;
          padding: 0.15rem 0.45rem; border-radius: 0.35rem;
          font-size: 0.83em;
          font-family: 'JetBrains Mono', Consolas, monospace;
          font-weight: 600; border: 1px solid #fecaca;
        }
        .dark .post-inline-code {
          background: rgba(127,29,29,0.2); color: #f87171; border-color: #7f1d1d;
        }

        /* ── Images ── */
        .post-image {
          max-width: 100%; height: auto;
          border-radius: 0.875rem; margin: 1.5rem auto; display: block;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          transition: transform 0.3s, box-shadow 0.3s; cursor: zoom-in;
        }
        .post-image:hover {
          transform: scale(1.01); box-shadow: 0 8px 40px rgba(0,0,0,0.2);
        }
        .dark .post-image { box-shadow: 0 4px 24px rgba(0,0,0,0.5); }

        /* ── Tables ── */
        .post-table-wrapper {
          overflow-x: auto; margin: 1.5rem 0;
          border-radius: 0.75rem; border: 1px solid #e2e8f0;
        }
        .dark .post-table-wrapper { border-color: #1e293b; }
        .post-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .post-table th {
          background: #f8fafc; color: #374151; font-weight: 700;
          text-align: left; padding: 0.75rem 1rem;
          border-bottom: 2px solid #e2e8f0;
        }
        .dark .post-table th { background: #0f172a; color: #e2e8f0; border-bottom-color: #1e293b; }
        .post-table td { padding: 0.65rem 1rem; color: #4b5563; border-bottom: 1px solid #f1f5f9; }
        .dark .post-table td { color: #94a3b8; border-bottom-color: #1e293b; }
        .post-table tr:last-child td { border-bottom: none; }

        /* ── Typography misc ── */
        .post-content strong { color: #111827; font-weight: 700; }
        .dark .post-content strong { color: #f1f5f9; }
        .post-content em { font-style: italic; }
        .post-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 2.25rem 0; }
        .dark .post-content hr { border-top-color: #1e293b; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-500 mb-6 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1 hover:text-accentBlue transition-colors font-medium">
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
          {primaryCategory && buildCategoryBreadcrumbs(primaryCategory).map((crumb) => (
            <React.Fragment key={crumb.id}>
              <Link to={`/?category=${crumb.slug}`} className="hover:text-accentBlue transition-colors font-medium">
                {crumb.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-355" />
            </React.Fragment>
          ))}
          <span className="text-slate-700 dark:text-gray-300 font-medium truncate max-w-[180px] md:max-w-sm">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          <article className="flex-1 min-w-0">
            {/* Category badge */}
            {primaryCategory && (
              <div className="mb-4">
                <Link
                  to={`/?category=${primaryCategory.slug}`}
                  className="inline-flex items-center gap-1.5 bg-accentBlue/10 text-accentBlue text-[11px] font-bold px-3 py-1.5 rounded-full border border-accentBlue/20 hover:bg-accentBlue/15 transition-colors"
                >
                  <Tag className="w-3 h-3" />
                  {primaryCategory.name}
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-[2rem] lg:text-[2.25rem] font-extrabold text-slate-900 dark:text-white leading-tight mb-5 tracking-tight">
              {post.title}
            </h1>

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-gray-500 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800/80">
              {post.author && (
                <div className="flex items-center gap-2">
                  {post.author.avatar_url ? (
                    <img
                      src={getFullUrl(post.author.avatar_url)}
                      alt={post.author.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accentBlue to-accentPurple flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                      {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <span className="font-semibold text-slate-700 dark:text-gray-300">{post.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatRelative(post.published_at || post.created_at, t)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime} phút đọc</span>
              </div>
            </div>

            {/* PDF viewer for Document Post */}
            {post.is_document && post.pdf_media && (
              <div className="rounded-2xl overflow-hidden mb-8 shadow-lg border border-red-500/25 bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-500">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-bold">{post.pdf_media.file_name}</span>
                  </div>
                  <a
                    href={getFullUrl(post.pdf_media.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Tải PDF
                  </a>
                </div>
                <iframe
                  src={getFullUrl(post.pdf_media.url)}
                  title="Document PDF viewer"
                  className="w-full h-[600px] border border-slate-800 rounded-xl bg-slate-950"
                />
              </div>
            )}

            {/* Cover image (render if not document or doc doesn't cover pdf) */}
            {!post.is_document && post.cover_media?.url && (
              <div className="rounded-2xl overflow-hidden mb-8 shadow-lg border border-slate-200/60 dark:border-slate-800/60">
                <img
                  src={getFullUrl(post.cover_media.url)}
                  alt={post.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
            )}
            {toc.length > 0 && (
              <div className="lg:hidden mb-6 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setTocOpen(!tocOpen)}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 dark:bg-slate-900/60 text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <List className="w-4 h-4 text-accentBlue" />
                    Mục lục bài viết ({toc.length} mục)
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${tocOpen ? 'rotate-90' : ''}`} />
                </button>
                {tocOpen && (
                  <nav className="bg-white dark:bg-slate-900/40 px-4 py-3 space-y-0.5 border-t border-slate-200 dark:border-slate-800/80">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          setTocOpen(false);
                          handleTocClick(e, item.id);
                        }}
                        className={`block text-xs py-1.5 text-slate-600 dark:text-gray-400 hover:text-accentBlue transition-colors ${item.level === 3 ? 'pl-5' : 'pl-2'}`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                )}
              </div>
            )}

            {/* Nội dung bài viết — có nút dịch AI sang ngôn ngữ còn lại */}
            <TranslateToggle
              content={processedHtml}
              className="post-content-wrapper"
            />

            {post.gallery && post.gallery.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Image className="w-4.5 h-4.5 text-accentBlue" />
                  <span>Hình ảnh ({post.gallery.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {post.gallery.map((item) => (
                    <div key={item.id} className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900/10">
                      <a href={getFullUrl(item.media.url)} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] overflow-hidden">
                        <img
                          src={getFullUrl(item.media.thumbnail_url || item.media.url)}
                          alt={item.alt_text || item.caption || post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-350"
                          loading="lazy"
                        />
                      </a>
                      {item.caption && (
                        <div className="p-2.5 text-center text-xs text-slate-500 dark:text-gray-400 bg-white/90 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800/50 line-clamp-2">
                          {item.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/80">
                <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 shrink-0" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/?tag=${tag.slug}`}
                    className="px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-gray-400 hover:bg-accentBlue/10 hover:text-accentBlue border border-slate-200 dark:border-slate-800/80 hover:border-accentBlue/20 rounded-full transition-all"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {post.author && (
              <div onClick={() => navigate(`/authors/${post.author?.nickname}`)} className="mt-8 p-6 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-start gap-4 cursor-pointer hover:scale-[1.01] transition-all">
                {post.author.avatar_url ? (
                  <img
                    src={getFullUrl(post.author.avatar_url)}
                    alt={post.author.name}
                    className="w-14 h-14 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-accentBlue to-accentPurple flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
                    {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-accentBlue" />
                    {post.author.name}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-500 leading-relaxed">
                    {post.author.bio || 'Tác giả tại DevOps.vn — Chia sẻ kiến thức Cloud Native, Kubernetes và văn hóa DevOps.'}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-accentBlue dark:text-gray-500 dark:hover:text-accentBlue transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t('back')}
              </button>
            </div>

            <CommentSection postId={post.id} />
          </article>

          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-[76px] self-start">
            <div className="space-y-5">
              {toc.length > 0 && (
                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-4 flex items-center gap-2">
                    <List className="w-3.5 h-3.5" />
                    {t('table_of_contents')}
                  </h3>
                  <nav className="space-y-0.5" aria-label="Table of contents">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => handleTocClick(e, item.id)}
                        className={`flex items-center gap-1.5 text-[12.5px] leading-snug py-1.5 rounded-lg px-2.5 transition-all duration-200 group ${item.level === 3 ? 'pl-6 text-[11.5px]' : ''
                          } ${activeId === item.id
                            ? 'text-accentBlue font-semibold bg-accentBlue/8 dark:bg-accentBlue/12'
                            : 'text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                      >
                        {activeId === item.id && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accentBlue shrink-0" />
                        )}
                        <span className="line-clamp-2">{item.text}</span>
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Share */}
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-500">
                  {language === 'vi' ? 'Chia sẻ bài viết' : 'Share Article'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-900/40 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800/80 transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    {language === 'vi' ? 'Sao chép link' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Back link */}
              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-4 py-3 w-full bg-slate-100 dark:bg-slate-900/40 hover:bg-slate-200 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-sm font-semibold text-slate-600 dark:text-gray-400 transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {language === 'vi' ? 'Xem tất cả bài viết' : 'View all articles'}
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-900/80 hover:bg-slate-850 text-gray-300 hover:text-white border border-slate-800 transition-all z-[110]"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxImg}
            alt="Lightbox review"
            className="max-w-[92%] max-h-[92%] object-contain rounded-xl shadow-2xl border border-slate-800/40 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default BlogPostDetail;
