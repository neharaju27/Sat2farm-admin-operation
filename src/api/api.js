const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const STORAGE_KEY = 'sat2farm_user';

/**
 * Fetch-based API utility with JWT token auto-attachment
 * and 401 response handling.
 */
async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach JWT token from localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const { jwt, token } = JSON.parse(stored);
      const actualToken = jwt || token;
      if (actualToken) {
        headers['Authorization'] = `Bearer ${actualToken}`;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const response = await fetch(url.startsWith('http') ? url : `${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Handle 401 globally — clear session and reload to login
  if (response.status === 401) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
    return Promise.reject(new Error('Session expired. Please log in again.'));
  }

  return response;
}

const API = {
  get: (url, options = {}) =>
    request(url, { ...options, method: 'GET' }),

  post: (url, body, options = {}) =>
    request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: (url, body, options = {}) =>
    request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (url, options = {}) =>
    request(url, { ...options, method: 'DELETE' }),
};

export default API;
export { STORAGE_KEY };
