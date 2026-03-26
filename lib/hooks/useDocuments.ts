'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Document } from '@/types/document';
import { getDocumentTitle, getDocumentSnippet } from '@/lib/documents/utils';

const DB_NAME = 'marko-documents';
const DB_VERSION = 1;
const STORE_NAME = 'documents';
const ACTIVE_DOC_KEY = 'marko-v2-active-document-id';
const LEGACY_CONTENT_KEY = 'marko-v2-editor-content';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('isPinned', 'isPinned', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllDocuments(db: IDBDatabase): Promise<Document[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Document[]);
    request.onerror = () => reject(request.error);
  });
}

function putDocument(db: IDBDatabase, doc: Document): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(doc);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function removeDocument(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/** Sort: pinned first, then by updatedAt descending. */
function sortDocuments(docs: Document[]): Document[] {
  return [...docs].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

function makeDocument(content: string, themeId: string = '', direction: Document['direction'] = 'auto'): Document {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    content,
    title: getDocumentTitle(content),
    snippet: getDocumentSnippet(content),
    themeId,
    direction,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
  };
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dbRef = useRef<IDBDatabase | null>(null);
  const migrationDoneRef = useRef(false);

  // Load documents from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const db = await openDB();
        if (cancelled) { db.close(); return; }
        dbRef.current = db;

        let docs = await getAllDocuments(db);

        // Migration: if IndexedDB is empty but localStorage has content, create initial doc
        if (docs.length === 0 && !migrationDoneRef.current) {
          migrationDoneRef.current = true;
          try {
            const legacyContent = localStorage.getItem(LEGACY_CONTENT_KEY);
            if (legacyContent) {
              const parsed = JSON.parse(legacyContent) as string;
              if (parsed && parsed.trim()) {
                const doc = makeDocument(parsed);
                await putDocument(db, doc);
                docs = [doc];
                // Set as active
                localStorage.setItem(ACTIVE_DOC_KEY, JSON.stringify(doc.id));
              }
            }
          } catch {
            // localStorage unavailable or parse error — skip migration
          }
        }

        if (cancelled) return;
        setDocuments(sortDocuments(docs));

        // Restore active document ID
        try {
          const storedId = localStorage.getItem(ACTIVE_DOC_KEY);
          if (storedId) {
            const id = JSON.parse(storedId) as string;
            if (docs.some((d) => d.id === id)) {
              setActiveDocumentId(id);
            } else if (docs.length > 0) {
              setActiveDocumentId(docs[0].id);
            }
          } else if (docs.length > 0) {
            setActiveDocumentId(docs[0].id);
          }
        } catch {
          if (docs.length > 0) setActiveDocumentId(docs[0].id);
        }

        setIsLoading(false);
      } catch {
        // IndexedDB unavailable — fall back to empty state
        if (!cancelled) setIsLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, []);

  // Persist active doc ID to localStorage
  useEffect(() => {
    if (activeDocumentId !== null) {
      try {
        localStorage.setItem(ACTIVE_DOC_KEY, JSON.stringify(activeDocumentId));
      } catch {
        // ignore
      }
    }
  }, [activeDocumentId]);

  const refreshDocuments = useCallback(async () => {
    const db = dbRef.current;
    if (!db) return;
    const docs = await getAllDocuments(db);
    setDocuments(sortDocuments(docs));
  }, []);

  const createDocument = useCallback(async (content: string = '', themeId: string = '', direction: Document['direction'] = 'auto'): Promise<Document | null> => {
    const db = dbRef.current;
    if (!db) return null;
    const doc = makeDocument(content, themeId, direction);
    await putDocument(db, doc);
    await refreshDocuments();
    setActiveDocumentId(doc.id);
    return doc;
  }, [refreshDocuments]);

  const updateDocument = useCallback(async (id: string, updates: Partial<Pick<Document, 'content' | 'themeId' | 'direction'>>) => {
    const db = dbRef.current;
    if (!db) return;
    const docs = await getAllDocuments(db);
    const existing = docs.find((d) => d.id === id);
    if (!existing) return;
    const updatedContent = updates.content ?? existing.content;
    const updated: Document = {
      ...existing,
      ...updates,
      content: updatedContent,
      title: getDocumentTitle(updatedContent),
      snippet: getDocumentSnippet(updatedContent),
      updatedAt: Date.now(),
    };
    await putDocument(db, updated);
    await refreshDocuments();
  }, [refreshDocuments]);

  const deleteDocument = useCallback(async (id: string) => {
    const db = dbRef.current;
    if (!db) return;
    await removeDocument(db, id);
    const freshDocs = sortDocuments(await getAllDocuments(db));
    setDocuments(freshDocs);
    setActiveDocumentId((prevId) => {
      if (prevId === id) {
        return freshDocs.length > 0 ? freshDocs[0].id : null;
      }
      return prevId;
    });
  }, []);

  const pinDocument = useCallback(async (id: string) => {
    const db = dbRef.current;
    if (!db) return;
    const docs = await getAllDocuments(db);
    const existing = docs.find((d) => d.id === id);
    if (!existing) return;
    const updated: Document = { ...existing, isPinned: !existing.isPinned, updatedAt: Date.now() };
    await putDocument(db, updated);
    await refreshDocuments();
  }, [refreshDocuments]);

  const duplicateDocument = useCallback(async (id: string): Promise<Document | null> => {
    const db = dbRef.current;
    if (!db) return null;
    const docs = await getAllDocuments(db);
    const existing = docs.find((d) => d.id === id);
    if (!existing) return null;
    const dup = makeDocument(existing.content, existing.themeId, existing.direction);
    await putDocument(db, dup);
    await refreshDocuments();
    setActiveDocumentId(dup.id);
    return dup;
  }, [refreshDocuments]);

  const activeDocument = documents.find((d) => d.id === activeDocumentId) ?? null;

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
