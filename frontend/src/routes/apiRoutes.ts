export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Centralized API endpoints / static routes.
 * Using this prevents hardcoded strings and provides autocomplete across the app.
 */
export const API_ROUTES = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  URLS: {
    BASE: '/api/urls',
    GET_MY_URLS: '/api/urls',
    CREATE: '/api/urls',
    DELETE: (id: string) => `/api/urls/${id}`,
    REDIRECT: (code: string) => `/r/${code}`,
  },
} as const;
