import { c as getFullUrl, f as publicService, p as settingsService } from "./api-DYEteWSp.js";
import { n as useLanguage } from "./LanguageContext-FaGWHnxr.js";
import { Link, UNSAFE_withComponentProps, useSearchParams } from "react-router";
import React, { useCallback, useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Calendar, Clock, FileText, X } from "lucide-react";
import { Badge, Image as Image$1, Input, Pagination, Skeleton } from "antd";
//#region src/pages/BlogHome.tsx
async function loader() {
	return null;
}
function formatRelative(dateStr, t) {
	try {
		const date = new Date(dateStr);
		const diffMs = (/* @__PURE__ */ new Date()).getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
		if (diffDays < 1) return t("today");
		if (diffDays < 7) return `${diffDays} ${t("days_ago")}`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t("weeks_ago")}`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${t("months_ago")}`;
		return `${Math.floor(diffDays / 365)} ${t("years_ago")}`;
	} catch {
		return dateStr;
	}
}
function estimateReadTime(html) {
	const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 200));
}
/** Skeleton card matching the exact shape of a post card */
function PostSkeleton() {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col justify-between p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "aspect-[16/10] rounded-xl overflow-hidden mb-4",
				children: /* @__PURE__ */ jsx(Skeleton.Image, {
					active: true,
					style: {
						width: "100%",
						height: "100%"
					},
					className: "!w-full !h-full"
				})
			}),
			/* @__PURE__ */ jsx(Skeleton, {
				active: true,
				paragraph: false,
				title: { width: "50%" },
				className: "mb-2"
			}),
			/* @__PURE__ */ jsx(Skeleton, {
				active: true,
				paragraph: {
					rows: 2,
					width: ["100%", "70%"]
				},
				title: false
			}),
			/* @__PURE__ */ jsx("div", {
				className: "pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/30",
				children: /* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: false,
					title: { width: "60%" }
				})
			})
		]
	});
}
var BlogHome = () => {
	const { t, language } = useLanguage();
	const [posts, setPosts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [tags, setTags] = useState([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [searchInput, setSearchInput] = useState("");
	const [heroKicker, setHeroKicker] = useState("");
	const [heroTitleLine1, setHeroTitleLine1] = useState("");
	const [heroTitleLine2, setHeroTitleLine2] = useState("");
	const [heroSubtitle, setHeroSubtitle] = useState("");
	const [searchParams, setSearchParams] = useSearchParams();
	const LIMIT = 10;
	const currentPage = parseInt(searchParams.get("page") || "1");
	const selectedCategories = searchParams.get("category") ? searchParams.get("category").split(",").filter(Boolean) : [];
	const selectedTags = searchParams.get("tag") ? searchParams.get("tag").split(",").filter(Boolean) : [];
	const searchQuery = searchParams.get("q") || "";
	const loadPosts = useCallback(async (signal) => {
		setLoading(true);
		try {
			const params = {
				offset: (currentPage - 1) * LIMIT,
				limit: LIMIT
			};
			if (searchQuery) params.search = searchQuery;
			const res = await publicService.getPosts(params);
			if (signal?.aborted) return;
			let items = res.data?.items || [];
			if (selectedCategories.length > 0) items = items.filter((p) => p.categories?.some((c) => selectedCategories.includes(c.slug)));
			if (selectedTags.length > 0) items = items.filter((p) => p.tags?.some((t) => selectedTags.includes(t.slug)));
			setPosts(items);
			setTotal(selectedCategories.length > 0 || selectedTags.length > 0 ? items.length : res.data?.total || items.length);
		} catch (err) {
			if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
			setPosts([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	}, [
		currentPage,
		selectedCategories.join(","),
		selectedTags.join(","),
		searchQuery
	]);
	useEffect(() => {
		const controller = new AbortController();
		loadPosts(controller.signal);
		return () => controller.abort();
	}, [loadPosts]);
	useEffect(() => {
		let cancelled = false;
		Promise.all([publicService.getCategories(), publicService.getTags()]).then(([catRes, tagRes]) => {
			if (cancelled) return;
			setCategories(catRes.data || []);
			setTags(tagRes.data || []);
		}).catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);
	useEffect(() => {
		let cancelled = false;
		settingsService.get().then((res) => {
			if (cancelled) return;
			if (res.success && res.data) {
				const data = res.data;
				setHeroKicker(data.hero_kicker || "");
				setHeroTitleLine1(data.hero_title_line1 || "");
				setHeroTitleLine2(data.hero_title_line2 || "");
				setHeroSubtitle(data.hero_subtitle || "");
			}
		}).catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);
	const toggleFilter = (key, value) => {
		const next = new URLSearchParams(searchParams);
		const currentList = next.get(key) ? next.get(key).split(",").filter(Boolean) : [];
		const index = currentList.indexOf(value);
		if (index > -1) currentList.splice(index, 1);
		else currentList.push(value);
		if (currentList.length > 0) next.set(key, currentList.join(","));
		else next.delete(key);
		next.set("page", "1");
		setSearchParams(next);
	};
	const clearFilters = () => {
		setSearchParams({});
		setSearchInput("");
	};
	const setPage = (p) => {
		const next = new URLSearchParams(searchParams);
		next.set("page", String(p));
		setSearchParams(next);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const hasActiveFilter = selectedCategories.length > 0 || selectedTags.length > 0 || searchQuery;
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto space-y-8 select-none",
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "text-center py-10 md:py-14 space-y-4 select-text",
				children: [
					heroKicker && /* @__PURE__ */ jsx("p", {
						className: "text-xs font-extrabold uppercase tracking-wider text-accentBlue/90 sm:text-sm",
						children: heroKicker
					}),
					/* @__PURE__ */ jsxs("h1", {
						className: "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight",
						children: [heroTitleLine1 && /* @__PURE__ */ jsx("span", {
							className: "block",
							children: heroTitleLine1
						}), heroTitleLine2 && /* @__PURE__ */ jsx("span", {
							className: "block bg-gradient-to-r from-accentBlue via-[#3b82f6] to-accentPurple bg-clip-text text-transparent",
							children: heroTitleLine2
						})]
					}),
					heroSubtitle && /* @__PURE__ */ jsx("p", {
						className: "max-w-xl mx-auto text-sm text-slate-500 dark:text-gray-400 font-medium",
						children: heroSubtitle
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-4 select-text",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "w-full search-container relative group",
						children: /* @__PURE__ */ jsx(Input.Search, {
							placeholder: t("search_placeholder"),
							enterButton: t("search_posts"),
							size: "large",
							value: searchInput,
							onChange: (e) => setSearchInput(e.target.value),
							onSearch: (value) => {
								const next = new URLSearchParams(searchParams);
								if (value.trim()) next.set("q", value.trim());
								else next.delete("q");
								next.set("page", "1");
								setSearchParams(next);
							},
							className: "rounded-2xl overflow-hidden search-input-antd premium-search"
						})
					}),
					categories.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ jsx("button", {
							onClick: clearFilters,
							className: `px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${!hasActiveFilter ? "bg-accentBlue text-white border-accentBlue shadow-md shadow-accentBlue/20" : "bg-white dark:bg-slate-900/40 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-slate-800/80 hover:border-accentBlue/30 hover:text-accentBlue"}`,
							children: t("all_posts")
						}), categories.map((cat) => /* @__PURE__ */ jsx("button", {
							onClick: () => toggleFilter("category", cat.slug),
							className: `px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${selectedCategories.includes(cat.slug) ? "bg-accentBlue text-white border-accentBlue shadow-md shadow-accentBlue/20" : "bg-white dark:bg-slate-900/40 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-slate-800/80 hover:border-accentBlue/30 hover:text-accentBlue"}`,
							children: cat.name
						}, cat.id))]
					}),
					tags.length > 0 && /* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap gap-1.5",
						children: tags.slice(0, 24).map((tag) => /* @__PURE__ */ jsxs("button", {
							onClick: () => toggleFilter("tag", tag.slug),
							className: `px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all duration-200 ${selectedTags.includes(tag.slug) ? "bg-accentPurple/20 text-accentPurple border-accentPurple/40" : "bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-gray-500 border-slate-200 dark:border-slate-800/60 hover:border-accentPurple/30 hover:text-accentPurple"}`,
							children: ["#", tag.name]
						}, tag.id))
					}),
					hasActiveFilter && /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/30",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-gray-500",
								children: t("filtering_by")
							}),
							selectedCategories.map((catSlug) => /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1.5 px-2.5 py-1 bg-accentBlue/10 text-accentBlue text-xs font-semibold rounded-full border border-accentBlue/20",
								children: [categories.find((c) => c.slug === catSlug)?.name || catSlug, /* @__PURE__ */ jsx("button", {
									onClick: () => toggleFilter("category", catSlug),
									className: "hover:text-red-500 transition-colors",
									"aria-label": "Remove category",
									children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
								})]
							}, catSlug)),
							selectedTags.map((tagSlug) => /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1.5 px-2.5 py-1 bg-accentPurple/10 text-accentPurple text-xs font-semibold rounded-full border border-accentPurple/20",
								children: [
									"#",
									tags.find((t) => t.slug === tagSlug)?.name || tagSlug,
									/* @__PURE__ */ jsx("button", {
										onClick: () => toggleFilter("tag", tagSlug),
										className: "hover:text-red-500 transition-colors",
										"aria-label": "Remove tag",
										children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
									})
								]
							}, tagSlug)),
							searchQuery && /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1.5 px-2.5 py-1 bg-slate-550/10 text-slate-500 text-xs font-semibold rounded-full border border-slate-500/20",
								children: [
									"\"",
									searchQuery,
									"\"",
									/* @__PURE__ */ jsx("button", {
										onClick: () => {
											const next = new URLSearchParams(searchParams);
											next.delete("q");
											setSearchParams(next);
											setSearchInput("");
										},
										className: "hover:text-red-500 transition-colors",
										"aria-label": "Remove search query",
										children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
									})
								]
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: clearFilters,
								className: "text-xs text-red-500 hover:underline font-semibold ml-2",
								children: "Clear all"
							})
						]
					})
				]
			}),
			loading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-6",
				children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx(PostSkeleton, {}, i))
			}) : posts.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "text-center py-20 space-y-4",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "text-5xl",
						children: "📭"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-slate-500 dark:text-gray-500 text-sm font-medium",
						children: t("no_posts")
					}),
					hasActiveFilter && /* @__PURE__ */ jsx("button", {
						onClick: clearFilters,
						className: "text-accentBlue text-sm font-semibold hover:underline",
						children: t("clear_filter_try_again")
					})
				]
			}) : /* @__PURE__ */ jsx(Image$1.PreviewGroup, { children: /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-6",
				children: posts.map((post) => {
					const coverUrl = post.cover_media?.url ? getFullUrl(post.cover_media.url) : "";
					const readTime = estimateReadTime(post.content || post.excerpt || "");
					const primaryCategory = post.categories?.[0];
					const isPDF = !!post.is_document;
					const cardContent = /* @__PURE__ */ jsxs("article", {
						className: "group flex flex-col justify-between p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-accentBlue/30 dark:hover:border-accentBlue/20 hover:shadow-lg hover:shadow-accentBlue/5 dark:hover:shadow-none transition-all duration-300 h-full",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [coverUrl ? isPDF ? /* @__PURE__ */ jsx(Link, {
								to: `/posts/${post.slug}`,
								className: "block aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/60",
								children: /* @__PURE__ */ jsx("img", {
									src: coverUrl,
									alt: post.title,
									className: "w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500",
									loading: "lazy"
								})
							}) : /* @__PURE__ */ jsx(Link, {
								to: `/posts/${post.slug}`,
								className: "block aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/60",
								children: /* @__PURE__ */ jsx("img", {
									src: coverUrl,
									alt: post.title,
									className: "w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500",
									loading: "lazy"
								})
							}) : isPDF ? /* @__PURE__ */ jsx(Link, {
								to: `/posts/${post.slug}`,
								className: "flex items-center justify-center aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-red-950/40 to-slate-900/60 border border-red-500/15",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col items-center gap-2 text-red-400/70",
									children: [/* @__PURE__ */ jsx(FileText, { className: "w-12 h-12" }), /* @__PURE__ */ jsx("span", {
										className: "text-xs font-bold uppercase tracking-wider",
										children: "PDF Document"
									})]
								})
							}) : null, /* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center gap-1.5",
										children: [primaryCategory && /* @__PURE__ */ jsx("button", {
											onClick: () => toggleFilter("category", primaryCategory.slug),
											className: "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accentBlue bg-accentBlue/8 border border-accentBlue/15 px-2.5 py-1 rounded-full hover:bg-accentBlue/15 transition-colors",
											children: primaryCategory.name
										}), post.tags && post.tags.length > 0 && /* @__PURE__ */ jsxs("div", {
											className: "flex flex-wrap gap-1",
											children: [post.tags.slice(0, 2).map((tag) => /* @__PURE__ */ jsxs("span", {
												className: "text-[10px] bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-gray-400 px-2 py-0.5 rounded font-medium",
												children: ["#", tag.name]
											}, tag.id)), post.tags.length > 2 && /* @__PURE__ */ jsxs("span", {
												className: "text-[10px] bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-gray-500 px-2 py-0.5 rounded font-mono font-bold",
												children: ["+", post.tags.length - 2]
											})]
										})]
									}),
									/* @__PURE__ */ jsx(Link, {
										to: `/posts/${post.slug}`,
										children: /* @__PURE__ */ jsx("h2", {
											className: "text-base font-extrabold text-slate-900 dark:text-white group-hover:text-accentBlue transition-colors leading-snug line-clamp-2",
											children: language === "en" ? post.title_en || post.title : post.title
										})
									}),
									(language === "en" ? post.excerpt_en || post.excerpt : post.excerpt) && /* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-500 dark:text-gray-500 leading-relaxed line-clamp-2",
										children: language === "en" ? post.excerpt_en || post.excerpt : post.excerpt
									})
								]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-3 text-[11px] text-slate-400 dark:text-gray-600 pt-4 border-t border-slate-100 dark:border-slate-800/30 mt-4",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1",
								children: [/* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" }), formatRelative(post.published_at || post.created_at, t)]
							}), /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
									readTime,
									" ",
									t("read_time_mins")
								]
							})]
						})]
					}, post.id);
					return isPDF ? /* @__PURE__ */ jsx(Badge.Ribbon, {
						text: /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase",
							children: [/* @__PURE__ */ jsx(FileText, { className: "w-2.5 h-2.5" }), "PDF"]
						}),
						color: "red",
						placement: "end",
						children: cardContent
					}, post.id) : /* @__PURE__ */ jsx(React.Fragment, { children: cardContent }, post.id);
				})
			}) }),
			total > LIMIT && /* @__PURE__ */ jsx("div", {
				className: "flex justify-center pt-8 select-none",
				children: /* @__PURE__ */ jsx(Pagination, {
					current: currentPage,
					pageSize: LIMIT,
					total,
					onChange: (page) => setPage(page),
					showSizeChanger: false
				})
			})
		]
	});
};
var BlogHome_default = UNSAFE_withComponentProps(BlogHome);
//#endregion
export { BlogHome_default as default, loader };
