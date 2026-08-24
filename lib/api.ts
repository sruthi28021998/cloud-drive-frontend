const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function rawFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

let refreshPromise: Promise<void> | null = null;

async function request(path: string, options: RequestInit = {}) {
  let res = await rawFetch(path, options);

  if (res.status === 401 && path !== '/api/auth/refresh' && path !== '/api/auth/login') {
    if (!refreshPromise) {
      refreshPromise = rawFetch('/api/auth/refresh', { method: 'POST' })
        .then((r) => {
          if (!r.ok) throw new Error('refresh failed');
        })
        .finally(() => { refreshPromise = null; });
    }

    try {
      await refreshPromise;
      res = await rawFetch(path, options);
    } catch {
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (data: { email: string; password: string; name: string }) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => request('/api/auth/logout', { method: 'POST' }),

  me: () => request('/api/auth/me'),

  lookupByEmail: (email: string) =>
    request(`/api/auth/lookup?email=${encodeURIComponent(email)}`),

  getRoot: () => request('/api/folders/root'),

  getFolder: (id: string) => request(`/api/folders/${id}`),

  createFolder: (data: { name: string; parentId: string | null }) =>
    request('/api/folders', { method: 'POST', body: JSON.stringify(data) }),

  renameFolder: (id: string, name: string) =>
    request(`/api/folders/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),

  moveFolder: (id: string, parentId: string | null) =>
    request(`/api/folders/${id}`, { method: 'PATCH', body: JSON.stringify({ parentId }) }),

  deleteFolder: (id: string) => request(`/api/folders/${id}`, { method: 'DELETE' }),

  initUpload: (data: { name: string; mimeType: string; sizeBytes: number; folderId: string | null }) =>
    request('/api/files/init', { method: 'POST', body: JSON.stringify(data) }),

  completeUpload: (data: { fileId: string; checksum?: string }) =>
    request('/api/files/complete', { method: 'POST', body: JSON.stringify(data) }),

  getFile: (id: string) => request(`/api/files/${id}`),

  renameFile: (id: string, name: string) =>
    request(`/api/files/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),

  moveFile: (id: string, folderId: string | null) =>
    request(`/api/files/${id}`, { method: 'PATCH', body: JSON.stringify({ folderId }) }),

  deleteFile: (id: string) => request(`/api/files/${id}`, { method: 'DELETE' }),

  search: (q: string, type?: string, sort?: string) =>
    request(`/api/search?q=${encodeURIComponent(q)}${type ? `&type=${encodeURIComponent(type)}` : ''}${sort ? `&sort=${encodeURIComponent(sort)}` : ''}`),

  getStarred: () => request('/api/search?starred=true'),

  createShare: (data: { resourceType: string; resourceId: string; granteeUserId: string; role: string }) =>
    request('/api/shares', { method: 'POST', body: JSON.stringify(data) }),

  listSharesFor: (resourceType: string, resourceId: string) =>
    request(`/api/shares/${resourceType}/${resourceId}`),

  revokeShare: (id: string) =>
    request(`/api/shares/${id}`, { method: 'DELETE' }),

  createLinkShare: (data: { resourceType: string; resourceId: string; expiresAt?: string; password?: string }) =>
    request('/api/shares/link', { method: 'POST', body: JSON.stringify(data) }),

  resolveLink: (token: string, password?: string) =>
    request(`/api/shares/link/${token}${password ? `?password=${encodeURIComponent(password)}` : ''}`),

  addStar: (data: { resourceType: string; resourceId: string }) =>
    request('/api/stars', { method: 'POST', body: JSON.stringify(data) }),

  removeStar: (data: { resourceType: string; resourceId: string }) =>
    request('/api/stars', { method: 'DELETE', body: JSON.stringify(data) }),

  listTrash: () => request('/api/trash'),

  restoreFromTrash: (data: { resourceType: string; resourceId: string }) =>
    request('/api/trash/restore', { method: 'POST', body: JSON.stringify(data) })
};