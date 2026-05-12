/**
 * Prince Math Academy — API client
 * Set VITE_API_BASE_URL in your .env to point at your backend.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export function getApiBaseUrl() {
  return BASE_URL;
}

/** Parse JSON from a fetch Response; throws if body is HTML (e.g. SPA index). */
export async function parseJsonBody(res) {
  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.startsWith('<')) {
    throw new Error(
      'The server returned a web page instead of API data. /api may not be reaching the Netlify function — redeploy and check Netlify redirects and env vars.'
    );
  }
  try {
    return trimmed ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function getToken() {
  return localStorage.getItem('access_token') || null;
}
function setToken(token) {
  if (token) localStorage.setItem('access_token', token);
  else localStorage.removeItem('access_token');
}

async function request(method, path, body, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      ...options,
    });
  } catch (e) {
    const err = new Error(
      'Cannot reach the API. Check your internet connection, whether this site loads (DNS), and that the backend is deployed on Netlify with env vars set.'
    );
    err.cause = e;
    throw err;
  }

  if (res.status === 204 || res.status === 205) return null;

  const text = await res.text();
  const trimmed = text.trim();
  let data = null;
  if (trimmed) {
    if (trimmed.startsWith('<')) {
      const err = new Error(
        'The server returned a web page instead of API data — /api is probably not reaching the Netlify function. Redeploy the site and confirm netlify.toml redirects.'
      );
      err.status = res.status;
      throw err;
    }
    try {
      data = JSON.parse(text);
    } catch {
      const err = new Error((trimmed.slice(0, 120) || res.statusText) + ' (invalid JSON)');
      err.status = res.status;
      throw err;
    }
  } else {
    data = {};
  }

  if (!res.ok) {
    const err = new Error((data && (data.message || data.error)) || res.statusText);
    err.status = res.status;
    err.data = data || {};
    throw err;
  }

  return data;
}

function makeEntity(name) {
  const base = '/entities/' + name;
  return {
    list: (sort, limit) => {
      const params = new URLSearchParams();
      if (sort) params.set('sort', sort);
      if (limit) params.set('limit', String(limit));
      const qs = params.toString();
      return request('GET', base + (qs ? '?' + qs : ''));
    },
    filter: (filters, sort, limit) => {
      const params = new URLSearchParams();
      if (filters) params.set('filters', JSON.stringify(filters));
      if (sort) params.set('sort', sort);
      if (limit) params.set('limit', String(limit));
      const qs = params.toString();
      return request('GET', base + (qs ? '?' + qs : ''));
    },
    get: (id) => request('GET', base + '/' + id),
    create: (data) => request('POST', base, data),
    update: (id, data) => request('PATCH', base + '/' + id, data),
    delete: (id) => request('DELETE', base + '/' + id),
  };
}

const auth = {
  me: () => request('GET', '/auth/me'),
  updateMe: (data) => request('PATCH', '/auth/me', data),
  logout: (redirectUrl) => {
    setToken(null);
    if (redirectUrl) window.location.href = redirectUrl;
  },
  redirectToLogin: (returnUrl) => {
    const loginUrl = import.meta.env.VITE_LOGIN_URL || '/Login';
    const url = returnUrl
      ? loginUrl + '?return_url=' + encodeURIComponent(returnUrl)
      : loginUrl;
    window.location.href = url;
  },
};

const functions = {
  invoke: (name, payload) => request('POST', '/functions/' + name, payload),
};

const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);
      const headers = {};
      if (token) headers['Authorization'] = 'Bearer ' + token;
      const res = await fetch(BASE_URL + '/upload', { method: 'POST', headers, body: formData });
      if (!res.ok) {
        const err = new Error('Upload failed');
        err.status = res.status;
        throw err;
      }
      return res.json();
    },
  },
};

const entities = {
  Video: makeEntity('Video'),
  Favorite: makeEntity('Favorite'),
  Comment: makeEntity('Comment'),
  XPEvent: makeEntity('XPEvent'),
  Notification: makeEntity('Notification'),
  Message: makeEntity('Message'),
  User: makeEntity('User'),
};

export const apiClient = { auth, entities, functions, integrations };
export { setToken, getToken };
