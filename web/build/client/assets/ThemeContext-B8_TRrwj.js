import { t as setCookie } from "./cookie-IQQz9tHN.js";
import { useRouteLoaderData } from "react-router";
import { createContext, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
//#region src/context/ThemeContext.tsx
var DEFAULT_COLORS = {
	lightBg: "#F8FAFC",
	darkBg: "#090D16"
};
var ThemeContext = createContext(void 0);
var ThemeProvider = ({ children }) => {
	const rootData = useRouteLoaderData("root");
	const [theme, setTheme] = useState(() => rootData?.theme || "dark");
	const [colors, setColors] = useState(() => {
		if (typeof window !== "undefined") {
			const savedLight = localStorage.getItem("theme_light_bg");
			const savedDark = localStorage.getItem("theme_dark_bg");
			return {
				lightBg: savedLight || DEFAULT_COLORS.lightBg,
				darkBg: savedDark || DEFAULT_COLORS.darkBg
			};
		}
		return DEFAULT_COLORS;
	});
	const applyColorsToDOM = (currentTheme, currentColors) => {
		if (typeof window !== "undefined") {
			const root = window.document.documentElement;
			root.style.setProperty("--custom-light-bg", currentColors.lightBg);
			root.style.setProperty("--custom-dark-bg", currentColors.darkBg);
			if (currentTheme === "dark") root.classList.add("dark");
			else root.classList.remove("dark");
		}
	};
	useEffect(() => {
		if (rootData?.theme) setTheme(rootData.theme);
	}, [rootData?.theme]);
	useEffect(() => {
		applyColorsToDOM(theme, colors);
	}, [theme, colors]);
	const toggleTheme = () => {
		const nextTheme = theme === "dark" ? "light" : "dark";
		setTheme(nextTheme);
		setCookie("theme", nextTheme, 365);
		applyColorsToDOM(nextTheme, colors);
	};
	const updateThemeColors = (newColors) => {
		const updated = {
			...colors,
			...newColors
		};
		setColors(updated);
		if (newColors.lightBg) localStorage.setItem("theme_light_bg", newColors.lightBg);
		if (newColors.darkBg) localStorage.setItem("theme_dark_bg", newColors.darkBg);
		applyColorsToDOM(theme, updated);
	};
	const resetThemeColors = () => {
		setColors(DEFAULT_COLORS);
		localStorage.removeItem("theme_light_bg");
		localStorage.removeItem("theme_dark_bg");
		applyColorsToDOM(theme, DEFAULT_COLORS);
	};
	return /* @__PURE__ */ jsx(ThemeContext.Provider, {
		value: {
			theme,
			colors,
			toggleTheme,
			updateThemeColors,
			resetThemeColors
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
