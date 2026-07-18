import React, { useEffect, useState, useRef } from 'react';
import { mediaService, getFullUrl } from '../services/api';
import type { Media } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

export async function loader() {
  return null;
}
import {
  Image as ImageIcon,
  Film,
  Upload,
  Trash2,
  Eye,
  Loader,
  X,
  Play,
  Search,
  RefreshCw
} from 'lucide-react';

export const MediaLibrary: React.FC = () => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'image' | 'video' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Modals state
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [deleteMedia, setDeleteMedia] = useState<Media | null>(null);

  const { showSuccess, showError, showWarning } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await mediaService.list({
        type: typeFilter,
        page,
        limit,
      });
      // Response format: res.data might be { items: Media[], total: number } or Media[] depending on API design.
      // In api.ts: list: async (params) => api.get<APIResponse<Media[] & { items?: Media[]; total?: number }>>(...)
      const responseData = res.data;
      if (responseData && typeof responseData === 'object' && 'items' in responseData) {
        setMediaList(responseData.items || []);
        setTotal(responseData.total || 0);
      } else if (Array.isArray(responseData)) {
        setMediaList(responseData);
        setTotal(responseData.length);
      }
    } catch (err) {
      console.error('Failed to load media library', err);
      showError('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [typeFilter, page]);

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Size limits
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type === 'video/mp4' || file.type === 'video/webm';

      if (!isImage && !isVideo) {
        showWarning(`Unsupported format: ${file.name}`);
        continue;
      }

      if (isImage && file.size > 10 * 1024 * 1024) {
        showWarning(`Image file exceeds 10MB limit: ${file.name}`);
        continue;
      }

      if (isVideo && file.size > 500 * 1024 * 1024) {
        showWarning(`Video file exceeds 500MB limit: ${file.name}`);
        continue;
      }

      try {
        await mediaService.upload(file);
        successCount++;
      } catch (err: any) {
        console.error('Failed to upload', file.name, err);
        failCount++;
      }
    }

    if (successCount > 0) {
      showSuccess(`Successfully uploaded ${successCount} files`);
      setPage(1);
      fetchMedia();
    }
    if (failCount > 0) {
      showError(`Failed to upload ${failCount} files`);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle single deletion
  const confirmDelete = async () => {
    if (!deleteMedia) return;
    try {
      await mediaService.delete(deleteMedia.id);
      showSuccess('Media file deleted successfully');
      setMediaList(mediaList.filter((m) => m.id !== deleteMedia.id));
    } catch (err: any) {
      console.error('Failed to delete media', err);
      // In case of GORM association blockage (409 Conflict)
      if (err.response?.status === 409) {
        showError('Conflict: Media is currently in use as a cover or in a post gallery and cannot be deleted.');
      } else {
        showError(err.response?.data?.message || 'Failed to delete media file');
      }
    } finally {
      setDeleteMedia(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        await mediaService.upload(files[i]);
        successCount++;
      }
      if (successCount > 0) {
        showSuccess(`Uploaded ${successCount} files via Drag & Drop`);
        setPage(1);
        fetchMedia();
      }
    } catch (err) {
      console.error(err);
      showError('Failed to upload some files');
    } finally {
      setUploading(false);
    }
  };

  const filteredMediaList = mediaList.filter((media) =>
    media.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteMedia !== null}
        title="Delete Media File"
        message={`Are you sure you want to delete "${deleteMedia?.file_name}"? This file will be permanently deleted from the disk and cannot be recovered.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteMedia(null)}
      />

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xl flex flex-col space-y-4 animate-scale-up">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-850 dark:text-white pr-12 truncate">{previewMedia.file_name}</h3>
            
            <div className="w-full h-[60vh] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/30">
              {previewMedia.type === 'video' ? (
                <video
                  src={getFullUrl(previewMedia.url)}
                  controls
                  autoPlay
                  className="max-w-full max-h-full"
                />
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
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Media Library
          </h2>
          <p className="text-sm text-gray-500 mt-1">Upload, search, and manage files used throughout posts.</p>
        </div>

        <div>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/mp4,video/webm"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center space-x-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 disabled:opacity-55 text-white font-medium px-5 py-3 rounded-xl transition-all shadow-md shadow-accentBlue/10 text-sm"
          >
            {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-slate-800 hover:border-accentBlue/40 bg-slate-900/10 hover:bg-slate-900/20 rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center group"
      >
        <Upload className="w-10 h-10 text-gray-700 group-hover:text-accentBlue/60 transition-colors mb-3" />
        <p className="text-sm text-gray-400 font-sans">
          Drag & Drop images or videos here to upload them directly
        </p>
        <p className="text-xs text-gray-600 mt-1 font-sans">
          Max sizes: Image 10MB, Video 500MB
        </p>
      </div>

      {/* Toolbar / Filters */}
      <div className="glass-panel border border-slate-800/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type Badge Filter */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl self-start">
          {[
            { label: 'All Files', value: '' },
            { label: 'Images', value: 'image' },
            { label: 'Videos', value: 'video' },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => {
                setTypeFilter(btn.value as any);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === btn.value
                  ? 'bg-slate-800 text-accentBlue shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl outline-none transition-all text-xs"
            />
          </div>
          <button
            onClick={fetchMedia}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
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
          {filteredMediaList.map((media) => {
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
                      <Loader className="w-5 h-5 animate-spin text-accentBlue" />
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
                          <Film className="w-8 h-8 text-gray-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-800 flex items-center justify-center text-white group-hover:scale-110 transition-all">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
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
                        {media.type === 'video' ? <Film className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
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
                        onClick={() => setPreviewMedia(media)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                        title="Preview details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteMedia(media)}
                        className="p-1.5 bg-dangerRed/10 hover:bg-dangerRed/20 border border-dangerRed/30 rounded-lg text-dangerRed transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {total > limit && (
        <div className="p-4 bg-slate-950/30 border border-slate-800/40 rounded-2xl flex justify-between items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500 font-medium">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
