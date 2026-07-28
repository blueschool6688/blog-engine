import { s as feedbackService } from "./api-DYEteWSp.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { UNSAFE_withComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Archive, CheckCircle2, Loader, MessageSquare, RefreshCw, Star, Trash2 } from "lucide-react";
//#region src/pages/FeedbacksAdmin.tsx
async function loader() {
	return null;
}
var FeedbacksAdmin = () => {
	const { showSuccess, showError } = useToast();
	const [feedbacks, setFeedbacks] = useState([]);
	const [loading, setLoading] = useState(false);
	const [statusFilter, setStatusFilter] = useState("");
	const [offset, setOffset] = useState(0);
	const limit = 15;
	const fetchFeedbacks = async () => {
		setLoading(true);
		try {
			const res = await feedbackService.listFeedbacks({
				status: statusFilter || void 0,
				offset,
				limit
			});
			if (res.success && res.data) setFeedbacks(res.data.items || []);
		} catch (err) {
			showError(err.response?.data?.message || "Failed to fetch feedbacks");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchFeedbacks();
	}, [statusFilter, offset]);
	const handleUpdateStatus = async (id, status) => {
		try {
			const res = await feedbackService.updateFeedbackStatus(id, status);
			if (res.success) {
				showSuccess(`Feedback marked as ${status}`);
				setFeedbacks(feedbacks.map((fb) => fb.id === id ? res.data : fb));
			}
		} catch (err) {
			showError(err.response?.data?.message || "Failed to update feedback status");
		}
	};
	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to permanently delete this feedback?")) return;
		try {
			if ((await feedbackService.deleteFeedback(id)).success) {
				showSuccess("Feedback deleted successfully");
				setFeedbacks(feedbacks.filter((fb) => fb.id !== id));
			}
		} catch (err) {
			showError(err.response?.data?.message || "Failed to delete feedback");
		}
	};
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		return new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-2xl font-bold tracking-tight text-slate-850 dark:text-white",
				children: "User Feedbacks"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-400",
				children: "View and moderate reader suggestions, reviews, and bug reports."
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center space-x-3",
				children: [/* @__PURE__ */ jsxs("select", {
					value: statusFilter,
					onChange: (e) => {
						setStatusFilter(e.target.value);
						setOffset(0);
					},
					className: "px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-gray-250 rounded-xl text-sm focus:outline-none",
					children: [
						/* @__PURE__ */ jsx("option", {
							value: "",
							children: "All Statuses"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "pending",
							children: "Pending"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "reviewed",
							children: "Reviewed"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "archived",
							children: "Archived"
						})
					]
				}), /* @__PURE__ */ jsx("button", {
					onClick: fetchFeedbacks,
					disabled: loading,
					className: "p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-850 dark:hover:text-gray-200 transition-all disabled:opacity-50",
					title: "Refresh feedbacks",
					children: /* @__PURE__ */ jsx(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` })
				})]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-900/30",
			children: loading && feedbacks.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "py-20 text-center space-y-4",
				children: [/* @__PURE__ */ jsx(Loader, { className: "w-10 h-10 animate-spin text-accentBlue mx-auto" }), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500",
					children: "Retrieving feedbacks list..."
				})]
			}) : feedbacks.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "py-20 text-center space-y-4",
				children: [/* @__PURE__ */ jsx(MessageSquare, { className: "w-12 h-12 text-gray-600 mx-auto" }), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500",
					children: "No feedbacks found."
				})]
			}) : /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left border-collapse",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "border-b border-slate-200 dark:border-slate-800/50 text-xs font-semibold text-gray-450 uppercase bg-slate-100/50 dark:bg-slate-900/10",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6",
								children: "Sender"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6",
								children: "Rating"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6",
								children: "Message"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6",
								children: "Submitted"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6 text-center",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6 text-right",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800/40",
						children: feedbacks.map((fb) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors",
							children: [
								/* @__PURE__ */ jsxs("td", {
									className: "py-4 px-6",
									children: [/* @__PURE__ */ jsx("div", {
										className: "font-semibold text-slate-800 dark:text-gray-150",
										children: fb.name
									}), /* @__PURE__ */ jsx("div", {
										className: "text-xs text-gray-500 truncate max-w-[200px]",
										title: fb.email,
										children: fb.email
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-4 px-6",
									children: /* @__PURE__ */ jsx("div", {
										className: "flex space-x-0.5",
										children: [
											1,
											2,
											3,
											4,
											5
										].map((star) => /* @__PURE__ */ jsx(Star, { className: `w-3.5 h-3.5 ${star <= fb.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"}` }, star))
									})
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-4 px-6 max-w-sm",
									children: [fb.subject && /* @__PURE__ */ jsx("div", {
										className: "font-semibold text-xs text-accentPurple mb-0.5 truncate",
										children: fb.subject
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-700 dark:text-gray-300 whitespace-pre-line line-clamp-3",
										children: fb.content
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-4 px-6 text-xs text-gray-500",
									children: formatDate(fb.created_at)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-4 px-6 text-center",
									children: /* @__PURE__ */ jsx("span", {
										className: `inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${fb.status === "pending" ? "bg-warningYellow/10 text-warningYellow border border-warningYellow/20" : fb.status === "reviewed" ? "bg-successGreen/10 text-successGreen border border-successGreen/20" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-gray-400"}`,
										children: fb.status
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-4 px-6 text-right",
									children: /* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-end space-x-2",
										children: [
											fb.status === "pending" && /* @__PURE__ */ jsx("button", {
												onClick: () => handleUpdateStatus(fb.id, "reviewed"),
												className: "p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-lg text-successGreen transition-colors",
												title: "Mark as reviewed",
												children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" })
											}),
											fb.status !== "archived" && /* @__PURE__ */ jsx("button", {
												onClick: () => handleUpdateStatus(fb.id, "archived"),
												className: "p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-lg text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors",
												title: "Archive feedback",
												children: /* @__PURE__ */ jsx(Archive, { className: "w-4 h-4" })
											}),
											/* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(fb.id),
												className: "p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-lg text-gray-500 hover:text-dangerRed transition-colors",
												title: "Delete feedback",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
											})
										]
									})
								})
							]
						}, fb.id))
					})]
				})
			})
		})]
	});
};
var FeedbacksAdmin_default = UNSAFE_withComponentProps(FeedbacksAdmin);
//#endregion
export { FeedbacksAdmin_default as default, loader };
