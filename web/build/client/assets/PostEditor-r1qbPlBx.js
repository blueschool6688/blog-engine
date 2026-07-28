import { c as getFullUrl, h as translateService, i as categoryService, l as mediaService, m as tagService, t as aiService, u as postService } from "./api-DYEteWSp.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { n as useLanguage } from "./LanguageContext-FaGWHnxr.js";
import { t as ConfirmModal } from "./ConfirmModal-v1UHWXWR.js";
import { Link, UNSAFE_withComponentProps, useNavigate, useParams } from "react-router";
import React, { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, Bold, Check, Eraser, FileText, Film, GripVertical, Heading1, Heading2, Heading3, Image, Italic, Languages, Link as Link$1, List, ListOrdered, Loader, Minus, Play, Plus, Quote, Save, Search, Sparkles, Trash, Trash2, X } from "lucide-react";
import { Button, Card, Collapse, DatePicker, Form, Input, Modal, Select, Spin, Switch, Tabs } from "antd";
import dayjs from "dayjs";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
//#region src/components/RichTextEditor.tsx
var RichTextEditor = ({ value, onChange }) => {
	const [showMediaModal, setShowMediaModal] = useState(false);
	const [showLinkModal, setShowLinkModal] = useState(false);
	const [mediaList, setMediaList] = useState([]);
	const [linkUrl, setLinkUrl] = useState("");
	const editor = useEditor({
		extensions: [
			StarterKit,
			ImageExtension,
			LinkExtension.configure({
				openOnClick: false,
				HTMLAttributes: { class: "text-accentBlue underline cursor-pointer" }
			})
		],
		content: value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: { attributes: { class: "w-full bg-slate-900 focus:outline-none min-h-[350px] px-4 py-3 leading-relaxed text-gray-100 placeholder-gray-600" } }
	});
	React.useEffect(() => {
		if (editor && editor.getHTML() !== value) editor.commands.setContent(value);
	}, [value, editor]);
	if (!editor) return null;
	const openMediaModal = async () => {
		setShowMediaModal(true);
		try {
			const res = await mediaService.list();
			setMediaList((res.data || []).filter((m) => m.status === "completed"));
		} catch (err) {
			console.error("Failed to load media list", err);
		}
	};
	const selectMedia = (media) => {
		editor.chain().focus().setImage({ src: getFullUrl(media.url) }).run();
		setShowMediaModal(false);
	};
	const openLinkModal = () => {
		const previousUrl = editor.getAttributes("link").href;
		setLinkUrl(previousUrl || "");
		setShowLinkModal(true);
	};
	const setLink = () => {
		if (linkUrl === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
		else editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
		setShowLinkModal(false);
		setLinkUrl("");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "border border-slate-800 rounded-xl overflow-hidden bg-slate-900 focus-within:ring-1 focus-within:ring-accentBlue/50 focus-within:border-accentBlue/50 transition-all",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap gap-1 p-2 bg-slate-950 border-b border-slate-800/80",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("heading", { level: 1 }) ? "bg-slate-800 text-white" : ""}`,
						title: "Heading 1",
						children: /* @__PURE__ */ jsx(Heading1, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("heading", { level: 2 }) ? "bg-slate-800 text-white" : ""}`,
						title: "Heading 2",
						children: /* @__PURE__ */ jsx(Heading2, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("heading", { level: 3 }) ? "bg-slate-800 text-white" : ""}`,
						title: "Heading 3",
						children: /* @__PURE__ */ jsx(Heading3, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-slate-800 my-auto mx-1" }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleBold().run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("bold") ? "bg-slate-800 text-white" : ""}`,
						title: "Bold",
						children: /* @__PURE__ */ jsx(Bold, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleItalic().run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("italic") ? "bg-slate-800 text-white" : ""}`,
						title: "Italic",
						children: /* @__PURE__ */ jsx(Italic, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-slate-800 my-auto mx-1" }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleBulletList().run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("bulletList") ? "bg-slate-800 text-white" : ""}`,
						title: "Bullet List",
						children: /* @__PURE__ */ jsx(List, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleOrderedList().run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("orderedList") ? "bg-slate-800 text-white" : ""}`,
						title: "Ordered List",
						children: /* @__PURE__ */ jsx(ListOrdered, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-slate-800 my-auto mx-1" }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleBlockquote().run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("blockquote") ? "bg-slate-800 text-white" : ""}`,
						title: "Blockquote",
						children: /* @__PURE__ */ jsx(Quote, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: openLinkModal,
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("link") ? "bg-slate-800 text-white" : ""}`,
						title: "Insert Link",
						children: /* @__PURE__ */ jsx(Link$1, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().setHorizontalRule().run(),
						className: "p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200",
						title: "Horizontal Rule",
						children: /* @__PURE__ */ jsx(Minus, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: openMediaModal,
						className: "p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200",
						title: "Insert Image",
						children: /* @__PURE__ */ jsx(Image, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-slate-800 my-auto mx-1" }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
						className: "p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200",
						title: "Clear Formatting",
						children: /* @__PURE__ */ jsx(Eraser, { className: "w-4 h-4" })
					})
				]
			}),
			/* @__PURE__ */ jsx(EditorContent, {
				editor,
				className: "editor-content"
			}),
			showMediaModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn",
				children: /* @__PURE__ */ jsxs("div", {
					className: "glass-panel border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "p-5 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center bg-slate-100/30 dark:bg-slate-900/20",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-lg text-slate-850 dark:text-gray-100",
							children: "Insert Image"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 font-sans",
							children: "Pick an image from the library to insert into content."
						})] }), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setShowMediaModal(false),
							className: "p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/35 dark:hover:border-slate-700 rounded-lg text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-all",
							children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "flex-1 overflow-y-auto p-6",
						children: mediaList.length === 0 ? /* @__PURE__ */ jsxs("div", {
							className: "text-center py-12",
							children: [/* @__PURE__ */ jsx(Image, { className: "w-12 h-12 text-gray-700 mx-auto mb-4" }), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-gray-500 font-sans",
								children: "No processed media files available."
							})]
						}) : /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4",
							children: mediaList.map((media) => /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => selectMedia(media),
								className: "aspect-square rounded-xl bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-700 overflow-hidden relative hover:scale-105 transition-all flex items-center justify-center group",
								children: [/* @__PURE__ */ jsx("img", {
									src: getFullUrl(media.thumbnail_url || media.url),
									alt: "",
									className: "object-cover w-full h-full"
								}), /* @__PURE__ */ jsx("div", {
									className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white",
									children: "Insert"
								})]
							}, media.id))
						})
					})]
				})
			}),
			showLinkModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50",
				children: /* @__PURE__ */ jsxs("div", {
					className: "glass-panel border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-lg text-slate-850 dark:text-gray-100",
							children: "Set URL Link"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 mt-1 font-sans",
							children: "Enter the web address for this hyperlink."
						})] }),
						/* @__PURE__ */ jsx("input", {
							type: "text",
							placeholder: "https://example.com",
							value: linkUrl,
							onChange: (e) => setLinkUrl(e.target.value),
							className: "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-3 px-4 outline-none transition-all"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-end space-x-3 pt-2",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setShowLinkModal(false),
								className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-700 dark:text-gray-300 font-medium transition-all",
								children: "Cancel"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: setLink,
								className: "px-4 py-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white font-medium rounded-xl text-sm transition-all",
								children: "Insert Link"
							})]
						})
					]
				})
			})
		]
	});
};
//#endregion
//#region src/components/GalleryUploader.tsx
var GalleryUploader = ({ postId }) => {
	const [gallery, setGallery] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [deleteMediaId, setDeleteMediaId] = useState(null);
	const { showSuccess, showError } = useToast();
	const [draggedIndex, setDraggedIndex] = useState(null);
	const [editedItems, setEditedItems] = useState({});
	const [savingItemIds, setSavingItemIds] = useState({});
	const [pickerOpen, setPickerOpen] = useState(false);
	const [allMedia, setAllMedia] = useState([]);
	const [pickerLoading, setPickerLoading] = useState(false);
	const [pickerType, setPickerType] = useState("all");
	const [pickerPage, setPickerPage] = useState(1);
	const [pickerTotal, setPickerTotal] = useState(0);
	const [pickerSearch, setPickerSearch] = useState("");
	const [selectedMediaIds, setSelectedMediaIds] = useState([]);
	const [uploadingInPicker, setUploadingInPicker] = useState(false);
	const pickerLimit = 12;
	const pickerTotalPages = Math.ceil(pickerTotal / pickerLimit);
	const fileInputRef = useRef(null);
	const fetchGallery = async () => {
		setLoading(true);
		try {
			const response = await postService.getGallery(postId);
			setGallery(response.data || []);
			setError(null);
		} catch (err) {
			console.error("Failed to load post gallery", err);
			setError("Could not load gallery items.");
		} finally {
			setLoading(false);
		}
	};
	const fetchPickerMedia = async () => {
		setPickerLoading(true);
		try {
			const response = await mediaService.list({
				type: pickerType === "all" ? "" : pickerType,
				page: pickerPage,
				limit: pickerLimit
			});
			if (response.data && "items" in response.data) {
				setAllMedia(response.data.items || []);
				setPickerTotal(response.data.total || 0);
			} else {
				const list = response.data || [];
				setAllMedia(list);
				setPickerTotal(list.length);
			}
		} catch (err) {
			console.error("Failed to load picker media", err);
		} finally {
			setPickerLoading(false);
		}
	};
	useEffect(() => {
		if (postId) fetchGallery();
	}, [postId]);
	useEffect(() => {
		if (pickerOpen) fetchPickerMedia();
	}, [
		pickerOpen,
		pickerType,
		pickerPage
	]);
	const handleDragStart = (e, index) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};
	const handleDrop = async (e, targetIndex) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === targetIndex) return;
		const updatedGallery = [...gallery];
		const [draggedItem] = updatedGallery.splice(draggedIndex, 1);
		updatedGallery.splice(targetIndex, 0, draggedItem);
		setGallery(updatedGallery);
		setDraggedIndex(null);
		try {
			const reorderPayload = updatedGallery.map((item, idx) => ({
				media_id: item.media_id,
				sort_order: idx + 1
			}));
			await postService.reorderGallery(postId, reorderPayload);
		} catch (err) {
			console.error("Failed to reorder gallery", err);
			showError("Failed to reorder gallery. Refreshing list.");
			fetchGallery();
		}
	};
	const confirmDetach = async () => {
		if (deleteMediaId === null) return;
		try {
			await postService.detachMedia(postId, deleteMediaId);
			setGallery(gallery.filter((g) => g.media_id !== deleteMediaId));
			showSuccess("Media removed from gallery.");
		} catch (err) {
			console.error("Failed to detach media", err);
			showError("Failed to remove media.");
		} finally {
			setDeleteMediaId(null);
		}
	};
	const handleDetach = (mediaId) => {
		setDeleteMediaId(mediaId);
	};
	const handleFieldChange = (itemId, field, value) => {
		const item = gallery.find((g) => g.id === itemId);
		if (!item) return;
		const current = editedItems[itemId] || {
			caption: item.caption || "",
			alt_text: item.alt_text || ""
		};
		setEditedItems({
			...editedItems,
			[itemId]: {
				...current,
				[field]: value
			}
		});
	};
	const handleSaveDetails = async (item) => {
		const edits = editedItems[item.id];
		if (!edits) return;
		setSavingItemIds((prev) => ({
			...prev,
			[item.id]: true
		}));
		try {
			await postService.attachMedia(postId, {
				media_id: item.media_id,
				caption: edits.caption,
				alt_text: edits.alt_text
			});
			const updatedEdits = { ...editedItems };
			delete updatedEdits[item.id];
			setEditedItems(updatedEdits);
			const response = await postService.getGallery(postId);
			setGallery(response.data || []);
			showSuccess("Gallery details saved successfully.");
		} catch (err) {
			console.error("Failed to save media details", err);
			showError("Failed to save changes.");
		} finally {
			setSavingItemIds((prev) => ({
				...prev,
				[item.id]: false
			}));
		}
	};
	const togglePickerSelection = (mediaId) => {
		setSelectedMediaIds((prev) => prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]);
	};
	const handleAttachSelected = async () => {
		if (selectedMediaIds.length === 0) return;
		setPickerLoading(true);
		try {
			for (const mediaId of selectedMediaIds) await postService.attachMedia(postId, { media_id: mediaId });
			setSelectedMediaIds([]);
			setPickerOpen(false);
			await fetchGallery();
			showSuccess("Media attached to post.");
		} catch (err) {
			console.error("Failed to attach selected media", err);
			showError("Failed to attach media to post.");
		} finally {
			setPickerLoading(false);
		}
	};
	const handlePickerUploadClick = () => {
		fileInputRef.current?.click();
	};
	const handlePickerFileChange = async (e) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		setUploadingInPicker(true);
		try {
			for (let i = 0; i < files.length; i++) {
				const response = await mediaService.upload(files[i]);
				if (response.data) await postService.attachMedia(postId, { media_id: response.data.id });
			}
			await fetchGallery();
			setPickerOpen(false);
			showSuccess("Files uploaded and attached to gallery.");
		} catch (err) {
			console.error("Upload & attach in picker failed", err);
			showError("Failed to upload file.");
		} finally {
			setUploadingInPicker(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};
	const formatBytes = (bytes) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = [
			"Bytes",
			"KB",
			"MB"
		];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	};
	const filteredMediaList = allMedia.filter((m) => m.file_name.toLowerCase().includes(pickerSearch.toLowerCase()));
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6",
		children: [
			/* @__PURE__ */ jsx(ConfirmModal, {
				isOpen: deleteMediaId !== null,
				title: "Remove Media from Gallery",
				message: "Are you sure you want to remove this media from the gallery? The post will not show it anymore, but the file remains in the Media Library.",
				onConfirm: confirmDetach,
				onCancel: () => setDeleteMediaId(null)
			}),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
				className: "text-base font-bold text-gray-100",
				children: "Post Gallery"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-xs text-gray-400 mt-1",
				children: "Attach media files, write captions & alt texts, and drag to change display order."
			})] }),
			error && /* @__PURE__ */ jsx("div", {
				className: "bg-dangerRed/10 border border-dangerRed/30 text-dangerRed p-4 rounded-xl text-sm flex items-center gap-2",
				children: /* @__PURE__ */ jsx("span", { children: error })
			}),
			loading ? /* @__PURE__ */ jsx("div", {
				className: "flex items-center justify-center py-12",
				children: /* @__PURE__ */ jsx(Loader, { className: "w-8 h-8 text-accentBlue animate-spin" })
			}) : /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6",
				children: [gallery.map((item, index) => {
					const media = item.media;
					if (!media) return null;
					const localEdits = editedItems[item.id] || {
						caption: item.caption || "",
						alt_text: item.alt_text || ""
					};
					const hasChanges = localEdits.caption !== (item.caption || "") || localEdits.alt_text !== (item.alt_text || "");
					const isSaving = savingItemIds[item.id] || false;
					return /* @__PURE__ */ jsxs("div", {
						draggable: true,
						onDragStart: (e) => handleDragStart(e, index),
						onDragOver: (e) => e.preventDefault(),
						onDrop: (e) => handleDrop(e, index),
						className: `group bg-slate-50 dark:bg-slate-950/40 border border-slate-250 dark:border-slate-850 rounded-xl overflow-hidden flex flex-col relative transition-all duration-200 ${draggedIndex === index ? "opacity-40 scale-95 border-accentBlue" : ""}`,
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "absolute top-2 left-2 cursor-grab active:cursor-grabbing p-1 bg-white dark:bg-slate-900/90 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100 z-10",
								children: /* @__PURE__ */ jsx(GripVertical, { className: "w-3.5 h-3.5" })
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: (e) => {
									e.preventDefault();
									handleDetach(item.media_id);
								},
								className: "absolute top-2 right-2 p-1 bg-dangerRed/80 hover:bg-dangerRed text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md",
								title: "Remove from gallery",
								children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "aspect-video bg-black flex items-center justify-center relative select-none",
								children: [
									/* @__PURE__ */ jsx("img", {
										src: getFullUrl(media.thumbnail_url || media.url),
										alt: media.file_name,
										className: "object-cover w-full h-full",
										onError: (e) => {
											e.target.src = "https://placehold.co/600x400/0f172a/94a3b8?text=Image";
										}
									}),
									media.type === "video" && /* @__PURE__ */ jsx("div", {
										className: "absolute inset-0 bg-black/40 flex items-center justify-center",
										children: /* @__PURE__ */ jsx(Film, { className: "w-8 h-8 text-accentBlue" })
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-slate-700",
										children: ["Order: ", item.sort_order]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-4 space-y-3 flex-1 flex flex-col justify-between",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "space-y-3",
									children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("span", {
										className: "text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-widest block font-bold truncate mb-1",
										children: [
											media.file_name,
											" (",
											formatBytes(media.file_size),
											")"
										]
									}) }), /* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-[10px] font-semibold text-slate-500 dark:text-gray-400 block mb-1",
											children: "Caption"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											value: localEdits.caption,
											onChange: (e) => handleFieldChange(item.id, "caption", e.target.value),
											placeholder: "Short description...",
											className: "w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue rounded px-2.5 py-1.5 text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none"
										})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-[10px] font-semibold text-slate-500 dark:text-gray-400 block mb-1",
											children: "Alt Text"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											value: localEdits.alt_text,
											onChange: (e) => handleFieldChange(item.id, "alt_text", e.target.value),
											placeholder: "Screen reader alt...",
											className: "w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue rounded px-2.5 py-1.5 text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none"
										})] })]
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: "pt-2 flex justify-end",
									children: hasChanges && /* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: (e) => {
											e.preventDefault();
											handleSaveDetails(item);
										},
										disabled: isSaving,
										className: "flex items-center gap-1 bg-successGreen hover:bg-successGreen/90 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded transition-all",
										children: [isSaving ? /* @__PURE__ */ jsx(Loader, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Save Details" })]
									})
								})]
							})
						]
					}, item.id);
				}), /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setPickerOpen(true),
					className: "border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-accentBlue/50 hover:bg-accentBlue/5 rounded-xl aspect-video flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 hover:text-accentBlue transition-all cursor-pointer min-h-[220px]",
					children: [/* @__PURE__ */ jsx("div", {
						className: "p-3 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-2",
						children: /* @__PURE__ */ jsx(Plus, { className: "w-6 h-6" })
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs font-semibold",
						children: "Add Media File"
					})]
				})]
			}),
			pickerOpen && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-slate-850 dark:text-gray-200",
								children: "Select Media files"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-gray-500 mt-0.5",
								children: "Choose files from media library or upload new files."
							})] }), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: (e) => {
									e.preventDefault();
									setPickerOpen(false);
									setSelectedMediaIds([]);
								},
								className: "text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors",
								children: /* @__PURE__ */ jsx(X, { className: "w-6 h-6" })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-950/20 flex flex-wrap items-center justify-between gap-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "relative",
									children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ jsx("input", {
										type: "text",
										placeholder: "Search by name...",
										value: pickerSearch,
										onChange: (e) => setPickerSearch(e.target.value),
										className: "pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-650 focus:outline-none focus:border-accentBlue w-48"
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 border border-slate-200 dark:border-slate-800 text-xs",
									children: [
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => {
												setPickerType("all");
												setPickerPage(1);
											},
											className: `px-3 py-1.5 rounded-lg ${pickerType === "all" ? "bg-white dark:bg-slate-800 text-accentBlue dark:text-white font-medium shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-850"}`,
											children: "All"
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => {
												setPickerType("image");
												setPickerPage(1);
											},
											className: `px-3 py-1.5 rounded-lg flex items-center gap-1 ${pickerType === "image" ? "bg-white dark:bg-slate-800 text-accentBlue dark:text-white font-medium shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-850"}`,
											children: [/* @__PURE__ */ jsx(Image, { className: "w-3 h-3" }), "Images"]
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => {
												setPickerType("video");
												setPickerPage(1);
											},
											className: `px-3 py-1.5 rounded-lg flex items-center gap-1 ${pickerType === "video" ? "bg-white dark:bg-slate-800 text-accentBlue dark:text-white font-medium shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-850"}`,
											children: [/* @__PURE__ */ jsx(Film, { className: "w-3 h-3" }), "Videos"]
										})
									]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: handlePickerUploadClick,
									disabled: uploadingInPicker,
									className: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-50",
									children: [uploadingInPicker ? /* @__PURE__ */ jsx(Loader, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Upload new" })]
								}), /* @__PURE__ */ jsx("input", {
									type: "file",
									ref: fileInputRef,
									onChange: handlePickerFileChange,
									accept: "image/*,video/mp4,video/webm",
									multiple: true,
									className: "hidden"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 flex-1 overflow-y-auto min-h-[300px]",
							children: [pickerLoading ? /* @__PURE__ */ jsx("div", {
								className: "flex items-center justify-center py-24",
								children: /* @__PURE__ */ jsx(Loader, { className: "w-8 h-8 text-accentBlue animate-spin" })
							}) : filteredMediaList.length === 0 ? /* @__PURE__ */ jsx("div", {
								className: "text-center py-24 text-gray-500",
								children: "No media assets found in library."
							}) : /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4",
								children: filteredMediaList.map((media) => {
									const isSelected = selectedMediaIds.includes(media.id);
									const isProcessing = media.status === "processing";
									return /* @__PURE__ */ jsxs("div", {
										onClick: () => !isProcessing && togglePickerSelection(media.id),
										className: `group border rounded-xl overflow-hidden aspect-square relative bg-slate-950 flex flex-col cursor-pointer transition-all ${isSelected ? "border-accentBlue ring-2 ring-accentBlue/30 scale-95" : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"}`,
										children: [isProcessing ? /* @__PURE__ */ jsxs("div", {
											className: "flex-1 flex flex-col items-center justify-center p-2 text-center",
											children: [/* @__PURE__ */ jsx(Loader, { className: "w-6 h-6 text-accentBlue animate-spin mb-1" }), /* @__PURE__ */ jsx("span", {
												className: "text-[8px] text-gray-500 uppercase tracking-widest font-semibold",
												children: "Wait..."
											})]
										}) : /* @__PURE__ */ jsxs("div", {
											className: "flex-1 relative overflow-hidden flex items-center justify-center",
											children: [
												/* @__PURE__ */ jsx("img", {
													src: getFullUrl(media.thumbnail_url || media.url),
													alt: media.file_name,
													className: "object-cover w-full h-full",
													onError: (e) => {
														e.target.src = "https://placehold.co/150/0f172a/94a3b8?text=File";
													}
												}),
												media.type === "video" && /* @__PURE__ */ jsx("div", {
													className: "absolute inset-0 bg-black/35 flex items-center justify-center",
													children: /* @__PURE__ */ jsx(Play, { className: "w-5 h-5 fill-current text-white" })
												}),
												isSelected && /* @__PURE__ */ jsx("div", {
													className: "absolute top-1.5 right-1.5 bg-accentBlue text-white rounded-full p-1 shadow-md",
													children: /* @__PURE__ */ jsx(Check, { className: "w-3 h-3" })
												}),
												/* @__PURE__ */ jsx("span", {
													className: "absolute bottom-1 left-1 px-1 py-0.5 rounded text-[7px] font-bold uppercase bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-gray-300 border border-slate-250 dark:border-slate-700",
													children: media.type
												})
											]
										}), /* @__PURE__ */ jsx("div", {
											className: "p-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-550 dark:text-gray-400 truncate text-center font-medium",
											children: media.file_name
										})]
									}, media.id);
								})
							}), pickerTotalPages > 1 && /* @__PURE__ */ jsxs("div", {
								className: "flex justify-center gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/60",
								children: [
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setPickerPage((p) => Math.max(p - 1, 1)),
										disabled: pickerPage === 1,
										className: "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-xs font-semibold rounded-lg dark:hover:bg-slate-750 disabled:opacity-50 transition-colors",
										children: "Previous"
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "text-xs text-slate-500 dark:text-gray-400 self-center",
										children: [
											"Page ",
											pickerPage,
											" of ",
											pickerTotalPages
										]
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setPickerPage((p) => Math.min(p + 1, pickerTotalPages)),
										disabled: pickerPage === pickerTotalPages,
										className: "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-xs font-semibold rounded-lg dark:hover:bg-slate-750 disabled:opacity-50 transition-colors",
										children: "Next"
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/40 flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-xs text-slate-500",
								children: [selectedMediaIds.length, " item(s) selected"]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => {
										setPickerOpen(false);
										setSelectedMediaIds([]);
									},
									className: "px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-650 hover:text-slate-850 dark:text-gray-300 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors",
									children: "Cancel"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: (e) => {
										e.preventDefault();
										handleAttachSelected();
									},
									disabled: selectedMediaIds.length === 0,
									className: "px-4 py-2 bg-gradient-to-r from-accentBlue to-accentPurple text-white text-xs font-semibold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-md shadow-accentBlue/10",
									children: "Add to Gallery"
								})]
							})]
						})
					]
				})
			})
		]
	});
};
//#endregion
//#region src/pages/PostEditor.tsx
async function loader() {
	return null;
}
var PostEditor = () => {
	const { t } = useLanguage();
	const { id } = useParams();
	const isEdit = !!id;
	const navigate = useNavigate();
	const { showSuccess, showError } = useToast();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [showMediaModal, setShowMediaModal] = useState(false);
	const [mediaTarget, setMediaTarget] = useState(null);
	const [mediaList, setMediaList] = useState([]);
	const [selectedCover, setSelectedCover] = useState(null);
	const [selectedPDF, setSelectedPDF] = useState(null);
	const [allCategories, setAllCategories] = useState([]);
	const [allTags, setAllTags] = useState([]);
	const [titleVal, setTitleVal] = useState("");
	const [slugVal, setSlugVal] = useState("");
	const [excerptVal, setExcerptVal] = useState("");
	const [metaTitleVal, setMetaTitleVal] = useState("");
	const [metaDescVal, setMetaDescVal] = useState("");
	const [isDocVal, setIsDocVal] = useState(false);
	const [translating, setTranslating] = useState(false);
	const [translateProgressText, setTranslateProgressText] = useState("");
	const [aiModalVisible, setAiModalVisible] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [aiTopic, setAiTopic] = useState("");
	const [summarizing, setSummarizing] = useState(false);
	const translateText = async (text, targetLang) => {
		if (!text || !text.trim()) return "";
		const res = await translateService.translate({
			content: text,
			target_lang: targetLang
		});
		if (!res.success || !res.data) throw new Error(res.message || "Translation failed");
		const result = res.data;
		if (result.job_id) {
			const jobId = result.job_id;
			return new Promise((resolve, reject) => {
				const interval = setInterval(async () => {
					try {
						const pollRes = await translateService.pollJob(jobId);
						if (pollRes.success && pollRes.data) {
							if (pollRes.data.status === "done") {
								clearInterval(interval);
								resolve(pollRes.data.translated_text || "");
							} else if (pollRes.data.status === "failed") {
								clearInterval(interval);
								reject(new Error(pollRes.data.error || "Async translation job failed"));
							}
						}
					} catch (err) {}
				}, 2e3);
			});
		}
		return result.translated_text;
	};
	const handleAutoTranslate = async () => {
		const values = form.getFieldsValue();
		const titleVi = values.title;
		const excerptVi = values.excerpt;
		const contentVi = values.content;
		if (!titleVi && !excerptVi && !contentVi) {
			showError(t("fill_fields") || "Vui lòng nhập nội dung Tiếng Việt trước khi dịch.");
			return;
		}
		setTranslating(true);
		try {
			if (titleVi) {
				setTranslateProgressText(t("table_title") || "Tiêu đề");
				const titleEn = await translateText(titleVi, "en");
				form.setFieldsValue({ title_en: titleEn });
			}
			if (excerptVi) {
				setTranslateProgressText(t("editor_excerpt_label") || "Tóm tắt");
				const excerptEn = await translateText(excerptVi, "en");
				form.setFieldsValue({ excerpt_en: excerptEn });
			}
			if (contentVi) {
				setTranslateProgressText(t("editor_content_label") || "Nội dung");
				const contentEn = await translateText(contentVi, "en");
				form.setFieldsValue({ content_en: contentEn });
			}
			showSuccess(t("editor_translate_success") || "Đã dịch tự động sang Tiếng Anh thành công!");
		} catch (err) {
			console.error(err);
			showError((t("editor_translate_error") || "Gặp lỗi khi dịch tự động: ") + (err.message || err.toString()));
		} finally {
			setTranslating(false);
			setTranslateProgressText("");
		}
	};
	const handleAIGenerate = async () => {
		if (!aiTopic.trim()) {
			showError("Vui lòng nhập chủ đề bài viết!");
			return;
		}
		setGenerating(true);
		try {
			const res = await aiService.generatePost(aiTopic);
			if (res.success && res.data) {
				const postData = res.data;
				form.setFieldsValue({
					title: postData.title_vi,
					title_en: postData.title_en,
					content: postData.content_vi,
					content_en: postData.content_en,
					meta_title: postData.meta_title_vi,
					meta_desc: postData.meta_desc_vi,
					excerpt: postData.excerpt_vi,
					excerpt_en: postData.excerpt_en
				});
				setTitleVal(postData.title_vi);
				setExcerptVal(postData.excerpt_vi);
				setMetaTitleVal(postData.meta_title_vi);
				setMetaDescVal(postData.meta_desc_vi);
				if (postData.suggested_tags && postData.suggested_tags.length > 0) {
					const matchedTagIds = [];
					postData.suggested_tags.forEach((tagName) => {
						const matched = allTags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
						if (matched) matchedTagIds.push(matched.id);
					});
					if (matchedTagIds.length > 0) form.setFieldsValue({ tag_ids: matchedTagIds });
				}
				showSuccess("Tạo bài viết nháp thành công bằng AI!");
				setAiModalVisible(false);
				setAiTopic("");
			} else showError(res.message || "Không thể tạo bài viết.");
		} catch (err) {
			console.error(err);
			showError("Gặp lỗi khi tạo bài viết bằng AI: " + (err.response?.data?.message || err.message || err.toString()));
		} finally {
			setGenerating(false);
		}
	};
	const handleAISummarize = async () => {
		const contentVi = form.getFieldsValue().content;
		if (!contentVi || !contentVi.trim()) {
			showError("Cần có nội dung Tiếng Việt để tóm tắt!");
			return;
		}
		setSummarizing(true);
		try {
			const res = await aiService.summarize(contentVi, "both");
			if (res.success && res.data) {
				form.setFieldsValue({
					excerpt: res.data.summary,
					excerpt_en: res.data.summary_en || ""
				});
				setExcerptVal(res.data.summary);
				showSuccess("Đã tóm tắt nội dung bằng AI thành công!");
			} else showError(res.message || "Không thể tóm tắt nội dung.");
		} catch (err) {
			console.error(err);
			showError("Gặp lỗi khi tóm tắt: " + (err.response?.data?.message || err.message || err.toString()));
		} finally {
			setSummarizing(false);
		}
	};
	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const [catRes, tagRes] = await Promise.all([categoryService.list(), tagService.list()]);
				setAllCategories(catRes.data || []);
				setAllTags(tagRes.data || []);
			} catch (err) {
				console.error("Failed to load filters options", err);
			}
		};
		fetchOptions();
	}, []);
	useEffect(() => {
		if (isEdit) {
			const loadPost = async () => {
				setFetching(true);
				try {
					const post = (await postService.detail(Number(id))).data;
					form.setFieldsValue({
						title: post.title,
						title_en: post.title_en || "",
						slug: post.slug,
						slug_en: post.slug_en || "",
						excerpt: post.excerpt || "",
						excerpt_en: post.excerpt_en || "",
						content: post.content || "",
						content_en: post.content_en || "",
						status: post.status,
						cover_media_id: post.cover_media_id || void 0,
						is_featured: post.is_featured || false,
						is_document: post.is_document || false,
						pdf_media_id: post.pdf_media_id || void 0,
						meta_title: post.meta_title || "",
						meta_desc: post.meta_desc || "",
						published_at: post.published_at ? dayjs(post.published_at) : null,
						category_ids: post.categories?.map((c) => c.id) || [],
						tag_ids: post.tags?.map((t) => t.id) || []
					});
					setTitleVal(post.title || "");
					setSlugVal(post.slug || "");
					setExcerptVal(post.excerpt || "");
					setMetaTitleVal(post.meta_title || "");
					setMetaDescVal(post.meta_desc || "");
					setIsDocVal(post.is_document || false);
					if (post.cover_media) setSelectedCover(post.cover_media);
					if (post.pdf_media) setSelectedPDF(post.pdf_media);
				} catch (err) {
					console.error(err);
					showError("Failed to load post details.");
					navigate("/admin/posts");
				} finally {
					setFetching(false);
				}
			};
			loadPost();
		}
	}, [
		id,
		isEdit,
		form,
		navigate
	]);
	const loadMedia = async () => {
		try {
			const res = await mediaService.list({ limit: 100 });
			setMediaList(res.data?.items || res.data || []);
		} catch (err) {
			console.error(err);
		}
	};
	const openMediaPicker = (target) => {
		setMediaTarget(target);
		loadMedia();
		setShowMediaModal(true);
	};
	const handleSelectMedia = (media) => {
		if (mediaTarget === "cover") {
			setSelectedCover(media);
			form.setFieldsValue({ cover_media_id: media.id });
		} else if (mediaTarget === "pdf") {
			setSelectedPDF(media);
			form.setFieldsValue({ pdf_media_id: media.id });
		}
		setShowMediaModal(false);
		setMediaTarget(null);
	};
	const removeMedia = (target) => {
		if (target === "cover") {
			setSelectedCover(null);
			form.setFieldsValue({ cover_media_id: void 0 });
		} else if (target === "pdf") {
			setSelectedPDF(null);
			form.setFieldsValue({ pdf_media_id: void 0 });
		}
	};
	const onFinish = async (values) => {
		setLoading(true);
		const payload = {
			...values,
			published_at: values.published_at ? values.published_at.toISOString() : null,
			cover_media_id: values.cover_media_id || null,
			pdf_media_id: values.pdf_media_id || null
		};
		try {
			if (isEdit) {
				await postService.update(Number(id), payload);
				showSuccess("Post updated successfully.");
			} else {
				await postService.create(payload);
				showSuccess("Post created successfully.");
			}
			navigate("/admin/posts");
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to save post.");
		} finally {
			setLoading(false);
		}
	};
	if (fetching) return /* @__PURE__ */ jsx("div", {
		className: "flex h-64 items-center justify-center",
		children: /* @__PURE__ */ jsx(Spin, {
			size: "large",
			tip: "Loading post details..."
		})
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-5 select-none",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-3",
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/admin/posts",
						className: "p-2 rounded-lg bg-slate-900/60 hover:bg-slate-950 text-gray-400 hover:text-white border border-slate-800 transition-colors",
						children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
						className: "text-xl font-black text-slate-900 dark:text-white tracking-tight",
						children: isEdit ? t("editor_edit_title") : t("editor_create_title")
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-500 mt-1",
						children: "Viết, tối ưu hóa SEO và quản lý các loại bài đăng."
					})] })]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex items-center space-x-3",
					children: /* @__PURE__ */ jsx(Button, {
						type: "primary",
						onClick: () => setAiModalVisible(true),
						icon: /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
						className: "bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 border-0 rounded-xl flex items-center gap-1.5 h-10 text-sm font-bold shadow-md shadow-accentBlue/10",
						children: "Generate with AI"
					})
				})]
			}),
			/* @__PURE__ */ jsx(Form, {
				form,
				layout: "vertical",
				onFinish,
				requiredMark: false,
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-2 space-y-6",
						children: [
							/* @__PURE__ */ jsx(Card, {
								className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
								children: /* @__PURE__ */ jsxs(Tabs, {
									defaultActiveKey: "vi",
									className: "border-b border-slate-200 dark:border-slate-800/60 mb-4",
									children: [/* @__PURE__ */ jsx(Tabs.TabPane, {
										tab: t("editor_vietnamese_tab"),
										children: /* @__PURE__ */ jsxs("div", {
											className: "space-y-4 pt-2",
											children: [
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsx("span", {
														className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
														children: t("editor_title_vi")
													}),
													name: "title",
													rules: [{
														required: true,
														message: "Please input Vietnamese title!"
													}],
													children: /* @__PURE__ */ jsx(Input, {
														placeholder: "Nhập tiêu đề tiếng Việt...",
														className: "h-10 rounded-xl",
														onChange: (e) => setTitleVal(e.target.value)
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsxs("div", {
														className: "flex flex-col",
														children: [/* @__PURE__ */ jsx("span", {
															className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
															children: t("editor_slug_vi")
														}), /* @__PURE__ */ jsx("span", {
															className: "text-[10px] text-gray-500 font-normal",
															children: "Tự động tạo từ tiêu đề nếu để trống"
														})]
													}),
													name: "slug",
													children: /* @__PURE__ */ jsx(Input, {
														placeholder: "e.g. kien-truc-microservices",
														className: "h-10 rounded-xl font-mono text-sm",
														onChange: (e) => setSlugVal(e.target.value)
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsxs("div", {
														className: "flex justify-between items-center w-full",
														children: [/* @__PURE__ */ jsx("span", {
															className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
															children: t("editor_excerpt_vi")
														}), /* @__PURE__ */ jsx(Button, {
															type: "text",
															size: "small",
															loading: summarizing,
															onClick: handleAISummarize,
															icon: /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5 text-accentBlue" }),
															className: "text-accentBlue hover:text-accentPurple text-xs flex items-center gap-1 p-0 h-auto font-bold",
															children: "AI Summarize"
														})]
													}),
													name: "excerpt",
													children: /* @__PURE__ */ jsx(Input.TextArea, {
														rows: 2,
														placeholder: "Tóm tắt ngắn hiển thị tại trang chủ...",
														className: "rounded-xl resize-none text-sm",
														onChange: (e) => setExcerptVal(e.target.value)
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsx("span", {
														className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
														children: t("editor_content_vi")
													}),
													name: "content",
													children: /* @__PURE__ */ jsx(RichTextEditor, {
														value: form.getFieldValue("content") || "",
														onChange: (val) => form.setFieldsValue({ content: val })
													})
												})
											]
										})
									}, "vi"), /* @__PURE__ */ jsx(Tabs.TabPane, {
										tab: t("editor_english_tab"),
										children: /* @__PURE__ */ jsxs("div", {
											className: "space-y-4 pt-2",
											children: [
												/* @__PURE__ */ jsx("div", {
													className: "flex justify-end mb-2",
													children: /* @__PURE__ */ jsx(Button, {
														type: "dashed",
														loading: translating,
														onClick: handleAutoTranslate,
														icon: /* @__PURE__ */ jsx(Languages, { className: "w-4 h-4" }),
														className: "border-accentBlue text-accentBlue hover:text-accentBlue/80 hover:border-accentBlue/80 rounded-xl flex items-center gap-1.5",
														children: translating ? `${t("editor_translating")} (${translateProgressText})...` : t("editor_auto_translate")
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsx("span", {
														className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
														children: t("editor_title_en")
													}),
													name: "title_en",
													children: /* @__PURE__ */ jsx(Input, {
														placeholder: "Enter English title...",
														className: "h-10 rounded-xl"
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsxs("div", {
														className: "flex flex-col",
														children: [/* @__PURE__ */ jsx("span", {
															className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
															children: t("editor_slug_en")
														}), /* @__PURE__ */ jsx("span", {
															className: "text-[10px] text-gray-500 font-normal",
															children: "Auto-generated from EN title if left empty"
														})]
													}),
													name: "slug_en",
													children: /* @__PURE__ */ jsx(Input, {
														placeholder: "e.g. microservices-architecture",
														className: "h-10 rounded-xl font-mono text-sm"
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsx("span", {
														className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
														children: t("editor_excerpt_en")
													}),
													name: "excerpt_en",
													children: /* @__PURE__ */ jsx(Input.TextArea, {
														rows: 2,
														placeholder: "English summary...",
														className: "rounded-xl resize-none text-sm"
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsx("span", {
														className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
														children: t("editor_content_en")
													}),
													name: "content_en",
													children: /* @__PURE__ */ jsx(RichTextEditor, {
														value: form.getFieldValue("content_en") || "",
														onChange: (val) => form.setFieldsValue({ content_en: val })
													})
												})
											]
										})
									}, "en")]
								})
							}),
							isEdit && /* @__PURE__ */ jsxs(Card, {
								className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-sm font-bold text-gray-400 uppercase tracking-wider mb-4",
									children: "Post Gallery Images"
								}), /* @__PURE__ */ jsx(GalleryUploader, { postId: Number(id) })]
							}),
							/* @__PURE__ */ jsx(Collapse, {
								ghost: true,
								expandIconPosition: "end",
								children: /* @__PURE__ */ jsx(Collapse.Panel, {
									header: /* @__PURE__ */ jsx("span", {
										className: "text-xs font-black text-slate-700 dark:text-gray-400 uppercase tracking-wider select-none",
										children: t("editor_seo_title")
									}),
									className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 mb-4 px-2",
									children: /* @__PURE__ */ jsxs("div", {
										className: "space-y-4 pt-3 select-none",
										children: [
											/* @__PURE__ */ jsx(Form.Item, {
												label: /* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
													children: "Meta Title"
												}),
												name: "meta_title",
												children: /* @__PURE__ */ jsx(Input, {
													placeholder: "Title for Google search...",
													className: "h-10 rounded-xl",
													onChange: (e) => setMetaTitleVal(e.target.value)
												})
											}),
											/* @__PURE__ */ jsx(Form.Item, {
												label: /* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
													children: "Meta Description"
												}),
												name: "meta_desc",
												children: /* @__PURE__ */ jsx(Input.TextArea, {
													rows: 3,
													placeholder: "Description snippet for Google search...",
													className: "rounded-xl resize-none text-sm",
													onChange: (e) => setMetaDescVal(e.target.value)
												})
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950/40",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-2",
													children: t("editor_google_preview")
												}), /* @__PURE__ */ jsxs("div", {
													className: "space-y-1",
													children: [
														/* @__PURE__ */ jsx("span", {
															className: "text-blue-500 dark:text-blue-400 text-sm font-semibold hover:underline block truncate",
															children: metaTitleVal || titleVal || "Google Search Display Title"
														}),
														/* @__PURE__ */ jsxs("span", {
															className: "text-green-600 dark:text-green-500 text-xs block truncate",
															children: ["https://blog.engine/posts/", slugVal || "example-slug"]
														}),
														/* @__PURE__ */ jsx("span", {
															className: "text-gray-500 text-xs block leading-relaxed line-clamp-2",
															children: metaDescVal || excerptVal || "This snippet will appear under the title in search engine results. Enter meta description to optimize it."
														})
													]
												})]
											})
										]
									})
								}, "seo")
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-6 select-none",
						children: [
							/* @__PURE__ */ jsxs(Card, {
								className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2",
									children: t("editor_publish_settings")
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: t("table_status")
											}),
											name: "status",
											children: /* @__PURE__ */ jsx(Select, {
												options: [{
													label: t("filter_published") || "Published",
													value: "published"
												}, {
													label: t("filter_draft") || "Draft",
													value: "draft"
												}],
												className: "h-10 rounded-xl"
											})
										}),
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: t("editor_schedule_label")
											}),
											name: "published_at",
											children: /* @__PURE__ */ jsx(DatePicker, {
												showTime: true,
												className: "w-full h-10 rounded-xl"
											})
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-slate-800 dark:text-gray-200",
													children: t("editor_featured_label")
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500 font-normal",
													children: "Show on the main landing slider"
												})]
											}), /* @__PURE__ */ jsx(Form.Item, {
												name: "is_featured",
												valuePropName: "checked",
												className: "mb-0",
												children: /* @__PURE__ */ jsx(Switch, {})
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-slate-800 dark:text-gray-200",
													children: t("editor_is_pdf")
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500 font-normal",
													children: "Attach a PDF file as document"
												})]
											}), /* @__PURE__ */ jsx(Form.Item, {
												name: "is_document",
												valuePropName: "checked",
												className: "mb-0",
												children: /* @__PURE__ */ jsx(Switch, { onChange: setIsDocVal })
											})]
										}),
										isDocVal && /* @__PURE__ */ jsxs("div", {
											className: "border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 animate-fade-in",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
													children: t("editor_pdf_attached")
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													name: "pdf_media_id",
													className: "hidden",
													children: /* @__PURE__ */ jsx(Input, {})
												}),
												selectedPDF ? /* @__PURE__ */ jsxs("div", {
													className: "flex items-center justify-between bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl",
													children: [/* @__PURE__ */ jsxs("div", {
														className: "flex items-center gap-2 text-red-500 truncate mr-2",
														children: [/* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ jsx("span", {
															className: "text-xs truncate font-bold",
															children: selectedPDF.file_name
														})]
													}), /* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => removeMedia("pdf"),
														className: "text-red-500 hover:text-red-750 p-1 hover:bg-red-500/10 rounded",
														children: /* @__PURE__ */ jsx(Trash, { className: "w-3.5 h-3.5" })
													})]
												}) : /* @__PURE__ */ jsxs(Button, {
													type: "dashed",
													onClick: () => openMediaPicker("pdf"),
													className: "w-full h-12 flex items-center justify-center gap-1.5 border-dashed border-red-500/35 hover:border-red-500 text-red-500 font-bold rounded-xl",
													children: [/* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }), t("editor_select_pdf")]
												})
											]
										})
									]
								})]
							}),
							/* @__PURE__ */ jsxs(Card, {
								className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
								children: [
									/* @__PURE__ */ jsx("h3", {
										className: "text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2",
										children: t("editor_cover_label")
									}),
									/* @__PURE__ */ jsx(Form.Item, {
										name: "cover_media_id",
										className: "hidden",
										children: /* @__PURE__ */ jsx(Input, {})
									}),
									selectedCover ? /* @__PURE__ */ jsx("div", {
										className: "space-y-2",
										children: /* @__PURE__ */ jsxs("div", {
											className: "w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group",
											children: [/* @__PURE__ */ jsx("img", {
												src: getFullUrl(selectedCover.url),
												alt: "Cover preview",
												className: "w-full h-full object-cover"
											}), /* @__PURE__ */ jsx("div", {
												className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
												children: /* @__PURE__ */ jsx(Button, {
													type: "text",
													danger: true,
													icon: /* @__PURE__ */ jsx(Trash, { className: "w-4 h-4" }),
													onClick: () => removeMedia("cover"),
													className: "bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/30 rounded-xl",
													children: t("editor_remove_cover")
												})
											})]
										})
									}) : /* @__PURE__ */ jsxs(Button, {
										type: "dashed",
										onClick: () => openMediaPicker("cover"),
										className: "w-full aspect-[16/10] flex flex-col items-center justify-center gap-2 border-dashed border-slate-700/60 text-gray-400 hover:text-white rounded-xl",
										children: [/* @__PURE__ */ jsx(Image, { className: "w-6 h-6 text-gray-500" }), /* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold",
											children: t("editor_pick_cover")
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs(Card, {
								className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2",
									children: t("editor_taxonomy")
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ jsx(Form.Item, {
										label: /* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
											children: t("categories")
										}),
										name: "category_ids",
										children: /* @__PURE__ */ jsx(Select, {
											mode: "multiple",
											placeholder: "Select Categories",
											options: allCategories.map((c) => ({
												value: c.id,
												label: c.name
											})),
											className: "w-full rounded-xl",
											popupClassName: "dark:bg-slate-900 border dark:border-slate-850"
										})
									}), /* @__PURE__ */ jsx(Form.Item, {
										label: /* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
											children: t("tags")
										}),
										name: "tag_ids",
										children: /* @__PURE__ */ jsx(Select, {
											mode: "multiple",
											placeholder: "Select or Create Tags",
											options: allTags.map((t) => ({
												value: t.id,
												label: t.name
											})),
											onSearch: () => {},
											className: "w-full rounded-xl",
											popupClassName: "dark:bg-slate-900 border dark:border-slate-850",
											onDeselect: () => {},
											onSelect: () => {},
											dropdownRender: (menu) => /* @__PURE__ */ jsxs("div", { children: [menu, /* @__PURE__ */ jsx("div", {
												className: "border-t border-slate-200 dark:border-slate-800/60 p-2 flex items-center justify-between",
												children: /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500",
													children: "Type in tag search input to create tags directly"
												})
											})] })
										})
									})]
								})]
							}),
							/* @__PURE__ */ jsx(Button, {
								type: "primary",
								htmlType: "submit",
								loading,
								icon: /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
								className: "w-full bg-btn-global hover:brightness-110 border-0 h-11 rounded-xl font-bold flex items-center justify-center gap-1.5 text-white shadow-lg shadow-accentBlue/10",
								children: isEdit ? t("save_changes") : t("editor_save")
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx(Modal, {
				title: /* @__PURE__ */ jsx("span", {
					className: "font-extrabold text-slate-800 dark:text-white select-none",
					children: "Select Media Item"
				}),
				open: showMediaModal,
				onCancel: () => {
					setShowMediaModal(false);
					setMediaTarget(null);
				},
				footer: null,
				width: 750,
				className: "select-none",
				children: /* @__PURE__ */ jsx("div", {
					className: "py-4 select-none",
					children: /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[420px] overflow-y-auto pr-1",
						children: mediaList.length === 0 ? /* @__PURE__ */ jsx("div", {
							className: "col-span-full py-12 text-center text-gray-500 font-medium text-xs",
							children: "No media uploads found in library."
						}) : mediaList.filter((m) => mediaTarget === "pdf" ? m.mime_type === "application/pdf" : m.type === "image").map((m) => /* @__PURE__ */ jsx("div", {
							onClick: () => handleSelectMedia(m),
							className: "aspect-[1:1] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 cursor-pointer hover:border-accentBlue transition-colors flex items-center justify-center p-1 group",
							children: m.mime_type === "application/pdf" ? /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center justify-center text-red-500 gap-1.5 w-full h-full p-2",
								children: [/* @__PURE__ */ jsx(FileText, { className: "w-8 h-8 group-hover:scale-105 transition-transform" }), /* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-gray-400 text-center truncate w-full font-bold",
									children: m.file_name
								})]
							}) : /* @__PURE__ */ jsx("img", {
								src: getFullUrl(m.thumbnail_url || m.url),
								alt: "",
								className: "w-full h-full object-cover rounded-md group-hover:scale-102 transition-transform"
							})
						}, m.id))
					})
				})
			}),
			/* @__PURE__ */ jsx(Modal, {
				title: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5 font-black text-slate-800 dark:text-white",
					children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-accentBlue" }), /* @__PURE__ */ jsx("span", { children: "Sinh bài viết tự động với AI" })]
				}),
				open: aiModalVisible,
				onCancel: () => {
					if (!generating) {
						setAiModalVisible(false);
						setAiTopic("");
					}
				},
				footer: [/* @__PURE__ */ jsx(Button, {
					disabled: generating,
					onClick: () => setAiModalVisible(false),
					children: "Hủy"
				}, "cancel"), /* @__PURE__ */ jsx(Button, {
					type: "primary",
					loading: generating,
					onClick: handleAIGenerate,
					className: "bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 border-0",
					children: "Tạo bài viết"
				}, "submit")],
				width: 500,
				children: /* @__PURE__ */ jsxs("div", {
					className: "py-4 space-y-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-500 leading-relaxed",
						children: "Nhập chủ đề bạn muốn viết. AI sẽ tự động sinh tiêu đề, nội dung chi tiết dạng HTML, mô tả SEO và đề xuất thẻ bằng cả tiếng Việt và tiếng Anh."
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2",
						children: "Chủ đề bài viết"
					}), /* @__PURE__ */ jsx(Input.TextArea, {
						rows: 4,
						value: aiTopic,
						disabled: generating,
						onChange: (e) => setAiTopic(e.target.value),
						placeholder: "e.g. Hướng dẫn thiết lập CI/CD pipeline với GitHub Actions và deploy lên Kubernetes...",
						className: "rounded-xl text-sm"
					})] })]
				})
			})
		]
	});
};
var PostEditor_default = UNSAFE_withComponentProps(PostEditor);
//#endregion
export { PostEditor_default as default, loader };
