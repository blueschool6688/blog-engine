import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { Link, Links, Meta, NavLink, Navigate, Outlet, Scripts, ScrollRestoration, ServerRouter, UNSAFE_withComponentProps, UNSAFE_withHydrateFallbackProps, useLoaderData, useLocation, useNavigate, useNavigation, useParams, useRevalidator, useRouteLoaderData, useSearchParams } from "react-router";
import { renderToPipeableStream } from "react-dom/server";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Activity, ActivitySquare, AlertCircle, AlertOctagon, AlertTriangle, Archive, ArrowLeft, ArrowRight, ArrowUp, Bold, BookOpen, Calendar, Check, CheckCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, CloudRain, CloudSun, Copy, CornerDownRight, Edit2, Eraser, Eye, EyeOff, FileText, Film, Folder, Globe, GripVertical, HardDrive, Heading1, Heading2, Heading3, Heart, Home, Image, Info, Italic, Key, Languages, LayoutDashboard, Link as Link$1, List, ListOrdered, Loader, Lock, LogIn, LogOut, Mail, MapPin, Menu, MessageSquare, Minus, Moon, Palette, Play, Plus, Quote, RefreshCw, RotateCcw, Save, Search, Send, Settings, Shield, Sparkles, Star, Sun, Tag, Trash, Trash2, Upload, User, Users, X } from "lucide-react";
import { Avatar, Badge, Button, Card, Collapse, ConfigProvider, DatePicker, Form, Input, Modal, Pagination, Select, Skeleton, Space, Spin, Switch, Table, Tabs, Tag as Tag$1, Tooltip, Typography, message, theme } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as Tooltip$1, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region src/entry.server.tsx
var entry_server_exports = /* @__PURE__ */ __exportAll({
	default: () => handleRequest,
	streamTimeout: () => streamTimeout
});
var streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, _loadContext) {
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(ServerRouter, {
			context: routerContext,
			url: request.url
		}), {
			onShellReady() {
				shellRendered = true;
				const body = new PassThrough();
				const stream = createReadableStreamFromReadable(body);
				responseHeaders.set("Content-Type", "text/html");
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
				pipe(body);
			},
			onShellError(error) {
				reject(error);
			},
			onError(error) {
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
		setTimeout(abort, 6e3);
	});
}
//#endregion
//#region src/root.tsx
var root_exports = /* @__PURE__ */ __exportAll({
	Layout: () => Layout,
	default: () => root_default,
	loader: () => loader$11
});
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
async function loader$11({ request }) {
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
var api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem("access_token");
		if (token) config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
}, (error) => Promise.reject(error));
api.interceptors.response.use((response) => response, (error) => {
	if (error.response?.status === 401 && typeof window !== "undefined") {
		localStorage.removeItem("access_token");
		window.location.href = "/system/login";
	}
	return Promise.reject(error);
});
var mediaService = {
	upload: async (file) => {
		const formData = new FormData();
		formData.append("file", file);
		return (await api.post("/media", formData, { headers: { "Content-Type": "multipart/form-data" } })).data;
	},
	list: async (params) => {
		return (await api.get("/media", { params })).data;
	},
	detail: async (id) => {
		return (await api.get(`/media/${id}`)).data;
	},
	delete: async (id) => {
		return (await api.delete(`/media/${id}`)).data;
	}
};
var postService = {
	list: async (offset = 0, limit = 10, status = "", search = "", category_id, tag_id, is_featured, with_deleted = false) => {
		return (await api.get("/posts", { params: {
			offset,
			limit,
			status,
			search,
			category_id,
			tag_id,
			is_featured,
			with_deleted
		} })).data;
	},
	detail: async (id) => {
		return (await api.get(`/posts/${id}`)).data;
	},
	create: async (post) => {
		return (await api.post("/posts", post)).data;
	},
	update: async (id, post) => {
		return (await api.put(`/posts/${id}`, post)).data;
	},
	delete: async (id, force = false) => {
		return (await api.delete(`/posts/${id}`, { params: { force } })).data;
	},
	restore: async (id) => {
		return (await api.post(`/posts/${id}/restore`)).data;
	},
	getGallery: async (postId) => {
		return (await api.get(`/posts/${postId}/media`)).data;
	},
	attachMedia: async (postId, data) => {
		return (await api.post(`/posts/${postId}/media`, data)).data;
	},
	detachMedia: async (postId, mediaId) => {
		return (await api.delete(`/posts/${postId}/media/${mediaId}`)).data;
	},
	reorderGallery: async (postId, items) => {
		return (await api.put(`/posts/${postId}/media/reorder`, items)).data;
	},
	bulkAction: async (ids, action) => {
		return (await api.post("/posts/bulk", {
			ids,
			action
		})).data;
	}
};
var categoryService = {
	list: async (with_deleted = false) => {
		return (await api.get("/categories", { params: { with_deleted } })).data;
	},
	create: async (data) => {
		return (await api.post("/categories", data)).data;
	},
	update: async (id, data) => {
		return (await api.put(`/categories/${id}`, data)).data;
	},
	delete: async (id, force = false) => {
		return (await api.delete(`/categories/${id}`, { params: { force } })).data;
	},
	restore: async (id) => {
		return (await api.post(`/categories/${id}/restore`)).data;
	}
};
var tagService = {
	list: async (with_deleted = false) => {
		return (await api.get("/tags", { params: { with_deleted } })).data;
	},
	create: async (data) => {
		return (await api.post("/tags", data)).data;
	},
	delete: async (id, force = false) => {
		return (await api.delete(`/tags/${id}`, { params: { force } })).data;
	},
	restore: async (id) => {
		return (await api.post(`/tags/${id}/restore`)).data;
	}
};
var userService = {
	list: async (offset = 0, limit = 10, role = "") => {
		return (await api.get("/users", { params: {
			offset,
			limit,
			role
		} })).data;
	},
	create: async (data) => {
		return (await api.post("/users", data)).data;
	},
	update: async (id, data) => {
		return (await api.put(`/users/${id}`, data)).data;
	},
	delete: async (id) => {
		return (await api.delete(`/users/${id}`)).data;
	}
};
var auditService = { list: async (params) => {
	return (await api.get("/audit-logs", { params })).data;
} };
var commentService = {
	listComments: async (postId) => {
		return (await api.get(`/public/posts/${postId}/comments`)).data;
	},
	postComment: async (postId, data) => {
		return (await api.post(`/public/posts/${postId}/comments`, data)).data;
	},
	getReactions: async (postId) => {
		return (await api.get(`/public/posts/${postId}/reactions`)).data;
	},
	react: async (postId, emoji) => {
		return (await api.post(`/public/posts/${postId}/react`, { emoji })).data;
	},
	listAll: async (params) => {
		return (await api.get("/posts/comments", { params })).data;
	},
	getPendingCount: async () => {
		return (await api.get("/posts/comments/pending-count")).data;
	},
	approve: async (id) => {
		return (await api.put(`/posts/comments/${id}/approve`)).data;
	},
	reject: async (id) => {
		return (await api.put(`/posts/comments/${id}/reject`)).data;
	},
	deleteComment: async (id) => {
		return (await api.delete(`/posts/comments/${id}`)).data;
	}
};
var publicService = {
	getPosts: async (params) => {
		return (await api.get("/public/posts", { params })).data;
	},
	getPostBySlug: async (slug) => {
		return (await api.get(`/public/posts/${slug}`)).data;
	},
	getCategories: async () => {
		return (await api.get("/public/categories")).data;
	},
	getTags: async () => {
		return (await api.get("/public/tags")).data;
	},
	forgotPassword: async (email) => {
		return (await api.post("/auth/forgot-password", { email })).data;
	},
	resetPassword: async (token, new_password) => {
		return (await api.post("/auth/reset-password", {
			token,
			new_password
		})).data;
	},
	getAuthors: async () => {
		return (await api.get("/public/authors")).data;
	},
	getAuthorById: async (id) => {
		return (await api.get(`/public/authors/${id}`)).data;
	},
	getAuthorByNickname: async (nickname) => {
		return (await api.get(`/public/authors/${nickname}`)).data;
	}
};
var dashboardService = { getStats: async () => {
	return (await api.get("/dashboard/stats")).data;
} };
var settingsService = {
	getPublic: async () => {
		return (await api.get("/public/settings")).data;
	},
	get: async () => {
		return (await api.get("/settings")).data;
	},
	update: async (data) => {
		return (await api.put("/settings", data)).data;
	}
};
var profileService = {
	updateProfile: async (data) => {
		return (await api.put("/auth/me", data)).data;
	},
	changePassword: async (data) => {
		return (await api.put("/auth/password", data)).data;
	}
};
var feedbackService = {
	sendFeedback: async (data) => {
		return (await api.post("/public/feedbacks", data)).data;
	},
	listFeedbacks: async (params) => {
		return (await api.get("/feedbacks", { params })).data;
	},
	updateFeedbackStatus: async (id, status) => {
		return (await api.put(`/feedbacks/${id}/status`, { status })).data;
	},
	deleteFeedback: async (id) => {
		return (await api.delete(`/feedbacks/${id}`)).data;
	}
};
var getFullUrl = (path) => {
	if (!path) return "";
	if (path.startsWith("http://") || path.startsWith("https://")) return path;
	return `${"http://localhost:8080/api".replace(/\/api$/, "")}${path}`;
};
/**
* translateService cung cấp các method để dịch nội dung động qua backend AI.
* KHÔNG gọi trực tiếp NVIDIA API từ frontend — mọi request phải qua backend.
*/
var translateService = {
	/** Dịch một đoạn nội dung đơn lẻ (tự động async nếu > 3000 chars) */
	translate: async (req) => {
		return (await api.post("/translate", req)).data;
	},
	/** Luôn tạo async job bất kể độ dài content */
	translateAsync: async (req) => {
		return (await api.post("/translate/async", req)).data;
	},
	/** Lấy trạng thái và kết quả của async job */
	pollJob: async (jobId) => {
		return (await api.get(`/translate/async/${jobId}`)).data;
	},
	/** Dịch hàng loạt (batch), tối đa 20 items */
	batch: async (items) => {
		return (await api.post("/translate/batch", { items })).data;
	},
	/** Lấy danh sách jobs trong admin (phân trang) */
	listJobs: async (params) => {
		return (await api.get("/translate/jobs", { params })).data;
	},
	/** Đặt lại trạng thái job để thử dịch lại */
	retryJob: async (jobId) => {
		return (await api.post(`/translate/jobs/${jobId}/retry`)).data;
	},
	/** Xóa job khỏi database */
	deleteJob: async (jobId) => {
		return (await api.delete(`/translate/jobs/${jobId}`)).data;
	}
};
var aiService = {
	generatePost: async (topic) => {
		return (await api.post("/ai/generate-post", { topic })).data;
	},
	summarize: async (content, language, maxWords) => {
		return (await api.post("/ai/summarize", {
			content,
			language,
			max_words: maxWords
		})).data;
	},
	extractKeywords: async (content, language) => {
		return (await api.post("/ai/keywords", {
			content,
			language
		})).data;
	},
	scoreSEO: async (title, metaDesc, content) => {
		return (await api.post("/ai/seo-score", {
			title,
			meta_desc: metaDesc,
			content
		})).data;
	},
	generateAltText: async (imageUrl, context) => {
		return (await api.post("/ai/alt-text", {
			image_url: imageUrl,
			context
		})).data;
	},
	analyzeSentiment: async (author, content) => {
		return (await api.post("/ai/sentiment", {
			author,
			content
		})).data;
	}
};
//#endregion
//#region src/context/AuthContext.tsx
var AuthContext = createContext(null);
var AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();
	/**
	* On mount, try to restore session from localStorage.
	* Calls /auth/me with the stored token. If invalid, clears state.
	*/
	useEffect(() => {
		const restoreSession = async () => {
			const token = localStorage.getItem("access_token");
			if (!token) {
				setIsLoading(false);
				return;
			}
			try {
				const response = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
				setUser(response.data.data);
			} catch {
				localStorage.removeItem("access_token");
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};
		restoreSession();
	}, []);
	/**
	* Log in by POSTing credentials to /auth/login.
	* Stores the returned access_token and sets user state.
	*/
	const login = useCallback(async (email, password) => {
		const { access_token, user: loggedInUser } = (await api.post("/auth/login", {
			email,
			password
		})).data.data;
		localStorage.setItem("access_token", access_token);
		setUser(loggedInUser);
	}, []);
	/**
	* Log out: POST /auth/logout, clear token, reset user state, navigate to /login.
	*/
	const logout = useCallback(async () => {
		try {
			const token = localStorage.getItem("access_token");
			if (token) await api.post("/auth/logout", null, { headers: { Authorization: `Bearer ${token}` } });
		} catch {} finally {
			localStorage.removeItem("access_token");
			setUser(null);
			navigate("/login", { replace: true });
		}
	}, [navigate]);
	const updateUser = useCallback((updatedUser) => {
		setUser(updatedUser);
	}, []);
	const value = {
		user,
		isAuthenticated: user !== null,
		isLoading,
		login,
		logout,
		updateUser
	};
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value,
		children
	});
};
var useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>. Make sure it wraps your router.");
	return ctx;
};
//#endregion
//#region src/context/ToastContext.tsx
var ToastContext = createContext(null);
var ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);
	const addToast = useCallback((type, message) => {
		const id = Math.random().toString(36).substring(2, 9);
		setToasts((prev) => [...prev, {
			id,
			type,
			message
		}]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 4e3);
	}, []);
	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);
	const showSuccess = useCallback((msg) => addToast("success", msg), [addToast]);
	const showError = useCallback((msg) => addToast("error", msg), [addToast]);
	const showWarning = useCallback((msg) => addToast("warning", msg), [addToast]);
	return /* @__PURE__ */ jsxs(ToastContext.Provider, {
		value: {
			showSuccess,
			showError,
			showWarning
		},
		children: [
			children,
			/* @__PURE__ */ jsx("div", {
				className: "fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0",
				children: toasts.map((toast) => {
					let bgClass = "";
					let borderClass = "";
					let textClass = "";
					let Icon = CheckCircle;
					switch (toast.type) {
						case "success":
							bgClass = "bg-emerald-950/95 text-emerald-100";
							borderClass = "border-emerald-500/30";
							textClass = "text-emerald-400 hover:text-emerald-200";
							Icon = CheckCircle;
							break;
						case "error":
							bgClass = "bg-rose-950/95 text-rose-100";
							borderClass = "border-rose-500/30";
							textClass = "text-rose-400 hover:text-rose-200";
							Icon = AlertCircle;
							break;
						case "warning":
							bgClass = "bg-amber-950/95 text-amber-100";
							borderClass = "border-amber-500/30";
							textClass = "text-amber-400 hover:text-amber-200";
							Icon = AlertTriangle;
							break;
					}
					return /* @__PURE__ */ jsxs("div", {
						className: `pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 ${bgClass} ${borderClass}`,
						style: { animation: "toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards" },
						children: [
							/* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 flex-shrink-0 mt-0.5 text-current" }),
							/* @__PURE__ */ jsx("div", {
								className: "flex-1 text-sm font-medium leading-5",
								children: toast.message
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: () => removeToast(toast.id),
								className: `p-1 rounded-lg hover:bg-white/10 transition-colors ${textClass}`,
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})
						]
					}, toast.id);
				})
			}),
			/* @__PURE__ */ jsx("style", { children: `
        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      ` })
		]
	});
};
var useToast = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within a ToastProvider");
	return ctx;
};
//#endregion
//#region src/utils/cookie.ts
function setCookie(name, value, days = 365) {
	const date = /* @__PURE__ */ new Date();
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1e3);
	const expires = "; expires=" + date.toUTCString();
	document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}
//#endregion
//#region src/context/LanguageContext.tsx
var dictionary = {
	home: {
		vi: "Trang Chủ",
		en: "Home"
	},
	articles: {
		vi: "Bài Viết",
		en: "Articles"
	},
	authors: {
		vi: "Tác Giả",
		en: "Authors"
	},
	feedback: {
		vi: "Phản hồi",
		en: "Feedback"
	},
	admin_cms: {
		vi: "Quản trị CMS",
		en: "Admin CMS"
	},
	login: {
		vi: "Đăng Nhập",
		en: "Login"
	},
	logout: {
		vi: "Đăng Xuất",
		en: "Logout"
	},
	dashboard: {
		vi: "Bảng điều khiển",
		en: "Dashboard"
	},
	posts: {
		vi: "Bài viết",
		en: "Posts"
	},
	media_library: {
		vi: "Thư viện Media",
		en: "Media Library"
	},
	categories: {
		vi: "Chuyên mục",
		en: "Categories"
	},
	tags: {
		vi: "Thẻ tag",
		en: "Tags"
	},
	comments: {
		vi: "Bình luận",
		en: "Comments"
	},
	feedbacks: {
		vi: "Phản hồi góp ý",
		en: "Feedbacks"
	},
	settings: {
		vi: "Cài đặt",
		en: "Settings"
	},
	users: {
		vi: "Thành viên",
		en: "Users"
	},
	audit_logs: {
		vi: "Nhật ký hệ thống",
		en: "Audit Logs"
	},
	translate_jobs: {
		vi: "Dịch thuật AI",
		en: "Translate Jobs"
	},
	sign_out: {
		vi: "Đăng xuất",
		en: "Sign Out"
	},
	latest_articles: {
		vi: "Bài viết mới nhất",
		en: "Latest Articles"
	},
	read_more: {
		vi: "Đọc tiếp",
		en: "Read more"
	},
	search_placeholder: {
		vi: "Tìm kiếm bài viết... (Kubernetes, CI/CD, Terraform...)",
		en: "Search articles... (Kubernetes, CI/CD, Terraform...)"
	},
	loading: {
		vi: "Đang tải...",
		en: "Loading..."
	},
	no_articles: {
		vi: "Không tìm thấy bài viết nào.",
		en: "No articles found."
	},
	terms_of_service: {
		vi: "Điều khoản dịch vụ",
		en: "Terms of Service"
	},
	privacy_policy: {
		vi: "Chính sách bảo mật",
		en: "Privacy Policy"
	},
	all_rights_reserved: {
		vi: "Đã đăng ký bản quyền.",
		en: "All rights reserved."
	},
	back_to_home: {
		vi: "Quay lại Trang chủ",
		en: "Back to Home"
	},
	back_to_authors: {
		vi: "Quay lại danh sách Tác giả",
		en: "Back to Authors"
	},
	read_time_mins: {
		vi: "phút",
		en: "mins"
	},
	all_posts: {
		vi: "Tất cả",
		en: "All"
	},
	filtering_by: {
		vi: "Đang lọc theo:",
		en: "Filtering by:"
	},
	clear_filter: {
		vi: "Xóa bộ lọc",
		en: "Clear Filter"
	},
	search_posts: {
		vi: "Tìm kiếm",
		en: "Search"
	},
	today: {
		vi: "Hôm nay",
		en: "Today"
	},
	days_ago: {
		vi: "ngày trước",
		en: "days ago"
	},
	weeks_ago: {
		vi: "tuần trước",
		en: "weeks ago"
	},
	months_ago: {
		vi: "tháng trước",
		en: "months ago"
	},
	years_ago: {
		vi: "năm trước",
		en: "years ago"
	},
	prev: {
		vi: "← Trước",
		en: "← Prev"
	},
	next: {
		vi: "Tiếp →",
		en: "Next →"
	},
	no_posts: {
		vi: "Không tìm thấy bài viết nào.",
		en: "No articles found."
	},
	clear_filter_try_again: {
		vi: "Xóa bộ lọc và thử lại",
		en: "Clear filters and try again"
	},
	latest_articles_title: {
		vi: "Bài viết mới nhất",
		en: "Latest Articles"
	},
	page_not_found: {
		vi: "Trang không tìm thấy",
		en: "Page Not Found"
	},
	page_not_found_desc: {
		vi: "Đường dẫn bạn truy cập không tồn tại hoặc đã bị di dời.",
		en: "The page you are looking for does not exist or has been moved."
	},
	redirecting_home: {
		vi: "Tự động quay về trang chủ sau {seconds} giây...",
		en: "Redirecting to home in {seconds} seconds..."
	},
	excellent: {
		vi: "Tuyệt vời! Rất thích.",
		en: "Excellent! Love it."
	},
	good: {
		vi: "Tốt. Rất hài lòng.",
		en: "Good. Very pleased."
	},
	average: {
		vi: "Bình thường. Cần cải thiện.",
		en: "Average. Needs work."
	},
	poor: {
		vi: "Kém. Không hài lòng.",
		en: "Poor. Not satisfied."
	},
	terrible: {
		vi: "Rất tệ. Thất vọng.",
		en: "Terrible. Very disappointed."
	},
	fill_fields: {
		vi: "Vui lòng điền đầy đủ các thông tin bắt buộc.",
		en: "Please fill in all required fields."
	},
	our_writers: {
		vi: "Đội ngũ Tác giả",
		en: "Our Writers"
	},
	no_authors: {
		vi: "Không tìm thấy tác giả nào trong thư mục.",
		en: "No authors found in the directory."
	},
	no_bio: {
		vi: "Tác giả này hiện chưa cập nhật tiểu sử.",
		en: "This author has not updated their biography yet."
	},
	copy_code: {
		vi: "Sao chép code",
		en: "Copy code"
	},
	copied: {
		vi: "Đã sao chép!",
		en: "Copied!"
	},
	copy: {
		vi: "Sao chép",
		en: "Copy"
	},
	loading_post: {
		vi: "Đang tải bài viết...",
		en: "Loading article..."
	},
	post_not_found: {
		vi: "Không tìm thấy bài viết.",
		en: "Article not found."
	},
	table_of_contents: {
		vi: "Mục lục bài viết",
		en: "Table of Contents"
	},
	meet_the_authors: {
		vi: "Gặp gỡ các Tác giả",
		en: "Meet the Authors"
	},
	authors_desc: {
		vi: "Khám phá những kỹ sư, kiến trúc sư và tác giả chia sẻ kiến thức và kinh nghiệm thực chiến trên blog này.",
		en: "Discover the engineers, architects, and writers who share their technical knowledge and experience."
	},
	view_articles: {
		vi: "Xem các bài viết",
		en: "View Articles"
	},
	no_authors_alt: {
		vi: "Không tìm thấy tác giả nào.",
		en: "No authors found."
	},
	articles_written_by: {
		vi: "Các bài viết được viết bởi",
		en: "Articles written by"
	},
	views: {
		vi: "lượt xem",
		en: "views"
	},
	biography: {
		vi: "Tiểu sử",
		en: "Biography"
	},
	submit_feedback: {
		vi: "Gửi Phản Hồi",
		en: "Submit Feedback"
	},
	feedback_desc: {
		vi: "Ý kiến, đóng góp và đề xuất của bạn giúp chúng tôi cải thiện hệ thống. Hãy chia sẻ cảm nghĩ của bạn!",
		en: "Your opinions, criticisms, and suggestions help us build a better platform. Tell us what you think!"
	},
	overall_rating: {
		vi: "Đánh giá chung",
		en: "Overall Rating"
	},
	your_name: {
		vi: "Họ và Tên",
		en: "Your Name"
	},
	email_address: {
		vi: "Địa chỉ Email",
		en: "Email Address"
	},
	subject_optional: {
		vi: "Tiêu đề (Không bắt buộc)",
		en: "Subject (Optional)"
	},
	your_feedback_msg: {
		vi: "Nội dung phản hồi / Góp ý",
		en: "Your Feedback / Message"
	},
	send_feedback: {
		vi: "Gửi Góp Ý",
		en: "Send Feedback"
	},
	feedback_success: {
		vi: "Đã gửi góp ý thành công!",
		en: "Feedback sent successfully!"
	},
	feedback_success_desc: {
		vi: "Chúng tôi ghi nhận ý kiến của bạn để cải thiện trang web tốt hơn. Xin cảm ơn!",
		en: "We appreciate your input and will use it to improve our blog. Thank you!"
	},
	posts_management: {
		vi: "Quản Lý Bài Viết",
		en: "Posts Management"
	},
	posts_management_desc: {
		vi: "Tạo, chỉnh sửa, phân loại và quản lý các bài đăng của bạn.",
		en: "Create, edit, categorize and manage all your posts."
	},
	admin_posts_title: {
		vi: "Quản Lý Bài Viết",
		en: "Manage Articles"
	},
	admin_posts_subtitle: {
		vi: "Tạo, sửa và tổ chức các bài viết kỹ thuật của bạn.",
		en: "Create, edit, and organize your technical articles."
	},
	create_new_post: {
		vi: "Viết Bài Mới",
		en: "Create New Post"
	},
	table_title: {
		vi: "Tiêu đề",
		en: "Title"
	},
	table_author: {
		vi: "Tác giả",
		en: "Author"
	},
	table_category: {
		vi: "Danh mục",
		en: "Category"
	},
	table_status: {
		vi: "Trạng thái",
		en: "Status"
	},
	table_actions: {
		vi: "Thao tác",
		en: "Actions"
	},
	filter_all: {
		vi: "Tất cả trạng thái",
		en: "All Statuses"
	},
	filter_published: {
		vi: "Đã xuất bản",
		en: "Published"
	},
	filter_draft: {
		vi: "Bản nháp",
		en: "Draft"
	},
	bulk_action: {
		vi: "Thao tác hàng loạt",
		en: "Bulk Actions"
	},
	bulk_publish: {
		vi: "Xuất bản đã chọn",
		en: "Publish Selected"
	},
	bulk_draft: {
		vi: "Chuyển thành bản nháp",
		en: "Draft Selected"
	},
	bulk_delete: {
		vi: "Xóa đã chọn",
		en: "Delete Selected"
	},
	search_posts_placeholder: {
		vi: "Tìm bài viết theo tiêu đề...",
		en: "Search posts by title..."
	},
	delete_confirm_title: {
		vi: "Xóa bài viết",
		en: "Delete Article"
	},
	delete_confirm_msg: {
		vi: "Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.",
		en: "Are you sure you want to delete this article? This action cannot be undone."
	},
	show_deleted: {
		vi: "Hiển thị đã xóa",
		en: "Show Deleted"
	},
	selected: {
		vi: "Đã chọn",
		en: "Selected"
	},
	clear: {
		vi: "Bỏ chọn",
		en: "Clear"
	},
	all_categories: {
		vi: "Tất cả chuyên mục",
		en: "All Categories"
	},
	all_tags: {
		vi: "Tất cả thẻ tag",
		en: "All Tags"
	},
	delete: {
		vi: "Xóa",
		en: "Delete"
	},
	force_delete: {
		vi: "Xóa vĩnh viễn",
		en: "Force Delete"
	},
	total: {
		vi: "Tổng số",
		en: "Total"
	},
	delete_permanent_title: {
		vi: "Xóa vĩnh viễn bài viết?",
		en: "Permanently Delete Article?"
	},
	delete_soft_title: {
		vi: "Xóa bài viết (Vào thùng rác)?",
		en: "Delete Article (Soft Delete)?"
	},
	delete_permanent_msg: {
		vi: "Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này? Hành động này hoàn toàn không thể khôi phục lại.",
		en: "Are you sure you want to permanently delete this article? This action is irreversible."
	},
	delete_soft_msg: {
		vi: "Bạn có chắc chắn muốn đưa bài viết này vào thùng rác? Bạn có thể khôi phục lại sau.",
		en: "Are you sure you want to delete this article? You can restore it later from the deleted view."
	},
	editor_create_title: {
		vi: "Tạo Bài Viết Mới",
		en: "Create New Post"
	},
	editor_edit_title: {
		vi: "Chỉnh Sửa Bài Viết",
		en: "Edit Post"
	},
	editor_title_label: {
		vi: "Tiêu đề bài viết",
		en: "Article Title"
	},
	editor_title_placeholder: {
		vi: "Nhập tiêu đề ấn tượng...",
		en: "Enter a catchy title..."
	},
	editor_slug_label: {
		vi: "Đường dẫn bài viết (Slug)",
		en: "Post URL Slug"
	},
	editor_content_label: {
		vi: "Nội dung bài viết",
		en: "Article Content"
	},
	editor_excerpt_label: {
		vi: "Tóm tắt bài viết",
		en: "Excerpt / Summary"
	},
	editor_excerpt_placeholder: {
		vi: "Viết tóm tắt ngắn cho bài viết hiển thị ở trang chủ...",
		en: "Write a short summary for the home page..."
	},
	editor_cover_label: {
		vi: "Ảnh bìa bài viết",
		en: "Cover Image"
	},
	editor_select_cover: {
		vi: "Chọn ảnh bìa",
		en: "Select Cover Image"
	},
	editor_change_cover: {
		vi: "Thay đổi ảnh bìa",
		en: "Change Cover Image"
	},
	editor_meta_title: {
		vi: "Tiêu đề Meta (SEO)",
		en: "Meta Title (SEO)"
	},
	editor_meta_desc: {
		vi: "Mô tả Meta (SEO)",
		en: "Meta Description (SEO)"
	},
	editor_categories_label: {
		vi: "Danh mục chuyên mục",
		en: "Categories"
	},
	editor_tags_label: {
		vi: "Thẻ tag",
		en: "Tags"
	},
	editor_tags_placeholder: {
		vi: "Nhập thẻ tag và nhấn Enter...",
		en: "Type tag and press Enter..."
	},
	editor_save: {
		vi: "Lưu bài viết",
		en: "Save Post"
	},
	editor_cancel: {
		vi: "Hủy bỏ",
		en: "Cancel"
	},
	editor_status_label: {
		vi: "Trạng thái xuất bản",
		en: "Publish Status"
	},
	editor_schedule_label: {
		vi: "Ngày giờ xuất bản (Lên lịch)",
		en: "Publish Date & Time (Schedule)"
	},
	editor_schedule_help: {
		vi: "Thiết lập ngày tương lai để lên lịch, hoặc để trống để xuất bản ngay.",
		en: "Set a future date to schedule publication, or leave blank to publish immediately."
	},
	editor_featured_label: {
		vi: "Đánh dấu là bài viết nổi bật",
		en: "Mark as Featured Post"
	},
	category_name: {
		vi: "Tên chuyên mục",
		en: "Category Name"
	},
	parent_category: {
		vi: "Chuyên mục cha",
		en: "Parent Category"
	},
	description: {
		vi: "Mô tả",
		en: "Description"
	},
	actions: {
		vi: "Thao tác",
		en: "Actions"
	},
	create_category: {
		vi: "Tạo chuyên mục",
		en: "Create Category"
	},
	edit_category: {
		vi: "Sửa chuyên mục",
		en: "Edit Category"
	},
	tag_name: {
		vi: "Tên thẻ tag",
		en: "Tag Name"
	},
	create_tag: {
		vi: "Tạo thẻ tag",
		en: "Create Tag"
	},
	active_tags: {
		vi: "Các thẻ tag hoạt động",
		en: "Active Tags"
	},
	deleted_tags: {
		vi: "Các thẻ tag đã xóa",
		en: "Deleted Tags"
	},
	save_changes: {
		vi: "Lưu thay đổi",
		en: "Save Changes"
	},
	cancel: {
		vi: "Hủy bỏ",
		en: "Cancel"
	},
	back: {
		vi: "Quay lại",
		en: "Back"
	},
	editor_title_vi: {
		vi: "Tiêu đề bài viết (VI)",
		en: "Article Title (VI)"
	},
	editor_title_en: {
		vi: "Tiêu đề bài viết (EN)",
		en: "Article Title (EN)"
	},
	editor_slug_vi: {
		vi: "Đường dẫn Slug VI",
		en: "Post URL Slug VI"
	},
	editor_slug_en: {
		vi: "Đường dẫn Slug EN",
		en: "Post URL Slug EN"
	},
	editor_excerpt_vi: {
		vi: "Tóm tắt ngắn (VI)",
		en: "Short Excerpt (VI)"
	},
	editor_excerpt_en: {
		vi: "Tóm tắt ngắn (EN)",
		en: "Short Excerpt (EN)"
	},
	editor_content_vi: {
		vi: "Nội dung bài viết (VI)",
		en: "Article Content (VI)"
	},
	editor_content_en: {
		vi: "Nội dung bài viết (EN)",
		en: "Article Content (EN)"
	},
	editor_auto_translate: {
		vi: "🌐 Dịch tự động từ Tiếng Việt",
		en: "🌐 Auto-translate from Vietnamese"
	},
	editor_translating: {
		vi: "Đang dịch...",
		en: "Translating..."
	},
	editor_translate_success: {
		vi: "Đã dịch tự động sang Tiếng Anh thành công!",
		en: "Auto-translated to English successfully!"
	},
	editor_translate_error: {
		vi: "Gặp lỗi khi dịch tự động: ",
		en: "Error during auto-translation: "
	},
	editor_vietnamese_tab: {
		vi: "Tiếng Việt (Bản chính)",
		en: "Vietnamese (Main)"
	},
	editor_english_tab: {
		vi: "Tiếng Anh (Bản dịch)",
		en: "English (Translation)"
	},
	editor_seo_title: {
		vi: "Cấu hình SEO Metadata",
		en: "SEO Metadata Config"
	},
	editor_google_preview: {
		vi: "Xem trước kết quả Google",
		en: "Google Search Preview"
	},
	editor_publish_settings: {
		vi: "Thiết lập xuất bản",
		en: "Publish Settings"
	},
	editor_is_pdf: {
		vi: "Bài viết dạng tài liệu PDF",
		en: "Is PDF Document Post"
	},
	editor_pdf_attached: {
		vi: "File PDF đính kèm",
		en: "Attached PDF File"
	},
	editor_select_pdf: {
		vi: "Chọn file PDF",
		en: "Select PDF File"
	},
	editor_pick_cover: {
		vi: "Chọn ảnh bìa",
		en: "Pick Cover Image"
	},
	editor_remove_cover: {
		vi: "Xóa ảnh bìa",
		en: "Remove Cover Image"
	},
	editor_taxonomy: {
		vi: "Phân loại",
		en: "Taxonomy"
	}
};
var LanguageContext = createContext(void 0);
var LanguageProvider = ({ children }) => {
	const rootData = useRouteLoaderData("root");
	const [language, setLanguageState] = useState(() => rootData?.language || "vi");
	useEffect(() => {
		if (rootData?.language) setLanguageState(rootData.language);
	}, [rootData?.language]);
	const setLanguage = (lang) => {
		setLanguageState(lang);
		setCookie("language", lang, 365);
	};
	const t = (key) => {
		const translation = dictionary[key];
		if (!translation) return key;
		return translation[language] || key;
	};
	return /* @__PURE__ */ jsx(LanguageContext.Provider, {
		value: {
			language,
			setLanguage,
			t
		},
		children
	});
};
var useLanguage = () => {
	const context = useContext(LanguageContext);
	if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
	return context;
};
//#endregion
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
//#region src/layouts/RootLayout.tsx
var RootLayout_exports = /* @__PURE__ */ __exportAll({
	RootLayout: () => RootLayout,
	default: () => RootLayout_default,
	loader: () => loader$10
});
var queryClient = new QueryClient({ defaultOptions: { queries: {
	refetchOnWindowFocus: false,
	retry: 1
} } });
async function loader$10() {
	try {
		const res = await settingsService.getPublic();
		if (res.success && res.data) return { settings: res.data };
	} catch (err) {
		console.error("Failed to load global colors", err);
	}
	return { settings: {} };
}
var RootLayout = () => {
	const settings = useLoaderData()?.settings || {};
	const [primaryColor, setPrimaryColor] = useState(settings.theme_primary_color || "#3b82f6");
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
		if (settings.theme_primary_color) document.documentElement.style.setProperty("--primary-color", settings.theme_primary_color);
		if (settings.theme_button_bg) document.documentElement.style.setProperty("--btn-bg", settings.theme_button_bg);
		if (settings.theme_text_color) document.documentElement.style.setProperty("--text-color", settings.theme_text_color);
	}, [settings]);
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
//#region src/layouts/PublicLayout.tsx
var PublicLayout_exports = /* @__PURE__ */ __exportAll({
	PublicLayout: () => PublicLayout,
	default: () => PublicLayout_default
});
var PublicLayout = () => {
	const { isAuthenticated } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const [showScrollTop, setShowScrollTop] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const settings = useRouteLoaderData("root-layout")?.settings || {};
	const [weatherInfo, setWeatherInfo] = useState(null);
	const [loadingWeather, setLoadingWeather] = useState(true);
	useEffect(() => {
		const handleScroll = () => {
			setShowScrollTop(window.scrollY > 400);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
	useEffect(() => {
		const fetchWeather = async (lat, lon, cityName) => {
			try {
				const data = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)).json();
				if (data && data.current_weather) setWeatherInfo({
					city: cityName,
					temp: Math.round(data.current_weather.temperature),
					code: data.current_weather.weathercode
				});
			} catch (e) {
				console.error("Failed to fetch weather", e);
			} finally {
				setLoadingWeather(false);
			}
		};
		const fallbackIPLocation = async () => {
			try {
				const ipData = await (await fetch("https://ipapi.co/json/")).json();
				if (ipData && ipData.latitude && ipData.longitude) await fetchWeather(ipData.latitude, ipData.longitude, ipData.city || "TP HCM");
				else await fetchWeather(10.8231, 106.6297, "TP HCM");
			} catch {
				await fetchWeather(10.8231, 106.6297, "TP HCM");
			}
		};
		if (typeof window !== "undefined" && "geolocation" in navigator) navigator.geolocation.getCurrentPosition(async (position) => {
			await fetchWeather(position.coords.latitude, position.coords.longitude, "Vị trí của bạn");
		}, () => {
			fallbackIPLocation();
		}, { timeout: 5e3 });
		else fallbackIPLocation();
	}, []);
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const { language, setLanguage, t } = useLanguage();
	const formattedDate = (/* @__PURE__ */ new Date()).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
		weekday: "long",
		day: "numeric",
		month: "numeric",
		year: "numeric"
	});
	const getSiteName = () => {
		return settings.site_name || "Blogs";
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen text-slate-900 dark:text-slate-5 flex flex-col transition-colors duration-300 selection:bg-accentBlue/25 selection:text-accentBlue",
		style: { backgroundColor: theme === "dark" ? "var(--custom-dark-bg)" : "var(--custom-light-bg)" },
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 dark:bg-[#090D16]/90 border-b border-slate-200/80 dark:border-slate-800/60 shadow-sm transition-all duration-300",
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
										className: "text-slate-600 dark:text-slate-50",
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
							className: "hidden lg:flex items-center gap-3 px-3 py-1 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 rounded-xl text-xs select-none",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium",
									children: [
										/* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 text-accentBlue" }),
										/* @__PURE__ */ jsx("span", { children: weatherInfo ? weatherInfo.city : loadingWeather ? "..." : "TP HCM" }),
										weatherInfo?.temp !== void 0 ? /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-1 ml-1 text-slate-800 dark:text-slate-100 font-bold",
											children: [weatherInfo.code <= 3 ? /* @__PURE__ */ jsx(Sun, { className: "w-3.5 h-3.5 text-amber-500" }) : weatherInfo.code >= 51 ? /* @__PURE__ */ jsx(CloudRain, { className: "w-3.5 h-3.5 text-blue-400" }) : /* @__PURE__ */ jsx(CloudSun, { className: "w-3.5 h-3.5 text-slate-400" }), /* @__PURE__ */ jsxs("span", { children: [weatherInfo.temp, "°C"] })]
										}) : null
									]
								}),
								/* @__PURE__ */ jsx("div", { className: "w-px h-3.5 bg-slate-300 dark:bg-slate-700" }),
								/* @__PURE__ */ jsx("div", {
									className: "text-slate-500 dark:text-gray-400 font-semibold capitalize text-[11px]",
									children: formattedDate
								})
							]
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
					className: "md:hidden border-t border-slate-200/80 dark:border-slate-800/60 bg-white dark:bg-[#090D16] px-4 py-4 space-y-2 animate-fade-in",
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
				className: "bg-white dark:bg-[#06080F] border-t border-slate-200/80 dark:border-slate-800/60 relative z-10 transition-colors duration-300",
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
//#region src/components/PostCard.tsx
var { Paragraph, Title } = Typography;
var PostCardSkeleton = () => {
	return /* @__PURE__ */ jsxs(Card, {
		hoverable: false,
		className: "h-full border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white/70 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm",
		styles: { body: {
			padding: "20px",
			display: "flex",
			flexDirection: "column",
			height: "100%"
		} },
		cover: /* @__PURE__ */ jsx("div", {
			className: "aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center p-4",
			children: /* @__PURE__ */ jsx(Skeleton.Button, {
				active: true,
				block: true,
				style: {
					height: "100%",
					borderRadius: "12px"
				}
			})
		}),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "space-y-4 flex-1",
			children: [/* @__PURE__ */ jsxs(Space, {
				size: 6,
				children: [/* @__PURE__ */ jsx(Skeleton.Button, {
					active: true,
					size: "small",
					style: {
						width: 80,
						borderRadius: 12
					}
				}), /* @__PURE__ */ jsx(Skeleton.Button, {
					active: true,
					size: "small",
					style: {
						width: 60,
						borderRadius: 6
					}
				})]
			}), /* @__PURE__ */ jsx(Skeleton, {
				active: true,
				title: { width: "90%" },
				paragraph: {
					rows: 2,
					width: ["100%", "70%"]
				}
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "pt-4 border-t border-slate-100 dark:border-slate-800/40 mt-4 flex justify-between items-center",
			children: [/* @__PURE__ */ jsx(Skeleton.Input, {
				active: true,
				size: "small",
				style: { width: 120 }
			}), /* @__PURE__ */ jsx(Skeleton.Input, {
				active: true,
				size: "small",
				style: { width: 70 }
			})]
		})]
	});
};
var PostCard = ({ post, language, t, formatRelative, estimateReadTime, toggleFilter }) => {
	const coverUrl = post.cover_media?.thumbnail_url ? getFullUrl(post.cover_media.thumbnail_url) : post.cover_media?.url ? getFullUrl(post.cover_media.url) : "";
	const readTime = estimateReadTime(post.content || post.excerpt || "");
	const primaryCategory = post.categories?.[0];
	const isPDF = !!post.is_document;
	const titleText = language === "en" ? post.title_en || post.title : post.title;
	const excerptText = language === "en" ? post.excerpt_en || post.excerpt : post.excerpt;
	const renderCover = () => {
		if (coverUrl) return /* @__PURE__ */ jsxs(Link, {
			to: `/posts/${post.slug}`,
			className: "block aspect-[16/10] overflow-hidden relative group/img",
			children: [/* @__PURE__ */ jsx("img", {
				src: coverUrl,
				alt: titleText,
				className: "w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500",
				loading: "lazy"
			}), /* @__PURE__ */ jsx("div", {
				className: "absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-4",
				children: /* @__PURE__ */ jsxs("span", {
					className: "text-white text-xs font-bold flex items-center gap-1",
					children: [
						t("read_more") || "Read Article",
						" ",
						/* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5" })
					]
				})
			})]
		});
		if (isPDF) return /* @__PURE__ */ jsx(Link, {
			to: `/posts/${post.slug}`,
			className: "flex items-center justify-center aspect-[16/10] overflow-hidden bg-gradient-to-br from-red-950/40 via-slate-900/60 to-slate-950 border-b border-red-500/20 group/pdf",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center gap-2 text-red-400/80 group-hover/pdf:scale-105 transition-transform",
				children: [/* @__PURE__ */ jsx(FileText, { className: "w-12 h-12 stroke-[1.5]" }), /* @__PURE__ */ jsx("span", {
					className: "text-xs font-extrabold uppercase tracking-wider",
					children: "PDF Document"
				})]
			})
		});
		return null;
	};
	const cardInner = /* @__PURE__ */ jsxs(Card, {
		hoverable: true,
		className: "group h-full border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-900/40 hover:border-accentBlue/40 dark:hover:border-accentBlue/30 hover:shadow-xl hover:shadow-accentBlue/10 transition-all duration-300 flex flex-col justify-between",
		styles: { body: {
			padding: "20px",
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between",
			flex: 1
		} },
		cover: renderCover(),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-1.5",
					children: [primaryCategory && /* @__PURE__ */ jsx(Tag$1, {
						color: "processing",
						className: "m-0 border-accentBlue/20 bg-accentBlue/10 text-accentBlue font-bold text-[10px] uppercase tracking-wider rounded-full px-2.5 py-0.5 cursor-pointer hover:opacity-80 transition-opacity",
						onClick: (e) => {
							e.preventDefault();
							toggleFilter("category", primaryCategory.slug);
						},
						children: primaryCategory.name
					}), post.tags && post.tags.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap gap-1",
						children: [post.tags.slice(0, 2).map((tag) => /* @__PURE__ */ jsxs(Tag$1, {
							className: "m-0 border-0 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-gray-400 font-medium text-[10px] rounded px-2 py-0.5 cursor-pointer hover:text-accentBlue transition-colors",
							onClick: (e) => {
								e.preventDefault();
								toggleFilter("tag", tag.slug);
							},
							children: ["#", tag.name]
						}, tag.id)), post.tags.length > 2 && /* @__PURE__ */ jsxs(Tag$1, {
							className: "m-0 border-0 bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-gray-500 font-bold text-[10px] rounded px-1.5 py-0.5",
							children: ["+", post.tags.length - 2]
						})]
					})]
				}),
				/* @__PURE__ */ jsx(Link, {
					to: `/posts/${post.slug}`,
					className: "block group-hover:text-accentBlue transition-colors",
					children: /* @__PURE__ */ jsx(Title, {
						level: 5,
						className: "!m-0 !font-extrabold !text-slate-900 dark:!text-white group-hover:!text-accentBlue transition-colors !leading-snug line-clamp-2",
						children: titleText
					})
				}),
				excerptText && /* @__PURE__ */ jsx(Paragraph, {
					ellipsis: { rows: 2 },
					className: "!m-0 !text-xs !text-slate-500 dark:!text-gray-400 !leading-relaxed",
					children: excerptText
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-gray-500 pt-4 border-t border-slate-100 dark:border-slate-800/40 mt-4",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5 text-slate-400" }), formatRelative(post.published_at || post.created_at, t)]
			}), /* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1",
				children: [
					/* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5 text-slate-400" }),
					readTime,
					" ",
					t("read_time_mins")
				]
			})]
		})]
	});
	if (isPDF) return /* @__PURE__ */ jsx(Badge.Ribbon, {
		text: /* @__PURE__ */ jsxs("span", {
			className: "flex items-center gap-1 text-[10px] font-extrabold tracking-wider uppercase",
			children: [/* @__PURE__ */ jsx(FileText, { className: "w-3 h-3" }), "PDF"]
		}),
		color: "red",
		placement: "end",
		children: cardInner
	});
	return cardInner;
};
//#endregion
//#region src/pages/BlogHome.tsx
var BlogHome_exports = /* @__PURE__ */ __exportAll({
	BlogHome: () => BlogHome,
	HydrateFallback: () => HydrateFallback$15,
	default: () => BlogHome_default,
	loader: () => loader$9
});
async function loader$9({ request }) {
	const searchParams = new URL(request.url).searchParams;
	const currentPage = parseInt(searchParams.get("page") || "1");
	const LIMIT = 6;
	const offset = (currentPage - 1) * LIMIT;
	const selectedCategories = searchParams.get("category") ? searchParams.get("category").split(",").filter(Boolean) : [];
	const selectedTags = searchParams.get("tag") ? searchParams.get("tag").split(",").filter(Boolean) : [];
	const searchQuery = searchParams.get("q") || "";
	const params = {
		offset,
		limit: LIMIT
	};
	if (searchQuery) params.search = searchQuery;
	try {
		const [postsRes, catRes, tagRes, settingsRes] = await Promise.all([
			publicService.getPosts(params),
			publicService.getCategories(),
			publicService.getTags(),
			settingsService.getPublic()
		]);
		let items = postsRes.data?.items || [];
		if (selectedCategories.length > 0) items = items.filter((p) => p.categories?.some((c) => selectedCategories.includes(c.slug)));
		if (selectedTags.length > 0) items = items.filter((p) => p.tags?.some((t) => selectedTags.includes(t.slug)));
		const total = selectedCategories.length > 0 || selectedTags.length > 0 ? items.length : postsRes.data?.total || items.length;
		return {
			posts: items,
			total,
			categories: catRes.data || [],
			tags: tagRes.data || [],
			settings: settingsRes.data || null
		};
	} catch (err) {
		return {
			posts: [],
			total: 0,
			categories: [],
			tags: [],
			settings: null
		};
	}
}
function formatRelative$1(dateStr, t) {
	try {
		const date = new Date(dateStr);
		const diffMs = (/* @__PURE__ */ new Date()).getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
		if (diffDays < 1) return t("today");
		if (diffDays < 7) return `${diffDays} ${t("days_ago")}`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t("weeks_ago")}`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${t("months_ago")}`;
		return `${Math.floor(diffDays / 365)} ${t("years_ago")}`;
	} catch {
		return dateStr;
	}
}
function estimateReadTime$1(html) {
	const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 200));
}
var BlogHome = () => {
	const { t, language } = useLanguage();
	const { posts, total, categories, tags, settings } = useLoaderData();
	const loading = useNavigation().state === "loading";
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
	const LIMIT = 6;
	const currentPage = parseInt(searchParams.get("page") || "1");
	const selectedCategories = searchParams.get("category") ? searchParams.get("category").split(",").filter(Boolean) : [];
	const selectedTags = searchParams.get("tag") ? searchParams.get("tag").split(",").filter(Boolean) : [];
	const searchQuery = searchParams.get("q") || "";
	const heroKicker = settings?.hero_kicker || "";
	const heroTitleLine1 = settings?.hero_title_line1 || "";
	const heroTitleLine2 = settings?.hero_title_line2 || "";
	const heroSubtitle = settings?.hero_subtitle || "";
	const toggleFilter = (key, value) => {
		const next = new URLSearchParams(searchParams);
		const currentList = next.get(key) ? next.get(key).split(",").filter(Boolean) : [];
		const index = currentList.indexOf(value);
		if (index > -1) currentList.splice(index, 1);
		else currentList.push(value);
		if (currentList.length > 0) next.set(key, currentList.join(","));
		else next.delete(key);
		next.set("page", "1");
		setSearchParams(next);
	};
	const clearFilters = () => {
		setSearchParams({});
		setSearchInput("");
	};
	const setPage = (p) => {
		const next = new URLSearchParams(searchParams);
		next.set("page", String(p));
		setSearchParams(next);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const hasActiveFilter = selectedCategories.length > 0 || selectedTags.length > 0 || searchQuery;
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto space-y-8 select-none",
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "text-center py-10 md:py-14 space-y-4 select-text",
				children: [
					heroKicker && /* @__PURE__ */ jsx("p", {
						className: "text-xs font-extrabold uppercase tracking-wider text-accentBlue/90 sm:text-sm",
						children: heroKicker
					}),
					/* @__PURE__ */ jsxs("h1", {
						className: "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight",
						children: [heroTitleLine1 && /* @__PURE__ */ jsx("span", {
							className: "block",
							children: heroTitleLine1
						}), heroTitleLine2 && /* @__PURE__ */ jsx("span", {
							className: "block bg-gradient-to-r from-accentBlue via-[#3b82f6] to-accentPurple bg-clip-text text-transparent",
							children: heroTitleLine2
						})]
					}),
					heroSubtitle && /* @__PURE__ */ jsx("p", {
						className: "max-w-xl mx-auto text-sm text-slate-500 dark:text-gray-400 font-medium",
						children: heroSubtitle
					})
				]
			}),
			/* @__PURE__ */ jsx(Card, {
				className: "border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-sm",
				children: /* @__PURE__ */ jsxs("div", {
					className: "space-y-4 select-text",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-full",
							children: /* @__PURE__ */ jsx(Input.Search, {
								placeholder: t("search_placeholder"),
								enterButton: t("search_posts"),
								size: "large",
								allowClear: true,
								value: searchInput,
								onChange: (e) => setSearchInput(e.target.value),
								onSearch: (value) => {
									const next = new URLSearchParams(searchParams);
									if (value.trim()) next.set("q", value.trim());
									else next.delete("q");
									next.set("page", "1");
									setSearchParams(next);
								},
								className: "rounded-2xl overflow-hidden search-input-antd premium-search"
							})
						}),
						categories.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap gap-2 items-center",
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mr-1",
									children: [t("categories") || "Categories", ":"]
								}),
								/* @__PURE__ */ jsx(Tag$1.CheckableTag, {
									checked: !hasActiveFilter,
									onChange: clearFilters,
									className: `rounded-full px-3.5 py-1 text-xs font-semibold border transition-all ${!hasActiveFilter ? "!bg-accentBlue !text-white" : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-gray-400 hover:text-accentBlue"}`,
									children: t("all_posts")
								}),
								categories.map((cat) => {
									const isSelected = selectedCategories.includes(cat.slug);
									return /* @__PURE__ */ jsx(Tag$1.CheckableTag, {
										checked: isSelected,
										onChange: () => toggleFilter("category", cat.slug),
										className: `rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${isSelected ? "!bg-accentBlue !text-white" : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-gray-400 hover:text-accentBlue"}`,
										children: cat.name
									}, cat.id);
								})
							]
						}),
						tags.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap gap-1.5 items-center pt-1 border-t border-slate-100 dark:border-slate-800/40",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mr-1",
								children: [t("tags") || "Tags", ":"]
							}), tags.slice(0, 24).map((tag) => {
								const isSelected = selectedTags.includes(tag.slug);
								return /* @__PURE__ */ jsxs(Tag$1.CheckableTag, {
									checked: isSelected,
									onChange: () => toggleFilter("tag", tag.slug),
									className: `rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-all ${isSelected ? "!bg-accentPurple !text-white" : "bg-slate-100/70 dark:bg-slate-800/40 text-slate-500 dark:text-gray-400 hover:text-accentPurple"}`,
									children: ["#", tag.name]
								}, tag.id);
							})]
						}),
						hasActiveFilter && /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/40",
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "text-xs text-slate-400 font-semibold",
									children: [t("filtering_by"), ":"]
								}),
								selectedCategories.map((catSlug) => /* @__PURE__ */ jsx(Tag$1, {
									closable: true,
									onClose: () => toggleFilter("category", catSlug),
									color: "blue",
									className: "rounded-full px-2.5 py-0.5 font-semibold text-xs m-0",
									children: categories.find((c) => c.slug === catSlug)?.name || catSlug
								}, catSlug)),
								selectedTags.map((tagSlug) => /* @__PURE__ */ jsxs(Tag$1, {
									closable: true,
									onClose: () => toggleFilter("tag", tagSlug),
									color: "purple",
									className: "rounded-full px-2.5 py-0.5 font-semibold text-xs m-0",
									children: ["#", tags.find((t) => t.slug === tagSlug)?.name || tagSlug]
								}, tagSlug)),
								searchQuery && /* @__PURE__ */ jsxs(Tag$1, {
									closable: true,
									onClose: () => {
										const next = new URLSearchParams(searchParams);
										next.delete("q");
										setSearchParams(next);
										setSearchInput("");
									},
									color: "default",
									className: "rounded-full px-2.5 py-0.5 font-semibold text-xs m-0",
									children: [
										"\"",
										searchQuery,
										"\""
									]
								}),
								/* @__PURE__ */ jsx(Tag$1, {
									color: "error",
									className: "cursor-pointer font-bold text-xs m-0 rounded-full px-2.5 py-0.5",
									onClick: clearFilters,
									children: "Clear all"
								})
							]
						})
					]
				})
			}),
			loading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-6",
				children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx(PostCardSkeleton, {}, i))
			}) : posts.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "text-center py-20 space-y-4",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "text-5xl",
						children: "📭"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-slate-500 dark:text-gray-500 text-sm font-medium",
						children: t("no_posts")
					}),
					hasActiveFilter && /* @__PURE__ */ jsx("button", {
						onClick: clearFilters,
						className: "text-accentBlue text-sm font-semibold hover:underline",
						children: t("clear_filter_try_again")
					})
				]
			}) : /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-6",
				children: posts.map((post) => /* @__PURE__ */ jsx(PostCard, {
					post,
					language,
					t,
					formatRelative: formatRelative$1,
					estimateReadTime: estimateReadTime$1,
					toggleFilter
				}, post.id))
			}),
			total > LIMIT && /* @__PURE__ */ jsx("div", {
				className: "flex justify-center pt-8 select-none",
				children: /* @__PURE__ */ jsx(Pagination, {
					current: currentPage,
					pageSize: LIMIT,
					total,
					onChange: (page) => setPage(page),
					showSizeChanger: false
				})
			})
		]
	});
};
var HydrateFallback$15 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsx("div", {
		className: "mx-auto space-y-8 select-none max-w-7xl px-4 pt-10",
		children: /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-1 md:grid-cols-3 gap-6",
			children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx(PostCardSkeleton, {}, i))
		})
	});
});
var BlogHome_default = UNSAFE_withComponentProps(BlogHome);
//#endregion
//#region src/components/CommentSection.tsx
var EMOJIS = [
	{
		key: "like",
		label: "👍",
		title: "Like"
	},
	{
		key: "love",
		label: "❤️",
		title: "Love"
	},
	{
		key: "wow",
		label: "😲",
		title: "Wow"
	},
	{
		key: "haha",
		label: "😂",
		title: "Haha"
	},
	{
		key: "sad",
		label: "😢",
		title: "Sad"
	}
];
var CommentSection = ({ postId }) => {
	const [comments, setComments] = useState([]);
	const [reactions, setReactions] = useState([]);
	const [content, setContent] = useState("");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [replyingToId, setReplyingToId] = useState(null);
	const [replyContent, setReplyContent] = useState("");
	const [replyName, setReplyName] = useState("");
	const [replyEmail, setReplyEmail] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const { showSuccess, showError } = useToast();
	const loadData = async () => {
		try {
			const [commentsRes, reactionsRes] = await Promise.all([commentService.listComments(postId), commentService.getReactions(postId)]);
			setComments(commentsRes.data || []);
			setReactions(reactionsRes.data || []);
		} catch (err) {
			console.error("Failed to load comments/reactions", err);
		}
	};
	useEffect(() => {
		loadData();
	}, [postId]);
	const handleReact = async (emoji) => {
		try {
			const res = await commentService.react(postId, emoji);
			setReactions(res.data || []);
		} catch (err) {
			console.error(err);
			showError("Failed to toggle reaction.");
		}
	};
	const handlePostComment = async (e, parentId) => {
		e.preventDefault();
		const commentContent = parentId ? replyContent : content;
		const authorName = parentId ? replyName : name;
		const authorEmail = parentId ? replyEmail : email;
		if (!commentContent.trim()) {
			showError("Comment content cannot be empty.");
			return;
		}
		setSubmitting(true);
		try {
			const res = await commentService.postComment(postId, {
				author_name: authorName || "Anonymous Guest",
				author_email: authorEmail || "guest@example.com",
				content: commentContent,
				parent_id: parentId
			});
			showSuccess(res.message || "Comment posted successfully.");
			if (parentId) {
				setReplyContent("");
				setReplyName("");
				setReplyEmail("");
				setReplyingToId(null);
			} else {
				setContent("");
				setName("");
				setEmail("");
			}
			loadData();
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to submit comment.");
		} finally {
			setSubmitting(false);
		}
	};
	const getEmojiCount = (emojiKey) => {
		const found = reactions.find((r) => r.emoji === emojiKey);
		return found ? found.count : 0;
	};
	const hasReacted = (emojiKey) => {
		const found = reactions.find((r) => r.emoji === emojiKey);
		return found ? found.reacted : false;
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8 mt-12 border-t border-slate-200 dark:border-slate-800/80 pt-8 max-w-4xl mx-auto transition-colors duration-200",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/40 rounded-2xl p-4 bg-white/40 dark:bg-slate-900/10",
				children: [/* @__PURE__ */ jsx("h4", {
					className: "text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider mb-3",
					children: "Reactions"
				}), /* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap gap-3",
					children: EMOJIS.map((emoji) => {
						const count = getEmojiCount(emoji.key);
						return /* @__PURE__ */ jsxs("button", {
							onClick: () => handleReact(emoji.key),
							className: `flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${hasReacted(emoji.key) ? "bg-accentBlue/10 border-accentBlue text-accentBlue scale-105 shadow-md shadow-accentBlue/5" : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:border-slate-350 dark:hover:border-slate-700"}`,
							title: emoji.title,
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-base",
								children: emoji.label
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold font-mono",
								children: count
							})]
						}, emoji.key);
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/40 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/10 space-y-4",
				children: [/* @__PURE__ */ jsxs("h4", {
					className: "text-sm font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 text-accentBlue" }), /* @__PURE__ */ jsx("span", { children: "Để lại bình luận" })]
				}), /* @__PURE__ */ jsxs("form", {
					onSubmit: (e) => handlePostComment(e),
					className: "space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ jsx("input", {
							type: "text",
							placeholder: "Tên của bạn (tùy chọn)",
							value: name,
							onChange: (e) => setName(e.target.value),
							className: "bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-800 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl py-2 px-4 outline-none text-sm transition-all"
						}), /* @__PURE__ */ jsx("input", {
							type: "email",
							placeholder: "Email của bạn (tùy chọn - không hiển thị)",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							className: "bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-800 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl py-2 px-4 outline-none text-sm transition-all"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [/* @__PURE__ */ jsx("textarea", {
							placeholder: "Chia sẻ suy nghĩ của bạn...",
							rows: 3,
							value: content,
							onChange: (e) => setContent(e.target.value),
							required: true,
							className: "w-full bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-850 dark:text-gray-205 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl py-3 px-4 outline-none text-sm transition-all resize-none"
						}), /* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: submitting,
							className: "absolute right-3 bottom-3 p-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 disabled:opacity-50 text-white rounded-lg transition-all shadow-md",
							children: /* @__PURE__ */ jsx(Send, { className: "w-3.5 h-3.5" })
						})]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ jsxs("h4", {
					className: "text-sm font-semibold text-slate-400 dark:text-gray-400",
					children: [
						"Bình luận (",
						comments.length,
						")"
					]
				}), comments.length === 0 ? /* @__PURE__ */ jsx("div", {
					className: "p-8 text-center text-slate-400 dark:text-gray-650 text-xs font-sans",
					children: "Chưa có bình luận nào. Hãy là người đầu tiên bắt đầu cuộc trò chuyện!"
				}) : /* @__PURE__ */ jsx("div", {
					className: "space-y-6",
					children: comments.map((comment) => /* @__PURE__ */ jsxs("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex space-x-3",
								children: [/* @__PURE__ */ jsx("div", {
									className: "w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-750 flex items-center justify-center font-bold text-xs text-accentBlue shrink-0",
									children: (comment.author_name || "G").charAt(0).toUpperCase()
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex-1 space-y-1",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs font-semibold text-slate-800 dark:text-gray-200",
												children: comment.author_name || "Khách"
											}), /* @__PURE__ */ jsx("span", {
												className: "text-[10px] text-slate-400 dark:text-gray-500",
												children: new Date(comment.created_at).toLocaleDateString()
											})]
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-sm text-slate-700 dark:text-gray-300 leading-relaxed bg-white/60 dark:bg-slate-950/30 border border-slate-150 dark:border-slate-900/60 rounded-xl p-3",
											children: comment.content
										}),
										/* @__PURE__ */ jsx("button", {
											onClick: () => setReplyingToId(replyingToId === comment.id ? null : comment.id),
											className: "text-[11px] text-accentBlue hover:underline font-semibold pl-1",
											children: "Phản hồi"
										})
									]
								})]
							}),
							replyingToId === comment.id && /* @__PURE__ */ jsxs("div", {
								className: "ml-10 flex space-x-2 items-start bg-slate-100/50 dark:bg-slate-950/20 p-4 border border-slate-200 dark:border-slate-900 rounded-2xl",
								children: [/* @__PURE__ */ jsx("div", {
									className: "shrink-0 pt-2",
									children: /* @__PURE__ */ jsx(CornerDownRight, { className: "w-4 h-4 text-slate-400 dark:text-gray-500" })
								}), /* @__PURE__ */ jsxs("form", {
									onSubmit: (e) => handlePostComment(e, comment.id),
									className: "flex-1 space-y-3",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
										children: [/* @__PURE__ */ jsx("input", {
											type: "text",
											placeholder: "Tên của bạn (tùy chọn)",
											value: replyName,
											onChange: (e) => setReplyName(e.target.value),
											className: "bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-800 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl py-1.5 px-3 outline-none text-xs transition-all"
										}), /* @__PURE__ */ jsx("input", {
											type: "email",
											placeholder: "Email của bạn (tùy chọn)",
											value: replyEmail,
											onChange: (e) => setReplyEmail(e.target.value),
											className: "bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-800 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl py-1.5 px-3 outline-none text-xs transition-all"
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ jsx("input", {
											type: "text",
											placeholder: "Viết phản hồi...",
											value: replyContent,
											onChange: (e) => setReplyContent(e.target.value),
											required: true,
											className: "flex-1 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 focus:border-accentBlue/50 text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-2 px-3 outline-none text-xs transition-all"
										}), /* @__PURE__ */ jsx("button", {
											type: "submit",
											disabled: submitting,
											className: "bg-gradient-to-r from-accentBlue to-accentPurple text-white font-semibold px-4 rounded-xl text-xs hover:brightness-110 transition-all",
											children: "Gửi"
										})]
									})]
								})]
							}),
							comment.replies && comment.replies.length > 0 && /* @__PURE__ */ jsx("div", {
								className: "ml-10 space-y-4 border-l border-slate-200 dark:border-slate-800/80 pl-4",
								children: comment.replies.map((reply) => /* @__PURE__ */ jsxs("div", {
									className: "flex space-x-3",
									children: [/* @__PURE__ */ jsx("div", {
										className: "w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-850 border border-slate-350 dark:border-slate-800 flex items-center justify-center font-bold text-[10px] text-accentPurple shrink-0",
										children: (reply.author_name || "G").charAt(0).toUpperCase()
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex-1 space-y-1",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs font-semibold text-slate-800 dark:text-gray-300",
												children: reply.author_name || "Khách"
											}), /* @__PURE__ */ jsx("span", {
												className: "text-[9px] text-slate-400 dark:text-gray-600",
												children: new Date(reply.created_at).toLocaleDateString()
											})]
										}), /* @__PURE__ */ jsx("p", {
											className: "text-xs text-slate-700 dark:text-gray-450 leading-relaxed bg-white/60 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-900/40 rounded-xl p-2.5",
											children: reply.content
										})]
									})]
								}, reply.id))
							})
						]
					}, comment.id))
				})]
			})
		]
	});
};
//#endregion
//#region src/pages/BlogPostDetail.tsx
var BlogPostDetail_exports = /* @__PURE__ */ __exportAll({
	BlogPostDetail: () => BlogPostDetail,
	HydrateFallback: () => HydrateFallback$14,
	default: () => BlogPostDetail_default,
	loader: () => loader$8
});
async function loader$8({ params }) {
	const slug = params.slug;
	if (!slug) return {
		post: null,
		relatedPosts: []
	};
	try {
		const post = (await publicService.getPostBySlug(slug)).data;
		let relatedPosts = [];
		if (post?.categories?.[0]?.id) relatedPosts = ((await publicService.getPosts({
			category_id: post.categories[0].id,
			limit: 4
		})).data?.items || []).filter((item) => item.id !== post.id).slice(0, 3);
		return {
			post,
			relatedPosts
		};
	} catch (err) {
		return {
			post: null,
			relatedPosts: []
		};
	}
}
function extractLang(className) {
	const m = className.match(/language-([a-z0-9+#-]+)/i);
	return m ? m[1].toUpperCase() : "CODE";
}
function parseToc(html) {
	const headings = new DOMParser().parseFromString(html, "text/html").querySelectorAll("h2, h3");
	const items = [];
	headings.forEach((el) => {
		const text = el.textContent?.trim() || "";
		const id = el.id || text.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F]+/gi, "-").replace(/^-|-$/g, "");
		if (id) items.push({
			id,
			text,
			level: parseInt(el.tagName[1])
		});
	});
	return items;
}
function processHtml(html, language) {
	if (typeof document === "undefined") return html;
	const doc = new DOMParser().parseFromString(html, "text/html");
	const usedIds = /* @__PURE__ */ new Map();
	doc.querySelectorAll("h2, h3, h4").forEach((el) => {
		let baseId = (el.textContent?.trim() || "").toLowerCase().replace(/[^a-z0-9\u00C0-\u024F]+/gi, "-").replace(/^-|-$/g, "");
		if (!baseId) baseId = "heading";
		let uniqueId = baseId;
		if (usedIds.has(baseId)) {
			const count = usedIds.get(baseId) + 1;
			usedIds.set(baseId, count);
			uniqueId = `${baseId}-${count}`;
		} else usedIds.set(baseId, 0);
		el.id = uniqueId;
	});
	doc.querySelectorAll("pre").forEach((pre) => {
		const lang = extractLang(pre.querySelector("code")?.className || "");
		const wrapper = doc.createElement("div");
		wrapper.className = "post-code-wrapper";
		const copyLabel = language === "vi" ? "Sao chép" : "Copy";
		const copyTitle = language === "vi" ? "Sao chép code" : "Copy code";
		const header = doc.createElement("div");
		header.className = "post-code-header";
		header.innerHTML = `<span class="post-code-lang">${lang}</span><button class="post-copy-btn" data-copy="true" title="${copyTitle}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> <span class="copy-label">${copyLabel}</span></button>`;
		pre.classList.add("post-code-block");
		pre.parentNode?.insertBefore(wrapper, pre);
		wrapper.appendChild(header);
		wrapper.appendChild(pre);
	});
	doc.querySelectorAll("code:not(pre code)").forEach((code) => {
		code.classList.add("post-inline-code");
	});
	doc.querySelectorAll("blockquote").forEach((bq) => {
		bq.classList.add("post-blockquote");
	});
	doc.querySelectorAll("img").forEach((img) => {
		img.classList.add("post-image", "cursor-zoom-in");
		img.setAttribute("loading", "lazy");
		const absoluteSrc = getFullUrl(img.getAttribute("src") || "");
		img.setAttribute("src", absoluteSrc);
	});
	doc.querySelectorAll("table").forEach((table) => {
		table.classList.add("post-table");
		const wrap = doc.createElement("div");
		wrap.className = "post-table-wrapper";
		table.parentNode?.insertBefore(wrap, table);
		wrap.appendChild(table);
	});
	return doc.body.innerHTML;
}
var buildCategoryBreadcrumbs = (cat) => {
	const crumbs = [];
	let current = cat;
	while (current) {
		crumbs.unshift(current);
		current = current.parent || null;
	}
	return crumbs;
};
function formatRelative(dateStr, t) {
	try {
		const date = new Date(dateStr);
		const diffDays = Math.floor((Date.now() - date.getTime()) / 864e5);
		if (diffDays < 1) return t("today");
		if (diffDays < 7) return `${diffDays} ${t("days_ago")}`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t("weeks_ago")}`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${t("months_ago")}`;
		return date.toLocaleDateString("vi-VN", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
	} catch {
		return dateStr;
	}
}
function estimateReadTime(html) {
	const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 200));
}
var BlogPostDetail = () => {
	const { t, language } = useLanguage();
	const { slug } = useParams();
	const navigate = useNavigate();
	const { post, relatedPosts } = useLoaderData();
	const loading = useNavigation().state === "loading";
	const [processedHtml, setProcessedHtml] = useState("");
	const [toc, setToc] = useState([]);
	const [activeId, setActiveId] = useState("");
	const [tocOpen, setTocOpen] = useState(false);
	const [showSummaryModal, setShowSummaryModal] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxSlides, setLightboxSlides] = useState([]);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [Lightbox, setLightbox] = useState(null);
	const [ZoomPlugin, setZoomPlugin] = useState(null);
	const [VideoPlugin, setVideoPlugin] = useState(null);
	const [PDFViewer, setPDFViewer] = useState(null);
	useEffect(() => {
		import("./assets/PDFViewer-C3_-wGUw.js").then((mod) => {
			setPDFViewer(() => mod.PDFViewer);
		});
		Promise.all([
			import("yet-another-react-lightbox"),
			import("yet-another-react-lightbox/plugins/zoom"),
			import("yet-another-react-lightbox/plugins/video"),
			Promise.resolve({                  })
		]).then(([lightboxMod, zoomMod, videoMod]) => {
			setLightbox(() => lightboxMod.default);
			setZoomPlugin(() => zoomMod.default);
			setVideoPlugin(() => videoMod.default);
		});
	}, []);
	const handleTocClick = (e, targetId) => {
		e.preventDefault();
		const element = document.getElementById(targetId);
		if (element) {
			element.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
			window.history.pushState(null, "", `#${targetId}`);
			setActiveId(targetId);
		}
	};
	useEffect(() => {
		if (!post) return;
		const processed = processHtml(language === "en" ? post.content_en || post.content : post.content || "", language);
		const parsedToc = parseToc(processed);
		setProcessedHtml(processed);
		setToc(parsedToc);
	}, [post, language]);
	useEffect(() => {
		const handleImageClick = (e) => {
			const target = e.target;
			if (target.tagName === "IMG" && target.classList.contains("post-image")) {
				e.preventDefault();
				const clickedSrc = target.getAttribute("src");
				if (clickedSrc) {
					const imgElements = Array.from(document.querySelectorAll(".post-content img.post-image"));
					const imgSlides = imgElements.map((img) => ({ src: img.getAttribute("src") || "" }));
					const clickedIndex = imgElements.findIndex((img) => img.getAttribute("src") === clickedSrc);
					setLightboxSlides(imgSlides);
					setLightboxIndex(clickedIndex >= 0 ? clickedIndex : 0);
					setLightboxOpen(true);
				}
			}
		};
		const container = document.querySelector(".post-content");
		container?.addEventListener("click", handleImageClick);
		return () => container?.removeEventListener("click", handleImageClick);
	}, [processedHtml]);
	const handleCopyClick = useCallback((e) => {
		const btn = e.target.closest("[data-copy=\"true\"]");
		if (!btn) return;
		const pre = btn.closest(".post-code-wrapper")?.querySelector("pre");
		if (!pre) return;
		const text = pre.textContent || "";
		navigator.clipboard.writeText(text).then(() => {
			const label = btn.querySelector(".copy-label");
			const copiedText = language === "vi" ? "Đã sao chép!" : "Copied!";
			const copyText = language === "vi" ? "Sao chép" : "Copy";
			if (label) label.textContent = copiedText;
			btn.classList.add("copied");
			setTimeout(() => {
				if (label) label.textContent = copyText;
				btn.classList.remove("copied");
			}, 2200);
		});
	}, [language]);
	useEffect(() => {
		if (toc.length === 0) return;
		const observer = new IntersectionObserver((entries) => {
			const visible = entries.filter((e) => e.isIntersecting);
			if (visible.length > 0) setActiveId(visible[0].target.id);
		}, {
			rootMargin: "-15% 0% -70% 0%",
			threshold: 0
		});
		toc.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});
		return () => observer.disconnect();
	}, [toc, processedHtml]);
	useEffect(() => {
		document.addEventListener("click", handleCopyClick);
		return () => document.removeEventListener("click", handleCopyClick);
	}, [handleCopyClick]);
	if (loading) return /* @__PURE__ */ jsx(HydrateFallback$14, {});
	if (!post) return /* @__PURE__ */ jsx(Navigate, {
		to: "/",
		replace: true
	});
	const readTime = estimateReadTime(post.content || "");
	const primaryCategory = post.categories?.[0];
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("style", { children: `
        /* ── Headings ── */
        .post-content h2 {
          font-size: 1.45rem; font-weight: 800;
          color: #0f172a; margin: 2.5rem 0 1rem;
          padding-bottom: 0.55rem;
          border-bottom: 1.5px solid #e2e8f0;
          line-height: 1.3; scroll-margin-top: 5rem;
        }
        .dark .post-content h2 { color: #f1f5f9; border-bottom-color: #1e293b; }
        .post-content h3 {
          font-size: 1.15rem; font-weight: 700;
          color: #1e293b; margin: 2rem 0 0.75rem;
          line-height: 1.4; scroll-margin-top: 5rem;
        }
        .dark .post-content h3 { color: #e2e8f0; }
        .post-content h4 {
          font-size: 1rem; font-weight: 700;
          color: #334155; margin: 1.5rem 0 0.5rem;
          scroll-margin-top: 5rem;
        }
        .dark .post-content h4 { color: #cbd5e1; }

        /* ── Paragraphs ── */
        .post-content p {
          font-size: 1rem; line-height: 1.9;
          color: #374151; margin-bottom: 1.3rem;
        }
        .dark .post-content p { color: #9ca3af; }

        /* ── Lists ── */
        .post-content ul, .post-content ol {
          padding-left: 1.6rem; margin-bottom: 1.3rem;
        }
        .post-content ul { list-style-type: disc; }
        .post-content ol { list-style-type: decimal; }
        .post-content li {
          font-size: 0.95rem; line-height: 1.85;
          color: #374151; margin-bottom: 0.4rem;
        }
        .dark .post-content li { color: #9ca3af; }

        /* ── Links ── */
        .post-content a {
          color: #2563eb; text-decoration: underline;
          text-underline-offset: 3px; transition: color 0.15s;
        }
        .post-content a:hover { color: #1d4ed8; }
        .dark .post-content a { color: #60a5fa; }
        .dark .post-content a:hover { color: #93c5fd; }

        /* ── Blockquote ── */
        .post-blockquote {
          border-left: 4px solid #2563eb;
          background: #eff6ff;
          border-radius: 0 0.875rem 0.875rem 0;
          padding: 1.1rem 1.4rem;
          margin: 1.75rem 0;
          font-style: italic;
          color: #1e3a8a;
        }
        .dark .post-blockquote {
          background: rgba(30,41,59,0.5);
          border-left-color: #3b82f6;
          color: #93c5fd;
        }
        .post-blockquote p { color: inherit !important; margin-bottom: 0 !important; }

        /* ── Code Wrapper ── */
        .post-code-wrapper {
          margin: 1.75rem 0;
          border-radius: 0.875rem;
          overflow: hidden;
          border: 1px solid #1e293b;
          box-shadow: 0 4px 24px rgba(0,0,0,0.22);
        }
        .post-code-header {
          display: flex; align-items: center;
          justify-content: space-between;
          background: #161b27;
          padding: 0.55rem 1rem;
          border-bottom: 1px solid #1e293b;
        }
        .post-code-lang {
          font-size: 0.62rem; font-weight: 700;
          font-family: monospace; letter-spacing: 0.12em;
          text-transform: uppercase; color: #64748b;
          background: #0f172a; padding: 0.18rem 0.55rem;
          border-radius: 0.3rem; border: 1px solid #1e293b;
        }
        .post-copy-btn {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.68rem; font-weight: 600;
          color: #64748b; background: transparent;
          border: 1px solid transparent; border-radius: 0.4rem;
          padding: 0.28rem 0.6rem; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
        }
        .post-copy-btn:hover {
          color: #e2e8f0; background: #1e293b; border-color: #334155;
        }
        .post-copy-btn.copied { color: #22c55e; }
        .post-code-block {
          background: #0d1117 !important;
          padding: 1.25rem 1.5rem !important;
          overflow-x: auto; margin: 0 !important;
          border-radius: 0 !important; border: none !important;
          font-size: 0.82rem !important; line-height: 1.8 !important;
          font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace !important;
          color: #e2e8f0 !important;
        }
        .post-code-block code {
          background: transparent !important; color: inherit !important;
          padding: 0 !important; border-radius: 0 !important;
          font-size: inherit !important;
        }

        /* ── Inline Code ── */
        .post-inline-code {
          background: #fef2f2; color: #dc2626;
          padding: 0.15rem 0.45rem; border-radius: 0.35rem;
          font-size: 0.83em;
          font-family: 'JetBrains Mono', Consolas, monospace;
          font-weight: 600; border: 1px solid #fecaca;
        }
        .dark .post-inline-code {
          background: rgba(127,29,29,0.2); color: #f87171; border-color: #7f1d1d;
        }

        /* ── Images ── */
        .post-image {
          max-width: 100%; height: auto;
          border-radius: 0.875rem; margin: 1.5rem auto; display: block;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          transition: transform 0.3s, box-shadow 0.3s; cursor: zoom-in;
        }
        .post-image:hover {
          transform: scale(1.01); box-shadow: 0 8px 40px rgba(0,0,0,0.2);
        }
        .dark .post-image { box-shadow: 0 4px 24px rgba(0,0,0,0.5); }

        /* ── Tables ── */
        .post-table-wrapper {
          overflow-x: auto; margin: 1.5rem 0;
          border-radius: 0.75rem; border: 1px solid #e2e8f0;
        }
        .dark .post-table-wrapper { border-color: #1e293b; }
        .post-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .post-table th {
          background: #f8fafc; color: #374151; font-weight: 700;
          text-align: left; padding: 0.75rem 1rem;
          border-bottom: 2px solid #e2e8f0;
        }
        .dark .post-table th { background: #0f172a; color: #e2e8f0; border-bottom-color: #1e293b; }
        .post-table td { padding: 0.65rem 1rem; color: #4b5563; border-bottom: 1px solid #f1f5f9; }
        .dark .post-table td { color: #94a3b8; border-bottom-color: #1e293b; }
        .post-table tr:last-child td { border-bottom: none; }

        /* ── Typography misc ── */
        .post-content strong { color: #111827; font-weight: 700; }
        .dark .post-content strong { color: #f1f5f9; }
        .post-content em { font-style: italic; }
        .post-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 2.25rem 0; }
        .dark .post-content hr { border-top-color: #1e293b; }
      ` }),
		/* @__PURE__ */ jsxs("div", {
			className: "max-w-6xl mx-auto",
			children: [/* @__PURE__ */ jsxs("nav", {
				className: "flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-500 mb-6 flex-wrap",
				"aria-label": "Breadcrumb",
				children: [
					/* @__PURE__ */ jsxs(Link, {
						to: "/",
						className: "flex items-center gap-1 hover:text-accentBlue transition-colors font-medium",
						children: [/* @__PURE__ */ jsx(Home, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: t("home") })]
					}),
					/* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5 text-slate-350" }),
					primaryCategory && buildCategoryBreadcrumbs(primaryCategory).map((crumb) => /* @__PURE__ */ jsxs(React.Fragment, { children: [/* @__PURE__ */ jsx(Link, {
						to: `/?category=${crumb.slug}`,
						className: "hover:text-accentBlue transition-colors font-medium",
						children: language === "en" ? crumb.name_en || crumb.name : crumb.name
					}), /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5 text-slate-355" })] }, crumb.id)),
					/* @__PURE__ */ jsx("span", {
						className: "text-slate-700 dark:text-gray-300 font-medium truncate max-w-[180px] md:max-w-sm",
						children: language === "en" ? post.title_en || post.title : post.title
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col lg:flex-row gap-8 lg:gap-12 items-start",
				children: [/* @__PURE__ */ jsxs("article", {
					className: "flex-1 min-w-0",
					children: [
						primaryCategory && /* @__PURE__ */ jsx("div", {
							className: "mb-4",
							children: /* @__PURE__ */ jsxs(Link, {
								to: `/?category=${primaryCategory.slug}`,
								className: "inline-flex items-center gap-1.5 bg-accentBlue/10 text-accentBlue text-[11px] font-bold px-3 py-1.5 rounded-full border border-accentBlue/20 hover:bg-accentBlue/15 transition-colors",
								children: [/* @__PURE__ */ jsx(Tag, { className: "w-3 h-3" }), language === "en" ? primaryCategory.name_en || primaryCategory.name : primaryCategory.name]
							})
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "text-2xl md:text-[2rem] lg:text-[2.25rem] font-extrabold text-slate-900 dark:text-white leading-tight mb-5 tracking-tight",
							children: language === "en" ? post.title_en || post.title : post.title
						}),
						(post.excerpt || post.excerpt_en) && /* @__PURE__ */ jsx("div", {
							className: "mb-6 flex items-center",
							children: /* @__PURE__ */ jsx(Button, {
								type: "dashed",
								onClick: () => setShowSummaryModal(true),
								icon: /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5 text-accentBlue" }),
								className: "border-accentBlue/30 hover:border-accentBlue text-accentBlue hover:text-accentPurple rounded-xl font-bold flex items-center gap-1.5 h-9 text-xs",
								children: language === "vi" ? "Xem tóm tắt nhanh" : "View quick summary"
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-gray-500 pb-6 mb-8 border-b border-slate-200 dark:border-slate-800/80",
							children: [
								post.author && /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [post.author.avatar_url ? /* @__PURE__ */ jsx("img", {
										src: getFullUrl(post.author.avatar_url),
										alt: post.author.name,
										className: "w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
									}) : /* @__PURE__ */ jsx("div", {
										className: "w-7 h-7 rounded-full bg-gradient-to-tr from-accentBlue to-accentPurple flex items-center justify-center text-white text-xs font-extrabold shrink-0",
										children: post.author.name ? post.author.name.charAt(0).toUpperCase() : "A"
									}), /* @__PURE__ */ jsx("span", {
										className: "font-semibold text-slate-700 dark:text-gray-300",
										children: post.author.name
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: formatRelative(post.published_at || post.created_at, t) })]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: language === "vi" ? `${readTime} phút đọc` : `${readTime} min read` })]
								})
							]
						}),
						post.is_document && post.pdf_media && /* @__PURE__ */ jsxs("div", {
							className: "rounded-2xl overflow-hidden mb-8 shadow-lg border border-red-500/25 bg-slate-900/40 p-4 space-y-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex items-center justify-between",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2 text-red-500",
									children: [/* @__PURE__ */ jsx(FileText, { className: "w-5 h-5" }), /* @__PURE__ */ jsx("span", {
										className: "text-sm font-bold",
										children: post.pdf_media.file_name
									})]
								})
							}), PDFViewer ? /* @__PURE__ */ jsx(PDFViewer, {
								url: getFullUrl(post.pdf_media.url),
								fileName: post.pdf_media.file_name
							}) : /* @__PURE__ */ jsx("div", {
								className: "text-xs text-gray-500 py-4 text-center",
								children: "Loading viewer component..."
							})]
						}),
						!post.is_document && post.cover_media?.url && /* @__PURE__ */ jsx("div", {
							className: "rounded-2xl overflow-hidden mb-8 shadow-lg border border-slate-200/60 dark:border-slate-800/60",
							children: post.cover_media.type === "video" ? /* @__PURE__ */ jsx("video", {
								src: getFullUrl(post.cover_media.url),
								controls: true,
								className: "w-full aspect-video object-cover"
							}) : /* @__PURE__ */ jsx("img", {
								src: getFullUrl(post.cover_media.url),
								alt: post.title,
								className: "w-full aspect-video object-cover cursor-pointer hover:opacity-95 transition-opacity",
								onClick: () => {
									setLightboxSlides([{ src: getFullUrl(post.cover_media.url) }]);
									setLightboxIndex(0);
									setLightboxOpen(true);
								}
							})
						}),
						toc.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "lg:hidden mb-6 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => setTocOpen(!tocOpen),
								className: "w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 dark:bg-slate-900/60 text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ jsx(List, { className: "w-4 h-4 text-accentBlue" }),
										"Mục lục bài viết (",
										toc.length,
										" mục)"
									]
								}), /* @__PURE__ */ jsx(ChevronRight, { className: `w-4 h-4 transition-transform duration-200 ${tocOpen ? "rotate-90" : ""}` })]
							}), tocOpen && /* @__PURE__ */ jsx("nav", {
								className: "bg-white dark:bg-slate-900/40 px-4 py-3 space-y-0.5 border-t border-slate-200 dark:border-slate-800/80",
								children: toc.map((item) => /* @__PURE__ */ jsx("a", {
									href: `#${item.id}`,
									onClick: (e) => {
										setTocOpen(false);
										handleTocClick(e, item.id);
									},
									className: `block text-xs py-1.5 text-slate-600 dark:text-gray-400 hover:text-accentBlue transition-colors ${item.level === 3 ? "pl-5" : "pl-2"}`,
									children: item.text
								}, item.id))
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "post-content post-content-wrapper",
							dangerouslySetInnerHTML: { __html: processedHtml }
						}),
						post.gallery && post.gallery.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "mt-10 pt-8 border-t border-slate-200 dark:border-slate-800/80 space-y-4",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "text-base font-bold text-slate-900 dark:text-white flex items-center gap-2",
								children: [/* @__PURE__ */ jsx(Image, { className: "w-4.5 h-4.5 text-accentBlue" }), /* @__PURE__ */ jsxs("span", { children: [
									"Hình ảnh (",
									post.gallery.length,
									")"
								] })]
							}), /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-2 sm:grid-cols-3 gap-4",
								children: post.gallery.map((item, idx) => {
									const slideList = post.gallery?.map((g) => {
										if (g.media.type === "video") return {
											type: "video",
											sources: [{
												src: getFullUrl(g.media.url),
												type: g.media.mime_type || "video/mp4"
											}]
										};
										return {
											src: getFullUrl(g.media.url),
											title: g.caption || void 0,
											description: g.alt_text || void 0
										};
									}) || [];
									return /* @__PURE__ */ jsxs("div", {
										className: "group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900/10",
										children: [/* @__PURE__ */ jsx("div", {
											onClick: () => {
												setLightboxSlides(slideList);
												setLightboxIndex(idx);
												setLightboxOpen(true);
											},
											className: "block aspect-[4/3] overflow-hidden cursor-pointer",
											children: /* @__PURE__ */ jsx("img", {
												src: getFullUrl(item.media.thumbnail_url || item.media.url),
												alt: item.alt_text || item.caption || post.title,
												className: "w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-350",
												loading: "lazy"
											})
										}), item.caption && /* @__PURE__ */ jsx("div", {
											className: "p-2.5 text-center text-xs text-slate-500 dark:text-gray-400 bg-white/90 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800/50 line-clamp-2",
											children: item.caption
										})]
									}, item.id);
								})
							})]
						}),
						post.tags && post.tags.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/80",
							children: [/* @__PURE__ */ jsx(Tag, { className: "w-3.5 h-3.5 text-slate-400 dark:text-gray-500 shrink-0" }), post.tags.map((tag) => /* @__PURE__ */ jsxs(Link, {
								to: `/?tag=${tag.slug}`,
								className: "px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-gray-400 hover:bg-accentBlue/10 hover:text-accentBlue border border-slate-200 dark:border-slate-800/80 hover:border-accentBlue/20 rounded-full transition-all",
								children: ["#", tag.name]
							}, tag.id))]
						}),
						post.author && /* @__PURE__ */ jsxs("div", {
							onClick: () => navigate(`/authors/${post.author?.nickname}`),
							className: "mt-8 p-6 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-start gap-4 cursor-pointer hover:scale-[1.01] transition-all",
							children: [post.author.avatar_url ? /* @__PURE__ */ jsx("img", {
								src: getFullUrl(post.author.avatar_url),
								alt: post.author.name,
								className: "w-14 h-14 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
							}) : /* @__PURE__ */ jsx("div", {
								className: "w-14 h-14 rounded-full bg-gradient-to-tr from-accentBlue to-accentPurple flex items-center justify-center text-white text-2xl font-extrabold shrink-0",
								children: post.author.name ? post.author.name.charAt(0).toUpperCase() : "A"
							}), /* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 flex-1",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2",
									children: [/* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-accentBlue" }), post.author.name]
								}), /* @__PURE__ */ jsx("p", {
									className: "text-xs text-slate-500 dark:text-gray-500 leading-relaxed",
									children: post.author.bio || "Tác giả tại DevOps.vn — Chia sẻ kiến thức Cloud Native, Kubernetes và văn hóa DevOps."
								})]
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-8",
							children: /* @__PURE__ */ jsxs("button", {
								onClick: () => navigate(-1),
								className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-accentBlue dark:text-gray-500 dark:hover:text-accentBlue transition-colors group",
								children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4 group-hover:-translate-x-1 transition-transform" }), t("back")]
							})
						}),
						relatedPosts.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 space-y-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsxs("h3", {
									className: "text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2",
									children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-accentBlue" }), language === "vi" ? "Bài viết tương tự" : "Related Articles"]
								}), /* @__PURE__ */ jsx(Link, {
									to: "/",
									className: "text-xs font-semibold text-accentBlue hover:underline",
									children: t("all_posts")
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-1 md:grid-cols-3 gap-5",
								children: relatedPosts.map((relPost) => /* @__PURE__ */ jsx(PostCard, {
									post: relPost,
									language,
									t,
									formatRelative: (dateStr) => dateStr,
									estimateReadTime: () => 5,
									toggleFilter: () => {}
								}, relPost.id))
							})]
						}),
						/* @__PURE__ */ jsx(CommentSection, { postId: post.id })
					]
				}), /* @__PURE__ */ jsx("aside", {
					className: "hidden lg:block w-64 xl:w-72 shrink-0 sticky top-[76px] self-start",
					children: /* @__PURE__ */ jsxs("div", {
						className: "space-y-5",
						children: [
							toc.length > 0 && /* @__PURE__ */ jsxs("div", {
								className: "bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm",
								children: [/* @__PURE__ */ jsxs("h3", {
									className: "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-500 mb-4 flex items-center gap-2",
									children: [/* @__PURE__ */ jsx(List, { className: "w-3.5 h-3.5" }), t("table_of_contents")]
								}), /* @__PURE__ */ jsx("nav", {
									className: "space-y-0.5",
									"aria-label": "Table of contents",
									children: toc.map((item) => /* @__PURE__ */ jsxs("a", {
										href: `#${item.id}`,
										onClick: (e) => handleTocClick(e, item.id),
										className: `flex items-center gap-1.5 text-[12.5px] leading-snug py-1.5 rounded-lg px-2.5 transition-all duration-200 group ${item.level === 3 ? "pl-6 text-[11.5px]" : ""} ${activeId === item.id ? "text-accentBlue font-semibold bg-accentBlue/8 dark:bg-accentBlue/12" : "text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"}`,
										children: [activeId === item.id && /* @__PURE__ */ jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-accentBlue shrink-0" }), /* @__PURE__ */ jsx("span", {
											className: "line-clamp-2",
											children: item.text
										})]
									}, item.id))
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-gray-500",
									children: language === "vi" ? "Chia sẻ bài viết" : "Share Article"
								}), /* @__PURE__ */ jsx("div", {
									className: "flex flex-wrap gap-2",
									children: /* @__PURE__ */ jsxs("button", {
										onClick: () => navigator.clipboard.writeText(window.location.href),
										className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-900/40 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800/80 transition-all",
										children: [/* @__PURE__ */ jsx(Copy, { className: "w-3 h-3" }), language === "vi" ? "Sao chép link" : "Copy Link"]
									})
								})]
							}),
							/* @__PURE__ */ jsxs(Link, {
								to: "/",
								className: "flex items-center justify-center gap-2 px-4 py-3 w-full bg-slate-100 dark:bg-slate-900/40 hover:bg-slate-200 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-sm font-semibold text-slate-600 dark:text-gray-400 transition-all group",
								children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4 group-hover:-translate-x-1 transition-transform" }), language === "vi" ? "Xem tất cả bài viết" : "View all articles"]
							})
						]
					})
				})]
			})]
		}),
		lightboxOpen && Lightbox && /* @__PURE__ */ jsx(Lightbox, {
			open: lightboxOpen,
			close: () => setLightboxOpen(false),
			index: lightboxIndex,
			slides: lightboxSlides,
			plugins: [ZoomPlugin, VideoPlugin].filter(Boolean)
		}),
		post && (post.excerpt || post.excerpt_en) && /* @__PURE__ */ jsx(Modal, {
			title: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1.5 font-black text-slate-800 dark:text-white",
				children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-accentBlue" }), /* @__PURE__ */ jsx("span", { children: language === "vi" ? "Tóm tắt bài viết bằng AI ✨" : "AI Article Summary ✨" })]
			}),
			open: showSummaryModal,
			onCancel: () => setShowSummaryModal(false),
			footer: [/* @__PURE__ */ jsx(Button, {
				type: "primary",
				onClick: () => setShowSummaryModal(false),
				className: "bg-accentBlue border-0 rounded-lg",
				children: language === "vi" ? "Đóng" : "Close"
			}, "close")],
			width: 550,
			children: /* @__PURE__ */ jsx("div", {
				className: "py-4 text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-medium",
				children: language === "en" ? post.excerpt_en || post.excerpt : post.excerpt || post.excerpt_en
			})
		})
	] });
};
var HydrateFallback$14 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-5xl mx-auto px-4 py-10",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "space-y-4 mb-8",
			children: [
				/* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: false,
					title: { width: "30%" }
				}),
				/* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: {
						rows: 2,
						width: ["100%", "65%"]
					},
					title: false
				}),
				/* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: false,
					title: { width: "45%" }
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: { rows: 5 }
				}),
				/* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: { rows: 4 }
				}),
				/* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: {
						rows: 3,
						width: [
							"100%",
							"80%",
							"60%"
						]
					}
				})
			]
		})]
	});
});
var BlogPostDetail_default = UNSAFE_withComponentProps(BlogPostDetail);
//#endregion
//#region src/pages/FeedbackNew.tsx
var FeedbackNew_exports = /* @__PURE__ */ __exportAll({
	FeedbackNew: () => FeedbackNew,
	default: () => FeedbackNew_default,
	loader: () => loader$7
});
async function loader$7() {
	return null;
}
var FeedbackNew = () => {
	const { t } = useLanguage();
	const { showSuccess, showError } = useToast();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [subject, setSubject] = useState("");
	const [content, setContent] = useState("");
	const rating = 5;
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
//#region src/pages/AuthorsList.tsx
var AuthorsList_exports = /* @__PURE__ */ __exportAll({
	AuthorsList: () => AuthorsList,
	HydrateFallback: () => HydrateFallback$13,
	default: () => AuthorsList_default,
	loader: () => loader$6
});
async function loader$6() {
	try {
		return (await publicService.getAuthors()).data || [];
	} catch (err) {
		return [];
	}
}
var AuthorsList = () => {
	const { t } = useLanguage();
	const authors = useLoaderData();
	const loading = useNavigation().state === "loading";
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-6xl mx-auto px-4 py-12 space-y-8",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
			className: "text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white",
			children: t("meet_the_authors")
		}), /* @__PURE__ */ jsx("p", {
			className: "text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl",
			children: t("authors_desc")
		})] }), loading ? /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
			children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-4 mb-4",
					children: [/* @__PURE__ */ jsx(Skeleton.Avatar, {
						active: true,
						size: 64,
						shape: "circle"
					}), /* @__PURE__ */ jsx("div", {
						className: "flex-1",
						children: /* @__PURE__ */ jsx(Skeleton, {
							active: true,
							paragraph: {
								rows: 1,
								width: "60%"
							},
							title: { width: "80%" }
						})
					})]
				}), /* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: { rows: 2 },
					title: false
				})]
			}, i))
		}) : authors.length === 0 ? /* @__PURE__ */ jsxs("div", {
			className: "py-16 text-center glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl bg-white/40 dark:bg-slate-900/30",
			children: [/* @__PURE__ */ jsx(Info, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-500 dark:text-gray-400",
				children: t("no_authors")
			})]
		}) : /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
			children: authors.map((author) => /* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-white/40 dark:bg-slate-900/30 group",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "w-16 h-16 rounded-full border-2 border-accentBlue/20 overflow-hidden flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-950/40",
							children: author.avatar_url ? /* @__PURE__ */ jsx("img", {
								src: getFullUrl(author.avatar_url),
								alt: author.name,
								className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
							}) : /* @__PURE__ */ jsx("span", {
								className: "font-bold text-accentBlue text-xl",
								children: author.name.charAt(0).toUpperCase()
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-lg text-slate-850 dark:text-white truncate",
								children: author.name
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate",
								children: [/* @__PURE__ */ jsx(Mail, { className: "w-3.5 h-3.5 mr-1 shrink-0" }), /* @__PURE__ */ jsx("span", {
									className: "truncate",
									children: author.email
								})]
							})]
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-sm text-gray-500 dark:text-gray-400 line-clamp-3 min-h-[60px]",
						children: author.bio || t("no_bio")
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "pt-6 border-t border-slate-100 dark:border-slate-800/40 mt-6 flex justify-end",
					children: /* @__PURE__ */ jsxs(Link, {
						to: `/authors/${author.nickname}`,
						className: "inline-flex items-center gap-1.5 text-xs font-semibold text-accentBlue hover:text-accentBlue/80 transition-colors group/btn",
						children: [/* @__PURE__ */ jsx("span", { children: t("view_articles") }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" })]
					})
				})]
			}, author.id))
		})]
	});
};
var HydrateFallback$13 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-6xl mx-auto px-4 py-12 space-y-8",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Skeleton, {
			active: true,
			paragraph: false,
			title: { width: "30%" }
		}), /* @__PURE__ */ jsx(Skeleton, {
			active: true,
			paragraph: {
				rows: 2,
				width: ["100%", "65%"]
			},
			title: false
		})] }), /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
			children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-4 mb-4",
					children: [/* @__PURE__ */ jsx(Skeleton.Avatar, {
						active: true,
						size: 64,
						shape: "circle"
					}), /* @__PURE__ */ jsx("div", {
						className: "flex-1",
						children: /* @__PURE__ */ jsx(Skeleton, {
							active: true,
							paragraph: {
								rows: 1,
								width: "60%"
							},
							title: { width: "80%" }
						})
					})]
				}), /* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: { rows: 2 },
					title: false
				})]
			}, i))
		})]
	});
});
var AuthorsList_default = UNSAFE_withComponentProps(AuthorsList);
//#endregion
//#region src/pages/AuthorDetail.tsx
var AuthorDetail_exports = /* @__PURE__ */ __exportAll({
	AuthorDetail: () => AuthorDetail,
	HydrateFallback: () => HydrateFallback$12,
	default: () => AuthorDetail_default,
	loader: () => loader$5
});
async function loader$5({ request, params }) {
	const nickname = params.nickname;
	if (!nickname) return {
		author: null,
		posts: [],
		totalPosts: 0
	};
	const searchParams = new URL(request.url).searchParams;
	const page = parseInt(searchParams.get("page") || "1");
	const limit = 6;
	const offset = (page - 1) * limit;
	try {
		const [authorRes, postsRes] = await Promise.all([publicService.getAuthorByNickname(nickname), publicService.getPosts({
			nickname,
			offset,
			limit
		})]);
		return {
			author: authorRes.data,
			posts: postsRes.data?.items || [],
			totalPosts: postsRes.data?.total || 0
		};
	} catch (err) {
		return {
			author: null,
			posts: [],
			totalPosts: 0
		};
	}
}
var AuthorDetail = () => {
	const { t, language } = useLanguage();
	const { author, posts, totalPosts } = useLoaderData();
	const loading = useNavigation().state === "loading";
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get("page") || "1");
	const totalPages = Math.ceil(totalPosts / 6);
	const setPage = (p) => {
		const next = new URLSearchParams(searchParams);
		next.set("page", String(p));
		setSearchParams(next);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		return new Date(dateStr).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		});
	};
	if (!author) return /* @__PURE__ */ jsx("div", {
		className: "py-12 text-center text-gray-500 max-w-6xl mx-auto px-4",
		children: /* @__PURE__ */ jsx("p", { children: t("no_authors") })
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-6xl mx-auto px-4 py-8 space-y-8 select-none",
		children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Link, {
			to: "/authors",
			className: "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-slate-800 dark:hover:text-white transition-colors",
			children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: t("back_to_authors") })]
		}) }), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start select-text",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 space-y-6 bg-white/40 dark:bg-slate-900/30 lg:sticky lg:top-[90px]",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center text-center space-y-4",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-28 h-28 rounded-full border-4 border-accentBlue/20 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-950/40 shadow-xl",
								children: author.avatar_url ? /* @__PURE__ */ jsx("img", {
									src: getFullUrl(author.avatar_url),
									alt: author.name,
									className: "w-full h-full object-cover"
								}) : /* @__PURE__ */ jsx("span", {
									className: "font-bold text-accentBlue text-4xl",
									children: author.name.charAt(0).toUpperCase()
								})
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
								className: "text-2xl font-bold text-slate-850 dark:text-white",
								children: author.name
							}), /* @__PURE__ */ jsxs("div", {
								className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50 text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider uppercase mt-2 select-none",
								children: [/* @__PURE__ */ jsx(User, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: language === "vi" ? "Tác giả / Thành viên" : "Author / Contributor" })]
							})] }),
							/* @__PURE__ */ jsxs("a", {
								href: `mailto:${author.email}`,
								className: "flex items-center space-x-2 text-xs text-accentBlue hover:underline py-1.5 px-4 bg-accentBlue/5 rounded-xl transition-all",
								children: [/* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: author.email })]
							})
						]
					}),
					/* @__PURE__ */ jsx("hr", { className: "border-slate-100 dark:border-slate-800/40" }),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider select-none",
							children: t("biography")
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-slate-700 dark:text-gray-300 leading-relaxed",
							children: author.bio || t("no_bio")
						})]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "lg:col-span-2 space-y-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/40",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ jsx(BookOpen, { className: "w-5 h-5 text-accentPurple" }), /* @__PURE__ */ jsxs("h3", {
								className: "text-sm md:text-base font-bold text-slate-850 dark:text-white",
								children: [
									t("articles_written_by"),
									" ",
									author.name.split(" ")[0]
								]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-3 select-none",
							children: /* @__PURE__ */ jsxs("span", {
								className: "text-xs bg-slate-100 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-lg font-semibold",
								children: [
									totalPosts,
									" ",
									t("posts")
								]
							})
						})]
					}),
					loading ? /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-6",
						children: [...Array(4)].map((_, i) => /* @__PURE__ */ jsxs("div", {
							className: "p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl",
							children: [/* @__PURE__ */ jsx("div", {
								className: "aspect-[16/10] rounded-xl overflow-hidden mb-4",
								children: /* @__PURE__ */ jsx(Skeleton.Image, {
									active: true,
									style: {
										width: "100%",
										height: "100%"
									},
									className: "!w-full !h-full"
								})
							}), /* @__PURE__ */ jsx(Skeleton, {
								active: true,
								paragraph: { rows: 2 },
								title: true
							})]
						}, i))
					}) : /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 md:grid-cols-2 gap-6",
						children: posts.map((post) => {
							const coverUrl = post.cover_media?.url;
							return /* @__PURE__ */ jsx("article", {
								className: "group flex flex-col justify-between p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-accentBlue/30 dark:hover:border-accentBlue/20 hover:shadow-lg transition-all duration-200 bg-white/40 dark:bg-slate-900/30",
								children: /* @__PURE__ */ jsxs("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ jsx(Link, {
										to: `/posts/${post.slug}`,
										className: "block aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/60",
										children: /* @__PURE__ */ jsx("img", {
											src: getFullUrl(coverUrl || ""),
											alt: post.title,
											className: "w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500",
											loading: "lazy"
										})
									}), /* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex flex-wrap items-center gap-3 text-[10px] text-gray-500",
												children: [/* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1",
													children: [/* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }), formatDate(post.published_at || post.created_at)]
												}), post.view_count !== void 0 && /* @__PURE__ */ jsxs("span", {
													className: "flex items-center gap-1",
													children: [
														/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }),
														post.view_count,
														" ",
														t("views")
													]
												})]
											}),
											/* @__PURE__ */ jsx("h4", {
												className: "text-base font-extrabold text-slate-850 dark:text-white line-clamp-2 group-hover:text-accentBlue transition-colors leading-snug",
												children: /* @__PURE__ */ jsx(Link, {
													to: `/posts/${post.slug}`,
													children: language === "en" ? post.title_en || post.title : post.title
												})
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed",
												children: language === "en" ? post.excerpt_en || post.excerpt || "Read full article..." : post.excerpt || "Đọc toàn bộ bài viết..."
											})
										]
									})]
								})
							}, post.id);
						})
					}),
					totalPages > 1 && /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/40 select-none",
						children: [
							/* @__PURE__ */ jsxs("button", {
								onClick: () => setPage(Math.max(page - 1, 1)),
								disabled: page === 1,
								className: "inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-750 dark:text-gray-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
								children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: t("prev") })]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xs text-gray-500 dark:text-gray-400",
								children: [
									"Page ",
									page,
									" of ",
									totalPages
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: () => setPage(Math.min(page + 1, totalPages)),
								disabled: page === totalPages,
								className: "inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-750 dark:text-gray-300 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
								children: [/* @__PURE__ */ jsx("span", { children: t("next") }), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })]
							})
						]
					})
				]
			})]
		})]
	});
};
var HydrateFallback$12 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsx("div", {
		className: "max-w-6xl mx-auto px-4 py-8 space-y-8 select-none",
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-8 items-start",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 space-y-6 bg-white/40 dark:bg-slate-900/30",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col items-center text-center space-y-4",
					children: [/* @__PURE__ */ jsx(Skeleton.Avatar, {
						active: true,
						size: 112,
						shape: "circle"
					}), /* @__PURE__ */ jsx(Skeleton, {
						active: true,
						paragraph: {
							rows: 2,
							width: ["70%", "50%"]
						},
						title: { width: "60%" }
					})]
				}), /* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: { rows: 4 }
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "lg:col-span-2 space-y-4",
				children: [/* @__PURE__ */ jsx(Skeleton, {
					active: true,
					paragraph: false,
					title: { width: "40%" }
				}), /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-6",
					children: [...Array(4)].map((_, i) => /* @__PURE__ */ jsxs("div", {
						className: "p-5 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl",
						children: [/* @__PURE__ */ jsx("div", {
							className: "aspect-[16/10] rounded-xl overflow-hidden mb-4",
							children: /* @__PURE__ */ jsx(Skeleton.Image, {
								active: true,
								style: {
									width: "100%",
									height: "100%"
								},
								className: "!w-full !h-full"
							})
						}), /* @__PURE__ */ jsx(Skeleton, {
							active: true,
							paragraph: { rows: 2 },
							title: true
						})]
					}, i))
				})]
			})]
		})
	});
});
var AuthorDetail_default = UNSAFE_withComponentProps(AuthorDetail);
//#endregion
//#region src/pages/ForgotPassword.tsx
var ForgotPassword_exports = /* @__PURE__ */ __exportAll({
	ForgotPassword: () => ForgotPassword,
	default: () => ForgotPassword_default,
	loader: () => loader$4
});
async function loader$4() {
	return null;
}
var schema$1 = z.object({ email: z.string().min(1, "Email is required").email("Invalid email address") });
var ForgotPassword = () => {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const { showSuccess, showError } = useToast();
	const { register, handleSubmit, formState: { errors } } = useForm({
		resolver: zodResolver(schema$1),
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
//#region src/pages/ResetPassword.tsx
var ResetPassword_exports = /* @__PURE__ */ __exportAll({
	ResetPassword: () => ResetPassword,
	default: () => ResetPassword_default,
	loader: () => loader$3
});
async function loader$3() {
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
//#region src/pages/Login.tsx
var Login_exports = /* @__PURE__ */ __exportAll({
	Login: () => Login,
	default: () => Login_default,
	loader: () => loader$2
});
async function loader$2() {
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
//#region src/components/ProtectedRoute.tsx
var ProtectedRoute_exports = /* @__PURE__ */ __exportAll({
	ProtectedRoute: () => ProtectedRoute,
	default: () => ProtectedRoute_default,
	loader: () => loader$1
});
async function loader$1() {
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
//#region src/layouts/AdminLayout.tsx
var AdminLayout_exports = /* @__PURE__ */ __exportAll({
	AdminLayout: () => AdminLayout,
	default: () => AdminLayout_default
});
var AdminLayout = () => {
	const location = useLocation();
	const auth = useAuth();
	const { theme, toggleTheme } = useTheme();
	const { language, setLanguage, t } = useLanguage();
	const isAdmin = auth.user?.role === "admin";
	const menuItems = [
		{
			name: t("dashboard"),
			path: "/admin",
			icon: LayoutDashboard
		},
		{
			name: t("posts"),
			path: "/admin/posts",
			icon: FileText
		},
		{
			name: t("media_library"),
			path: "/admin/media",
			icon: Image
		},
		{
			name: t("categories"),
			path: "/admin/categories",
			icon: Folder
		},
		{
			name: t("tags"),
			path: "/admin/tags",
			icon: Tag
		},
		{
			name: t("comments"),
			path: "/admin/comments",
			icon: MessageSquare
		},
		{
			name: t("feedbacks"),
			path: "/admin/feedbacks",
			icon: Heart
		},
		{
			name: t("translate_jobs"),
			path: "/admin/translate-jobs",
			icon: Languages
		},
		{
			name: t("settings"),
			path: "/admin/settings",
			icon: Settings
		},
		...isAdmin ? [{
			name: t("users"),
			path: "/admin/users",
			icon: Users
		}, {
			name: t("audit_logs"),
			path: "/admin/audit-logs",
			icon: ActivitySquare
		}] : []
	];
	/** Returns the display initial(s) for the avatar fallback */
	const getInitial = () => {
		const name = auth.user?.name;
		if (!name) return "A";
		return name.charAt(0).toUpperCase();
	};
	const getPageTitle = () => {
		const segment = location.pathname.replace("/admin/", "").split("/")[0];
		if (location.pathname === "/admin") return t("dashboard");
		if (segment === "posts") return t("posts");
		if (segment === "media") return t("media_library");
		if (segment === "categories") return t("categories");
		if (segment === "tags") return t("tags");
		if (segment === "comments") return t("comments");
		if (segment === "feedbacks") return t("feedbacks");
		if (segment === "settings") return t("settings");
		if (segment === "users") return t("users");
		if (segment === "audit-logs") return t("audit_logs");
		if (segment === "translate-jobs") return t("translate_jobs");
		return segment;
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen flex bg-slate-50 dark:bg-black text-slate-800 dark:text-gray-150 transition-colors duration-200 font-sans",
		children: [/* @__PURE__ */ jsxs("aside", {
			className: "w-64 glass-panel border-r border-slate-200 dark:border-slate-800/50 flex flex-col z-20",
			children: [/* @__PURE__ */ jsx("div", {
				className: "h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/50",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-2",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-8 h-8 rounded-lg bg-gradient-to-tr from-accentBlue to-accentPurple flex items-center justify-center shadow-lg shadow-accentBlue/20",
						children: /* @__PURE__ */ jsx("span", {
							className: "font-bold text-white text-base",
							children: "B"
						})
					}), /* @__PURE__ */ jsx("span", {
						className: "font-bold text-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-gray-250 dark:to-gray-400 bg-clip-text text-transparent",
						children: "CMS Admin"
					})]
				})
			}), /* @__PURE__ */ jsx("nav", {
				className: "flex-1 px-4 py-6 space-y-1.5",
				children: menuItems.map((item) => {
					const Icon = item.icon;
					const isActive = item.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.path);
					return /* @__PURE__ */ jsxs(Link, {
						to: item.path,
						className: `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-gradient-to-r from-accentBlue/20 to-accentPurple/10 border-l-4 border-accentBlue text-accentBlue" : "text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-slate-200/40 dark:hover:bg-slate-800/40"}`,
						children: [/* @__PURE__ */ jsx(Icon, { className: `w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-accentBlue" : "text-slate-400 dark:text-gray-450 group-hover:text-slate-650 dark:group-hover:text-gray-200"}` }), /* @__PURE__ */ jsx("span", {
							className: "font-medium text-sm",
							children: item.name
						})]
					}, item.name);
				})
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex-1 flex flex-col min-w-0",
			children: [/* @__PURE__ */ jsxs("header", {
				className: "h-16 glass-header border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-8 z-10",
				children: [/* @__PURE__ */ jsx("h1", {
					className: "text-lg font-semibold text-slate-850 dark:text-gray-100 capitalize",
					children: getPageTitle()
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-4",
					children: [
						/* @__PURE__ */ jsx("button", {
							onClick: () => setLanguage(language === "vi" ? "en" : "vi"),
							className: "px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-gray-300 transition-all select-none",
							title: language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt",
							children: language === "vi" ? "EN" : "VI"
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: toggleTheme,
							className: "p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-900/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-200",
							title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
							children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4" })
						}),
						/* @__PURE__ */ jsx("div", { className: "hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700/60" }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center space-x-2.5",
							children: [/* @__PURE__ */ jsx("div", {
								className: "w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/50 overflow-hidden flex items-center justify-center font-bold text-accentBlue shrink-0",
								children: auth.user?.avatar_url ? /* @__PURE__ */ jsx("img", {
									src: getFullUrl(auth.user.avatar_url),
									alt: auth.user.name ?? "User avatar",
									className: "w-full h-full object-cover"
								}) : getInitial()
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-left hidden sm:block",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-xs font-semibold text-slate-700 dark:text-gray-250 leading-tight",
									children: auth.user?.name ?? "Admin User"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-[10px] text-slate-400 dark:text-gray-500 capitalize",
									children: auth.user?.role ?? "System Administrator"
								})]
							})]
						}),
						/* @__PURE__ */ jsx("div", { className: "hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700/60" }),
						/* @__PURE__ */ jsxs("button", {
							onClick: auth.logout,
							title: t("sign_out"),
							className: "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-dangerRed hover:bg-dangerRed/10 border border-slate-200 dark:border-transparent dark:hover:border-dangerRed/20 transition-all duration-200",
							children: [/* @__PURE__ */ jsx(LogOut, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", {
								className: "hidden sm:inline",
								children: t("sign_out")
							})]
						})
					]
				})]
			}), /* @__PURE__ */ jsx("main", {
				className: "flex-1 overflow-auto p-8",
				children: /* @__PURE__ */ jsx("div", {
					className: "max-w-7xl mx-auto",
					children: /* @__PURE__ */ jsx(Outlet, {})
				})
			})]
		})]
	});
};
var AdminLayout_default = UNSAFE_withComponentProps(AdminLayout);
//#endregion
//#region src/pages/Dashboard.tsx
var Dashboard_exports = /* @__PURE__ */ __exportAll({
	Dashboard: () => Dashboard,
	HydrateFallback: () => HydrateFallback$11,
	clientLoader: () => clientLoader$11,
	default: () => Dashboard_default
});
async function clientLoader$11() {
	try {
		const res = await dashboardService.getStats();
		if (res.success && res.data) return res.data;
	} catch (err) {
		console.error("Failed to load dashboard stats", err);
	}
	return {
		total_posts: 0,
		published_posts: 0,
		draft_posts: 0,
		media_count: 0,
		category_count: 0,
		tag_count: 0,
		storage_usage_mb: 0,
		posts_by_month: [],
		views_by_day: [],
		recent_posts: []
	};
}
var Dashboard = () => {
	const data = useLoaderData();
	const loading = useNavigation().state === "loading";
	const stats = {
		totalPosts: data.total_posts || 0,
		publishedPosts: data.published_posts || 0,
		draftPosts: data.draft_posts || 0,
		mediaCount: data.media_count || 0,
		categoryCount: data.category_count || 0,
		tagCount: data.tag_count || 0,
		storageUsageMB: data.storage_usage_mb || 0,
		postsByMonth: data.posts_by_month || [],
		viewsByDay: data.views_by_day || [],
		recentPosts: data.recent_posts || []
	};
	const statCards = [
		{
			title: "Total Posts",
			value: stats.totalPosts,
			icon: FileText,
			color: "from-accentBlue/20 to-accentBlue/5",
			border: "hover:border-accentBlue/50 hover:shadow-accentBlue/5",
			iconColor: "text-accentBlue"
		},
		{
			title: "Published Posts",
			value: stats.publishedPosts,
			icon: CheckCircle,
			color: "from-successGreen/20 to-successGreen/5",
			border: "hover:border-successGreen/50 hover:shadow-successGreen/5",
			iconColor: "text-successGreen"
		},
		{
			title: "Draft Posts",
			value: stats.draftPosts,
			icon: Clock,
			color: "from-warningYellow/20 to-warningYellow/5",
			border: "hover:border-warningYellow/50 hover:shadow-warningYellow/5",
			iconColor: "text-warningYellow"
		},
		{
			title: "Categories",
			value: stats.categoryCount,
			icon: Folder,
			color: "from-amber-500/20 to-amber-500/5",
			border: "hover:border-amber-500/50 hover:shadow-amber-500/5",
			iconColor: "text-amber-500"
		},
		{
			title: "Tags",
			value: stats.tagCount,
			icon: Tag,
			color: "from-rose-500/20 to-rose-500/5",
			border: "hover:border-rose-500/50 hover:shadow-rose-500/5",
			iconColor: "text-rose-500"
		},
		{
			title: "Media Files",
			value: stats.mediaCount,
			icon: Image,
			color: "from-accentPurple/20 to-accentPurple/5",
			border: "hover:border-accentPurple/50 hover:shadow-accentPurple/5",
			iconColor: "text-accentPurple"
		},
		{
			title: "Storage Usage",
			value: `${stats.storageUsageMB.toFixed(2)} MB`,
			icon: HardDrive,
			color: "from-cyan-500/20 to-cyan-500/5",
			border: "hover:border-cyan-500/50 hover:shadow-cyan-500/5",
			iconColor: "text-cyan-500"
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent",
				children: "Dashboard"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-500 mt-1",
				children: "Real-time statistics, monthly analytics, and site status overview."
			})] }),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
				children: statCards.map((card) => {
					const Icon = card.icon;
					return /* @__PURE__ */ jsxs("div", {
						className: `glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card.border}`,
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs font-semibold text-gray-500 uppercase tracking-wider",
							children: card.title
						}), loading ? /* @__PURE__ */ jsx(Skeleton, {
							active: true,
							paragraph: false,
							title: { width: "4rem" },
							className: "mt-2"
						}) : /* @__PURE__ */ jsx("h3", {
							className: "text-2xl font-bold mt-1 text-slate-850 dark:text-gray-100",
							children: card.value
						})] }), /* @__PURE__ */ jsx("div", {
							className: `w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center shrink-0 shadow-sm`,
							children: /* @__PURE__ */ jsx(Icon, { className: `w-5 h-5 ${card.iconColor}` })
						})]
					}, card.title);
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 bg-slate-900/30",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "text-lg font-bold text-slate-800 dark:text-gray-200",
						children: "Daily Page Views"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-500 mt-0.5",
						children: "Tracking website traffic and readership logs over the last 30 days."
					})] }), /* @__PURE__ */ jsx("div", {
						className: "h-[280px] w-full pt-4",
						children: loading ? /* @__PURE__ */ jsx("div", {
							className: "w-full h-full flex items-center justify-center",
							children: /* @__PURE__ */ jsx(Skeleton, {
								active: true,
								paragraph: { rows: 6 },
								title: false
							})
						}) : /* @__PURE__ */ jsx(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ jsxs(AreaChart, {
								data: stats.viewsByDay,
								margin: {
									top: 10,
									right: 10,
									left: -20,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ jsx(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "#1e293b",
										opacity: .4
									}),
									/* @__PURE__ */ jsx(XAxis, {
										dataKey: "date",
										stroke: "#64748b",
										fontSize: 9,
										tickLine: false,
										tickFormatter: (tick) => {
											if (!tick || tick.length < 10) return tick;
											return tick.substring(5);
										}
									}),
									/* @__PURE__ */ jsx(YAxis, {
										stroke: "#64748b",
										fontSize: 10,
										tickLine: false,
										axisLine: false
									}),
									/* @__PURE__ */ jsx(Tooltip$1, { contentStyle: {
										backgroundColor: "#0f172a",
										borderColor: "#1e293b",
										borderRadius: "12px",
										color: "#f8fafc",
										fontSize: "12px"
									} }),
									/* @__PURE__ */ jsx(Area, {
										type: "monotone",
										dataKey: "count",
										stroke: "#3b82f6",
										strokeWidth: 2,
										fill: "url(#viewsGlow)"
									}),
									/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
										id: "viewsGlow",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ jsx("stop", {
											offset: "5%",
											stopColor: "#3b82f6",
											stopOpacity: .4
										}), /* @__PURE__ */ jsx("stop", {
											offset: "95%",
											stopColor: "#3b82f6",
											stopOpacity: 0
										})]
									}) })
								]
							})
						})
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800/50 flex flex-col justify-between bg-slate-900/30",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "text-lg font-bold text-slate-800 dark:text-gray-200",
							children: "Quick Actions"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 mt-0.5",
							children: "Shortcuts to common operations."
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-4 py-6",
							children: [/* @__PURE__ */ jsxs(Link, {
								to: "/admin/posts/new",
								className: "flex items-center justify-center space-x-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white font-medium py-3 px-5 rounded-xl transition-all shadow-md shadow-accentBlue/10 text-sm",
								children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Create New Post" })]
							}), /* @__PURE__ */ jsxs(Link, {
								to: "/admin/media",
								className: "flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 text-slate-750 dark:text-gray-100 font-medium py-3 px-5 rounded-xl transition-all text-sm",
								children: [/* @__PURE__ */ jsx(Upload, { className: "w-4 h-4 text-accentPurple" }), /* @__PURE__ */ jsx("span", { children: "Upload Media Files" })]
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "border-t border-slate-200 dark:border-slate-800/80 pt-4 text-[10px] text-gray-500",
							children: "Current system version: 1.0.5 • Operational"
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 bg-slate-900/30",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between mb-6",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "text-lg font-bold text-slate-800 dark:text-gray-200",
						children: "Recent Posts"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-500 mt-0.5",
						children: "Quick lookup of the latest created articles."
					})] }), /* @__PURE__ */ jsx(Link, {
						to: "/admin/posts",
						className: "text-xs font-semibold text-accentBlue hover:text-accentBlue/80 transition-colors",
						children: "View All Posts"
					})]
				}), loading ? /* @__PURE__ */ jsx("div", {
					className: "space-y-3",
					children: [
						1,
						2,
						3
					].map((i) => /* @__PURE__ */ jsx("div", {
						className: "p-4 bg-slate-950/40 border border-slate-800/40 rounded-xl",
						children: /* @__PURE__ */ jsx(Skeleton, {
							active: true,
							avatar: {
								size: 40,
								shape: "square"
							},
							paragraph: {
								rows: 1,
								width: "60%"
							},
							title: { width: "80%" }
						})
					}, i))
				}) : stats.recentPosts.length === 0 ? /* @__PURE__ */ jsx("div", {
					className: "py-8 text-center text-gray-500 text-sm",
					children: "No posts created yet."
				}) : /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4",
					children: stats.recentPosts.map((post) => /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-slate-950/40 border border-slate-800/40 hover:border-slate-800 rounded-xl transition-all gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center space-x-4 min-w-0",
							children: [post.cover_media ? /* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-900 flex items-center justify-center",
								children: /* @__PURE__ */ jsx("img", {
									src: getFullUrl(post.cover_media.thumbnail_url || post.cover_media.url),
									alt: "",
									className: "object-cover w-full h-full"
								})
							}) : /* @__PURE__ */ jsx("div", {
								className: "w-12 h-12 rounded-lg border border-slate-800 bg-slate-900/50 shrink-0 flex items-center justify-center",
								children: /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-gray-600" })
							}), /* @__PURE__ */ jsxs("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ jsx("h4", {
									className: "font-semibold text-slate-800 dark:text-gray-200 truncate max-w-sm text-sm",
									children: post.title
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center space-x-3 mt-1.5 text-xs text-gray-500",
									children: [
										/* @__PURE__ */ jsxs("span", {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" }), new Date(post.created_at).toLocaleDateString()]
										}),
										/* @__PURE__ */ jsx("span", { children: "•" }),
										/* @__PURE__ */ jsxs("span", {
											className: "flex items-center gap-1",
											children: [
												/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }),
												post.view_count || 0,
												" views"
											]
										})
									]
								})]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between lg:justify-end gap-4",
							children: [post.status === "published" ? /* @__PURE__ */ jsx("span", {
								className: "inline-flex items-center bg-successGreen/10 border border-successGreen/20 text-successGreen text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
								children: "Published"
							}) : /* @__PURE__ */ jsx("span", {
								className: "inline-flex items-center bg-warningYellow/10 border border-warningYellow/20 text-warningYellow text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
								children: "Draft"
							}), /* @__PURE__ */ jsx(Link, {
								to: `/admin/posts/edit/${post.id}`,
								className: "p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-500 dark:text-gray-400 hover:text-accentBlue transition-colors shrink-0",
								title: "Edit post",
								children: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" })
							})]
						})]
					}, post.id))
				})]
			})
		]
	});
};
var HydrateFallback$11 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Skeleton, {
				active: true,
				paragraph: false,
				title: { width: "200px" }
			}), /* @__PURE__ */ jsx(Skeleton, {
				active: true,
				paragraph: {
					rows: 1,
					width: "300px"
				},
				title: false,
				className: "mt-1"
			})] }),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
				children: [...Array(7)].map((_, i) => /* @__PURE__ */ jsxs("div", {
					className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6",
					children: [/* @__PURE__ */ jsx(Skeleton, {
						active: true,
						paragraph: false,
						title: { width: "80%" }
					}), /* @__PURE__ */ jsx(Skeleton, {
						active: true,
						paragraph: {
							rows: 1,
							width: "40%"
						},
						title: false,
						className: "mt-2"
					})]
				}, i))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
				children: [/* @__PURE__ */ jsx("div", {
					className: "lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 h-[400px]",
					children: /* @__PURE__ */ jsx(Skeleton, {
						active: true,
						paragraph: { rows: 8 },
						title: { width: "40%" }
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 h-[400px]",
					children: /* @__PURE__ */ jsx(Skeleton, {
						active: true,
						paragraph: { rows: 6 },
						title: { width: "40%" }
					})
				})]
			})
		]
	});
});
var Dashboard_default = UNSAFE_withComponentProps(Dashboard);
//#endregion
//#region src/pages/FeedbacksAdmin.tsx
var FeedbacksAdmin_exports = /* @__PURE__ */ __exportAll({
	FeedbacksAdmin: () => FeedbacksAdmin,
	HydrateFallback: () => HydrateFallback$10,
	clientLoader: () => clientLoader$10,
	default: () => FeedbacksAdmin_default
});
async function clientLoader$10({ request }) {
	const statusFilter = new URL(request.url).searchParams.get("status") || "";
	const limit = 15;
	const offset = 0;
	try {
		const res = await feedbackService.listFeedbacks({
			status: statusFilter || void 0,
			offset,
			limit
		});
		if (res.success && res.data) return { feedbacks: res.data.items || [] };
	} catch (err) {
		console.error("Failed to fetch feedbacks", err);
	}
	return { feedbacks: [] };
}
var FeedbacksAdmin = () => {
	const { showSuccess, showError } = useToast();
	const { feedbacks } = useLoaderData();
	const { revalidate } = useRevalidator();
	const loading = useNavigation().state === "loading";
	const [searchParams, setSearchParams] = useSearchParams();
	const statusFilter = searchParams.get("status") || "";
	const handleUpdateStatus = async (id, status) => {
		try {
			if ((await feedbackService.updateFeedbackStatus(id, status)).success) {
				showSuccess(`Feedback marked as ${status}`);
				revalidate();
			}
		} catch (err) {
			showError(err.response?.data?.message || "Failed to update feedback status");
		}
	};
	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to permanently delete this feedback?")) return;
		try {
			if ((await feedbackService.deleteFeedback(id)).success) {
				showSuccess("Feedback deleted successfully");
				revalidate();
			}
		} catch (err) {
			showError(err.response?.data?.message || "Failed to delete feedback");
		}
	};
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		return new Date(dateStr).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-2xl font-bold tracking-tight text-slate-850 dark:text-white",
				children: "User Feedbacks"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-400",
				children: "View and moderate reader suggestions, reviews, and bug reports."
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center space-x-3",
				children: [/* @__PURE__ */ jsxs("select", {
					value: statusFilter,
					onChange: (e) => {
						setSearchParams((prev) => {
							const next = new URLSearchParams(prev);
							if (e.target.value) next.set("status", e.target.value);
							else next.delete("status");
							return next;
						});
					},
					className: "px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-gray-250 rounded-xl text-sm focus:outline-none",
					children: [
						/* @__PURE__ */ jsx("option", {
							value: "",
							children: "All Statuses"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "pending",
							children: "Pending"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "reviewed",
							children: "Reviewed"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "archived",
							children: "Archived"
						})
					]
				}), /* @__PURE__ */ jsx("button", {
					onClick: () => revalidate(),
					disabled: loading,
					className: "p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-850 dark:hover:text-gray-200 transition-all disabled:opacity-50",
					title: "Refresh feedbacks",
					children: /* @__PURE__ */ jsx(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` })
				})]
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-900/30",
			children: loading && feedbacks.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "py-20 text-center space-y-4",
				children: [/* @__PURE__ */ jsx(Loader, { className: "w-10 h-10 animate-spin text-accentBlue mx-auto" }), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500",
					children: "Retrieving feedbacks list..."
				})]
			}) : feedbacks.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "py-20 text-center space-y-4",
				children: [/* @__PURE__ */ jsx(MessageSquare, { className: "w-12 h-12 text-gray-600 mx-auto" }), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500",
					children: "No feedbacks found."
				})]
			}) : /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left border-collapse",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "border-b border-slate-200 dark:border-slate-800/50 text-xs font-semibold text-gray-450 uppercase bg-slate-100/50 dark:bg-slate-900/10",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6",
								children: "Sender"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6",
								children: "Rating"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6",
								children: "Message"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6",
								children: "Submitted"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6 text-center",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-4 px-6 text-right",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800/40",
						children: feedbacks.map((fb) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors",
							children: [
								/* @__PURE__ */ jsxs("td", {
									className: "py-4 px-6",
									children: [/* @__PURE__ */ jsx("div", {
										className: "font-semibold text-slate-800 dark:text-gray-150",
										children: fb.name
									}), /* @__PURE__ */ jsx("div", {
										className: "text-xs text-gray-500 truncate max-w-[200px]",
										title: fb.email,
										children: fb.email
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-4 px-6",
									children: /* @__PURE__ */ jsx("div", {
										className: "flex space-x-0.5",
										children: [
											1,
											2,
											3,
											4,
											5
										].map((star) => /* @__PURE__ */ jsx(Star, { className: `w-3.5 h-3.5 ${star <= fb.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"}` }, star))
									})
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-4 px-6 max-w-sm",
									children: [fb.subject && /* @__PURE__ */ jsx("div", {
										className: "font-semibold text-xs text-accentPurple mb-0.5 truncate",
										children: fb.subject
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-700 dark:text-gray-300 whitespace-pre-line line-clamp-3",
										children: fb.content
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-4 px-6 text-xs text-gray-500",
									children: formatDate(fb.created_at)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-4 px-6 text-center",
									children: /* @__PURE__ */ jsx("span", {
										className: `inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${fb.status === "pending" ? "bg-warningYellow/10 text-warningYellow border border-warningYellow/20" : fb.status === "reviewed" ? "bg-successGreen/10 text-successGreen border border-successGreen/20" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-gray-400"}`,
										children: fb.status
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-4 px-6 text-right",
									children: /* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-end space-x-2",
										children: [
											fb.status === "pending" && /* @__PURE__ */ jsx("button", {
												onClick: () => handleUpdateStatus(fb.id, "reviewed"),
												className: "p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-lg text-successGreen transition-colors",
												title: "Mark as reviewed",
												children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" })
											}),
											fb.status !== "archived" && /* @__PURE__ */ jsx("button", {
												onClick: () => handleUpdateStatus(fb.id, "archived"),
												className: "p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-lg text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors",
												title: "Archive feedback",
												children: /* @__PURE__ */ jsx(Archive, { className: "w-4 h-4" })
											}),
											/* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(fb.id),
												className: "p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 rounded-lg text-gray-500 hover:text-dangerRed transition-colors",
												title: "Delete feedback",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
											})
										]
									})
								})
							]
						}, fb.id))
					})]
				})
			})
		})]
	});
};
var HydrateFallback$10 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", { className: "h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" })] })
		}), /* @__PURE__ */ jsx("div", { className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" })]
	});
});
var FeedbacksAdmin_default = UNSAFE_withComponentProps(FeedbacksAdmin);
//#endregion
//#region src/components/ConfirmModal.tsx
var ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
	if (!isOpen) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up",
			children: [
				/* @__PURE__ */ jsx("h3", {
					className: "text-lg font-bold text-slate-850 dark:text-white",
					children: title
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-gray-400 leading-relaxed",
					children: message
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex justify-end gap-3 pt-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: onCancel,
						className: "px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 dark:hover:bg-slate-950 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl text-sm font-semibold transition-all duration-200",
						children: "Cancel"
					}), /* @__PURE__ */ jsx("button", {
						onClick: onConfirm,
						className: "px-4 py-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200",
						children: "Confirm"
					})]
				})
			]
		})
	});
};
//#endregion
//#region src/pages/MediaLibrary.tsx
var MediaLibrary_exports = /* @__PURE__ */ __exportAll({
	HydrateFallback: () => HydrateFallback$9,
	MediaLibrary: () => MediaLibrary,
	clientLoader: () => clientLoader$9,
	default: () => MediaLibrary_default
});
async function clientLoader$9({ request }) {
	const url = new URL(request.url);
	const typeFilter = url.searchParams.get("type") || "";
	const page = parseInt(url.searchParams.get("page") || "1");
	const limit = 12;
	try {
		const responseData = (await mediaService.list({
			type: typeFilter,
			page,
			limit
		})).data;
		if (responseData && typeof responseData === "object" && "items" in responseData) return {
			media: responseData.items || [],
			total: responseData.total || 0
		};
		else if (Array.isArray(responseData)) return {
			media: responseData,
			total: responseData.length
		};
	} catch (err) {
		console.error("Failed to load media library", err);
	}
	return {
		media: [],
		total: 0
	};
}
var MediaLibrary = () => {
	const { media: mediaList, total } = useLoaderData();
	const { revalidate, state } = useRevalidator();
	const navigation = useNavigation();
	const [searchParams, setSearchParams] = useSearchParams();
	const typeFilter = searchParams.get("type") || "";
	const page = parseInt(searchParams.get("page") || "1");
	const limit = 12;
	const loading = navigation.state === "loading";
	const [uploading, setUploading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [previewMedia, setPreviewMedia] = useState(null);
	const [deleteMedia, setDeleteMedia] = useState(null);
	const { showSuccess, showError, showWarning } = useToast();
	const fileInputRef = useRef(null);
	const [PDFViewer, setPDFViewer] = useState(null);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxSlides, setLightboxSlides] = useState([]);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [Lightbox, setLightbox] = useState(null);
	const [ZoomPlugin, setZoomPlugin] = useState(null);
	const [VideoPlugin, setVideoPlugin] = useState(null);
	useEffect(() => {
		import("./assets/PDFViewer-C3_-wGUw.js").then((mod) => {
			setPDFViewer(() => mod.PDFViewer);
		});
		Promise.all([
			import("yet-another-react-lightbox"),
			import("yet-another-react-lightbox/plugins/zoom"),
			import("yet-another-react-lightbox/plugins/video"),
			Promise.resolve({                  })
		]).then(([lightboxMod, zoomMod, videoMod]) => {
			setLightbox(() => lightboxMod.default);
			setZoomPlugin(() => zoomMod.default);
			setVideoPlugin(() => videoMod.default);
		});
	}, []);
	const handleFileUpload = async (e) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		setUploading(true);
		let successCount = 0;
		let failCount = 0;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const isImage = file.type.startsWith("image/");
			const isVideo = file.type === "video/mp4" || file.type === "video/webm";
			const isDoc = file.type === "application/pdf" || file.type === "text/plain" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/vnd.ms-excel" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
			if (!isImage && !isVideo && !isDoc) {
				showWarning(`Unsupported format: ${file.name}`);
				continue;
			}
			if (isImage && file.size > 10 * 1024 * 1024) {
				showWarning(`Image file exceeds 10MB limit: ${file.name}`);
				continue;
			}
			if (isVideo && file.size > 500 * 1024 * 1024) {
				showWarning(`Video file exceeds 500MB limit: ${file.name}`);
				continue;
			}
			if (isDoc && file.size > 50 * 1024 * 1024) {
				showWarning(`Document file exceeds 50MB limit: ${file.name}`);
				continue;
			}
			try {
				await mediaService.upload(file);
				successCount++;
			} catch (err) {
				console.error("Failed to upload", file.name, err);
				failCount++;
			}
		}
		if (successCount > 0) {
			showSuccess(`Successfully uploaded ${successCount} files`);
			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				next.set("page", "1");
				return next;
			});
			revalidate();
		}
		if (failCount > 0) showError(`Failed to upload ${failCount} files`);
		setUploading(false);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};
	const confirmDelete = async () => {
		if (!deleteMedia) return;
		try {
			await mediaService.delete(deleteMedia.id);
			showSuccess("Media file deleted successfully");
			revalidate();
		} catch (err) {
			console.error("Failed to delete media", err);
			if (err.response?.status === 409) showError("Conflict: Media is currently in use as a cover or in a post gallery and cannot be deleted.");
			else showError(err.response?.data?.message || "Failed to delete media file");
		} finally {
			setDeleteMedia(null);
		}
	};
	const handleDragOver = (e) => {
		e.preventDefault();
	};
	const handleDrop = async (e) => {
		e.preventDefault();
		const files = e.dataTransfer.files;
		if (!files || files.length === 0) return;
		setUploading(true);
		let successCount = 0;
		try {
			for (let i = 0; i < files.length; i++) {
				await mediaService.upload(files[i]);
				successCount++;
			}
			if (successCount > 0) {
				showSuccess(`Uploaded ${successCount} files via Drag & Drop`);
				setSearchParams((prev) => {
					const next = new URLSearchParams(prev);
					next.set("page", "1");
					return next;
				});
				revalidate();
			}
		} catch (err) {
			console.error(err);
			showError("Failed to upload some files");
		} finally {
			setUploading(false);
		}
	};
	const filteredMediaList = mediaList.filter((media) => media.file_name.toLowerCase().includes(searchQuery.toLowerCase()));
	const handlePreviewMedia = (media) => {
		if (media.type === "document" || media.mime_type === "application/pdf") setPreviewMedia(media);
		else {
			const mediaSlides = filteredMediaList.filter((m) => m.type === "image" || m.type === "video").map((m) => {
				if (m.type === "video") return {
					type: "video",
					sources: [{
						src: getFullUrl(m.url),
						type: m.mime_type || "video/mp4"
					}]
				};
				return { src: getFullUrl(m.url) };
			});
			const clickedIndex = filteredMediaList.filter((m) => m.type === "image" || m.type === "video").findIndex((m) => m.id === media.id);
			setLightboxSlides(mediaSlides);
			setLightboxIndex(clickedIndex >= 0 ? clickedIndex : 0);
			setLightboxOpen(true);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx(ConfirmModal, {
				isOpen: deleteMedia !== null,
				title: "Delete Media File",
				message: `Are you sure you want to delete "${deleteMedia?.file_name}"? This file will be permanently deleted from the disk and cannot be recovered.`,
				onConfirm: confirmDelete,
				onCancel: () => setDeleteMedia(null)
			}),
			previewMedia && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm",
				children: /* @__PURE__ */ jsxs("div", {
					className: "relative max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xl flex flex-col space-y-4 animate-scale-up",
					children: [
						/* @__PURE__ */ jsx("button", {
							onClick: () => setPreviewMedia(null),
							className: "absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all",
							children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "text-base font-bold text-slate-850 dark:text-white pr-12 truncate",
							children: previewMedia.file_name
						}),
						/* @__PURE__ */ jsx("div", {
							className: "w-full h-[60vh] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/30",
							children: previewMedia.type === "video" ? /* @__PURE__ */ jsx("video", {
								src: getFullUrl(previewMedia.url),
								controls: true,
								autoPlay: true,
								className: "max-w-full max-h-full"
							}) : previewMedia.type === "document" || previewMedia.mime_type === "application/pdf" ? PDFViewer ? /* @__PURE__ */ jsx(PDFViewer, {
								url: getFullUrl(previewMedia.url),
								fileName: previewMedia.file_name
							}) : /* @__PURE__ */ jsx("div", {
								className: "text-xs text-gray-500 py-4 text-center",
								children: "Loading viewer component..."
							}) : /* @__PURE__ */ jsx("img", {
								src: getFullUrl(previewMedia.url),
								alt: previewMedia.file_name,
								className: "object-contain max-w-full max-h-full"
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4 pt-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex gap-4",
								children: [
									/* @__PURE__ */ jsxs("span", { children: ["Type: ", /* @__PURE__ */ jsx("strong", {
										className: "text-slate-700 dark:text-gray-300 capitalize",
										children: previewMedia.type
									})] }),
									/* @__PURE__ */ jsxs("span", { children: ["Size: ", /* @__PURE__ */ jsxs("strong", {
										className: "text-slate-700 dark:text-gray-300",
										children: [(previewMedia.file_size / (1024 * 1024)).toFixed(2), " MB"]
									})] }),
									previewMedia.resolution && /* @__PURE__ */ jsxs("span", { children: ["Resolution: ", /* @__PURE__ */ jsx("strong", {
										className: "text-slate-700 dark:text-gray-300",
										children: previewMedia.resolution
									})] }),
									previewMedia.duration ? /* @__PURE__ */ jsxs("span", { children: ["Duration: ", /* @__PURE__ */ jsxs("strong", {
										className: "text-slate-700 dark:text-gray-300",
										children: [previewMedia.duration, "s"]
									})] }) : null
								]
							}), /* @__PURE__ */ jsx("a", {
								href: getFullUrl(previewMedia.url),
								target: "_blank",
								rel: "noreferrer",
								className: "text-accentBlue hover:underline",
								children: "Open in new tab"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent",
					children: "Media Library"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500 mt-1",
					children: "Upload, search, and manage files used throughout posts."
				})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("input", {
					type: "file",
					multiple: true,
					ref: fileInputRef,
					onChange: handleFileUpload,
					className: "hidden",
					accept: "image/*,video/mp4,video/webm,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
				}), /* @__PURE__ */ jsxs("button", {
					onClick: () => fileInputRef.current?.click(),
					disabled: uploading,
					className: "flex items-center space-x-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 disabled:opacity-55 text-white font-medium px-5 py-3 rounded-xl transition-all shadow-md shadow-accentBlue/10 text-sm",
					children: [uploading ? /* @__PURE__ */ jsx(Loader, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Upload Files" })]
				})] })]
			}),
			/* @__PURE__ */ jsxs("div", {
				onDragOver: handleDragOver,
				onDrop: handleDrop,
				className: "border-2 border-dashed border-slate-800 hover:border-accentBlue/40 bg-slate-900/10 hover:bg-slate-900/20 rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center group",
				children: [
					/* @__PURE__ */ jsx(Upload, { className: "w-10 h-10 text-gray-700 group-hover:text-accentBlue/60 transition-colors mb-3" }),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-gray-400 font-sans",
						children: "Drag & Drop images, videos, or documents (PDF, Word, Excel, Text) here to upload them directly"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-600 mt-1 font-sans",
						children: "Max sizes: Image 10MB, Video 500MB, Document 50MB"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-800/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex bg-slate-950 p-1 border border-slate-800 rounded-xl self-start",
					children: [
						{
							label: "All Files",
							value: ""
						},
						{
							label: "Images",
							value: "image"
						},
						{
							label: "Videos",
							value: "video"
						},
						{
							label: "Documents",
							value: "document"
						}
					].map((btn) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => {
							setSearchParams((prev) => {
								const next = new URLSearchParams(prev);
								if (btn.value) next.set("type", btn.value);
								else next.delete("type");
								next.set("page", "1");
								return next;
							});
						},
						className: `px-4 py-2 rounded-lg text-xs font-semibold transition-all ${typeFilter === btn.value ? "bg-slate-800 text-accentBlue shadow-sm" : "text-gray-400 hover:text-gray-200"}`,
						children: btn.label
					}, btn.label))
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3 w-full md:w-auto",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "relative w-full md:w-64",
						children: [/* @__PURE__ */ jsx("span", {
							className: "absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600",
							children: /* @__PURE__ */ jsx(Search, { className: "w-4 h-4" })
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							placeholder: "Search file name...",
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							className: "w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 rounded-xl outline-none transition-all text-xs"
						})]
					}), /* @__PURE__ */ jsx("button", {
						onClick: () => revalidate(),
						className: "p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors",
						title: "Refresh",
						children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
					})]
				})]
			}),
			loading ? /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4",
				children: [...Array(6)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "aspect-square bg-slate-850 animate-pulse border border-slate-800 rounded-2xl" }, i))
			}) : filteredMediaList.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "py-20 text-center border border-dashed border-slate-800 rounded-2xl",
				children: [
					/* @__PURE__ */ jsx(Image, { className: "w-12 h-12 text-gray-700 mx-auto mb-3" }),
					/* @__PURE__ */ jsx("h3", {
						className: "text-gray-400 font-bold text-sm",
						children: "No media files found"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-600 mt-1 font-sans",
						children: "Upload files or adjust your search filter"
					})
				]
			}) : /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4",
				children: filteredMediaList.map((media) => {
					const isProcessing = media.status === "processing";
					return /* @__PURE__ */ jsxs("div", {
						className: "group relative aspect-square bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-950",
							children: [isProcessing ? /* @__PURE__ */ jsxs("div", {
								className: "absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-xs text-gray-500 gap-2",
								children: [/* @__PURE__ */ jsx(Loader, { className: "w-5 h-5 animate-spin text-accentBlue" }), /* @__PURE__ */ jsx("span", { children: "Processing..." })]
							}) : media.type === "video" ? /* @__PURE__ */ jsxs("div", {
								className: "w-full h-full relative",
								children: [media.thumbnail_url ? /* @__PURE__ */ jsx("img", {
									src: getFullUrl(media.thumbnail_url),
									alt: "",
									className: "object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
								}) : /* @__PURE__ */ jsx("div", {
									className: "w-full h-full bg-slate-900 flex items-center justify-center",
									children: /* @__PURE__ */ jsx(Film, { className: "w-8 h-8 text-gray-700" })
								}), /* @__PURE__ */ jsx("div", {
									className: "absolute inset-0 flex items-center justify-center",
									children: /* @__PURE__ */ jsx("div", {
										className: "w-10 h-10 rounded-full bg-slate-950/80 backdrop-blur-sm border border-slate-800 flex items-center justify-center text-white group-hover:scale-110 transition-all",
										children: /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 fill-current ml-0.5" })
									})
								})]
							}) : media.type === "document" || media.mime_type === "application/pdf" ? /* @__PURE__ */ jsxs("div", {
								className: "w-full h-full bg-slate-900/60 flex flex-col items-center justify-center text-red-500 gap-2 p-4",
								children: [/* @__PURE__ */ jsx(FileText, { className: "w-10 h-10 group-hover:scale-105 transition-transform" }), /* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-gray-400 text-center truncate w-full font-bold",
									children: media.file_name
								})]
							}) : /* @__PURE__ */ jsx("img", {
								src: getFullUrl(media.thumbnail_url || media.url),
								alt: media.file_name,
								className: "object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
							}), !isProcessing && /* @__PURE__ */ jsx("div", {
								className: "absolute top-2.5 left-2.5 z-10 flex gap-1.5",
								children: /* @__PURE__ */ jsxs("span", {
									className: "bg-slate-950/80 border border-slate-800/80 backdrop-blur-sm text-[9px] font-bold text-gray-300 px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1",
									children: [media.type === "video" ? /* @__PURE__ */ jsx(Film, { className: "w-2.5 h-2.5" }) : media.type === "document" || media.mime_type === "application/pdf" ? /* @__PURE__ */ jsx(FileText, { className: "w-2.5 h-2.5" }) : /* @__PURE__ */ jsx(Image, { className: "w-2.5 h-2.5" }), media.type]
								})
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-3.5 transition-all duration-200",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex items-start justify-between gap-2",
								children: /* @__PURE__ */ jsx("p", {
									className: "text-xs text-gray-200 font-semibold truncate pr-1",
									title: media.file_name,
									children: media.file_name
								})
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex justify-between items-center pt-2",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "text-[10px] text-gray-400 font-mono",
									children: [(media.file_size / (1024 * 1024)).toFixed(2), " MB"]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx("button", {
										onClick: () => handlePreviewMedia(media),
										className: "p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors",
										title: "Preview details",
										children: /* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" })
									}), /* @__PURE__ */ jsx("button", {
										onClick: () => setDeleteMedia(media),
										className: "p-1.5 bg-dangerRed/10 hover:bg-dangerRed/20 border border-dangerRed/30 rounded-lg text-dangerRed transition-colors",
										title: "Delete file",
										children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
									})]
								})]
							})]
						})]
					}, media.id);
				})
			}),
			total > limit && /* @__PURE__ */ jsxs("div", {
				className: "p-4 bg-slate-950/30 border border-slate-800/40 rounded-2xl flex justify-between items-center",
				children: [
					/* @__PURE__ */ jsx("button", {
						disabled: page === 1,
						onClick: () => {
							setSearchParams((prev) => {
								const next = new URLSearchParams(prev);
								next.set("page", String(page - 1));
								return next;
							});
						},
						className: "px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all",
						children: "Previous"
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "text-xs text-gray-500 font-medium",
						children: [
							"Page ",
							page,
							" of ",
							Math.ceil(total / limit)
						]
					}),
					/* @__PURE__ */ jsx("button", {
						disabled: page * limit >= total,
						onClick: () => {
							setSearchParams((prev) => {
								const next = new URLSearchParams(prev);
								next.set("page", String(page + 1));
								return next;
							});
						},
						className: "px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all",
						children: "Next"
					})
				]
			}),
			lightboxOpen && Lightbox && /* @__PURE__ */ jsx(Lightbox, {
				open: lightboxOpen,
				close: () => setLightboxOpen(false),
				index: lightboxIndex,
				slides: lightboxSlides,
				plugins: [ZoomPlugin, VideoPlugin].filter(Boolean)
			})
		]
	});
};
var HydrateFallback$9 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", { className: "h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" })] })
		}), /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6",
			children: [...Array(12)].map((_, i) => /* @__PURE__ */ jsx("div", { className: "aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" }, i))
		})]
	});
});
var MediaLibrary_default = UNSAFE_withComponentProps(MediaLibrary);
//#endregion
//#region src/pages/Categories.tsx
var Categories_exports = /* @__PURE__ */ __exportAll({
	Categories: () => Categories,
	HydrateFallback: () => HydrateFallback$8,
	clientLoader: () => clientLoader$8,
	default: () => Categories_default
});
async function clientLoader$8({ request }) {
	const includeDeleted = new URL(request.url).searchParams.get("deleted") === "true";
	try {
		return { categories: (await categoryService.list(includeDeleted)).data || [] };
	} catch (err) {
		console.error("Failed to load categories", err);
		return { categories: [] };
	}
}
var Categories = () => {
	const { t, language } = useLanguage();
	const { showSuccess, showError } = useToast();
	const { categories } = useLoaderData();
	const { revalidate, state } = useRevalidator();
	const [searchParams, setSearchParams] = useSearchParams();
	const showDeleted = searchParams.get("deleted") === "true";
	const loading = state === "loading";
	const [saving, setSaving] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [form] = Form.useForm();
	const handleEdit = (category) => {
		setEditingId(category.id);
		form.setFieldsValue({
			name: category.name,
			name_en: category.name_en || "",
			slug: category.slug,
			slug_en: category.slug_en || "",
			description: category.description || "",
			description_en: category.description_en || "",
			parent_id: category.parent_id || void 0
		});
	};
	const handleCancelEdit = () => {
		setEditingId(null);
		form.resetFields();
	};
	const handleDelete = (id, force = false) => {
		Modal.confirm({
			title: force ? "Permanently Delete Category?" : "Delete Category (Soft Delete)?",
			content: force ? "Are you sure you want to permanently delete this category? This action cannot be undone." : "Are you sure you want to delete this category? You can restore it later from the deleted view.",
			okText: force ? "Force Delete" : "Delete",
			okType: "danger",
			cancelText: "Cancel",
			onOk: async () => {
				try {
					await categoryService.delete(id, force);
					showSuccess(force ? "Category permanently deleted." : "Category soft-deleted successfully.");
					revalidate();
					if (editingId === id) handleCancelEdit();
				} catch (err) {
					console.error(err);
					showError(err.response?.data?.message || "Failed to delete category.");
				}
			}
		});
	};
	const handleRestore = async (id) => {
		try {
			await categoryService.restore(id);
			showSuccess("Category restored successfully.");
			revalidate();
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to restore category.");
		}
	};
	const onFinish = async (values) => {
		setSaving(true);
		const payload = {
			...values,
			parent_id: values.parent_id || null
		};
		try {
			if (editingId !== null) {
				if ((await categoryService.update(editingId, payload)).success) {
					showSuccess("Category updated successfully.");
					revalidate();
					handleCancelEdit();
				}
			} else if ((await categoryService.create(payload)).success) {
				showSuccess("Category created successfully.");
				revalidate();
				form.resetFields();
			}
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to save category.");
		} finally {
			setSaving(false);
		}
	};
	const getParentOptions = () => {
		return categories.filter((c) => !c.deleted_at && c.id !== editingId).map((c) => ({
			value: c.id,
			label: `${c.name} ${c.name_en ? `(${c.name_en})` : ""}`
		}));
	};
	const columns = [
		{
			title: t("category_name"),
			key: "name",
			render: (_, record) => /* @__PURE__ */ jsxs("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "font-bold text-slate-850 dark:text-gray-200 text-xs md:text-[13.5px]",
					children: [
						record.name,
						" ",
						record.name_en && /* @__PURE__ */ jsxs("span", {
							className: "text-gray-400 font-normal",
							children: ["/ ", record.name_en]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2 items-center",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-mono text-gray-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full select-all",
							children: record.slug
						}),
						record.slug_en && /* @__PURE__ */ jsxs("span", {
							className: "text-[10px] font-mono text-gray-400 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full select-all",
							children: ["en: ", record.slug_en]
						}),
						record.deleted_at && /* @__PURE__ */ jsx(Tag$1, {
							color: "red",
							className: "text-[9px] py-0 px-1 border-0 m-0",
							children: "Deleted"
						})
					]
				})]
			})
		},
		{
			title: t("parent_category"),
			dataIndex: ["parent", "name"],
			key: "parent",
			render: (_, record) => {
				if (record.parent) return /* @__PURE__ */ jsx(Tag$1, {
					color: "blue",
					className: "text-[10px]",
					children: record.parent.name
				});
				return /* @__PURE__ */ jsx("span", {
					className: "text-gray-400 text-xs",
					children: "-"
				});
			}
		},
		{
			title: t("description"),
			key: "description",
			ellipsis: true,
			render: (_, record) => {
				return /* @__PURE__ */ jsx("span", {
					className: "text-xs text-gray-500 font-medium",
					children: (language === "en" ? record.description_en || record.description : record.description) || "-"
				});
			}
		},
		{
			title: t("actions"),
			key: "actions",
			width: 130,
			align: "right",
			render: (_, record) => {
				if (record.deleted_at) return /* @__PURE__ */ jsxs(Space, {
					size: "small",
					children: [/* @__PURE__ */ jsx(Tooltip, {
						title: "Restore Category",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							icon: /* @__PURE__ */ jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
							onClick: () => handleRestore(record.id),
							className: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center p-2 rounded-lg border border-emerald-500/20"
						})
					}), /* @__PURE__ */ jsx(Tooltip, {
						title: "Force Delete Permanently",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							danger: true,
							icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5" }),
							onClick: () => handleDelete(record.id, true),
							className: "bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center p-2 rounded-lg border border-red-500/20"
						})
					})]
				});
				return /* @__PURE__ */ jsxs(Space, {
					size: "small",
					children: [/* @__PURE__ */ jsx(Tooltip, {
						title: "Edit Category",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							icon: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" }),
							onClick: () => handleEdit(record),
							className: "bg-slate-850 hover:bg-slate-800 text-gray-300 flex items-center justify-center p-2 rounded-lg border border-slate-800"
						})
					}), /* @__PURE__ */ jsx(Tooltip, {
						title: "Soft Delete",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							danger: true,
							icon: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }),
							onClick: () => handleDelete(record.id, false),
							className: "bg-dangerRed/10 hover:bg-dangerRed/20 text-dangerRed flex items-center justify-center p-2 rounded-lg border border-dangerRed/20"
						})
					})]
				});
			}
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 select-none",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center space-x-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-10 h-10 rounded-xl bg-accentBlue/10 flex items-center justify-center text-accentBlue",
					children: /* @__PURE__ */ jsx(Folder, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight",
					children: t("categories") || "Categories"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-gray-500 mt-1",
					children: "Organize articles and topics within hierarchical categories"
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 bg-white/40 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-xl px-4 py-2 w-fit",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-xs font-semibold text-slate-700 dark:text-gray-300",
					children: t("show_deleted")
				}), /* @__PURE__ */ jsx(Switch, {
					checked: showDeleted,
					onChange: (checked) => {
						const next = new URLSearchParams(searchParams);
						if (checked) next.set("deleted", "true");
						else next.delete("deleted");
						setSearchParams(next);
					},
					size: "small"
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
			children: [/* @__PURE__ */ jsx("div", {
				className: "lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4 h-fit",
				children: /* @__PURE__ */ jsx(Table, {
					columns,
					dataSource: categories,
					rowKey: "id",
					loading,
					pagination: {
						pageSize: 8,
						showSizeChanger: false,
						className: "select-none"
					},
					className: "border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden bg-transparent"
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30 h-fit select-none",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "text-lg font-bold text-slate-800 dark:text-gray-200 mb-4 flex items-center gap-1.5",
					children: editingId !== null ? t("edit_category") : t("create_category")
				}), /* @__PURE__ */ jsxs(Form, {
					form,
					layout: "vertical",
					onFinish,
					requiredMark: false,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: t("parent_category")
							}),
							name: "parent_id",
							children: /* @__PURE__ */ jsx(Select, {
								placeholder: "None (Root Category)",
								options: getParentOptions(),
								allowClear: true,
								className: "h-10 rounded-xl",
								popupClassName: "dark:bg-slate-900 border dark:border-slate-850"
							})
						}),
						/* @__PURE__ */ jsxs(Tabs, {
							defaultActiveKey: "vi",
							size: "small",
							className: "border-b border-slate-200 dark:border-slate-800/60 mb-2",
							children: [/* @__PURE__ */ jsx(Tabs.TabPane, {
								tab: "Tiếng Việt",
								children: /* @__PURE__ */ jsxs("div", {
									className: "space-y-4 pt-2",
									children: [
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: "Tên chuyên mục (VI)"
											}),
											name: "name",
											rules: [{
												required: true,
												message: "Vui lòng nhập tên chuyên mục!"
											}],
											children: /* @__PURE__ */ jsx(Input, {
												placeholder: "Ví dụ: Kiến trúc đám mây",
												className: "h-10 rounded-xl"
											})
										}),
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsxs("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
													children: "Slug VI (Tùy chọn)"
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500 font-normal",
													children: "Tự động tạo từ tên nếu để trống"
												})]
											}),
											name: "slug",
											children: /* @__PURE__ */ jsx(Input, {
												placeholder: "Ví dụ: kien-truc-dam-may",
												className: "h-10 rounded-xl font-mono text-sm"
											})
										}),
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: "Mô tả (VI)"
											}),
											name: "description",
											children: /* @__PURE__ */ jsx(Input.TextArea, {
												rows: 3,
												placeholder: "Mô tả ngắn cho chuyên mục hiển thị...",
												className: "rounded-xl resize-none text-sm"
											})
										})
									]
								})
							}, "vi"), /* @__PURE__ */ jsx(Tabs.TabPane, {
								tab: "English",
								children: /* @__PURE__ */ jsxs("div", {
									className: "space-y-4 pt-2",
									children: [
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: "Category Name (EN)"
											}),
											name: "name_en",
											children: /* @__PURE__ */ jsx(Input, {
												placeholder: "e.g. Cloud Architecture",
												className: "h-10 rounded-xl"
											})
										}),
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsxs("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
													children: "Slug EN (Optional)"
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500 font-normal",
													children: "Auto-generated if left empty"
												})]
											}),
											name: "slug_en",
											children: /* @__PURE__ */ jsx(Input, {
												placeholder: "e.g. cloud-architecture",
												className: "h-10 rounded-xl font-mono text-sm"
											})
										}),
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: "Description (EN)"
											}),
											name: "description_en",
											children: /* @__PURE__ */ jsx(Input.TextArea, {
												rows: 3,
												placeholder: "Short description in English...",
												className: "rounded-xl resize-none text-sm"
											})
										})
									]
								})
							}, "en")]
						}),
						/* @__PURE__ */ jsx(Form.Item, {
							className: "pt-2 mb-0",
							children: /* @__PURE__ */ jsxs(Space, {
								className: "w-full justify-end",
								children: [editingId !== null && /* @__PURE__ */ jsx(Button, {
									onClick: handleCancelEdit,
									className: "rounded-xl font-bold h-9",
									children: "Cancel"
								}), /* @__PURE__ */ jsx(Button, {
									type: "primary",
									htmlType: "submit",
									loading: saving,
									icon: /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
									className: "bg-btn-global hover:brightness-110 border-0 h-9 rounded-xl font-bold flex items-center gap-1 text-white",
									children: editingId !== null ? "Save Changes" : "Create Category"
								})]
							})
						})
					]
				})]
			})]
		})]
	});
};
var HydrateFallback$8 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center space-x-3",
				children: [/* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", { className: "h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" })] })]
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
			children: [/* @__PURE__ */ jsx("div", { className: "lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" }), /* @__PURE__ */ jsx("div", { className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" })]
		})]
	});
});
var Categories_default = UNSAFE_withComponentProps(Categories);
//#endregion
//#region src/pages/Tags.tsx
var Tags_exports = /* @__PURE__ */ __exportAll({
	HydrateFallback: () => HydrateFallback$7,
	Tags: () => Tags,
	clientLoader: () => clientLoader$7,
	default: () => Tags_default
});
async function clientLoader$7({ request }) {
	const includeDeleted = new URL(request.url).searchParams.get("deleted") === "true";
	try {
		return { tags: (await tagService.list(includeDeleted)).data || [] };
	} catch (err) {
		console.error("Failed to load tags", err);
		return { tags: [] };
	}
}
var Tags = () => {
	const { t } = useLanguage();
	const { showSuccess, showError } = useToast();
	const { tags } = useLoaderData();
	const { revalidate, state } = useRevalidator();
	const [searchParams, setSearchParams] = useSearchParams();
	const showDeleted = searchParams.get("deleted") === "true";
	const loading = state === "loading";
	const [saving, setSaving] = useState(false);
	const [form] = Form.useForm();
	const handleCreate = async (values) => {
		const trimmed = values.name.trim();
		if (!trimmed) return;
		setSaving(true);
		try {
			await tagService.create({ name: trimmed });
			showSuccess(`Tag "${trimmed}" created successfully.`);
			revalidate();
			form.resetFields();
		} catch (err) {
			console.error("Failed to create tag", err);
			showError(err.response?.data?.message || "Failed to create tag.");
		} finally {
			setSaving(false);
		}
	};
	const handleDelete = (id, name, force = false) => {
		Modal.confirm({
			title: force ? "Permanently Delete Tag?" : "Delete Tag?",
			content: force ? `Are you sure you want to permanently delete "${name}"? This action cannot be undone.` : `Are you sure you want to delete the tag "${name}"? You can restore it later.`,
			okText: force ? "Force Delete" : "Delete",
			okType: "danger",
			cancelText: "Cancel",
			onOk: async () => {
				try {
					await tagService.delete(id, force);
					showSuccess(force ? `Tag "${name}" permanently deleted.` : `Tag "${name}" soft-deleted.`);
					revalidate();
				} catch (err) {
					console.error(err);
					showError(err.response?.data?.message || "Failed to delete tag.");
				}
			}
		});
	};
	const handleRestore = async (id, name) => {
		try {
			await tagService.restore(id);
			showSuccess(`Tag "${name}" restored successfully.`);
			revalidate();
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to restore tag.");
		}
	};
	const activeTags = tags.filter((t) => !t.deleted_at);
	const deletedTags = tags.filter((t) => !!t.deleted_at);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 select-none",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center space-x-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-10 h-10 rounded-xl bg-accentBlue/10 flex items-center justify-center text-accentBlue",
					children: /* @__PURE__ */ jsx(Tag, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight",
					children: t("tags") || "Tags"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-gray-500 mt-1",
					children: "Manage keywords, labels, and tags to classify blog posts"
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 bg-white/40 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-xl px-4 py-2 w-fit",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-xs font-semibold text-slate-700 dark:text-gray-300",
					children: t("show_deleted")
				}), /* @__PURE__ */ jsx(Switch, {
					checked: showDeleted,
					onChange: (checked) => {
						const next = new URLSearchParams(searchParams);
						if (checked) next.set("deleted", "true");
						else next.delete("deleted");
						setSearchParams(next);
					},
					size: "small"
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-6 h-fit min-h-[220px]",
				children: [
					/* @__PURE__ */ jsxs("h3", {
						className: "text-sm font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4 select-none",
						children: [
							t("active_tags"),
							" (",
							activeTags.length,
							")"
						]
					}),
					loading ? /* @__PURE__ */ jsxs("div", {
						className: "py-12 text-center",
						children: [/* @__PURE__ */ jsx(Spin, { size: "medium" }), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 mt-2 select-none",
							children: "Retrieving tags..."
						})]
					}) : activeTags.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl select-none mb-6",
						children: [/* @__PURE__ */ jsx(Tag, { className: "w-12 h-12 text-gray-600 mx-auto mb-3" }), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500",
							children: "No active tags found. Add one on the right."
						})]
					}) : /* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap gap-2.5 mb-6",
						children: activeTags.map((tag) => /* @__PURE__ */ jsxs(Tag$1, {
							closable: true,
							onClose: (e) => {
								e.preventDefault();
								handleDelete(tag.id, tag.name, false);
							},
							color: "blue",
							className: "rounded-lg border-0 font-bold px-3 py-1 text-xs select-all flex items-center gap-1.5 dark:bg-slate-900 dark:text-accentBlue",
							children: [tag.name, /* @__PURE__ */ jsxs("span", {
								className: "text-[10px] text-gray-500 font-mono font-normal",
								children: [
									"(",
									tag.slug,
									")"
								]
							})]
						}, tag.id))
					}),
					showDeleted && /* @__PURE__ */ jsxs("div", {
						className: "border-t border-slate-200 dark:border-slate-800 pt-6",
						children: [/* @__PURE__ */ jsxs("h3", {
							className: "text-sm font-bold text-red-400 uppercase tracking-wider mb-4 select-none",
							children: [
								t("deleted_tags"),
								" (",
								deletedTags.length,
								")"
							]
						}), deletedTags.length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 select-none",
							children: "No soft-deleted tags."
						}) : /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-2.5",
							children: deletedTags.map((tag) => /* @__PURE__ */ jsxs("div", {
								className: "rounded-lg bg-red-500/10 text-red-500 font-bold px-3 py-1.5 text-xs flex items-center gap-2 border border-red-500/20",
								children: [
									/* @__PURE__ */ jsx("span", { children: tag.name }),
									/* @__PURE__ */ jsxs("span", {
										className: "text-[9px] text-red-400 font-mono font-normal",
										children: [
											"(",
											tag.slug,
											")"
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex gap-1.5 ml-2 border-l border-red-500/20 pl-2",
										children: [/* @__PURE__ */ jsx(Tooltip, {
											title: "Restore Tag",
											children: /* @__PURE__ */ jsx("button", {
												onClick: () => handleRestore(tag.id, tag.name),
												className: "hover:text-emerald-500 transition-colors p-0.5",
												children: /* @__PURE__ */ jsx(RotateCcw, { className: "w-3 h-3" })
											})
										}), /* @__PURE__ */ jsx(Tooltip, {
											title: "Force Delete Permanently",
											children: /* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(tag.id, tag.name, true),
												className: "hover:text-red-650 transition-colors p-0.5",
												children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3 h-3" })
											})
										})]
									})
								]
							}, tag.id))
						})]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 bg-white/40 dark:bg-slate-900/30 h-fit select-none",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "text-lg font-bold text-slate-800 dark:text-gray-200 mb-4",
					children: t("create_tag")
				}), /* @__PURE__ */ jsxs(Form, {
					form,
					layout: "vertical",
					onFinish: handleCreate,
					requiredMark: false,
					children: [/* @__PURE__ */ jsx(Form.Item, {
						label: /* @__PURE__ */ jsx("span", {
							className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
							children: t("tag_name")
						}),
						name: "name",
						rules: [{
							required: true,
							message: "Please input tag name!"
						}, {
							max: 100,
							message: "Tag name is too long!"
						}],
						children: /* @__PURE__ */ jsx(Input, {
							placeholder: "e.g. Kubernetes",
							className: "h-10 rounded-xl"
						})
					}), /* @__PURE__ */ jsx(Form.Item, {
						className: "mb-0",
						children: /* @__PURE__ */ jsx(Button, {
							type: "primary",
							htmlType: "submit",
							loading: saving,
							block: true,
							icon: /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
							className: "bg-btn-global hover:brightness-110 border-0 h-10 rounded-xl font-bold flex items-center justify-center gap-1 text-white",
							children: t("create_tag")
						})
					})]
				})]
			})]
		})]
	});
};
var HydrateFallback$7 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 select-none",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center space-x-3",
				children: [/* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", { className: "h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" })] })]
			})
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
			children: [/* @__PURE__ */ jsx("div", { className: "lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[220px] animate-pulse bg-slate-200 dark:bg-slate-800/50" }), /* @__PURE__ */ jsx("div", { className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[220px] animate-pulse bg-slate-200 dark:bg-slate-800/50" })]
		})]
	});
});
var Tags_default = UNSAFE_withComponentProps(Tags);
//#endregion
//#region src/pages/CommentModeration.tsx
var CommentModeration_exports = /* @__PURE__ */ __exportAll({
	CommentModeration: () => CommentModeration,
	HydrateFallback: () => HydrateFallback$6,
	clientLoader: () => clientLoader$6,
	default: () => CommentModeration_default
});
async function clientLoader$6({ request }) {
	const url = new URL(request.url);
	const statusFilter = url.searchParams.has("status") ? url.searchParams.get("status") : "pending";
	const page = parseInt(url.searchParams.get("page") || "1");
	const limit = 10;
	const offset = (page - 1) * limit;
	try {
		const [listRes, countRes] = await Promise.all([commentService.listAll({
			status: statusFilter || void 0,
			offset,
			limit
		}), commentService.getPendingCount()]);
		return {
			comments: listRes.success ? listRes.data?.items || [] : [],
			total: listRes.success ? listRes.data?.total || 0 : 0,
			pendingCount: countRes.success ? countRes.data?.count || 0 : 0
		};
	} catch (err) {
		console.error("Failed to load comments", err);
		return {
			comments: [],
			total: 0,
			pendingCount: 0
		};
	}
}
var CommentModeration = () => {
	const { comments, total, pendingCount } = useLoaderData();
	const { revalidate } = useRevalidator();
	const loading = useNavigation().state === "loading";
	const [searchParams, setSearchParams] = useSearchParams();
	const statusFilter = searchParams.has("status") ? searchParams.get("status") : "pending";
	const page = parseInt(searchParams.get("page") || "1");
	const limit = 10;
	const [deleteCommentId, setDeleteCommentId] = useState(null);
	const { showSuccess, showError } = useToast();
	const handleApprove = async (id) => {
		try {
			await commentService.approve(id);
			showSuccess("Comment approved successfully");
			revalidate();
		} catch (err) {
			console.error(err);
			showError("Failed to approve comment");
		}
	};
	const handleReject = async (id) => {
		try {
			await commentService.reject(id);
			showSuccess("Comment rejected successfully");
			revalidate();
		} catch (err) {
			console.error(err);
			showError("Failed to reject comment");
		}
	};
	const confirmDelete = async () => {
		if (deleteCommentId === null) return;
		try {
			await commentService.deleteComment(deleteCommentId);
			showSuccess("Comment deleted permanently");
			revalidate();
		} catch (err) {
			console.error(err);
			showError("Failed to delete comment");
		} finally {
			setDeleteCommentId(null);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx(ConfirmModal, {
				isOpen: deleteCommentId !== null,
				title: "Delete Comment",
				message: "Are you sure you want to permanently delete this comment? This action cannot be undone.",
				onConfirm: confirmDelete,
				onCancel: () => setDeleteCommentId(null)
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent",
					children: "Comment Moderation"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500 mt-1",
					children: "Review reader comments, approve quality contributions, or reject spam."
				})] }), pendingCount > 0 && /* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl text-amber-500 text-xs font-bold uppercase tracking-wider self-start sm:self-auto",
					children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" }), /* @__PURE__ */ jsxs("span", { children: [pendingCount, " Pending Reviews"] })]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-800/50 rounded-2xl overflow-hidden",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 border-b border-slate-200 dark:border-slate-800/50 bg-slate-100/30 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 rounded-xl self-start",
							children: [
								{
									label: "Pending",
									value: "pending"
								},
								{
									label: "Approved",
									value: "approved"
								},
								{
									label: "Rejected",
									value: "rejected"
								},
								{
									label: "All",
									value: ""
								}
							].map((btn) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => {
									setSearchParams((prev) => {
										const next = new URLSearchParams(prev);
										if (btn.value) next.set("status", btn.value);
										else next.set("status", "");
										next.set("page", "1");
										return next;
									});
								},
								className: `px-4 py-2 rounded-lg text-xs font-semibold transition-all ${statusFilter === btn.value ? "bg-white dark:bg-slate-800 text-accentBlue shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-850 dark:hover:text-gray-200"}`,
								children: btn.label
							}, btn.label))
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: () => revalidate(),
								className: "p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors",
								title: "Refresh list",
								children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-gray-500",
								children: ["Total: ", total]
							})]
						})]
					}),
					loading ? /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center",
						children: [/* @__PURE__ */ jsx(Loader, { className: "w-8 h-8 animate-spin mx-auto text-accentBlue mb-4" }), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-gray-500",
							children: "Loading comments list..."
						})]
					}) : comments.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center border-dashed border-slate-800 rounded-2xl",
						children: [
							/* @__PURE__ */ jsx(MessageSquare, { className: "w-12 h-12 text-gray-700 mx-auto mb-4" }),
							/* @__PURE__ */ jsx("h3", {
								className: "text-lg font-bold text-gray-300",
								children: "No comments found"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-gray-600 mt-1 font-sans",
								children: "No comments match the selected filter status."
							})
						]
					}) : /* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-left border-collapse",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-slate-800/50 text-xs font-semibold text-gray-400 uppercase bg-slate-900/10",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "p-4 w-[180px]",
										children: "Author"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4",
										children: "Comment Content"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 w-[120px]",
										children: "Spam Score"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 w-[100px]",
										children: "Status"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 w-[130px]",
										children: "Created At"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 text-right w-[150px]",
										children: "Actions"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-slate-800/30",
								children: comments.map((item) => /* @__PURE__ */ jsxs("tr", {
									className: "hover:bg-slate-800/10 transition-colors",
									children: [
										/* @__PURE__ */ jsxs("td", {
											className: "p-4 align-top",
											children: [/* @__PURE__ */ jsx("p", {
												className: "font-semibold text-sm text-gray-200",
												children: item.author_name
											}), /* @__PURE__ */ jsxs("p", {
												className: "text-[10px] text-gray-500 font-sans mt-0.5",
												children: ["Post ID: ", item.post_id]
											})]
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 align-top text-sm text-gray-300 font-sans leading-relaxed whitespace-pre-wrap max-w-lg break-words",
											children: item.content
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 align-top text-sm font-sans",
											children: item.spam_score !== void 0 && item.spam_score !== null ? /* @__PURE__ */ jsxs("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ jsx("span", {
													className: `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.spam_score >= .85 ? "bg-red-500/15 border border-red-500/25 text-red-500" : item.spam_score >= .5 ? "bg-amber-500/15 border border-amber-500/25 text-amber-500" : "bg-green-500/15 border border-green-500/25 text-green-500"}`,
													children: item.spam_score >= .85 ? "Spam 🚨" : item.spam_score >= .5 ? "Suspicious ⚠️" : "Safe ✓"
												}), /* @__PURE__ */ jsxs("p", {
													className: "text-[10px] text-gray-500 font-medium",
													children: [
														"Score: ",
														(item.spam_score * 100).toFixed(0),
														"%"
													]
												})]
											}) : /* @__PURE__ */ jsx("span", {
												className: "text-gray-600 text-xs",
												children: "—"
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 align-top text-sm",
											children: item.status === "approved" ? /* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center space-x-1 text-successGreen bg-successGreen/10 border border-successGreen/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
												children: [/* @__PURE__ */ jsx(Check, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Approved" })]
											}) : item.status === "rejected" ? /* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center space-x-1 text-dangerRed bg-dangerRed/10 border border-dangerRed/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
												children: [/* @__PURE__ */ jsx(X, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Rejected" })]
											}) : /* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center space-x-1 text-warningYellow bg-warningYellow/10 border border-warningYellow/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
												children: [/* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Pending" })]
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 align-top text-xs text-gray-500 font-sans",
											children: new Date(item.created_at).toLocaleString()
										}),
										/* @__PURE__ */ jsx("td", {
											className: "p-4 align-top text-right",
											children: /* @__PURE__ */ jsxs("div", {
												className: "flex items-center justify-end space-x-2",
												children: [
													item.status !== "approved" && /* @__PURE__ */ jsx("button", {
														onClick: () => handleApprove(item.id),
														className: "p-2 bg-successGreen/10 hover:bg-successGreen/20 border border-successGreen/30 rounded-lg text-successGreen transition-all",
														title: "Approve comment",
														children: /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" })
													}),
													item.status !== "rejected" && /* @__PURE__ */ jsx("button", {
														onClick: () => handleReject(item.id),
														className: "p-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 rounded-lg text-gray-400 hover:text-white transition-all",
														title: "Reject comment",
														children: /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5" })
													}),
													/* @__PURE__ */ jsx("button", {
														onClick: () => setDeleteCommentId(item.id),
														className: "p-2 bg-dangerRed/10 hover:bg-dangerRed/20 border border-dangerRed/30 rounded-lg text-dangerRed transition-all",
														title: "Delete comment permanently",
														children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
													})
												]
											})
										})
									]
								}, item.id))
							})]
						})
					}),
					total > limit && /* @__PURE__ */ jsxs("div", {
						className: "p-4 border-t border-slate-800/50 bg-slate-900/10 flex justify-between items-center",
						children: [
							/* @__PURE__ */ jsx("button", {
								disabled: page === 1,
								onClick: () => {
									setSearchParams((prev) => {
										const next = new URLSearchParams(prev);
										next.set("page", String(page - 1));
										return next;
									});
								},
								className: "px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all",
								children: "Previous"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xs text-gray-500 font-medium",
								children: [
									"Page ",
									page,
									" of ",
									Math.ceil(total / limit)
								]
							}),
							/* @__PURE__ */ jsx("button", {
								disabled: page * limit >= total,
								onClick: () => {
									setSearchParams((prev) => {
										const next = new URLSearchParams(prev);
										next.set("page", String(page + 1));
										return next;
									});
								},
								className: "px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all",
								children: "Next"
							})
						]
					})
				]
			})
		]
	});
};
var HydrateFallback$6 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", { className: "h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" })] })
		}), /* @__PURE__ */ jsx("div", { className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" })]
	});
});
var CommentModeration_default = UNSAFE_withComponentProps(CommentModeration);
//#endregion
//#region src/pages/TranslateJobs.tsx
var TranslateJobs_exports = /* @__PURE__ */ __exportAll({
	HydrateFallback: () => HydrateFallback$5,
	TranslateJobs: () => TranslateJobs,
	clientLoader: () => clientLoader$5,
	default: () => TranslateJobs_default
});
async function clientLoader$5({ request }) {
	const url = new URL(request.url);
	const page = parseInt(url.searchParams.get("page") || "1");
	const limit = 10;
	const offset = (page - 1) * limit;
	try {
		const res = await translateService.listJobs({
			offset,
			limit
		});
		if (res.success && res.data) {
			const items = res.data.items || [];
			return {
				jobs: items,
				total: res.data.total || 0,
				metrics: {
					pending: items.filter((j) => j.status === "pending").length,
					processing: items.filter((j) => j.status === "processing").length,
					done: items.filter((j) => j.status === "done").length,
					failed: items.filter((j) => j.status === "failed").length
				}
			};
		}
	} catch (err) {
		console.error("Failed to load translate jobs", err);
	}
	return {
		jobs: [],
		total: 0,
		metrics: {
			pending: 0,
			processing: 0,
			done: 0,
			failed: 0
		}
	};
}
var TranslateJobs = () => {
	const { language } = useLanguage();
	const { jobs, total, metrics } = useLoaderData();
	const { revalidate } = useRevalidator();
	const loading = useNavigation().state === "loading";
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get("page") || "1");
	const limit = 10;
	useEffect(() => {
		const interval = setInterval(() => {
			revalidate();
		}, 5e3);
		return () => clearInterval(interval);
	}, [revalidate]);
	const handleRetry = async (jobId) => {
		try {
			if ((await translateService.retryJob(jobId)).success) {
				message.success(language === "vi" ? "Đã kích hoạt thử lại thành công!" : "Job retry triggered successfully!");
				revalidate();
			}
		} catch (err) {
			console.error(err);
			message.error(language === "vi" ? "Không thể thử lại job này." : "Failed to retry job.");
		}
	};
	const handleDelete = (jobId) => {
		Modal.confirm({
			title: language === "vi" ? "Xóa tiến trình dịch" : "Delete Translate Job",
			content: language === "vi" ? "Bạn có chắc chắn muốn xóa tiến trình dịch này khỏi cơ sở dữ liệu?" : "Are you sure you want to delete this translation job from the database?",
			okText: language === "vi" ? "Xóa" : "Delete",
			okType: "danger",
			cancelText: language === "vi" ? "Hủy" : "Cancel",
			onOk: async () => {
				try {
					if ((await translateService.deleteJob(jobId)).success) {
						message.success(language === "vi" ? "Đã xóa tiến trình thành công!" : "Job deleted successfully!");
						revalidate();
					}
				} catch (err) {
					console.error(err);
					message.error(language === "vi" ? "Không thể xóa job này." : "Failed to delete job.");
				}
			}
		});
	};
	const getStatusTag = (status) => {
		switch (status) {
			case "pending": return /* @__PURE__ */ jsxs(Tag$1, {
				color: "default",
				className: "flex items-center gap-1 w-max font-bold",
				children: [/* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "PENDING" })]
			});
			case "processing": return /* @__PURE__ */ jsxs(Tag$1, {
				color: "processing",
				className: "flex items-center gap-1 w-max font-bold",
				children: [/* @__PURE__ */ jsx(RefreshCw, { className: "w-3.5 h-3.5 animate-spin" }), /* @__PURE__ */ jsx("span", { children: "PROCESSING" })]
			});
			case "done": return /* @__PURE__ */ jsxs(Tag$1, {
				color: "success",
				className: "flex items-center gap-1 w-max font-bold",
				children: [/* @__PURE__ */ jsx(CheckCircle, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "DONE" })]
			});
			case "failed": return /* @__PURE__ */ jsxs(Tag$1, {
				color: "error",
				className: "flex items-center gap-1 w-max font-bold",
				children: [/* @__PURE__ */ jsx(AlertCircle, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "FAILED" })]
			});
			default: return /* @__PURE__ */ jsx(Tag$1, {
				color: "default",
				children: status.toUpperCase()
			});
		}
	};
	const columns = [
		{
			title: "Job ID",
			dataIndex: "job_id",
			key: "job_id",
			className: "font-mono text-xs text-gray-500",
			width: 160,
			render: (id) => /* @__PURE__ */ jsx(Tooltip, {
				title: id,
				children: /* @__PURE__ */ jsxs("span", { children: [
					id.substring(0, 8),
					"...",
					id.substring(id.length - 8)
				] })
			})
		},
		{
			title: language === "vi" ? "Nội dung (Trích đoạn)" : "Content Snippet",
			dataIndex: "content",
			key: "content",
			className: "text-xs text-slate-700 dark:text-slate-300",
			render: (text) => {
				const plainText = text.replace(/<[^>]*>/g, "");
				return plainText.length > 80 ? plainText.substring(0, 80) + "..." : plainText;
			}
		},
		{
			title: language === "vi" ? "Dịch từ/sang" : "Direction",
			key: "direction",
			width: 100,
			align: "center",
			render: (_, record) => /* @__PURE__ */ jsxs(Tag$1, {
				color: "purple",
				className: "font-bold",
				children: [
					(record.source_lang || "VI").toUpperCase(),
					" → ",
					record.target_lang.toUpperCase()
				]
			})
		},
		{
			title: language === "vi" ? "Trạng thái" : "Status",
			dataIndex: "status",
			key: "status",
			width: 130,
			render: (status) => getStatusTag(status)
		},
		{
			title: language === "vi" ? "Ngày khởi tạo" : "Created At",
			dataIndex: "created_at",
			key: "created_at",
			width: 150,
			className: "text-xs text-gray-500",
			render: (dateStr) => dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss")
		},
		{
			title: language === "vi" ? "Thao tác" : "Actions",
			key: "actions",
			width: 120,
			align: "center",
			render: (_, record) => /* @__PURE__ */ jsxs(Space, {
				size: "middle",
				children: [record.status !== "done" && /* @__PURE__ */ jsx(Tooltip, {
					title: language === "vi" ? "Chạy lại job" : "Retry Job",
					children: /* @__PURE__ */ jsx(Button, {
						type: "text",
						icon: /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }),
						onClick: () => handleRetry(record.job_id),
						className: "hover:bg-emerald-500/10 rounded-lg"
					})
				}), /* @__PURE__ */ jsx(Tooltip, {
					title: language === "vi" ? "Xóa job" : "Delete Job",
					children: /* @__PURE__ */ jsx(Button, {
						type: "text",
						danger: true,
						icon: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }),
						onClick: () => handleDelete(record.job_id),
						className: "hover:bg-red-500/10 rounded-lg"
					})
				})]
			})
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6 select-none",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-2 md:grid-cols-4 gap-4",
			children: [
				/* @__PURE__ */ jsxs(Card, {
					className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-gray-400 font-bold uppercase",
							children: language === "vi" ? "Đang chờ" : "Pending"
						}), /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-gray-400" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-2xl font-black text-slate-850 dark:text-white mt-2",
						children: metrics.pending
					})]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-blue-500 font-bold uppercase",
							children: language === "vi" ? "Đang xử lý" : "Processing"
						}), /* @__PURE__ */ jsx(RefreshCw, { className: "w-5 h-5 text-blue-500 animate-spin" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-2xl font-black text-blue-600 mt-2",
						children: metrics.processing
					})]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-emerald-500 font-bold uppercase",
							children: language === "vi" ? "Hoàn thành" : "Completed"
						}), /* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5 text-emerald-500" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-2xl font-black text-emerald-600 mt-2",
						children: metrics.done
					})]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs text-red-500 font-bold uppercase",
							children: language === "vi" ? "Lỗi" : "Failed"
						}), /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 text-red-500" })]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-2xl font-black text-red-600 mt-2",
						children: metrics.failed
					})]
				})
			]
		}), /* @__PURE__ */ jsxs(Card, {
			className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex justify-between items-center mb-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Languages, { className: "w-5 h-5 text-accentBlue" }), /* @__PURE__ */ jsx("h2", {
						className: "text-base font-extrabold text-slate-850 dark:text-white",
						children: language === "vi" ? "Danh sách tiến trình dịch AI" : "AI Translation Job Queue"
					})]
				}), /* @__PURE__ */ jsx(Button, {
					type: "primary",
					icon: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
					onClick: () => revalidate(),
					loading,
					className: "bg-btn-global border-0 rounded-xl",
					children: language === "vi" ? "Làm mới" : "Refresh"
				})]
			}), /* @__PURE__ */ jsx(Table, {
				dataSource: jobs,
				columns,
				rowKey: "id",
				loading,
				pagination: {
					current: page,
					pageSize: limit,
					total,
					onChange: (p) => {
						setSearchParams((prev) => {
							const next = new URLSearchParams(prev);
							next.set("page", String(p));
							return next;
						});
					},
					showSizeChanger: false
				},
				className: "premium-table"
			})]
		})]
	});
};
var HydrateFallback$5 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6 select-none",
		children: [/* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-2 md:grid-cols-4 gap-4",
			children: [
				1,
				2,
				3,
				4
			].map((i) => /* @__PURE__ */ jsx("div", { className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[90px] animate-pulse bg-slate-200 dark:bg-slate-800/50" }, i))
		}), /* @__PURE__ */ jsx("div", { className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" })]
	});
});
var TranslateJobs_default = UNSAFE_withComponentProps(TranslateJobs);
//#endregion
//#region src/pages/Settings.tsx
var Settings_exports = /* @__PURE__ */ __exportAll({
	HydrateFallback: () => HydrateFallback$4,
	Settings: () => Settings$1,
	clientLoader: () => clientLoader$4,
	default: () => Settings_default
});
async function clientLoader$4() {
	try {
		return { settings: (await settingsService.get()).data || {} };
	} catch (err) {
		console.error("Failed to load settings", err);
		return { settings: {} };
	}
}
var Settings$1 = () => {
	const { user, updateUser } = useAuth();
	const { showSuccess, showError } = useToast();
	const { colors, updateThemeColors, resetThemeColors } = useTheme();
	const { settings } = useLoaderData();
	const [activeTab, setActiveTab] = useState("site");
	const [loading, setLoading] = useState(false);
	const [siteName, setSiteName] = useState(settings?.site_name || "");
	const [siteDescription, setSiteDescription] = useState(settings?.site_description || "");
	const [logoUrl, setLogoUrl] = useState(settings?.logo_url || "");
	const [commentsEnabled, setCommentsEnabled] = useState(settings?.comments_enabled === "true");
	const [commentsAutoApprove, setCommentsAutoApprove] = useState(settings?.comments_auto_approve === "true");
	const [uploadingLogo, setUploadingLogo] = useState(false);
	const logoInputRef = useRef(null);
	const initialSliderImages = () => {
		if (!settings?.slider_images) return [];
		try {
			const parsed = JSON.parse(settings.slider_images);
			if (Array.isArray(parsed)) return parsed;
		} catch {
			return settings.slider_images.split(",").map((s) => s.trim()).filter(Boolean);
		}
		return [];
	};
	const [sliderImages, setSliderImages] = useState(initialSliderImages);
	const [footerCopyright, setFooterCopyright] = useState(settings?.footer_copyright || "");
	const [facebookUrl, setFacebookUrl] = useState(settings?.footer_facebook_url || "");
	const [githubUrl, setGithubUrl] = useState(settings?.footer_github_url || "");
	const [linkedinUrl, setLinkedinUrl] = useState(settings?.footer_linkedin_url || "");
	const [twitterUrl, setTwitterUrl] = useState(settings?.footer_twitter_url || "");
	const [mediaList, setMediaList] = useState([]);
	const [showMediaModal, setShowMediaModal] = useState(false);
	const [themePrimaryColor, setThemePrimaryColor] = useState(settings?.theme_primary_color || "#3b82f6");
	const [themeButtonBg, setThemeButtonBg] = useState(settings?.theme_button_bg || "#3b82f6");
	const [themeTextColor, setThemeTextColor] = useState(settings?.theme_text_color || "#0f172a");
	const [heroKicker, setHeroKicker] = useState(settings?.hero_kicker || "");
	const [heroTitleLine1, setHeroTitleLine1] = useState(settings?.hero_title_line1 || "");
	const [heroTitleLine2, setHeroTitleLine2] = useState(settings?.hero_title_line2 || "");
	const [heroSubtitle, setHeroSubtitle] = useState(settings?.hero_subtitle || "");
	const [storageProvider, setStorageProvider] = useState(settings?.storage_provider || "local");
	const [s3Endpoint, setS3Endpoint] = useState(settings?.s3_endpoint || "");
	const [s3Region, setS3Region] = useState(settings?.s3_region || "");
	const [s3Bucket, setS3Bucket] = useState(settings?.s3_bucket || "");
	const [s3AccessKey, setS3AccessKey] = useState(settings?.s3_access_key || "");
	const [s3SecretKey, setS3SecretKey] = useState(settings?.s3_secret_key || "");
	const [profileName, setProfileName] = useState(user?.name || "");
	const [profileNickname, setProfileNickname] = useState(user?.nickname || "");
	const [profileEmail, setProfileEmail] = useState(user?.email || "");
	const [profileBio, setProfileBio] = useState(user?.bio || "");
	const [profileAvatarUrl, setProfileAvatarUrl] = useState(user?.avatar_url || "");
	const [uploadingAvatar, setUploadingAvatar] = useState(false);
	const avatarInputRef = useRef(null);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	useEffect(() => {
		if (user) {
			setProfileName(user.name || "");
			setProfileNickname(user.nickname || "");
			setProfileBio(user.bio || "");
			setProfileEmail(user.email || "");
			setProfileAvatarUrl(user.avatar_url || "");
		}
	}, [user]);
	const handleLogoUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadingLogo(true);
		try {
			const res = await mediaService.upload(file);
			if (res.success && res.data) {
				setLogoUrl(res.data.url);
				showSuccess("Logo uploaded successfully");
			} else showError("Upload failed");
		} catch (err) {
			showError(err.response?.data?.message || "Failed to upload logo image");
		} finally {
			setUploadingLogo(false);
		}
	};
	const handleAvatarUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadingAvatar(true);
		try {
			const res = await mediaService.upload(file);
			if (res.success && res.data) {
				setProfileAvatarUrl(res.data.url);
				showSuccess("Avatar uploaded successfully");
			} else showError("Upload failed");
		} catch (err) {
			showError(err.response?.data?.message || "Failed to upload avatar image");
		} finally {
			setUploadingAvatar(false);
		}
	};
	const openMediaModal = async () => {
		try {
			const res = await mediaService.list({ limit: 100 });
			if (res.success && res.data) setMediaList(res.data.items || []);
			setShowMediaModal(true);
		} catch (err) {
			console.error(err);
			showError("Failed to fetch media list");
		}
	};
	const handleAddSliderImage = (url) => {
		if (!sliderImages.includes(url)) {
			setSliderImages([...sliderImages, url]);
			showSuccess("Image added to slider list");
		} else showError("This image is already in the slider list");
		setShowMediaModal(false);
	};
	const handleRemoveSliderImage = (url) => {
		setSliderImages(sliderImages.filter((img) => img !== url));
		showSuccess("Image removed from slider list");
	};
	const handleSaveSiteConfig = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await settingsService.update({
				site_name: siteName,
				site_description: siteDescription,
				logo_url: logoUrl,
				comments_enabled: String(commentsEnabled),
				comments_auto_approve: String(commentsAutoApprove),
				slider_images: JSON.stringify(sliderImages),
				footer_copyright: footerCopyright,
				footer_facebook_url: facebookUrl,
				footer_github_url: githubUrl,
				footer_linkedin_url: linkedinUrl,
				footer_twitter_url: twitterUrl,
				theme_primary_color: themePrimaryColor,
				theme_button_bg: themeButtonBg,
				theme_text_color: themeTextColor,
				hero_kicker: heroKicker,
				hero_title_line1: heroTitleLine1,
				hero_title_line2: heroTitleLine2,
				hero_subtitle: heroSubtitle,
				storage_provider: storageProvider,
				s3_endpoint: s3Endpoint,
				s3_region: s3Region,
				s3_bucket: s3Bucket,
				s3_access_key: s3AccessKey,
				s3_secret_key: s3SecretKey
			});
			document.documentElement.style.setProperty("--primary-color", themePrimaryColor);
			document.documentElement.style.setProperty("--btn-bg", themeButtonBg);
			document.documentElement.style.setProperty("--text-color", themeTextColor);
			showSuccess("Site configurations updated successfully");
		} catch (err) {
			showError(err.response?.data?.message || "Failed to update site configurations");
		} finally {
			setLoading(false);
		}
	};
	const handleSaveProfile = async (e) => {
		e.preventDefault();
		if (!profileName.trim()) {
			showError("Name is required");
			return;
		}
		if (!profileEmail.trim()) {
			showError("Email is required");
			return;
		}
		setLoading(true);
		try {
			const res = await profileService.updateProfile({
				name: profileName,
				nickname: profileNickname,
				email: profileEmail,
				avatar_url: profileAvatarUrl,
				bio: profileBio
			});
			if (res.success && res.data) {
				updateUser(res.data);
				showSuccess("Profile updated successfully");
			} else showError("Failed to update profile");
		} catch (err) {
			showError(err.response?.data?.message || "Failed to update profile");
		} finally {
			setLoading(false);
		}
	};
	const handleSavePassword = async (e) => {
		e.preventDefault();
		if (!oldPassword || !newPassword || !confirmPassword) {
			showError("All password fields are required");
			return;
		}
		if (newPassword !== confirmPassword) {
			showError("New password and confirm password do not match");
			return;
		}
		if (newPassword.length < 6) {
			showError("New password must be at least 6 characters long");
			return;
		}
		setLoading(true);
		try {
			await profileService.changePassword({
				old_password: oldPassword,
				new_password: newPassword
			});
			showSuccess("Password updated successfully");
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			showError(err.response?.data?.message || "Failed to change password");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-2xl font-bold tracking-tight text-slate-850 dark:text-white",
					children: "System Settings"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-400",
					children: "Manage site configuration, profile information, and security credentials."
				})] })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "border-b border-slate-200 dark:border-slate-800 flex space-x-8",
				children: [
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("site"),
						className: `flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === "site" ? "border-accentBlue text-accentBlue" : "border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"}`,
						children: [/* @__PURE__ */ jsx(Globe, { className: "w-4 h-4" }), "Site Config"]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("profile"),
						className: `flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === "profile" ? "border-accentBlue text-accentBlue" : "border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"}`,
						children: [/* @__PURE__ */ jsx(User, { className: "w-4 h-4" }), "Profile Info"]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("password"),
						className: `flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === "password" ? "border-accentBlue text-accentBlue" : "border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"}`,
						children: [/* @__PURE__ */ jsx(Key, { className: "w-4 h-4" }), "Change Password"]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 md:p-8 bg-slate-900/30",
				children: /* @__PURE__ */ jsxs(Fragment, { children: [
					activeTab === "site" && /* @__PURE__ */ jsxs("form", {
						onSubmit: handleSaveSiteConfig,
						className: "space-y-6 max-w-2xl",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-700 dark:text-gray-300",
									children: "Site Title"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: siteName,
									onChange: (e) => setSiteName(e.target.value),
									placeholder: "e.g. My Tech Blog",
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-700 dark:text-gray-300",
									children: "Site Description / Tagline"
								}), /* @__PURE__ */ jsx("textarea", {
									value: siteDescription,
									onChange: (e) => setSiteDescription(e.target.value),
									placeholder: "Describe your site for visitors and SEO bots...",
									rows: 4,
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm resize-none"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/50",
								children: [
									/* @__PURE__ */ jsx("h4", {
										className: "text-sm font-semibold text-slate-850 dark:text-gray-250",
										children: "Home Hero Title Banner"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx("label", {
											className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
											children: "Hero Kicker (Top Small Text)"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											value: heroKicker,
											onChange: (e) => setHeroKicker(e.target.value),
											placeholder: "e.g. DevOps VietNam Platform",
											className: "w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx("label", {
												className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
												children: "Title Line 1"
											}), /* @__PURE__ */ jsx("input", {
												type: "text",
												value: heroTitleLine1,
												onChange: (e) => setHeroTitleLine1(e.target.value),
												placeholder: "e.g. Nền tảng kết nối cộng đồng",
												className: "w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
											})]
										}), /* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx("label", {
												className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
												children: "Title Line 2 (Highlighted Gradient)"
											}), /* @__PURE__ */ jsx("input", {
												type: "text",
												value: heroTitleLine2,
												onChange: (e) => setHeroTitleLine2(e.target.value),
												placeholder: "e.g. DevOps, Cloud & SRE tại Việt Nam",
												className: "w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
											})]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx("label", {
											className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
											children: "Hero Subtitle"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											value: heroSubtitle,
											onChange: (e) => setHeroSubtitle(e.target.value),
											placeholder: "e.g. Tìm roadmap, bài viết kỹ thuật, sự kiện...",
											className: "w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-3",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-700 dark:text-gray-300 block",
									children: "Site Logo"
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col sm:flex-row items-start sm:items-center gap-4",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 overflow-hidden flex items-center justify-center relative shrink-0",
										children: [logoUrl ? /* @__PURE__ */ jsx("img", {
											src: getFullUrl(logoUrl),
											alt: "Site logo preview",
											className: "w-full h-full object-contain p-2"
										}) : /* @__PURE__ */ jsx(Image, { className: "w-8 h-8 text-gray-600" }), uploadingLogo && /* @__PURE__ */ jsx("div", {
											className: "absolute inset-0 bg-slate-950/70 flex items-center justify-center",
											children: /* @__PURE__ */ jsx(Loader, { className: "w-5 h-5 animate-spin text-accentBlue" })
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "space-y-3 w-full",
										children: [
											/* @__PURE__ */ jsx("input", {
												type: "text",
												value: logoUrl,
												onChange: (e) => setLogoUrl(e.target.value),
												placeholder: "Or input logo image URL directly...",
												className: "w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
											}),
											/* @__PURE__ */ jsx("input", {
												type: "file",
												accept: "image/*",
												ref: logoInputRef,
												onChange: handleLogoUpload,
												className: "hidden"
											}),
											/* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => logoInputRef.current?.click(),
												disabled: uploadingLogo,
												className: "flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 text-slate-750 dark:text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200",
												children: [/* @__PURE__ */ jsx(Upload, { className: "w-3.5 h-3.5" }), "Upload Logo File"]
											})
										]
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-4 pt-4 border-t border-slate-850",
								children: [
									/* @__PURE__ */ jsx("h4", {
										className: "text-sm font-semibold text-slate-850 dark:text-gray-200",
										children: "Comment Moderation Settings"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between py-2",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium text-slate-750 dark:text-gray-300",
											children: "Enable Comments"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-xs text-gray-500",
											children: "Allow readers to write comments on blog posts."
										})] }), /* @__PURE__ */ jsx("input", {
											type: "checkbox",
											checked: commentsEnabled,
											onChange: (e) => setCommentsEnabled(e.target.checked),
											className: "w-4 h-4 rounded bg-slate-950/60 border border-slate-800 text-accentBlue focus:ring-accentBlue focus:ring-offset-slate-900 focus:ring-offset-2"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between py-2",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-sm font-medium text-slate-750 dark:text-gray-300",
											children: "Auto-Approve Comments"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-xs text-gray-500",
											children: "If checked, comments will be published immediately without moderation."
										})] }), /* @__PURE__ */ jsx("input", {
											type: "checkbox",
											checked: commentsAutoApprove,
											onChange: (e) => setCommentsAutoApprove(e.target.checked),
											className: "w-4 h-4 rounded bg-slate-950/60 border-slate-800 text-accentBlue focus:ring-accentBlue focus:ring-offset-slate-900 focus:ring-offset-2"
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/50",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
										className: "text-sm font-semibold text-slate-850 dark:text-gray-200",
										children: "Home Slider Banner Images"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-gray-500",
										children: "Add or remove images shown on the public landing page slider."
									})] }), /* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: openMediaModal,
										className: "inline-flex items-center gap-1.5 px-3.5 py-2 bg-accentBlue/10 hover:bg-accentBlue/20 text-accentBlue rounded-xl text-xs font-semibold transition-all border border-accentBlue/20",
										children: [/* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }), "Add Slider Image"]
									})]
								}), sliderImages.length === 0 ? /* @__PURE__ */ jsx("div", {
									className: "text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-gray-500",
									children: "No slider images selected. The home page will show the default banner."
								}) : /* @__PURE__ */ jsx("div", {
									className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
									children: sliderImages.map((img) => /* @__PURE__ */ jsxs("div", {
										className: "aspect-video w-full rounded-xl bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden relative group",
										children: [/* @__PURE__ */ jsx("img", {
											src: getFullUrl(img),
											alt: "",
											className: "object-cover w-full h-full"
										}), /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => handleRemoveSliderImage(img),
											className: "absolute top-2 right-2 p-1.5 bg-dangerRed/80 hover:bg-dangerRed text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200",
											title: "Remove image",
											children: /* @__PURE__ */ jsx(Trash, { className: "w-3.5 h-3.5" })
										})]
									}, img))
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/50",
								children: [
									/* @__PURE__ */ jsx("h4", {
										className: "text-sm font-semibold text-slate-850 dark:text-gray-200",
										children: "Footer & Social Network Settings"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx("label", {
											className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
											children: "Copyright Footer Text"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											value: footerCopyright,
											onChange: (e) => setFooterCopyright(e.target.value),
											placeholder: "e.g. © 2026 DevOps.vn. All rights reserved.",
											className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-1 md:grid-cols-2 gap-4",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "Facebook URL"
												}), /* @__PURE__ */ jsx("input", {
													type: "text",
													value: facebookUrl,
													onChange: (e) => setFacebookUrl(e.target.value),
													placeholder: "https://facebook.com/your-page",
													className: "w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "Github URL"
												}), /* @__PURE__ */ jsx("input", {
													type: "text",
													value: githubUrl,
													onChange: (e) => setGithubUrl(e.target.value),
													placeholder: "https://github.com/your-username",
													className: "w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "LinkedIn URL"
												}), /* @__PURE__ */ jsx("input", {
													type: "text",
													value: linkedinUrl,
													onChange: (e) => setLinkedinUrl(e.target.value),
													placeholder: "https://linkedin.com/in/your-profile",
													className: "w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "Twitter URL"
												}), /* @__PURE__ */ jsx("input", {
													type: "text",
													value: twitterUrl,
													onChange: (e) => setTwitterUrl(e.target.value),
													placeholder: "https://twitter.com/your-profile",
													className: "w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
												})]
											})
										]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/50",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h4", {
											className: "text-sm font-semibold text-slate-850 dark:text-gray-200 flex items-center gap-2",
											children: [/* @__PURE__ */ jsx(Palette, { className: "w-4 h-4 text-accentBlue" }), "Theme Background Colors (Light & Dark)"]
										}), /* @__PURE__ */ jsx("p", {
											className: "text-xs text-gray-400 mt-0.5",
											children: "Customize background colors for Light and Dark modes (e.g. Dark Navy #090D16 like thanhnamnguyen.dev)"
										})] }), /* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: resetThemeColors,
											className: "flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 hover:text-accentBlue dark:hover:text-accentBlue transition-colors px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800",
											children: [/* @__PURE__ */ jsx(RefreshCw, { className: "w-3.5 h-3.5" }), "Reset Colors"]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/60",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "space-y-2",
											children: [
												/* @__PURE__ */ jsxs("label", {
													className: "text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between",
													children: [/* @__PURE__ */ jsx("span", { children: "Light Mode Background" }), /* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-gray-400 normal-case",
														children: "Default: #F8FAFC"
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ jsx("input", {
														type: "color",
														value: colors.lightBg,
														onChange: (e) => updateThemeColors({ lightBg: e.target.value }),
														className: "w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent shrink-0"
													}), /* @__PURE__ */ jsx("input", {
														type: "text",
														value: colors.lightBg,
														onChange: (e) => updateThemeColors({ lightBg: e.target.value }),
														className: "w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-xs focus:outline-none uppercase font-mono"
													})]
												}),
												/* @__PURE__ */ jsx("div", {
													className: "flex gap-1.5 pt-1",
													children: [
														{
															name: "Slate Light",
															color: "#F8FAFC"
														},
														{
															name: "Pure White",
															color: "#FFFFFF"
														},
														{
															name: "Warm Cream",
															color: "#FDFBF7"
														}
													].map((preset) => /* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => updateThemeColors({ lightBg: preset.color }),
														className: "px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-gray-400 hover:border-accentBlue",
														children: preset.name
													}, preset.color))
												})
											]
										}), /* @__PURE__ */ jsxs("div", {
											className: "space-y-2",
											children: [
												/* @__PURE__ */ jsxs("label", {
													className: "text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between",
													children: [/* @__PURE__ */ jsx("span", { children: "Dark Mode Background" }), /* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-gray-400 normal-case",
														children: "Target Blog: #090D16"
													})]
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ jsx("input", {
														type: "color",
														value: colors.darkBg,
														onChange: (e) => updateThemeColors({ darkBg: e.target.value }),
														className: "w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent shrink-0"
													}), /* @__PURE__ */ jsx("input", {
														type: "text",
														value: colors.darkBg,
														onChange: (e) => updateThemeColors({ darkBg: e.target.value }),
														className: "w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-xs focus:outline-none uppercase font-mono"
													})]
												}),
												/* @__PURE__ */ jsx("div", {
													className: "flex gap-1.5 pt-1",
													children: [
														{
															name: "Deep Navy",
															color: "#090D16"
														},
														{
															name: "Pure Black",
															color: "#000000"
														},
														{
															name: "Midnight",
															color: "#0F172A"
														}
													].map((preset) => /* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => updateThemeColors({ darkBg: preset.color }),
														className: "px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-gray-400 hover:border-accentBlue",
														children: preset.name
													}, preset.color))
												})
											]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5 flex flex-col",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "Primary Color"
												}), /* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ jsx("input", {
														type: "color",
														value: themePrimaryColor,
														onChange: (e) => setThemePrimaryColor(e.target.value),
														className: "w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent"
													}), /* @__PURE__ */ jsx("input", {
														type: "text",
														value: themePrimaryColor,
														onChange: (e) => setThemePrimaryColor(e.target.value),
														className: "w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-xs focus:outline-none uppercase"
													})]
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5 flex flex-col",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "Button Background"
												}), /* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ jsx("input", {
														type: "color",
														value: themeButtonBg,
														onChange: (e) => setThemeButtonBg(e.target.value),
														className: "w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent"
													}), /* @__PURE__ */ jsx("input", {
														type: "text",
														value: themeButtonBg,
														onChange: (e) => setThemeButtonBg(e.target.value),
														className: "w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-xs focus:outline-none uppercase"
													})]
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5 flex flex-col",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "Primary Text Color"
												}), /* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ jsx("input", {
														type: "color",
														value: themeTextColor,
														onChange: (e) => setThemeTextColor(e.target.value),
														className: "w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent"
													}), /* @__PURE__ */ jsx("input", {
														type: "text",
														value: themeTextColor,
														onChange: (e) => setThemeTextColor(e.target.value),
														className: "w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-xs focus:outline-none uppercase"
													})]
												})]
											})
										]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/50",
								children: [
									/* @__PURE__ */ jsx("h4", {
										className: "text-sm font-semibold text-slate-850 dark:text-gray-200",
										children: "Storage Provider Settings"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xs text-gray-500",
										children: "Configure where files, images, videos, and documents will be saved when uploading media."
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx("label", {
											className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
											children: "Select Storage Driver"
										}), /* @__PURE__ */ jsxs("select", {
											value: storageProvider,
											onChange: (e) => setStorageProvider(e.target.value),
											className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm",
											children: [
												/* @__PURE__ */ jsx("option", {
													value: "local",
													children: "Local Disk (Lưu trữ trên máy chủ)"
												}),
												/* @__PURE__ */ jsx("option", {
													value: "s3",
													children: "AWS S3 (Amazon Web Services)"
												}),
												/* @__PURE__ */ jsx("option", {
													value: "minio",
													children: "MinIO (Self-hosted Storage)"
												}),
												/* @__PURE__ */ jsx("option", {
													value: "cloudfly",
													children: "Cloudfly Object Storage (Vietnam S3)"
												})
											]
										})]
									}),
									storageProvider !== "local" && /* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/85 dark:border-slate-800/60 space-y-2 md:space-y-0",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5 md:col-span-2",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "S3 Endpoint"
												}), /* @__PURE__ */ jsx("input", {
													type: "text",
													value: s3Endpoint,
													onChange: (e) => setS3Endpoint(e.target.value),
													placeholder: "e.g. https://s3.cloudfly.vn or https://s3.amazonaws.com",
													className: "w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 text-sm focus:outline-none focus:border-accentBlue/60 focus:ring-1"
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "S3 Region"
												}), /* @__PURE__ */ jsx("input", {
													type: "text",
													value: s3Region,
													onChange: (e) => setS3Region(e.target.value),
													placeholder: "e.g. HN-01 or us-east-1",
													className: "w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 text-sm focus:outline-none focus:border-accentBlue/60 focus:ring-1"
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "S3 Bucket Name"
												}), /* @__PURE__ */ jsx("input", {
													type: "text",
													value: s3Bucket,
													onChange: (e) => setS3Bucket(e.target.value),
													placeholder: "e.g. my-media-bucket",
													className: "w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 text-sm focus:outline-none focus:border-accentBlue/60 focus:ring-1"
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "Access Key"
												}), /* @__PURE__ */ jsx("input", {
													type: "text",
													value: s3AccessKey,
													onChange: (e) => setS3AccessKey(e.target.value),
													placeholder: "S3 access key ID",
													className: "w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-sm focus:outline-none focus:border-accentBlue/60 focus:ring-1"
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx("label", {
													className: "text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider",
													children: "Secret Key"
												}), /* @__PURE__ */ jsx("input", {
													type: "password",
													value: s3SecretKey,
													onChange: (e) => setS3SecretKey(e.target.value),
													placeholder: "S3 secret access key",
													className: "w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-sm focus:outline-none focus:border-accentBlue/60 focus:ring-1"
												})]
											})
										]
									})
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "pt-4",
								children: /* @__PURE__ */ jsxs("button", {
									type: "submit",
									disabled: loading,
									className: "flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200 disabled:opacity-55",
									children: [loading ? /* @__PURE__ */ jsx(Loader, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }), "Save Configurations"]
								})
							})
						]
					}),
					activeTab === "profile" && /* @__PURE__ */ jsxs("form", {
						onSubmit: handleSaveProfile,
						className: "space-y-6 max-w-2xl",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-750 dark:text-gray-300",
									children: "Name"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: profileName,
									onChange: (e) => setProfileName(e.target.value),
									placeholder: "Your Full Name",
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-750 dark:text-gray-300",
									children: "Nickname (Required)"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: profileNickname,
									onChange: (e) => setProfileNickname(e.target.value),
									placeholder: "Your public nickname...",
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-750 dark:text-gray-300",
									children: "Email Address"
								}), /* @__PURE__ */ jsx("input", {
									type: "email",
									value: profileEmail,
									onChange: (e) => setProfileEmail(e.target.value),
									placeholder: "your.email@example.com",
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-750 dark:text-gray-300",
									children: "Bio"
								}), /* @__PURE__ */ jsx("textarea", {
									value: profileBio,
									onChange: (e) => setProfileBio(e.target.value),
									placeholder: "Write a brief author biography...",
									rows: 4,
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm resize-none"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-3",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-750 dark:text-gray-300 block",
									children: "Profile Avatar"
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col sm:flex-row items-start sm:items-center gap-4",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "w-24 h-24 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950/40 overflow-hidden flex items-center justify-center relative shrink-0",
										children: [profileAvatarUrl ? /* @__PURE__ */ jsx("img", {
											src: getFullUrl(profileAvatarUrl),
											alt: "Avatar preview",
											className: "w-full h-full object-cover"
										}) : /* @__PURE__ */ jsx("span", {
											className: "font-bold text-accentBlue text-2xl",
											children: profileName ? profileName.charAt(0).toUpperCase() : "A"
										}), uploadingAvatar && /* @__PURE__ */ jsx("div", {
											className: "absolute inset-0 bg-slate-950/70 flex items-center justify-center",
											children: /* @__PURE__ */ jsx(Loader, { className: "w-5 h-5 animate-spin text-accentBlue" })
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "space-y-3 w-full",
										children: [
											/* @__PURE__ */ jsx("input", {
												type: "text",
												value: profileAvatarUrl,
												onChange: (e) => setProfileAvatarUrl(e.target.value),
												placeholder: "Or input profile avatar image URL directly...",
												className: "w-full px-4 py-2 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
											}),
											/* @__PURE__ */ jsx("input", {
												type: "file",
												accept: "image/*",
												ref: avatarInputRef,
												onChange: handleAvatarUpload,
												className: "hidden"
											}),
											/* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => avatarInputRef.current?.click(),
												disabled: uploadingAvatar,
												className: "flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 text-slate-750 dark:text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200",
												children: [/* @__PURE__ */ jsx(Upload, { className: "w-3.5 h-3.5" }), "Upload Avatar Image"]
											})
										]
									})]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "pt-4",
								children: /* @__PURE__ */ jsxs("button", {
									type: "submit",
									disabled: loading,
									className: "flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200 disabled:opacity-55",
									children: [loading ? /* @__PURE__ */ jsx(Loader, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }), "Update Profile"]
								})
							})
						]
					}),
					activeTab === "password" && /* @__PURE__ */ jsxs("form", {
						onSubmit: handleSavePassword,
						className: "space-y-6 max-w-2xl",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-750 dark:text-gray-300",
									children: "Existing Password"
								}), /* @__PURE__ */ jsx("input", {
									type: "password",
									value: oldPassword,
									onChange: (e) => setOldPassword(e.target.value),
									placeholder: "Enter old password...",
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-750 dark:text-gray-300",
									children: "New Password"
								}), /* @__PURE__ */ jsx("input", {
									type: "password",
									value: newPassword,
									onChange: (e) => setNewPassword(e.target.value),
									placeholder: "Must be at least 6 characters...",
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "text-sm font-medium text-slate-750 dark:text-gray-300",
									children: "Confirm New Password"
								}), /* @__PURE__ */ jsx("input", {
									type: "password",
									value: confirmPassword,
									onChange: (e) => setConfirmPassword(e.target.value),
									placeholder: "Re-type new password...",
									className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "pt-4",
								children: /* @__PURE__ */ jsxs("button", {
									type: "submit",
									disabled: loading,
									className: "flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200 disabled:opacity-55",
									children: [loading ? /* @__PURE__ */ jsx(Loader, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }), "Update Password"]
								})
							})
						]
					})
				] })
			}),
			showMediaModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50",
				children: /* @__PURE__ */ jsxs("div", {
					className: "glass-panel border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden bg-white dark:bg-slate-900",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "p-5 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center bg-slate-100/30 dark:bg-slate-900/20",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-lg text-slate-850 dark:text-gray-100",
							children: "Select Slider Image"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 font-sans",
							children: "Pick an image from the library to append to the home slider."
						})] }), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setShowMediaModal(false),
							className: "p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/35 dark:hover:border-slate-700 rounded-lg text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-all",
							children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "flex-1 overflow-y-auto p-6",
						children: mediaList.length === 0 ? /* @__PURE__ */ jsxs("div", {
							className: "text-center py-12",
							children: [/* @__PURE__ */ jsx(Image, { className: "w-12 h-12 text-gray-750 mx-auto mb-4" }), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-gray-500 font-sans",
								children: "No processed media files available."
							})]
						}) : /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4",
							children: mediaList.filter((m) => m.type === "image").map((media) => /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => handleAddSliderImage(media.url),
								className: "aspect-square rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-accentBlue overflow-hidden relative hover:scale-105 transition-all flex items-center justify-center group",
								children: [/* @__PURE__ */ jsx("img", {
									src: getFullUrl(media.thumbnail_url || media.url),
									alt: "",
									className: "object-cover w-full h-full"
								}), /* @__PURE__ */ jsx("div", {
									className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white",
									children: "Add to Slider"
								})]
							}, media.id))
						})
					})]
				})
			})
		]
	});
};
var HydrateFallback$4 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", { className: "h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" })] })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "border-b border-slate-200 dark:border-slate-800 flex space-x-8",
				children: [
					/* @__PURE__ */ jsx("div", { className: "h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" }),
					/* @__PURE__ */ jsx("div", { className: "h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" }),
					/* @__PURE__ */ jsx("div", { className: "h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" })
				]
			}),
			/* @__PURE__ */ jsx("div", { className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl h-[600px] animate-pulse bg-slate-200 dark:bg-slate-800/50" })
		]
	});
});
var Settings_default = UNSAFE_withComponentProps(Settings$1);
//#endregion
//#region src/pages/Users.tsx
var Users_exports = /* @__PURE__ */ __exportAll({
	HydrateFallback: () => HydrateFallback$3,
	Users: () => Users$1,
	clientLoader: () => clientLoader$3,
	default: () => Users_default
});
async function clientLoader$3({ request }) {
	const url = new URL(request.url);
	const roleFilter = url.searchParams.get("role") || "";
	const page = parseInt(url.searchParams.get("page") || "1");
	const limit = 10;
	const offset = (page - 1) * limit;
	try {
		const res = await userService.list(offset, limit, roleFilter);
		if (res.success && res.data) return {
			users: res.data.items || [],
			total: res.data.total || 0
		};
	} catch (err) {
		console.error("Failed to retrieve user list", err);
	}
	return {
		users: [],
		total: 0
	};
}
var Users$1 = () => {
	const { user: currentUser } = useAuth();
	const { showSuccess, showError } = useToast();
	const { users, total } = useLoaderData();
	const { revalidate, state } = useRevalidator();
	const loading = useNavigation().state === "loading";
	const [searchParams, setSearchParams] = useSearchParams();
	const roleFilter = searchParams.get("role") || "";
	const currentPage = parseInt(searchParams.get("page") || "1");
	const limit = 10;
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [modalLoading, setModalLoading] = useState(false);
	const [form] = Form.useForm();
	if (currentUser?.role !== "admin") return /* @__PURE__ */ jsxs("div", {
		className: "py-16 text-center max-w-md mx-auto space-y-4",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "w-16 h-16 bg-dangerRed/10 border border-dangerRed/25 rounded-full flex items-center justify-center mx-auto text-dangerRed animate-pulse",
				children: /* @__PURE__ */ jsx(AlertOctagon, { className: "w-8 h-8" })
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "text-xl font-bold text-gray-100",
				children: "Access Denied"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-500 font-sans leading-relaxed",
				children: "You do not have administrative privileges to access user account management. Please contact your system administrator."
			})
		]
	});
	const openCreateModal = () => {
		setEditingUser(null);
		form.resetFields();
		setIsModalOpen(true);
	};
	const openEditModal = (user) => {
		setEditingUser(user);
		form.setFieldsValue({
			name: user.name,
			nickname: user.nickname || "",
			email: user.email,
			role: user.role,
			is_active: user.is_active
		});
		setIsModalOpen(true);
	};
	const handleModalSubmit = async (values) => {
		setModalLoading(true);
		try {
			if (editingUser) {
				await userService.update(editingUser.id, {
					name: values.name,
					nickname: values.nickname,
					role: values.role,
					is_active: values.is_active
				});
				showSuccess("User account updated successfully");
			} else {
				await userService.create({
					name: values.name,
					nickname: values.nickname,
					email: values.email,
					password: values.password,
					role: values.role
				});
				showSuccess("New user account created successfully");
			}
			setIsModalOpen(false);
			revalidate();
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to save user account");
		} finally {
			setModalLoading(false);
		}
	};
	const toggleUserStatus = async (user, checked) => {
		try {
			await userService.update(user.id, {
				name: user.name,
				nickname: user.nickname || "",
				role: user.role,
				is_active: checked
			});
			showSuccess(`Successfully ${checked ? "activated" : "deactivated"} user ${user.name}`);
			revalidate();
		} catch (err) {
			console.error(err);
			showError("Failed to change user status");
		}
	};
	const getInitial = (name) => {
		return name ? name.charAt(0).toUpperCase() : "?";
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight",
					children: "Member Management"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-gray-500 mt-1",
					children: "Manage system administrators, editors, and nickname handles"
				})] }), /* @__PURE__ */ jsx(Button, {
					type: "primary",
					onClick: openCreateModal,
					icon: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
					className: "bg-btn-global hover:brightness-110 border-0 h-10 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-accentBlue/10",
					children: "Add New Member"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-900/30 p-4 space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex justify-between items-center select-none pb-2",
					children: [/* @__PURE__ */ jsx(Select, {
						value: roleFilter,
						onChange: (val) => {
							setSearchParams((prev) => {
								const next = new URLSearchParams(prev);
								if (val) next.set("role", val);
								else next.delete("role");
								next.set("page", "1");
								return next;
							});
						},
						options: [
							{
								label: "All Roles",
								value: ""
							},
							{
								label: "Admin",
								value: "admin"
							},
							{
								label: "Editor",
								value: "editor"
							}
						],
						className: "w-40 h-9"
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xs text-gray-500 font-mono",
						children: ["Total Members: ", total]
					})]
				}), /* @__PURE__ */ jsx(Table, {
					columns: [
						{
							title: "Member",
							dataIndex: "name",
							key: "name",
							render: (_, record) => /* @__PURE__ */ jsxs("div", {
								className: "flex items-center space-x-3 select-none",
								children: [/* @__PURE__ */ jsx(Avatar, {
									src: record.avatar_url ? getFullUrl(record.avatar_url) : void 0,
									className: "bg-slate-800 text-white font-extrabold flex items-center justify-center shrink-0 border border-slate-700 w-9 h-9",
									children: getInitial(record.name)
								}), /* @__PURE__ */ jsxs("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-bold text-sm text-slate-850 dark:text-gray-255 block truncate",
										children: record.name
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-xs text-gray-500 block truncate font-semibold",
										children: [
											"@",
											record.nickname || "no-nick",
											record.id === currentUser.id && /* @__PURE__ */ jsx("span", {
												className: "ml-1 text-[9px] font-black text-accentPurple uppercase tracking-wider",
												children: "(You)"
											})
										]
									})]
								})]
							})
						},
						{
							title: "Email Address",
							dataIndex: "email",
							key: "email",
							render: (text) => /* @__PURE__ */ jsx("span", {
								className: "text-xs text-gray-400 font-medium",
								children: text
							})
						},
						{
							title: "Role",
							dataIndex: "role",
							key: "role",
							width: 140,
							render: (role) => {
								const isAdmin = role === "admin";
								return /* @__PURE__ */ jsx(Tag$1, {
									color: isAdmin ? "blue" : "orange",
									className: "rounded-lg border-0 uppercase font-black tracking-wider text-[9px] px-2.5 py-0.5",
									children: /* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1",
										children: [isAdmin && /* @__PURE__ */ jsx(Shield, { className: "w-2.5 h-2.5" }), isAdmin ? "Admin" : "Editor"]
									})
								});
							}
						},
						{
							title: "Status",
							dataIndex: "is_active",
							key: "is_active",
							width: 140,
							render: (isActive, record) => /* @__PURE__ */ jsx(Tooltip, {
								title: record.id === currentUser.id ? "Cannot deactivate yourself" : "Toggle active status",
								children: /* @__PURE__ */ jsx(Switch, {
									checked: isActive,
									disabled: record.id === currentUser.id,
									onChange: (checked) => toggleUserStatus(record, checked),
									size: "small"
								})
							})
						},
						{
							title: "Actions",
							key: "actions",
							width: 100,
							align: "right",
							render: (_, record) => /* @__PURE__ */ jsx(Tooltip, {
								title: "Edit Member Info",
								children: /* @__PURE__ */ jsx(Button, {
									type: "text",
									icon: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" }),
									onClick: () => openEditModal(record),
									className: "bg-slate-800 hover:bg-slate-700/85 text-gray-300 flex items-center justify-center p-2 rounded-lg border border-slate-750"
								})
							})
						}
					],
					dataSource: users,
					rowKey: "id",
					loading,
					pagination: {
						current: currentPage,
						pageSize: limit,
						total,
						onChange: (page) => {
							setSearchParams((prev) => {
								const next = new URLSearchParams(prev);
								next.set("page", String(page));
								return next;
							});
						},
						showSizeChanger: false,
						className: "select-none"
					},
					className: "border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden bg-transparent"
				})]
			}),
			/* @__PURE__ */ jsx(Modal, {
				title: /* @__PURE__ */ jsx("span", {
					className: "font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2 select-none",
					children: editingUser ? "Edit Member Profile" : "Add New System Member"
				}),
				open: isModalOpen,
				onOk: () => form.submit(),
				onCancel: () => setIsModalOpen(false),
				confirmLoading: modalLoading,
				okText: editingUser ? "Save Changes" : "Create Account",
				cancelText: "Cancel",
				okButtonProps: { className: "rounded-xl font-bold h-9 bg-btn-global border-0 hover:brightness-105" },
				cancelButtonProps: { className: "rounded-xl font-bold h-9" },
				destroyOnClose: true,
				className: "select-none",
				children: /* @__PURE__ */ jsxs(Form, {
					form,
					layout: "vertical",
					onFinish: handleModalSubmit,
					initialValues: {
						role: "editor",
						is_active: true
					},
					requiredMark: false,
					className: "pt-4 space-y-3",
					children: [
						/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "Display Name"
							}),
							name: "name",
							rules: [{
								required: true,
								message: "Please input display name!"
							}],
							children: /* @__PURE__ */ jsx(Input, {
								prefix: /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-gray-500 mr-1 shrink-0" }),
								placeholder: "e.g. John Doe",
								className: "h-10 rounded-xl"
							})
						}),
						/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "Nickname (Required, lowercase without space)"
							}),
							name: "nickname",
							rules: [{
								required: true,
								message: "Please input nickname handle!"
							}, {
								pattern: /^[a-z0-9_.-]+$/,
								message: "Nickname must be lowercase alphanumeric, dashes, dots, or underscores only."
							}],
							children: /* @__PURE__ */ jsx(Input, {
								prefix: /* @__PURE__ */ jsx("span", {
									className: "text-xs text-gray-500 font-bold mr-1 shrink-0",
									children: "@"
								}),
								placeholder: "e.g. johndoe",
								className: "h-10 rounded-xl"
							})
						}),
						!editingUser && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "Email Address"
							}),
							name: "email",
							rules: [{
								required: true,
								message: "Please input email!"
							}, {
								type: "email",
								message: "Please input a valid email!"
							}],
							children: /* @__PURE__ */ jsx(Input, {
								prefix: /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 text-gray-500 mr-1 shrink-0" }),
								placeholder: "name@example.com",
								className: "h-10 rounded-xl"
							})
						}), /* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "Password"
							}),
							name: "password",
							rules: [{
								required: true,
								message: "Please input password!"
							}, {
								min: 6,
								message: "Password must be at least 6 characters!"
							}],
							children: /* @__PURE__ */ jsx(Input.Password, {
								prefix: /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-gray-500 mr-1 shrink-0" }),
								placeholder: "Min 6 characters...",
								className: "h-10 rounded-xl"
							})
						})] }),
						/* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "System Role"
							}),
							name: "role",
							rules: [{ required: true }],
							children: /* @__PURE__ */ jsxs(Select, {
								className: "h-10",
								children: [/* @__PURE__ */ jsx(Select.Option, {
									value: "admin",
									children: "System Administrator"
								}), /* @__PURE__ */ jsx(Select.Option, {
									value: "editor",
									children: "Content Editor"
								})]
							})
						}),
						editingUser && /* @__PURE__ */ jsx(Form.Item, {
							label: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
								children: "Account Active"
							}),
							name: "is_active",
							valuePropName: "checked",
							children: /* @__PURE__ */ jsx(Switch, { size: "small" })
						})
					]
				})
			})
		]
	});
};
var HydrateFallback$3 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", { className: "h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" })] })
		}), /* @__PURE__ */ jsx("div", { className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" })]
	});
});
var Users_default = UNSAFE_withComponentProps(Users$1);
//#endregion
//#region src/pages/AuditLog.tsx
var AuditLog_exports = /* @__PURE__ */ __exportAll({
	AuditLog: () => AuditLog,
	HydrateFallback: () => HydrateFallback$2,
	clientLoader: () => clientLoader$2,
	default: () => AuditLog_default
});
async function clientLoader$2({ request }) {
	const url = new URL(request.url);
	const entityTypeFilter = url.searchParams.get("entity_type") || "";
	const page = parseInt(url.searchParams.get("page") || "1");
	const limit = 15;
	const offset = (page - 1) * limit;
	try {
		const res = await auditService.list({
			offset,
			limit,
			entity_type: entityTypeFilter || void 0
		});
		if (res.success && res.data) return {
			logs: res.data.items || [],
			total: res.data.total || 0
		};
	} catch (err) {
		console.error("Failed to retrieve system audit logs", err);
	}
	return {
		logs: [],
		total: 0
	};
}
var AuditLog = () => {
	const { user: currentUser } = useAuth();
	const { logs, total } = useLoaderData();
	const { revalidate, state } = useRevalidator();
	const loading = useNavigation().state === "loading";
	const [searchParams, setSearchParams] = useSearchParams();
	const entityTypeFilter = searchParams.get("entity_type") || "";
	const page = parseInt(searchParams.get("page") || "1");
	const limit = 15;
	const [viewingLog, setViewingLog] = useState(null);
	if (currentUser?.role !== "admin") return /* @__PURE__ */ jsxs("div", {
		className: "py-16 text-center max-w-md mx-auto space-y-4",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "w-16 h-16 bg-dangerRed/10 border border-dangerRed/25 rounded-full flex items-center justify-center mx-auto text-dangerRed",
				children: /* @__PURE__ */ jsx(AlertOctagon, { className: "w-8 h-8" })
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "text-xl font-bold text-gray-100",
				children: "Access Denied"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-gray-500 font-sans leading-relaxed",
				children: "You do not have administrative privileges to view system audit logs. Please contact your system administrator."
			})
		]
	});
	const getActionIcon = (action) => {
		const act = action.toLowerCase();
		if (act.includes("post")) return FileText;
		if (act.includes("media")) return Image;
		if (act.includes("user")) return User;
		if (act.includes("setting")) return Settings;
		if (act.includes("password") || act.includes("login")) return Key;
		return Activity;
	};
	const getActionBadgeColor = (action) => {
		const act = action.toLowerCase();
		if (act.startsWith("create") || act.includes("attach") || act.includes("add")) return "bg-successGreen/15 border-successGreen/25 text-successGreen";
		if (act.startsWith("update") || act.includes("edit") || act.includes("reorder")) return "bg-warningYellow/15 border-warningYellow/25 text-warningYellow";
		if (act.startsWith("delete") || act.includes("detach") || act.includes("remove") || act.includes("reject")) return "bg-dangerRed/15 border-dangerRed/25 text-dangerRed";
		return "bg-accentBlue/15 border-accentBlue/25 text-accentBlue";
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			viewingLog && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[85vh] animate-scale-up",
					children: [
						/* @__PURE__ */ jsx("button", {
							onClick: () => setViewingLog(null),
							className: "absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all",
							children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
						}),
						/* @__PURE__ */ jsxs("h3", {
							className: "text-base font-bold text-slate-850 dark:text-white mb-4 pr-10",
							children: ["Audit Log Details: ", /* @__PURE__ */ jsxs("span", {
								className: "text-xs font-mono font-normal text-gray-500",
								children: ["#", viewingLog.id]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex-1 overflow-auto bg-slate-950/80 border border-slate-850 p-4 rounded-2xl text-xs font-mono text-gray-300",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-850",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-gray-500 block",
										children: "Performed By:"
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-gray-200",
										children: ["User ID: ", viewingLog.user_id || "System / Public"]
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-gray-500 block",
										children: "IP Address:"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-gray-200",
										children: viewingLog.ip_address || "-"
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-gray-500 block",
										children: "Action / Target:"
									}), /* @__PURE__ */ jsxs("span", {
										className: "text-gray-200",
										children: [
											viewingLog.action,
											" (",
											viewingLog.entity_type || "system",
											")"
										]
									})] }),
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
										className: "text-gray-500 block",
										children: "Timestamp:"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-gray-200",
										children: new Date(viewingLog.created_at).toLocaleString()
									})] })
								]
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-gray-500 block mb-2",
								children: "Payload / State Changes:"
							}), viewingLog.changes ? /* @__PURE__ */ jsx("pre", {
								className: "overflow-x-auto p-3 bg-slate-950 border border-slate-900 rounded-xl leading-relaxed whitespace-pre-wrap max-h-[40vh] text-sky-400",
								children: JSON.stringify(viewingLog.changes, null, 2)
							}) : /* @__PURE__ */ jsx("span", {
								className: "text-gray-600",
								children: "No changes logged for this action."
							})] })]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex justify-end pt-4 mt-2",
							children: /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setViewingLog(null),
								className: "px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 dark:hover:bg-slate-950 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl text-xs font-semibold transition-all",
								children: "Close View"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex justify-between items-center",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent",
					children: "System Audit Log"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500 mt-1",
					children: "Review historical actions, profile edits, posts adjustments, and configuration changes."
				})] })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-800/50 rounded-2xl overflow-hidden",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 border-b border-slate-200 dark:border-slate-800/50 bg-slate-100/30 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex items-center gap-3",
							children: /* @__PURE__ */ jsxs("select", {
								value: entityTypeFilter,
								onChange: (e) => {
									setSearchParams((prev) => {
										const next = new URLSearchParams(prev);
										if (e.target.value) next.set("entity_type", e.target.value);
										else next.delete("entity_type");
										next.set("page", "1");
										return next;
									});
								},
								className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 text-slate-700 dark:text-gray-300 rounded-xl py-2 px-3 outline-none text-xs",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "",
										children: "All Categories"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "post",
										children: "Posts Actions"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "media",
										children: "Media Actions"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "user",
										children: "User Accounts"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "setting",
										children: "System Settings"
									})
								]
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("button", {
								onClick: () => revalidate(),
								className: "p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors",
								title: "Refresh log",
								children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-gray-500",
								children: ["Total logs: ", total]
							})]
						})]
					}),
					loading ? /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center",
						children: [/* @__PURE__ */ jsx(Loader, { className: "w-8 h-8 animate-spin mx-auto text-accentBlue mb-4" }), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-gray-500",
							children: "Loading audit history..."
						})]
					}) : logs.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "p-12 text-center border-dashed border-slate-800 rounded-2xl",
						children: [/* @__PURE__ */ jsx(Activity, { className: "w-12 h-12 text-gray-700 mx-auto mb-4" }), /* @__PURE__ */ jsx("h3", {
							className: "text-lg font-bold text-gray-300",
							children: "No logs found"
						})]
					}) : /* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-left border-collapse",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-slate-800/50 text-xs font-semibold text-gray-400 uppercase bg-slate-900/10",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "p-4 w-[60px] text-center",
										children: "Icon"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4",
										children: "Action"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4",
										children: "Entity Type"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 text-center",
										children: "Entity ID"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4",
										children: "IP Address"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4",
										children: "Timestamp"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "p-4 text-right",
										children: "Details"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-slate-800/30",
								children: logs.map((item) => {
									return /* @__PURE__ */ jsxs("tr", {
										className: "hover:bg-slate-800/10 transition-colors",
										children: [
											/* @__PURE__ */ jsx("td", {
												className: "p-4 w-[60px] text-center",
												children: /* @__PURE__ */ jsx("div", {
													className: "w-8 h-8 rounded-lg border border-slate-800/50 bg-slate-900/50 flex items-center justify-center text-gray-400 mx-auto",
													children: /* @__PURE__ */ jsx(getActionIcon(item.action), { className: "w-4 h-4" })
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4",
												children: /* @__PURE__ */ jsx("span", {
													className: `inline-flex border px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getActionBadgeColor(item.action)}`,
													children: item.action.replace("_", " ")
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4 text-sm text-gray-400 capitalize",
												children: item.entity_type || "-"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4 text-sm text-gray-400 font-mono text-center",
												children: item.entity_id || "-"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4 text-sm text-gray-500 font-mono",
												children: item.ip_address || "-"
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4 text-xs text-gray-500",
												children: new Date(item.created_at).toLocaleString()
											}),
											/* @__PURE__ */ jsx("td", {
												className: "p-4 text-right",
												children: /* @__PURE__ */ jsx("button", {
													onClick: () => setViewingLog(item),
													className: "p-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors",
													title: "View detail JSON",
													children: /* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" })
												})
											})
										]
									}, item.id);
								})
							})]
						})
					}),
					total > limit && /* @__PURE__ */ jsxs("div", {
						className: "p-4 border-t border-slate-800/50 bg-slate-900/10 flex justify-between items-center",
						children: [
							/* @__PURE__ */ jsx("button", {
								disabled: page === 1,
								onClick: () => {
									setSearchParams((prev) => {
										const next = new URLSearchParams(prev);
										next.set("page", String(page - 1));
										return next;
									});
								},
								className: "px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all",
								children: "Previous"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xs text-gray-500 font-medium",
								children: [
									"Page ",
									page,
									" of ",
									Math.ceil(total / limit)
								]
							}),
							/* @__PURE__ */ jsx("button", {
								disabled: page * limit >= total,
								onClick: () => {
									setSearchParams((prev) => {
										const next = new URLSearchParams(prev);
										next.set("page", String(page + 1));
										return next;
									});
								},
								className: "px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 disabled:opacity-40 text-xs font-semibold rounded-xl text-gray-300 transition-all",
								children: "Next"
							})
						]
					})
				]
			})
		]
	});
};
var HydrateFallback$2 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex justify-between items-center",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", { className: "h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-1" })] })
		}), /* @__PURE__ */ jsx("div", { className: "glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl h-[400px] animate-pulse bg-slate-200 dark:bg-slate-800/50" })]
	});
});
var AuditLog_default = UNSAFE_withComponentProps(AuditLog);
//#endregion
//#region src/pages/PostList.tsx
var PostList_exports = /* @__PURE__ */ __exportAll({
	HydrateFallback: () => HydrateFallback$1,
	PostList: () => PostList,
	clientLoader: () => clientLoader$1,
	default: () => PostList_default
});
async function clientLoader$1({ request }) {
	const searchParams = new URL(request.url).searchParams;
	const page = parseInt(searchParams.get("page") || "1");
	const limit = 10;
	const offset = (page - 1) * limit;
	const statusFilter = searchParams.get("status") || "";
	const searchFilter = searchParams.get("search") || "";
	const categoryFilter = searchParams.get("category") ? Number(searchParams.get("category")) : void 0;
	const tagFilter = searchParams.get("tag") ? Number(searchParams.get("tag")) : void 0;
	const showDeleted = searchParams.get("deleted") === "true";
	try {
		const [postsRes, catRes, tagRes] = await Promise.all([
			postService.list(offset, limit, statusFilter, searchFilter, categoryFilter, tagFilter, void 0, showDeleted),
			categoryService.list(),
			tagService.list()
		]);
		return {
			posts: postsRes.data.items || [],
			total: postsRes.data.total || 0,
			categories: catRes.data || [],
			tags: tagRes.data || []
		};
	} catch (err) {
		console.error("Failed to load posts or filters", err);
		return {
			posts: [],
			total: 0,
			categories: [],
			tags: []
		};
	}
}
var PostList = () => {
	const { t } = useLanguage();
	const { showSuccess, showError } = useToast();
	const navigate = useNavigate();
	const { posts, total, categories: allCategories, tags: allTags } = useLoaderData();
	const navigation = useNavigation();
	const loading = navigation.state === "loading";
	const [searchParams, setSearchParams] = useSearchParams();
	const currentPage = parseInt(searchParams.get("page") || "1");
	const statusFilter = searchParams.get("status") || "";
	const categoryFilter = searchParams.get("category") ? Number(searchParams.get("category")) : void 0;
	const tagFilter = searchParams.get("tag") ? Number(searchParams.get("tag")) : void 0;
	const searchQuery = searchParams.get("search") || "";
	const showDeleted = searchParams.get("deleted") === "true";
	const limit = 10;
	const updateFilters = (updates) => {
		const next = new URLSearchParams(searchParams);
		for (const [k, v] of Object.entries(updates)) if (v === null || v === "") next.delete(k);
		else next.set(k, v);
		if (!updates.page) next.set("page", "1");
		setSearchParams(next);
	};
	const [searchInput, setSearchInput] = useState(searchQuery);
	useEffect(() => {
		setSearchInput(searchQuery);
	}, [searchQuery]);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [deletePostId, setDeletePostId] = useState(null);
	const [isForceDelete, setIsForceDelete] = useState(false);
	const [isBulkLoading, setIsBulkLoading] = useState(false);
	const handleBulkAction = async (action) => {
		if (selectedRowKeys.length === 0) return;
		setIsBulkLoading(true);
		try {
			const ids = selectedRowKeys.map((key) => Number(key));
			if (action === "delete") {
				await Promise.all(ids.map((id) => postService.delete(id, false)));
				showSuccess("Selected posts soft-deleted successfully");
			} else {
				await Promise.all(ids.map((id) => postService.update(id, { status: action === "publish" ? "published" : "draft" })));
				showSuccess(`Selected posts status updated to ${action}`);
			}
			setSelectedRowKeys([]);
			navigation.state === "idle" && navigate(0);
		} catch (err) {
			console.error("Bulk action failed", err);
			showError("Failed to complete bulk action");
		} finally {
			setIsBulkLoading(false);
		}
	};
	const handleDeleteConfirm = async () => {
		if (!deletePostId) return;
		try {
			await postService.delete(deletePostId, isForceDelete);
			showSuccess(isForceDelete ? "Post permanently deleted." : "Post soft-deleted successfully.");
			setDeletePostId(null);
			navigation.state === "idle" && navigate(0);
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to delete post");
		}
	};
	const handleRestore = async (id) => {
		try {
			await postService.restore(id);
			showSuccess("Post restored successfully.");
			navigation.state === "idle" && navigate(0);
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to restore post");
		}
	};
	const onSelectChange = (newSelectedRowKeys) => {
		setSelectedRowKeys(newSelectedRowKeys);
	};
	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange
	};
	const columns = [
		{
			title: "Cover",
			dataIndex: "cover_media",
			key: "cover_media",
			width: 80,
			render: (_, record) => {
				const thumb = record.cover_media ? /* @__PURE__ */ jsx("div", {
					className: "w-12 h-12 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800",
					children: /* @__PURE__ */ jsx("img", {
						src: getFullUrl(record.cover_media.thumbnail_url || record.cover_media.url),
						alt: "",
						className: "object-cover w-full h-full"
					})
				}) : /* @__PURE__ */ jsx("div", {
					className: "w-12 h-12 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-center",
					children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 text-gray-650" })
				});
				if (record.is_document) return /* @__PURE__ */ jsx(Badge.Ribbon, {
					text: "PDF",
					color: "red",
					style: {
						fontSize: 9,
						padding: "0 4px"
					},
					children: thumb
				});
				return thumb;
			}
		},
		{
			title: t("table_title"),
			dataIndex: "title",
			key: "title",
			render: (text, record) => /* @__PURE__ */ jsxs("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ jsx("span", {
					className: "font-bold text-slate-850 dark:text-gray-200 block text-[13.5px] hover:text-accentBlue transition-colors",
					children: /* @__PURE__ */ jsx(Link, {
						to: `/admin/posts/edit/${record.id}`,
						children: text
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap gap-2 items-center",
					children: [
						record.is_featured && /* @__PURE__ */ jsxs(Tag$1, {
							color: "gold",
							className: "flex items-center gap-1 border-0 uppercase font-black text-[9px] px-2 py-0.5 tracking-wide",
							children: [/* @__PURE__ */ jsx(Star, { className: "w-2.5 h-2.5 fill-current" }), "Featured"]
						}),
						record.is_document && /* @__PURE__ */ jsxs(Tag$1, {
							color: "red",
							className: "flex items-center gap-1 border-0 uppercase font-black text-[9px] px-2 py-0.5 tracking-wide",
							children: [/* @__PURE__ */ jsx(FileText, { className: "w-2.5 h-2.5" }), "PDF"]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-[10px] text-gray-500 font-mono",
							children: ["views: ", record.view_count || 0]
						}),
						record.deleted_at && /* @__PURE__ */ jsx(Tag$1, {
							color: "error",
							className: "border-0 text-[9px] font-bold px-1.5 py-0",
							children: "Deleted"
						})
					]
				})]
			})
		},
		{
			title: t("table_author"),
			dataIndex: ["author", "name"],
			key: "author",
			width: 140,
			render: (text) => /* @__PURE__ */ jsx("span", {
				className: "text-xs text-gray-500 font-semibold",
				children: text || "-"
			})
		},
		{
			title: t("table_category"),
			dataIndex: "categories",
			key: "categories",
			width: 150,
			render: (_, record) => {
				const cat = record.categories?.[0];
				return cat ? /* @__PURE__ */ jsx(Tag$1, {
					color: "purple",
					className: "rounded-lg border-0 font-bold px-2.5 py-0.5 text-xs",
					children: cat.name
				}) : /* @__PURE__ */ jsx("span", {
					className: "text-gray-500 text-xs",
					children: "-"
				});
			}
		},
		{
			title: t("table_status"),
			dataIndex: "status",
			key: "status",
			width: 120,
			render: (status) => {
				const isPublished = status === "published";
				return /* @__PURE__ */ jsx(Tag$1, {
					color: isPublished ? "success" : "warning",
					className: "rounded-lg border-0 uppercase font-bold tracking-wider px-2 py-0.5 text-[9px]",
					children: isPublished ? "Published" : "Draft"
				});
			}
		},
		{
			title: t("table_actions"),
			key: "actions",
			width: 130,
			align: "right",
			render: (_, record) => {
				if (record.deleted_at) return /* @__PURE__ */ jsxs(Space, {
					size: "small",
					children: [/* @__PURE__ */ jsx(Tooltip, {
						title: "Restore Post",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							icon: /* @__PURE__ */ jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
							onClick: () => handleRestore(record.id),
							className: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center p-2 rounded-lg border border-emerald-500/20"
						})
					}), /* @__PURE__ */ jsx(Tooltip, {
						title: "Force Delete Permanently",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							danger: true,
							icon: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5" }),
							onClick: () => {
								setIsForceDelete(true);
								setDeletePostId(record.id);
							},
							className: "bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center p-2 rounded-lg border border-red-500/20"
						})
					})]
				});
				return /* @__PURE__ */ jsxs(Space, {
					size: "middle",
					children: [/* @__PURE__ */ jsx(Tooltip, {
						title: "Edit Post",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							icon: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" }),
							onClick: () => navigate(`/admin/posts/edit/${record.id}`),
							className: "bg-slate-800 hover:bg-slate-700/80 text-gray-300 flex items-center justify-center p-2 rounded-lg border border-slate-750"
						})
					}), /* @__PURE__ */ jsx(Tooltip, {
						title: "Delete Post",
						children: /* @__PURE__ */ jsx(Button, {
							type: "text",
							danger: true,
							icon: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }),
							onClick: () => {
								setIsForceDelete(false);
								setDeletePostId(record.id);
							},
							className: "bg-dangerRed/10 hover:bg-dangerRed/20 text-dangerRed flex items-center justify-center p-2 rounded-lg border border-dangerRed/20"
						})
					})]
				});
			}
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight",
					children: t("posts_management")
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-gray-500 mt-1",
					children: t("posts_management_desc")
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 bg-white/40 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-xl px-4 py-2 w-fit",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs font-semibold text-slate-700 dark:text-gray-300",
							children: t("show_deleted")
						}), /* @__PURE__ */ jsx(Switch, {
							checked: showDeleted,
							onChange: (checked) => updateFilters({ deleted: checked ? "true" : null }),
							size: "small"
						})]
					}), /* @__PURE__ */ jsxs(Link, {
						to: "/admin/posts/new",
						className: "inline-flex items-center gap-1.5 px-4 py-2.5 bg-btn-global hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-accentBlue/10 select-none",
						children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: t("create_new_post") })]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-900/30 p-4 space-y-4",
				children: [
					selectedRowKeys.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "bg-slate-900/60 border border-slate-800/50 p-3.5 rounded-xl flex items-center justify-between animate-fade-in z-20",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center space-x-3 select-none",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-xs bg-accentBlue/15 border border-accentBlue/25 text-accentBlue px-2.5 py-1 rounded-full font-semibold",
								children: [
									selectedRowKeys.length,
									" ",
									t("selected")
								]
							}), /* @__PURE__ */ jsx(Button, {
								type: "text",
								size: "small",
								onClick: () => setSelectedRowKeys([]),
								className: "text-xs text-gray-400 hover:text-white font-medium",
								children: t("clear")
							})]
						}), /* @__PURE__ */ jsxs(Space, { children: [
							/* @__PURE__ */ jsx(Button, {
								loading: isBulkLoading,
								onClick: () => handleBulkAction("publish"),
								className: "bg-slate-850 hover:bg-slate-800 border-slate-800 text-successGreen hover:text-successGreen text-xs h-9 rounded-xl font-bold",
								children: t("filter_published")
							}),
							/* @__PURE__ */ jsx(Button, {
								loading: isBulkLoading,
								onClick: () => handleBulkAction("draft"),
								className: "bg-slate-850 hover:bg-slate-800 border-slate-800 text-warningYellow hover:text-warningYellow text-xs h-9 rounded-xl font-bold",
								children: t("filter_draft")
							}),
							/* @__PURE__ */ jsx(Button, {
								danger: true,
								loading: isBulkLoading,
								onClick: () => handleBulkAction("delete"),
								className: "bg-dangerRed/10 border-dangerRed/20 text-dangerRed text-xs h-9 rounded-xl font-bold",
								children: t("bulk_delete")
							})
						] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-3",
							children: [
								/* @__PURE__ */ jsx(Select, {
									value: statusFilter,
									onChange: (val) => updateFilters({ status: val }),
									options: [
										{
											label: t("filter_all"),
											value: ""
										},
										{
											label: t("filter_published"),
											value: "published"
										},
										{
											label: t("filter_draft"),
											value: "draft"
										}
									],
									className: "w-36 h-9 rounded-xl"
								}),
								/* @__PURE__ */ jsx(Select, {
									placeholder: t("all_categories"),
									allowClear: true,
									value: categoryFilter,
									onChange: (val) => updateFilters({ category: val ? String(val) : null }),
									className: "w-44 h-9",
									children: allCategories.map((cat) => /* @__PURE__ */ jsx(Select.Option, {
										value: cat.id,
										children: cat.name
									}, cat.id))
								}),
								/* @__PURE__ */ jsx(Select, {
									placeholder: t("all_tags"),
									allowClear: true,
									value: tagFilter,
									onChange: (val) => updateFilters({ tag: val ? String(val) : null }),
									className: "w-40 h-9",
									children: allTags.map((tag) => /* @__PURE__ */ jsx(Select.Option, {
										value: tag.id,
										children: tag.name
									}, tag.id))
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 w-full lg:w-auto",
							children: [/* @__PURE__ */ jsx(Input, {
								placeholder: t("search_posts_placeholder"),
								prefix: /* @__PURE__ */ jsx(Search, { className: "w-3.5 h-3.5 text-gray-500 mr-1" }),
								value: searchInput,
								onChange: (e) => setSearchInput(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter") updateFilters({ search: searchInput || null });
								},
								className: "w-full lg:w-64 h-9 rounded-xl"
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-gray-500 shrink-0 font-mono",
								children: [
									t("total"),
									": ",
									total
								]
							})]
						})]
					}),
					/* @__PURE__ */ jsx(Table, {
						rowSelection,
						columns,
						dataSource: posts,
						rowKey: "id",
						loading,
						pagination: {
							current: currentPage,
							pageSize: limit,
							total,
							onChange: (page) => updateFilters({ page: String(page) }),
							showSizeChanger: false,
							className: "select-none"
						},
						className: "border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden bg-transparent"
					})
				]
			}),
			/* @__PURE__ */ jsx(Modal, {
				title: /* @__PURE__ */ jsxs("span", {
					className: "font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2 select-none",
					children: [/* @__PURE__ */ jsx(Trash2, { className: "w-5 h-5 text-dangerRed" }), isForceDelete ? t("delete_permanent_title") : t("delete_soft_title")]
				}),
				open: deletePostId !== null,
				onOk: handleDeleteConfirm,
				onCancel: () => setDeletePostId(null),
				okText: isForceDelete ? t("force_delete") : t("delete"),
				cancelText: t("cancel"),
				okButtonProps: {
					danger: true,
					className: "rounded-xl font-bold h-9"
				},
				cancelButtonProps: { className: "rounded-xl font-bold h-9" },
				className: "select-none",
				children: /* @__PURE__ */ jsx("p", {
					className: "text-sm text-gray-500 mt-3 mb-2 font-medium leading-relaxed select-text",
					children: isForceDelete ? t("delete_permanent_msg") : t("delete_soft_msg")
				})
			})
		]
	});
};
var HydrateFallback$1 = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx("div", {
			className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", { className: "h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mt-2" })] })
		}), /* @__PURE__ */ jsx("div", {
			className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 space-y-4",
			children: /* @__PURE__ */ jsx("div", { className: "h-[400px] bg-slate-200 dark:bg-slate-800/50 rounded-xl animate-pulse" })
		})]
	});
});
var PostList_default = UNSAFE_withComponentProps(PostList);
//#endregion
//#region src/components/RichTextEditor.tsx
var RichTextEditor = ({ value, onChange }) => {
	const [showMediaModal, setShowMediaModal] = useState(false);
	const [showLinkModal, setShowLinkModal] = useState(false);
	const [mediaList, setMediaList] = useState([]);
	const [linkUrl, setLinkUrl] = useState("");
	const editor = useEditor({
		extensions: [
			StarterKit,
			ImageExtension,
			LinkExtension.configure({
				openOnClick: false,
				HTMLAttributes: { class: "text-accentBlue underline cursor-pointer" }
			})
		],
		content: value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: { attributes: { class: "w-full bg-slate-900 focus:outline-none min-h-[350px] px-4 py-3 leading-relaxed text-gray-100 placeholder-gray-600" } }
	});
	React.useEffect(() => {
		if (editor && editor.getHTML() !== value) editor.commands.setContent(value);
	}, [value, editor]);
	if (!editor) return null;
	const openMediaModal = async () => {
		setShowMediaModal(true);
		try {
			const res = await mediaService.list();
			setMediaList((res.data || []).filter((m) => m.status === "completed"));
		} catch (err) {
			console.error("Failed to load media list", err);
		}
	};
	const selectMedia = (media) => {
		editor.chain().focus().setImage({ src: getFullUrl(media.url) }).run();
		setShowMediaModal(false);
	};
	const openLinkModal = () => {
		const previousUrl = editor.getAttributes("link").href;
		setLinkUrl(previousUrl || "");
		setShowLinkModal(true);
	};
	const setLink = () => {
		if (linkUrl === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
		else editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
		setShowLinkModal(false);
		setLinkUrl("");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "border border-slate-800 rounded-xl overflow-hidden bg-slate-900 focus-within:ring-1 focus-within:ring-accentBlue/50 focus-within:border-accentBlue/50 transition-all",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap gap-1 p-2 bg-slate-950 border-b border-slate-800/80",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("heading", { level: 1 }) ? "bg-slate-800 text-white" : ""}`,
						title: "Heading 1",
						children: /* @__PURE__ */ jsx(Heading1, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("heading", { level: 2 }) ? "bg-slate-800 text-white" : ""}`,
						title: "Heading 2",
						children: /* @__PURE__ */ jsx(Heading2, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("heading", { level: 3 }) ? "bg-slate-800 text-white" : ""}`,
						title: "Heading 3",
						children: /* @__PURE__ */ jsx(Heading3, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-slate-800 my-auto mx-1" }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleBold().run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("bold") ? "bg-slate-800 text-white" : ""}`,
						title: "Bold",
						children: /* @__PURE__ */ jsx(Bold, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleItalic().run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("italic") ? "bg-slate-800 text-white" : ""}`,
						title: "Italic",
						children: /* @__PURE__ */ jsx(Italic, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-slate-800 my-auto mx-1" }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleBulletList().run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("bulletList") ? "bg-slate-800 text-white" : ""}`,
						title: "Bullet List",
						children: /* @__PURE__ */ jsx(List, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleOrderedList().run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("orderedList") ? "bg-slate-800 text-white" : ""}`,
						title: "Ordered List",
						children: /* @__PURE__ */ jsx(ListOrdered, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-slate-800 my-auto mx-1" }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().toggleBlockquote().run(),
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("blockquote") ? "bg-slate-800 text-white" : ""}`,
						title: "Blockquote",
						children: /* @__PURE__ */ jsx(Quote, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: openLinkModal,
						className: `p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200 ${editor.isActive("link") ? "bg-slate-800 text-white" : ""}`,
						title: "Insert Link",
						children: /* @__PURE__ */ jsx(Link$1, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().setHorizontalRule().run(),
						className: "p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200",
						title: "Horizontal Rule",
						children: /* @__PURE__ */ jsx(Minus, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: openMediaModal,
						className: "p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200",
						title: "Insert Image",
						children: /* @__PURE__ */ jsx(Image, { className: "w-4 h-4" })
					}),
					/* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-slate-800 my-auto mx-1" }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
						className: "p-2 rounded-lg transition-colors hover:bg-slate-800 text-gray-400 hover:text-gray-200",
						title: "Clear Formatting",
						children: /* @__PURE__ */ jsx(Eraser, { className: "w-4 h-4" })
					})
				]
			}),
			/* @__PURE__ */ jsx(EditorContent, {
				editor,
				className: "editor-content"
			}),
			showMediaModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn",
				children: /* @__PURE__ */ jsxs("div", {
					className: "glass-panel border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "p-5 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center bg-slate-100/30 dark:bg-slate-900/20",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-lg text-slate-850 dark:text-gray-100",
							children: "Insert Image"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 font-sans",
							children: "Pick an image from the library to insert into content."
						})] }), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setShowMediaModal(false),
							className: "p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/35 dark:hover:border-slate-700 rounded-lg text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-all",
							children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "flex-1 overflow-y-auto p-6",
						children: mediaList.length === 0 ? /* @__PURE__ */ jsxs("div", {
							className: "text-center py-12",
							children: [/* @__PURE__ */ jsx(Image, { className: "w-12 h-12 text-gray-700 mx-auto mb-4" }), /* @__PURE__ */ jsx("p", {
								className: "text-sm text-gray-500 font-sans",
								children: "No processed media files available."
							})]
						}) : /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4",
							children: mediaList.map((media) => /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => selectMedia(media),
								className: "aspect-square rounded-xl bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-700 overflow-hidden relative hover:scale-105 transition-all flex items-center justify-center group",
								children: [/* @__PURE__ */ jsx("img", {
									src: getFullUrl(media.thumbnail_url || media.url),
									alt: "",
									className: "object-cover w-full h-full"
								}), /* @__PURE__ */ jsx("div", {
									className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white",
									children: "Insert"
								})]
							}, media.id))
						})
					})]
				})
			}),
			showLinkModal && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50",
				children: /* @__PURE__ */ jsxs("div", {
					className: "glass-panel border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-lg text-slate-850 dark:text-gray-100",
							children: "Set URL Link"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-gray-500 mt-1 font-sans",
							children: "Enter the web address for this hyperlink."
						})] }),
						/* @__PURE__ */ jsx("input", {
							type: "text",
							placeholder: "https://example.com",
							value: linkUrl,
							onChange: (e) => setLinkUrl(e.target.value),
							className: "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue/50 focus:ring-1 focus:ring-accentBlue/50 text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 rounded-xl py-3 px-4 outline-none transition-all"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-end space-x-3 pt-2",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setShowLinkModal(false),
								className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-700 dark:text-gray-300 font-medium transition-all",
								children: "Cancel"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: setLink,
								className: "px-4 py-2 bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 text-white font-medium rounded-xl text-sm transition-all",
								children: "Insert Link"
							})]
						})
					]
				})
			})
		]
	});
};
//#endregion
//#region src/components/GalleryUploader.tsx
var GalleryUploader = ({ postId }) => {
	const [gallery, setGallery] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [deleteMediaId, setDeleteMediaId] = useState(null);
	const { showSuccess, showError } = useToast();
	const [draggedIndex, setDraggedIndex] = useState(null);
	const [editedItems, setEditedItems] = useState({});
	const [savingItemIds, setSavingItemIds] = useState({});
	const [pickerOpen, setPickerOpen] = useState(false);
	const [allMedia, setAllMedia] = useState([]);
	const [pickerLoading, setPickerLoading] = useState(false);
	const [pickerType, setPickerType] = useState("all");
	const [pickerPage, setPickerPage] = useState(1);
	const [pickerTotal, setPickerTotal] = useState(0);
	const [pickerSearch, setPickerSearch] = useState("");
	const [selectedMediaIds, setSelectedMediaIds] = useState([]);
	const [uploadingInPicker, setUploadingInPicker] = useState(false);
	const pickerLimit = 12;
	const pickerTotalPages = Math.ceil(pickerTotal / pickerLimit);
	const fileInputRef = useRef(null);
	const fetchGallery = async () => {
		setLoading(true);
		try {
			const response = await postService.getGallery(postId);
			setGallery(response.data || []);
			setError(null);
		} catch (err) {
			console.error("Failed to load post gallery", err);
			setError("Could not load gallery items.");
		} finally {
			setLoading(false);
		}
	};
	const fetchPickerMedia = async () => {
		setPickerLoading(true);
		try {
			const response = await mediaService.list({
				type: pickerType === "all" ? "" : pickerType,
				page: pickerPage,
				limit: pickerLimit
			});
			if (response.data && "items" in response.data) {
				setAllMedia(response.data.items || []);
				setPickerTotal(response.data.total || 0);
			} else {
				const list = response.data || [];
				setAllMedia(list);
				setPickerTotal(list.length);
			}
		} catch (err) {
			console.error("Failed to load picker media", err);
		} finally {
			setPickerLoading(false);
		}
	};
	useEffect(() => {
		if (postId) fetchGallery();
	}, [postId]);
	useEffect(() => {
		if (pickerOpen) fetchPickerMedia();
	}, [
		pickerOpen,
		pickerType,
		pickerPage
	]);
	const handleDragStart = (e, index) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};
	const handleDrop = async (e, targetIndex) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === targetIndex) return;
		const updatedGallery = [...gallery];
		const [draggedItem] = updatedGallery.splice(draggedIndex, 1);
		updatedGallery.splice(targetIndex, 0, draggedItem);
		setGallery(updatedGallery);
		setDraggedIndex(null);
		try {
			const reorderPayload = updatedGallery.map((item, idx) => ({
				media_id: item.media_id,
				sort_order: idx + 1
			}));
			await postService.reorderGallery(postId, reorderPayload);
		} catch (err) {
			console.error("Failed to reorder gallery", err);
			showError("Failed to reorder gallery. Refreshing list.");
			fetchGallery();
		}
	};
	const confirmDetach = async () => {
		if (deleteMediaId === null) return;
		try {
			await postService.detachMedia(postId, deleteMediaId);
			setGallery(gallery.filter((g) => g.media_id !== deleteMediaId));
			showSuccess("Media removed from gallery.");
		} catch (err) {
			console.error("Failed to detach media", err);
			showError("Failed to remove media.");
		} finally {
			setDeleteMediaId(null);
		}
	};
	const handleDetach = (mediaId) => {
		setDeleteMediaId(mediaId);
	};
	const handleFieldChange = (itemId, field, value) => {
		const item = gallery.find((g) => g.id === itemId);
		if (!item) return;
		const current = editedItems[itemId] || {
			caption: item.caption || "",
			alt_text: item.alt_text || ""
		};
		setEditedItems({
			...editedItems,
			[itemId]: {
				...current,
				[field]: value
			}
		});
	};
	const handleSaveDetails = async (item) => {
		const edits = editedItems[item.id];
		if (!edits) return;
		setSavingItemIds((prev) => ({
			...prev,
			[item.id]: true
		}));
		try {
			await postService.attachMedia(postId, {
				media_id: item.media_id,
				caption: edits.caption,
				alt_text: edits.alt_text
			});
			const updatedEdits = { ...editedItems };
			delete updatedEdits[item.id];
			setEditedItems(updatedEdits);
			const response = await postService.getGallery(postId);
			setGallery(response.data || []);
			showSuccess("Gallery details saved successfully.");
		} catch (err) {
			console.error("Failed to save media details", err);
			showError("Failed to save changes.");
		} finally {
			setSavingItemIds((prev) => ({
				...prev,
				[item.id]: false
			}));
		}
	};
	const togglePickerSelection = (mediaId) => {
		setSelectedMediaIds((prev) => prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]);
	};
	const handleAttachSelected = async () => {
		if (selectedMediaIds.length === 0) return;
		setPickerLoading(true);
		try {
			for (const mediaId of selectedMediaIds) await postService.attachMedia(postId, { media_id: mediaId });
			setSelectedMediaIds([]);
			setPickerOpen(false);
			await fetchGallery();
			showSuccess("Media attached to post.");
		} catch (err) {
			console.error("Failed to attach selected media", err);
			showError("Failed to attach media to post.");
		} finally {
			setPickerLoading(false);
		}
	};
	const handlePickerUploadClick = () => {
		fileInputRef.current?.click();
	};
	const handlePickerFileChange = async (e) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		setUploadingInPicker(true);
		try {
			for (let i = 0; i < files.length; i++) {
				const response = await mediaService.upload(files[i]);
				if (response.data) await postService.attachMedia(postId, { media_id: response.data.id });
			}
			await fetchGallery();
			setPickerOpen(false);
			showSuccess("Files uploaded and attached to gallery.");
		} catch (err) {
			console.error("Upload & attach in picker failed", err);
			showError("Failed to upload file.");
		} finally {
			setUploadingInPicker(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};
	const formatBytes = (bytes) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = [
			"Bytes",
			"KB",
			"MB"
		];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	};
	const filteredMediaList = allMedia.filter((m) => m.file_name.toLowerCase().includes(pickerSearch.toLowerCase()));
	return /* @__PURE__ */ jsxs("div", {
		className: "bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6",
		children: [
			/* @__PURE__ */ jsx(ConfirmModal, {
				isOpen: deleteMediaId !== null,
				title: "Remove Media from Gallery",
				message: "Are you sure you want to remove this media from the gallery? The post will not show it anymore, but the file remains in the Media Library.",
				onConfirm: confirmDetach,
				onCancel: () => setDeleteMediaId(null)
			}),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
				className: "text-base font-bold text-gray-100",
				children: "Post Gallery"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-xs text-gray-400 mt-1",
				children: "Attach media files, write captions & alt texts, and drag to change display order."
			})] }),
			error && /* @__PURE__ */ jsx("div", {
				className: "bg-dangerRed/10 border border-dangerRed/30 text-dangerRed p-4 rounded-xl text-sm flex items-center gap-2",
				children: /* @__PURE__ */ jsx("span", { children: error })
			}),
			loading ? /* @__PURE__ */ jsx("div", {
				className: "flex items-center justify-center py-12",
				children: /* @__PURE__ */ jsx(Loader, { className: "w-8 h-8 text-accentBlue animate-spin" })
			}) : /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6",
				children: [gallery.map((item, index) => {
					const media = item.media;
					if (!media) return null;
					const localEdits = editedItems[item.id] || {
						caption: item.caption || "",
						alt_text: item.alt_text || ""
					};
					const hasChanges = localEdits.caption !== (item.caption || "") || localEdits.alt_text !== (item.alt_text || "");
					const isSaving = savingItemIds[item.id] || false;
					return /* @__PURE__ */ jsxs("div", {
						draggable: true,
						onDragStart: (e) => handleDragStart(e, index),
						onDragOver: (e) => e.preventDefault(),
						onDrop: (e) => handleDrop(e, index),
						className: `group bg-slate-50 dark:bg-slate-950/40 border border-slate-250 dark:border-slate-850 rounded-xl overflow-hidden flex flex-col relative transition-all duration-200 ${draggedIndex === index ? "opacity-40 scale-95 border-accentBlue" : ""}`,
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "absolute top-2 left-2 cursor-grab active:cursor-grabbing p-1 bg-white dark:bg-slate-900/90 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100 z-10",
								children: /* @__PURE__ */ jsx(GripVertical, { className: "w-3.5 h-3.5" })
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: (e) => {
									e.preventDefault();
									handleDetach(item.media_id);
								},
								className: "absolute top-2 right-2 p-1 bg-dangerRed/80 hover:bg-dangerRed text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md",
								title: "Remove from gallery",
								children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "aspect-video bg-black flex items-center justify-center relative select-none",
								children: [
									/* @__PURE__ */ jsx("img", {
										src: getFullUrl(media.thumbnail_url || media.url),
										alt: media.file_name,
										className: "object-cover w-full h-full",
										onError: (e) => {
											e.target.src = "https://placehold.co/600x400/0f172a/94a3b8?text=Image";
										}
									}),
									media.type === "video" && /* @__PURE__ */ jsx("div", {
										className: "absolute inset-0 bg-black/40 flex items-center justify-center",
										children: /* @__PURE__ */ jsx(Film, { className: "w-8 h-8 text-accentBlue" })
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-slate-700",
										children: ["Order: ", item.sort_order]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-4 space-y-3 flex-1 flex flex-col justify-between",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "space-y-3",
									children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("span", {
										className: "text-[10px] text-slate-500 dark:text-gray-400 uppercase tracking-widest block font-bold truncate mb-1",
										children: [
											media.file_name,
											" (",
											formatBytes(media.file_size),
											")"
										]
									}) }), /* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-[10px] font-semibold text-slate-500 dark:text-gray-400 block mb-1",
											children: "Caption"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											value: localEdits.caption,
											onChange: (e) => handleFieldChange(item.id, "caption", e.target.value),
											placeholder: "Short description...",
											className: "w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue rounded px-2.5 py-1.5 text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none"
										})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
											className: "text-[10px] font-semibold text-slate-500 dark:text-gray-400 block mb-1",
											children: "Alt Text"
										}), /* @__PURE__ */ jsx("input", {
											type: "text",
											value: localEdits.alt_text,
											onChange: (e) => handleFieldChange(item.id, "alt_text", e.target.value),
											placeholder: "Screen reader alt...",
											className: "w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-accentBlue rounded px-2.5 py-1.5 text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none"
										})] })]
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: "pt-2 flex justify-end",
									children: hasChanges && /* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: (e) => {
											e.preventDefault();
											handleSaveDetails(item);
										},
										disabled: isSaving,
										className: "flex items-center gap-1 bg-successGreen hover:bg-successGreen/90 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded transition-all",
										children: [isSaving ? /* @__PURE__ */ jsx(Loader, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Save Details" })]
									})
								})]
							})
						]
					}, item.id);
				}), /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setPickerOpen(true),
					className: "border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-accentBlue/50 hover:bg-accentBlue/5 rounded-xl aspect-video flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 hover:text-accentBlue transition-all cursor-pointer min-h-[220px]",
					children: [/* @__PURE__ */ jsx("div", {
						className: "p-3 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-2",
						children: /* @__PURE__ */ jsx(Plus, { className: "w-6 h-6" })
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs font-semibold",
						children: "Add Media File"
					})]
				})]
			}),
			pickerOpen && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-slate-850 dark:text-gray-200",
								children: "Select Media files"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-gray-500 mt-0.5",
								children: "Choose files from media library or upload new files."
							})] }), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: (e) => {
									e.preventDefault();
									setPickerOpen(false);
									setSelectedMediaIds([]);
								},
								className: "text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors",
								children: /* @__PURE__ */ jsx(X, { className: "w-6 h-6" })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-950/20 flex flex-wrap items-center justify-between gap-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "relative",
									children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ jsx("input", {
										type: "text",
										placeholder: "Search by name...",
										value: pickerSearch,
										onChange: (e) => setPickerSearch(e.target.value),
										className: "pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-850 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-650 focus:outline-none focus:border-accentBlue w-48"
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 border border-slate-200 dark:border-slate-800 text-xs",
									children: [
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => {
												setPickerType("all");
												setPickerPage(1);
											},
											className: `px-3 py-1.5 rounded-lg ${pickerType === "all" ? "bg-white dark:bg-slate-800 text-accentBlue dark:text-white font-medium shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-850"}`,
											children: "All"
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => {
												setPickerType("image");
												setPickerPage(1);
											},
											className: `px-3 py-1.5 rounded-lg flex items-center gap-1 ${pickerType === "image" ? "bg-white dark:bg-slate-800 text-accentBlue dark:text-white font-medium shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-850"}`,
											children: [/* @__PURE__ */ jsx(Image, { className: "w-3 h-3" }), "Images"]
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => {
												setPickerType("video");
												setPickerPage(1);
											},
											className: `px-3 py-1.5 rounded-lg flex items-center gap-1 ${pickerType === "video" ? "bg-white dark:bg-slate-800 text-accentBlue dark:text-white font-medium shadow-sm" : "text-slate-500 dark:text-gray-400 hover:text-slate-850"}`,
											children: [/* @__PURE__ */ jsx(Film, { className: "w-3 h-3" }), "Videos"]
										})
									]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: handlePickerUploadClick,
									disabled: uploadingInPicker,
									className: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-50",
									children: [uploadingInPicker ? /* @__PURE__ */ jsx(Loader, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Upload new" })]
								}), /* @__PURE__ */ jsx("input", {
									type: "file",
									ref: fileInputRef,
									onChange: handlePickerFileChange,
									accept: "image/*,video/mp4,video/webm",
									multiple: true,
									className: "hidden"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 flex-1 overflow-y-auto min-h-[300px]",
							children: [pickerLoading ? /* @__PURE__ */ jsx("div", {
								className: "flex items-center justify-center py-24",
								children: /* @__PURE__ */ jsx(Loader, { className: "w-8 h-8 text-accentBlue animate-spin" })
							}) : filteredMediaList.length === 0 ? /* @__PURE__ */ jsx("div", {
								className: "text-center py-24 text-gray-500",
								children: "No media assets found in library."
							}) : /* @__PURE__ */ jsx("div", {
								className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4",
								children: filteredMediaList.map((media) => {
									const isSelected = selectedMediaIds.includes(media.id);
									const isProcessing = media.status === "processing";
									return /* @__PURE__ */ jsxs("div", {
										onClick: () => !isProcessing && togglePickerSelection(media.id),
										className: `group border rounded-xl overflow-hidden aspect-square relative bg-slate-950 flex flex-col cursor-pointer transition-all ${isSelected ? "border-accentBlue ring-2 ring-accentBlue/30 scale-95" : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"}`,
										children: [isProcessing ? /* @__PURE__ */ jsxs("div", {
											className: "flex-1 flex flex-col items-center justify-center p-2 text-center",
											children: [/* @__PURE__ */ jsx(Loader, { className: "w-6 h-6 text-accentBlue animate-spin mb-1" }), /* @__PURE__ */ jsx("span", {
												className: "text-[8px] text-gray-500 uppercase tracking-widest font-semibold",
												children: "Wait..."
											})]
										}) : /* @__PURE__ */ jsxs("div", {
											className: "flex-1 relative overflow-hidden flex items-center justify-center",
											children: [
												/* @__PURE__ */ jsx("img", {
													src: getFullUrl(media.thumbnail_url || media.url),
													alt: media.file_name,
													className: "object-cover w-full h-full",
													onError: (e) => {
														e.target.src = "https://placehold.co/150/0f172a/94a3b8?text=File";
													}
												}),
												media.type === "video" && /* @__PURE__ */ jsx("div", {
													className: "absolute inset-0 bg-black/35 flex items-center justify-center",
													children: /* @__PURE__ */ jsx(Play, { className: "w-5 h-5 fill-current text-white" })
												}),
												isSelected && /* @__PURE__ */ jsx("div", {
													className: "absolute top-1.5 right-1.5 bg-accentBlue text-white rounded-full p-1 shadow-md",
													children: /* @__PURE__ */ jsx(Check, { className: "w-3 h-3" })
												}),
												/* @__PURE__ */ jsx("span", {
													className: "absolute bottom-1 left-1 px-1 py-0.5 rounded text-[7px] font-bold uppercase bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-gray-300 border border-slate-250 dark:border-slate-700",
													children: media.type
												})
											]
										}), /* @__PURE__ */ jsx("div", {
											className: "p-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-550 dark:text-gray-400 truncate text-center font-medium",
											children: media.file_name
										})]
									}, media.id);
								})
							}), pickerTotalPages > 1 && /* @__PURE__ */ jsxs("div", {
								className: "flex justify-center gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/60",
								children: [
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setPickerPage((p) => Math.max(p - 1, 1)),
										disabled: pickerPage === 1,
										className: "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-xs font-semibold rounded-lg dark:hover:bg-slate-750 disabled:opacity-50 transition-colors",
										children: "Previous"
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "text-xs text-slate-500 dark:text-gray-400 self-center",
										children: [
											"Page ",
											pickerPage,
											" of ",
											pickerTotalPages
										]
									}),
									/* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => setPickerPage((p) => Math.min(p + 1, pickerTotalPages)),
										disabled: pickerPage === pickerTotalPages,
										className: "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-xs font-semibold rounded-lg dark:hover:bg-slate-750 disabled:opacity-50 transition-colors",
										children: "Next"
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/40 flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-xs text-slate-500",
								children: [selectedMediaIds.length, " item(s) selected"]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => {
										setPickerOpen(false);
										setSelectedMediaIds([]);
									},
									className: "px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-650 hover:text-slate-850 dark:text-gray-300 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors",
									children: "Cancel"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: (e) => {
										e.preventDefault();
										handleAttachSelected();
									},
									disabled: selectedMediaIds.length === 0,
									className: "px-4 py-2 bg-gradient-to-r from-accentBlue to-accentPurple text-white text-xs font-semibold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-md shadow-accentBlue/10",
									children: "Add to Gallery"
								})]
							})]
						})
					]
				})
			})
		]
	});
};
//#endregion
//#region src/pages/PostEditor.tsx
var PostEditor_exports = /* @__PURE__ */ __exportAll({
	HydrateFallback: () => HydrateFallback,
	PostEditor: () => PostEditor,
	clientLoader: () => clientLoader,
	default: () => PostEditor_default
});
async function clientLoader({ params }) {
	const isEdit = !!params.id;
	try {
		const [catRes, tagRes, postRes] = await Promise.all([
			categoryService.list(),
			tagService.list(),
			isEdit ? postService.detail(Number(params.id)) : Promise.resolve({ data: null })
		]);
		return {
			categories: catRes.data || [],
			tags: tagRes.data || [],
			post: postRes.data
		};
	} catch (err) {
		console.error("Failed to load data", err);
		return {
			categories: [],
			tags: [],
			post: null,
			error: true
		};
	}
}
var PostEditor = () => {
	const { t } = useLanguage();
	const { id } = useParams();
	const isEdit = !!id;
	const navigate = useNavigate();
	const { showSuccess, showError } = useToast();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [showMediaModal, setShowMediaModal] = useState(false);
	const [mediaTarget, setMediaTarget] = useState(null);
	const [mediaList, setMediaList] = useState([]);
	const [selectedCover, setSelectedCover] = useState(null);
	const [selectedPDF, setSelectedPDF] = useState(null);
	const { categories, tags, post } = useLoaderData();
	useNavigation().state;
	const [allCategories, setAllCategories] = useState(categories || []);
	const [allTags, setAllTags] = useState(tags || []);
	const [titleVal, setTitleVal] = useState(post?.title || "");
	const [slugVal, setSlugVal] = useState(post?.slug || "");
	const [excerptVal, setExcerptVal] = useState(post?.excerpt || "");
	const [metaTitleVal, setMetaTitleVal] = useState(post?.meta_title || "");
	const [metaDescVal, setMetaDescVal] = useState(post?.meta_desc || "");
	const [isDocVal, setIsDocVal] = useState(post?.is_document || false);
	const [translating, setTranslating] = useState(false);
	const [translateProgressText, setTranslateProgressText] = useState("");
	const [aiModalVisible, setAiModalVisible] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [aiTopic, setAiTopic] = useState("");
	const [summarizing, setSummarizing] = useState(false);
	const [extracting, setExtracting] = useState(false);
	const [scoringSEO, setScoringSEO] = useState(false);
	const [seoScore, setSeoScore] = useState(null);
	const [seoGrade, setSeoGrade] = useState("");
	const [seoSuggestions, setSeoSuggestions] = useState([]);
	const translateText = async (text, targetLang) => {
		if (!text || !text.trim()) return "";
		const res = await translateService.translate({
			content: text,
			target_lang: targetLang
		});
		if (!res.success || !res.data) throw new Error(res.message || "Translation failed");
		const result = res.data;
		if (result.job_id) {
			const jobId = result.job_id;
			return new Promise((resolve, reject) => {
				const interval = setInterval(async () => {
					try {
						const pollRes = await translateService.pollJob(jobId);
						if (pollRes.success && pollRes.data) {
							if (pollRes.data.status === "done") {
								clearInterval(interval);
								resolve(pollRes.data.translated_text || "");
							} else if (pollRes.data.status === "failed") {
								clearInterval(interval);
								reject(new Error(pollRes.data.error || "Async translation job failed"));
							}
						}
					} catch (err) {}
				}, 2e3);
			});
		}
		return result.translated_text;
	};
	const handleAutoTranslate = async () => {
		const values = form.getFieldsValue();
		const titleVi = values.title;
		const excerptVi = values.excerpt;
		const contentVi = values.content;
		if (!titleVi && !excerptVi && !contentVi) {
			showError(t("fill_fields") || "Vui lòng nhập nội dung Tiếng Việt trước khi dịch.");
			return;
		}
		setTranslating(true);
		try {
			if (titleVi) {
				setTranslateProgressText(t("table_title") || "Tiêu đề");
				const titleEn = await translateText(titleVi, "en");
				form.setFieldsValue({ title_en: titleEn });
			}
			if (excerptVi) {
				setTranslateProgressText(t("editor_excerpt_label") || "Tóm tắt");
				const excerptEn = await translateText(excerptVi, "en");
				form.setFieldsValue({ excerpt_en: excerptEn });
			}
			if (contentVi) {
				setTranslateProgressText(t("editor_content_label") || "Nội dung");
				const contentEn = await translateText(contentVi, "en");
				form.setFieldsValue({ content_en: contentEn });
			}
			showSuccess(t("editor_translate_success") || "Đã dịch tự động sang Tiếng Anh thành công!");
		} catch (err) {
			console.error(err);
			showError((t("editor_translate_error") || "Gặp lỗi khi dịch tự động: ") + (err.message || err.toString()));
		} finally {
			setTranslating(false);
			setTranslateProgressText("");
		}
	};
	const handleAIGenerate = async () => {
		if (!aiTopic.trim()) {
			showError("Vui lòng nhập chủ đề bài viết!");
			return;
		}
		setGenerating(true);
		try {
			const res = await aiService.generatePost(aiTopic);
			if (res.success && res.data) {
				const postData = res.data;
				form.setFieldsValue({
					title: postData.title_vi,
					title_en: postData.title_en,
					content: postData.content_vi,
					content_en: postData.content_en,
					meta_title: postData.meta_title_vi,
					meta_desc: postData.meta_desc_vi,
					excerpt: postData.excerpt_vi,
					excerpt_en: postData.excerpt_en
				});
				setTitleVal(postData.title_vi);
				setExcerptVal(postData.excerpt_vi);
				setMetaTitleVal(postData.meta_title_vi);
				setMetaDescVal(postData.meta_desc_vi);
				if (postData.suggested_tags && postData.suggested_tags.length > 0) {
					const matchedTagIds = [];
					postData.suggested_tags.forEach((tagName) => {
						const matched = allTags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
						if (matched) matchedTagIds.push(matched.id);
					});
					if (matchedTagIds.length > 0) form.setFieldsValue({ tag_ids: matchedTagIds });
				}
				showSuccess("Tạo bài viết nháp thành công bằng AI!");
				setAiModalVisible(false);
				setAiTopic("");
			} else showError(res.message || "Không thể tạo bài viết.");
		} catch (err) {
			console.error(err);
			showError("Gặp lỗi khi tạo bài viết bằng AI: " + (err.response?.data?.message || err.message || err.toString()));
		} finally {
			setGenerating(false);
		}
	};
	const handleAISummarize = async () => {
		const contentVi = form.getFieldsValue().content;
		if (!contentVi || !contentVi.trim()) {
			showError("Cần có nội dung Tiếng Việt để tóm tắt!");
			return;
		}
		setSummarizing(true);
		try {
			const res = await aiService.summarize(contentVi, "both");
			if (res.success && res.data) {
				form.setFieldsValue({
					excerpt: res.data.summary,
					excerpt_en: res.data.summary_en || ""
				});
				setExcerptVal(res.data.summary);
				showSuccess("Đã tóm tắt nội dung bằng AI thành công!");
			} else showError(res.message || "Không thể tóm tắt nội dung.");
		} catch (err) {
			console.error(err);
			showError("Gặp lỗi khi tóm tắt: " + (err.response?.data?.message || err.message || err.toString()));
		} finally {
			setSummarizing(false);
		}
	};
	const handleExtractKeywords = async () => {
		const content = form.getFieldValue("content");
		if (!content) {
			showError("Please write some content first to extract keywords.");
			return;
		}
		setExtracting(true);
		try {
			const res = await aiService.extractKeywords(content, "vi");
			if (res.success && res.data) {
				const keywords = res.data.keywords;
				const matchedTagIds = [];
				keywords.forEach((tagName) => {
					const matched = allTags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
					if (matched) matchedTagIds.push(matched.id);
				});
				const currentTagIds = form.getFieldValue("tag_ids") || [];
				form.setFieldsValue({ tag_ids: Array.from(/* @__PURE__ */ new Set([...currentTagIds, ...matchedTagIds])) });
				showSuccess("Keywords extracted successfully!");
			}
		} catch (err) {
			console.error(err);
			showError("Failed to extract keywords.");
		} finally {
			setExtracting(false);
		}
	};
	const handleScoreSEO = async () => {
		const title = form.getFieldValue("title") || "";
		const metaDesc = form.getFieldValue("meta_desc") || "";
		const content = form.getFieldValue("content") || "";
		setScoringSEO(true);
		try {
			const res = await aiService.scoreSEO(title, metaDesc, content);
			if (res.success && res.data) {
				setSeoScore(res.data.score);
				setSeoGrade(res.data.grade);
				setSeoSuggestions(res.data.suggestions || []);
			}
		} catch (err) {
			console.error(err);
			showError("Failed to score SEO.");
		} finally {
			setScoringSEO(false);
		}
	};
	useEffect(() => {
		if (isEdit && post) {
			form.setFieldsValue({
				title: post.title,
				title_en: post.title_en || "",
				slug: post.slug,
				slug_en: post.slug_en || "",
				excerpt: post.excerpt || "",
				excerpt_en: post.excerpt_en || "",
				content: post.content || "",
				content_en: post.content_en || "",
				status: post.status,
				cover_media_id: post.cover_media_id || void 0,
				is_featured: post.is_featured || false,
				is_document: post.is_document || false,
				pdf_media_id: post.pdf_media_id || void 0,
				meta_title: post.meta_title || "",
				meta_desc: post.meta_desc || "",
				published_at: post.published_at ? dayjs(post.published_at) : null,
				category_ids: post.categories?.map((c) => c.id) || [],
				tag_ids: post.tags?.map((t) => t.id) || []
			});
			if (post.cover_media) setSelectedCover(post.cover_media);
			if (post.pdf_media) setSelectedPDF(post.pdf_media);
		}
	}, [
		isEdit,
		post,
		form
	]);
	const loadMedia = async () => {
		try {
			const res = await mediaService.list({ limit: 100 });
			setMediaList(res.data?.items || res.data || []);
		} catch (err) {
			console.error(err);
		}
	};
	const openMediaPicker = (target) => {
		setMediaTarget(target);
		loadMedia();
		setShowMediaModal(true);
	};
	const handleSelectMedia = (media) => {
		if (mediaTarget === "cover") {
			setSelectedCover(media);
			form.setFieldsValue({ cover_media_id: media.id });
		} else if (mediaTarget === "pdf") {
			setSelectedPDF(media);
			form.setFieldsValue({ pdf_media_id: media.id });
		}
		setShowMediaModal(false);
		setMediaTarget(null);
	};
	const removeMedia = (target) => {
		if (target === "cover") {
			setSelectedCover(null);
			form.setFieldsValue({ cover_media_id: void 0 });
		} else if (target === "pdf") {
			setSelectedPDF(null);
			form.setFieldsValue({ pdf_media_id: void 0 });
		}
	};
	const onFinish = async (values) => {
		setLoading(true);
		const payload = {
			...values,
			published_at: values.published_at ? values.published_at.toISOString() : null,
			cover_media_id: values.cover_media_id || null,
			pdf_media_id: values.pdf_media_id || null
		};
		try {
			if (isEdit) {
				await postService.update(Number(id), payload);
				showSuccess("Post updated successfully.");
			} else {
				await postService.create(payload);
				showSuccess("Post created successfully.");
			}
			navigate("/admin/posts");
		} catch (err) {
			console.error(err);
			showError(err.response?.data?.message || "Failed to save post.");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-5 select-none",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-3",
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/admin/posts",
						className: "p-2 rounded-lg bg-slate-900/60 hover:bg-slate-950 text-gray-400 hover:text-white border border-slate-800 transition-colors",
						children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
						className: "text-xl font-black text-slate-900 dark:text-white tracking-tight",
						children: isEdit ? t("editor_edit_title") : t("editor_create_title")
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-500 mt-1",
						children: "Viết, tối ưu hóa SEO và quản lý các loại bài đăng."
					})] })]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex items-center space-x-3",
					children: /* @__PURE__ */ jsx(Button, {
						type: "primary",
						onClick: () => setAiModalVisible(true),
						icon: /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
						className: "bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 border-0 rounded-xl flex items-center gap-1.5 h-10 text-sm font-bold shadow-md shadow-accentBlue/10",
						children: "Generate with AI"
					})
				})]
			}),
			/* @__PURE__ */ jsx(Form, {
				form,
				layout: "vertical",
				onFinish,
				requiredMark: false,
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-2 space-y-6",
						children: [
							/* @__PURE__ */ jsx(Card, {
								className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
								children: /* @__PURE__ */ jsxs(Tabs, {
									defaultActiveKey: "vi",
									className: "border-b border-slate-200 dark:border-slate-800/60 mb-4",
									children: [/* @__PURE__ */ jsx(Tabs.TabPane, {
										tab: t("editor_vietnamese_tab"),
										children: /* @__PURE__ */ jsxs("div", {
											className: "space-y-4 pt-2",
											children: [
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsx("span", {
														className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
														children: t("editor_title_vi")
													}),
													name: "title",
													rules: [{
														required: true,
														message: "Please input Vietnamese title!"
													}],
													children: /* @__PURE__ */ jsx(Input, {
														placeholder: "Nhập tiêu đề tiếng Việt...",
														className: "h-10 rounded-xl",
														onChange: (e) => setTitleVal(e.target.value)
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsxs("div", {
														className: "flex flex-col",
														children: [/* @__PURE__ */ jsx("span", {
															className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
															children: t("editor_slug_vi")
														}), /* @__PURE__ */ jsx("span", {
															className: "text-[10px] text-gray-500 font-normal",
															children: "Tự động tạo từ tiêu đề nếu để trống"
														})]
													}),
													name: "slug",
													children: /* @__PURE__ */ jsx(Input, {
														placeholder: "e.g. kien-truc-microservices",
														className: "h-10 rounded-xl font-mono text-sm",
														onChange: (e) => setSlugVal(e.target.value)
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsxs("div", {
														className: "flex justify-between items-center w-full",
														children: [/* @__PURE__ */ jsx("span", {
															className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
															children: t("editor_excerpt_vi")
														}), /* @__PURE__ */ jsx(Button, {
															type: "text",
															size: "small",
															loading: summarizing,
															onClick: handleAISummarize,
															icon: /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5 text-accentBlue" }),
															className: "text-accentBlue hover:text-accentPurple text-xs flex items-center gap-1 p-0 h-auto font-bold",
															children: "AI Summarize"
														})]
													}),
													name: "excerpt",
													children: /* @__PURE__ */ jsx(Input.TextArea, {
														rows: 2,
														placeholder: "Tóm tắt ngắn hiển thị tại trang chủ...",
														className: "rounded-xl resize-none text-sm",
														onChange: (e) => setExcerptVal(e.target.value)
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsx("span", {
														className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
														children: t("editor_content_vi")
													}),
													name: "content",
													children: /* @__PURE__ */ jsx(RichTextEditor, {
														value: form.getFieldValue("content") || "",
														onChange: (val) => form.setFieldsValue({ content: val })
													})
												})
											]
										})
									}, "vi"), /* @__PURE__ */ jsx(Tabs.TabPane, {
										tab: t("editor_english_tab"),
										children: /* @__PURE__ */ jsxs("div", {
											className: "space-y-4 pt-2",
											children: [
												/* @__PURE__ */ jsx("div", {
													className: "flex justify-end mb-2",
													children: /* @__PURE__ */ jsx(Button, {
														type: "dashed",
														loading: translating,
														onClick: handleAutoTranslate,
														icon: /* @__PURE__ */ jsx(Languages, { className: "w-4 h-4" }),
														className: "border-accentBlue text-accentBlue hover:text-accentBlue/80 hover:border-accentBlue/80 rounded-xl flex items-center gap-1.5",
														children: translating ? `${t("editor_translating")} (${translateProgressText})...` : t("editor_auto_translate")
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsx("span", {
														className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
														children: t("editor_title_en")
													}),
													name: "title_en",
													children: /* @__PURE__ */ jsx(Input, {
														placeholder: "Enter English title...",
														className: "h-10 rounded-xl"
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsxs("div", {
														className: "flex flex-col",
														children: [/* @__PURE__ */ jsx("span", {
															className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
															children: t("editor_slug_en")
														}), /* @__PURE__ */ jsx("span", {
															className: "text-[10px] text-gray-500 font-normal",
															children: "Auto-generated from EN title if left empty"
														})]
													}),
													name: "slug_en",
													children: /* @__PURE__ */ jsx(Input, {
														placeholder: "e.g. microservices-architecture",
														className: "h-10 rounded-xl font-mono text-sm"
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsx("span", {
														className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
														children: t("editor_excerpt_en")
													}),
													name: "excerpt_en",
													children: /* @__PURE__ */ jsx(Input.TextArea, {
														rows: 2,
														placeholder: "English summary...",
														className: "rounded-xl resize-none text-sm"
													})
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													label: /* @__PURE__ */ jsx("span", {
														className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
														children: t("editor_content_en")
													}),
													name: "content_en",
													children: /* @__PURE__ */ jsx(RichTextEditor, {
														value: form.getFieldValue("content_en") || "",
														onChange: (val) => form.setFieldsValue({ content_en: val })
													})
												})
											]
										})
									}, "en")]
								})
							}),
							isEdit && /* @__PURE__ */ jsxs(Card, {
								className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-sm font-bold text-gray-400 uppercase tracking-wider mb-4",
									children: "Post Gallery Images"
								}), /* @__PURE__ */ jsx(GalleryUploader, { postId: Number(id) })]
							}),
							/* @__PURE__ */ jsx(Collapse, {
								ghost: true,
								expandIconPosition: "end",
								children: /* @__PURE__ */ jsx(Collapse.Panel, {
									header: /* @__PURE__ */ jsx("span", {
										className: "text-xs font-black text-slate-700 dark:text-gray-400 uppercase tracking-wider select-none",
										children: t("editor_seo_title")
									}),
									className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 mb-4 px-2",
									children: /* @__PURE__ */ jsxs("div", {
										className: "space-y-4 pt-3 select-none",
										children: [
											/* @__PURE__ */ jsx(Form.Item, {
												label: /* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
													children: "Meta Title"
												}),
												name: "meta_title",
												children: /* @__PURE__ */ jsx(Input, {
													placeholder: "Title for Google search...",
													className: "h-10 rounded-xl",
													onChange: (e) => setMetaTitleVal(e.target.value)
												})
											}),
											/* @__PURE__ */ jsx(Form.Item, {
												label: /* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
													children: "Meta Description"
												}),
												name: "meta_desc",
												children: /* @__PURE__ */ jsx(Input.TextArea, {
													rows: 3,
													placeholder: "Description snippet for Google search...",
													className: "rounded-xl resize-none text-sm",
													onChange: (e) => setMetaDescVal(e.target.value)
												})
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950/40",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500 uppercase tracking-widest font-black block mb-2",
													children: t("editor_google_preview")
												}), /* @__PURE__ */ jsxs("div", {
													className: "space-y-1",
													children: [
														/* @__PURE__ */ jsx("span", {
															className: "text-blue-500 dark:text-blue-400 text-sm font-semibold hover:underline block truncate",
															children: metaTitleVal || titleVal || "Google Search Display Title"
														}),
														/* @__PURE__ */ jsxs("span", {
															className: "text-green-600 dark:text-green-500 text-xs block truncate",
															children: ["https://blog.engine/posts/", slugVal || "example-slug"]
														}),
														/* @__PURE__ */ jsx("span", {
															className: "text-gray-500 text-xs block leading-relaxed line-clamp-2",
															children: metaDescVal || excerptVal || "This snippet will appear under the title in search engine results. Enter meta description to optimize it."
														})
													]
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950/40",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "flex justify-between items-center mb-3",
													children: [/* @__PURE__ */ jsx("span", {
														className: "text-[10px] text-gray-500 uppercase tracking-widest font-black block",
														children: "SEO Score AI"
													}), /* @__PURE__ */ jsx(Button, {
														size: "small",
														loading: scoringSEO,
														onClick: handleScoreSEO,
														icon: /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5" }),
														className: "bg-accentPurple/10 text-accentPurple border-0 text-xs font-bold hover:bg-accentPurple/20 flex items-center gap-1.5",
														children: "Analyze SEO"
													})]
												}), seoScore !== null && /* @__PURE__ */ jsxs("div", {
													className: "space-y-3",
													children: [/* @__PURE__ */ jsxs("div", {
														className: "flex items-center gap-3",
														children: [/* @__PURE__ */ jsxs("div", {
															className: `text-2xl font-black ${seoScore >= 80 ? "text-green-500" : seoScore >= 50 ? "text-yellow-500" : "text-red-500"}`,
															children: [seoScore, "/100"]
														}), /* @__PURE__ */ jsxs("div", {
															className: `px-2 py-0.5 rounded text-xs font-bold ${seoScore >= 80 ? "bg-green-500/10 text-green-500" : seoScore >= 50 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}`,
															children: ["Grade ", seoGrade]
														})]
													}), seoSuggestions.length > 0 && /* @__PURE__ */ jsx("ul", {
														className: "text-xs text-gray-500 space-y-1 list-disc pl-4",
														children: seoSuggestions.map((s, i) => /* @__PURE__ */ jsx("li", { children: s }, i))
													})]
												})]
											})
										]
									})
								}, "seo")
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-6 select-none",
						children: [
							/* @__PURE__ */ jsxs(Card, {
								className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2",
									children: t("editor_publish_settings")
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: t("table_status")
											}),
											name: "status",
											children: /* @__PURE__ */ jsx(Select, {
												options: [{
													label: t("filter_published") || "Published",
													value: "published"
												}, {
													label: t("filter_draft") || "Draft",
													value: "draft"
												}],
												className: "h-10 rounded-xl"
											})
										}),
										/* @__PURE__ */ jsx(Form.Item, {
											label: /* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: t("editor_schedule_label")
											}),
											name: "published_at",
											children: /* @__PURE__ */ jsx(DatePicker, {
												showTime: true,
												className: "w-full h-10 rounded-xl"
											})
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-slate-800 dark:text-gray-200",
													children: t("editor_featured_label")
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500 font-normal",
													children: "Show on the main landing slider"
												})]
											}), /* @__PURE__ */ jsx(Form.Item, {
												name: "is_featured",
												valuePropName: "checked",
												className: "mb-0",
												children: /* @__PURE__ */ jsx(Switch, {})
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-slate-800 dark:text-gray-200",
													children: t("editor_is_pdf")
												}), /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500 font-normal",
													children: "Attach a PDF file as document"
												})]
											}), /* @__PURE__ */ jsx(Form.Item, {
												name: "is_document",
												valuePropName: "checked",
												className: "mb-0",
												children: /* @__PURE__ */ jsx(Switch, { onChange: setIsDocVal })
											})]
										}),
										isDocVal && /* @__PURE__ */ jsxs("div", {
											className: "border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 animate-fade-in",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
													children: t("editor_pdf_attached")
												}),
												/* @__PURE__ */ jsx(Form.Item, {
													name: "pdf_media_id",
													className: "hidden",
													children: /* @__PURE__ */ jsx(Input, {})
												}),
												selectedPDF ? /* @__PURE__ */ jsxs("div", {
													className: "flex items-center justify-between bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl",
													children: [/* @__PURE__ */ jsxs("div", {
														className: "flex items-center gap-2 text-red-500 truncate mr-2",
														children: [/* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ jsx("span", {
															className: "text-xs truncate font-bold",
															children: selectedPDF.file_name
														})]
													}), /* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => removeMedia("pdf"),
														className: "text-red-500 hover:text-red-750 p-1 hover:bg-red-500/10 rounded",
														children: /* @__PURE__ */ jsx(Trash, { className: "w-3.5 h-3.5" })
													})]
												}) : /* @__PURE__ */ jsxs(Button, {
													type: "dashed",
													onClick: () => openMediaPicker("pdf"),
													className: "w-full h-12 flex items-center justify-center gap-1.5 border-dashed border-red-500/35 hover:border-red-500 text-red-500 font-bold rounded-xl",
													children: [/* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }), t("editor_select_pdf")]
												})
											]
										})
									]
								})]
							}),
							/* @__PURE__ */ jsxs(Card, {
								className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
								children: [
									/* @__PURE__ */ jsx("h3", {
										className: "text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2",
										children: t("editor_cover_label")
									}),
									/* @__PURE__ */ jsx(Form.Item, {
										name: "cover_media_id",
										className: "hidden",
										children: /* @__PURE__ */ jsx(Input, {})
									}),
									selectedCover ? /* @__PURE__ */ jsx("div", {
										className: "space-y-2",
										children: /* @__PURE__ */ jsxs("div", {
											className: "w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group",
											children: [/* @__PURE__ */ jsx("img", {
												src: getFullUrl(selectedCover.url),
												alt: "Cover preview",
												className: "w-full h-full object-cover"
											}), /* @__PURE__ */ jsx("div", {
												className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
												children: /* @__PURE__ */ jsx(Button, {
													type: "text",
													danger: true,
													icon: /* @__PURE__ */ jsx(Trash, { className: "w-4 h-4" }),
													onClick: () => removeMedia("cover"),
													className: "bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/30 rounded-xl",
													children: t("editor_remove_cover")
												})
											})]
										})
									}) : /* @__PURE__ */ jsxs(Button, {
										type: "dashed",
										onClick: () => openMediaPicker("cover"),
										className: "w-full aspect-[16/10] flex flex-col items-center justify-center gap-2 border-dashed border-slate-700/60 text-gray-400 hover:text-white rounded-xl",
										children: [/* @__PURE__ */ jsx(Image, { className: "w-6 h-6 text-gray-500" }), /* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold",
											children: t("editor_pick_cover")
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs(Card, {
								className: "glass-panel border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white/40 dark:bg-slate-900/30 p-4",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2",
									children: t("editor_taxonomy")
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ jsx(Form.Item, {
										label: /* @__PURE__ */ jsx("span", {
											className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
											children: t("categories")
										}),
										name: "category_ids",
										children: /* @__PURE__ */ jsx(Select, {
											mode: "multiple",
											placeholder: "Select Categories",
											options: allCategories.map((c) => ({
												value: c.id,
												label: c.name
											})),
											className: "w-full rounded-xl",
											popupClassName: "dark:bg-slate-900 border dark:border-slate-850"
										})
									}), /* @__PURE__ */ jsx(Form.Item, {
										label: /* @__PURE__ */ jsxs("div", {
											className: "flex justify-between items-center w-full",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs font-bold text-gray-400 uppercase tracking-wider",
												children: t("tags")
											}), /* @__PURE__ */ jsx(Button, {
												type: "text",
												size: "small",
												loading: extracting,
												onClick: handleExtractKeywords,
												icon: /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5 text-accentPurple" }),
												className: "text-accentPurple hover:text-accentPurple/80 text-xs flex items-center gap-1 p-0 h-auto font-bold",
												children: "Extract"
											})]
										}),
										name: "tag_ids",
										children: /* @__PURE__ */ jsx(Select, {
											mode: "multiple",
											placeholder: "Select or Create Tags",
											options: allTags.map((t) => ({
												value: t.id,
												label: t.name
											})),
											onSearch: () => {},
											className: "w-full rounded-xl",
											popupClassName: "dark:bg-slate-900 border dark:border-slate-850",
											onDeselect: () => {},
											onSelect: () => {},
											dropdownRender: (menu) => /* @__PURE__ */ jsxs("div", { children: [menu, /* @__PURE__ */ jsx("div", {
												className: "border-t border-slate-200 dark:border-slate-800/60 p-2 flex items-center justify-between",
												children: /* @__PURE__ */ jsx("span", {
													className: "text-[10px] text-gray-500",
													children: "Type in tag search input to create tags directly"
												})
											})] })
										})
									})]
								})]
							}),
							/* @__PURE__ */ jsx(Button, {
								type: "primary",
								htmlType: "submit",
								loading,
								icon: /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
								className: "w-full bg-btn-global hover:brightness-110 border-0 h-11 rounded-xl font-bold flex items-center justify-center gap-1.5 text-white shadow-lg shadow-accentBlue/10",
								children: isEdit ? t("save_changes") : t("editor_save")
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx(Modal, {
				title: /* @__PURE__ */ jsx("span", {
					className: "font-extrabold text-slate-800 dark:text-white select-none",
					children: "Select Media Item"
				}),
				open: showMediaModal,
				onCancel: () => {
					setShowMediaModal(false);
					setMediaTarget(null);
				},
				footer: null,
				width: 750,
				className: "select-none",
				children: /* @__PURE__ */ jsx("div", {
					className: "py-4 select-none",
					children: /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[420px] overflow-y-auto pr-1",
						children: mediaList.length === 0 ? /* @__PURE__ */ jsx("div", {
							className: "col-span-full py-12 text-center text-gray-500 font-medium text-xs",
							children: "No media uploads found in library."
						}) : mediaList.filter((m) => mediaTarget === "pdf" ? m.mime_type === "application/pdf" : m.type === "image").map((m) => /* @__PURE__ */ jsx("div", {
							onClick: () => handleSelectMedia(m),
							className: "aspect-[1:1] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 cursor-pointer hover:border-accentBlue transition-colors flex items-center justify-center p-1 group",
							children: m.mime_type === "application/pdf" ? /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center justify-center text-red-500 gap-1.5 w-full h-full p-2",
								children: [/* @__PURE__ */ jsx(FileText, { className: "w-8 h-8 group-hover:scale-105 transition-transform" }), /* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-gray-400 text-center truncate w-full font-bold",
									children: m.file_name
								})]
							}) : /* @__PURE__ */ jsx("img", {
								src: getFullUrl(m.thumbnail_url || m.url),
								alt: "",
								className: "w-full h-full object-cover rounded-md group-hover:scale-102 transition-transform"
							})
						}, m.id))
					})
				})
			}),
			/* @__PURE__ */ jsx(Modal, {
				title: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5 font-black text-slate-800 dark:text-white",
					children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-accentBlue" }), /* @__PURE__ */ jsx("span", { children: "Sinh bài viết tự động với AI" })]
				}),
				open: aiModalVisible,
				onCancel: () => {
					if (!generating) {
						setAiModalVisible(false);
						setAiTopic("");
					}
				},
				footer: [/* @__PURE__ */ jsx(Button, {
					disabled: generating,
					onClick: () => setAiModalVisible(false),
					children: "Hủy"
				}, "cancel"), /* @__PURE__ */ jsx(Button, {
					type: "primary",
					loading: generating,
					onClick: handleAIGenerate,
					className: "bg-gradient-to-r from-accentBlue to-accentPurple hover:brightness-110 border-0",
					children: "Tạo bài viết"
				}, "submit")],
				width: 500,
				children: /* @__PURE__ */ jsxs("div", {
					className: "py-4 space-y-4",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-xs text-gray-500 leading-relaxed",
						children: "Nhập chủ đề bạn muốn viết. AI sẽ tự động sinh tiêu đề, nội dung chi tiết dạng HTML, mô tả SEO và đề xuất thẻ bằng cả tiếng Việt và tiếng Anh."
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2",
						children: "Chủ đề bài viết"
					}), /* @__PURE__ */ jsx(Input.TextArea, {
						rows: 4,
						value: aiTopic,
						disabled: generating,
						onChange: (e) => setAiTopic(e.target.value),
						placeholder: "e.g. Hướng dẫn thiết lập CI/CD pipeline với GitHub Actions và deploy lên Kubernetes...",
						className: "rounded-xl text-sm"
					})] })]
				})
			})
		]
	});
};
var HydrateFallback = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-5",
			children: [/* @__PURE__ */ jsx("div", { className: "h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" })]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
			children: [/* @__PURE__ */ jsx("div", {
				className: "lg:col-span-2 space-y-6",
				children: /* @__PURE__ */ jsx("div", { className: "h-[600px] bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse" })
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ jsx("div", { className: "h-64 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse" }), /* @__PURE__ */ jsx("div", { className: "h-48 bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse" })]
			})]
		})]
	});
});
var PostEditor_default = UNSAFE_withComponentProps(PostEditor);
//#endregion
//#region src/pages/NotFound.tsx
var NotFound_exports = /* @__PURE__ */ __exportAll({
	NotFound: () => NotFound,
	default: () => NotFound_default,
	loader: () => loader
});
async function loader() {
	return null;
}
var NotFound = () => {
	const { t, language, setLanguage } = useLanguage();
	const navigate = useNavigate();
	const [countdown, setCountdown] = useState(10);
	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					navigate("/");
					return 0;
				}
				return prev - 1;
			});
		}, 1e3);
		return () => clearInterval(timer);
	}, [navigate]);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-gray-200 flex flex-col justify-between font-sans transition-colors duration-300 relative overflow-hidden select-none",
		children: [
			/* @__PURE__ */ jsx("div", { className: "fixed top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-accentBlue/6 blur-[150px] pointer-events-none -z-10 animate-pulse" }),
			/* @__PURE__ */ jsx("div", { className: "fixed bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-accentPurple/6 blur-[150px] pointer-events-none -z-10 animate-pulse" }),
			/* @__PURE__ */ jsx("header", {
				className: "max-w-6xl mx-auto w-full px-6 py-5 flex items-center justify-end z-10 shrink-0",
				children: /* @__PURE__ */ jsx("button", {
					onClick: () => setLanguage(language === "vi" ? "en" : "vi"),
					className: "px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#151B2C]/40 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold text-slate-700 dark:text-gray-300 transition-all shadow-sm",
					title: language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt",
					children: language === "vi" ? "EN" : "VI"
				})
			}),
			/* @__PURE__ */ jsx("main", {
				className: "flex-grow flex items-center justify-center p-6 z-10",
				children: /* @__PURE__ */ jsxs("div", {
					className: "max-w-md w-full glass-panel border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 md:p-10 text-center space-y-6 bg-white/60 dark:bg-slate-900/30 shadow-2xl relative",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/15 animate-bounce",
							children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-8 h-8" })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ jsx("h1", {
									className: "text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-tr from-accentBlue via-accentPurple to-pink-500 bg-clip-text text-transparent drop-shadow-sm select-none",
									children: "404"
								}),
								/* @__PURE__ */ jsx("h2", {
									className: "text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight",
									children: t("page_not_found")
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed font-sans",
									children: t("page_not_found_desc")
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl space-y-3",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs text-gray-500 dark:text-gray-400 font-semibold font-sans",
								children: t("redirecting_home").replace("{seconds}", String(countdown))
							}), /* @__PURE__ */ jsx("div", {
								className: "w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden",
								children: /* @__PURE__ */ jsx("div", {
									className: "h-full bg-gradient-to-r from-accentBlue to-accentPurple transition-all duration-1000 ease-linear rounded-full",
									style: { width: `${countdown / 10 * 100}%` }
								})
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => navigate(-1),
								className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-650 dark:text-gray-300 rounded-xl text-xs font-bold transition-all",
								children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: t("back") })]
							}), /* @__PURE__ */ jsxs(Link, {
								to: "/",
								className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-btn-global hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-accentBlue/10",
								children: [/* @__PURE__ */ jsx(Home, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: t("back_to_home") })]
							})]
						})
					]
				})
			})
		]
	});
};
var NotFound_default = UNSAFE_withComponentProps(NotFound);
//#endregion
//#region \0virtual:react-router/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-rYSXLLLV.js",
		"imports": [
			"/assets/react-B8IZ02wI.js",
			"/assets/react-dom-0ZK-Lw7i.js",
			"/assets/components-CfS39_Ru.js",
			"/assets/errorBoundaries-d4cvEVTT.js",
			"/assets/client-BXMKfmWK.js",
			"/assets/jsx-runtime-fBfwind-.js",
			"/assets/preload-helper-Czpn1I53.js"
		],
		"css": []
	},
	"routes": {
		"root": {
			"id": "root",
			"parentId": void 0,
			"path": "",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/root-CurA9SDD.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/lib-BhWoY-fd.js"
			],
			"css": ["/assets/root-B9J8-kQm.css"],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"root-layout": {
			"id": "root-layout",
			"parentId": "root",
			"path": void 0,
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/RootLayout-Bj7W0NYc.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/AuthContext-CY6EId-F.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/ThemeContext-Dif_OHTN.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/config-provider-Q8EZCfsj.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/x-joRAMor3.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/reactNode-CYzDG-Lv.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"layouts/PublicLayout": {
			"id": "layouts/PublicLayout",
			"parentId": "root-layout",
			"path": void 0,
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/PublicLayout-u1iYyHX8.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/AuthContext-CY6EId-F.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/sun-DgSDmCBz.js",
				"/assets/x-joRAMor3.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/ThemeContext-Dif_OHTN.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/cookie-n82x52g3.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/BlogHome": {
			"id": "pages/BlogHome",
			"parentId": "layouts/PublicLayout",
			"path": void 0,
			"index": true,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/BlogHome-B3EC7xbx.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/PostCard-CwoQVAYE.js",
				"/assets/pagination-CPYczNX9.js",
				"/assets/card-DBjD1ld6.js",
				"/assets/input-DV6v9ujJ.js",
				"/assets/tag-cWpmOkFe.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/arrow-right-CxyOHHF8.js",
				"/assets/calendar-BZeUVJdC.js",
				"/assets/clock-CNmno3nu.js",
				"/assets/file-text-seu8jVAN.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/PurePanel-DXyEyF_a.js",
				"/assets/space-C9VufrFS.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/EllipsisOutlined-CLJLtKiC.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/badge-BXrELRqe.js",
				"/assets/TextArea-DuQ45LHi.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/config-provider-Q8EZCfsj.js",
				"/assets/tabs-CA1NUWzh.js",
				"/assets/Input-BtN5TvFa.js",
				"/assets/select-CmeBe-vp.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/BlogPostDetail": {
			"id": "pages/BlogPostDetail",
			"parentId": "layouts/PublicLayout",
			"path": "posts/:slug",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/BlogPostDetail-Ch6dcbi5.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/arrow-left-DohR3ttc.js",
				"/assets/calendar-BZeUVJdC.js",
				"/assets/chevron-right-y8Q3ER8d.js",
				"/assets/clock-CNmno3nu.js",
				"/assets/file-text-seu8jVAN.js",
				"/assets/house-DnkRjXlq.js",
				"/assets/image-9_3s8Xln.js",
				"/assets/sparkles-PSM-F5sJ.js",
				"/assets/message-square-C_bEskgY.js",
				"/assets/send-CIwyWWgM.js",
				"/assets/tag-BRyc2MMu.js",
				"/assets/user-D6djy5Wv.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/PostCard-CwoQVAYE.js",
				"/assets/button-DmWTtTzq.js",
				"/assets/modal-DL5YDafO.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/x-joRAMor3.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/arrow-right-CxyOHHF8.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/PurePanel-DXyEyF_a.js",
				"/assets/space-C9VufrFS.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/EllipsisOutlined-CLJLtKiC.js",
				"/assets/badge-BXrELRqe.js",
				"/assets/card-DBjD1ld6.js",
				"/assets/TextArea-DuQ45LHi.js",
				"/assets/tag-cWpmOkFe.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/config-provider-Q8EZCfsj.js",
				"/assets/tabs-CA1NUWzh.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/FeedbackNew": {
			"id": "pages/FeedbackNew",
			"parentId": "layouts/PublicLayout",
			"path": "feedback",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/FeedbackNew-DMH_dsLc.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/loader-DZwhZ3GU.js",
				"/assets/message-square-C_bEskgY.js",
				"/assets/send-CIwyWWgM.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/x-joRAMor3.js",
				"/assets/cookie-n82x52g3.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/AuthorsList": {
			"id": "pages/AuthorsList",
			"parentId": "layouts/PublicLayout",
			"path": "authors",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/AuthorsList-DrmbVgNN.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/arrow-right-CxyOHHF8.js",
				"/assets/mail-qy4j8CZC.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/AuthorDetail": {
			"id": "pages/AuthorDetail",
			"parentId": "layouts/PublicLayout",
			"path": "authors/:nickname",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/AuthorDetail-UVLTdD_J.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/calendar-BZeUVJdC.js",
				"/assets/chevron-left-D1sGXc0k.js",
				"/assets/chevron-right-y8Q3ER8d.js",
				"/assets/eye-BdHBaq9j.js",
				"/assets/mail-qy4j8CZC.js",
				"/assets/user-D6djy5Wv.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/ForgotPassword": {
			"id": "pages/ForgotPassword",
			"parentId": "root-layout",
			"path": "forgot-password",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/ForgotPassword-CnQrSXN-.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/arrow-left-DohR3ttc.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/loader-DZwhZ3GU.js",
				"/assets/mail-qy4j8CZC.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/schemas-DiolB4Yi.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/x-joRAMor3.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/ResetPassword": {
			"id": "pages/ResetPassword",
			"parentId": "root-layout",
			"path": "reset-password",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/ResetPassword-CqI0aoOb.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/arrow-left-DohR3ttc.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/eye-BdHBaq9j.js",
				"/assets/loader-DZwhZ3GU.js",
				"/assets/lock-GS8gFZFe.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/schemas-DiolB4Yi.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/x-joRAMor3.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/Login": {
			"id": "pages/Login",
			"parentId": "root-layout",
			"path": "system/login",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/Login-BZf1ImYP.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/AuthContext-CY6EId-F.js",
				"/assets/lock-GS8gFZFe.js",
				"/assets/mail-qy4j8CZC.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/button-DmWTtTzq.js",
				"/assets/form-9S6HYHyS.js",
				"/assets/input-DV6v9ujJ.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/x-joRAMor3.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/space-C9VufrFS.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/useForm-CMxfHTD5.js",
				"/assets/Input-BtN5TvFa.js",
				"/assets/TextArea-DuQ45LHi.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"components/ProtectedRoute": {
			"id": "components/ProtectedRoute",
			"parentId": "root-layout",
			"path": "admin",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/ProtectedRoute-B1IC3Ulq.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/AuthContext-CY6EId-F.js",
				"/assets/spin-BXwpLwb0.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"layouts/AdminLayout": {
			"id": "layouts/AdminLayout",
			"parentId": "components/ProtectedRoute",
			"path": void 0,
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/AdminLayout-H47fVOEl.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/AuthContext-CY6EId-F.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/file-text-seu8jVAN.js",
				"/assets/folder-DTv8lqcU.js",
				"/assets/image-9_3s8Xln.js",
				"/assets/languages-CCgaCrqK.js",
				"/assets/sun-DgSDmCBz.js",
				"/assets/message-square-C_bEskgY.js",
				"/assets/settings-CFJuzrLC.js",
				"/assets/tag-BRyc2MMu.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/ThemeContext-Dif_OHTN.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/cookie-n82x52g3.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/Dashboard": {
			"id": "pages/Dashboard",
			"parentId": "layouts/AdminLayout",
			"path": void 0,
			"index": true,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/Dashboard-D9KfhbYK.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/calendar-BZeUVJdC.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/clock-CNmno3nu.js",
				"/assets/eye-BdHBaq9j.js",
				"/assets/file-text-seu8jVAN.js",
				"/assets/folder-DTv8lqcU.js",
				"/assets/image-9_3s8Xln.js",
				"/assets/pen-CfKIqaHC.js",
				"/assets/plus-CgtxOqpW.js",
				"/assets/tag-BRyc2MMu.js",
				"/assets/upload-BMTjWNmx.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/with-selector-BwDoCrJJ.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/client-BXMKfmWK.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/FeedbacksAdmin": {
			"id": "pages/FeedbacksAdmin",
			"parentId": "layouts/AdminLayout",
			"path": "feedbacks",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/FeedbacksAdmin-SD6GiPjw.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/loader-DZwhZ3GU.js",
				"/assets/message-square-C_bEskgY.js",
				"/assets/refresh-cw-DT33BWG9.js",
				"/assets/star-B1F2pof7.js",
				"/assets/trash-2-CmOZGDRz.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/x-joRAMor3.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/MediaLibrary": {
			"id": "pages/MediaLibrary",
			"parentId": "layouts/AdminLayout",
			"path": "media",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/MediaLibrary-1BnO8TZ_.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/eye-BdHBaq9j.js",
				"/assets/file-text-seu8jVAN.js",
				"/assets/film-CLfyzIdc.js",
				"/assets/image-9_3s8Xln.js",
				"/assets/loader-DZwhZ3GU.js",
				"/assets/play-BTk7gw9W.js",
				"/assets/refresh-cw-DT33BWG9.js",
				"/assets/search-B1P41gZp.js",
				"/assets/trash-2-CmOZGDRz.js",
				"/assets/upload-BMTjWNmx.js",
				"/assets/x-joRAMor3.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/ConfirmModal-BsacS4Mv.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/Categories": {
			"id": "pages/Categories",
			"parentId": "layouts/AdminLayout",
			"path": "categories",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/Categories-aIQUuP-J.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/folder-DTv8lqcU.js",
				"/assets/pen-CfKIqaHC.js",
				"/assets/plus-CgtxOqpW.js",
				"/assets/rotate-ccw-BVLF1wJO.js",
				"/assets/trash-2-CmOZGDRz.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/space-C9VufrFS.js",
				"/assets/button-DmWTtTzq.js",
				"/assets/modal-DL5YDafO.js",
				"/assets/table-Ny5GOlmk.js",
				"/assets/select-CmeBe-vp.js",
				"/assets/tabs-CA1NUWzh.js",
				"/assets/form-9S6HYHyS.js",
				"/assets/input-DV6v9ujJ.js",
				"/assets/switch-B405_Fiy.js",
				"/assets/tag-cWpmOkFe.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/x-joRAMor3.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/PurePanel-DXyEyF_a.js",
				"/assets/config-provider-Q8EZCfsj.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/useForm-CMxfHTD5.js",
				"/assets/Input-BtN5TvFa.js",
				"/assets/EllipsisOutlined-CLJLtKiC.js",
				"/assets/pagination-CPYczNX9.js",
				"/assets/spin-BXwpLwb0.js",
				"/assets/TextArea-DuQ45LHi.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/Tags": {
			"id": "pages/Tags",
			"parentId": "layouts/AdminLayout",
			"path": "tags",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/Tags-DkDOZS7b.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/plus-CgtxOqpW.js",
				"/assets/rotate-ccw-BVLF1wJO.js",
				"/assets/tag-BRyc2MMu.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/space-C9VufrFS.js",
				"/assets/button-DmWTtTzq.js",
				"/assets/modal-DL5YDafO.js",
				"/assets/spin-BXwpLwb0.js",
				"/assets/form-9S6HYHyS.js",
				"/assets/input-DV6v9ujJ.js",
				"/assets/switch-B405_Fiy.js",
				"/assets/tag-cWpmOkFe.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/x-joRAMor3.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/PurePanel-DXyEyF_a.js",
				"/assets/config-provider-Q8EZCfsj.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/useForm-CMxfHTD5.js",
				"/assets/Input-BtN5TvFa.js",
				"/assets/TextArea-DuQ45LHi.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/CommentModeration": {
			"id": "pages/CommentModeration",
			"parentId": "layouts/AdminLayout",
			"path": "comments",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/CommentModeration-DKL26zHs.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/check-CxpJYCNj.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/clock-CNmno3nu.js",
				"/assets/loader-DZwhZ3GU.js",
				"/assets/message-square-C_bEskgY.js",
				"/assets/refresh-cw-DT33BWG9.js",
				"/assets/trash-2-CmOZGDRz.js",
				"/assets/x-joRAMor3.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/ConfirmModal-BsacS4Mv.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/TranslateJobs": {
			"id": "pages/TranslateJobs",
			"parentId": "layouts/AdminLayout",
			"path": "translate-jobs",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/TranslateJobs-DBegxopL.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/clock-CNmno3nu.js",
				"/assets/languages-CCgaCrqK.js",
				"/assets/play-BTk7gw9W.js",
				"/assets/refresh-cw-DT33BWG9.js",
				"/assets/trash-2-CmOZGDRz.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/space-C9VufrFS.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/config-provider-Q8EZCfsj.js",
				"/assets/button-DmWTtTzq.js",
				"/assets/modal-DL5YDafO.js",
				"/assets/table-Ny5GOlmk.js",
				"/assets/dayjs.min-7gTJvZx9.js",
				"/assets/card-DBjD1ld6.js",
				"/assets/tag-cWpmOkFe.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/PurePanel-DXyEyF_a.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/useForm-CMxfHTD5.js",
				"/assets/Input-BtN5TvFa.js",
				"/assets/select-CmeBe-vp.js",
				"/assets/EllipsisOutlined-CLJLtKiC.js",
				"/assets/pagination-CPYczNX9.js",
				"/assets/spin-BXwpLwb0.js",
				"/assets/tabs-CA1NUWzh.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/Settings": {
			"id": "pages/Settings",
			"parentId": "layouts/AdminLayout",
			"path": "settings",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/Settings-RcSFtnNN.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/AuthContext-CY6EId-F.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/image-9_3s8Xln.js",
				"/assets/key-q6qwxpsY.js",
				"/assets/loader-DZwhZ3GU.js",
				"/assets/plus-CgtxOqpW.js",
				"/assets/refresh-cw-DT33BWG9.js",
				"/assets/trash-DvTcwWta.js",
				"/assets/upload-BMTjWNmx.js",
				"/assets/user-D6djy5Wv.js",
				"/assets/x-joRAMor3.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/ThemeContext-Dif_OHTN.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/cookie-n82x52g3.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/Users": {
			"id": "pages/Users",
			"parentId": "layouts/AdminLayout",
			"path": "users",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/Users-Cd-7hh-X.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/AuthContext-CY6EId-F.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/lock-GS8gFZFe.js",
				"/assets/mail-qy4j8CZC.js",
				"/assets/octagon-alert-BxDayaKR.js",
				"/assets/pen-CfKIqaHC.js",
				"/assets/plus-CgtxOqpW.js",
				"/assets/user-D6djy5Wv.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/space-C9VufrFS.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/button-DmWTtTzq.js",
				"/assets/modal-DL5YDafO.js",
				"/assets/table-Ny5GOlmk.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/Input-BtN5TvFa.js",
				"/assets/select-CmeBe-vp.js",
				"/assets/form-9S6HYHyS.js",
				"/assets/input-DV6v9ujJ.js",
				"/assets/switch-B405_Fiy.js",
				"/assets/tag-cWpmOkFe.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/x-joRAMor3.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/PurePanel-DXyEyF_a.js",
				"/assets/config-provider-Q8EZCfsj.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/useForm-CMxfHTD5.js",
				"/assets/EllipsisOutlined-CLJLtKiC.js",
				"/assets/pagination-CPYczNX9.js",
				"/assets/spin-BXwpLwb0.js",
				"/assets/TextArea-DuQ45LHi.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/AuditLog": {
			"id": "pages/AuditLog",
			"parentId": "layouts/AdminLayout",
			"path": "audit-logs",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/AuditLog-CyS-mlUh.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/AuthContext-CY6EId-F.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/eye-BdHBaq9j.js",
				"/assets/file-text-seu8jVAN.js",
				"/assets/image-9_3s8Xln.js",
				"/assets/key-q6qwxpsY.js",
				"/assets/loader-DZwhZ3GU.js",
				"/assets/octagon-alert-BxDayaKR.js",
				"/assets/refresh-cw-DT33BWG9.js",
				"/assets/settings-CFJuzrLC.js",
				"/assets/user-D6djy5Wv.js",
				"/assets/x-joRAMor3.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/PostList": {
			"id": "pages/PostList",
			"parentId": "layouts/AdminLayout",
			"path": "posts",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/PostList-xf-Kuy8j.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/file-text-seu8jVAN.js",
				"/assets/pen-CfKIqaHC.js",
				"/assets/plus-CgtxOqpW.js",
				"/assets/rotate-ccw-BVLF1wJO.js",
				"/assets/search-B1P41gZp.js",
				"/assets/star-B1F2pof7.js",
				"/assets/trash-2-CmOZGDRz.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/space-C9VufrFS.js",
				"/assets/button-DmWTtTzq.js",
				"/assets/modal-DL5YDafO.js",
				"/assets/table-Ny5GOlmk.js",
				"/assets/select-CmeBe-vp.js",
				"/assets/badge-BXrELRqe.js",
				"/assets/input-DV6v9ujJ.js",
				"/assets/switch-B405_Fiy.js",
				"/assets/tag-cWpmOkFe.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/x-joRAMor3.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/PurePanel-DXyEyF_a.js",
				"/assets/config-provider-Q8EZCfsj.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/useForm-CMxfHTD5.js",
				"/assets/Input-BtN5TvFa.js",
				"/assets/EllipsisOutlined-CLJLtKiC.js",
				"/assets/pagination-CPYczNX9.js",
				"/assets/spin-BXwpLwb0.js",
				"/assets/TextArea-DuQ45LHi.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"post-new": {
			"id": "post-new",
			"parentId": "layouts/AdminLayout",
			"path": "posts/new",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/PostEditor-C5pJi4B6.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/arrow-left-DohR3ttc.js",
				"/assets/check-CxpJYCNj.js",
				"/assets/file-text-seu8jVAN.js",
				"/assets/film-CLfyzIdc.js",
				"/assets/image-9_3s8Xln.js",
				"/assets/languages-CCgaCrqK.js",
				"/assets/sparkles-PSM-F5sJ.js",
				"/assets/loader-DZwhZ3GU.js",
				"/assets/play-BTk7gw9W.js",
				"/assets/plus-CgtxOqpW.js",
				"/assets/trash-DvTcwWta.js",
				"/assets/search-B1P41gZp.js",
				"/assets/trash-2-CmOZGDRz.js",
				"/assets/x-joRAMor3.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/PurePanel-DXyEyF_a.js",
				"/assets/space-C9VufrFS.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/button-DmWTtTzq.js",
				"/assets/modal-DL5YDafO.js",
				"/assets/useForm-CMxfHTD5.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/select-CmeBe-vp.js",
				"/assets/EllipsisOutlined-CLJLtKiC.js",
				"/assets/dayjs.min-7gTJvZx9.js",
				"/assets/tabs-CA1NUWzh.js",
				"/assets/card-DBjD1ld6.js",
				"/assets/form-9S6HYHyS.js",
				"/assets/input-DV6v9ujJ.js",
				"/assets/switch-B405_Fiy.js",
				"/assets/with-selector-BwDoCrJJ.js",
				"/assets/ConfirmModal-BsacS4Mv.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/config-provider-Q8EZCfsj.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/Input-BtN5TvFa.js",
				"/assets/TextArea-DuQ45LHi.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"post-edit": {
			"id": "post-edit",
			"parentId": "layouts/AdminLayout",
			"path": "posts/edit/:id",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": true,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/PostEditor-C5pJi4B6.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/react-dom-0ZK-Lw7i.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/api-Z_VPAs0a.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/arrow-left-DohR3ttc.js",
				"/assets/check-CxpJYCNj.js",
				"/assets/file-text-seu8jVAN.js",
				"/assets/film-CLfyzIdc.js",
				"/assets/image-9_3s8Xln.js",
				"/assets/languages-CCgaCrqK.js",
				"/assets/sparkles-PSM-F5sJ.js",
				"/assets/loader-DZwhZ3GU.js",
				"/assets/play-BTk7gw9W.js",
				"/assets/plus-CgtxOqpW.js",
				"/assets/trash-DvTcwWta.js",
				"/assets/search-B1P41gZp.js",
				"/assets/trash-2-CmOZGDRz.js",
				"/assets/x-joRAMor3.js",
				"/assets/ToastContext-xDHXt_wO.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/SizeContext-DdW-bh-o.js",
				"/assets/DisabledContext-RX5_YpZM.js",
				"/assets/PurePanel-DXyEyF_a.js",
				"/assets/space-C9VufrFS.js",
				"/assets/clsx-CjueKrWZ.js",
				"/assets/useSize--7DSUrNz.js",
				"/assets/button-DmWTtTzq.js",
				"/assets/modal-DL5YDafO.js",
				"/assets/useForm-CMxfHTD5.js",
				"/assets/reactNode-CYzDG-Lv.js",
				"/assets/select-CmeBe-vp.js",
				"/assets/EllipsisOutlined-CLJLtKiC.js",
				"/assets/dayjs.min-7gTJvZx9.js",
				"/assets/tabs-CA1NUWzh.js",
				"/assets/card-DBjD1ld6.js",
				"/assets/form-9S6HYHyS.js",
				"/assets/input-DV6v9ujJ.js",
				"/assets/switch-B405_Fiy.js",
				"/assets/with-selector-BwDoCrJJ.js",
				"/assets/ConfirmModal-BsacS4Mv.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/circle-alert-C5688MrR.js",
				"/assets/circle-check-big-BLyM-AW-.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/cookie-n82x52g3.js",
				"/assets/client-BXMKfmWK.js",
				"/assets/config-provider-Q8EZCfsj.js",
				"/assets/skeleton-DsLOC2AC.js",
				"/assets/Input-BtN5TvFa.js",
				"/assets/TextArea-DuQ45LHi.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"pages/NotFound": {
			"id": "pages/NotFound",
			"parentId": "root-layout",
			"path": "*",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/NotFound-B1NqX3ec.js",
			"imports": [
				"/assets/react-B8IZ02wI.js",
				"/assets/components-CfS39_Ru.js",
				"/assets/lib-BhWoY-fd.js",
				"/assets/jsx-runtime-fBfwind-.js",
				"/assets/arrow-left-DohR3ttc.js",
				"/assets/house-DnkRjXlq.js",
				"/assets/triangle-alert-1tLOcRvi.js",
				"/assets/LanguageContext-95JFVqbj.js",
				"/assets/errorBoundaries-d4cvEVTT.js",
				"/assets/preload-helper-Czpn1I53.js",
				"/assets/createLucideIcon-BcIYjSMj.js",
				"/assets/cookie-n82x52g3.js"
			],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		}
	},
	"url": "/assets/manifest-5740c46e.js",
	"version": "5740c46e",
	"sri": void 0
};
//#endregion
//#region \0virtual:react-router/server-build
var assetsBuildDirectory = "build/client";
var basename = "/";
var future = {
	"unstable_optimizeDeps": false,
	"v8_passThroughRequests": false,
	"v8_trailingSlashAwareDataRequests": false,
	"unstable_previewServerPrerendering": false,
	"v8_middleware": false,
	"v8_splitRouteModules": false,
	"v8_viteEnvironmentApi": false
};
var ssr = true;
var isSpaMode = false;
var prerender = [];
var routeDiscovery = {
	"mode": "lazy",
	"manifestPath": "/__manifest"
};
var publicPath = "/";
var entry = { module: entry_server_exports };
var routes = {
	"root": {
		id: "root",
		parentId: void 0,
		path: "",
		index: void 0,
		caseSensitive: void 0,
		module: root_exports
	},
	"root-layout": {
		id: "root-layout",
		parentId: "root",
		path: void 0,
		index: void 0,
		caseSensitive: void 0,
		module: RootLayout_exports
	},
	"layouts/PublicLayout": {
		id: "layouts/PublicLayout",
		parentId: "root-layout",
		path: void 0,
		index: void 0,
		caseSensitive: void 0,
		module: PublicLayout_exports
	},
	"pages/BlogHome": {
		id: "pages/BlogHome",
		parentId: "layouts/PublicLayout",
		path: void 0,
		index: true,
		caseSensitive: void 0,
		module: BlogHome_exports
	},
	"pages/BlogPostDetail": {
		id: "pages/BlogPostDetail",
		parentId: "layouts/PublicLayout",
		path: "posts/:slug",
		index: void 0,
		caseSensitive: void 0,
		module: BlogPostDetail_exports
	},
	"pages/FeedbackNew": {
		id: "pages/FeedbackNew",
		parentId: "layouts/PublicLayout",
		path: "feedback",
		index: void 0,
		caseSensitive: void 0,
		module: FeedbackNew_exports
	},
	"pages/AuthorsList": {
		id: "pages/AuthorsList",
		parentId: "layouts/PublicLayout",
		path: "authors",
		index: void 0,
		caseSensitive: void 0,
		module: AuthorsList_exports
	},
	"pages/AuthorDetail": {
		id: "pages/AuthorDetail",
		parentId: "layouts/PublicLayout",
		path: "authors/:nickname",
		index: void 0,
		caseSensitive: void 0,
		module: AuthorDetail_exports
	},
	"pages/ForgotPassword": {
		id: "pages/ForgotPassword",
		parentId: "root-layout",
		path: "forgot-password",
		index: void 0,
		caseSensitive: void 0,
		module: ForgotPassword_exports
	},
	"pages/ResetPassword": {
		id: "pages/ResetPassword",
		parentId: "root-layout",
		path: "reset-password",
		index: void 0,
		caseSensitive: void 0,
		module: ResetPassword_exports
	},
	"pages/Login": {
		id: "pages/Login",
		parentId: "root-layout",
		path: "system/login",
		index: void 0,
		caseSensitive: void 0,
		module: Login_exports
	},
	"components/ProtectedRoute": {
		id: "components/ProtectedRoute",
		parentId: "root-layout",
		path: "admin",
		index: void 0,
		caseSensitive: void 0,
		module: ProtectedRoute_exports
	},
	"layouts/AdminLayout": {
		id: "layouts/AdminLayout",
		parentId: "components/ProtectedRoute",
		path: void 0,
		index: void 0,
		caseSensitive: void 0,
		module: AdminLayout_exports
	},
	"pages/Dashboard": {
		id: "pages/Dashboard",
		parentId: "layouts/AdminLayout",
		path: void 0,
		index: true,
		caseSensitive: void 0,
		module: Dashboard_exports
	},
	"pages/FeedbacksAdmin": {
		id: "pages/FeedbacksAdmin",
		parentId: "layouts/AdminLayout",
		path: "feedbacks",
		index: void 0,
		caseSensitive: void 0,
		module: FeedbacksAdmin_exports
	},
	"pages/MediaLibrary": {
		id: "pages/MediaLibrary",
		parentId: "layouts/AdminLayout",
		path: "media",
		index: void 0,
		caseSensitive: void 0,
		module: MediaLibrary_exports
	},
	"pages/Categories": {
		id: "pages/Categories",
		parentId: "layouts/AdminLayout",
		path: "categories",
		index: void 0,
		caseSensitive: void 0,
		module: Categories_exports
	},
	"pages/Tags": {
		id: "pages/Tags",
		parentId: "layouts/AdminLayout",
		path: "tags",
		index: void 0,
		caseSensitive: void 0,
		module: Tags_exports
	},
	"pages/CommentModeration": {
		id: "pages/CommentModeration",
		parentId: "layouts/AdminLayout",
		path: "comments",
		index: void 0,
		caseSensitive: void 0,
		module: CommentModeration_exports
	},
	"pages/TranslateJobs": {
		id: "pages/TranslateJobs",
		parentId: "layouts/AdminLayout",
		path: "translate-jobs",
		index: void 0,
		caseSensitive: void 0,
		module: TranslateJobs_exports
	},
	"pages/Settings": {
		id: "pages/Settings",
		parentId: "layouts/AdminLayout",
		path: "settings",
		index: void 0,
		caseSensitive: void 0,
		module: Settings_exports
	},
	"pages/Users": {
		id: "pages/Users",
		parentId: "layouts/AdminLayout",
		path: "users",
		index: void 0,
		caseSensitive: void 0,
		module: Users_exports
	},
	"pages/AuditLog": {
		id: "pages/AuditLog",
		parentId: "layouts/AdminLayout",
		path: "audit-logs",
		index: void 0,
		caseSensitive: void 0,
		module: AuditLog_exports
	},
	"pages/PostList": {
		id: "pages/PostList",
		parentId: "layouts/AdminLayout",
		path: "posts",
		index: void 0,
		caseSensitive: void 0,
		module: PostList_exports
	},
	"post-new": {
		id: "post-new",
		parentId: "layouts/AdminLayout",
		path: "posts/new",
		index: void 0,
		caseSensitive: void 0,
		module: PostEditor_exports
	},
	"post-edit": {
		id: "post-edit",
		parentId: "layouts/AdminLayout",
		path: "posts/edit/:id",
		index: void 0,
		caseSensitive: void 0,
		module: PostEditor_exports
	},
	"pages/NotFound": {
		id: "pages/NotFound",
		parentId: "root-layout",
		path: "*",
		index: void 0,
		caseSensitive: void 0,
		module: NotFound_exports
	}
};
var allowedActionOrigins = false;
//#endregion
export { allowedActionOrigins, server_manifest_default as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, prerender, publicPath, routeDiscovery, routes, ssr };
