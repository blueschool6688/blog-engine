import React, { useEffect, useState } from 'react';
import {
  GripVertical as GripIcon,
  Trash2 as TrashIcon,
  Plus as PlusIcon,
  X as XIcon,
  Image as ImageIcon,
  Film as FilmIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Loader as LoaderIcon,
  Search as SearchIcon,
  Play as PlayIcon
} from 'lucide-react';
import { postService, mediaService, getFullUrl } from '../services/api';
import type { PostMedia, Media } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Modal, Input, Button, Segmented, Upload, Pagination, Spin } from 'antd';

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

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type === 'video/mp4' || file.type === 'video/webm';

    if (!isImage && !isVideo) {
      showError(`Unsupported format: ${file.name}. Only images and videos are allowed.`);
      return Upload.LIST_IGNORE;
    }

    if (isImage && file.size > 10 * 1024 * 1024) {
      showError(`Image file exceeds 10MB limit: ${file.name}`);
      return Upload.LIST_IGNORE;
    }

    if (isVideo && file.size > 500 * 1024 * 1024) {
      showError(`Video file exceeds 500MB limit: ${file.name}`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handlePickerUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploadingInPicker(true);
    try {
      const response = await mediaService.upload(file as File);
      if (response.data) {
        await postService.attachMedia(postId, { media_id: response.data.id });
        showSuccess(`Uploaded and attached ${file.name}`);
      }
      onSuccess(null, file);
      await fetchGallery();
      setPickerOpen(false);
    } catch (err: any) {
      console.error('Upload & attach in picker failed', err);
      onError(err);
      showError(`Failed to upload ${file.name}`);
    } finally {
      setUploadingInPicker(false);
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Delete Confirmation Modal using Antd */}
      <Modal
        open={deleteMediaId !== null}
        title="Remove Media from Gallery"
        onOk={confirmDetach}
        onCancel={() => setDeleteMediaId(null)}
        okText="Remove"
        okButtonProps={{ danger: true, type: 'primary' }}
        cancelText="Cancel"
      >
        <p className="py-2 text-sm text-slate-650 dark:text-gray-300">
          Are you sure you want to remove this media from the gallery? The post will not show it anymore, but the file remains in the Media Library.
        </p>
      </Modal>

      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-gray-100">Post Gallery</h3>
        <p className="text-xs text-gray-400 mt-1">
          Attach media files, write captions & alt texts, and drag to change display order.
        </p>
      </div>

      {error && (
        <div className="bg-dangerRed/10 border border-dangerRed/30 text-dangerRed p-4 rounded-xl text-sm">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spin />
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
                  <GripIcon className="w-3.5 h-3.5" />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleDetach(item.media_id); }}
                  className="absolute top-2 right-2 p-1 bg-dangerRed/80 hover:bg-dangerRed text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                  title="Remove from gallery"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
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
                      <FilmIcon className="w-8 h-8 text-accentBlue" />
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
                        <Input
                          value={localEdits.caption}
                          onChange={(e) => handleFieldChange(item.id, 'caption', e.target.value)}
                          placeholder="Short description..."
                          className="text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-gray-200 rounded-lg h-8"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 block mb-1">Alt Text</label>
                        <Input
                          value={localEdits.alt_text}
                          onChange={(e) => handleFieldChange(item.id, 'alt_text', e.target.value)}
                          placeholder="Screen reader alt..."
                          className="text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-gray-200 rounded-lg h-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    {hasChanges && (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleSaveDetails(item)}
                        disabled={isSaving}
                        loading={isSaving}
                        icon={!isSaving && <SaveIcon className="w-3 h-3 inline" />}
                        className="bg-successGreen hover:bg-successGreen/90 border-0 text-[10px] font-bold uppercase tracking-wider h-7 rounded"
                      >
                        Save Details
                      </Button>
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
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-accentBlue/50 hover:bg-accentBlue/5 rounded-xl aspect-video flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 hover:text-accentBlue transition-all cursor-pointer min-h-[220px] bg-slate-50/50 dark:bg-transparent"
          >
            <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-2">
              <PlusIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Add Media File</span>
          </button>
        </div>
      )}

      {/* Media Picker Modal using Antd */}
      <Modal
        open={pickerOpen}
        title={
          <div>
            <h3 className="font-bold text-slate-850 dark:text-gray-250">Select Media files</h3>
            <p className="text-xs text-gray-500 mt-0.5">Choose files from media library or upload new files.</p>
          </div>
        }
        onCancel={() => {
          setPickerOpen(false);
          setSelectedMediaIds([]);
        }}
        width={900}
        centered
        footer={[
          <span className="text-xs text-slate-500 mr-4" key="count">
            {selectedMediaIds.length} item(s) selected
          </span>,
          <Button
            key="cancel"
            onClick={() => {
              setPickerOpen(false);
              setSelectedMediaIds([]);
            }}
            className="rounded-xl"
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleAttachSelected}
            disabled={selectedMediaIds.length === 0}
            className="bg-gradient-to-r from-accentBlue to-accentPurple border-0 text-white rounded-xl shadow-md shadow-accentBlue/10"
          >
            Add to Gallery
          </Button>
        ]}
      >
        <div className="flex flex-col space-y-4">
          {/* Toolbar */}
          <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-950/20 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Search */}
              <Input
                placeholder="Search by name..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                prefix={<SearchIcon className="w-4 h-4 text-slate-400" />}
                className="rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-gray-200 h-9 w-48"
                allowClear
              />

              {/* Filter Type using Antd Segmented */}
              <Segmented
                value={pickerType}
                onChange={(value) => {
                  setPickerType(value as any);
                  setPickerPage(1);
                }}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Images', value: 'image' },
                  { label: 'Videos', value: 'video' },
                ]}
                className="bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3">
              <Upload
                customRequest={handlePickerUpload}
                beforeUpload={beforeUpload}
                multiple
                showUploadList={false}
                accept="image/*,video/mp4,video/webm"
              >
                <Button
                  loading={uploadingInPicker}
                  icon={uploadingInPicker ? <LoaderIcon className="w-3.5 h-3.5 animate-spin" /> : <PlusIcon className="w-3.5 h-3.5" />}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 rounded-xl h-9"
                >
                  Upload new
                </Button>
              </Upload>
            </div>
          </div>

          {/* Grid display */}
          <div className="overflow-y-auto max-h-[50vh] min-h-[300px] py-2">
            {pickerLoading ? (
              <div className="flex items-center justify-center py-24">
                <Spin size="large" />
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
                          <Spin size="small" className="mb-1" />
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
                              <PlayIcon className="w-5 h-5 fill-current text-white" />
                            </div>
                          )}

                          {/* Checkmark overlay */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-accentBlue text-white rounded-full p-1 shadow-md z-10">
                              <CheckIcon className="w-3 h-3" />
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
          </div>

          {/* Picker Pagination */}
          {pickerTotalPages > 1 && (
            <div className="flex justify-center mt-2 pt-2">
              <Pagination
                current={pickerPage}
                pageSize={pickerLimit}
                total={pickerTotal}
                showSizeChanger={false}
                onChange={(p) => setPickerPage(p)}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GalleryUploader;
