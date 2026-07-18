import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/system/login';
    }
    return Promise.reject(error);
  },
);

export interface Media {
  id: number;
  created_at: string;
  updated_at: string;
  file_name: string;
  url: string;
  thumbnail_url: string;
  status: 'processing' | 'completed' | 'failed';
  type: 'image' | 'video';
  duration?: number;
  resolution?: string;
  file_size: number;
  mime_type: string;
}

export interface PostMedia {
  id: number;
  post_id: number;
  media_id: number;
  media: Media;
  sort_order: number;
  caption?: string;
  alt_text?: string;
}

export interface Category {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  nickname: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  role: 'admin' | 'editor';
  is_active: boolean;
}

export interface Feedback {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  subject?: string;
  content: string;
  rating: number;
  status: 'pending' | 'reviewed' | 'archived';
}

export interface Author {
  id: number;
  name: string;
  nickname: string;
  email: string;
  avatar_url?: string;
  bio?: string;
}

export interface DayViewCount {
  date: string;
  count: number;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  changes?: any;
  ip_address?: string;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_id?: number | null;
  author_name: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  replies?: Comment[];
  created_at: string;
}

export interface ReactionCount {
  emoji: string;
  count: number;
  reacted: boolean;
}

export interface Post {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  content: string;
  cover_media_id?: number | null;
  cover_media?: Media;
  status: 'draft' | 'published';
  author?: { id: number; name: string; avatar_url?: string; role?: string; bio?: string; nickname?: string } | null;
  categories?: Category[];
  tags?: Tag[];
  category_ids?: number[];
  tag_ids?: number[];
  gallery?: PostMedia[];
  meta_title?: string;
  meta_desc?: string;
  excerpt?: string;
  is_featured?: boolean;
  published_at?: string | null;
  view_count?: number;
}

export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: any;
}

export const mediaService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<APIResponse<Media>>('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  list: async (params?: { type?: 'image' | 'video' | ''; page?: number; limit?: number }) => {
    const response = await api.get<APIResponse<Media[] & { items?: Media[]; total?: number }>>('/media', { params });
    return response.data;
  },
  detail: async (id: number) => {
    const response = await api.get<APIResponse<Media>>(`/media/${id}`);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete<APIResponse<null>>(`/media/${id}`);
    return response.data;
  },
};

export const postService = {
  list: async (offset = 0, limit = 10, status = '', search = '', category_id?: number, tag_id?: number, is_featured?: boolean) => {
    const response = await api.get<APIResponse<{ items: Post[]; total: number }>>('/posts', {
      params: { offset, limit, status, search, category_id, tag_id, is_featured },
    });
    return response.data;
  },
  detail: async (id: number) => {
    const response = await api.get<APIResponse<Post>>(`/posts/${id}`);
    return response.data;
  },
  create: async (post: Partial<Post>) => {
    const response = await api.post<APIResponse<Post>>('/posts', post);
    return response.data;
  },
  update: async (id: number, post: Partial<Post>) => {
    const response = await api.put<APIResponse<Post>>(`/posts/${id}`, post);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete<APIResponse<null>>(`/posts/${id}`);
    return response.data;
  },
  getGallery: async (postId: number) => {
    const response = await api.get<APIResponse<PostMedia[]>>(`/posts/${postId}/media`);
    return response.data;
  },
  attachMedia: async (postId: number, data: { media_id: number; caption?: string; alt_text?: string }) => {
    const response = await api.post<APIResponse<PostMedia>>(`/posts/${postId}/media`, data);
    return response.data;
  },
  detachMedia: async (postId: number, mediaId: number) => {
    const response = await api.delete<APIResponse<null>>(`/posts/${postId}/media/${mediaId}`);
    return response.data;
  },
  reorderGallery: async (postId: number, items: { media_id: number; sort_order: number }[]) => {
    const response = await api.put<APIResponse<null>>(`/posts/${postId}/media/reorder`, items);
    return response.data;
  },
  bulkAction: async (ids: number[], action: 'publish' | 'draft' | 'delete') => {
    const response = await api.post<APIResponse<{ affected: number }>>('/posts/bulk', { ids, action });
    return response.data;
  },
};

