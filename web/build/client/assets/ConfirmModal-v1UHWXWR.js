import "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/ConfirmModal.tsx
var ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
	if (!isOpen) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up",
			children: [
				/* @__PURE__ */ jsx("h3", {
					className: "text-lg font-bold text-slate-850 dark:text-white",
					children: title
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-gray-400 leading-relaxed",
					children: message
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex justify-end gap-3 pt-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: onCancel,
						className: "px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 dark:hover:bg-slate-950 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl text-sm font-semibold transition-all duration-200",
						children: "Cancel"
					}), /* @__PURE__ */ jsx("button", {
						onClick: onConfirm,
						className: "px-4 py-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200",
						children: "Confirm"
					})]
				})
			]
		})
	});
};
//#endregion
export { ConfirmModal as t };
