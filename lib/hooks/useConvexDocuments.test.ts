import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

// Mock convex/react
const mockUseQuery = vi.fn();
const mockSave = vi.fn().mockResolvedValue('new_id');
const mockUpdate = vi.fn().mockResolvedValue('doc_id');
const mockDelete = vi.fn().mockResolvedValue(undefined);
const mockPin = vi.fn().mockResolvedValue('doc_id');
const mockDuplicate = vi.fn().mockResolvedValue('dup_id');

vi.mock('convex/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (fnName: string) => {
    if (fnName === 'saveDocument') return mockSave;
    if (fnName === 'updateDocument') return mockUpdate;
    if (fnName === 'deleteDocument') return mockDelete;
    if (fnName === 'pinDocument') return mockPin;
    if (fnName === 'duplicateDocument') return mockDuplicate;
    return vi.fn();
  },
  useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
}));

vi.mock('@/lib/documents/indexeddb', () => ({
  syncToIDB: vi.fn().mockResolvedValue(undefined),
  removeFromIDB: vi.fn().mockResolvedValue(undefined),
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

vi.mock('@/lib/documents/utils', () => ({
  getDocumentTitle: (content: string) => content.slice(0, 20) || 'מסמך חדש',
  getDocumentSnippet: (content: string) => content.slice(0, 60),
}));

import { useConvexDocuments } from './useConvexDocuments';

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let hookResult: ReturnType<typeof useConvexDocuments>;

function TestComponent() {
  hookResult = useConvexDocuments();
  return null;
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  vi.clearAllMocks();
  localStorage.clear();
  mockSave.mockResolvedValue('new_id');
  mockUpdate.mockResolvedValue('doc_id');
  mockDelete.mockResolvedValue(undefined);
  mockPin.mockResolvedValue('doc_id');
  mockDuplicate.mockResolvedValue('dup_id');
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container.remove();
  localStorage.clear();
});

describe('useConvexDocuments', () => {
  it('returns isLoading=true when query returns undefined', () => {
    mockUseQuery.mockReturnValue(undefined);
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });
    expect(hookResult.isLoading).toBe(true);
    expect(hookResult.documents).toEqual([]);
  });

  it('returns documents mapped to client format', () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'doc_1',
        content: '# Hello',
        title: 'Hello',
        snippet: 'Hello world',
        themeId: 'ocean',
        direction: 'auto',
        isPinned: false,
        createdAt: 1000,
        updatedAt: 2000,
      },
    ]);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult.isLoading).toBe(false);
    expect(hookResult.documents).toHaveLength(1);
    expect(hookResult.documents[0]).toEqual({
      id: 'doc_1',
      content: '# Hello',
      title: 'Hello',
      snippet: 'Hello world',
      themeId: 'ocean',
      direction: 'auto',
      isPinned: false,
      createdAt: 1000,
      updatedAt: 2000,
    });
  });

  it('activeDocument is null when no active ID is set', () => {
    mockUseQuery.mockReturnValue([]);
    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });
    expect(hookResult.activeDocument).toBeNull();
  });

  it('setActiveDocumentId persists to localStorage', () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'doc_1', content: '', title: '', snippet: '', themeId: '',
        direction: 'auto', isPinned: false, createdAt: 1000, updatedAt: 2000,
      },
    ]);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    act(() => {
      hookResult.setActiveDocumentId('doc_1');
    });

    expect(JSON.parse(localStorage.getItem('marko-v2-active-document-id')!)).toBe('doc_1');
  });

  it('createDocument calls saveMutation', async () => {
    mockUseQuery.mockReturnValue([]);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.createDocument('# New', 'theme1', 'rtl');
    });

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        content: '# New',
        themeId: 'theme1',
        direction: 'rtl',
        isPinned: false,
      })
    );
  });

  it('updateDocument calls updateMutation', async () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'doc_1', content: 'old', title: 'old', snippet: 'old', themeId: '',
        direction: 'auto', isPinned: false, createdAt: 1000, updatedAt: 2000,
      },
    ]);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.updateDocument('doc_1', { content: 'new' });
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'doc_1',
        content: 'new',
      })
    );
  });

  it('deleteDocument calls deleteMutation', async () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'doc_1', content: '', title: '', snippet: '', themeId: '',
        direction: 'auto', isPinned: false, createdAt: 1000, updatedAt: 2000,
      },
    ]);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.deleteDocument('doc_1');
    });

    expect(mockDelete).toHaveBeenCalledWith({ id: 'doc_1' });
  });

  it('pinDocument calls pinMutation', async () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'doc_1', content: '', title: '', snippet: '', themeId: '',
        direction: 'auto', isPinned: false, createdAt: 1000, updatedAt: 2000,
      },
    ]);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.pinDocument('doc_1');
    });

    expect(mockPin).toHaveBeenCalledWith({ id: 'doc_1' });
  });

  it('duplicateDocument calls duplicateMutation', async () => {
    mockUseQuery.mockReturnValue([
      {
        _id: 'doc_1', content: '# Dup', title: 'Dup', snippet: 'Dup', themeId: 'theme1',
        direction: 'rtl', isPinned: true, createdAt: 1000, updatedAt: 2000,
      },
    ]);

    act(() => {
      root = createRoot(container);
      root.render(React.createElement(TestComponent));
    });

    await act(async () => {
      await hookResult.duplicateDocument('doc_1');
    });

    expect(mockDuplicate).toHaveBeenCalledWith({ id: 'doc_1' });
  });
});
