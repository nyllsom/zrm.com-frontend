import axios from 'axios';
import { getToken, removeToken } from '@/api/auth';

export type ArticleCategory = 'tech' | 'note' | 'essay';
export type ArticleMode =
  | 'slide'
  | 'activity'
  | 'color'
  | 'elegant'
  | 'line'
  | 'minimal'
  | 'technical'
  | 'article'
  | 'homework';

export interface Article {
  id: string;
  title: string;
  author: string;
  category: string;
  date?: string;
  published?: boolean;
  content: string;
  cover?: string;
  defaultMode: ArticleMode;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleListResponse {
  items: Article[];
}

export interface CreateArticleRequest {
  title: string;
  author: string;
  category: string;
  date: string;
  published?: boolean;
  content: string;
  cover?: string;
  defaultMode: ArticleMode;
}

export interface CreateArticleResponse {
  id: string;
}

interface ArticleQueryOptions {
  withAuth?: boolean;
}

function createNoCacheConfig() {
  return {
    params: {
      _ts: Date.now(),
    },
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  };
}

const baseConfig = {
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

const publicHttp = axios.create(baseConfig);
const authedHttp = axios.create(baseConfig);

authedHttp.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleResponseError = (error: any) => {
  const message =
    error?.response?.data?.error ||
    error?.message ||
    '请求失败';
  return Promise.reject(new Error(message));
};

publicHttp.interceptors.response.use((response) => response, handleResponseError);
authedHttp.interceptors.response.use((response) => response, (error: any) => {
  if (error?.response?.status === 401) {
    removeToken();
    window.location.href = '/admin/login';
  }
  return handleResponseError(error);
});

export const articlesApi = {
  getArticles(options?: ArticleQueryOptions) {
    const client = options?.withAuth ? authedHttp : publicHttp;
    return client.get<ArticleListResponse>('/articles', createNoCacheConfig());
  },

  getArticleById(id: string, options?: ArticleQueryOptions) {
    const client = options?.withAuth ? authedHttp : publicHttp;
    return client.get<Article>(`/articles/${id}`, createNoCacheConfig());
  },

  createArticle(data: CreateArticleRequest) {
    return authedHttp.post<CreateArticleResponse>('/articles', data);
  },

  updateArticle(id: string, data: CreateArticleRequest) {
    return authedHttp.put<void>(`/articles/${id}`, data);
  },

  deleteArticle(id: string) {
    return authedHttp.delete<void>(`/articles/${id}`);
  },
};
