// JWT Token Management
const TOKEN_KEY = 'auth_token';

/**
 * Stores the authentication token in localStorage.
 * @param {string} token - The raw JWT token string (without "Bearer ").
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Removes the authentication token to log the user out.
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Checks if a user is authenticated by verifying the presence of a token.
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * A wrapper around `fetch` that automatically handles authentication headers
 * for both JSON and FormData requests.
 * @param {string} url - The URL to fetch.
 * @param {object} options - Optional fetch options (method, body, etc.).
 * @returns {Promise<Response>}
 */
export const authFetch = async (url, options = {}) => {
  const token = getToken();

  // Start with any headers that were passed in the options
  const headers = { ...options.headers };

  // If a token exists, add the Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ✅ KEY CHANGE: Only set Content-Type if the body exists and is NOT FormData.
  // This allows the browser to correctly set the multipart header for file uploads.
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Construct the final options for the fetch call
  const finalOptions = {
    ...options,
    headers,
  };

  const response = await fetch(url, finalOptions);

  // Handles expired tokens by redirecting to the login page.
  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Authentication expired. Please login again.');
  }

  return response;
};

/**
 * A simple wrapper for public API calls that do not require authentication.
 * @param {string} url - The URL to fetch.
 * @param {object} options - Optional fetch options.
 * @returns {Promise<Response>}
 */
export const publicFetch = async (url, options = {}) => {
  return fetch(url, options);
};