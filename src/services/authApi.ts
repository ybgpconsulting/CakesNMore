import { AdminUser } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const SESSION_KEY = 'fnp_noida76_admin_user_v1';

class ApiRequestError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/api/${path}`, { ...options, credentials: 'include', headers: { 'content-type': 'application/json', ...(options?.headers || {}) } });
  if (!response.ok) { const payload = await response.json().catch(() => null) as { error?: string } | null; throw new ApiRequestError(response.status, payload?.error || `Request failed (${response.status})`); }
  return response.json() as Promise<T>;
}

export async function loginAdminWithCredentials(email: string, password: string): Promise<AdminUser> {
  if (!email.trim() || !password) throw new Error('Please enter both your administrator email and password.');
  const result = await request<{ user: AdminUser }>('auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
  return result.user;
}

export async function logoutAdminUser(): Promise<void> { await request('auth/logout', { method: 'POST' }).catch(() => undefined); sessionStorage.removeItem(SESSION_KEY); }
export async function resetAdminPassword(_email: string): Promise<void> { throw new Error('Password reset is not configured. Contact the store administrator.'); }
export function getStoredAdminUser(): AdminUser | null { try { const raw = sessionStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) as AdminUser : null; } catch { return null; } }

export function subscribeToAuthChanges(callback: (user: AdminUser | null) => void): () => void {
  const cachedUser = getStoredAdminUser();
  request<{ user: AdminUser | null }>('auth/me')
    .then(({ user }) => {
      if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(SESSION_KEY);
      callback(user);
    })
    .catch((error) => {
      if (cachedUser && (!(error instanceof ApiRequestError) || error.status >= 500)) {
        callback(cachedUser);
        return;
      }
      sessionStorage.removeItem(SESSION_KEY);
      callback(null);
    });
  return () => undefined;
}
