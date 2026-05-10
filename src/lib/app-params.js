// App parameters — reads access_token from URL (OAuth callback) and stores it.
// All other config comes from Vite env vars (VITE_*).

function getAccessTokenFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('access_token');
  if (token) {
    localStorage.setItem('access_token', token);
    // Remove from URL to keep it clean
    params.delete('access_token');
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  return token || localStorage.getItem('access_token');
}

// Trigger token extraction on load
if (typeof window !== 'undefined') {
  getAccessTokenFromUrl();
}

export const appParams = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
};
