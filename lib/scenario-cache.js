/**
 * Scenario Cache Module
 * @version 1.0.0
 * @description In-memory caching system for scenario data with TTL (5 minutes)
 */

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory cache storage
const cache = new Map();

/**
 * Get cached data by key
 * @param {string} key - Cache key
 * @returns {*} Cached data or null if not found/expired
 */
function get(key) {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if expired
  const now = Date.now();
  if (now > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cache data with TTL
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: CACHE_TTL)
 */
function set(key, data, ttl = CACHE_TTL) {
  const expiresAt = Date.now() + ttl;

  cache.set(key, {
    data,
    expiresAt,
    createdAt: Date.now()
  });
}

/**
 * Invalidate specific cache key or pattern
 * @param {string|RegExp} keyOrPattern - Cache key or pattern to match
 */
function invalidate(keyOrPattern) {
  if (typeof keyOrPattern === 'string') {
    // Single key invalidation
    cache.delete(keyOrPattern);
  } else if (keyOrPattern instanceof RegExp) {
    // Pattern-based invalidation
    const keysToDelete = [];

    for (const key of cache.keys()) {
      if (keyOrPattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => cache.delete(key));
  }
}

/**
 * Clear all cache entries
 */
function clearAll() {
  cache.clear();
}

/**
 * Get cache statistics (for debugging)
 * @returns {Object} Cache stats
 */
function getStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  for (const entry of cache.values()) {
    if (now > entry.expiresAt) {
      expiredEntries++;
    } else {
      validEntries++;
    }
  }

  return {
    total: cache.size,
    valid: validEntries,
    expired: expiredEntries
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    get,
    set,
    invalidate,
    clearAll,
    getStats,
    CACHE_TTL
  };
}

// Browser export
if (typeof window !== 'undefined') {
  window.ScenarioCache = {
    get,
    set,
    invalidate,
    clearAll,
    getStats,
    CACHE_TTL
  };
}
