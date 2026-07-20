import { n as useAuth } from "./AuthContext-DK1VfLDy.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { UNSAFE_withComponentProps, useNavigate } from "react-router";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Lock, Mail } from "lucide-react";
import { Button, Form, Input } from "antd";
//#region src/pages/Login.tsx
async function loader() {
	return null;
}
var Login = () => {
	const { login } = useAuth();
	const { showError, showSuccess } = useToast();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const onFinish = async (values) => {
		setLoading(true);
		try {
			await login(values.email, values.password);
			showSuccess("Signed in successfully");
			navigate("/admin");
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Invalid email or password");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen flex items-center justify-center bg-darkBg text-gray-100 font-sans relative overflow-hidden px-4 select-none",
		children: [
			/* @__PURE__ */ jsx("div", { className: "absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-accentBlue/10 blur-[120px] pointer-events-none" }),
			/* @__PURE__ */ jsx("div", { className: "absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-accentPurple/10 blur-[120px] pointer-events-none" }),
			/* @__PURE__ */ jsxs("div", {
				className: "w-full max-w-md glass-panel border border-slate-800/60 rounded-3xl p-8 shadow-2xl relative z-10 bg-slate-900/30 backdrop-blur-md",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex flex-col items-center mb-8",
					children: /* @__PURE__ */ jsx("h2", {
						className: "font-bold text-2xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent",
						children: "CMS Admin Portal"
					})
				}), /* @__PURE__ */ jsxs(Form, {
					name: "login_form",
					layout: "vertical",
					onFinish,
					requiredMark: false,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-gray-300 font-semibold text-xs uppercase tracking-wider",
								children: "Email"
							}),
							name: "email",
							rules: [{
								required: true,
								message: "Please input your email!"
							}, {
								type: "email",
								message: "The input is not a valid email!"
							}],
							children: /* @__PURE__ */ jsx(Input, {
								prefix: /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 text-gray-500 mr-1 shrink-0" }),
								placeholder: "admin@example.com",
								size: "large",
								className: "rounded-xl h-11"
							})
						}),
						/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("div", {
								className: "flex justify-between items-center w-full",
								children: /* @__PURE__ */ jsx("span", {
									className: "text-gray-300 font-semibold text-xs uppercase tracking-wider",
									children: "Password"
								})
							}),
							name: "password",
							rules: [{
								required: true,
								message: "Please input your password!"
							}],
							children: /* @__PURE__ */ jsx(Input.Password, {
								prefix: /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-gray-500 mr-1 shrink-0" }),
								placeholder: "Enter password...",
								size: "large",
								className: "rounded-xl h-11"
							})
						}),
						/* @__PURE__ */ jsx(Form.Item, {
							className: "pt-2",
							children: /* @__PURE__ */ jsx(Button, {
								type: "primary",
								htmlType: "submit",
								loading,
								block: true,
								size: "large",
								className: "h-11 rounded-xl bg-gradient-to-r from-accentBlue to-accentPurple border-0 font-bold hover:brightness-110 transition-all",
								children: "Sign In"
							})
						})
					]
				})]
			})
		]
	});
};
var Login_default = UNSAFE_withComponentProps(Login);
//#endregion
export { Login_default as default, loader };
