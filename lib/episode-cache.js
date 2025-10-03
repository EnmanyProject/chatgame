/**
 * Episode Cache Module
 * @version 1.0.0
 * @description In-memory caching system for episode data
 */

const EPISODE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// In-memory cache storage
const episodeCache = new Map();

/**
 * Get cached episode by key
 * @param {string} episodeKey - Episode cache key
 * @returns {*} Cached episode or null if not found/expired
 */
function getCachedEpisode(episodeKey) {
  const entry = episodeCache.get(episodeKey);

  if (!entry) {
    return null;
  }

  // Check if expired
  const now = Date.now();
  if (now > entry.expiresAt) {
    episodeCache.delete(episodeKey);
    return null;
  }

  return entry.data;
}

/**
 * Set cached episode
 * @param {string} episodeKey - Episode cache key
 * @param {*} episode - Episode data to cache
 */
function setCachedEpisode(episodeKey, episode) {
  const expiresAt = Date.now() + EPISODE_CACHE_TTL;

  episodeCache.set(episodeKey, {
    data: episode,
    expiresAt,
    createdAt: Date.now()
  });
}

/**
 * Generate episode cache key
 * @param {object} scenario - Scenario object
 * @param {object} beat - Beat object
 * @param {object} state - Game state
 * @returns {string} Cache key
 */
function generateEpisodeKey(scenario, beat, state) {
  return `${scenario.id}_act${beat.act_number || 1}_beat${beat.beat_number}_aff${Math.floor(state.affection / 10)}`;
}

/**
 * Clear all episode cache
 */
function clearEpisodeCache() {
  episodeCache.clear();
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCachedEpisode,
    setCachedEpisode,
    generateEpisodeKey,
    clearEpisodeCache
  };
}

// Browser export
if (typeof window !== 'undefined') {
  window.EpisodeCache = {
    getCachedEpisode,
    setCachedEpisode,
    generateEpisodeKey,
    clearEpisodeCache
  };
}
