/**
 * Centralized, circular-dependency-free cache registry for fast in-memory caching.
 * Used to make page transitions feel completely instant and avoid redundant Firestore queries.
 */
export const cacheStore = {
  registry: {} as Record<string, { data: any; timestamp: number }>,

  set(key: string, data: any) {
    this.registry[key] = {
      data,
      timestamp: Date.now()
    };
  },

  get(key: string, ttlMs: number): any | null {
    const item = this.registry[key];
    if (!item) return null;
    if (Date.now() - item.timestamp > ttlMs) {
      this.delete(key);
      return null;
    }
    return item.data;
  },

  delete(key: string) {
    delete this.registry[key];
  },

  clearAll() {
    this.registry = {};
  }
};
