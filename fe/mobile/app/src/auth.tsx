import { createContext, useContext, useMemo, useState } from 'react';
import { api } from './api';

export type UserRole = 'inspector' | 'farm' | 'store' | 'transporter';
export type UserStatus = 'active' | 'inactive';

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
};

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  registerCustomer: (payload: CustomerRegistrationPayload) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
};

export type CustomerRegistrationPayload = {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_STORAGE_KEY = 'bluefood.auth.user';

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) as User : null;
  } catch {
    return null;
  }
}

function storeUser(user: User | null) {
  if (!user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  const value = useMemo<AuthContextValue>(() => ({
    user,
    login: async (email, password, role) => {
      if (!email.trim() || !password.trim()) return false;
      try {
        const { data } = await api.post<{ user: User }>('/auth/login', {
          email: email.trim(),
          password,
          ...(role ? { role } : {})
        });
        storeUser(data.user);
        setUser(data.user);
        return true;
      } catch {
        return false;
      }
    },
    registerCustomer: async (payload) => {
      if (!payload.fullName.trim() || !payload.username.trim() || !payload.email.trim() || !payload.password.trim()) return false;
      try {
        const { data } = await api.post<{ user: User }>('/auth/register-customer', {
          fullName: payload.fullName.trim(),
          username: payload.username.trim(),
          email: payload.email.trim(),
          phone: payload.phone?.trim() ?? '',
          password: payload.password
        });
        storeUser(data.user);
        setUser(data.user);
        return true;
      } catch {
        return false;
      }
    },
    logout: () => {
      storeUser(null);
      setUser(null);
    },
    updateProfile: (updates) => setUser((current) => {
      if (!current) return current;
      const nextUser = { ...current, ...updates };
      storeUser(nextUser);
      return nextUser;
    })
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
