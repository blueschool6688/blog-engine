import { m as tagService } from "./api-DYEteWSp.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { n as useLanguage } from "./LanguageContext-FaGWHnxr.js";
import { UNSAFE_withComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, Plus, RotateCcw, Tag } from "lucide-react";
import { Button, Form, Input, Modal, Spin, Switch, Tag as Tag$1, Tooltip } from "antd";
//#region src/pages/Tags.tsx
async function loader() {
	return null;
}
var Tags = () => {
	const { t } = useLanguage();
	const { showSuccess, showError } = useToast();
	const [tags, setTags] = useState([]);
	const [showDeleted, setShowDeleted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [form] = Form.useForm();
	const loadTags = async (includeDeleted = showDeleted) => {
		setLoading(true);
		try {
			const res = await tagService.list(includeDeleted);
			setTags(res.data || []);
		} catch (err) {
			console.error("Failed to load tags", err);
			showError("Failed to retrieve tags.");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		loadTags();
	}, [showDeleted]);
	const handleCreate = async (values) => {
		const trimmed = values.name.trim();
		if (!trimmed) return;
		setSaving(true);
		try {
			await tagService.create({ name: trimmed });
			showSuccess(`Tag "${trimmed}" created successfully.`);
			loadTags();
			form.resetFields();
		} catch (err) {
			console.error("Failed to create tag", err);
			showError(err.response?.data?.message || "Failed to create tag.");
		} finally {
			setSaving(false);
		}
	};
	const handleDelete = (id, name, force = false) => {
		Modal.confirm({
			title: force ? "Permanently Delete Tag?" : "Delete Tag?",
			content: force ? `Are you sure you want to permanently delete "${name}"? This action cannot be undone.` : `Are you sure you want to delete the tag "${name}"? You can restore it later.`,
			okText: force ? "Force Delete" : "Delete",
			okType: "danger",
			cancelText: "Cancel",
			onOk: async () => {
				try {
					await tagService.delete(id, force);
					showSuccess(force ? `Tag "${name}" permanently deleted.` : `Tag "${name}" soft-deleted.`);
					loadTags();
				} catch (err) {
					console.error(err);
					showError(err.response?.data?.message || "Failed to delete tag.");
				}
			}
		});
	};
	const handleRestore = async (id, name) => {
		try {
			await tagService.restore(id);
			showSuccess(`Tag "${name}" restored successfully.`);
			loadTags();
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to restore tag.");
		}
	};
	const activeTags = tags.filter((t) => !t.deleted_at);
	const deletedTags = tags.filter((t) => !!t.deleted_at);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 select-none",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center space-x-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-10 h-10 rounded-xl bg-accentBlue/10 flex items-center justify-center text-accentBlue",
					children: /* @__PURE__ */ jsx(Tag, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight",
					children: t("tags") || "Tags"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-gray-500 mt-1",
					children: "Manage keywords, labels, and tags to classify blog posts"
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
			children: [/* @__PURE__ */ jsxs("div", {
				className: "lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-6 h-fit min-h-[220px]",
				children: [
					/* @__PURE__ */ jsxs("h3", {
						className: "text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4 select-none",
						children: [
							t("active_tags"),
							" (",
							activeTags.length,
							")"
						]
					}),
					loading ? /* @__PURE__ */ jsxs("div", {
						className: "py-12 text-center",
						children: [/* @__PURE__ */ jsx(Spin, { size: "medium" }), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 mt-2 select-none",
							children: "Retrieving tags..."
						})]
					}) : activeTags.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl select-none mb-6",
						children: [/* @__PURE__ */ jsx(Tag, { className: "w-12 h-12 text-gray-600 mx-auto mb-3" }), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500",
							children: "No active tags found. Add one on the right."
						})]
					}) : /* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap gap-2.5 mb-6",
						children: activeTags.map((tag) => /* @__PURE__ */ jsxs(Tag$1, {
							closable: true,
							onClose: (e) => {
								e.preventDefault();
								handleDelete(tag.id, tag.name, false);
							},
							color: "blue",
							className: "rounded-lg border-0 font-bold px-3 py-1 text-xs select-all flex items-center gap-1.5 dark:bg-slate-900 dark:text-accentBlue",
							children: [tag.name, /* @__PURE__ */ jsxs("span", {
								className: "text-[10px] text-gray-500 font-mono font-normal",
								children: [
									"(",
									tag.slug,
									")"
								]
							})]
						}, tag.id))
					}),
					showDeleted && /* @__PURE__ */ jsxs("div", {
						className: "border-t border-slate-200 dark:border-slate-800 pt-6",
						children: [/* @__PURE__ */ jsxs("h3", {
							className: "text-sm font-bold text-red-400 uppercase tracking-wider mb-4 select-none",
							children: [
								t("deleted_tags"),
								" (",
								deletedTags.length,
								")"
							]
						}), deletedTags.length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 select-none",
							children: "No soft-deleted tags."
						}) : /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-2.5",
							children: deletedTags.map((tag) => /* @__PURE__ */ jsxs("div", {
								className: "rounded-lg bg-red-500/10 text-red-500 font-bold px-3 py-1.5 text-xs flex items-center gap-2 border border-red-500/20",
								children: [
									/* @__PURE__ */ jsx("span", { children: tag.name }),
									/* @__PURE__ */ jsxs("span", {
										className: "text-[9px] text-red-400 font-mono font-normal",
										children: [
											"(",
											tag.slug,
											")"
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex gap-1.5 ml-2 border-l border-red-500/20 pl-2",
										children: [/* @__PURE__ */ jsx(Tooltip, {
											title: "Restore Tag",
											children: /* @__PURE__ */ jsx("button", {
												onClick: () => handleRestore(tag.id, tag.name),
												className: "hover:text-emerald-500 transition-colors p-0.5",
												children: /* @__PURE__ */ jsx(RotateCcw, { className: "w-3 h-3" })
											})
										}), /* @__PURE__ */ jsx(Tooltip, {
											title: "Force Delete Permanently",
											children: /* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(tag.id, tag.name, true),
												className: "hover:text-red-650 transition-colors p-0.5",
												children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3 h-3" })
											})
										})]
									})
								]
							}, tag.id))
						})]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30 h-fit select-none",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "text-lg font-bold text-slate-800 dark:text-gray-200 mb-4",
					children: t("create_tag")
				}), /* @__PURE__ */ jsxs(Form, {
					form,
					layout: "vertical",
					onFinish: handleCreate,
					requiredMark: false,
					children: [/* @__PURE__ */ jsx(Form.Item, {
						label: /* @__PURE__ */ jsx("span", {
							className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
							children: t("tag_name")
						}),
						name: "name",
						rules: [{
							required: true,
							message: "Please input tag name!"
						}, {
							max: 100,
							message: "Tag name is too long!"
						}],
						children: /* @__PURE__ */ jsx(Input, {
							placeholder: "e.g. Kubernetes",
							className: "h-10 rounded-xl"
						})
					}), /* @__PURE__ */ jsx(Form.Item, {
						className: "mb-0",
						children: /* @__PURE__ */ jsx(Button, {
							type: "primary",
							htmlType: "submit",
							loading: saving,
							block: true,
							icon: /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
							className: "bg-btn-global hover:brightness-110 border-0 h-10 rounded-xl font-bold flex items-center justify-center gap-1 text-white",
							children: t("create_tag")
						})
					})]
				})]
			})]
		})]
	});
};
var Tags_default = UNSAFE_withComponentProps(Tags);
//#endregion
export { Tags_default as default, loader };
