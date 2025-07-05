import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  hits: number;
  misses: number;
}

const CACHE_PREFIX = 'plushify_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const useCacheManager = () => {
  const [stats, setStats] = useState<CacheStats>({
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    hits: 0,
    misses: 0
  });

  // Set cache entry
  const setCache = useCallback(<T>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        key
      };
      
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
      updateStats();
    } catch (error) {
      console.warn('Failed to set cache:', error);
    }
  }, []);

  // Get cache entry
  const getCache = useCallback(<T>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) {
        updateMissStats();
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        updateMissStats();
        return null;
      }

      updateHitStats();
      return entry.data;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      updateMissStats();
      return null;
    }
  }, []);

  // Clear specific cache entry
  const clearCache = useCallback((key: string) => {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    updateStats();
  }, []);

  // Clear all cache entries
  const clearAllCache = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
    updateStats();
  }, []);

  // Update cache statistics
  const updateStats = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    let totalSize = 0;
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    });

    setStats(prev => ({
      ...prev,
      totalEntries: keys.length,
      totalSize,
      hitRate: prev.hits + prev.misses > 0 ? (prev.hits / (prev.hits + prev.misses)) * 100 : 0,
      missRate: prev.hits + prev.misses > 0 ? (prev.misses / (prev.hits + prev.misses)) * 100 : 0
    }));
  }, []);

  const updateHitStats = useCallback(() => {
    setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
  }, []);

  const updateMissStats = useCallback(() => {
    setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
  }, []);

  // Clean expired cache entries
  const cleanExpiredCache = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
    let cleaned = 0;
    
    keys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (Date.now() - entry.timestamp > entry.ttl) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      } catch (error) {
        // Remove invalid entries
        localStorage.removeItem(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      updateStats();
    }
    
    return cleaned;
  }, []);

  // Cache with automatic refresh
  const getCacheWithRefresh = useCallback(async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = DEFAULT_TTL
  ): Promise<T> => {
    const cached = getCache<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetchFn();
      setCache(key, data, ttl);
      return data;
    } catch (error) {
      console.error('Failed to fetch and cache data:', error);
      throw error;
    }
  }, [getCache, setCache]);

  // Initialize stats and cleanup on mount
  useEffect(() => {
    updateStats();
    const cleaned = cleanExpiredCache();
    
    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} expired cache entries`);
    }

    // Set up periodic cleanup
    const cleanupInterval = setInterval(() => {
      cleanExpiredCache();
    }, 10 * 60 * 1000); // Every 10 minutes

    return () => clearInterval(cleanupInterval);
  }, [updateStats, cleanExpiredCache]);

  return {
    setCache,
    getCache,
    clearCache,
    clearAllCache,
    cleanExpiredCache,
    getCacheWithRefresh,
    stats
  };
};