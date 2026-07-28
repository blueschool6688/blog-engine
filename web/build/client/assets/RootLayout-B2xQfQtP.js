import { p as settingsService } from "./api-DYEteWSp.js";
import { t as AuthProvider } from "./AuthContext-DKglX8kS.js";
import { t as ToastProvider } from "./ToastContext-C9HDWap1.js";
import { t as LanguageProvider } from "./LanguageContext-FaGWHnxr.js";
import { t as ThemeProvider } from "./ThemeContext-B8_TRrwj.js";
import { Outlet, UNSAFE_withComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
import { ConfigProvider, theme } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//#region src/layouts/RootLayout.tsx
var queryClient = new QueryClient({ defaultOptions: { queries: {
	refetchOnWindowFocus: false,
	retry: 1
} } });
var RootLayout = () => {
	const [primaryColor, setPrimaryColor] = useState("#3b82f6");
	const [isDark, setIsDark] = useState(false);
	useEffect(() => {
		setIsDark(document.documentElement.classList.contains("dark"));
		const observer = new MutationObserver(() => {
			setIsDark(document.documentElement.classList.contains("dark"));
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"]
		});
		return () => observer.disconnect();
	}, []);
	useEffect(() => {
		const fetchGlobalTheme = async () => {
			try {
				const res = await settingsService.get();
				if (res.success && res.data) {
					const s = res.data;
					if (s.theme_primary_color) {
						setPrimaryColor(s.theme_primary_color);
						document.documentElement.style.setProperty("--primary-color", s.theme_primary_color);
					}
					if (s.theme_button_bg) document.documentElement.style.setProperty("--btn-bg", s.theme_button_bg);
					if (s.theme_text_color) document.documentElement.style.setProperty("--text-color", s.theme_text_color);
				}
			} catch (err) {
				console.error("Failed to load global colors", err);
			}
		};
		fetchGlobalTheme();
	}, []);
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsx(ConfigProvider, {
			theme: {
				algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
				token: {
					colorPrimary: primaryColor,
					borderRadius: 12
				}
			},
			children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(LanguageProvider, { children: /* @__PURE__ */ jsx(ToastProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) }) }) })
		}) })
	});
};
var RootLayout_default = UNSAFE_withComponentProps(RootLayout);
//#endregion
export { RootLayout_default as default };
