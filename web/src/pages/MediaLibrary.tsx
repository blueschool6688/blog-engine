import React, { useEffect, useState } from 'react';
import { useLoaderData, useSearchParams, useRevalidator, useNavigation } from 'react-router';
import { mediaService, getFullUrl } from '../services/api';
import type { Media } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Upload, Button, Input, Segmented, Modal, Pagination, Spin } from 'antd';
import {
  Image as ImageIcon,
  Film as FilmIcon,
  Upload as UploadIcon,
  Trash2 as TrashIcon,
  Eye as EyeIcon,
  Loader as LoaderIcon,
  X as XIcon,
  Play as PlayIcon,
  Search as SearchIcon,
  RefreshCw as RefreshIcon,
  FileText as FileTextIcon
} from 'lucide-react';

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const typeFilter = url.searchParams.get('type') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 12;
  
  try {
    const res = await mediaService.list({
      type: typeFilter as any,
      page,
      limit,
    });
    const responseData = res.data;
    if (responseData && typeof responseData === 'object' && 'items' in responseData) {
      return { media: responseData.items || [], total: responseData.total || 0 };
    } else if (Array.isArray(responseData)) {
      return { media: responseData, total: responseData.length };
    }
  } catch (err) {
    console.error('Failed to load media library', err);
  }
  return { media: [], total: 0 };
}

