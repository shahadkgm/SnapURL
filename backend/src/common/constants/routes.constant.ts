/**
 * Centralized Route Constants for Nest.js Controllers.
 * Using these constants prevents typos in @Controller() and route method decorators (@Get, @Post, @Delete).
 */
export const ROUTES = {
  // Authentication Routes
  AUTH: {
    ROOT: 'api/auth',
    REGISTER: 'register', // POST /api/auth/register
    LOGIN: 'login',       // POST /api/auth/login
    LOGOUT: 'logout',     // POST /api/auth/logout
    ME: 'me',             // GET  /api/auth/me
  },

  // URL Shortening Routes (Protected)
  URLS: {
    ROOT: 'api/urls',
    GET_ALL: '',          // GET    /api/urls
    CREATE: '',           // POST   /api/urls
    GET_BY_ID: ':id',     // GET    /api/urls/:id
    DELETE: ':id',        // DELETE /api/urls/:id
  },

  // Public Redirection Route
  REDIRECT: {
    ROOT: 'r',
    BY_CODE: ':code',     // GET /r/:code
  },
} as const;
