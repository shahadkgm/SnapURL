import { API_BASE_URL, API_ROUTES } from './routes/apiRoutes';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface UrlItem {
  id: string;
  originalUrl: string;
  shortCode: string;
  title?: string;
  clicks: number;
  createdAt: string;
  userId: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('snapurl_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem('snapurl_token');
  },

  setToken(token: string): void {
    localStorage.setItem('snapurl_token', token);
  },

  removeToken(): void {
    localStorage.removeItem('snapurl_token');
    localStorage.removeItem('snapurl_user');
  },

  getUser(): User | null {
    const raw = localStorage.getItem('snapurl_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem('snapurl_user', JSON.stringify(user));
  },

  // Auth endpoints
  async register(body: { email: string; password: string; name?: string }): Promise<AuthResponse> {
    const data = await request<AuthResponse>(API_ROUTES.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    return data;
  },

  async login(body: { email: string; password: string }): Promise<AuthResponse> {
    const data = await request<AuthResponse>(API_ROUTES.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    return data;
  },

  async getMe(): Promise<User> {
    return request<User>(API_ROUTES.AUTH.ME);
  },

  // URL Shortening endpoints
  async createUrl(body: { originalUrl: string; title?: string; customCode?: string }): Promise<UrlItem> {
    return request<UrlItem>(API_ROUTES.URLS.CREATE, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async getMyUrls(): Promise<UrlItem[]> {
    return request<UrlItem[]>(API_ROUTES.URLS.GET_MY_URLS);
  },

  async deleteUrl(id: string): Promise<{ success: boolean; message?: string }> {
    return request<{ success: boolean; message?: string }>(API_ROUTES.URLS.DELETE(id), {
      method: 'DELETE',
    });
  },
};
