import { r as setCookie } from "./LanguageContext-DOrz_C39.js";
import { useRouteLoaderData } from "react-router";
import { createContext, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
//#region src/context/ThemeContext.tsx
var ThemeContext = createContext(void 0);
var ThemeProvider = ({ children }) => {
	const rootData = useRouteLoaderData("root");
	const [theme, setTheme] = useState(() => rootData?.theme || "dark");
	useEffect(() => {
		if (rootData?.theme) setTheme(rootData.theme);
	}, [rootData?.theme]);
	const toggleTheme = () => {
		const nextTheme = theme === "dark" ? "light" : "dark";
		setTheme(nextTheme);
		setCookie("theme", nextTheme, 365);
		if (typeof window !== "undefined") {
			const root = window.document.documentElement;
			if (nextTheme === "dark") root.classList.add("dark");
			else root.classList.remove("dark");
		}
	};
	return /* @__PURE__ */ jsx(ThemeContext.Provider, {
		value: {
			theme,
			toggleTheme
		},
		children
	});
};
var useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) throw new Error("useTheme must be used within a ThemeProvider");
	return context;
};
//#endregion
export { useTheme as n, ThemeProvider as t };
