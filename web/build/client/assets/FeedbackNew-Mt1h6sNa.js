import { o as feedbackService } from "./api-CItDfJrl.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { n as useLanguage } from "./LanguageContext-DOrz_C39.js";
import { Link, UNSAFE_withComponentProps } from "react-router";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { CheckCircle, Loader, MessageSquare, Send, Star } from "lucide-react";
//#region src/pages/FeedbackNew.tsx
async function loader() {
	return null;
}
var FeedbackNew = () => {
	const { t } = useLanguage();
	const { showSuccess, showError } = useToast();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [content, setContent] = useState("");
	const [rating, setRating] = useState(5);
	const [hoverRating, setHoverRating] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!name.trim() || !email.trim() || !content.trim()) {
			showError(t("fill_fields"));
			return;
		}
		setSubmitting(true);
		try {
			if ((await feedbackService.sendFeedback({
				name,
				email,
				subject: subject.trim() || void 0,
				content,
				rating
			})).success) {
				setSubmitted(true);
				showSuccess(t("feedback_success"));
			} else showError(t("feedback_error") || "Failed");
		} catch (err) {
			showError(err.response?.data?.message || t("something_went_wrong") || "Error");
		} finally {
			setSubmitting(false);
		}
	};
	if (submitted) return /* @__PURE__ */ jsx("div", {
		className: "min-h-[70vh] flex items-center justify-center px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md w-full glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-8 text-center space-y-5 bg-white/40 dark:bg-slate-900/30",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "w-16 h-16 bg-successGreen/10 dark:bg-successGreen/20 text-successGreen rounded-full flex items-center justify-center mx-auto shadow-lg shadow-successGreen/10 animate-bounce",
					children: /* @__PURE__ */ jsx(CheckCircle, { className: "w-8 h-8" })
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "text-2xl font-bold text-slate-850 dark:text-white",
					children: t("feedback_sent")
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500 dark:text-gray-400",
					children: t("feedback_success_desc")
				}),
				/* @__PURE__ */ jsx("div", {
					className: "pt-4",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-accentBlue/10",
						children: t("back_to_home")
					})
				})
			]
		})
	});
	return /* @__PURE__ */ jsx("div", {
		className: "max-w-2xl mx-auto px-4 py-12",
		children: /* @__PURE__ */ jsxs("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "text-center space-y-2",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "inline-flex p-3 bg-accentBlue/10 dark:bg-accentBlue/20 text-accentBlue rounded-full shadow-inner mb-2",
						children: /* @__PURE__ */ jsx(MessageSquare, { className: "w-6 h-6" })
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white",
						children: t("submit_feedback")
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto",
						children: t("feedback_desc")
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 md:p-8 bg-white/40 dark:bg-slate-900/30",
				children: /* @__PURE__ */ jsxs("form", {
					onSubmit: handleSubmit,
					className: "space-y-5",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2 flex flex-col items-center py-4 bg-slate-100/40 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-slate-800/30",
							children: [
								/* @__PURE__ */ jsx("label", {
									className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
									children: t("overall_rating")
								}),
								/* @__PURE__ */ jsx("div", {
									className: "flex space-x-2",
									children: [
										1,
										2,
										3,
										4,
										5
									].map((star) => /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setRating(star),
										onMouseEnter: () => setHoverRating(star),
										onMouseLeave: () => setHoverRating(null),
										className: "p-1 hover:scale-125 transition-transform duration-100",
										children: /* @__PURE__ */ jsx(Star, { className: `w-8 h-8 ${star <= (hoverRating ?? rating) ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-gray-400 dark:text-gray-600"}` })
									}, star))
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "text-xs text-gray-500 dark:text-gray-400 font-medium",
									children: [
										rating === 5 && t("excellent"),
										rating === 4 && t("good"),
										rating === 3 && t("average"),
										rating === 2 && t("poor"),
										rating === 1 && t("terrible")
									]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-1 md:grid-cols-2 gap-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsxs("label", {
									className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
									children: [
										t("your_name"),
										" ",
										/* @__PURE__ */ jsx("span", {
											className: "text-dangerRed",
											children: "*"
										})
									]
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									required: true,
									placeholder: "e.g. John Doe",
									value: name,
									onChange: (e) => setName(e.target.value),
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsxs("label", {
									className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
									children: [
										t("email_address"),
										" ",
										/* @__PURE__ */ jsx("span", {
											className: "text-dangerRed",
											children: "*"
										})
									]
								}), /* @__PURE__ */ jsx("input", {
									type: "email",
									required: true,
									placeholder: "e.g. john.doe@example.com",
									value: email,
									onChange: (e) => setEmail(e.target.value),
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsx("label", {
								className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
								children: t("subject_optional")
							}), /* @__PURE__ */ jsx("input", {
								type: "text",
								placeholder: t("subject_optional"),
								value: subject,
								onChange: (e) => setSubject(e.target.value),
								className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsxs("label", {
								className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
								children: [
									t("your_feedback_msg"),
									" ",
									/* @__PURE__ */ jsx("span", {
										className: "text-dangerRed",
										children: "*"
									})
								]
							}), /* @__PURE__ */ jsx("textarea", {
								required: true,
								rows: 5,
								placeholder: "...",
								value: content,
								onChange: (e) => setContent(e.target.value),
								className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm resize-none"
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pt-2",
							children: /* @__PURE__ */ jsxs("button", {
								type: "submit",
								disabled: submitting,
								className: "w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-accentBlue/10 disabled:opacity-50",
								children: [submitting ? /* @__PURE__ */ jsx(Loader, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: t("send_feedback") })]
							})
						})
					]
				})
			})]
		})
	});
};
var FeedbackNew_default = UNSAFE_withComponentProps(FeedbackNew);
//#endregion
export { FeedbackNew_default as default, loader };
