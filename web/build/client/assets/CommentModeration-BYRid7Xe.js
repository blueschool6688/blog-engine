import { a as commentService } from "./api-DYEteWSp.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { t as ConfirmModal } from "./ConfirmModal-v1UHWXWR.js";
import { UNSAFE_withComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, Check, Clock, Loader, MessageSquare, RefreshCw, Trash2, X } from "lucide-react";
//#region src/pages/CommentModeration.tsx
async function loader() {
	return null;
}
var CommentModeration = () => {
	const [comments, setComments] = useState([]);
	const [total, setTotal] = useState(0);
	const [pendingCount, setPendingCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState("pending");
	const [page, setPage] = useState(1);
	const limit = 10;
	const [deleteCommentId, setDeleteCommentId] = useState(null);
	const { showSuccess, showError } = useToast();
	const fetchComments = async () => {
		setLoading(true);
		try {
			const offset = (page - 1) * limit;
			const res = await commentService.listAll({
				status: statusFilter || void 0,
				offset,
				limit
			});
			if (res.success && res.data) {
				setComments(res.data.items || []);
				setTotal(res.data.total || 0);
			}
			const countRes = await commentService.getPendingCount();
			if (countRes.success && countRes.data) setPendingCount(countRes.data.count || 0);
		} catch (err) {
			console.error(err);
			showError("Failed to load comments");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchComments();
	}, [statusFilter, page]);
	const handleApprove = async (id) => {
		try {
			await commentService.approve(id);
			showSuccess("Comment approved successfully");
			fetchComments();
		} catch (err) {
			console.error(err);
			showError("Failed to approve comment");
		}
	};
	const handleReject = async (id) => {
		try {
			await commentService.reject(id);
			showSuccess("Comment rejected successfully");
			fetchComments();
		} catch (err) {
			console.error(err);
			showError("Failed to reject comment");
		}
	};
	const confirmDelete = async () => {
		if (deleteCommentId === null) return;
		try {
			await commentService.deleteComment(deleteCommentId);
			showSuccess("Comment deleted permanently");
			fetchComments();
		} catch (err) {
			console.error(err);
			showError("Failed to delete comment");
		} finally {
			setDeleteCommentId(null);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx(ConfirmModal, {
				isOpen: deleteCommentId !== null,
				title: "Delete Comment",
				message: "Are you sure you want to permanently delete this comment? This action cannot be undone.",
				onConfirm: confirmDelete,
				onCancel: () => setDeleteCommentId(null)
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent",
					children: "Comment Moderation"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500 mt-1",
					children: "Review reader comments, approve quality contributions, or reject spam."
				})] }), pendingCount > 0 && /* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl text-amber-500 text-xs font-bold uppercase tracking-wider self-start sm:self-auto",
					children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }), /* @__PURE__ */ jsxs("span", { children: [pendingCount, " Pending Reviews"] })]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-800/50 rounded-2xl overflow-hidden",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 border-b border-slate-200 dark:border-slate-800/50 bg-slate-100/30 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 rounded-xl self-start",
							children: [
								{
									label: "Pending",
									value: "pending"
								},
								{
									label: "Approved",
									value: "approved"
								},
								{
									label: "Rejected",
									value: "rejected"
								},
								{
									label: "All",
									value: ""
								}
							].map((btn) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => {
									setStatusFilter(btn.value);
									setPage(1);
								},
								className: `px-4 py-2 rounded-lg text-xs font-semibold transition-all ${statusFilter === btn.value ? "bg-white dark:bg-slate-800 text-accentBlue shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-850 dark:hover:text-gray-200"}`,
								children: btn.label
							}, btn.label))
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: fetchComments,
								className: "p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors",
								title: "Refresh list",
								children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-gray-500",
								children: ["Total: ", total]
							})]
						})]
					}),
					loading ? /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center",
						children: [/* @__PURE__ */ jsx(Loader, { className: "w-8 h-8 animate-spin mx-auto text-accentBlue mb-4" }), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-gray-500",
							children: "Loading comments list..."
						})]
					}) : comments.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center border-dashed border-slate-800 rounded-2xl",
						children: [
							/* @__PURE__ */ jsx(MessageSquare, { className: "w-12 h-12 text-gray-700 mx-auto mb-4" }),
							/* @__PURE__ */ jsx("h3", {
								className: "text-lg font-bold text-gray-300",
								children: "No comments found"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-gray-600 mt-1 font-sans",
								children: "No comments match the selected filter status."
							})
						]
					}) : /* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-left border-collapse",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-slate-800/50 text-xs font-semibold text-gray-400 uppercase bg-slate-900/10",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "p-4 w-[180px]",
										children: "Author"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4",
										children: "Comment Content"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 w-[120px]",
										children: "Spam Score"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 w-[100px]",
										children: "Status"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 w-[130px]",
										children: "Created At"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 text-right w-[150px]",
										children: "Actions"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-slate-800/30",
								children: comments.map((item) => /* @__PURE__ */ jsxs("tr", {
									className: "hover:bg-slate-800/10 transition-colors",
									children: [
										/* @__PURE__ */ jsxs("td", {
											className: "p-4 align-top",
											children: [/* @__PURE__ */ jsx("p", {
												className: "font-semibold text-sm text-gray-200",
												children: item.author_name
											}), /* @__PURE__ */ jsxs("p", {
												className: "text-[10px] text-gray-500 font-sans mt-0.5",
												children: ["Post ID: ", item.post_id]
											})]
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 align-top text-sm text-gray-300 font-sans leading-relaxed whitespace-pre-wrap max-w-lg break-words",
											children: item.content
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 align-top text-sm font-sans",
											children: item.spam_score !== void 0 && item.spam_score !== null ? /* @__PURE__ */ jsxs("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ jsx("span", {
													className: `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.spam_score >= .85 ? "bg-red-500/15 border border-red-500/25 text-red-500" : item.spam_score >= .5 ? "bg-amber-500/15 border border-amber-500/25 text-amber-500" : "bg-green-500/15 border border-green-500/25 text-green-500"}`,
													children: item.spam_score >= .85 ? "Spam 🚨" : item.spam_score >= .5 ? "Suspicious ⚠️" : "Safe ✓"
												}), /* @__PURE__ */ jsxs("p", {
													className: "text-[10px] text-gray-500 font-medium",
													children: [
														"Score: ",
														(item.spam_score * 100).toFixed(0),
														"%"
													]
												})]
											}) : /* @__PURE__ */ jsx("span", {
												className: "text-gray-600 text-xs",
												children: "—"
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 align-top text-sm",
											children: item.status === "approved" ? /* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center space-x-1 text-successGreen bg-successGreen/10 border border-successGreen/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
												children: [/* @__PURE__ */ jsx(Check, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Approved" })]
											}) : item.status === "rejected" ? /* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center space-x-1 text-dangerRed bg-dangerRed/10 border border-dangerRed/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
												children: [/* @__PURE__ */ jsx(X, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Rejected" })]
											}) : /* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center space-x-1 text-warningYellow bg-warningYellow/10 border border-warningYellow/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
												children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Pending" })]
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 align-top text-xs text-gray-500 font-sans",
											children: new Date(item.created_at).toLocaleString()
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 align-top text-right",
											children: /* @__PURE__ */ jsxs("div", {
												className: "flex items-center justify-end space-x-2",
												children: [
													item.status !== "approved" && /* @__PURE__ */ jsx("button", {
														onClick: () => handleApprove(item.id),
														className: "p-2 bg-successGreen/10 hover:bg-successGreen/20 border border-successGreen/30 rounded-lg text-successGreen transition-all",
														title: "Approve comment",
														children: /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" })
													}),
													item.status !== "rejected" && /* @__PURE__ */ jsx("button", {
														onClick: () => handleReject(item.id),
														className: "p-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 rounded-lg text-gray-400 hover:text-white transition-all",
														title: "Reject comment",
														children: /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5" })
													}),
													/* @__PURE__ */ jsx("button", {
														onClick: () => setDeleteCommentId(item.id),
														className: "p-2 bg-dangerRed/10 hover:bg-dangerRed/20 border border-dangerRed/30 rounded-lg text-dangerRed transition-all",
														title: "Delete comment permanently",
														children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
													})
												]
											})
										})
									]
								}, item.id))
							})]
						})
					}),
					total > limit && /* @__PURE__ */ jsxs("div", {
						className: "p-4 border-t border-slate-800/50 bg-slate-900/10 flex justify-between items-center",
						children: [
							/* @__PURE__ */ jsx("button", {
								disabled: page === 1,
								onClick: () => setPage(page - 1),
								className: "px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all",
								children: "Previous"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xs text-gray-500 font-medium",
								children: [
									"Page ",
									page,
									" of ",
									Math.ceil(total / limit)
								]
							}),
							/* @__PURE__ */ jsx("button", {
								disabled: page * limit >= total,
								onClick: () => setPage(page + 1),
								className: "px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all",
								children: "Next"
							})
						]
					})
				]
			})
		]
	});
};
var CommentModeration_default = UNSAFE_withComponentProps(CommentModeration);
//#endregion
export { CommentModeration_default as default, loader };
