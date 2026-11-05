/**
 * Danh sách hằng số các Endpoint API của backend my-first-api
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    LIST: '/users',
    ADMIN_LIST: '/admin/users',
  },
  HEALTH: {
    ROOT: '/health',
    HEALTHZ: '/healthz',
    LIVE: '/health/live',
    READY: '/health/ready',
  },
} as const
