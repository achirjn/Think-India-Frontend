// Simple Stale-While-Revalidate cache using Web Storage
// - sessionStorage (default): persists across reloads, NOT across tabs
// - localStorage: persists across reloads AND across tabs
// Also uses an in-memory map for fast access within the same tab session.

const MEM = new Map();
const PREFIX = 'swr:'; // storage key prefix

function now() {
  return Date.now();
}

function storageKey(key) {
  return PREFIX + key;
}

// Serialize to storage
function saveToStorage(key, entry, storage = 'session') {
  try {
    const target = storage === 'local' ? localStorage : sessionStorage
    target.setItem(storageKey(key), JSON.stringify(entry));
  } catch (_) {
    // Ignore quota or serialization errors; in-memory cache will still work in this tab
  }
}

// Load from storage
function loadFromStorage(key, storage = 'session') {
  try {
    const target = storage === 'local' ? localStorage : sessionStorage
    const raw = target.getItem(storageKey(key));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function isFresh(entry) {
  if (!entry) return false;
  if (typeof entry.expiresAt !== 'number') return false;
  return entry.expiresAt > now();
}

// Public API
export function cacheGet(key) {
  // 1) Try in-memory first
  const mem = MEM.get(key);
  if (isFresh(mem)) return mem.value;

  // 2) Fallback to sessionStorage
  const stored = loadFromStorage(key, 'session');
  if (isFresh(stored)) {
    MEM.set(key, stored); // hydrate memory
    return stored.value;
  }

  return undefined;
}

export function cacheSet(key, value, ttlMs = 300000) { // default 5 minutes
  const entry = { value, expiresAt: now() + Math.max(0, ttlMs) };
  MEM.set(key, entry);
  saveToStorage(key, entry, 'session');
}

export function cacheDelete(key) {
  MEM.delete(key);
  try { sessionStorage.removeItem(storageKey(key)); } catch (_) {}
}

// Local (cross-tab) variants
export function localCacheGet(key) {
  const mem = MEM.get(key);
  if (isFresh(mem)) return mem.value;
  const stored = loadFromStorage(key, 'local');
  if (isFresh(stored)) {
    MEM.set(key, stored);
    return stored.value;
  }
  return undefined;
}

export function localCacheSet(key, value, ttlMs = 300000) {
  const entry = { value, expiresAt: now() + Math.max(0, ttlMs) };
  MEM.set(key, entry);
  saveToStorage(key, entry, 'local');
}

export function cacheKeyForUrl(url, extra = '') {
  // Use full URL string + optional extra discriminator (e.g., auth role)
  return extra ? `${url}::${extra}` : url;
}

// Convenience: get cached value if any (fresh), then fetch in background and update cache.
// Returns a tuple: { cached, revalidate: Promise<value> }
export function swrFetch({ key, fetcher, ttlMs = 300000 }) {
  const cached = cacheGet(key);
  const revalidate = (async () => {
    const data = await fetcher();
    cacheSet(key, data, ttlMs);
    return data;
  })();
  return { cached, revalidate };
}
