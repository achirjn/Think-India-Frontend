// JWT Token Management
import { apiUrl } from '../config/api'
const TOKEN_KEY = 'auth_token';

/**
 * Stores the authentication token in localStorage.
 * @param {string} token - The raw JWT token string (without "Bearer ").
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null}
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Removes the authentication token to log the user out.
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Checks if a user is authenticated by verifying the presence and validity of a token.
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Parse JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      console.log('🔍 Token expired, removing from localStorage');
      removeToken();
      localStorage.removeItem('is_admin');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('🔍 Invalid token format, removing from localStorage');
    removeToken();
    localStorage.removeItem('is_admin');
    return false;
  }
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
  const headers = { ...options.headers }

  // If a token exists, add the Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Only set Content-Type if the body exists and is NOT FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  // Construct the final options for the fetch call
  const finalOptions = {
    ...options,
    headers,
  }

  // Normalize URL through apiUrl so callers can pass relative paths
  const response = await fetch(apiUrl(url), finalOptions)

  // Handles expired tokens by redirecting to the login page
  if (response.status === 401) {
    removeToken()
    window.location.href = '/login'
    throw new Error('Authentication expired. Please login again.')
  }

  return response
}

/**
 * A simple wrapper for public API calls that do not require authentication.
 * @param {string} url - The URL to fetch.
 * @param {object} options - Optional fetch options.
 * @returns {Promise<Response>}
 */
export const publicFetch = async (url, options = {}) => {
  return fetch(apiUrl(url), options)
}