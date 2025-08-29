// Centralized API configuration
// You can override via Vite env: VITE_API_BASE_URL
// Option B (Vercel proxy): default to '/api' when site is served over HTTPS to avoid mixed-content and CORS
const inferredBase = (() => {
  const envBase = import.meta?.env?.VITE_API_BASE_URL
  if (envBase) return envBase
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
    return '/api'
  }
  return 'http://api-thinkindiasvnit.ap-south-1.elasticbeanstalk.com/'
})()

export const API_BASE_URL = String(inferredBase).replace(/\/$/, '')

// Safely join base URL with a path or absolute URL
export function apiUrl(path = '') {
  if (!path) return API_BASE_URL
  // If path already absolute (http/https), return as-is
  if (/^https?:\/\//i.test(path)) return path
  // Ensure leading slash
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${clean}`
}
