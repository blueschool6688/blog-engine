import React, { useEffect, useState, useRef } from 'react';
import { GripVertical, Trash2, Plus, X, Image as ImageIcon, Film, Save, Check, Loader, Search, Play } from 'lucide-react';
import { postService, mediaService, getFullUrl } from '../services/api';
import type { PostMedia, Media } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from './ConfirmModal';

interface GalleryUploaderProps {
  postId: number;
}

export const GalleryUploader: React.FC<GalleryUploaderProps> = ({ postId }) => {
  const [gallery, setGallery] = useState<PostMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteMediaId, setDeleteMediaId] = useState<number | null>(null);

  const { showSuccess, showError } = useToast();

  // Drag and drop sorting state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Edit details state
  const [editedItems, setEditedItems] = useState<Record<number, { caption: string; alt_text: string }>>({});
  const [savingItemIds, setSavingItemIds] = useState<Record<number, boolean>>({});

  // Media Picker Modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerType, setPickerType] = useState<'all' | 'image' | 'video'>('all');
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerTotal, setPickerTotal] = useState(0);
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [uploadingInPicker, setUploadingInPicker] = useState(false);
  const pickerLimit = 12;
  const pickerTotalPages = Math.ceil(pickerTotal / pickerLimit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await postService.getGallery(postId);
      setGallery(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load post gallery', err);
      setError('Could not load gallery items.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPickerMedia = async () => {
    setPickerLoading(true);
    try {
      const response = await mediaService.list({
        type: pickerType === 'all' ? '' : pickerType,
        page: pickerPage,
        limit: pickerLimit,
      });

      if (response.data && 'items' in response.data) {
        setAllMedia(response.data.items || []);
        setPickerTotal(response.data.total || 0);
      } else {
        const list = (response.data as Media[]) || [];
        setAllMedia(list);
        setPickerTotal(list.length);
      }
    } catch (err) {
      console.error('Failed to load picker media', err);
    } finally {
      setPickerLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchGallery();
    }
  }, [postId]);

  useEffect(() => {
    if (pickerOpen) {
      fetchPickerMedia();
    }
  }, [pickerOpen, pickerType, pickerPage]);

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updatedGallery = [...gallery];
    const [draggedItem] = updatedGallery.splice(draggedIndex, 1);
    updatedGallery.splice(targetIndex, 0, draggedItem);

    // Optimistic UI update
    setGallery(updatedGallery);
    setDraggedIndex(null);

    // Call API to reorder
    try {
      const reorderPayload = updatedGallery.map((item, idx) => ({
        media_id: item.media_id,
        sort_order: idx + 1,
      }));
      await postService.reorderGallery(postId, reorderPayload);
    } catch (err) {
      console.error('Failed to reorder gallery', err);
      showError('Failed to reorder gallery. Refreshing list.');
      fetchGallery();
    }
  };

  const confirmDetach = async () => {
    if (deleteMediaId === null) return;
    try {
      await postService.detachMedia(postId, deleteMediaId);
      setGallery(gallery.filter((g) => g.media_id !== deleteMediaId));
      showSuccess('Media removed from gallery.');
    } catch (err) {
      console.error('Failed to detach media', err);
      showError('Failed to remove media.');
    } finally {
      setDeleteMediaId(null);
    }
  };

  // Detach Media
  const handleDetach = (mediaId: number) => {
    setDeleteMediaId(mediaId);
  };

  // Edit details changes
  const handleFieldChange = (itemId: number, field: 'caption' | 'alt_text', value: string) => {
    const item = gallery.find((g) => g.id === itemId);
    if (!item) return;

    const current = editedItems[itemId] || {
      caption: item.caption || '',
      alt_text: item.alt_text || '',
    };

    setEditedItems({
      ...editedItems,
      [itemId]: {
        ...current,
        [field]: value,
      },
    });
  };

  const handleSaveDetails = async (item: PostMedia) => {
    const edits = editedItems[item.id];
    if (!edits) return;

    setSavingItemIds((prev) => ({ ...prev, [item.id]: true }));
    try {
      await postService.attachMedia(postId, {
        media_id: item.media_id,
        caption: edits.caption,
        alt_text: edits.alt_text,
      });

      // Clear edited state chunk
      const updatedEdits = { ...editedItems };
      delete updatedEdits[item.id];
      setEditedItems(updatedEdits);

      // Refresh local copy
      const response = await postService.getGallery(postId);
      setGallery(response.data || []);
      showSuccess('Gallery details saved successfully.');
    } catch (err) {
      console.error('Failed to save media details', err);
      showError('Failed to save changes.');
    } finally {
      setSavingItemIds((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  // Picker selection action
  const togglePickerSelection = (mediaId: number) => {
    setSelectedMediaIds((prev) =>
      prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
    );
  };

  const handleAttachSelected = async () => {
    if (selectedMediaIds.length === 0) return;
    setPickerLoading(true);
    try {
      for (const mediaId of selectedMediaIds) {
        await postService.attachMedia(postId, { media_id: mediaId });
      }
      setSelectedMediaIds([]);
      setPickerOpen(false);
      await fetchGallery();
      showSuccess('Media attached to post.');
    } catch (err) {
      console.error('Failed to attach selected media', err);
      showError('Failed to attach media to post.');
    } finally {
      setPickerLoading(false);
    }
  };

  const handlePickerUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePickerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingInPicker(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const response = await mediaService.upload(files[i]);
        if (response.data) {
          // Immediately attach uploaded media to this gallery
          await postService.attachMedia(postId, { media_id: response.data.id });
        }
      }
      await fetchGallery();
      setPickerOpen(false);
      showSuccess('Files uploaded and attached to gallery.');
    } catch (err) {
      console.error('Upload & attach in picker failed', err);
      showError('Failed to upload file.');
    } finally {
      setUploadingInPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredMediaList = allMedia.filter((m) =>
    m.file_name.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <ConfirmModal
        isOpen={deleteMediaId !== null}
        title="Remove Media from Gallery"
        message="Are you sure you want to remove this media from the gallery? The post will not show it anymore, but the file remains in the Media Library."
        onConfirm={confirmDetach}
        onCancel={() => setDeleteMediaId(null)}
      />
      <div>
        <h3 className="text-base font-bold text-gray-100">Post Gallery</h3>
        <p className="text-xs text-gray-400 mt-1">
          Attach media files, write captions & alt texts, and drag to change display order.
        </p>
      </div>

      {error && (
        <div className="bg-dangerRed/10 border border-dangerRed/30 text-dangerRed p-4 rounded-xl text-sm flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-accentBlue animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gallery.map((item, index) => {
            const media = item.media;
            if (!media) return null;

            const localEdits = editedItems[item.id] || {
              caption: item.caption || '',
              alt_text: item.alt_text || '',
            };

            const hasChanges =
              localEdits.caption !== (item.caption || '') ||
              localEdits.alt_text !== (item.alt_text || '');

            const isSaving = savingItemIds[item.id] || false;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, index)}
                className={`group bg-slate-50 dark:bg-slate-950/40 border border-slate-250 dark:border-slate-850 rounded-xl overflow-hidden flex flex-col relative transition-all duration-200 ${draggedIndex === index ? 'opacity-40 scale-95 border-accentBlue' : ''
                  }`}
              >
                <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing p-1 bg-white dark:bg-slate-900/90 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100 z-10">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleDetach(item.media_id); }}
                  className="absolute top-2 right-2 p-1 bg-dangerRed/80 hover:bg-dangerRed text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                  title="Remove from gallery"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Media Image/Poster Container */}
                <div className="aspect-video bg-black flex items-center justify-center relative select-none">
                  <img
                    src={getFullUrl(media.thumbnail_url || media.url)}
                    alt={media.file_name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/0f172a/94a3b8?text=Image';
                    }}
                  />
                  {media.type === 'video' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Film className="w-8 h-8 text-accentBlue" />
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-slate-700">
                    Order: {item.sort_order}
                  </span>
                </div>

                {/* Content details inputs */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-widest block font-bold truncate mb-1">
                        {media.file_name} ({formatBytes(media.file_size)})
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 block mb-1">Caption</label>
                        <input
                          type="text"
                          value={localEdits.caption}
                          onChange={(e) => handleFieldChange(item.id, 'caption', e.target.value)}
                          placeholder="Short description..."
                          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue rounded px-2.5 py-1.5 text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 block mb-1">Alt Text</label>
                        <input
                          type="text"
                          value={localEdits.alt_text}
                          onChange={(e) => handleFieldChange(item.id, 'alt_text', e.target.value)}
                          placeholder="Screen reader alt..."
                          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue rounded px-2.5 py-1.5 text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    {hasChanges && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); handleSaveDetails(item); }}
                        disabled={isSaving}
                        className="flex items-center gap-1 bg-successGreen hover:bg-successGreen/90 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded transition-all"
                      >
                        {isSaving ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                        <span>Save Details</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add media block */}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-accentBlue/50 hover:bg-accentBlue/5 rounded-xl aspect-video flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 hover:text-accentBlue transition-all cursor-pointer min-h-[220px]"
          >
            <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-2">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Add Media File</span>
          </button>
        </div>
      )}

      {/* Media Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
              <div>
                <h3 className="font-bold text-slate-850 dark:text-gray-200">Select Media files</h3>
                <p className="text-xs text-gray-500 mt-0.5">Choose files from media library or upload new files.</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setPickerOpen(false);
                  setSelectedMediaIds([]);
                }}
                className="text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-950/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-650 focus:outline-none focus:border-accentBlue w-48"
                  />
                </div>

                {/* Filter Type */}
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 border border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPickerType('all');
                      setPickerPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg ${pickerType === 'all' ? 'bg-white dark:bg-slate-800 text-accentBlue dark:text-white font-medium shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-850'
                      }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerType('image');
                      setPickerPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 ${pickerType === 'image' ? 'bg-white dark:bg-slate-800 text-accentBlue dark:text-white font-medium shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-850'
                      }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    Images
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerType('video');
                      setPickerPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1 ${pickerType === 'video' ? 'bg-white dark:bg-slate-800 text-accentBlue dark:text-white font-medium shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-850'
                      }`}
                  >
                    <Film className="w-3 h-3" />
                    Videos
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePickerUploadClick}
                  disabled={uploadingInPicker}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploadingInPicker ? (
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Upload new</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePickerFileChange}
                  accept="image/*,video/mp4,video/webm"
                  multiple
                  className="hidden"
                />
              </div>
            </div>

            {/* Grid display */}
            <div className="p-4 flex-1 overflow-y-auto min-h-[300px]">
              {pickerLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader className="w-8 h-8 text-accentBlue animate-spin" />
                </div>
              ) : filteredMediaList.length === 0 ? (
                <div className="text-center py-24 text-gray-500">No media assets found in library.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {filteredMediaList.map((media) => {
                    const isSelected = selectedMediaIds.includes(media.id);
                    const isProcessing = media.status === 'processing';

                    return (
                      <div
                        key={media.id}
                        onClick={() => !isProcessing && togglePickerSelection(media.id)}
                        className={`group border rounded-xl overflow-hidden aspect-square relative bg-slate-950 flex flex-col cursor-pointer transition-all ${isSelected
                            ? 'border-accentBlue ring-2 ring-accentBlue/30 scale-95'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                          }`}
                      >
                        {isProcessing ? (
                          <div className="flex-1 flex flex-col items-center justify-center p-2 text-center">
                            <Loader className="w-6 h-6 text-accentBlue animate-spin mb-1" />
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest font-semibold">
                              Wait...
                            </span>
                          </div>
                        ) : (
                          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                            <img
                              src={getFullUrl(media.thumbnail_url || media.url)}
                              alt={media.file_name}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/150/0f172a/94a3b8?text=File';
                              }}
                            />
                            {media.type === 'video' && (
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <Play className="w-5 h-5 fill-current text-white" />
                              </div>
                            )}

                            {/* Checkmark overlay */}
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 bg-accentBlue text-white rounded-full p-1 shadow-md">
                                <Check className="w-3 h-3" />
                              </div>
                            )}

                            {/* Type badge */}
                            <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded text-[7px] font-bold uppercase bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-gray-300 border border-slate-250 dark:border-slate-700">
                              {media.type}
                            </span>
                          </div>
                        )}
                        <div className="p-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-550 dark:text-gray-400 truncate text-center font-medium">
                          {media.file_name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Picker Pagination */}
              {pickerTotalPages > 1 && (
                <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setPickerPage((p) => Math.max(p - 1, 1))}
                    disabled={pickerPage === 1}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-xs font-semibold rounded-lg dark:hover:bg-slate-750 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500 dark:text-gray-400 self-center">
                    Page {pickerPage} of {pickerTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerPage((p) => Math.min(p + 1, pickerTotalPages))}
                    disabled={pickerPage === pickerTotalPages}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-xs font-semibold rounded-lg dark:hover:bg-slate-750 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/40 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {selectedMediaIds.length} item(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPickerOpen(false);
                    setSelectedMediaIds([]);
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-650 hover:text-slate-850 dark:text-gray-300 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleAttachSelected(); }}
                  disabled={selectedMediaIds.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-accentBlue to-accentPurple text-white text-xs font-semibold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-md shadow-accentBlue/10"
                >
                  Add to Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryUploader;
