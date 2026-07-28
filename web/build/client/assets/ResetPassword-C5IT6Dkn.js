import { f as publicService } from "./api-DYEteWSp.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { Link, UNSAFE_withComponentProps, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
//#region src/pages/ResetPassword.tsx
async function loader() {
	return null;
}
var schema = z.object({
	password: z.string().min(6, "Password must be at least 6 characters"),
	confirmPassword: z.string().min(6, "Confirm password is required")
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"]
});
var ResetPassword = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const { showSuccess, showError } = useToast();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const { register, handleSubmit, formState: { errors } } = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			password: "",
			confirmPassword: ""
		}
	});
	useEffect(() => {
		if (!token) showError("Invalid or missing security token in URL");
	}, [token, showError]);
	const onSubmit = async (data) => {
		if (!token) {
			showError("No token provided. Cannot reset password.");
			return;
		}
		setLoading(true);
		try {
			await publicService.resetPassword(token, data.password);
			setSuccess(true);
			showSuccess("Password reset successfully");
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to reset password. Token may be expired or invalid.");
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
							children: "Reset Password"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-gray-500 mt-1",
							children: "Enter your new security credentials"
						})
					]
				}), !token ? /* @__PURE__ */ jsxs("div", {
					className: "text-center py-6 space-y-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-sm text-dangerRed",
						children: "This link is invalid or has expired. Please request a new password reset link."
					}), /* @__PURE__ */ jsx(Link, {
						to: "/forgot-password",
						className: "inline-flex items-center gap-2 text-sm font-semibold text-accentBlue hover:text-accentBlue/80 transition-colors",
						children: "Request new link"
					})]
				}) : success ? /* @__PURE__ */ jsxs("div", {
					className: "space-y-6 text-center py-4",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-16 h-16 bg-successGreen/15 border border-successGreen/25 rounded-full flex items-center justify-center mx-auto text-successGreen",
							children: /* @__PURE__ */ jsx(CheckCircle, { className: "w-8 h-8" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "text-lg font-bold text-white",
								children: "Password Updated"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-gray-400 leading-relaxed",
								children: "Your password has been changed successfully. You can now log in with your new credentials."
							})]
						}),
						/* @__PURE__ */ jsx(Link, {
							to: "/login",
							className: "flex items-center justify-center gap-2 py-2.5 w-full bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white rounded-xl text-sm font-semibold transition-all mt-6",
							children: "Go to Login Page"
						})
					]
				}) : /* @__PURE__ */ jsxs("form", {
					onSubmit: handleSubmit(onSubmit),
					className: "space-y-5",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-gray-300",
									children: "New Password"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "relative",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500",
											children: /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4" })
										}),
										/* @__PURE__ */ jsx("input", {
											type: showPassword ? "text" : "password",
											placeholder: "Enter new password...",
											...register("password"),
											className: "w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => setShowPassword(!showPassword),
											className: "absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors",
											children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
										})
									]
								}),
								errors.password && /* @__PURE__ */ jsx("p", {
									className: "text-xs text-dangerRed mt-1",
									children: errors.password.message
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-gray-300",
									children: "Confirm Password"
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "relative",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500",
											children: /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4" })
										}),
										/* @__PURE__ */ jsx("input", {
											type: showConfirmPassword ? "text" : "password",
											placeholder: "Re-type new password...",
											...register("confirmPassword"),
											className: "w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
										}),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => setShowConfirmPassword(!showConfirmPassword),
											className: "absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors",
											children: showConfirmPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
										})
									]
								}),
								errors.confirmPassword && /* @__PURE__ */ jsx("p", {
									className: "text-xs text-dangerRed mt-1",
									children: errors.confirmPassword.message
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-4 pt-2",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "submit",
								disabled: loading,
								className: "w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200 disabled:opacity-55",
								children: [loading ? /* @__PURE__ */ jsx(Loader, { className: "w-4 h-4 animate-spin" }) : null, /* @__PURE__ */ jsx("span", { children: "Reset Password" })]
							}), /* @__PURE__ */ jsxs(Link, {
								to: "/login",
								className: "flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors",
								children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Sign In"]
							})]
						})
					]
				})]
			})
		]
	});
};
var ResetPassword_default = UNSAFE_withComponentProps(ResetPassword);
//#endregion
export { ResetPassword_default as default, loader };
