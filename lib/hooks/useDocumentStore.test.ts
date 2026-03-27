import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

// Mock useConvexAuth
let mockIsAuthenticated = false;
vi.mock('convex/react', () => ({
  useConvexAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
  useMutation: () => vi.fn(),
  useQuery: () => undefined,
}));

vi.mock('@/convex/_generated/api', () => ({
  api: {
    documents: {
      listMyDocuments: 'listMyDocuments',
      saveDocument: 'saveDocument',
      updateDocument: 'updateDocument',
      deleteDocument: 'deleteDocument',
      pinDocument: 'pinDocument',
      duplicateDocument: 'duplicateDocument',
    },
  },
}));

// Mock useDocuments (IndexedDB)
const mockIndexedDBReturn = {
  documents: [{ id: 'local_1', content: 'local doc', title: 'Local', snippet: 'Local doc', themeId: '', direction: 'auto' as const, isPinned: false, createdAt: 1000, updatedAt: 2000 }],
  activeDocument: null,
  activeDocumentId: null,
  isLoading: false,
  setActiveDocumentId: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  pinDocument: vi.fn(),
  duplicateDocument: vi.fn(),
};
vi.mock('./useDocuments', () => ({
  useDocuments: () => mockIndexedDBReturn,
}));

// Mock useConvexDocuments
const mockConvexReturn = {
  documents: [{ id: 'cloud_1', content: 'cloud doc', title: 'Cloud', snippet: 'Cloud doc', themeId: '', direction: 'auto' as const, isPinned: false, createdAt: 3000, updatedAt: 4000 }],
  activeDocument: null,
  activeDocumentId: null,
  isLoading: false,
  setActiveDocumentId: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  pinDocument: vi.fn(),
  duplicateDocument: vi.fn(),
};
vi.mock('./useConvexDocuments', () => ({
  useConvexDocuments: () => mockConvexReturn,
}));

// Mock migration
vi.mock('@/lib/documents/migration', () => ({
  migrateToConvex: vi.fn().mockResolvedValue(0),
  isMigrationDone: vi.fn().mockReturnValue(true),
}));

import { useDocumentStore } from './useDocumentStore';

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let hookResult: ReturnType<typeof useDocumentStore>;

function TestComponent() {
  hookResult = useDocumentStore();
  return null;
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  localStorage.clear();
});

describe('useDocumentStore', () => {
  it('returns IndexedDB hook when anonymous', () => {
    mockIsAuthenticated = false;

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.documents).toEqual(mockIndexedDBReturn.documents);
    expect(hookResult.documents[0].id).toBe('local_1');
  });

  it('returns Convex hook when authenticated', () => {
    mockIsAuthenticated = true;

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.documents).toEqual(mockConvexReturn.documents);
    expect(hookResult.documents[0].id).toBe('cloud_1');
  });

  it('has same return signature whether authenticated or not', () => {
    const expectedKeys = [
      'documents',
      'activeDocument',
      'activeDocumentId',
      'isLoading',
      'setActiveDocumentId',
      'createDocument',
      'updateDocument',
      'deleteDocument',
      'pinDocument',
      'duplicateDocument',
    ];

    mockIsAuthenticated = false;
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });
    expect(Object.keys(hookResult).sort()).toEqual(expectedKeys.sort());

    act(() => { root.unmount(); });

    mockIsAuthenticated = true;
    root = createRoot(container);
    act(() => {
      root.render(React.createElement(TestComponent));
    });
    expect(Object.keys(hookResult).sort()).toEqual(expectedKeys.sort());
  });
});
