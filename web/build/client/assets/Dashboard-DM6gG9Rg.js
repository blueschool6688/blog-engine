import { c as getFullUrl, o as dashboardService } from "./api-DYEteWSp.js";
import { Link, UNSAFE_withComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Calendar, CheckCircle, Clock, Edit2, Eye, FileText, Folder, HardDrive, Image, Plus, Tag, Upload } from "lucide-react";
import { Skeleton } from "antd";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as Tooltip$1, XAxis, YAxis } from "recharts";
//#region src/pages/Dashboard.tsx
async function loader() {
	return null;
}
var Dashboard = () => {
	const [stats, setStats] = useState({
		totalPosts: 0,
		publishedPosts: 0,
		draftPosts: 0,
		mediaCount: 0,
		categoryCount: 0,
		tagCount: 0,
		storageUsageMB: 0,
		postsByMonth: [],
		viewsByDay: [],
		recentPosts: []
	});
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await dashboardService.getStats();
				if (res.success && res.data) {
					const d = res.data;
					setStats({
						totalPosts: d.total_posts,
						publishedPosts: d.published_posts,
						draftPosts: d.draft_posts,
						mediaCount: d.media_count,
						categoryCount: d.category_count,
						tagCount: d.tag_count,
						storageUsageMB: d.storage_usage_mb,
						postsByMonth: d.posts_by_month,
						viewsByDay: d.views_by_day || [],
						recentPosts: d.recent_posts || []
					});
				}
			} catch (err) {
				console.error("Failed to load dashboard stats", err);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);
	const statCards = [
		{
			title: "Total Posts",
			value: stats.totalPosts,
			icon: FileText,
			color: "from-accentBlue/20 to-accentBlue/5",
			border: "hover:border-accentBlue/50 hover:shadow-accentBlue/5",
			iconColor: "text-accentBlue"
		},
		{
			title: "Published Posts",
			value: stats.publishedPosts,
			icon: CheckCircle,
			color: "from-successGreen/20 to-successGreen/5",
			border: "hover:border-successGreen/50 hover:shadow-successGreen/5",
			iconColor: "text-successGreen"
		},
		{
			title: "Draft Posts",
			value: stats.draftPosts,
			icon: Clock,
			color: "from-warningYellow/20 to-warningYellow/5",
			border: "hover:border-warningYellow/50 hover:shadow-warningYellow/5",
			iconColor: "text-warningYellow"
		},
		{
			title: "Categories",
			value: stats.categoryCount,
			icon: Folder,
			color: "from-amber-500/20 to-amber-500/5",
			border: "hover:border-amber-500/50 hover:shadow-amber-500/5",
			iconColor: "text-amber-500"
		},
		{
			title: "Tags",
			value: stats.tagCount,
			icon: Tag,
			color: "from-rose-500/20 to-rose-500/5",
			border: "hover:border-rose-500/50 hover:shadow-rose-500/5",
			iconColor: "text-rose-500"
		},
		{
			title: "Media Files",
			value: stats.mediaCount,
			icon: Image,
			color: "from-accentPurple/20 to-accentPurple/5",
			border: "hover:border-accentPurple/50 hover:shadow-accentPurple/5",
			iconColor: "text-accentPurple"
		},
		{
			title: "Storage Usage",
			value: `${stats.storageUsageMB.toFixed(2)} MB`,
			icon: HardDrive,
			color: "from-cyan-500/20 to-cyan-500/5",
			border: "hover:border-cyan-500/50 hover:shadow-cyan-500/5",
			iconColor: "text-cyan-500"
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent",
				children: "Dashboard"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-500 mt-1",
				children: "Real-time statistics, monthly analytics, and site status overview."
			})] }),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
				children: statCards.map((card) => {
					const Icon = card.icon;
					return /* @__PURE__ */ jsxs("div", {
						className: `glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card.border}`,
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs font-semibold text-gray-500 uppercase tracking-wider",
							children: card.title
						}), loading ? /* @__PURE__ */ jsx(Skeleton, {
							active: true,
							paragraph: false,
							title: { width: "4rem" },
							className: "mt-2"
						}) : /* @__PURE__ */ jsx("h3", {
							className: "text-2xl font-bold mt-1 text-slate-850 dark:text-gray-100",
							children: card.value
						})] }), /* @__PURE__ */ jsx("div", {
							className: `w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center shrink-0 shadow-sm`,
							children: /* @__PURE__ */ jsx(Icon, { className: `w-5 h-5 ${card.iconColor}` })
						})]
					}, card.title);
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 bg-slate-900/30",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "text-lg font-bold text-slate-800 dark:text-gray-200",
						children: "Daily Page Views"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-500 mt-0.5",
						children: "Tracking website traffic and readership logs over the last 30 days."
					})] }), /* @__PURE__ */ jsx("div", {
						className: "h-[280px] w-full pt-4",
						children: loading ? /* @__PURE__ */ jsx("div", {
							className: "w-full h-full flex items-center justify-center",
							children: /* @__PURE__ */ jsx(Skeleton, {
								active: true,
								paragraph: { rows: 6 },
								title: false
							})
						}) : /* @__PURE__ */ jsx(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ jsxs(AreaChart, {
								data: stats.viewsByDay,
								margin: {
									top: 10,
									right: 10,
									left: -20,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ jsx(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "#1e293b",
										opacity: .4
									}),
									/* @__PURE__ */ jsx(XAxis, {
										dataKey: "date",
										stroke: "#64748b",
										fontSize: 9,
										tickLine: false,
										tickFormatter: (tick) => {
											if (!tick || tick.length < 10) return tick;
											return tick.substring(5);
										}
									}),
									/* @__PURE__ */ jsx(YAxis, {
										stroke: "#64748b",
										fontSize: 10,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ jsx(Tooltip$1, { contentStyle: {
										backgroundColor: "#0f172a",
										borderColor: "#1e293b",
										borderRadius: "12px",
										color: "#f8fafc",
										fontSize: "12px"
									} }),
									/* @__PURE__ */ jsx(Area, {
										type: "monotone",
										dataKey: "count",
										stroke: "#3b82f6",
										strokeWidth: 2,
										fill: "url(#viewsGlow)"
									}),
									/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
										id: "viewsGlow",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ jsx("stop", {
											offset: "5%",
											stopColor: "#3b82f6",
											stopOpacity: .4
										}), /* @__PURE__ */ jsx("stop", {
											offset: "95%",
											stopColor: "#3b82f6",
											stopOpacity: 0
										})]
									}) })
								]
							})
						})
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50 flex flex-col justify-between bg-slate-900/30",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "text-lg font-bold text-slate-800 dark:text-gray-200",
							children: "Quick Actions"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 mt-0.5",
							children: "Shortcuts to common operations."
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-4 py-6",
							children: [/* @__PURE__ */ jsxs(Link, {
								to: "/admin/posts/new",
								className: "flex items-center justify-center space-x-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white font-medium py-3 px-5 rounded-xl transition-all shadow-md shadow-accentBlue/10 text-sm",
								children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Create New Post" })]
							}), /* @__PURE__ */ jsxs(Link, {
								to: "/admin/media",
								className: "flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 text-slate-750 dark:text-gray-100 font-medium py-3 px-5 rounded-xl transition-all text-sm",
								children: [/* @__PURE__ */ jsx(Upload, { className: "w-4 h-4 text-accentPurple" }), /* @__PURE__ */ jsx("span", { children: "Upload Media Files" })]
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "border-t border-slate-200 dark:border-slate-800/80 pt-4 text-[10px] text-gray-500",
							children: "Current system version: 1.0.5 • Operational"
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 bg-slate-900/30",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between mb-6",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "text-lg font-bold text-slate-800 dark:text-gray-200",
						children: "Recent Posts"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-500 mt-0.5",
						children: "Quick lookup of the latest created articles."
					})] }), /* @__PURE__ */ jsx(Link, {
						to: "/admin/posts",
						className: "text-xs font-semibold text-accentBlue hover:text-accentBlue/80 transition-colors",
						children: "View All Posts"
					})]
				}), loading ? /* @__PURE__ */ jsx("div", {
					className: "space-y-3",
					children: [
						1,
						2,
						3
					].map((i) => /* @__PURE__ */ jsx("div", {
						className: "p-4 bg-slate-950/40 border border-slate-800/40 rounded-xl",
						children: /* @__PURE__ */ jsx(Skeleton, {
							active: true,
							avatar: {
								size: 40,
								shape: "square"
							},
							paragraph: {
								rows: 1,
								width: "60%"
							},
							title: { width: "80%" }
						})
					}, i))
				}) : stats.recentPosts.length === 0 ? /* @__PURE__ */ jsx("div", {
					className: "py-8 text-center text-gray-500 text-sm",
					children: "No posts created yet."
				}) : /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4",
					children: stats.recentPosts.map((post) => /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-slate-950/40 border border-slate-800/40 hover:border-slate-800 rounded-xl transition-all gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center space-x-4 min-w-0",
							children: [post.cover_media ? /* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-900 flex items-center justify-center",
								children: /* @__PURE__ */ jsx("img", {
									src: getFullUrl(post.cover_media.thumbnail_url || post.cover_media.url),
									alt: "",
									className: "object-cover w-full h-full"
								})
							}) : /* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 rounded-lg border border-slate-800 bg-slate-900/50 shrink-0 flex items-center justify-center",
								children: /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-gray-600" })
							}), /* @__PURE__ */ jsxs("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ jsx("h4", {
									className: "font-semibold text-slate-800 dark:text-gray-200 truncate max-w-sm text-sm",
									children: post.title
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center space-x-3 mt-1.5 text-xs text-gray-500",
									children: [
										/* @__PURE__ */ jsxs("span", {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" }), new Date(post.created_at).toLocaleDateString()]
										}),
										/* @__PURE__ */ jsx("span", { children: "•" }),
										/* @__PURE__ */ jsxs("span", {
											className: "flex items-center gap-1",
											children: [
												/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }),
												post.view_count || 0,
												" views"
											]
										})
									]
								})]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between lg:justify-end gap-4",
							children: [post.status === "published" ? /* @__PURE__ */ jsx("span", {
								className: "inline-flex items-center bg-successGreen/10 border border-successGreen/20 text-successGreen text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
								children: "Published"
							}) : /* @__PURE__ */ jsx("span", {
								className: "inline-flex items-center bg-warningYellow/10 border border-warningYellow/20 text-warningYellow text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
								children: "Draft"
							}), /* @__PURE__ */ jsx(Link, {
								to: `/admin/posts/edit/${post.id}`,
								className: "p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-500 dark:text-gray-400 hover:text-accentBlue transition-colors shrink-0",
								title: "Edit post",
								children: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" })
							})]
						})]
					}, post.id))
				})]
			})
		]
	});
};
var Dashboard_default = UNSAFE_withComponentProps(Dashboard);
//#endregion
export { Dashboard_default as default, loader };
