'use client';
import { useEffect, useRef } from 'react';
import { useConvexAuth } from 'convex/react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useDocuments } from './useDocuments';
import { useConvexDocuments } from './useConvexDocuments';
import { migrateToConvex, isMigrationDone } from '@/lib/documents/migration';

/**
 * Orchestrator hook: picks the right document backend based on auth state.
 *
 * - Authenticated users → Convex (cloud) with IndexedDB dual-write
 * - Anonymous users → IndexedDB only (existing behavior)
 *
 * Returns the exact same interface as `useDocuments`.
 */
export function useDocumentStore() {
  const { isAuthenticated } = useConvexAuth();

  // Always call both hooks (React rules — can't conditionally call hooks).
  // Only one will be "active" based on auth state.
  const indexedDB = useDocuments();
  const convex = useConvexDocuments();
  const saveMutation = useMutation(api.documents.saveDocument);
  const migrationRanRef = useRef(false);

  // Migration: IndexedDB → Convex on first authenticated load
  useEffect(() => {
    if (!isAuthenticated) return;
    if (migrationRanRef.current) return;
    if (isMigrationDone()) return;
    if (convex.isLoading) return; // wait for Convex to tell us doc count

    migrationRanRef.current = true;
    void migrateToConvex(convex.documents.length, (args) =>
      saveMutation({
        content: args.content,
        title: args.title,
        snippet: args.snippet,
        themeId: args.themeId,
        direction: args.direction,
        isPinned: args.isPinned,
        createdAt: args.createdAt,
      })
    );
  }, [isAuthenticated, convex.isLoading, convex.documents.length, saveMutation]);

  if (isAuthenticated) {
    return convex;
  }

  return indexedDB;
}
