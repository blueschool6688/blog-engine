import { n as auditService } from "./api-CItDfJrl.js";
import { n as useAuth } from "./AuthContext-DK1VfLDy.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { UNSAFE_withComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Activity, AlertOctagon, Eye, FileText, Image, Key, Loader, RefreshCw, Settings, User, X } from "lucide-react";
//#region src/pages/AuditLog.tsx
async function loader() {
	return null;
}
var AuditLog = () => {
	const { user: currentUser } = useAuth();
	const { showError } = useToast();
	const [logs, setLogs] = useState([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [entityTypeFilter, setEntityTypeFilter] = useState("");
	const [page, setPage] = useState(1);
	const limit = 15;
	const [viewingLog, setViewingLog] = useState(null);
	const fetchLogs = async () => {
		setLoading(true);
		try {
			const offset = (page - 1) * limit;
			const res = await auditService.list({
				offset,
				limit,
				entity_type: entityTypeFilter || void 0
			});
			if (res.success && res.data) {
				setLogs(res.data.items || []);
				setTotal(res.data.total || 0);
			}
		} catch (err) {
			console.error(err);
			showError("Failed to retrieve system audit logs");
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchLogs();
	}, [entityTypeFilter, page]);
	if (currentUser?.role !== "admin") return /* @__PURE__ */ jsxs("div", {
		className: "py-16 text-center max-w-md mx-auto space-y-4",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "w-16 h-16 bg-dangerRed/10 border border-dangerRed/25 rounded-full flex items-center justify-center mx-auto text-dangerRed",
				children: /* @__PURE__ */ jsx(AlertOctagon, { className: "w-8 h-8" })
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "text-xl font-bold text-gray-100",
				children: "Access Denied"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-500 font-sans leading-relaxed",
				children: "You do not have administrative privileges to view system audit logs. Please contact your system administrator."
			})
		]
	});
	const getActionIcon = (action) => {
		const act = action.toLowerCase();
		if (act.includes("post")) return FileText;
		if (act.includes("media")) return Image;
		if (act.includes("user")) return User;
		if (act.includes("setting")) return Settings;
		if (act.includes("password") || act.includes("login")) return Key;
		return Activity;
	};
	const getActionBadgeColor = (action) => {
		const act = action.toLowerCase();
		if (act.startsWith("create") || act.includes("attach") || act.includes("add")) return "bg-successGreen/15 border-successGreen/25 text-successGreen";
		if (act.startsWith("update") || act.includes("edit") || act.includes("reorder")) return "bg-warningYellow/15 border-warningYellow/25 text-warningYellow";
		if (act.startsWith("delete") || act.includes("detach") || act.includes("remove") || act.includes("reject")) return "bg-dangerRed/15 border-dangerRed/25 text-dangerRed";
		return "bg-accentBlue/15 border-accentBlue/25 text-accentBlue";
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			viewingLog && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] animate-scale-up",
					children: [
						/* @__PURE__ */ jsx("button", {
							onClick: () => setViewingLog(null),
							className: "absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all",
							children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
						}),
						/* @__PURE__ */ jsxs("h3", {
							className: "text-base font-bold text-slate-850 dark:text-white mb-4 pr-10",
							children: ["Audit Log Details: ", /* @__PURE__ */ jsxs("span", {
								className: "text-xs font-mono font-normal text-gray-500",
								children: ["#", viewingLog.id]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex-1 overflow-auto bg-slate-950/80 border border-slate-850 p-4 rounded-2xl text-xs font-mono text-gray-300",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-850",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-gray-500 block",
										children: "Performed By:"
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-gray-200",
										children: ["User ID: ", viewingLog.user_id || "System / Public"]
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-gray-500 block",
										children: "IP Address:"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-gray-200",
										children: viewingLog.ip_address || "-"
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-gray-500 block",
										children: "Action / Target:"
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-gray-200",
										children: [
											viewingLog.action,
											" (",
											viewingLog.entity_type || "system",
											")"
										]
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-gray-500 block",
										children: "Timestamp:"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-gray-200",
										children: new Date(viewingLog.created_at).toLocaleString()
									})] })
								]
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-gray-500 block mb-2",
								children: "Payload / State Changes:"
							}), viewingLog.changes ? /* @__PURE__ */ jsx("pre", {
								className: "overflow-x-auto p-3 bg-slate-950 border border-slate-900 rounded-xl leading-relaxed whitespace-pre-wrap max-h-[40vh] text-sky-400",
								children: JSON.stringify(viewingLog.changes, null, 2)
							}) : /* @__PURE__ */ jsx("span", {
								className: "text-gray-600",
								children: "No changes logged for this action."
							})] })]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex justify-end pt-4 mt-2",
							children: /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setViewingLog(null),
								className: "px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 dark:hover:bg-slate-950 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl text-xs font-semibold transition-all",
								children: "Close View"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex justify-between items-center",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent",
					children: "System Audit Log"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500 mt-1",
					children: "Review historical actions, profile edits, posts adjustments, and configuration changes."
				})] })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-800/50 rounded-2xl overflow-hidden",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 border-b border-slate-200 dark:border-slate-800/50 bg-slate-100/30 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-3",
							children: /* @__PURE__ */ jsxs("select", {
								value: entityTypeFilter,
								onChange: (e) => {
									setEntityTypeFilter(e.target.value);
									setPage(1);
								},
								className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 text-slate-700 dark:text-gray-300 rounded-xl py-2 px-3 outline-none text-xs",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "",
										children: "All Categories"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "post",
										children: "Posts Actions"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "media",
										children: "Media Actions"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "user",
										children: "User Accounts"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "setting",
										children: "System Settings"
									})
								]
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: fetchLogs,
								className: "p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors",
								title: "Refresh log",
								children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-gray-500",
								children: ["Total logs: ", total]
							})]
						})]
					}),
					loading ? /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center",
						children: [/* @__PURE__ */ jsx(Loader, { className: "w-8 h-8 animate-spin mx-auto text-accentBlue mb-4" }), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-gray-500",
							children: "Loading audit history..."
						})]
					}) : logs.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center border-dashed border-slate-800 rounded-2xl",
						children: [/* @__PURE__ */ jsx(Activity, { className: "w-12 h-12 text-gray-700 mx-auto mb-4" }), /* @__PURE__ */ jsx("h3", {
							className: "text-lg font-bold text-gray-300",
							children: "No logs found"
						})]
					}) : /* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-left border-collapse",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-slate-800/50 text-xs font-semibold text-gray-400 uppercase bg-slate-900/10",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "p-4 w-[60px] text-center",
										children: "Icon"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4",
										children: "Action"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4",
										children: "Entity Type"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 text-center",
										children: "Entity ID"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4",
										children: "IP Address"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4",
										children: "Timestamp"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 text-right",
										children: "Details"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-slate-800/30",
								children: logs.map((item) => {
									return /* @__PURE__ */ jsxs("tr", {
										className: "hover:bg-slate-800/10 transition-colors",
										children: [
											/* @__PURE__ */ jsx("td", {
												className: "p-4 w-[60px] text-center",
												children: /* @__PURE__ */ jsx("div", {
													className: "w-8 h-8 rounded-lg border border-slate-800/50 bg-slate-900/50 flex items-center justify-center text-gray-400 mx-auto",
													children: /* @__PURE__ */ jsx(getActionIcon(item.action), { className: "w-4 h-4" })
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4",
												children: /* @__PURE__ */ jsx("span", {
													className: `inline-flex border px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getActionBadgeColor(item.action)}`,
													children: item.action.replace("_", " ")
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4 text-sm text-gray-400 capitalize",
												children: item.entity_type || "-"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4 text-sm text-gray-400 font-mono text-center",
												children: item.entity_id || "-"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4 text-sm text-gray-500 font-mono",
												children: item.ip_address || "-"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4 text-xs text-gray-500",
												children: new Date(item.created_at).toLocaleString()
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4 text-right",
												children: /* @__PURE__ */ jsx("button", {
													onClick: () => setViewingLog(item),
													className: "p-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors",
													title: "View detail JSON",
													children: /* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" })
												})
											})
										]
									}, item.id);
								})
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
var AuditLog_default = UNSAFE_withComponentProps(AuditLog);
//#endregion
export { AuditLog_default as default, loader };
