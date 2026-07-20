import { n as useAuth } from "./AuthContext-DK1VfLDy.js";
import { Navigate, Outlet, UNSAFE_withComponentProps } from "react-router";
import "react";
import { jsx } from "react/jsx-runtime";
import { Spin } from "antd";
//#region src/components/ProtectedRoute.tsx
async function loader() {
	return null;
}
var ProtectedRoute = () => {
	const { isAuthenticated, isLoading } = useAuth();
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen bg-darkBg flex items-center justify-center",
		children: /* @__PURE__ */ jsx("div", {
			className: "flex flex-col items-center gap-4",
			children: /* @__PURE__ */ jsx(Spin, { size: "large" })
		})
	});
	if (!isAuthenticated) return /* @__PURE__ */ jsx(Navigate, {
		to: "/system/login",
		replace: true
	});
	return /* @__PURE__ */ jsx(Outlet, {});
};
var ProtectedRoute_default = UNSAFE_withComponentProps(ProtectedRoute);
//#endregion
export { ProtectedRoute_default as default, loader };
