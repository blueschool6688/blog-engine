import { a as commentService, c as getFullUrl, f as publicService } from "./api-DYEteWSp.js";
import { n as useToast } from "./ToastContext-C9HDWap1.js";
import { n as useLanguage } from "./LanguageContext-FaGWHnxr.js";
import { Link, UNSAFE_withComponentProps, useNavigate, useParams } from "react-router";
import React, { useCallback, useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, Calendar, ChevronRight, Clock, Copy, CornerDownRight, FileText, Home, Image, List, MessageSquare, Send, Sparkles, Tag, User } from "lucide-react";
import { Button, Modal, Skeleton } from "antd";
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
async function loader() {
	return null;
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
	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
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
		import("./PDFViewer-CdnduC5o.js").then((mod) => {
			setPDFViewer(() => mod.PDFViewer);
		});
		Promise.all([
			import("yet-another-react-lightbox"),
			import("yet-another-react-lightbox/plugins/zoom"),
			import("yet-another-react-lightbox/plugins/video"),
			Promise.resolve({           })
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
		if (!slug) return;
		setLoading(true);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
		publicService.getPostBySlug(slug).then((res) => {
			const p = res.data;
			setPost(p);
		}).catch(() => navigate("/")).finally(() => setLoading(false));
	}, [slug, navigate]);
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
	if (loading || !post) return /* @__PURE__ */ jsxs("div", {
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
var BlogPostDetail_default = UNSAFE_withComponentProps(BlogPostDetail);
//#endregion
export { BlogPostDetail_default as default, loader };
