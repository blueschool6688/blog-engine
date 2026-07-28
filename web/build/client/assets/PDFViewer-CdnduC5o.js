import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, ChevronLeft, ChevronRight, Download, Loader2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
//#region src/components/PDFViewer.tsx
if (typeof window !== "undefined") pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
var PDFViewer = ({ url, fileName }) => {
	const [numPages, setNumPages] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [scale, setScale] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [loading, setLoading] = useState(true);
	function onDocumentLoadSuccess({ numPages }) {
		setNumPages(numPages);
		setPageNumber(1);
		setLoading(false);
	}
	function changePage(offset) {
		setPageNumber((prevPageNumber) => {
			const target = prevPageNumber + offset;
			if (numPages && target >= 1 && target <= numPages) return target;
			return prevPageNumber;
		});
	}
	const zoom = (direction) => {
		setScale((prevScale) => {
			const nextScale = direction === "in" ? prevScale + .1 : prevScale - .1;
			return Math.max(.5, Math.min(2, nextScale));
		});
	};
	const rotate = () => {
		setRotation((prevRotation) => (prevRotation + 90) % 360);
	};
	if (typeof window === "undefined") return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md w-full p-8 text-center text-gray-500",
		children: "Loading document on client side..."
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md w-full max-h-[85vh]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800 select-none",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						numPages && /* @__PURE__ */ jsxs("div", {
							className: "flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs text-gray-400 font-semibold font-mono",
							children: [
								/* @__PURE__ */ jsx("button", {
									type: "button",
									disabled: pageNumber <= 1,
									onClick: () => changePage(-1),
									className: "p-1 hover:text-white hover:bg-slate-900 rounded disabled:opacity-30 transition-all",
									children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "px-2",
									children: [
										pageNumber,
										" / ",
										numPages
									]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									disabled: numPages ? pageNumber >= numPages : true,
									onClick: () => changePage(1),
									className: "p-1 hover:text-white hover:bg-slate-900 rounded disabled:opacity-30 transition-all",
									children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs text-gray-400 font-semibold font-mono",
							children: [
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => zoom("out"),
									disabled: scale <= .6,
									className: "p-1 hover:text-white hover:bg-slate-900 rounded disabled:opacity-30 transition-all",
									title: "Zoom Out",
									children: /* @__PURE__ */ jsx(ZoomOut, { className: "w-4 h-4" })
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "px-2",
									children: [Math.round(scale * 100), "%"]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => zoom("in"),
									disabled: scale >= 1.9,
									className: "p-1 hover:text-white hover:bg-slate-900 rounded disabled:opacity-30 transition-all",
									title: "Zoom In",
									children: /* @__PURE__ */ jsx(ZoomIn, { className: "w-4 h-4" })
								})
							]
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: rotate,
							className: "p-2 bg-slate-955 hover:bg-slate-900 text-gray-400 hover:text-white rounded-lg border border-slate-800 transition-all",
							title: "Rotate Page",
							children: /* @__PURE__ */ jsx(RotateCw, { className: "w-4 h-4" })
						})
					]
				}),
				fileName && /* @__PURE__ */ jsx("div", {
					className: "hidden md:block text-xs font-bold text-slate-400 truncate max-w-[200px] xl:max-w-xs font-sans",
					children: fileName
				}),
				/* @__PURE__ */ jsx("a", {
					href: url,
					download: fileName || "document.pdf",
					target: "_blank",
					rel: "noreferrer",
					className: "flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all",
					children: /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" })
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative flex-1 overflow-auto bg-slate-950 p-4 flex justify-center items-start min-h-[500px]",
			children: [loading && /* @__PURE__ */ jsx("div", {
				className: "absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2 bg-slate-950/80 z-10",
				children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-red-500" })
			}), /* @__PURE__ */ jsx(Document, {
				file: url,
				onLoadSuccess: onDocumentLoadSuccess,
				loading: null,
				error: /* @__PURE__ */ jsx("div", {
					className: "text-center p-8 border border-dashed border-red-500/20 bg-red-500/5 rounded-xl max-w-sm flex flex-col items-center",
					children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-8 h-8 text-red-500 mb-2" })
				}),
				children: /* @__PURE__ */ jsx(Page, {
					pageNumber,
					scale,
					rotate: rotation,
					renderTextLayer: true,
					renderAnnotationLayer: true,
					className: "shadow-2xl rounded-lg overflow-hidden",
					loading: null
				})
			})]
		})]
	});
};
//#endregion
export { PDFViewer };
