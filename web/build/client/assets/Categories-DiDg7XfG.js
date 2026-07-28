import { i as categoryService } from "./api-DYEteWSp.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { n as useLanguage } from "./LanguageContext-FaGWHnxr.js";
import { UNSAFE_withComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, Edit2, Folder, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button, Form, Input, Modal, Select, Space, Switch, Table, Tabs, Tag as Tag$1, Tooltip } from "antd";
//#region src/pages/Categories.tsx
async function loader() {
	return null;
}
var Categories = () => {
	const { t, language } = useLanguage();
	const { showSuccess, showError } = useToast();
	const [categories, setCategories] = useState([]);
	const [showDeleted, setShowDeleted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [form] = Form.useForm();
	const loadCategories = async (includeDeleted = showDeleted) => {
		setLoading(true);
		try {
			const res = await categoryService.list(includeDeleted);
			setCategories(res.data || []);
		} catch (err) {
			console.error("Failed to load categories", err);
			showError("Failed to retrieve categories.");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		loadCategories();
	}, [showDeleted]);
	const handleEdit = (category) => {
		setEditingId(category.id);
		form.setFieldsValue({
			name: category.name,
			name_en: category.name_en || "",
			slug: category.slug,
			slug_en: category.slug_en || "",
			description: category.description || "",
			description_en: category.description_en || "",
			parent_id: category.parent_id || void 0
		});
	};
	const handleCancelEdit = () => {
		setEditingId(null);
		form.resetFields();
	};
	const handleDelete = (id, force = false) => {
		Modal.confirm({
			title: force ? "Permanently Delete Category?" : "Delete Category (Soft Delete)?",
			content: force ? "Are you sure you want to permanently delete this category? This action cannot be undone." : "Are you sure you want to delete this category? You can restore it later from the deleted view.",
			okText: force ? "Force Delete" : "Delete",
			okType: "danger",
			cancelText: "Cancel",
			onOk: async () => {
				try {
					await categoryService.delete(id, force);
					showSuccess(force ? "Category permanently deleted." : "Category soft-deleted successfully.");
					loadCategories();
					if (editingId === id) handleCancelEdit();
				} catch (err) {
					console.error(err);
					showError(err.response?.data?.message || "Failed to delete category.");
				}
			}
		});
	};
	const handleRestore = async (id) => {
		try {
			await categoryService.restore(id);
			showSuccess("Category restored successfully.");
			loadCategories();
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to restore category.");
		}
	};
	const onFinish = async (values) => {
		setSaving(true);
		const payload = {
			...values,
			parent_id: values.parent_id || null
		};
		try {
			if (editingId !== null) {
				if ((await categoryService.update(editingId, payload)).success) {
					showSuccess("Category updated successfully.");
					loadCategories();
					handleCancelEdit();
				}
			} else if ((await categoryService.create(payload)).success) {
				showSuccess("Category created successfully.");
				loadCategories();
				form.resetFields();
			}
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to save category.");
		} finally {
			setSaving(false);
		}
	};
	const getParentOptions = () => {
		return categories.filter((c) => !c.deleted_at && c.id !== editingId).map((c) => ({
			value: c.id,
			label: `${c.name} ${c.name_en ? `(${c.name_en})` : ""}`
		}));
	};
	const columns = [
		{
			title: t("category_name"),
			key: "name",
			render: (_, record) => /* @__PURE__ */ jsxs("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "font-bold text-slate-850 dark:text-gray-200 text-xs md:text-[13.5px]",
					children: [
						record.name,
						" ",
						record.name_en && /* @__PURE__ */ jsxs("span", {
							className: "text-gray-400 font-normal",
							children: ["/ ", record.name_en]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2 items-center",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-mono text-gray-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full select-all",
							children: record.slug
						}),
						record.slug_en && /* @__PURE__ */ jsxs("span", {
							className: "text-[10px] font-mono text-gray-400 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full select-all",
							children: ["en: ", record.slug_en]
						}),
						record.deleted_at && /* @__PURE__ */ jsx(Tag$1, {
							color: "red",
							className: "text-[9px] py-0 px-1 border-0 m-0",
							children: "Deleted"
						})
					]
				})]
			})
		},
		{
			title: t("parent_category"),
			dataIndex: ["parent", "name"],
			key: "parent",
			render: (_, record) => {
				if (record.parent) return /* @__PURE__ */ jsx(Tag$1, {
					color: "blue",
					className: "text-[10px]",
					children: record.parent.name
				});
				return /* @__PURE__ */ jsx("span", {
					className: "text-gray-400 text-xs",
					children: "-"
				});
			}
		},
		{
			title: t("description"),
			key: "description",
			ellipsis: true,
			render: (_, record) => {
				return /* @__PURE__ */ jsx("span", {
					className: "text-xs text-gray-500 font-medium",
					children: (language === "en" ? record.description_en || record.description : record.description) || "-"
				});
			}
		},
		{
			title: t("actions"),
			key: "actions",
			width: 130,
			align: "right",
			render: (_, record) => {
				if (record.deleted_at) return /* @__PURE__ */ jsxs(Space, {
					size: "small",
					children: [/* @__PURE__ */ jsx(Tooltip, {
						title: "Restore Category",
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
							onClick: () => handleDelete(record.id, true),
							className: "bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center p-2 rounded-lg border border-red-500/20"
						})
					})]
				});
				return /* @__PURE__ */ jsxs(Space, {
					size: "small",
					children: [/* @__PURE__ */ jsx(Tooltip, {
						title: "Edit Category",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							icon: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" }),
							onClick: () => handleEdit(record),
							className: "bg-slate-850 hover:bg-slate-800 text-gray-300 flex items-center justify-center p-2 rounded-lg border border-slate-800"
						})
					}), /* @__PURE__ */ jsx(Tooltip, {
						title: "Soft Delete",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							danger: true,
							icon: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }),
							onClick: () => handleDelete(record.id, false),
							className: "bg-dangerRed/10 hover:bg-dangerRed/20 text-dangerRed flex items-center justify-center p-2 rounded-lg border border-dangerRed/20"
						})
					})]
				});
			}
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 select-none",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center space-x-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-10 h-10 rounded-xl bg-accentBlue/10 flex items-center justify-center text-accentBlue",
					children: /* @__PURE__ */ jsx(Folder, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight",
					children: t("categories") || "Categories"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-gray-500 mt-1",
					children: "Organize articles and topics within hierarchical categories"
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 bg-white/40 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-xl px-4 py-2 w-fit",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-xs font-semibold text-slate-700 dark:text-gray-300",
					children: t("show_deleted")
				}), /* @__PURE__ */ jsx(Switch, {
					checked: showDeleted,
					onChange: setShowDeleted,
					size: "small"
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
			children: [/* @__PURE__ */ jsx("div", {
				className: "lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4 h-fit",
				children: /* @__PURE__ */ jsx(Table, {
					columns,
					dataSource: categories,
					rowKey: "id",
					loading,
					pagination: {
						pageSize: 8,
						showSizeChanger: false,
						className: "select-none"
					},
					className: "border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden bg-transparent"
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30 h-fit select-none",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "text-lg font-bold text-slate-800 dark:text-gray-200 mb-4 flex items-center gap-1.5",
					children: editingId !== null ? t("edit_category") : t("create_category")
				}), /* @__PURE__ */ jsxs(Form, {
					form,
					layout: "vertical",
					onFinish,
					requiredMark: false,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: t("parent_category")
							}),
							name: "parent_id",
							children: /* @__PURE__ */ jsx(Select, {
								placeholder: "None (Root Category)",
								options: getParentOptions(),
								allowClear: true,
								className: "h-10 rounded-xl",
								popupClassName: "dark:bg-slate-900 border dark:border-slate-850"
							})
						}),
						/* @__PURE__ */ jsxs(Tabs, {
							defaultActiveKey: "vi",
							size: "small",
							className: "border-b border-slate-200 dark:border-slate-800/60 mb-2",
							children: [/* @__PURE__ */ jsx(Tabs.TabPane, {
								tab: "Tiếng Việt",
								children: /* @__PURE__ */ jsxs("div", {
									className: "space-y-4 pt-2",
									children: [
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: "Tên chuyên mục (VI)"
											}),
											name: "name",
											rules: [{
												required: true,
												message: "Vui lòng nhập tên chuyên mục!"
											}],
											children: /* @__PURE__ */ jsx(Input, {
												placeholder: "Ví dụ: Kiến trúc đám mây",
												className: "h-10 rounded-xl"
											})
										}),
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsxs("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
													children: "Slug VI (Tùy chọn)"
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500 font-normal",
													children: "Tự động tạo từ tên nếu để trống"
												})]
											}),
											name: "slug",
											children: /* @__PURE__ */ jsx(Input, {
												placeholder: "Ví dụ: kien-truc-dam-may",
												className: "h-10 rounded-xl font-mono text-sm"
											})
										}),
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: "Mô tả (VI)"
											}),
											name: "description",
											children: /* @__PURE__ */ jsx(Input.TextArea, {
												rows: 3,
												placeholder: "Mô tả ngắn cho chuyên mục hiển thị...",
												className: "rounded-xl resize-none text-sm"
											})
										})
									]
								})
							}, "vi"), /* @__PURE__ */ jsx(Tabs.TabPane, {
								tab: "English",
								children: /* @__PURE__ */ jsxs("div", {
									className: "space-y-4 pt-2",
									children: [
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: "Category Name (EN)"
											}),
											name: "name_en",
											children: /* @__PURE__ */ jsx(Input, {
												placeholder: "e.g. Cloud Architecture",
												className: "h-10 rounded-xl"
											})
										}),
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsxs("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
													children: "Slug EN (Optional)"
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500 font-normal",
													children: "Auto-generated if left empty"
												})]
											}),
											name: "slug_en",
											children: /* @__PURE__ */ jsx(Input, {
												placeholder: "e.g. cloud-architecture",
												className: "h-10 rounded-xl font-mono text-sm"
											})
										}),
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: "Description (EN)"
											}),
											name: "description_en",
											children: /* @__PURE__ */ jsx(Input.TextArea, {
												rows: 3,
												placeholder: "Short description in English...",
												className: "rounded-xl resize-none text-sm"
											})
										})
									]
								})
							}, "en")]
						}),
						/* @__PURE__ */ jsx(Form.Item, {
							className: "pt-2 mb-0",
							children: /* @__PURE__ */ jsxs(Space, {
								className: "w-full justify-end",
								children: [editingId !== null && /* @__PURE__ */ jsx(Button, {
									onClick: handleCancelEdit,
									className: "rounded-xl font-bold h-9",
									children: "Cancel"
								}), /* @__PURE__ */ jsx(Button, {
									type: "primary",
									htmlType: "submit",
									loading: saving,
									icon: /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
									className: "bg-btn-global hover:brightness-110 border-0 h-9 rounded-xl font-bold flex items-center gap-1 text-white",
									children: editingId !== null ? "Save Changes" : "Create Category"
								})]
							})
						})
					]
				})]
			})]
		})]
	});
};
var Categories_default = UNSAFE_withComponentProps(Categories);
//#endregion
export { Categories_default as default, loader };
