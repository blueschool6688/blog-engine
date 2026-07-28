import { n as useLanguage } from "./LanguageContext-FaGWHnxr.js";
import { Link, UNSAFE_withComponentProps, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
//#region src/pages/NotFound.tsx
async function loader() {
	return null;
}
var NotFound = () => {
	const { t, language, setLanguage } = useLanguage();
	const navigate = useNavigate();
	const [countdown, setCountdown] = useState(10);
	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					navigate("/");
					return 0;
				}
				return prev - 1;
			});
		}, 1e3);
		return () => clearInterval(timer);
	}, [navigate]);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-gray-200 flex flex-col justify-between font-sans transition-colors duration-300 relative overflow-hidden select-none",
		children: [
			/* @__PURE__ */ jsx("div", { className: "fixed top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-accentBlue/6 blur-[150px] pointer-events-none -z-10 animate-pulse" }),
			/* @__PURE__ */ jsx("div", { className: "fixed bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-accentPurple/6 blur-[150px] pointer-events-none -z-10 animate-pulse" }),
			/* @__PURE__ */ jsx("header", {
				className: "max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-end z-10 shrink-0",
				children: /* @__PURE__ */ jsx("button", {
					onClick: () => setLanguage(language === "vi" ? "en" : "vi"),
					className: "px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#151B2C]/40 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold text-slate-700 dark:text-gray-300 transition-all shadow-sm",
					title: language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt",
					children: language === "vi" ? "EN" : "VI"
				})
			}),
			/* @__PURE__ */ jsx("main", {
				className: "flex-grow flex items-center justify-center p-6 z-10",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-md w-full glass-panel border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 md:p-10 text-center space-y-6 bg-white/60 dark:bg-slate-900/30 shadow-2xl relative",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/15 animate-bounce",
							children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-8 h-8" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ jsx("h1", {
									className: "text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-tr from-accentBlue via-accentPurple to-pink-500 bg-clip-text text-transparent drop-shadow-sm select-none",
									children: "404"
								}),
								/* @__PURE__ */ jsx("h2", {
									className: "text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight",
									children: t("page_not_found")
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed font-sans",
									children: t("page_not_found_desc")
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl space-y-3",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs text-gray-500 dark:text-gray-400 font-semibold font-sans",
								children: t("redirecting_home").replace("{seconds}", String(countdown))
							}), /* @__PURE__ */ jsx("div", {
								className: "w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden",
								children: /* @__PURE__ */ jsx("div", {
									className: "h-full bg-gradient-to-r from-accentBlue to-accentPurple transition-all duration-1000 ease-linear rounded-full",
									style: { width: `${countdown / 10 * 100}%` }
								})
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => navigate(-1),
								className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-650 dark:text-gray-300 rounded-xl text-xs font-bold transition-all",
								children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: t("back") })]
							}), /* @__PURE__ */ jsxs(Link, {
								to: "/",
								className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-btn-global hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-accentBlue/10",
								children: [/* @__PURE__ */ jsx(Home, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: t("back_to_home") })]
							})]
						})
					]
				})
			})
		]
	});
};
var NotFound_default = UNSAFE_withComponentProps(NotFound);
//#endregion
export { NotFound_default as default, loader };
