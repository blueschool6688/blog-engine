import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Minus,
  Image as ImageIcon,
  Eraser,
  X
} from 'lucide-react';
import { mediaService, getFullUrl } from '../services/api';
import type { Media } from '../services/api';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accentBlue underline cursor-pointer',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'w-full bg-slate-900 focus:outline-none min-h-[350px] px-4 py-3 leading-relaxed text-gray-100 placeholder-gray-600',
      },
    },
  });

  // Sync external content value updates if needed
  React.useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const openMediaModal = async () => {
    setShowMediaModal(true);
    try {
      const res = await mediaService.list();
      setMediaList((res.data || []).filter((m) => m.status === 'completed'));
    } catch (err) {
      console.error('Failed to load media list', err);
    }
  };

  const selectMedia = (media: Media) => {
    editor.chain().focus().setImage({ src: getFullUrl(media.url) }).run();
    setShowMediaModal(false);
  };

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setShowLinkModal(true);
  };

  const setLink = () => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkModal(false);
    setLinkUrl('');
  };

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 focus-within:ring-1 focus-within:ring-accentBlue/50 focus-within:border-accentBlue/50 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-950 border-b border-slate-800/80">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-slate-800 text-white' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-slate-800 text-white' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-slate-800 text-white' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-800 my-auto mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${
            editor.isActive('bold') ? 'bg-slate-800 text-white' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${
            editor.isActive('italic') ? 'bg-slate-800 text-white' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-800 my-auto mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${
            editor.isActive('bulletList') ? 'bg-slate-800 text-white' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${
            editor.isActive('orderedList') ? 'bg-slate-800 text-white' : ''
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-800 my-auto mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${
            editor.isActive('blockquote') ? 'bg-slate-800 text-white' : ''
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={openLinkModal}
          className={`p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${
            editor.isActive('link') ? 'bg-slate-800 text-white' : ''
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200"
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={openMediaModal}
          className="p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-slate-800 my-auto mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200"
          title="Clear Formatting"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} className="editor-content" />

      {/* Media Picker Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center bg-slate-100/30 dark:bg-slate-900/20">
              <div>
                <h3 className="font-bold text-lg text-slate-850 dark:text-gray-100">Insert Image</h3>
                <p className="text-xs text-gray-500 font-sans">Pick an image from the library to insert into content.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/35 dark:hover:border-slate-700 rounded-lg text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {mediaList.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 font-sans">No processed media files available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {mediaList.map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => selectMedia(media)}
                      className="aspect-square rounded-xl bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-700 overflow-hidden relative hover:scale-105 transition-all flex items-center justify-center group"
                    >
                      <img
                        src={getFullUrl(media.thumbnail_url || media.url)}
                        alt=""
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white">
                        Insert
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Link URL Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4">
            <div>
              <h3 className="font-bold text-lg text-slate-850 dark:text-gray-100">Set URL Link</h3>
              <p className="text-xs text-gray-500 mt-1 font-sans">Enter the web address for this hyperlink.</p>
            </div>
            <input
              type="text"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-3 px-4 outline-none transition-all"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-700 dark:text-gray-300 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={setLink}
                className="px-4 py-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white font-medium rounded-xl text-sm transition-all"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
