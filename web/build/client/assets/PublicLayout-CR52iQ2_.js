import { f as settingsService, s as getFullUrl } from "./api-CItDfJrl.js";
import { n as useAuth } from "./AuthContext-DK1VfLDy.js";
import { n as useLanguage } from "./LanguageContext-DOrz_C39.js";
import { n as useTheme } from "./ThemeContext-DPPItHYx.js";
import { Link, NavLink, Outlet, UNSAFE_withComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowUp, LayoutDashboard, LogIn, Menu, Moon, Sun, X } from "lucide-react";
//#region src/layouts/PublicLayout.tsx
var PublicLayout = () => {
	const { isAuthenticated } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const [showScrollTop, setShowScrollTop] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [settings, setSettings] = useState({});
	useEffect(() => {
		const handleScroll = () => {
			setShowScrollTop(window.scrollY > 400);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const res = await settingsService.get();
				if (res.success && res.data) setSettings(res.data);
			} catch (err) {
				console.error("Failed to load settings", err);
			}
		};
		fetchSettings();
	}, []);
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const { language, setLanguage, t } = useLanguage();
	const getSiteName = () => {
		return settings.site_name || "Blogs";
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#F9FAFB] dark:bg-[#0D0E14] text-slate-800 dark:text-gray-200 flex flex-col transition-colors duration-300 selection:bg-accentBlue/25 selection:text-accentBlue",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 dark:bg-[#0D0E14]/90 border-b border-slate-200/80 dark:border-slate-800/60 shadow-sm transition-all duration-300",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4",
					children: [
						/* @__PURE__ */ jsxs(Link, {
							to: "/",
							className: "flex items-center gap-2.5 group shrink-0",
							onClick: () => setMobileMenuOpen(false),
							children: [
								settings.logo_url ? /* @__PURE__ */ jsx("img", {
									src: getFullUrl(settings.logo_url),
									alt: getSiteName(),
									className: "w-8 h-8 rounded-lg object-contain shadow-lg shadow-accentBlue/10 group-hover:scale-105 transition-all duration-200",
									onError: (e) => {
										e.target.style.display = "none";
										e.target.nextElementSibling?.classList.remove("hidden");
									}
								}) : null,
								/* @__PURE__ */ jsx("div", {
									className: `w-8 h-8 rounded-lg from-accentBlue to-accentPurple flex items-center justify-center shadow-lg shadow-accentBlue/20 group-hover:scale-105 transition-all duration-200 ${settings.logo_url ? "hidden" : ""}`,
									children: /* @__PURE__ */ jsx("span", {
										className: "font-extrabold text-white text-xs",
										children: getSiteName().substring(0, 2).toUpperCase()
									})
								}),
								/* @__PURE__ */ jsx("span", {
									className: "font-extrabold text-lg leading-none tracking-tight",
									children: /* @__PURE__ */ jsx("span", {
										className: "",
										children: getSiteName()
									})
								})
							]
						}),
						/* @__PURE__ */ jsx("nav", {
							className: "hidden md:flex items-center gap-1 flex-1",
							children: [
								{
									name: t("articles"),
									path: "/"
								},
								{
									name: t("authors"),
									path: "/authors"
								},
								{
									name: t("feedback"),
									path: "/feedback"
								}
							].map((item) => /* @__PURE__ */ jsx(NavLink, {
								to: item.path,
								end: true,
								className: ({ isActive }) => `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? "text-accentBlue bg-accentBlue/8 dark:bg-accentBlue/12" : "text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"}`,
								children: item.name
							}, item.path))
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ jsx("button", {
									onClick: () => setLanguage(language === "vi" ? "en" : "vi"),
									className: "px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-[#151B2C]/40 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold text-slate-700 dark:text-gray-300 transition-all select-none",
									title: language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt",
									children: language === "vi" ? "EN" : "VI"
								}),
								/* @__PURE__ */ jsx("button", {
									onClick: toggleTheme,
									className: "p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-800/80 transition-all duration-200",
									title: theme === "dark" ? "Light Mode" : "Dark Mode",
									"aria-label": "Toggle theme",
									children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "w-[18px] h-[18px]" }) : /* @__PURE__ */ jsx(Moon, { className: "w-[18px] h-[18px]" })
								}),
								/* @__PURE__ */ jsx("button", {
									onClick: () => setMobileMenuOpen(!mobileMenuOpen),
									className: "md:hidden p-2.5 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all",
									"aria-label": "Toggle menu",
									children: mobileMenuOpen ? /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" })
								})
							]
						})
					]
				}), mobileMenuOpen && /* @__PURE__ */ jsxs("div", {
					className: "md:hidden border-t border-slate-200/80 dark:border-slate-800/60 bg-white dark:bg-[#0D0E14] px-4 py-4 space-y-2 animate-fade-in",
					children: [[
						{
							name: t("articles"),
							path: "/"
						},
						{
							name: t("authors"),
							path: "/authors"
						},
						{
							name: t("feedback"),
							path: "/feedback"
						}
					].map((item) => /* @__PURE__ */ jsx(Link, {
						to: item.path,
						onClick: () => setMobileMenuOpen(false),
						className: "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all",
						children: item.name
					}, item.path)), /* @__PURE__ */ jsx("div", {
						className: "border-t border-slate-100 dark:border-slate-800/50 pt-2",
						children: isAuthenticated ? /* @__PURE__ */ jsxs(Link, {
							to: "/admin",
							onClick: () => setMobileMenuOpen(false),
							className: "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-accentBlue bg-accentBlue/8 hover:bg-accentBlue/12 transition-all",
							children: [/* @__PURE__ */ jsx(LayoutDashboard, { className: "w-4 h-4" }), "Admin CMS"]
						}) : /* @__PURE__ */ jsxs(Link, {
							to: "/login",
							onClick: () => setMobileMenuOpen(false),
							className: "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-accentBlue bg-accentBlue/8 hover:bg-accentBlue/12 transition-all",
							children: [/* @__PURE__ */ jsx(LogIn, { className: "w-4 h-4" }), "Login"]
						})
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10",
				children: [
					/* @__PURE__ */ jsx("div", { className: "fixed top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-accentBlue/4 blur-[150px] pointer-events-none -z-10" }),
					/* @__PURE__ */ jsx("div", { className: "fixed bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-accentPurple/4 blur-[150px] pointer-events-none -z-10" }),
					/* @__PURE__ */ jsx(Outlet, {})
				]
			}),
			/* @__PURE__ */ jsx("footer", {
				className: "bg-white dark:bg-[#0A0B10] border-t border-slate-200/80 dark:border-slate-800/60 relative z-10 transition-colors duration-300",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-slate-200/60 dark:border-slate-800/40 grid grid-cols-2 md:grid-cols-4 gap-8",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "col-span-2 space-y-4",
							children: [
								/* @__PURE__ */ jsx(Link, {
									to: "/",
									className: "flex items-center gap-2",
									children: /* @__PURE__ */ jsx("span", {
										className: "font-extrabold text-base",
										children: /* @__PURE__ */ jsx("span", {
											className: "",
											children: getSiteName()
										})
									})
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-slate-500 dark:text-gray-500 leading-relaxed max-w-sm",
									children: settings.site_description || "Welcome to our engineering blog. We share technical tutorials and design guides."
								}),
								/* @__PURE__ */ jsx("div", {
									className: "text-xs text-gray-400 dark:text-gray-600",
									children: settings.footer_copyright || `© ${(/* @__PURE__ */ new Date()).getFullYear()} DevOps.vn. All rights reserved.`
								}),
								settings.footer_facebook_url || settings.footer_github_url || settings.footer_linkedin_url || settings.footer_twitter_url && /* @__PURE__ */ jsxs("div", {
									className: "flex space-x-3.5 pt-2",
									children: [
										settings.footer_facebook_url && /* @__PURE__ */ jsx("a", {
											href: settings.footer_facebook_url,
											target: "_blank",
											rel: "noreferrer",
											className: "text-gray-400 hover:text-accentBlue transition-colors p-1",
											children: "Facebook"
										}),
										settings.footer_github_url && /* @__PURE__ */ jsx("a", {
											href: settings.footer_github_url,
											target: "_blank",
											rel: "noreferrer",
											className: "text-gray-400 hover:text-accentBlue transition-colors p-1",
											children: "Github"
										}),
										settings.footer_linkedin_url && /* @__PURE__ */ jsx("a", {
											href: settings.footer_linkedin_url,
											target: "_blank",
											rel: "noreferrer",
											className: "text-gray-400 hover:text-accentBlue transition-colors p-1",
											children: "Linkedin"
										}),
										settings.footer_twitter_url && /* @__PURE__ */ jsx("a", {
											href: settings.footer_twitter_url,
											target: "_blank",
											rel: "noreferrer",
											className: "text-gray-400 hover:text-accentBlue transition-colors p-1",
											children: "Twitter"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ jsx("h4", {
								className: "text-xs font-bold uppercase tracking-wider text-slate-750 dark:text-gray-400",
								children: "Navigation"
							}), /* @__PURE__ */ jsxs("ul", {
								className: "space-y-2.5 text-xs text-slate-500 dark:text-gray-500",
								children: [
									/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
										to: "/",
										className: "hover:text-primary-global transition-colors",
										children: t("latest_articles")
									}) }),
									/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
										to: "/authors",
										className: "hover:text-primary-global transition-colors",
										children: t("meet_the_authors")
									}) }),
									/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
										to: "/feedback",
										className: "hover:text-primary-global transition-colors",
										children: t("submit_feedback")
									}) })
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ jsx("h4", {
								className: "text-xs font-bold uppercase tracking-wider text-slate-750 dark:text-gray-400",
								children: "Resources"
							}), /* @__PURE__ */ jsxs("ul", {
								className: "space-y-2.5 text-xs text-slate-500 dark:text-gray-500",
								children: [
									/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
										to: "/login",
										className: "hover:text-primary-global transition-colors",
										children: t("admin_cms")
									}) }),
									/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
										to: "/",
										className: "hover:text-primary-global transition-colors",
										children: t("terms_of_service")
									}) }),
									/* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, {
										to: "/",
										className: "hover:text-primary-global transition-colors",
										children: t("privacy_policy")
									}) })
								]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: scrollToTop,
				style: {
					opacity: showScrollTop ? 1 : 0,
					pointerEvents: showScrollTop ? "auto" : "none"
				},
				className: "fixed bottom-6 right-6 p-3 rounded-full bg-accentBlue text-white hover:bg-accentBlue/90 hover:scale-105 shadow-lg shadow-accentBlue/30 transition-all duration-300 z-50",
				"aria-label": "Scroll to top",
				children: /* @__PURE__ */ jsx(ArrowUp, { className: "w-4 h-4" })
			})
		]
	});
};
var PublicLayout_default = UNSAFE_withComponentProps(PublicLayout);
//#endregion
export { PublicLayout_default as default };
