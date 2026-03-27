import type { Document } from '@/types/document';

export const DB_NAME = 'marko-documents';
export const DB_VERSION = 1;
export const STORE_NAME = 'documents';

export function openDB(): Promise<IDBDatabase> {
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

function putDocumentIDB(db: IDBDatabase, doc: Document): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(doc);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function removeDocumentIDB(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function getAllDocumentsIDB(db: IDBDatabase): Promise<Document[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Document[]);
    request.onerror = () => reject(request.error);
  });
}

/** Silently sync a document to IndexedDB (best effort). */
export async function syncToIDB(doc: Document): Promise<void> {
  try {
    const db = await openDB();
    await putDocumentIDB(db, doc);
    db.close();
  } catch {
    // IndexedDB unavailable — skip silently
  }
}

/** Silently remove a document from IndexedDB (best effort). */
export async function removeFromIDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    await removeDocumentIDB(db, id);
    db.close();
  } catch {
    // IndexedDB unavailable — skip silently
  }
}

/** Read all documents from IndexedDB. Returns [] if unavailable. */
export async function getIndexedDBDocuments(): Promise<Document[]> {
  try {
    const db = await openDB();
    const docs = await getAllDocumentsIDB(db);
    db.close();
    return docs;
  } catch {
    return [];
  }
}
