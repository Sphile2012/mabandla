/**
 * Prince Math Academy — API client
 * Set VITE_API_BASE_URL in your .env to point at your backend.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

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

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    ...options,
  });

  if (!res.ok) {
    let errData;
    try { errData = await res.json(); } catch (e) { errData = {}; }
    const err = new Error(errData.message || errData.error || res.statusText);
    err.status = res.status;
    err.data = errData;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
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
  me: async () => {
    if (!getToken()) return null;
    try {
      return await request('GET', '/auth/me');
    } catch (error) {
      if (error.status === 401) setToken(null);
      throw error;
    }
  },
  updateMe: (data) => request('PATCH', '/auth/me', data),
  startTrial: (data) => request('POST', '/auth/start-trial', data),
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
  dailyChallenge: () => request('GET', '/functions/dailyChallenge'),
  submitDailyChallengeAnswer: (answer) => request('POST', '/functions/dailyChallenge/submit', { answer }),
};

const integrations = {
  Core: {
    UploadFile: async ({ file, kind }) => {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);
      const headers = {};
      if (token) headers['Authorization'] = 'Bearer ' + token;
      const res = await fetch(BASE_URL + '/upload' + (kind ? '?kind=' + kind : ''), { method: 'POST', headers, body: formData });
      if (!res.ok) {
        let data = {};
        try { data = await res.json(); } catch (e) { /* non-JSON error */ }
        const err = new Error(data.error || 'Upload failed');
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
  Badge: makeEntity('Badge'),
  UserBadge: makeEntity('UserBadge'),
  Announcement: makeEntity('Announcement'),
  VideoProgress: makeEntity('VideoProgress'),
  ForumPost: makeEntity('ForumPost'),
  ForumReply: makeEntity('ForumReply'),
  StudyGroup: makeEntity('StudyGroup'),
  StudyGroupMember: makeEntity('StudyGroupMember'),
  Feedback: makeEntity('Feedback'),
};

export const apiClient = { auth, entities, functions, integrations };
export { setToken, getToken };

export function getApiBaseUrl() {
  return BASE_URL;
}

export async function parseJsonBody(res) {
  try {
    return await res.json();
  } catch (e) {
    return {};
  }
}
