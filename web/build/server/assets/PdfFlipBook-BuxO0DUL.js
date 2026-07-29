import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Download, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { Button, Spin, Tooltip } from "antd";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
//#region src/components/ClientOnly.tsx
/**
* ClientOnly renders children ONLY on the client after mount.
*
* Use this to wrap any component that uses browser-only APIs
* (window, canvas, DOMMatrix, etc.) to prevent SSR crashes.
* During server render and the initial client render pass,
* the `fallback` is shown instead.
*/
var ClientOnly = ({ children, fallback = null }) => {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	if (!mounted) return /* @__PURE__ */ jsx(Fragment, { children: fallback });
	return /* @__PURE__ */ jsx(Fragment, { children });
};
//#endregion
//#region src/components/PdfFlipBook.tsx
/**
* Number of pages to render (as real <Page> canvases) on each side of the
* current page. Pages outside this window are shown as skeleton placeholders
* so react-pageflip always has the correct total DOM children count.
*
* Total max real canvases at any time = RENDER_BUFFER * 2 + 1
*/
var RENDER_BUFFER = 2;
function getPageWidth(vw) {
	if (vw < 480) return Math.floor(vw * .9);
	if (vw < 768) return Math.floor(vw * .85);
	if (vw < 1024) return Math.floor(vw * .42);
	if (vw < 1440) return Math.floor(vw * .38);
	return Math.floor(Math.min(vw * .34, 620));
}
var PdfFlipBookInner = ({ fileUrl }) => {
	const [numPages, setNumPages] = useState(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [pageWidth, setPageWidth] = useState(480);
	const [pageHeight, setPageHeight] = useState(640);
	const [pdfError, setPdfError] = useState(null);
	const [expanded, setExpanded] = useState(false);
	const flipBookRef = useRef(null);
	useEffect(() => {
		pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
	}, []);
	useEffect(() => {
		const measure = () => {
			const vw = window.innerWidth;
			const pw = getPageWidth(vw);
			setPageWidth(pw);
			setPageHeight(Math.floor(pw * 1.414));
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, []);
	const shouldRenderPage = useCallback((index) => Math.abs(index - currentPage) <= RENDER_BUFFER, [currentPage]);
	const handleFlip = useCallback((e) => {
		setCurrentPage(e.data);
	}, []);
	const flipNext = () => {
		flipBookRef.current?.pageFlip().flipNext();
	};
	const flipPrev = () => {
		flipBookRef.current?.pageFlip().flipPrev();
	};
	const displayCurrent = currentPage + 1;
	const displayTotal = numPages ?? "…";
	if (!numPages && !pdfError) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center justify-center min-h-[400px] gap-4 text-gray-400",
		children: [
			/* @__PURE__ */ jsx(Document, {
				file: fileUrl,
				onLoadSuccess: ({ numPages: n }) => setNumPages(n),
				onLoadError: (err) => setPdfError(err.message),
				loading: null,
				error: null,
				children: /* @__PURE__ */ jsx(Page, {
					pageNumber: 1,
					width: 1,
					renderTextLayer: false,
					renderAnnotationLayer: false
				})
			}),
			/* @__PURE__ */ jsx(Spin, { size: "large" }),
			/* @__PURE__ */ jsx("span", {
				className: "text-sm font-medium",
				children: "Đang tải tài liệu PDF…"
			})
		]
	});
	if (pdfError) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center justify-center min-h-[350px] gap-4 p-6 text-center",
		children: [
			/* @__PURE__ */ jsx(BookOpen, { className: "w-12 h-12 text-red-400" }),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm font-semibold text-red-400",
				children: "Không thể tải file PDF."
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-xs text-gray-500 max-w-xs",
				children: "Nguyên nhân có thể do CORS settings trên S3 bucket chưa được cấu hình. Bạn vẫn có thể xem tài liệu trực tiếp:"
			}),
			/* @__PURE__ */ jsx("a", {
				href: fileUrl,
				target: "_blank",
				rel: "noreferrer",
				className: "px-4 py-2 bg-accentBlue text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all",
				children: "Mở PDF trong tab mới"
			})
		]
	});
	const pages = Array.from({ length: numPages }, (_, i) => i);
	return /* @__PURE__ */ jsxs("div", {
		className: `flex flex-col gap-4 transition-all duration-300 ${expanded ? "fixed inset-2 z-50 bg-slate-950/98 p-4 rounded-2xl overflow-auto" : ""}`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-3 px-1 flex-wrap",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsx(Tooltip, {
							title: "Trang trước",
							children: /* @__PURE__ */ jsx(Button, {
								icon: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }),
								onClick: flipPrev,
								disabled: currentPage === 0,
								className: "rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-gray-300 hover:text-accentBlue hover:border-accentBlue/50 disabled:opacity-30 h-9 w-9 flex items-center justify-center"
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-semibold text-slate-700 dark:text-gray-300 min-w-[80px] text-center",
							children: [
								displayCurrent,
								" / ",
								displayTotal
							]
						}),
						/* @__PURE__ */ jsx(Tooltip, {
							title: "Trang sau",
							children: /* @__PURE__ */ jsx(Button, {
								icon: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }),
								onClick: flipNext,
								disabled: numPages !== null && currentPage >= numPages - 1,
								className: "rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-gray-300 hover:text-accentBlue hover:border-accentBlue/50 disabled:opacity-30 h-9 w-9 flex items-center justify-center"
							})
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "text-[11px] text-gray-500 hidden sm:block",
							children: [5, " trang được render"]
						}),
						/* @__PURE__ */ jsx(Tooltip, {
							title: expanded ? "Thu nhỏ" : "Toàn màn hình",
							children: /* @__PURE__ */ jsx(Button, {
								icon: expanded ? /* @__PURE__ */ jsx(Minimize2, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Maximize2, { className: "w-4 h-4" }),
								onClick: () => setExpanded((v) => !v),
								className: "rounded-xl border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 h-9 w-9 flex items-center justify-center"
							})
						}),
						/* @__PURE__ */ jsx(Tooltip, {
							title: "Mở trong tab mới",
							children: /* @__PURE__ */ jsx(Button, {
								icon: /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" }),
								href: fileUrl,
								target: "_blank",
								rel: "noreferrer",
								className: "rounded-xl border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 h-9 w-9 flex items-center justify-center"
							})
						}),
						/* @__PURE__ */ jsx(Tooltip, {
							title: "Tải xuống",
							children: /* @__PURE__ */ jsx(Button, {
								type: "primary",
								danger: true,
								icon: /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
								href: fileUrl,
								download: true,
								target: "_blank",
								rel: "noreferrer",
								className: "rounded-xl h-9 w-9 flex items-center justify-center"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex justify-center overflow-hidden",
				children: /* @__PURE__ */ jsx(Document, {
					file: fileUrl,
					onLoadSuccess: ({ numPages: n }) => setNumPages(n),
					onLoadError: (err) => setPdfError(err.message),
					loading: null,
					error: null,
					children: /* @__PURE__ */ jsx(HTMLFlipBook, {
						ref: flipBookRef,
						width: pageWidth,
						height: pageHeight,
						size: "fixed",
						drawShadow: true,
						flippingTime: 700,
						usePortrait: false,
						showCover: false,
						mobileScrollSupport: true,
						onFlip: handleFlip,
						className: "shadow-2xl",
						style: {},
						children: pages.map((pageIndex) => /* @__PURE__ */ jsx("div", {
							className: "bg-white flex items-center justify-center overflow-hidden",
							style: {
								width: pageWidth,
								height: pageHeight
							},
							children: shouldRenderPage(pageIndex) ? /* @__PURE__ */ jsx(Page, {
								pageNumber: pageIndex + 1,
								width: pageWidth,
								renderTextLayer: false,
								renderAnnotationLayer: false,
								loading: /* @__PURE__ */ jsx("div", {
									className: "animate-pulse bg-slate-200 dark:bg-slate-800 rounded",
									style: {
										width: pageWidth,
										height: pageHeight
									}
								})
							}) : /* @__PURE__ */ jsx("div", {
								className: "animate-pulse bg-slate-100 dark:bg-slate-900 w-full h-full flex items-center justify-center",
								"aria-label": `Page ${pageIndex + 1} placeholder`,
								children: /* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-slate-300 dark:text-slate-700 font-mono",
									children: pageIndex + 1
								})
							})
						}, pageIndex))
					})
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-center gap-2 text-xs text-gray-400",
				children: [/* @__PURE__ */ jsx(BookOpen, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsxs("span", { children: [
					"Trang ",
					displayCurrent,
					" / ",
					displayTotal,
					" — kéo góc trang hoặc dùng nút để lật"
				] })]
			})
		]
	});
};
var PdfFlipBook = ({ fileUrl }) => {
	return /* @__PURE__ */ jsx(ClientOnly, {
		fallback: /* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-center min-h-[400px] gap-3 text-gray-500",
			children: [/* @__PURE__ */ jsx(BookOpen, { className: "w-7 h-7 animate-pulse" }), /* @__PURE__ */ jsx("span", {
				className: "text-sm font-medium",
				children: "Đang khởi tạo trình đọc…"
			})]
		}),
		children: /* @__PURE__ */ jsx(PdfFlipBookInner, { fileUrl })
	});
};
//#endregion
export { PdfFlipBook, PdfFlipBook as default };
