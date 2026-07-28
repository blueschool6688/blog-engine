import { Links, Meta, Outlet, Scripts, ScrollRestoration, UNSAFE_withComponentProps, useRouteLoaderData } from "react-router";
import "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/root.tsx
function parseCookies(cookieHeader) {
	const list = {};
	if (!cookieHeader) return list;
	cookieHeader.split(";").forEach((cookie) => {
		const parts = cookie.split("=");
		const key = parts.shift()?.trim();
		if (key) list[key] = decodeURIComponent(parts.join("="));
	});
	return list;
}
async function loader({ request }) {
	const cookies = parseCookies(request.headers.get("Cookie") || "");
	return {
		theme: cookies.theme === "light" ? "light" : "dark",
		language: cookies.language === "en" ? "en" : "vi"
	};
}
function Layout({ children }) {
	const data = useRouteLoaderData("root");
	const theme = data?.theme || "dark";
	return /* @__PURE__ */ jsxs("html", {
		lang: data?.language || "vi",
		className: theme,
		children: [/* @__PURE__ */ jsxs("head", { children: [
			/* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
			/* @__PURE__ */ jsx("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			}),
			/* @__PURE__ */ jsx("link", {
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ jsx("link", {
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap",
				rel: "stylesheet"
			}),
			/* @__PURE__ */ jsx(Meta, {}),
			/* @__PURE__ */ jsx(Links, {})
		] }), /* @__PURE__ */ jsxs("body", { children: [
			children,
			/* @__PURE__ */ jsx(ScrollRestoration, {}),
			/* @__PURE__ */ jsx(Scripts, {})
		] })]
	});
}
var root_default = UNSAFE_withComponentProps(function App() {
	return /* @__PURE__ */ jsx(Outlet, {});
});
//#endregion
export { Layout, root_default as default, loader };
