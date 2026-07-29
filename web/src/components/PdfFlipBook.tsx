import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import HTMLFlipBook from 'react-pageflip';
import type { HTMLFlipBookRef } from 'react-pageflip';
import { Button, Tooltip, Spin } from 'antd';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  BookOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ClientOnly } from './ClientOnly';

// ─── Worker ─────────────────────────────────────────────────────────────────
// Must be set inside a useEffect (client-only) to avoid SSR crash.
// Using new URL(...) so Vite can resolve the asset path at build time.

// ─── Constants ──────────────────────────────────────────────────────────────
/**
 * Number of pages to render (as real <Page> canvases) on each side of the
 * current page. Pages outside this window are shown as skeleton placeholders
 * so react-pageflip always has the correct total DOM children count.
 *
 * Total max real canvases at any time = RENDER_BUFFER * 2 + 1
 */
const RENDER_BUFFER = 2;

// ─── Responsive helpers ──────────────────────────────────────────────────────
function getPageWidth(vw: number): number {
  if (vw < 480) return Math.floor(vw * 0.9);      // Mobile: near full width
  if (vw < 768) return Math.floor(vw * 0.85);     // Large mobile
  if (vw < 1024) return Math.floor(vw * 0.42);    // Tablet: 2-up, each ~42%
  if (vw < 1440) return Math.floor(vw * 0.38);    // Desktop
  return Math.floor(Math.min(vw * 0.34, 620));    // Large desktop, max 620px
}

// ─── Inner component (client-only safe) ─────────────────────────────────────
interface PdfFlipBookInnerProps {
  fileUrl: string;
}

