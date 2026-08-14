const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('ems_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 401) {
    onUnauthorized();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error || 'Unable to reach the server.');
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}
