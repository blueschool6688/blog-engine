import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
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
  type: 'image' | 'video' | 'document';
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
  name_en?: string;
  slug: string;
  slug_en?: string;
  description?: string;
  description_en?: string;
  parent_id?: number | null;
  parent?: Category | null;
  children?: Category[];
  deleted_at?: string | null;
}

export interface Tag {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  deleted_at?: string | null;
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
  spam_score?: number;
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
  title_en?: string;
  slug: string;
  slug_en?: string;
  content: string;
  content_en?: string;
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
  excerpt_en?: string;
  is_featured?: boolean;
  published_at?: string | null;
  view_count?: number;
  is_document?: boolean;
  pdf_media_id?: number | null;
  pdf_media?: Media | null;
  deleted_at?: string | null;
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
  list: async (offset = 0, limit = 10, status = '', search = '', category_id?: number, tag_id?: number, is_featured?: boolean, with_deleted = false) => {
    const response = await api.get<APIResponse<{ items: Post[]; total: number }>>('/posts', {
      params: { offset, limit, status, search, category_id, tag_id, is_featured, with_deleted },
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
  delete: async (id: number, force = false) => {
    const response = await api.delete<APIResponse<null>>(`/posts/${id}`, { params: { force } });
    return response.data;
  },
  restore: async (id: number) => {
    const response = await api.post<APIResponse<null>>(`/posts/${id}/restore`);
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
  list: async (with_deleted = false) => {
    const response = await api.get<APIResponse<Category[]>>('/categories', { params: { with_deleted } });
    return response.data;
  },
  create: async (data: { name: string; name_en?: string; slug?: string; slug_en?: string; description?: string; description_en?: string; parent_id?: number | null }) => {
    const response = await api.post<APIResponse<Category>>('/categories', data);
    return response.data;
  },
  update: async (id: number, data: { name: string; name_en?: string; slug?: string; slug_en?: string; description?: string; description_en?: string; parent_id?: number | null }) => {
    const response = await api.put<APIResponse<Category>>(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number, force = false) => {
    const response = await api.delete<APIResponse<null>>(`/categories/${id}`, { params: { force } });
    return response.data;
  },
  restore: async (id: number) => {
    const response = await api.post<APIResponse<null>>(`/categories/${id}/restore`);
    return response.data;
  },
};

export const tagService = {
  list: async (with_deleted = false) => {
    const response = await api.get<APIResponse<Tag[]>>('/tags', { params: { with_deleted } });
    return response.data;
  },
  create: async (data: { name: string; slug?: string }) => {
    const response = await api.post<APIResponse<Tag>>('/tags', data);
    return response.data;
  },
  delete: async (id: number, force = false) => {
    const response = await api.delete<APIResponse<null>>(`/tags/${id}`, { params: { force } });
    return response.data;
  },
  restore: async (id: number) => {
    const response = await api.post<APIResponse<null>>(`/tags/${id}/restore`);
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
  getPublic: async () => {
    const response = await api.get<APIResponse<Record<string, string>>>('/public/settings');
    return response.data;
  },
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

// ─── Translate Service ────────────────────────────────────────────────────────

export interface TranslateRequest {
  content: string;
  target_lang: 'vi' | 'en';
  source_lang?: string;
}

export interface TranslateResponse {
  translated_text: string;
  source_lang: string;
  from_cache: boolean;
  /** true nếu một số chunk dịch thất bại — phần đó là nội dung gốc */
  partial?: boolean;
  error?: string;
  /** Điền khi backend chuyển sang async mode */
  job_id?: string;
  status?: 'pending' | 'processing' | 'done' | 'failed';
}

export interface AsyncJobResult {
  job_id: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  translated_text?: string;
  partial?: boolean;
  error?: string;
}

export interface BatchTranslateResponse {
  results: TranslateResponse[];
}

export interface TranslateJob {
  id: number;
  job_id: string;
  content: string;
  target_lang: string;
  source_lang: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  result?: string;
  created_at: string;
  updated_at: string;
}

/**
 * translateService cung cấp các method để dịch nội dung động qua backend AI.
 * KHÔNG gọi trực tiếp NVIDIA API từ frontend — mọi request phải qua backend.
 */
export const translateService = {
  /** Dịch một đoạn nội dung đơn lẻ (tự động async nếu > 3000 chars) */
  translate: async (req: TranslateRequest): Promise<APIResponse<TranslateResponse>> => {
    const response = await api.post<APIResponse<TranslateResponse>>('/translate', req);
    return response.data;
  },

  /** Luôn tạo async job bất kể độ dài content */
  translateAsync: async (req: TranslateRequest): Promise<APIResponse<TranslateResponse>> => {
    const response = await api.post<APIResponse<TranslateResponse>>('/translate/async', req);
    return response.data;
  },

  /** Lấy trạng thái và kết quả của async job */
  pollJob: async (jobId: string): Promise<APIResponse<AsyncJobResult>> => {
    const response = await api.get<APIResponse<AsyncJobResult>>(`/translate/async/${jobId}`);
    return response.data;
  },

  /** Dịch hàng loạt (batch), tối đa 20 items */
  batch: async (items: TranslateRequest[]): Promise<APIResponse<BatchTranslateResponse>> => {
    const response = await api.post<APIResponse<BatchTranslateResponse>>('/translate/batch', { items });
    return response.data;
  },

  /** Lấy danh sách jobs trong admin (phân trang) */
  listJobs: async (params?: { offset?: number; limit?: number }): Promise<APIResponse<{ items: TranslateJob[]; total: number }>> => {
    const response = await api.get<APIResponse<{ items: TranslateJob[]; total: number }>>('/translate/jobs', { params });
    return response.data;
  },

  /** Đặt lại trạng thái job để thử dịch lại */
  retryJob: async (jobId: string): Promise<APIResponse<null>> => {
    const response = await api.post<APIResponse<null>>(`/translate/jobs/${jobId}/retry`);
    return response.data;
  },

  /** Xóa job khỏi database */
  deleteJob: async (jobId: string): Promise<APIResponse<null>> => {
    const response = await api.delete<APIResponse<null>>(`/translate/jobs/${jobId}`);
    return response.data;
  },
};

export interface AISummarizeResponse {
  summary: string;
  summary_en?: string;
}

export interface AIGenerateResponse {
  title_vi: string;
  title_en: string;
  content_vi: string;
  content_en: string;
  meta_title_vi: string;
  meta_title_en: string;
  meta_desc_vi: string;
  meta_desc_en: string;
  excerpt_vi: string;
  excerpt_en: string;
  suggested_tags: string[];
}

export interface AIKeywordsResponse {
  keywords: string[];
}

export interface AISEOResponse {
  score: number;
  grade: string;
  suggestions: string[];
}

export interface AIAltTextResponse {
  alt_text: string;
}

export interface AISentimentResponse {
  sentiment: string;
  score: number;
}

export const aiService = {
  generatePost: async (topic: string): Promise<APIResponse<AIGenerateResponse>> => {
    const response = await api.post<APIResponse<AIGenerateResponse>>('/ai/generate-post', { topic });
    return response.data;
  },
  summarize: async (content: string, language: 'vi' | 'en' | 'both', maxWords?: number): Promise<APIResponse<AISummarizeResponse>> => {
    const response = await api.post<APIResponse<AISummarizeResponse>>('/ai/summarize', { content, language, max_words: maxWords });
    return response.data;
  },
  extractKeywords: async (content: string, language: string): Promise<APIResponse<AIKeywordsResponse>> => {
    const response = await api.post<APIResponse<AIKeywordsResponse>>('/ai/keywords', { content, language });
    return response.data;
  },
  scoreSEO: async (title: string, metaDesc: string, content: string): Promise<APIResponse<AISEOResponse>> => {
    const response = await api.post<APIResponse<AISEOResponse>>('/ai/seo-score', { title, meta_desc: metaDesc, content });
    return response.data;
  },
  generateAltText: async (imageUrl: string, context?: string): Promise<APIResponse<AIAltTextResponse>> => {
    const response = await api.post<APIResponse<AIAltTextResponse>>('/ai/alt-text', { image_url: imageUrl, context });
    return response.data;
  },
  analyzeSentiment: async (author: string, content: string): Promise<APIResponse<AISentimentResponse>> => {
    const response = await api.post<APIResponse<AISentimentResponse>>('/ai/sentiment', { author, content });
    return response.data;
  },
};

