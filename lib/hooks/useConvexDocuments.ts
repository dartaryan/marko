'use client';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { Document } from '@/types/document';
import { getDocumentTitle, getDocumentSnippet } from '@/lib/documents/utils';
import { syncToIDB, removeFromIDB } from '@/lib/documents/indexeddb';

/** Map a Convex document row to the client-side Document interface. */
function toClientDocument(doc: {
  _id: Id<"documents">;
  content: string;
  title: string;
  snippet: string;
  themeId: string;
  direction: 'auto' | 'rtl' | 'ltr';
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}): Document {
  return {
    id: doc._id as unknown as string,
    content: doc.content,
    title: doc.title,
    snippet: doc.snippet,
    themeId: doc.themeId,
    direction: doc.direction,
    isPinned: doc.isPinned,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

const ACTIVE_DOC_KEY = 'marko-v2-active-document-id';

export function useConvexDocuments() {
  // P-6: Skip Convex query when not authenticated (no network call for anonymous users)
  const { isAuthenticated } = useConvexAuth();
  const convexDocs = useQuery(
    api.documents.listMyDocuments,
    isAuthenticated ? {} : 'skip'
  );
  const saveMutation = useMutation(api.documents.saveDocument);
  const updateMutation = useMutation(api.documents.updateDocument);
  const deleteMutation = useMutation(api.documents.deleteDocument);
  const pinMutation = useMutation(api.documents.pinDocument);
  const duplicateMutation = useMutation(api.documents.duplicateDocument);

  const isLoading = convexDocs === undefined;
  const documents: Document[] = useMemo(
    () => (convexDocs ?? []).map(toClientDocument),
    [convexDocs]
  );

  // P-2: Ref for latest documents — avoids stale closures in callbacks
  const documentsRef = useRef(documents);
  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  // P-10: SSR-safe localStorage read
  const [storedActiveId, setStoredActiveId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(ACTIVE_DOC_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // P-5: Clear localStorage when set to null
  const setActiveDocumentId = useCallback((id: string | null) => {
    setStoredActiveId(id);
    try {
      if (id !== null) {
        localStorage.setItem(ACTIVE_DOC_KEY, JSON.stringify(id));
      } else {
        localStorage.removeItem(ACTIVE_DOC_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  // P-1: Derive effective active document ID — auto-corrects if stored ID is invalid
  // Uses useMemo instead of setState-in-render or setState-in-effect
  const activeDocumentId = useMemo(() => {
    if (!isLoading && storedActiveId !== null && documents.length > 0 && !documents.find((d) => d.id === storedActiveId)) {
      return documents[0].id;
    }
    return storedActiveId;
  }, [isLoading, storedActiveId, documents]);

  const activeDocument = documents.find((d) => d.id === activeDocumentId) ?? null;

  const createDocument = useCallback(
    async (content: string = '', themeId: string = '', direction: Document['direction'] = 'auto'): Promise<Document | null> => {
      const title = getDocumentTitle(content);
      const snippet = getDocumentSnippet(content);
      const now = Date.now();
      try {
        const convexId = await saveMutation({
          content,
          title,
          snippet,
          themeId,
          direction,
          isPinned: false,
          createdAt: now,
        });
        const id = convexId as unknown as string;
        const doc: Document = { id, content, title, snippet, themeId, direction, isPinned: false, createdAt: now, updatedAt: now };
        setActiveDocumentId(id);
        void syncToIDB(doc);
        return doc;
      } catch (error) {
        // P-7: Log failure — returning null signals the caller to handle the error
        console.warn('Convex document create failed', error);
        return null;
      }
    },
    [saveMutation, setActiveDocumentId]
  );

  const updateDocument = useCallback(
    async (id: string, updates: Partial<Pick<Document, 'content' | 'themeId' | 'direction'>>) => {
      const docId = id as unknown as Id<"documents">;
      const existing = documentsRef.current.find((d) => d.id === id); // P-2: use ref
      const updatedContent = updates.content ?? existing?.content ?? '';
      const title = getDocumentTitle(updatedContent);
      const snippet = getDocumentSnippet(updatedContent);
      try {
        await updateMutation({ id: docId, ...updates, title, snippet });
      } catch (error) {
        // P-4: Log failure instead of silently swallowing
        console.warn('Convex document update failed, falling back to local storage', error);
      }
      // Dual-write to IndexedDB
      if (existing) {
        const updated: Document = {
          ...existing,
          ...updates,
          content: updatedContent,
          title,
          snippet,
          updatedAt: Date.now(),
        };
        void syncToIDB(updated);
      }
    },
    [updateMutation] // P-2: removed documents from deps
  );

  const deleteDocument = useCallback(
    async (id: string) => {
      const docId = id as unknown as Id<"documents">;
      try {
        await deleteMutation({ id: docId });
      } catch {
        // ignore
      }
      void removeFromIDB(id);
      setStoredActiveId((prevId) => {
        if (prevId === id) {
          const remaining = documentsRef.current.filter((d) => d.id !== id); // P-2: use ref
          return remaining.length > 0 ? remaining[0].id : null;
        }
        return prevId;
      });
    },
    [deleteMutation] // P-2: removed documents from deps
  );

  const pinDocument = useCallback(
    async (id: string) => {
      const docId = id as unknown as Id<"documents">;
      try {
        await pinMutation({ id: docId });
      } catch {
        // ignore
      }
      const existing = documentsRef.current.find((d) => d.id === id); // P-2: use ref
      if (existing) {
        void syncToIDB({ ...existing, isPinned: !existing.isPinned, updatedAt: Date.now() });
      }
    },
    [pinMutation] // P-2: removed documents from deps
  );

  const duplicateDocument = useCallback(
    async (id: string): Promise<Document | null> => {
      const docId = id as unknown as Id<"documents">;
      const existing = documentsRef.current.find((d) => d.id === id); // P-2: use ref
      if (!existing) return null;
      try {
        const newConvexId = await duplicateMutation({ id: docId });
        const newId = newConvexId as unknown as string;
        const now = Date.now();
        const dup: Document = {
          ...existing,
          id: newId,
          isPinned: false,
          createdAt: now,
          updatedAt: now,
        };
        setActiveDocumentId(newId);
        void syncToIDB(dup);
        return dup;
      } catch {
        return null;
      }
    },
    [duplicateMutation, setActiveDocumentId] // P-2: removed documents from deps
  );

  return {
    documents,
    activeDocument,
    activeDocumentId,
    isLoading,
    setActiveDocumentId,
    createDocument,
    updateDocument,
    deleteDocument,
    pinDocument,
    duplicateDocument,
  };
}
