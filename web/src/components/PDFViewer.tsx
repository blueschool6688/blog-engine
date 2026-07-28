import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Loader2, Download, AlertTriangle } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFViewerProps {
  url: string;
  fileName?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, fileName }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const target = prevPageNumber + offset;
      if (numPages && target >= 1 && target <= numPages) {
        return target;
      }
      return prevPageNumber;
    });
  }

  const zoom = (direction: 'in' | 'out') => {
    setScale(prevScale => {
      const nextScale = direction === 'in' ? prevScale + 0.1 : prevScale - 0.1;
      return Math.max(0.5, Math.min(2.0, nextScale));
    });
  };

  const rotate = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  if (typeof window === 'undefined') {
    return (
      <div className="flex flex-col bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md w-full p-8 text-center text-gray-500">
        Loading document on client side...
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md w-full max-h-[85vh]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          {numPages && (
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs text-gray-400 font-semibold font-mono">
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => changePage(-1)}
                className="p-1 hover:text-white hover:bg-slate-900 rounded disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2">
                {pageNumber} / {numPages}
              </span>
              <button
                type="button"
                disabled={numPages ? pageNumber >= numPages : true}
                onClick={() => changePage(1)}
                className="p-1 hover:text-white hover:bg-slate-900 rounded disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs text-gray-400 font-semibold font-mono">
            <button
              type="button"
              onClick={() => zoom('out')}
              disabled={scale <= 0.6}
              className="p-1 hover:text-white hover:bg-slate-900 rounded disabled:opacity-30 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={() => zoom('in')}
              disabled={scale >= 1.9}
              className="p-1 hover:text-white hover:bg-slate-900 rounded disabled:opacity-30 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={rotate}
            className="p-2 bg-slate-955 hover:bg-slate-900 text-gray-400 hover:text-white rounded-lg border border-slate-800 transition-all"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {fileName && (
          <div className="hidden md:block text-xs font-bold text-slate-400 truncate max-w-[200px] xl:max-w-xs font-sans">
            {fileName}
          </div>
        )}

        <a
          href={url}
          download={fileName || 'document.pdf'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all"
        >
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* PDF Document Container */}
      <div className="relative flex-1 overflow-auto bg-slate-950 p-4 flex justify-center items-start min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2 bg-slate-950/80 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null}
          error={
            <div className="text-center p-8 border border-dashed border-red-500/20 bg-red-500/5 rounded-xl max-w-sm flex flex-col items-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-2xl rounded-lg overflow-hidden"
            loading={null}
          />
        </Document>
      </div>
    </div>
  );
};
