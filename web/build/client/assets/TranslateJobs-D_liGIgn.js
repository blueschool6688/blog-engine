import { h as translateService } from "./api-DYEteWSp.js";
import { n as useLanguage } from "./LanguageContext-FaGWHnxr.js";
import { UNSAFE_withComponentProps } from "react-router";
import { useCallback, useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, CheckCircle, Clock, Languages, Play, RefreshCw, Trash2 } from "lucide-react";
import { Button, Card, Modal, Space, Table, Tag as Tag$1, Tooltip, message } from "antd";
import dayjs from "dayjs";
//#region src/pages/TranslateJobs.tsx
var TranslateJobs = () => {
	const { language } = useLanguage();
	const [jobs, setJobs] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const limit = 10;
	const [metrics, setMetrics] = useState({
		pending: 0,
		processing: 0,
		done: 0,
		failed: 0
	});
	const loadJobs = useCallback(async () => {
		setLoading(true);
		try {
			const offset = (page - 1) * limit;
			const res = await translateService.listJobs({
				offset,
				limit
			});
			if (res.success && res.data) {
				setJobs(res.data.items || []);
				setTotal(res.data.total || 0);
				const items = res.data.items || [];
				const pendingCount = items.filter((j) => j.status === "pending").length;
				const processingCount = items.filter((j) => j.status === "processing").length;
				const doneCount = items.filter((j) => j.status === "done").length;
				const failedCount = items.filter((j) => j.status === "failed").length;
				setMetrics({
					pending: pendingCount,
					processing: processingCount,
					done: doneCount,
					failed: failedCount
				});
			}
		} catch (err) {
			console.error(err);
			message.error(language === "vi" ? "Không thể tải danh sách tiến trình dịch." : "Failed to load translation jobs.");
		} finally {
			setLoading(false);
		}
	}, [page, language]);
	useEffect(() => {
		loadJobs();
		const interval = setInterval(loadJobs, 5e3);
		return () => clearInterval(interval);
	}, [loadJobs]);
	const handleRetry = async (jobId) => {
		try {
			if ((await translateService.retryJob(jobId)).success) {
				message.success(language === "vi" ? "Đã kích hoạt thử lại thành công!" : "Job retry triggered successfully!");
				loadJobs();
			}
		} catch (err) {
			console.error(err);
			message.error(language === "vi" ? "Không thể thử lại job này." : "Failed to retry job.");
		}
	};
	const handleDelete = (jobId) => {
		Modal.confirm({
			title: language === "vi" ? "Xóa tiến trình dịch" : "Delete Translate Job",
			content: language === "vi" ? "Bạn có chắc chắn muốn xóa tiến trình dịch này khỏi cơ sở dữ liệu?" : "Are you sure you want to delete this translation job from the database?",
			okText: language === "vi" ? "Xóa" : "Delete",
			okType: "danger",
			cancelText: language === "vi" ? "Hủy" : "Cancel",
			onOk: async () => {
				try {
					if ((await translateService.deleteJob(jobId)).success) {
						message.success(language === "vi" ? "Đã xóa tiến trình thành công!" : "Job deleted successfully!");
						loadJobs();
					}
				} catch (err) {
					console.error(err);
					message.error(language === "vi" ? "Không thể xóa job này." : "Failed to delete job.");
				}
			}
		});
	};
	const getStatusTag = (status) => {
		switch (status) {
			case "pending": return /* @__PURE__ */ jsxs(Tag$1, {
				color: "default",
				className: "flex items-center gap-1 w-max font-bold",
				children: [/* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "PENDING" })]
			});
			case "processing": return /* @__PURE__ */ jsxs(Tag$1, {
				color: "processing",
				className: "flex items-center gap-1 w-max font-bold",
				children: [/* @__PURE__ */ jsx(RefreshCw, { className: "w-3.5 h-3.5 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "PROCESSING" })]
			});
			case "done": return /* @__PURE__ */ jsxs(Tag$1, {
				color: "success",
				className: "flex items-center gap-1 w-max font-bold",
				children: [/* @__PURE__ */ jsx(CheckCircle, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "DONE" })]
			});
			case "failed": return /* @__PURE__ */ jsxs(Tag$1, {
				color: "error",
				className: "flex items-center gap-1 w-max font-bold",
				children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "FAILED" })]
			});
			default: return /* @__PURE__ */ jsx(Tag$1, {
				color: "default",
				children: status.toUpperCase()
			});
		}
	};
	const columns = [
		{
			title: "Job ID",
			dataIndex: "job_id",
			key: "job_id",
			className: "font-mono text-xs text-gray-500",
			width: 160,
			render: (id) => /* @__PURE__ */ jsx(Tooltip, {
				title: id,
				children: /* @__PURE__ */ jsxs("span", { children: [
					id.substring(0, 8),
					"...",
					id.substring(id.length - 8)
				] })
			})
		},
		{
			title: language === "vi" ? "Nội dung (Trích đoạn)" : "Content Snippet",
			dataIndex: "content",
			key: "content",
			className: "text-xs text-slate-700 dark:text-slate-300",
			render: (text) => {
				const plainText = text.replace(/<[^>]*>/g, "");
				return plainText.length > 80 ? plainText.substring(0, 80) + "..." : plainText;
			}
		},
		{
			title: language === "vi" ? "Dịch từ/sang" : "Direction",
			key: "direction",
			width: 100,
			align: "center",
			render: (_, record) => /* @__PURE__ */ jsxs(Tag$1, {
				color: "purple",
				className: "font-bold",
				children: [
					(record.source_lang || "VI").toUpperCase(),
					" → ",
					record.target_lang.toUpperCase()
				]
			})
		},
		{
			title: language === "vi" ? "Trạng thái" : "Status",
			dataIndex: "status",
			key: "status",
			width: 130,
			render: (status) => getStatusTag(status)
		},
		{
			title: language === "vi" ? "Ngày khởi tạo" : "Created At",
			dataIndex: "created_at",
			key: "created_at",
			width: 150,
			className: "text-xs text-gray-500",
			render: (dateStr) => dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss")
		},
		{
			title: language === "vi" ? "Thao tác" : "Actions",
			key: "actions",
			width: 120,
			align: "center",
			render: (_, record) => /* @__PURE__ */ jsxs(Space, {
				size: "middle",
				children: [record.status !== "done" && /* @__PURE__ */ jsx(Tooltip, {
					title: language === "vi" ? "Chạy lại job" : "Retry Job",
					children: /* @__PURE__ */ jsx(Button, {
						type: "text",
						icon: /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }),
						onClick: () => handleRetry(record.job_id),
						className: "hover:bg-emerald-500/10 rounded-lg"
					})
				}), /* @__PURE__ */ jsx(Tooltip, {
					title: language === "vi" ? "Xóa job" : "Delete Job",
					children: /* @__PURE__ */ jsx(Button, {
						type: "text",
						danger: true,
						icon: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }),
						onClick: () => handleDelete(record.job_id),
						className: "hover:bg-red-500/10 rounded-lg"
					})
				})]
			})
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6 select-none",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-2 md:grid-cols-4 gap-4",
			children: [
				/* @__PURE__ */ jsxs(Card, {
					className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-gray-400 font-bold uppercase",
							children: language === "vi" ? "Đang chờ" : "Pending"
						}), /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-gray-400" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-2xl font-black text-slate-850 dark:text-white mt-2",
						children: metrics.pending
					})]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-blue-500 font-bold uppercase",
							children: language === "vi" ? "Đang xử lý" : "Processing"
						}), /* @__PURE__ */ jsx(RefreshCw, { className: "w-5 h-5 text-blue-500 animate-spin" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-2xl font-black text-blue-600 mt-2",
						children: metrics.processing
					})]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-emerald-500 font-bold uppercase",
							children: language === "vi" ? "Hoàn thành" : "Completed"
						}), /* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5 text-emerald-500" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-2xl font-black text-emerald-600 mt-2",
						children: metrics.done
					})]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-red-500 font-bold uppercase",
							children: language === "vi" ? "Lỗi" : "Failed"
						}), /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 text-red-500" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-2xl font-black text-red-600 mt-2",
						children: metrics.failed
					})]
				})
			]
		}), /* @__PURE__ */ jsxs(Card, {
			className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex justify-between items-center mb-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Languages, { className: "w-5 h-5 text-accentBlue" }), /* @__PURE__ */ jsx("h2", {
						className: "text-base font-extrabold text-slate-850 dark:text-white",
						children: language === "vi" ? "Danh sách tiến trình dịch AI" : "AI Translation Job Queue"
					})]
				}), /* @__PURE__ */ jsx(Button, {
					type: "primary",
					icon: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
					onClick: loadJobs,
					loading,
					className: "bg-btn-global border-0 rounded-xl",
					children: language === "vi" ? "Làm mới" : "Refresh"
				})]
			}), /* @__PURE__ */ jsx(Table, {
				dataSource: jobs,
				columns,
				rowKey: "id",
				loading,
				pagination: {
					current: page,
					pageSize: limit,
					total,
					onChange: (p) => setPage(p),
					showSizeChanger: false
				},
				className: "premium-table"
			})]
		})]
	});
};
var TranslateJobs_default = UNSAFE_withComponentProps(TranslateJobs);
//#endregion
export { TranslateJobs_default as default };