const PdfFlipBookInner: React.FC<PdfFlipBookInnerProps> = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0); // 0-indexed
  const [pageWidth, setPageWidth] = useState<number>(480);
  const [pageHeight, setPageHeight] = useState<number>(640);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const flipBookRef = useRef<HTMLFlipBookRef>(null);

  // ── Set pdfjs worker (client-only) ──────────────────────────────────────
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  // ── Measure container and derive page dimensions ─────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = (entries?: ResizeObserverEntry[]) => {
      let cw = window.innerWidth;
      if (expanded) {
        cw = window.innerWidth - 32; // minus fixed padding
      } else if (containerRef.current) {
        cw = containerRef.current.clientWidth;
      }
      
      // If the container is very small (mobile), we still show 2 pages but they will be small
      // HTMLFlipBook always shows 2 pages when usePortrait={false}
      const pw = Math.floor(cw / 2);
      setPageWidth(pw);
      setPageHeight(Math.floor(pw * 1.414));
    };

    const observer = new ResizeObserver(measure);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    // Initial measure
    measure();
    window.addEventListener('resize', () => measure());

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', () => measure());
    };
  }, [expanded]);

  // ── Windowed render decision ─────────────────────────────────────────────
  const shouldRenderPage = useCallback(
    (index: number) => Math.abs(index - currentPage) <= RENDER_BUFFER,
    [currentPage],
  );

  // ── Flipbook event handler ───────────────────────────────────────────────
  const handleFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  // ── Navigation helpers ───────────────────────────────────────────────────
  const flipNext = () => {
    flipBookRef.current?.pageFlip().flipNext();
  };

  const flipPrev = () => {
    flipBookRef.current?.pageFlip().flipPrev();
  };

  // Display page numbers (1-indexed, two pages visible at a time in landscape)
  const displayCurrent = currentPage + 1;
  const displayTotal = numPages ?? '…';

  // ── Loading state ────────────────────────────────────────────────────────
  if (!numPages && !pdfError) {
    // Render Document hidden to trigger onLoadSuccess, show spinner
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-gray-400">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          onLoadError={(err) => setPdfError(err.message)}
          loading={null}
          error={null}
        >
          {/* Hidden first page to warm up loading */}
          <Page pageNumber={1} width={1} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
        <Spin size="large" />
        <span className="text-sm font-medium">Đang tải tài liệu PDF…</span>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (pdfError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-4 p-6 text-center">
        <BookOpen className="w-12 h-12 text-red-400" />
        <p className="text-sm font-semibold text-red-400">Không thể tải file PDF.</p>
        <p className="text-xs text-red-500 max-w-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800 break-words">
          Chi tiết lỗi: {pdfError}
        </p>
        <p className="text-xs text-gray-500 max-w-xs mt-2">
          Bạn vẫn có thể xem tài liệu trực tiếp:
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-accentBlue text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all"
        >
          Mở PDF trong tab mới
        </a>
      </div>
    );
  }

  const pages = Array.from({ length: numPages! }, (_, i) => i);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-4 transition-all duration-300 ${
        expanded ? 'fixed inset-2 z-50 bg-slate-950/98 p-4 rounded-2xl overflow-auto' : ''
      }`}
    >
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2">
          <Tooltip title="Trang trước">
            <Button
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={flipPrev}
              disabled={currentPage === 0}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-gray-300 hover:text-accentBlue hover:border-accentBlue/50 disabled:opacity-30 h-9 w-9 flex items-center justify-center"
            />
          </Tooltip>

          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-semibold text-slate-700 dark:text-gray-300 min-w-[80px] text-center">
            {displayCurrent} / {displayTotal}
          </div>

          <Tooltip title="Trang sau">
            <Button
              icon={<ChevronRight className="w-4 h-4" />}
              onClick={flipNext}
              disabled={numPages !== null && currentPage >= numPages - 1}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-gray-300 hover:text-accentBlue hover:border-accentBlue/50 disabled:opacity-30 h-9 w-9 flex items-center justify-center"
            />
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500 hidden sm:block">
            {RENDER_BUFFER * 2 + 1} trang được render
          </span>

          <Tooltip title={expanded ? 'Thu nhỏ' : 'Toàn màn hình'}>
            <Button
              icon={expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              onClick={() => setExpanded((v) => !v)}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 h-9 w-9 flex items-center justify-center"
            />
          </Tooltip>

          <Tooltip title="Mở trong tab mới">
            <Button
              icon={<ExternalLink className="w-4 h-4" />}
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 h-9 w-9 flex items-center justify-center"
            />
          </Tooltip>

          <Tooltip title="Tải xuống">
            <Button
              type="primary"
              danger
              icon={<Download className="w-4 h-4" />}
              href={fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="rounded-xl h-9 w-9 flex items-center justify-center"
            />
          </Tooltip>
        </div>
      </div>

      {/* ── Flipbook ── */}
      <div className="flex justify-center overflow-hidden">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          onLoadError={(err) => setPdfError(err.message)}
          loading={null}
          error={null}
        >
          <HTMLFlipBook
            ref={flipBookRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            drawShadow
            flippingTime={700}
            usePortrait={false}
            showCover={false}
            mobileScrollSupport
            onFlip={handleFlip}
            className="shadow-2xl"
            style={{}}
          >
            {pages.map((pageIndex) => (
              <div
                key={pageIndex}
                className="bg-white flex items-center justify-center overflow-hidden"
                style={{ width: pageWidth, height: pageHeight }}
              >
                {shouldRenderPage(pageIndex) ? (
                  <Page
                    pageNumber={pageIndex + 1}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div
                        className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded"
                        style={{ width: pageWidth, height: pageHeight }}
                      />
                    }
                  />
                ) : (
                  // Skeleton placeholder — keeps react-pageflip DOM structure intact
                  // but does NOT create a real canvas
                  <div
                    className="animate-pulse bg-slate-100 dark:bg-slate-900 w-full h-full flex items-center justify-center"
                    aria-label={`Page ${pageIndex + 1} placeholder`}
                  >
                    <span className="text-[10px] text-slate-300 dark:text-slate-700 font-mono">
                      {pageIndex + 1}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </HTMLFlipBook>
        </Document>
      </div>

      {/* ── Bottom page indicator ── */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <BookOpen className="w-3.5 h-3.5" />
        <span>Trang {displayCurrent} / {displayTotal} — kéo góc trang hoặc dùng nút để lật</span>
      </div>
    </div>
  );
};

// ─── Public component (SSR-safe wrapper) ─────────────────────────────────────
export interface PdfFlipBookProps {
  fileUrl: string;
}

export const PdfFlipBook: React.FC<PdfFlipBookProps> = ({ fileUrl }) => {
  return (
    <ClientOnly
      fallback={
        <div className="flex items-center justify-center min-h-[400px] gap-3 text-gray-500">
          <BookOpen className="w-7 h-7 animate-pulse" />
          <span className="text-sm font-medium">Đang khởi tạo trình đọc…</span>
        </div>
      }
    >
      <PdfFlipBookInner fileUrl={fileUrl} />
    </ClientOnly>
  );
};

export default PdfFlipBook;
