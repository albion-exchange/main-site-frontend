/**
 * CacheService - Centralized caching logic
 * 
 * Responsibilities:
 * - Provide generic caching mechanisms
 * - Handle cache invalidation
 * - Implement cache policies (TTL, size limits)
 * - Cache statistics and monitoring
 * 
 * Used by:
 * - AssetService for asset data caching
 * - TokenService for token data caching
 * - Other services that need caching
 */

import { errorHandler } from '$lib/utils/errorHandling';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  onEviction?: (key: string, value: any) => void; // Callback when item is evicted
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  accessCount: number;
  lastAccess: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

/**
 * Generic cache implementation with TTL and size limits
 */
export class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private stats: CacheStats;
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize ?? 1000, // 1000 items default
      onEviction: options.onEviction ?? (() => {})
    };

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize: this.options.maxSize,
      hitRate: 0
    };
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccess = Date.now();
    
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    try {
      // Check if we need to evict items
      if (this.store.size >= this.options.maxSize && !this.store.has(key)) {
        this.evictLeastRecentlyUsed();
      }

      const now = Date.now();
      const entry: CacheEntry<T> = {
        value,
        timestamp: now,
        ttl: ttl ?? this.options.ttl,
        accessCount: 0,
        lastAccess: now
      };

      this.store.set(key, entry);
      this.stats.size = this.store.size;
    } catch (error) {
      errorHandler.handleRaw(error as Error, { 
        component: 'CacheService', 
        action: 'set', 
        key 
      });
    }
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const entry = this.store.get(key);
    if (entry) {
      this.options.onEviction(key, entry.value);
    }
    
    const deleted = this.store.delete(key);
    this.stats.size = this.store.size;
    return deleted;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.forEach((entry, key) => {
      this.options.onEviction(key, entry.value);
    });
    
    this.store.clear();
    this.stats.size = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.hitRate = 0;
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let cleanedCount = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.store.entries()) {
      if (this.isExpired(entry, now)) {
        this.delete(key);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }

  /**
   * Get cache entry info for debugging
   */
  getEntryInfo(key: string): Partial<CacheEntry<T>> | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    return {
      timestamp: entry.timestamp,
      ttl: entry.ttl,
      accessCount: entry.accessCount,
      lastAccess: entry.lastAccess
    };
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry<T>, now: number = Date.now()): boolean {
    if (!entry.ttl) return false;
    return (now - entry.timestamp) > entry.ttl;
  }

  /**
   * Evict least recently used entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * CacheService - Factory and management for multiple caches
 */
export class CacheService {
  private caches: Map<string, Cache<any>> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Run cleanup every 5 minutes
    this.startCleanupInterval();
  }

  /**
   * Get or create a cache instance
   */
  getCache<T>(name: string, options?: CacheOptions): Cache<T> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new Cache<T>(options));
    }
    return this.caches.get(name)!;
  }

  /**
   * Create a new cache with specific options
   */
  createCache<T>(name: string, options: CacheOptions = {}): Cache<T> {
    const cache = new Cache<T>(options);
    this.caches.set(name, cache);
    return cache;
  }

  /**
   * Delete a cache
   */
  deleteCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
      return this.caches.delete(name);
    }
    return false;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.caches.forEach(cache => cache.clear());
  }

  /**
   * Get statistics for all caches
   */
  getAllStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    this.caches.forEach((cache, name) => {
      stats[name] = cache.getStats();
    });
    return stats;
  }

  /**
   * Run cleanup on all caches
   */
  cleanupAll(): Record<string, number> {
    const results: Record<string, number> = {};
    this.caches.forEach((cache, name) => {
      results[name] = cache.cleanup();
    });
    return results;
  }

  /**
   * Get cache names
   */
  getCacheNames(): string[] {
    return Array.from(this.caches.keys());
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      try {
        this.cleanupAll();
      } catch (error) {
        errorHandler.handleRaw(error as Error, { 
          component: 'CacheService', 
          action: 'cleanupInterval' 
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop cleanup interval
   */
  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Destroy the cache service
   */
  destroy(): void {
    this.stopCleanupInterval();
    this.clearAll();
    this.caches.clear();
  }
}

// Global cache service instance
export const cacheService = new CacheService();

/**
 * Helper functions for common caching patterns
 */
export const cacheHelpers = {
  /**
   * Get or set pattern - get from cache or compute and cache
   */
  async getOrSet<T>(
    cache: Cache<T>, 
    key: string, 
    factory: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    cache.set(key, value, ttl);
    return value;
  },

  /**
   * Memoize function with cache
   */
  memoize<Args extends any[], Return>(
    fn: (...args: Args) => Promise<Return>,
    cache: Cache<Return>,
    keyGenerator: (...args: Args) => string,
    ttl?: number
  ) {
    return async (...args: Args): Promise<Return> => {
      const key = keyGenerator(...args);
      return cacheHelpers.getOrSet(cache, key, () => fn(...args), ttl);
    };
  },

  /**
   * Create cache key from object
   */
  createKey(prefix: string, obj: Record<string, any>): string {
    const sorted = Object.keys(obj)
      .sort()
      .map(key => `${key}:${obj[key]}`)
      .join('|');
    return `${prefix}:${sorted}`;
  }
};

export default cacheService;