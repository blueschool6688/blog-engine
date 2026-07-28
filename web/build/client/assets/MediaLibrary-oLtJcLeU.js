import { c as getFullUrl, l as mediaService } from "./api-DYEteWSp.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { t as ConfirmModal } from "./ConfirmModal-v1UHWXWR.js";
import { UNSAFE_withComponentProps } from "react-router";
import { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Eye, FileText, Film, Image, Loader, Play, RefreshCw, Search, Trash2, Upload, X } from "lucide-react";
//#region src/pages/MediaLibrary.tsx
async function loader() {
	return null;
}
var MediaLibrary = () => {
	const [mediaList, setMediaList] = useState([]);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [typeFilter, setTypeFilter] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const limit = 12;
	const [previewMedia, setPreviewMedia] = useState(null);
	const [deleteMedia, setDeleteMedia] = useState(null);
	const { showSuccess, showError, showWarning } = useToast();
	const fileInputRef = useRef(null);
	const [PDFViewer, setPDFViewer] = useState(null);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxSlides, setLightboxSlides] = useState([]);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [Lightbox, setLightbox] = useState(null);
	const [ZoomPlugin, setZoomPlugin] = useState(null);
	const [VideoPlugin, setVideoPlugin] = useState(null);
	useEffect(() => {
		import("./PDFViewer-CdnduC5o.js").then((mod) => {
			setPDFViewer(() => mod.PDFViewer);
		});
		Promise.all([
			import("yet-another-react-lightbox"),
			import("yet-another-react-lightbox/plugins/zoom"),
			import("yet-another-react-lightbox/plugins/video"),
			Promise.resolve({           })
		]).then(([lightboxMod, zoomMod, videoMod]) => {
			setLightbox(() => lightboxMod.default);
			setZoomPlugin(() => zoomMod.default);
			setVideoPlugin(() => videoMod.default);
		});
	}, []);
	const fetchMedia = async () => {
		setLoading(true);
		try {
			const responseData = (await mediaService.list({
				type: typeFilter,
				page,
				limit
			})).data;
			if (responseData && typeof responseData === "object" && "items" in responseData) {
				setMediaList(responseData.items || []);
				setTotal(responseData.total || 0);
			} else if (Array.isArray(responseData)) {
				setMediaList(responseData);
				setTotal(responseData.length);
			}
		} catch (err) {
			console.error("Failed to load media library", err);
			showError("Failed to load media library");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchMedia();
	}, [typeFilter, page]);
	const handleFileUpload = async (e) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		setUploading(true);
		let successCount = 0;
		let failCount = 0;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const isImage = file.type.startsWith("image/");
			const isVideo = file.type === "video/mp4" || file.type === "video/webm";
			const isDoc = file.type === "application/pdf" || file.type === "text/plain" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/vnd.ms-excel" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
			if (!isImage && !isVideo && !isDoc) {
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
			if (isDoc && file.size > 50 * 1024 * 1024) {
				showWarning(`Document file exceeds 50MB limit: ${file.name}`);
				continue;
			}
			try {
				await mediaService.upload(file);
				successCount++;
			} catch (err) {
				console.error("Failed to upload", file.name, err);
				failCount++;
			}
		}
		if (successCount > 0) {
			showSuccess(`Successfully uploaded ${successCount} files`);
			setPage(1);
			fetchMedia();
		}
		if (failCount > 0) showError(`Failed to upload ${failCount} files`);
		setUploading(false);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};
	const confirmDelete = async () => {
		if (!deleteMedia) return;
		try {
			await mediaService.delete(deleteMedia.id);
			showSuccess("Media file deleted successfully");
			setMediaList(mediaList.filter((m) => m.id !== deleteMedia.id));
		} catch (err) {
			console.error("Failed to delete media", err);
			if (err.response?.status === 409) showError("Conflict: Media is currently in use as a cover or in a post gallery and cannot be deleted.");
			else showError(err.response?.data?.message || "Failed to delete media file");
		} finally {
			setDeleteMedia(null);
		}
	};
	const handleDragOver = (e) => {
		e.preventDefault();
	};
	const handleDrop = async (e) => {
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
			showError("Failed to upload some files");
		} finally {
			setUploading(false);
		}
	};
	const filteredMediaList = mediaList.filter((media) => media.file_name.toLowerCase().includes(searchQuery.toLowerCase()));
	const handlePreviewMedia = (media) => {
		if (media.type === "document" || media.mime_type === "application/pdf") setPreviewMedia(media);
		else {
			const mediaSlides = filteredMediaList.filter((m) => m.type === "image" || m.type === "video").map((m) => {
				if (m.type === "video") return {
					type: "video",
					sources: [{
						src: getFullUrl(m.url),
						type: m.mime_type || "video/mp4"
					}]
				};
				return { src: getFullUrl(m.url) };
			});
			const clickedIndex = filteredMediaList.filter((m) => m.type === "image" || m.type === "video").findIndex((m) => m.id === media.id);
			setLightboxSlides(mediaSlides);
			setLightboxIndex(clickedIndex >= 0 ? clickedIndex : 0);
			setLightboxOpen(true);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx(ConfirmModal, {
				isOpen: deleteMedia !== null,
				title: "Delete Media File",
				message: `Are you sure you want to delete "${deleteMedia?.file_name}"? This file will be permanently deleted from the disk and cannot be recovered.`,
				onConfirm: confirmDelete,
				onCancel: () => setDeleteMedia(null)
			}),
			previewMedia && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm",
				children: /* @__PURE__ */ jsxs("div", {
					className: "relative max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xl flex flex-col space-y-4 animate-scale-up",
					children: [
						/* @__PURE__ */ jsx("button", {
							onClick: () => setPreviewMedia(null),
							className: "absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all",
							children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "text-base font-bold text-slate-850 dark:text-white pr-12 truncate",
							children: previewMedia.file_name
						}),
						/* @__PURE__ */ jsx("div", {
							className: "w-full h-[60vh] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/30",
							children: previewMedia.type === "video" ? /* @__PURE__ */ jsx("video", {
								src: getFullUrl(previewMedia.url),
								controls: true,
								autoPlay: true,
								className: "max-w-full max-h-full"
							}) : previewMedia.type === "document" || previewMedia.mime_type === "application/pdf" ? PDFViewer ? /* @__PURE__ */ jsx(PDFViewer, {
								url: getFullUrl(previewMedia.url),
								fileName: previewMedia.file_name
							}) : /* @__PURE__ */ jsx("div", {
								className: "text-xs text-gray-500 py-4 text-center",
								children: "Loading viewer component..."
							}) : /* @__PURE__ */ jsx("img", {
								src: getFullUrl(previewMedia.url),
								alt: previewMedia.file_name,
								className: "object-contain max-w-full max-h-full"
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4 pt-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex gap-4",
								children: [
									/* @__PURE__ */ jsxs("span", { children: ["Type: ", /* @__PURE__ */ jsx("strong", {
										className: "text-slate-700 dark:text-gray-300 capitalize",
										children: previewMedia.type
									})] }),
									/* @__PURE__ */ jsxs("span", { children: ["Size: ", /* @__PURE__ */ jsxs("strong", {
										className: "text-slate-700 dark:text-gray-300",
										children: [(previewMedia.file_size / (1024 * 1024)).toFixed(2), " MB"]
									})] }),
									previewMedia.resolution && /* @__PURE__ */ jsxs("span", { children: ["Resolution: ", /* @__PURE__ */ jsx("strong", {
										className: "text-slate-700 dark:text-gray-300",
										children: previewMedia.resolution
									})] }),
									previewMedia.duration ? /* @__PURE__ */ jsxs("span", { children: ["Duration: ", /* @__PURE__ */ jsxs("strong", {
										className: "text-slate-700 dark:text-gray-300",
										children: [previewMedia.duration, "s"]
									})] }) : null
								]
							}), /* @__PURE__ */ jsx("a", {
								href: getFullUrl(previewMedia.url),
								target: "_blank",
								rel: "noreferrer",
								className: "text-accentBlue hover:underline",
								children: "Open in new tab"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent",
					children: "Media Library"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500 mt-1",
					children: "Upload, search, and manage files used throughout posts."
				})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("input", {
					type: "file",
					multiple: true,
					ref: fileInputRef,
					onChange: handleFileUpload,
					className: "hidden",
					accept: "image/*,video/mp4,video/webm,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
				}), /* @__PURE__ */ jsxs("button", {
					onClick: () => fileInputRef.current?.click(),
					disabled: uploading,
					className: "flex items-center space-x-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 disabled:opacity-55 text-white font-medium px-5 py-3 rounded-xl transition-all shadow-md shadow-accentBlue/10 text-sm",
					children: [uploading ? /* @__PURE__ */ jsx(Loader, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Upload Files" })]
				})] })]
			}),
			/* @__PURE__ */ jsxs("div", {
				onDragOver: handleDragOver,
				onDrop: handleDrop,
				className: "border-2 border-dashed border-slate-800 hover:border-accentBlue/40 bg-slate-900/10 hover:bg-slate-900/20 rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center group",
				children: [
					/* @__PURE__ */ jsx(Upload, { className: "w-10 h-10 text-gray-700 group-hover:text-accentBlue/60 transition-colors mb-3" }),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-gray-400 font-sans",
						children: "Drag & Drop images, videos, or documents (PDF, Word, Excel, Text) here to upload them directly"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-600 mt-1 font-sans",
						children: "Max sizes: Image 10MB, Video 500MB, Document 50MB"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-800/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex bg-slate-950 p-1 border border-slate-800 rounded-xl self-start",
					children: [
						{
							label: "All Files",
							value: ""
						},
						{
							label: "Images",
							value: "image"
						},
						{
							label: "Videos",
							value: "video"
						},
						{
							label: "Documents",
							value: "document"
						}
					].map((btn) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => {
							setTypeFilter(btn.value);
							setPage(1);
						},
						className: `px-4 py-2 rounded-lg text-xs font-semibold transition-all ${typeFilter === btn.value ? "bg-slate-800 text-accentBlue shadow-sm" : "text-gray-400 hover:text-gray-200"}`,
						children: btn.label
					}, btn.label))
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3 w-full md:w-auto",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "relative w-full md:w-64",
						children: [/* @__PURE__ */ jsx("span", {
							className: "absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600",
							children: /* @__PURE__ */ jsx(Search, { className: "w-4 h-4" })
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							placeholder: "Search file name...",
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							className: "w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl outline-none transition-all text-xs"
						})]
					}), /* @__PURE__ */ jsx("button", {
						onClick: fetchMedia,
						className: "p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors",
						title: "Refresh",
						children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
					})]
				})]
			}),
			loading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4",
				children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "aspect-square bg-slate-850 animate-pulse border border-slate-800 rounded-2xl" }, i))
			}) : filteredMediaList.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "py-20 text-center border border-dashed border-slate-800 rounded-2xl",
				children: [
					/* @__PURE__ */ jsx(Image, { className: "w-12 h-12 text-gray-700 mx-auto mb-3" }),
					/* @__PURE__ */ jsx("h3", {
						className: "text-gray-400 font-bold text-sm",
						children: "No media files found"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-600 mt-1 font-sans",
						children: "Upload files or adjust your search filter"
					})
				]
			}) : /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4",
				children: filteredMediaList.map((media) => {
					const isProcessing = media.status === "processing";
					return /* @__PURE__ */ jsxs("div", {
						className: "group relative aspect-square bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-950",
							children: [isProcessing ? /* @__PURE__ */ jsxs("div", {
								className: "absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-xs text-gray-500 gap-2",
								children: [/* @__PURE__ */ jsx(Loader, { className: "w-5 h-5 animate-spin text-accentBlue" }), /* @__PURE__ */ jsx("span", { children: "Processing..." })]
							}) : media.type === "video" ? /* @__PURE__ */ jsxs("div", {
								className: "w-full h-full relative",
								children: [media.thumbnail_url ? /* @__PURE__ */ jsx("img", {
									src: getFullUrl(media.thumbnail_url),
									alt: "",
									className: "object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
								}) : /* @__PURE__ */ jsx("div", {
									className: "w-full h-full bg-slate-900 flex items-center justify-center",
									children: /* @__PURE__ */ jsx(Film, { className: "w-8 h-8 text-gray-700" })
								}), /* @__PURE__ */ jsx("div", {
									className: "absolute inset-0 flex items-center justify-center",
									children: /* @__PURE__ */ jsx("div", {
										className: "w-10 h-10 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-800 flex items-center justify-center text-white group-hover:scale-110 transition-all",
										children: /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 fill-current ml-0.5" })
									})
								})]
							}) : media.type === "document" || media.mime_type === "application/pdf" ? /* @__PURE__ */ jsxs("div", {
								className: "w-full h-full bg-slate-900/60 flex flex-col items-center justify-center text-red-500 gap-2 p-4",
								children: [/* @__PURE__ */ jsx(FileText, { className: "w-10 h-10 group-hover:scale-105 transition-transform" }), /* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-gray-400 text-center truncate w-full font-bold",
									children: media.file_name
								})]
							}) : /* @__PURE__ */ jsx("img", {
								src: getFullUrl(media.thumbnail_url || media.url),
								alt: media.file_name,
								className: "object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
							}), !isProcessing && /* @__PURE__ */ jsx("div", {
								className: "absolute top-2.5 left-2.5 z-10 flex gap-1.5",
								children: /* @__PURE__ */ jsxs("span", {
									className: "bg-slate-950/80 border border-slate-800/80 backdrop-blur-sm text-[9px] font-bold text-gray-300 px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1",
									children: [media.type === "video" ? /* @__PURE__ */ jsx(Film, { className: "w-2.5 h-2.5" }) : media.type === "document" || media.mime_type === "application/pdf" ? /* @__PURE__ */ jsx(FileText, { className: "w-2.5 h-2.5" }) : /* @__PURE__ */ jsx(Image, { className: "w-2.5 h-2.5" }), media.type]
								})
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-3.5 transition-all duration-200",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex items-start justify-between gap-2",
								children: /* @__PURE__ */ jsx("p", {
									className: "text-xs text-gray-200 font-semibold truncate pr-1",
									title: media.file_name,
									children: media.file_name
								})
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex justify-between items-center pt-2",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-[10px] text-gray-400 font-mono",
									children: [(media.file_size / (1024 * 1024)).toFixed(2), " MB"]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => handlePreviewMedia(media),
										className: "p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors",
										title: "Preview details",
										children: /* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" })
									}), /* @__PURE__ */ jsx("button", {
										onClick: () => setDeleteMedia(media),
										className: "p-1.5 bg-dangerRed/10 hover:bg-dangerRed/20 border border-dangerRed/30 rounded-lg text-dangerRed transition-colors",
										title: "Delete file",
										children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
									})]
								})]
							})]
						})]
					}, media.id);
				})
			}),
			total > limit && /* @__PURE__ */ jsxs("div", {
				className: "p-4 bg-slate-950/30 border border-slate-800/40 rounded-2xl flex justify-between items-center",
				children: [
					/* @__PURE__ */ jsx("button", {
						disabled: page === 1,
						onClick: () => setPage(page - 1),
						className: "px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all",
						children: "Previous"
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "text-xs text-gray-500 font-medium",
						children: [
							"Page ",
							page,
							" of ",
							Math.ceil(total / limit)
						]
					}),
					/* @__PURE__ */ jsx("button", {
						disabled: page * limit >= total,
						onClick: () => setPage(page + 1),
						className: "px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all",
						children: "Next"
					})
				]
			}),
			lightboxOpen && Lightbox && /* @__PURE__ */ jsx(Lightbox, {
				open: lightboxOpen,
				close: () => setLightboxOpen(false),
				index: lightboxIndex,
				slides: lightboxSlides,
				plugins: [ZoomPlugin, VideoPlugin].filter(Boolean)
			})
		]
	});
};
var MediaLibrary_default = UNSAFE_withComponentProps(MediaLibrary);
//#endregion
export { MediaLibrary_default as default, loader };
