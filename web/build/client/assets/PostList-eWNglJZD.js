import { l as postService, p as tagService, r as categoryService, s as getFullUrl } from "./api-CItDfJrl.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { n as useLanguage } from "./LanguageContext-DOrz_C39.js";
import { Link, UNSAFE_withComponentProps, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, Edit2, FileText, Plus, RotateCcw, Search, Star, Trash2 } from "lucide-react";
import { Button, Input, Modal, Select, Space, Switch, Table, Tag as Tag$1, Tooltip } from "antd";
//#region src/pages/PostList.tsx
async function loader() {
	return null;
}
var PostList = () => {
	const { t } = useLanguage();
	const { showSuccess, showError } = useToast();
	const navigate = useNavigate();
	const [posts, setPosts] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [showDeleted, setShowDeleted] = useState(false);
	const [statusFilter, setStatusFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState(void 0);
	const [tagFilter, setTagFilter] = useState(void 0);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const limit = 10;
	const [allCategories, setAllCategories] = useState([]);
	const [allTags, setAllTags] = useState([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [deletePostId, setDeletePostId] = useState(null);
	const [isForceDelete, setIsForceDelete] = useState(false);
	const [isBulkLoading, setIsBulkLoading] = useState(false);
	useEffect(() => {
		const fetchFilters = async () => {
			try {
				const [catRes, tagRes] = await Promise.all([categoryService.list(), tagService.list()]);
				setAllCategories(catRes.data || []);
				setAllTags(tagRes.data || []);
			} catch (err) {
				console.error("Failed to load filter options", err);
			}
		};
		fetchFilters();
	}, []);
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
			setCurrentPage(1);
		}, 400);
		return () => clearTimeout(handler);
	}, [searchQuery]);
	const fetchPosts = async () => {
		setLoading(true);
		try {
			const offset = (currentPage - 1) * limit;
			const response = await postService.list(offset, limit, statusFilter, debouncedSearchQuery, categoryFilter, tagFilter, void 0, showDeleted);
			setPosts(response.data.items || []);
			setTotal(response.data.total || 0);
		} catch (err) {
			console.error("Failed to load posts", err);
			showError("Failed to load posts");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchPosts();
	}, [
		currentPage,
		statusFilter,
		debouncedSearchQuery,
		categoryFilter,
		tagFilter,
		showDeleted
	]);
	const handleBulkAction = async (action) => {
		if (selectedRowKeys.length === 0) return;
		setIsBulkLoading(true);
		try {
			const ids = selectedRowKeys.map((key) => Number(key));
			if (action === "delete") {
				await Promise.all(ids.map((id) => postService.delete(id, false)));
				showSuccess("Selected posts soft-deleted successfully");
			} else {
				await Promise.all(ids.map((id) => postService.update(id, { status: action === "publish" ? "published" : "draft" })));
				showSuccess(`Selected posts status updated to ${action}`);
			}
			setSelectedRowKeys([]);
			fetchPosts();
		} catch (err) {
			console.error("Bulk action failed", err);
			showError("Failed to complete bulk action");
		} finally {
			setIsBulkLoading(false);
		}
	};
	const handleDeleteConfirm = async () => {
		if (!deletePostId) return;
		try {
			await postService.delete(deletePostId, isForceDelete);
			showSuccess(isForceDelete ? "Post permanently deleted." : "Post soft-deleted successfully.");
			setDeletePostId(null);
			fetchPosts();
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to delete post");
		}
	};
	const handleRestore = async (id) => {
		try {
			await postService.restore(id);
			showSuccess("Post restored successfully.");
			fetchPosts();
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to restore post");
		}
	};
	const onSelectChange = (newSelectedRowKeys) => {
		setSelectedRowKeys(newSelectedRowKeys);
	};
	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange
	};
	const columns = [
		{
			title: "Cover",
			dataIndex: "cover_media",
			key: "cover_media",
			width: 80,
			render: (_, record) => {
				if (record.cover_media) return /* @__PURE__ */ jsx("div", {
					className: "w-12 h-12 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800",
					children: /* @__PURE__ */ jsx("img", {
						src: getFullUrl(record.cover_media.thumbnail_url || record.cover_media.url),
						alt: "",
						className: "object-cover w-full h-full"
					})
				});
				return /* @__PURE__ */ jsx("div", {
					className: "w-12 h-12 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-center",
					children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 text-gray-650" })
				});
			}
		},
		{
			title: t("table_title"),
			dataIndex: "title",
			key: "title",
			render: (text, record) => /* @__PURE__ */ jsxs("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ jsx("span", {
					className: "font-bold text-slate-850 dark:text-gray-200 block text-[13.5px] hover:text-accentBlue transition-colors",
					children: /* @__PURE__ */ jsx(Link, {
						to: `/admin/posts/edit/${record.id}`,
						children: text
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap gap-2 items-center",
					children: [
						record.is_featured && /* @__PURE__ */ jsxs(Tag$1, {
							color: "gold",
							className: "flex items-center gap-1 border-0 uppercase font-black text-[9px] px-2 py-0.5 tracking-wide",
							children: [/* @__PURE__ */ jsx(Star, { className: "w-2.5 h-2.5 fill-current" }), "Featured"]
						}),
						record.is_document && /* @__PURE__ */ jsxs(Tag$1, {
							color: "red",
							className: "flex items-center gap-1 border-0 uppercase font-black text-[9px] px-2 py-0.5 tracking-wide",
							children: [/* @__PURE__ */ jsx(FileText, { className: "w-2.5 h-2.5" }), "PDF"]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-[10px] text-gray-500 font-mono",
							children: ["views: ", record.view_count || 0]
						}),
						record.deleted_at && /* @__PURE__ */ jsx(Tag$1, {
							color: "error",
							className: "border-0 text-[9px] font-bold px-1.5 py-0",
							children: "Deleted"
						})
					]
				})]
			})
		},
		{
			title: t("table_author"),
			dataIndex: ["author", "name"],
			key: "author",
			width: 140,
			render: (text) => /* @__PURE__ */ jsx("span", {
				className: "text-xs text-gray-500 font-semibold",
				children: text || "-"
			})
		},
		{
			title: t("table_category"),
			dataIndex: "categories",
			key: "categories",
			width: 150,
			render: (_, record) => {
				const cat = record.categories?.[0];
				return cat ? /* @__PURE__ */ jsx(Tag$1, {
					color: "purple",
					className: "rounded-lg border-0 font-bold px-2.5 py-0.5 text-xs",
					children: cat.name
				}) : /* @__PURE__ */ jsx("span", {
					className: "text-gray-500 text-xs",
					children: "-"
				});
			}
		},
		{
			title: t("table_status"),
			dataIndex: "status",
			key: "status",
			width: 120,
			render: (status) => {
				const isPublished = status === "published";
				return /* @__PURE__ */ jsx(Tag$1, {
					color: isPublished ? "success" : "warning",
					className: "rounded-lg border-0 uppercase font-bold tracking-wider px-2 py-0.5 text-[9px]",
					children: isPublished ? "Published" : "Draft"
				});
			}
		},
		{
			title: t("table_actions"),
			key: "actions",
			width: 130,
			align: "right",
			render: (_, record) => {
				if (record.deleted_at) return /* @__PURE__ */ jsxs(Space, {
					size: "small",
					children: [/* @__PURE__ */ jsx(Tooltip, {
						title: "Restore Post",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							icon: /* @__PURE__ */ jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
							onClick: () => handleRestore(record.id),
							className: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center p-2 rounded-lg border border-emerald-500/20"
						})
					}), /* @__PURE__ */ jsx(Tooltip, {
						title: "Force Delete Permanently",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							danger: true,
							icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5" }),
							onClick: () => {
								setIsForceDelete(true);
								setDeletePostId(record.id);
							},
							className: "bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center p-2 rounded-lg border border-red-500/20"
						})
					})]
				});
				return /* @__PURE__ */ jsxs(Space, {
					size: "middle",
					children: [/* @__PURE__ */ jsx(Tooltip, {
						title: "Edit Post",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							icon: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" }),
							onClick: () => navigate(`/admin/posts/edit/${record.id}`),
							className: "bg-slate-800 hover:bg-slate-700/80 text-gray-300 flex items-center justify-center p-2 rounded-lg border border-slate-750"
						})
					}), /* @__PURE__ */ jsx(Tooltip, {
						title: "Delete Post",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							danger: true,
							icon: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }),
							onClick: () => {
								setIsForceDelete(false);
								setDeletePostId(record.id);
							},
							className: "bg-dangerRed/10 hover:bg-dangerRed/20 text-dangerRed flex items-center justify-center p-2 rounded-lg border border-dangerRed/20"
						})
					})]
				});
			}
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight",
					children: t("posts_management")
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-gray-500 mt-1",
					children: t("posts_management_desc")
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 bg-white/40 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-xl px-4 py-2 w-fit",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs font-semibold text-slate-700 dark:text-gray-300",
							children: "Show Deleted"
						}), /* @__PURE__ */ jsx(Switch, {
							checked: showDeleted,
							onChange: setShowDeleted,
							size: "small"
						})]
					}), /* @__PURE__ */ jsxs(Link, {
						to: "/admin/posts/new",
						className: "inline-flex items-center gap-1.5 px-4 py-2.5 bg-btn-global hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-accentBlue/10 select-none",
						children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: t("create_post") })]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-900/30 p-4 space-y-4",
				children: [
					selectedRowKeys.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "bg-slate-900/60 border border-slate-800/50 p-3.5 rounded-xl flex items-center justify-between animate-fade-in z-20",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center space-x-3 select-none",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-xs bg-accentBlue/15 border border-accentBlue/25 text-accentBlue px-2.5 py-1 rounded-full font-semibold",
								children: [selectedRowKeys.length, " Selected"]
							}), /* @__PURE__ */ jsx(Button, {
								type: "text",
								size: "small",
								onClick: () => setSelectedRowKeys([]),
								className: "text-xs text-gray-400 hover:text-white font-medium",
								children: "Clear"
							})]
						}), /* @__PURE__ */ jsxs(Space, { children: [
							/* @__PURE__ */ jsx(Button, {
								loading: isBulkLoading,
								onClick: () => handleBulkAction("publish"),
								className: "bg-slate-850 hover:bg-slate-800 border-slate-800 text-successGreen hover:text-successGreen text-xs h-9 rounded-xl font-bold",
								children: t("filter_published")
							}),
							/* @__PURE__ */ jsx(Button, {
								loading: isBulkLoading,
								onClick: () => handleBulkAction("draft"),
								className: "bg-slate-850 hover:bg-slate-800 border-slate-800 text-warningYellow hover:text-warningYellow text-xs h-9 rounded-xl font-bold",
								children: t("filter_draft")
							}),
							/* @__PURE__ */ jsx(Button, {
								danger: true,
								loading: isBulkLoading,
								onClick: () => handleBulkAction("delete"),
								className: "bg-dangerRed/10 border-dangerRed/20 text-dangerRed text-xs h-9 rounded-xl font-bold",
								children: t("bulk_delete")
							})
						] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-3",
							children: [
								/* @__PURE__ */ jsx(Select, {
									value: statusFilter,
									onChange: (val) => {
										setStatusFilter(val);
										setCurrentPage(1);
									},
									options: [
										{
											label: t("filter_all"),
											value: ""
										},
										{
											label: t("filter_published"),
											value: "published"
										},
										{
											label: t("filter_draft"),
											value: "draft"
										}
									],
									className: "w-36 h-9 rounded-xl"
								}),
								/* @__PURE__ */ jsx(Select, {
									placeholder: "All Categories",
									allowClear: true,
									value: categoryFilter,
									onChange: (val) => {
										setCategoryFilter(val);
										setCurrentPage(1);
									},
									className: "w-44 h-9",
									children: allCategories.map((cat) => /* @__PURE__ */ jsx(Select.Option, {
										value: cat.id,
										children: cat.name
									}, cat.id))
								}),
								/* @__PURE__ */ jsx(Select, {
									placeholder: "All Tags",
									allowClear: true,
									value: tagFilter,
									onChange: (val) => {
										setTagFilter(val);
										setCurrentPage(1);
									},
									className: "w-40 h-9",
									children: allTags.map((tag) => /* @__PURE__ */ jsx(Select.Option, {
										value: tag.id,
										children: tag.name
									}, tag.id))
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 w-full lg:w-auto",
							children: [/* @__PURE__ */ jsx(Input, {
								placeholder: "Search posts...",
								prefix: /* @__PURE__ */ jsx(Search, { className: "w-3.5 h-3.5 text-gray-500 mr-1" }),
								value: searchQuery,
								onChange: (e) => setSearchQuery(e.target.value),
								className: "w-full lg:w-64 h-9 rounded-xl"
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-gray-500 shrink-0 font-mono",
								children: ["Total: ", total]
							})]
						})]
					}),
					/* @__PURE__ */ jsx(Table, {
						rowSelection,
						columns,
						dataSource: posts,
						rowKey: "id",
						loading,
						pagination: {
							current: currentPage,
							pageSize: limit,
							total,
							onChange: (page) => setCurrentPage(page),
							showSizeChanger: false,
							className: "select-none"
						},
						className: "border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden bg-transparent"
					})
				]
			}),
			/* @__PURE__ */ jsx(Modal, {
				title: /* @__PURE__ */ jsxs("span", {
					className: "font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2 select-none",
					children: [/* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5 text-dangerRed" }), isForceDelete ? "Permanently Delete Article?" : "Delete Article (Soft Delete)?"]
				}),
				open: deletePostId !== null,
				onOk: handleDeleteConfirm,
				onCancel: () => setDeletePostId(null),
				okText: isForceDelete ? "Force Delete" : t("btn_delete") || "Delete",
				cancelText: t("btn_cancel") || "Cancel",
				okButtonProps: {
					danger: true,
					className: "rounded-xl font-bold h-9"
				},
				cancelButtonProps: { className: "rounded-xl font-bold h-9" },
				className: "select-none",
				children: /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500 mt-3 mb-2 font-medium leading-relaxed select-text",
					children: isForceDelete ? "Are you sure you want to permanently delete this article? This action is irreversible." : "Are you sure you want to delete this article? You can restore it later from the deleted view."
				})
			})
		]
	});
};
var PostList_default = UNSAFE_withComponentProps(PostList);
//#endregion
export { PostList_default as default, loader };
