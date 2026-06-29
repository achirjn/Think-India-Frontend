/**
 * Central configuration for the Think India SVNIT frontend.
 *
 * VITE_API_BASE_URL should be set in your deployment environment.
 * For Vercel: set VITE_API_BASE_URL = https://api.thinkindiasvnit.in
 * For local dev: create a .env.local file with the same variable.
 *
 * Falls back to https://api.thinkindiasvnit.in for production safety.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.thinkindiasvnit.in';
