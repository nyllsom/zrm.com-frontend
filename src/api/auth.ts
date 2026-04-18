import axios from 'axios';

export interface LoginRequest {
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ErrorResponse {
  detail?: string;
  error?: string;
}

const TOKEN_KEY = 'admin_token';

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      '请求失败';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  /**
   * 管理员登录
   * POST /auth/login
   */
  login(data: LoginRequest) {
    return http.post<LoginResponse>('/auth/login', data);
  },
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 解析 JWT payload 中的 exp 字段，判断 token 是否仍在有效期内。
 * token 不存在、格式异常、已过期均返回 false。
 */
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}