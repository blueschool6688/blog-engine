import { c as getFullUrl, f as publicService } from "./api-DYEteWSp.js";
import { n as useLanguage } from "./LanguageContext-FaGWHnxr.js";
import { Link, UNSAFE_withComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, Info, Mail } from "lucide-react";
import { Skeleton } from "antd";
//#region src/pages/AuthorsList.tsx
async function loader() {
	return null;
}
var AuthorsList = () => {
	const { t } = useLanguage();
	const [authors, setAuthors] = useState([]);
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		const fetchAuthors = async () => {
			setLoading(true);
			try {
				const res = await publicService.getAuthors();
				if (res.success && res.data) setAuthors(res.data);
			} catch (err) {
				console.error("Failed to fetch authors", err);
			} finally {
				setLoading(false);
			}
		};
		fetchAuthors();
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-6xl mx-auto px-4 py-12 space-y-8",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
			className: "text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white",
			children: t("meet_the_authors")
		}), /* @__PURE__ */ jsx("p", {
			className: "text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl",
			children: t("authors_desc")
		})] }), loading ? /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
			children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-4 mb-4",
					children: [/* @__PURE__ */ jsx(Skeleton.Avatar, {
						active: true,
						size: 64,
						shape: "circle"
					}), /* @__PURE__ */ jsx("div", {
						className: "flex-1",
						children: /* @__PURE__ */ jsx(Skeleton, {
							active: true,
							paragraph: {
								rows: 1,
								width: "60%"
							},
							title: { width: "80%" }
						})
					})]
				}), /* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: { rows: 2 },
					title: false
				})]
			}, i))
		}) : authors.length === 0 ? /* @__PURE__ */ jsxs("div", {
			className: "py-16 text-center glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl bg-white/40 dark:bg-slate-900/30",
			children: [/* @__PURE__ */ jsx(Info, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-500 dark:text-gray-400",
				children: t("no_authors")
			})]
		}) : /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
			children: authors.map((author) => /* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-white/40 dark:bg-slate-900/30 group",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "w-16 h-16 rounded-full border-2 border-accentBlue/20 overflow-hidden flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-950/40",
							children: author.avatar_url ? /* @__PURE__ */ jsx("img", {
								src: getFullUrl(author.avatar_url),
								alt: author.name,
								className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
							}) : /* @__PURE__ */ jsx("span", {
								className: "font-bold text-accentBlue text-xl",
								children: author.name.charAt(0).toUpperCase()
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-lg text-slate-850 dark:text-white truncate",
								children: author.name
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate",
								children: [/* @__PURE__ */ jsx(Mail, { className: "w-3.5 h-3.5 mr-1 shrink-0" }), /* @__PURE__ */ jsx("span", {
									className: "truncate",
									children: author.email
								})]
							})]
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-sm text-gray-500 dark:text-gray-400 line-clamp-3 min-h-[60px]",
						children: author.bio || t("no_bio")
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "pt-6 border-t border-slate-100 dark:border-slate-800/40 mt-6 flex justify-end",
					children: /* @__PURE__ */ jsxs(Link, {
						to: `/authors/${author.nickname}`,
						className: "inline-flex items-center gap-1.5 text-xs font-semibold text-accentBlue hover:text-accentBlue/80 transition-colors group/btn",
						children: [/* @__PURE__ */ jsx("span", { children: t("view_articles") }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" })]
					})
				})]
			}, author.id))
		})]
	});
};
var AuthorsList_default = UNSAFE_withComponentProps(AuthorsList);
//#endregion
export { AuthorsList_default as default, loader };
