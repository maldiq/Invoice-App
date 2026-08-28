const TOKEN_KEY = 'invoice_auth_token';
const USER_KEY = 'invoice_auth_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function apiRequest(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.error || 'Login diperlukan');
    error.status = 401;
    throw error;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const register = (data) =>
  apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const login = (data) =>
  apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const getMe = () => apiRequest('/api/auth/me');

export const changePassword = (data) =>
  apiRequest('/api/auth/password', { method: 'PUT', body: JSON.stringify(data) });
