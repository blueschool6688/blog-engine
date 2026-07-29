import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Download, ExternalLink, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button, Space, Tooltip } from "antd";
//#region src/components/PDFViewer.tsx
/**
* PDFViewer renders PDF files using a browser native <iframe>.
*
* Unlike react-pdf (which uses PDF.js fetch API and is blocked by S3 CORS),
* an <iframe> is treated as a top-level navigation request by the browser, 
* bypassing CORS restrictions entirely. This allows PDFs to load from any 
* S3 or CDN bucket without requiring CORS configuration on the bucket.
*/
var PDFViewer = ({ url, fileName }) => {
	const [scale, setScale] = useState(100);
	const [expanded, setExpanded] = useState(false);
	const zoom = (direction) => {
		setScale((prev) => {
			const next = direction === "in" ? prev + 10 : prev - 10;
			return Math.max(50, Math.min(200, next));
		});
	};
	const iframeSrc = `${url}#zoom=${scale}&toolbar=1&navpanes=1`;
	if (typeof window === "undefined") return /* @__PURE__ */ jsx("div", {
		className: "flex flex-col bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md w-full p-8 text-center text-gray-500 text-sm",
		children: "Loading document on client side..."
	});
	return /* @__PURE__ */ jsxs("div", {
		className: `flex flex-col bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md w-full transition-all duration-300 ${expanded ? "fixed inset-4 z-50" : "max-h-[85vh]"}`,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 select-none shrink-0",
			children: [
				/* @__PURE__ */ jsxs(Space, {
					size: 4,
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 gap-0.5",
						children: [
							/* @__PURE__ */ jsx(Tooltip, {
								title: "Zoom Out",
								children: /* @__PURE__ */ jsx(Button, {
									type: "text",
									size: "small",
									icon: /* @__PURE__ */ jsx(ZoomOut, { className: "w-3.5 h-3.5" }),
									disabled: scale <= 50,
									onClick: () => zoom("out"),
									className: "text-gray-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded border-0 w-7 h-7 flex items-center justify-center"
								})
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[11px] font-mono text-gray-400 font-semibold px-2 min-w-[42px] text-center",
								children: [scale, "%"]
							}),
							/* @__PURE__ */ jsx(Tooltip, {
								title: "Zoom In",
								children: /* @__PURE__ */ jsx(Button, {
									type: "text",
									size: "small",
									icon: /* @__PURE__ */ jsx(ZoomIn, { className: "w-3.5 h-3.5" }),
									disabled: scale >= 200,
									onClick: () => zoom("in"),
									className: "text-gray-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 rounded border-0 w-7 h-7 flex items-center justify-center"
								})
							})
						]
					}), /* @__PURE__ */ jsx(Tooltip, {
						title: expanded ? "Exit Fullscreen" : "Fullscreen",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							size: "small",
							icon: expanded ? /* @__PURE__ */ jsx(Minimize2, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx(Maximize2, { className: "w-3.5 h-3.5" }),
							onClick: () => setExpanded((v) => !v),
							className: "text-gray-400 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-lg w-8 h-8 flex items-center justify-center"
						})
					})]
				}),
				fileName && /* @__PURE__ */ jsx("div", {
					className: "hidden md:block text-xs font-bold text-slate-400 truncate max-w-[220px] xl:max-w-sm font-sans",
					children: fileName
				}),
				/* @__PURE__ */ jsxs(Space, {
					size: 6,
					children: [/* @__PURE__ */ jsx(Tooltip, {
						title: "Open in new tab",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							size: "small",
							icon: /* @__PURE__ */ jsx(ExternalLink, { className: "w-3.5 h-3.5" }),
							href: url,
							target: "_blank",
							rel: "noreferrer",
							className: "text-gray-400 hover:text-accentBlue border border-slate-800 rounded-lg w-8 h-8 flex items-center justify-center"
						})
					}), /* @__PURE__ */ jsx(Tooltip, {
						title: "Download",
						children: /* @__PURE__ */ jsx(Button, {
							type: "primary",
							size: "small",
							icon: /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }),
							href: url,
							download: fileName || "document.pdf",
							target: "_blank",
							rel: "noreferrer",
							danger: true,
							className: "rounded-lg h-8 flex items-center justify-center px-2.5"
						})
					})]
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "flex-1 relative overflow-hidden bg-slate-950 min-h-[500px]",
			children: /* @__PURE__ */ jsx("iframe", {
				src: iframeSrc,
				title: fileName || "PDF Document",
				className: "w-full h-full border-0",
				style: { minHeight: expanded ? "calc(100vh - 120px)" : "500px" },
				loading: "lazy",
				sandbox: "allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
			}, scale)
		})]
	});
};
//#endregion
export { PDFViewer, PDFViewer as default };
