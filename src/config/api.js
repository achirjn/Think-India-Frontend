// Centralized API configuration
// You can override via Vite env: VITE_API_BASE_URL
export const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || 'http://api-thinkindiasvnit.ap-south-1.elasticbeanstalk.com/').replace(/\/$/, '')

// Safely join base URL with a path or absolute URL
export function apiUrl(path = '') {
  if (!path) return API_BASE_URL
  // If path already absolute (http/https), return as-is
  if (/^https?:\/\//i.test(path)) return path
  // Ensure leading slash
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${clean}`
}
