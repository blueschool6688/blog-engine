import { f as publicService } from "./api-DYEteWSp.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { Link, UNSAFE_withComponentProps } from "react-router";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, CheckCircle, Loader, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
//#region src/pages/ForgotPassword.tsx
async function loader() {
	return null;
}
var schema = z.object({ email: z.string().min(1, "Email is required").email("Invalid email address") });
var ForgotPassword = () => {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const { showSuccess, showError } = useToast();
	const { register, handleSubmit, formState: { errors } } = useForm({
		resolver: zodResolver(schema),
		defaultValues: { email: "" }
	});
	const onSubmit = async (data) => {
		setLoading(true);
		try {
			await publicService.forgotPassword(data.email);
			setSuccess(true);
			showSuccess("Reset instructions sent if email exists");
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen flex items-center justify-center bg-darkBg text-gray-100 font-sans relative overflow-hidden px-4",
		children: [
			/* @__PURE__ */ jsx("div", { className: "absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-accentBlue/10 blur-[120px] pointer-events-none" }),
			/* @__PURE__ */ jsx("div", { className: "absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-accentPurple/10 blur-[120px] pointer-events-none" }),
			/* @__PURE__ */ jsxs("div", {
				className: "w-full max-w-md glass-panel border border-slate-800/60 rounded-3xl p-8 shadow-2xl relative z-10 bg-slate-900/30 backdrop-blur-md",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col items-center mb-8",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-12 h-12 rounded-xl bg-gradient-to-tr from-accentBlue to-accentPurple flex items-center justify-center shadow-lg shadow-accentBlue/20 mb-4",
							children: /* @__PURE__ */ jsx("span", {
								className: "font-bold text-white text-lg",
								children: "B"
							})
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "font-bold text-2xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent",
							children: "Forgot Password"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-gray-500 mt-1 text-center",
							children: "Enter your email to receive password reset instructions"
						})
					]
				}), success ? /* @__PURE__ */ jsxs("div", {
					className: "space-y-6 text-center py-4",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-16 h-16 bg-successGreen/15 border border-successGreen/25 rounded-full flex items-center justify-center mx-auto text-successGreen animate-pulse-none shadow-lg shadow-successGreen/5",
							children: /* @__PURE__ */ jsx(CheckCircle, { className: "w-8 h-8" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ jsx("h3", {
									className: "text-lg font-bold text-white",
									children: "Check Your Mailbox / Server Logs"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-sm text-gray-400 leading-relaxed",
									children: "If the email address is registered, we have sent instructions to reset your password."
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-left text-xs text-gray-500 font-mono mt-4",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-amber-500 font-semibold",
										children: "Dev Tip:"
									}), " Since SMTP is in log-only mode during dev, check the backend terminal output or container log to retrieve the token."]
								})
							]
						}),
						/* @__PURE__ */ jsxs(Link, {
							to: "/login",
							className: "flex items-center justify-center gap-2 text-sm font-semibold text-accentBlue hover:text-accentBlue/80 transition-all mt-6",
							children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Sign In"]
						})
					]
				}) : /* @__PURE__ */ jsxs("form", {
					onSubmit: handleSubmit(onSubmit),
					className: "space-y-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ jsx("label", {
								className: "text-sm font-medium text-gray-300",
								children: "Email Address"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [/* @__PURE__ */ jsx("span", {
									className: "absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500",
									children: /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" })
								}), /* @__PURE__ */ jsx("input", {
									type: "email",
									placeholder: "name@example.com",
									...register("email"),
									className: "w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
								})]
							}),
							errors.email && /* @__PURE__ */ jsx("p", {
								className: "text-xs text-dangerRed mt-1",
								children: errors.email.message
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-4 pt-2",
						children: [/* @__PURE__ */ jsxs("button", {
							type: "submit",
							disabled: loading,
							className: "w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200 disabled:opacity-55",
							children: [loading ? /* @__PURE__ */ jsx(Loader, { className: "w-4 h-4 animate-spin" }) : null, /* @__PURE__ */ jsx("span", { children: "Send Reset Link" })]
						}), /* @__PURE__ */ jsxs(Link, {
							to: "/login",
							className: "flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors",
							children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Sign In"]
						})]
					})]
				})]
			})
		]
	});
};
var ForgotPassword_default = UNSAFE_withComponentProps(ForgotPassword);
//#endregion
export { ForgotPassword_default as default, loader };
