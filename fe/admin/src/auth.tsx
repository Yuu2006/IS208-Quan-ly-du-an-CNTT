import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { AxiosError } from 'axios';
import { api, ADMIN_AUTH_STORAGE_KEY } from './config/api';

export type AdminUser = {
  id: string;
  username?: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin';
  status: 'active';
};

export type AdminLoginError =
  | 'empty'
  | 'invalid'
  | 'locked'
  | 'forbidden'
  | 'server';

type AuthContextValue = {
  user: AdminUser | null;
  loginAdmin: (identifier: string, password: string) => Promise<{ ok: true } | { ok: false; reason: AdminLoginError }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Đọc phiên đăng nhập Admin để refresh trang vẫn giữ trạng thái hợp lệ. */
function readStoredAdminUser() {
  try {
    const raw = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    const user = raw ? JSON.parse(raw) as AdminUser : null;
    return isAdminUser(user) ? user : null;
  } catch {
    return null;
  }
}

/** Lưu hoặc xóa phiên Admin riêng, không ảnh hưởng phiên Mobile/User. */
function storeAdminUser(user: AdminUser | null) {
  if (!user) {
    window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(user));
}

/** Kiểm tra quyền Admin trước khi cho vào dashboard quản trị. */
function isAdminUser(user: AdminUser | null): user is AdminUser {
  return user?.role === 'admin' && user.status === 'active';
}

/** Chuẩn hóa lỗi đăng nhập Admin theo nghiệp vụ hiển thị trên form. */
function mapAdminLoginError(error: unknown): AdminLoginError {
  if (!(error instanceof AxiosError)) return 'server';

  const status = error.response?.status;
  const message = String(error.response?.data?.message ?? '').toLowerCase();

  if (status === 400) return 'empty';
  if (status === 403 && message.includes('locked')) return 'locked';
  if (status === 403) return 'forbidden';
  if (status === 401) return 'invalid';
  return 'server';
}

/** Cung cấp trạng thái đăng nhập và thao tác login/logout cho khu vực Admin. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => readStoredAdminUser());

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loginAdmin: async (identifier, password) => {
      const trimmedIdentifier = identifier.trim();
      if (!trimmedIdentifier || !password.trim()) return { ok: false, reason: 'empty' };

      try {
        const { data } = await api.post<{ user: AdminUser }>('/auth/login', {
          email: trimmedIdentifier,
          password,
          role: 'admin'
        });

        if (!isAdminUser(data.user)) return { ok: false, reason: 'forbidden' };

        storeAdminUser(data.user);
        setUser(data.user);
        return { ok: true };
      } catch (error) {
        return { ok: false, reason: mapAdminLoginError(error) };
      }
    },
    logout: () => {
      storeAdminUser(null);
      setUser(null);
    }
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Truy cập Auth context của Admin trong layout, guard và trang đăng nhập. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
