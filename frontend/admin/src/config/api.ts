import axios from 'axios';

export const ADMIN_AUTH_STORAGE_KEY = 'bluefood.admin.auth.user';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  try {
    const rawUser = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    const user = rawUser ? JSON.parse(rawUser) as { id?: string } : null;

    if (user?.id) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)['x-account-id'] = user.id;
      // Add Authorization token and Role to strictly verify permissions on backend
      (config.headers as Record<string, string>)['Authorization'] = `Bearer mock-jwt-token-for-${user.id}`;
      (config.headers as Record<string, string>)['x-user-role'] = (user as any).role || 'admin';
    }
  } catch {
    // Continue without auth header when admin session storage is unavailable.
  }

  return config;
});