export const MediaLibrary: React.FC = () => {
  const { media: mediaList, total } = useLoaderData() as any;
  const { revalidate } = useRevalidator();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = searchParams.get('type') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;
  const loading = navigation.state === 'loading';

  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  // Modals state
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [deleteMedia, setDeleteMedia] = useState<Media | null>(null);

  const { showSuccess, showError, showWarning } = useToast();
  const [PDFViewer, setPDFViewer] = useState<React.ComponentType<{ url: string; fileName?: string }> | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSlides, setLightboxSlides] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [Lightbox, setLightbox] = useState<any>(null);
  const [ZoomPlugin, setZoomPlugin] = useState<any>(null);
  const [VideoPlugin, setVideoPlugin] = useState<any>(null);

  // Dynamically load PDFViewer and Lightbox on browser environment only
  useEffect(() => {
    import('../components/PDFViewer').then((mod) => {
      setPDFViewer(() => mod.PDFViewer);
    });

    Promise.all([
      import('yet-another-react-lightbox'),
      import('yet-another-react-lightbox/plugins/zoom'),
      import('yet-another-react-lightbox/plugins/video'),
      import('yet-another-react-lightbox/styles.css')
    ]).then(([lightboxMod, zoomMod, videoMod]) => {
      setLightbox(() => lightboxMod.default);
      setZoomPlugin(() => zoomMod.default);
      setVideoPlugin(() => videoMod.default);
    });
  }, []);

  // Validation rules for uploads
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type === 'video/mp4' || file.type === 'video/webm';
    const isDoc = file.type === 'application/pdf' || 
                  file.type === 'text/plain' ||
                  file.type === 'application/msword' ||
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                  file.type === 'application/vnd.ms-excel' ||
                  file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!isImage && !isVideo && !isDoc) {
      showWarning(`Unsupported format: ${file.name}`);
      return Upload.LIST_IGNORE;
    }

    if (isImage && file.size > 10 * 1024 * 1024) {
      showWarning(`Image file exceeds 10MB limit: ${file.name}`);
      return Upload.LIST_IGNORE;
    }

    if (isVideo && file.size > 500 * 1024 * 1024) {
      showWarning(`Video file exceeds 500MB limit: ${file.name}`);
      return Upload.LIST_IGNORE;
    }

    if (isDoc && file.size > 50 * 1024 * 1024) {
      showWarning(`Document file exceeds 50MB limit: ${file.name}`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  // Antd custom upload request handler
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      await mediaService.upload(file as File);
      onSuccess(null, file);
      showSuccess(`Successfully uploaded ${file.name}`);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('page', '1');
        return next;
      });
      revalidate();
    } catch (err: any) {
      console.error('Failed to upload', file.name, err);
      onError(err);
      showError(`Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle single deletion
  const confirmDelete = async () => {
    if (!deleteMedia) return;
    try {
      await mediaService.delete(deleteMedia.id);
      showSuccess('Media file deleted successfully');
      revalidate();
    } catch (err: any) {
      console.error('Failed to delete media', err);
      if (err.response?.status === 409) {
        showError('Conflict: Media is currently in use as a cover or in a post gallery and cannot be deleted.');
      } else {
        showError(err.response?.data?.message || 'Failed to delete media file');
      }
    } finally {
      setDeleteMedia(null);
    }
  };

  const filteredMediaList = mediaList.filter((media: Media) =>
    media.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreviewMedia = (media: Media) => {
    if (media.type === 'document' || media.mime_type === 'application/pdf') {
      setPreviewMedia(media);
    } else {
      const mediaSlides = filteredMediaList
        .filter((m: Media) => m.type === 'image' || m.type === 'video')
        .map((m: Media) => {
          if (m.type === 'video') {
            return {
              type: 'video' as const,
              sources: [
                {
                  src: getFullUrl(m.url),
                  type: m.mime_type || 'video/mp4',
                },
              ],
            };
          }
          return {
            src: getFullUrl(m.url),
          };
        });

      const clickedIndex = filteredMediaList
        .filter((m: Media) => m.type === 'image' || m.type === 'video')
        .findIndex((m: Media) => m.id === media.id);

      setLightboxSlides(mediaSlides);
      setLightboxIndex(clickedIndex >= 0 ? clickedIndex : 0);
      setLightboxOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal using Antd */}
      <Modal
        open={deleteMedia !== null}
        title="Delete Media File"
        onOk={confirmDelete}
        onCancel={() => setDeleteMedia(null)}
        okText="Delete"
        okButtonProps={{ danger: true, type: 'primary' }}
        cancelText="Cancel"
      >
        <p className="py-2 text-sm text-slate-650 dark:text-gray-300">
          Are you sure you want to delete &quot;{deleteMedia?.file_name}&quot;? This file will be permanently deleted from the disk and cannot be recovered.
        </p>
      </Modal>

      {/* Media Preview Modal using Antd */}
      <Modal
        open={previewMedia !== null}
        title={previewMedia?.file_name}
        onCancel={() => setPreviewMedia(null)}
        footer={null}
        width={900}
        centered
        className="dark:bg-slate-900"
      >
        {previewMedia && (
          <div className="space-y-4 pt-2">
            <div className="w-full h-[60vh] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/30">
              {previewMedia.type === 'video' ? (
                <video
                  src={getFullUrl(previewMedia.url)}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                />
              ) : previewMedia.type === 'document' || previewMedia.mime_type === 'application/pdf' ? (
                PDFViewer ? (
                  <PDFViewer url={getFullUrl(previewMedia.url)} fileName={previewMedia.file_name} />
                ) : (
                  <div className="text-xs text-gray-500 py-4 text-center">Loading viewer component...</div>
                )
              ) : (
                <img
                  src={getFullUrl(previewMedia.url)}
                  alt={previewMedia.file_name}
                  className="object-contain max-w-full max-h-full"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4 pt-2">
              <div className="flex gap-4">
                <span>Type: <strong className="text-slate-700 dark:text-gray-300 capitalize">{previewMedia.type}</strong></span>
                <span>Size: <strong className="text-slate-700 dark:text-gray-300">{(previewMedia.file_size / (1024 * 1024)).toFixed(2)} MB</strong></span>
                {previewMedia.resolution && (
                  <span>Resolution: <strong className="text-slate-700 dark:text-gray-300">{previewMedia.resolution}</strong></span>
                )}
                {previewMedia.duration ? (
                  <span>Duration: <strong className="text-slate-700 dark:text-gray-300">{previewMedia.duration}s</strong></span>
                ) : null}
              </div>
              <a
                href={getFullUrl(previewMedia.url)}
                target="_blank"
                rel="noreferrer"
                className="text-accentBlue hover:underline"
              >
                Open in new tab
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Media Library
          </h2>
          <p className="text-sm text-gray-500 mt-1">Upload, search, and manage files used throughout posts.</p>
        </div>

        <div>
          <Upload
            customRequest={handleUpload}
            beforeUpload={beforeUpload}
            multiple
            showUploadList={false}
            accept="image/*,video/mp4,video/webm,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
          >
            <Button
              type="primary"
              icon={uploading ? <LoaderIcon className="w-4 h-4 animate-spin inline" /> : <UploadIcon className="w-4 h-4 inline" />}
              size="large"
              loading={uploading}
              className="bg-gradient-to-r from-accentBlue to-accentPurple border-0 hover:brightness-110 text-white font-medium rounded-xl h-11"
            >
              Upload Files
            </Button>
          </Upload>
        </div>
      </div>

      {/* Drag & Drop Zone using Antd Upload Dragger */}
      <div className="bg-slate-100/50 dark:bg-slate-950/20 rounded-2xl overflow-hidden border border-dashed border-slate-300 dark:border-slate-800 hover:border-accentBlue/40 transition-colors">
        <Upload.Dragger
          customRequest={handleUpload}
          beforeUpload={beforeUpload}
          multiple
          showUploadList={false}
          accept="image/*,video/mp4,video/webm,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
          style={{ background: 'transparent', border: 'none', padding: '24px' }}
        >
          <div className="flex flex-col items-center justify-center py-2">
            <UploadIcon className="w-10 h-10 text-gray-700 hover:text-accentBlue/60 transition-colors mb-3" />
            <p className="ant-upload-text text-sm text-gray-400 font-sans">
              Drag & Drop images, videos, or documents (PDF, Word, Excel, Text) here to upload them directly
            </p>
            <p className="ant-upload-hint text-xs text-gray-600 mt-1 font-sans">
              Max sizes: Image 10MB, Video 500MB, Document 50MB
            </p>
          </div>
        </Upload.Dragger>
      </div>

      {/* Toolbar / Filters */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-4 bg-white/40 dark:bg-slate-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type Badge Filter using Antd Segmented */}
        <Segmented
          value={typeFilter}
          onChange={(value) => {
            setSearchParams(prev => {
              const next = new URLSearchParams(prev);
              if (value) next.set('type', value);
              else next.delete('type');
              next.set('page', '1');
              return next;
            });
          }}
          options={[
            { label: 'All Files', value: '' },
            { label: 'Images', value: 'image' },
            { label: 'Videos', value: 'video' },
            { label: 'Documents', value: 'document' },
          ]}
          className="bg-slate-950 p-0.5 border border-slate-800 rounded-xl"
        />

        {/* Search & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Input
            placeholder="Search file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchIcon className="w-4 h-4 text-slate-400" />}
            className="rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-gray-200 h-9"
            allowClear
          />
          <Button
            onClick={() => revalidate()}
            icon={<RefreshIcon className="w-4 h-4" />}
            className="h-9 w-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-gray-400"
            title="Refresh"
          />
        </div>
      </div>

      {/* Grid of Files */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-850 animate-pulse border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : filteredMediaList.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl">
          <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-gray-400 font-bold text-sm">No media files found</h3>
          <p className="text-xs text-gray-600 mt-1 font-sans">Upload files or adjust your search filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMediaList.map((media: Media) => {
            const isProcessing = media.status === 'processing';
            return (
              <div
                key={media.id}
                className="group relative aspect-square bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300"
              >
                {/* Thumbnail Layer */}
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-950">
                  {isProcessing ? (
                    <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-xs text-gray-500 gap-2">
                      <Spin size="small" />
                      <span>Processing...</span>
                    </div>
                  ) : media.type === 'video' ? (
                    <div className="w-full h-full relative">
                      {media.thumbnail_url ? (
                        <img
                          src={getFullUrl(media.thumbnail_url)}
                          alt=""
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                          <FilmIcon className="w-8 h-8 text-gray-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-800 flex items-center justify-center text-white group-hover:scale-110 transition-all">
                          <PlayIcon className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : media.type === 'document' || media.mime_type === 'application/pdf' ? (
                    <div className="w-full h-full bg-slate-900/60 flex flex-col items-center justify-center text-red-500 gap-2 p-4">
                      <FileTextIcon className="w-10 h-10 group-hover:scale-105 transition-transform" />
                      <span className="text-[10px] text-gray-400 text-center truncate w-full font-bold">{media.file_name}</span>
                    </div>
                  ) : (
                    <img
                      src={getFullUrl(media.thumbnail_url || media.url)}
                      alt={media.file_name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  )}

                  {/* Badges */}
                  {!isProcessing && (
                    <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
                      <span className="bg-slate-950/80 border border-slate-800/80 backdrop-blur-sm text-[9px] font-bold text-gray-300 px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                        {media.type === 'video' ? (
                          <FilmIcon className="w-2.5 h-2.5" />
                        ) : media.type === 'document' || media.mime_type === 'application/pdf' ? (
                          <FileTextIcon className="w-2.5 h-2.5" />
                        ) : (
                          <ImageIcon className="w-2.5 h-2.5" />
                        )}
                        {media.type}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info and Overlay on Hover */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-3.5 transition-all duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-gray-200 font-semibold truncate pr-1" title={media.file_name}>
                      {media.file_name}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {(media.file_size / (1024 * 1024)).toFixed(2)} MB
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePreviewMedia(media)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-gray-400 dark:hover:text-white border border-slate-250 dark:border-slate-800 rounded-lg transition-colors"
                        title="Preview details"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteMedia(media)}
                        className="p-1.5 bg-dangerRed/10 hover:bg-dangerRed/20 border border-dangerRed/30 rounded-lg text-dangerRed transition-colors"
                        title="Delete file"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls using Antd Pagination */}
      {total > limit && (
        <div className="p-4 bg-slate-950/30 border border-slate-800/40 rounded-2xl flex justify-center items-center">
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            showSizeChanger={false}
            onChange={(p) => {
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.set('page', String(p));
                return next;
              });
            }}
          />
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && Lightbox && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={lightboxSlides}
          plugins={[ZoomPlugin, VideoPlugin].filter(Boolean)}
        />
      )}
    </div>
  );
};

export function HydrateFallback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default MediaLibrary;
