/**
 * Quota-Safe Storage Manager (safeStorage.ts)
 * Prevents QuotaExceededError and private browsing lockouts.
 * Automatically evicts old search caches and falls back to in-memory storage.
 */

import { errorLogger } from '../errors/errorLogger';

const memoryStore = new Map<string, string>();

/** Helper to check if a specific web storage is actually writable */
function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const storage = window[type];
    const testKey = '__drc_storage_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const isLocalAvailable = isStorageAvailable('localStorage');
const isSessionAvailable = isStorageAvailable('sessionStorage');

/**
 * Attempts to trim heavy job caches if quota exceeded occurs
 */
function pruneHeavyCaches(): boolean {
  if (typeof window === 'undefined' || !isLocalAvailable) return false;
  try {
    // 1. Check if drc_discovered_all_jobs_v2 is huge
    const cachedJobsRaw = window.localStorage.getItem('drc_discovered_all_jobs_v2');
    if (cachedJobsRaw) {
      try {
        const parsed = JSON.parse(cachedJobsRaw);
        if (Array.isArray(parsed) && parsed.length > 300) {
          // Trim down to most recent 300 jobs
          window.localStorage.setItem('drc_discovered_all_jobs_v2', JSON.stringify(parsed.slice(0, 300)));
          errorLogger.warn('safeStorage', 'Pruned drc_discovered_all_jobs_v2 down to 300 items to reclaim quota.');
          return true;
        }
      } catch {
        window.localStorage.removeItem('drc_discovered_all_jobs_v2');
        return true;
      }
    }

    // 2. Remove legacy caches
    const keysToRemove = ['drc_discovered_all_jobs', 'drc_cached_requisitions', 'drc_old_feed'];
    let removedAny = false;
    keysToRemove.forEach((k) => {
      if (window.localStorage.getItem(k)) {
        window.localStorage.removeItem(k);
        removedAny = true;
      }
    });

    return removedAny;
  } catch {
    return false;
  }
}

export const safeStorage = {
  /**
   * Retrieves an item safely, parsing JSON if applicable.
   * If parsing fails or key is missing, returns the provided fallback.
   */
  getItem<T>(key: string, fallback: T, storageType: 'local' | 'session' = 'local'): T {
    if (typeof window === 'undefined') return fallback;

    const storageAvailable = storageType === 'local' ? isLocalAvailable : isSessionAvailable;
    let rawValue: string | null = null;

    if (storageAvailable) {
      try {
        const storage = storageType === 'local' ? window.localStorage : window.sessionStorage;
        rawValue = storage.getItem(key);
      } catch (err) {
        errorLogger.warn('safeStorage', `Failed to read ${key} from ${storageType}Storage`, { err });
      }
    }

    if (rawValue === null && memoryStore.has(key)) {
      rawValue = memoryStore.get(key) || null;
    }

    if (rawValue === null) {
      return fallback;
    }

    // Attempt JSON parse if fallback is not a primitive string
    if (typeof fallback === 'string') {
      return rawValue as unknown as T;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch (parseErr) {
      errorLogger.warn('safeStorage', `Corrupt JSON data for key ${key}. Resetting to fallback.`, { parseErr });
      return fallback;
    }
  },

  /**
   * Stores an item safely, handling stringification, quota errors, and memory fallback.
   */
  setItem<T>(key: string, value: T, storageType: 'local' | 'session' = 'local'): boolean {
    if (typeof window === 'undefined') return false;

    const storageAvailable = storageType === 'local' ? isLocalAvailable : isSessionAvailable;
    let serialized: string;

    try {
      serialized = typeof value === 'string' ? value : JSON.stringify(value);
    } catch (serializeErr) {
      errorLogger.error('safeStorage', `Serialization failed for key ${key}`, { serializeErr });
      return false;
    }

    if (!storageAvailable) {
      memoryStore.set(key, serialized);
      return true;
    }

    const storage = storageType === 'local' ? window.localStorage : window.sessionStorage;

    try {
      storage.setItem(key, serialized);
      return true;
    } catch (err: any) {
      const isQuota =
        err?.name === 'QuotaExceededError' ||
        err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err?.code === 22 ||
        err?.code === 1014;

      if (isQuota && storageType === 'local') {
        errorLogger.warn('safeStorage', `QuotaExceeded while saving ${key}. Attempting cache prune...`);
        const pruned = pruneHeavyCaches();
        if (pruned) {
          try {
            storage.setItem(key, serialized);
            return true;
          } catch {}
        }
      }

      // Memory fallback if persistent storage failed
      memoryStore.set(key, serialized);
      errorLogger.warn('safeStorage', `Falling back to in-memory storage for ${key}`);
      return false;
    }
  },

  /**
   * Removes an item safely from both web storage and in-memory store.
   */
  removeItem(key: string, storageType: 'local' | 'session' = 'local'): void {
    if (typeof window !== 'undefined') {
      try {
        const storage = storageType === 'local' ? window.localStorage : window.sessionStorage;
        storage.removeItem(key);
      } catch {}
    }
    memoryStore.delete(key);
  },

  /**
   * Clears in-memory store
   */
  clearMemory(): void {
    memoryStore.clear();
  },
};
