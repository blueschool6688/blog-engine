import axios from "axios";
var api = axios.create({ baseURL: "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("access_token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
}, (error) => Promise.reject(error));
api.interceptors.response.use((response) => response, (error) => {
	if (error.response?.status === 401) {
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
	}
};
//#endregion
export { dashboardService as a, mediaService as c, publicService as d, settingsService as f, userService as h, commentService as i, postService as l, translateService as m, auditService as n, feedbackService as o, tagService as p, categoryService as r, getFullUrl as s, api as t, profileService as u };
