import { d as publicService, s as getFullUrl } from "./api-CItDfJrl.js";
import { n as useLanguage } from "./LanguageContext-DOrz_C39.js";
import { Link, UNSAFE_withComponentProps, useParams } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { BookOpen, Calendar, ChevronLeft, ChevronRight, Eye, Loader, Mail, User } from "lucide-react";
//#region src/pages/AuthorDetail.tsx
async function loader() {
	return null;
}
var AuthorDetail = () => {
	const { t, language } = useLanguage();
	const { nickname } = useParams();
	const [author, setAuthor] = useState(null);
	const [posts, setPosts] = useState([]);
	const [totalPosts, setTotalPosts] = useState(0);
	const [loadingAuthor, setLoadingAuthor] = useState(false);
	const [loadingPosts, setLoadingPosts] = useState(false);
	const [page, setPage] = useState(1);
	const limit = 6;
	useEffect(() => {
		const fetchAuthor = async () => {
			if (!nickname) return;
			setLoadingAuthor(true);
			try {
				const res = await publicService.getAuthorByNickname(nickname);
				if (res.success && res.data) setAuthor(res.data);
			} catch (err) {
				console.error("Failed to load author details", err);
			} finally {
				setLoadingAuthor(false);
			}
		};
		fetchAuthor();
	}, [nickname]);
	useEffect(() => {
		const fetchPosts = async () => {
			if (!nickname) return;
			setLoadingPosts(true);
			try {
				const offset = (page - 1) * limit;
				const res = await publicService.getPosts({
					nickname,
					offset,
					limit
				});
				if (res.success && res.data) {
					setPosts(res.data.items || []);
					setTotalPosts(res.data.total || 0);
				}
			} catch (err) {
				console.error("Failed to load author posts", err);
			} finally {
				setLoadingPosts(false);
			}
		};
		fetchPosts();
	}, [nickname, page]);
	const totalPages = Math.ceil(totalPosts / limit);
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		return new Date(dateStr).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-6xl mx-auto px-4 py-8 space-y-8 select-none",
		children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Link, {
			to: "/authors",
			className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-slate-800 dark:hover:text-white transition-colors",
			children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: t("back_to_authors") })]
		}) }), loadingAuthor ? /* @__PURE__ */ jsxs("div", {
			className: "py-20 text-center animate-pulse",
			children: [/* @__PURE__ */ jsx(Loader, { className: "w-10 h-10 animate-spin text-accentBlue mx-auto" }), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-500 dark:text-gray-400 mt-2",
				children: t("loading")
			})]
		}) : !author ? /* @__PURE__ */ jsx("div", {
			className: "py-12 text-center text-gray-500",
			children: /* @__PURE__ */ jsx("p", { children: t("no_authors") })
		}) : /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start select-text",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 space-y-6 bg-white/40 dark:bg-slate-900/30 lg:sticky lg:top-[90px]",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center text-center space-y-4",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-28 h-28 rounded-full border-4 border-accentBlue/20 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-950/40 shadow-xl",
								children: author.avatar_url ? /* @__PURE__ */ jsx("img", {
									src: getFullUrl(author.avatar_url),
									alt: author.name,
									className: "w-full h-full object-cover"
								}) : /* @__PURE__ */ jsx("span", {
									className: "font-bold text-accentBlue text-4xl",
									children: author.name.charAt(0).toUpperCase()
								})
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
								className: "text-2xl font-bold text-slate-850 dark:text-white",
								children: author.name
							}), /* @__PURE__ */ jsxs("div", {
								className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50 text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider uppercase mt-2 select-none",
								children: [/* @__PURE__ */ jsx(User, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: language === "vi" ? "Tác giả / Thành viên" : "Author / Contributor" })]
							})] }),
							/* @__PURE__ */ jsxs("a", {
								href: `mailto:${author.email}`,
								className: "flex items-center space-x-2 text-xs text-accentBlue hover:underline py-1.5 px-4 bg-accentBlue/5 rounded-xl transition-all",
								children: [/* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: author.email })]
							})
						]
					}),
					/* @__PURE__ */ jsx("hr", { className: "border-slate-100 dark:border-slate-800/40" }),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider select-none",
							children: t("biography")
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-slate-700 dark:text-gray-300 leading-relaxed",
							children: author.bio || t("no_bio")
						})]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "lg:col-span-2 space-y-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/40",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ jsx(BookOpen, { className: "w-5 h-5 text-accentPurple" }), /* @__PURE__ */ jsxs("h3", {
								className: "text-sm md:text-base font-bold text-slate-850 dark:text-white",
								children: [
									t("articles_written_by"),
									" ",
									author.name.split(" ")[0]
								]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-3 select-none",
							children: /* @__PURE__ */ jsxs("span", {
								className: "text-xs bg-slate-100 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-lg font-semibold",
								children: [
									totalPosts,
									" ",
									t("posts")
								]
							})
						})]
					}),
					loadingPosts ? /* @__PURE__ */ jsxs("div", {
						className: "py-20 text-center animate-pulse",
						children: [/* @__PURE__ */ jsx(Loader, { className: "w-8 h-8 animate-spin text-accentBlue mx-auto" }), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-gray-500 dark:text-gray-400 mt-2",
							children: t("loading")
						})]
					}) : posts.length === 0 ? /* @__PURE__ */ jsx("div", {
						className: "py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl",
						children: /* @__PURE__ */ jsx("p", {
							className: "text-sm text-gray-500 dark:text-gray-400",
							children: t("no_posts")
						})
					}) : /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-6",
						children: posts.map((post) => {
							const coverUrl = post.cover_media?.url || `https://picsum.photos/seed/${post.slug}/800/500`;
							return /* @__PURE__ */ jsx("article", {
								className: "group flex flex-col justify-between p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-accentBlue/30 dark:hover:border-accentBlue/20 hover:shadow-lg transition-all duration-200 bg-white/40 dark:bg-slate-900/30",
								children: /* @__PURE__ */ jsxs("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ jsx(Link, {
										to: `/posts/${post.slug}`,
										className: "block aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/60",
										children: /* @__PURE__ */ jsx("img", {
											src: getFullUrl(coverUrl),
											alt: post.title,
											className: "w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500",
											loading: "lazy"
										})
									}), /* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex flex-wrap items-center gap-3 text-[10px] text-gray-500",
												children: [/* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }), formatDate(post.published_at || post.created_at)]
												}), post.view_count !== void 0 && /* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1",
													children: [
														/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }),
														post.view_count,
														" ",
														t("views")
													]
												})]
											}),
											/* @__PURE__ */ jsx("h4", {
												className: "text-base font-extrabold text-slate-850 dark:text-white line-clamp-2 group-hover:text-accentBlue transition-colors leading-snug",
												children: /* @__PURE__ */ jsx(Link, {
													to: `/posts/${post.slug}`,
													children: post.title
												})
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed",
												children: post.excerpt || "Read full article..."
											})
										]
									})]
								})
							}, post.id);
						})
					}),
					totalPages > 1 && /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/40 select-none",
						children: [
							/* @__PURE__ */ jsxs("button", {
								onClick: () => setPage((p) => Math.max(p - 1, 1)),
								disabled: page === 1,
								className: "inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-750 dark:text-gray-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
								children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: t("prev") })]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xs text-gray-500 dark:text-gray-400",
								children: [
									"Page ",
									page,
									" of ",
									totalPages
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: () => setPage((p) => Math.min(p + 1, totalPages)),
								disabled: page === totalPages,
								className: "inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-750 dark:text-gray-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
								children: [/* @__PURE__ */ jsx("span", { children: t("next") }), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })]
							})
						]
					})
				]
			})]
		})]
	});
};
var AuthorDetail_default = UNSAFE_withComponentProps(AuthorDetail);
//#endregion
export { AuthorDetail_default as default, loader };