export const categoryService = {
  list: async () => {
    const response = await api.get<APIResponse<Category[]>>('/categories');
    return response.data;
  },
  create: async (data: { name: string; slug?: string; description?: string }) => {
    const response = await api.post<APIResponse<Category>>('/categories', data);
    return response.data;
  },
  update: async (id: number, data: { name: string; slug?: string; description?: string }) => {
    const response = await api.put<APIResponse<Category>>(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete<APIResponse<null>>(`/categories/${id}`);
    return response.data;
  },
};

export const tagService = {
  list: async () => {
    const response = await api.get<APIResponse<Tag[]>>('/tags');
    return response.data;
  },
  create: async (data: { name: string; slug?: string }) => {
    const response = await api.post<APIResponse<Tag>>('/tags', data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete<APIResponse<null>>(`/tags/${id}`);
    return response.data;
  },
};

export const userService = {
  list: async (offset = 0, limit = 10, role = '') => {
    const response = await api.get<APIResponse<{ items: User[]; total: number }>>('/users', { params: { offset, limit, role } });
    return response.data;
  },
  create: async (data: { name: string; nickname: string; email: string; password: string; role: string }) => {
    const response = await api.post<APIResponse<User>>('/users', data);
    return response.data;
  },
  update: async (id: number, data: { name: string; nickname: string; role: string; is_active: boolean }) => {
    const response = await api.put<APIResponse<User>>(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete<APIResponse<null>>(`/users/${id}`);
    return response.data;
  },
};

export const auditService = {
  list: async (params?: { offset?: number; limit?: number; user_id?: number; entity_type?: string }) => {
    const response = await api.get<APIResponse<{ items: AuditLog[]; total: number }>>('/audit-logs', { params });
    return response.data;
  },
};

export const commentService = {
  // Public
  listComments: async (postId: number) => {
    const response = await api.get<APIResponse<Comment[]>>(`/public/posts/${postId}/comments`);
    return response.data;
  },
  postComment: async (postId: number, data: { author_name?: string; author_email?: string; content: string; parent_id?: number }) => {
    const response = await api.post<APIResponse<Comment>>(`/public/posts/${postId}/comments`, data);
    return response.data;
  },
  getReactions: async (postId: number) => {
    const response = await api.get<APIResponse<ReactionCount[]>>(`/public/posts/${postId}/reactions`);
    return response.data;
  },
  react: async (postId: number, emoji: string) => {
    const response = await api.post<APIResponse<ReactionCount[]>>(`/public/posts/${postId}/react`, { emoji });
    return response.data;
  },
  // Admin
  listAll: async (params?: { status?: string; offset?: number; limit?: number }) => {
    const response = await api.get<APIResponse<{ items: Comment[]; total: number }>>('/posts/comments', { params });
    return response.data;
  },
  getPendingCount: async () => {
    const response = await api.get<APIResponse<{ count: number }>>('/posts/comments/pending-count');
    return response.data;
  },
  approve: async (id: number) => {
    const response = await api.put<APIResponse<null>>(`/posts/comments/${id}/approve`);
    return response.data;
  },
  reject: async (id: number) => {
    const response = await api.put<APIResponse<null>>(`/posts/comments/${id}/reject`);
    return response.data;
  },
  deleteComment: async (id: number) => {
    const response = await api.delete<APIResponse<null>>(`/posts/comments/${id}`);
    return response.data;
  },
};

export const publicService = {
  getPosts: async (params?: {
    offset?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    tag_id?: number;
    is_featured?: boolean;
    nickname?: string;
  }) => {
    const response = await api.get<APIResponse<{ items: Post[]; total: number }>>('/public/posts', {
      params,
    });
    return response.data;
  },
  getPostBySlug: async (slug: string) => {
    const response = await api.get<APIResponse<Post>>(`/public/posts/${slug}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get<APIResponse<Category[]>>('/public/categories');
    return response.data;
  },
  getTags: async () => {
    const response = await api.get<APIResponse<Tag[]>>('/public/tags');
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post<APIResponse<null>>('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, new_password: string) => {
    const response = await api.post<APIResponse<null>>('/auth/reset-password', { token, new_password });
    return response.data;
  },
  getAuthors: async () => {
    const response = await api.get<APIResponse<Author[]>>('/public/authors');
    return response.data;
  },
  getAuthorById: async (id: number) => {
    const response = await api.get<APIResponse<Author>>(`/public/authors/${id}`);
    return response.data;
  },
  getAuthorByNickname: async (nickname: string) => {
    const response = await api.get<APIResponse<Author>>(`/public/authors/${nickname}`);
    return response.data;
  },
};

export interface DashboardStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  media_count: number;
  category_count: number;
  tag_count: number;
  posts_by_month: { month: string; count: number }[];
  views_by_day: DayViewCount[];
  recent_posts: Post[];
  storage_usage_mb: number;
}

export const dashboardService = {
  getStats: async () => {
    const response = await api.get<APIResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },
};

export const settingsService = {
  get: async () => {
    const response = await api.get<APIResponse<Record<string, string>>>('/settings');
    return response.data;
  },
  update: async (data: Record<string, string>) => {
    const response = await api.put<APIResponse<Record<string, string>>>('/settings', data);
    return response.data;
  },
};

export const profileService = {
  updateProfile: async (data: { name: string; nickname: string; email: string; avatar_url: string; bio?: string }) => {
    const response = await api.put<APIResponse<any>>('/auth/me', data);
    return response.data;
  },
  changePassword: async (data: { old_password: string; new_password: string }) => {
    const response = await api.put<APIResponse<null>>('/auth/password', data);
    return response.data;
  },
};

export const feedbackService = {
  sendFeedback: async (data: { name: string; email: string; subject?: string; content: string; rating: number }) => {
    const response = await api.post<APIResponse<Feedback>>('/public/feedbacks', data);
    return response.data;
  },
  listFeedbacks: async (params?: { status?: string; offset?: number; limit?: number }) => {
    const response = await api.get<APIResponse<{ items: Feedback[]; total: number }>>('/feedbacks', { params });
    return response.data;
  },
  updateFeedbackStatus: async (id: number, status: string) => {
    const response = await api.put<APIResponse<Feedback>>(`/feedbacks/${id}/status`, { status });
    return response.data;
  },
  deleteFeedback: async (id: number) => {
    const response = await api.delete<APIResponse<null>>(`/feedbacks/${id}`);
    return response.data;
  },
};

export const getFullUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  const origin = baseUrl.replace(/\/api$/, '');
  return `${origin}${path}`;
};
