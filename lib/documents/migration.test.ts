import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isMigrationDone, markMigrationDone, migrateToConvex } from './migration';

const MIGRATION_KEY = 'marko-v2-convex-migration-done';

describe('migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('isMigrationDone', () => {
    it('returns false when key is not set', () => {
      expect(isMigrationDone()).toBe(false);
    });

    it('returns true when key is set to "true"', () => {
      localStorage.setItem(MIGRATION_KEY, 'true');
      expect(isMigrationDone()).toBe(true);
    });

    it('returns false when key has different value', () => {
      localStorage.setItem(MIGRATION_KEY, 'false');
      expect(isMigrationDone()).toBe(false);
    });
  });

  describe('markMigrationDone', () => {
    it('sets localStorage key to "true"', () => {
      markMigrationDone();
      expect(localStorage.getItem(MIGRATION_KEY)).toBe('true');
    });
  });

  describe('migrateToConvex', () => {
    it('returns 0 and marks done if already migrated', async () => {
      localStorage.setItem(MIGRATION_KEY, 'true');
      const saveFn = vi.fn();
      const result = await migrateToConvex(0, saveFn);
      expect(result).toBe(0);
      expect(saveFn).not.toHaveBeenCalled();
    });

    it('returns 0 and marks done if Convex already has docs', async () => {
      const saveFn = vi.fn();
      const result = await migrateToConvex(5, saveFn);
      expect(result).toBe(0);
      expect(saveFn).not.toHaveBeenCalled();
      expect(isMigrationDone()).toBe(true);
    });

    it('returns 0 and marks done if IndexedDB has no docs', async () => {
      // IndexedDB is not available in test environment — getIndexedDBDocuments returns []
      const saveFn = vi.fn();
      const result = await migrateToConvex(0, saveFn);
      expect(result).toBe(0);
      expect(isMigrationDone()).toBe(true);
    });
  });
});
