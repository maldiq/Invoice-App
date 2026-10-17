import { getToken, clearAuth } from './authApi';

const BASE = '/api/settings';

async function handle(res) {
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
  return res.json();
}

export const getSettings = () => {
  const token = getToken();
  return fetch(BASE, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then(handle);
};

export const uploadLogo = (file) => {
  const token = getToken();
  const body = new FormData();
  body.append('logo', file);
  return fetch(`${BASE}/logo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  }).then(handle);
};

export const deleteLogo = () => {
  const token = getToken();
  return fetch(`${BASE}/logo`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(handle);
};
