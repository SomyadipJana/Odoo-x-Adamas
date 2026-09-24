// ============================================================
// API Utility — Fetch wrapper with JWT token management
// ============================================================

const TOKEN_KEY = 'hrms_token';
const USER_KEY = 'hrms_user';

/**
 * Get the stored JWT token.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set the JWT token.
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove stored auth data.
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get the cached user object.
 */
export function getCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Cache the user object.
 */
export function setCachedUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Check if user is authenticated (has a token).
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Make an authenticated API request.
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Parsed JSON response
 */
export async function api(url, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };

  // Only set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Invalid JSON response:', text);
    }
  }

  if (!response.ok) {
    const errorMessage = data.error || data.message || (text ? `HTTP ${response.status}: ${text.substring(0, 100)}` : `HTTP Error ${response.status}`);
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * GET request helper.
 */
export function apiGet(url) {
  return api(url, { method: 'GET' });
}

/**
 * POST request helper.
 */
export function apiPost(url, body) {
  return api(url, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

/**
 * PUT request helper.
 */
export function apiPut(url, body) {
  return api(url, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

/**
 * DELETE request helper.
 */
export function apiDelete(url) {
  return api(url, { method: 'DELETE' });
}
