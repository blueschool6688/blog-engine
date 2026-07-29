import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  Minimize2,
  ExternalLink,
} from 'lucide-react';
import { Button, Tooltip, Space } from 'antd';

interface PDFViewerProps {
  url: string;
  fileName?: string;
}

/**
 * PDFViewer renders PDF files using a browser native <iframe>.
 *
 * Unlike react-pdf (which uses PDF.js fetch API and is blocked by S3 CORS),
 * an <iframe> is treated as a top-level navigation request by the browser, 
 * bypassing CORS restrictions entirely. This allows PDFs to load from any 
 * S3 or CDN bucket without requiring CORS configuration on the bucket.
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({ url, fileName }) => {
  const [scale, setScale] = useState<number>(100); // percent
  const [expanded, setExpanded] = useState<boolean>(false);

  const zoom = (direction: 'in' | 'out') => {
    setScale((prev) => {
      const next = direction === 'in' ? prev + 10 : prev - 10;
      return Math.max(50, Math.min(200, next));
    });
  };

  // Build iframe src with #zoom parameter for PDF viewers that support it
  const iframeSrc = `${url}#zoom=${scale}&toolbar=1&navpanes=1`;

  if (typeof window === 'undefined') {
    return (
      <div className="flex flex-col bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md w-full p-8 text-center text-gray-500 text-sm">
        Loading document on client side...
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md w-full transition-all duration-300 ${
        expanded ? 'fixed inset-4 z-50' : 'max-h-[85vh]'
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 select-none shrink-0">
        <Space size={4}>
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-0.5">
            <Tooltip title="Zoom Out">
              <Button
                type="text"
                size="small"
                icon={<ZoomOut className="w-3.5 h-3.5" />}
                disabled={scale <= 50}
                onClick={() => zoom('out')}
                className="text-gray-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded border-0 w-7 h-7 flex items-center justify-center"
              />
            </Tooltip>
            <span className="text-[11px] font-mono text-gray-400 font-semibold px-2 min-w-[42px] text-center">
              {scale}%
            </span>
            <Tooltip title="Zoom In">
              <Button
                type="text"
                size="small"
                icon={<ZoomIn className="w-3.5 h-3.5" />}
                disabled={scale >= 200}
                onClick={() => zoom('in')}
                className="text-gray-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded border-0 w-7 h-7 flex items-center justify-center"
              />
            </Tooltip>
          </div>

          {/* Expand / Collapse */}
          <Tooltip title={expanded ? 'Exit Fullscreen' : 'Fullscreen'}>
            <Button
              type="text"
              size="small"
              icon={
                expanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )
              }
              onClick={() => setExpanded((v) => !v)}
              className="text-gray-400 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-lg w-8 h-8 flex items-center justify-center"
            />
          </Tooltip>
        </Space>

        {/* File name */}
        {fileName && (
          <div className="hidden md:block text-xs font-bold text-slate-400 truncate max-w-[220px] xl:max-w-sm font-sans">
            {fileName}
          </div>
        )}

        <Space size={6}>
          {/* Open in new tab */}
          <Tooltip title="Open in new tab">
            <Button
              type="text"
              size="small"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-accentBlue border border-slate-800 rounded-lg w-8 h-8 flex items-center justify-center"
            />
          </Tooltip>

          {/* Download */}
          <Tooltip title="Download">
            <Button
              type="primary"
              size="small"
              icon={<Download className="w-3.5 h-3.5" />}
              href={url}
              download={fileName || 'document.pdf'}
              target="_blank"
              rel="noreferrer"
              danger
              className="rounded-lg h-8 flex items-center justify-center px-2.5"
            />
          </Tooltip>
        </Space>
      </div>

      {/* PDF iframe — bypasses CORS entirely */}
      <div className="flex-1 relative overflow-hidden bg-slate-950 min-h-[500px]">
        <iframe
          key={scale} // re-mount on scale change to force reload with new zoom param
          src={iframeSrc}
          title={fileName || 'PDF Document'}
          className="w-full h-full border-0"
          style={{ minHeight: expanded ? 'calc(100vh - 120px)' : '500px' }}
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
        />
      </div>
    </div>
  );
};

export default PDFViewer;
