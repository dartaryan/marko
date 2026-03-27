import { getIndexedDBDocuments } from './indexeddb';

const MIGRATION_KEY = 'marko-v2-convex-migration-done';

export function isMigrationDone(): boolean {
  try {
    return localStorage.getItem(MIGRATION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markMigrationDone(): void {
  try {
    localStorage.setItem(MIGRATION_KEY, 'true');
  } catch {
    // ignore
  }
}

/**
 * Migrate IndexedDB documents to Convex.
 *
 * @param convexDocCount - Number of documents the user already has in Convex
 * @param saveFn - The Convex saveDocument mutation function
 * @returns Number of documents migrated
 */
export async function migrateToConvex(
  convexDocCount: number,
  saveFn: (args: {
    content: string;
    title: string;
    snippet: string;
    themeId: string;
    direction: 'auto' | 'rtl' | 'ltr';
    isPinned: boolean;
    createdAt: number;
  }) => Promise<unknown>
): Promise<number> {
  // Already migrated
  if (isMigrationDone()) return 0;

  // User already has Convex documents — skip migration
  if (convexDocCount > 0) {
    markMigrationDone();
    return 0;
  }

  const localDocs = await getIndexedDBDocuments();
  if (localDocs.length === 0) {
    markMigrationDone();
    return 0;
  }

  // Upload in batches of 10
  const BATCH_SIZE = 10;
  let migrated = 0;

  for (let i = 0; i < localDocs.length; i += BATCH_SIZE) {
    const batch = localDocs.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((doc) =>
        saveFn({
          content: doc.content,
          title: doc.title,
          snippet: doc.snippet,
          themeId: doc.themeId,
          direction: doc.direction,
          isPinned: doc.isPinned,
          createdAt: doc.createdAt,
        })
      )
    );
    migrated += results.filter((r) => r.status === 'fulfilled').length;
  }

  // P-3: Only mark done if all documents migrated successfully
  if (migrated === localDocs.length) {
    markMigrationDone();
  }

  return migrated;
}
