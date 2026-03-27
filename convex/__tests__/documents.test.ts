import { describe, it, expect, vi } from "vitest";
import { ConvexError } from "convex/values";

// Helper to create a mock database query chain
function createMockQueryChain(result: unknown = null) {
  return {
    withIndex: vi.fn().mockReturnThis(),
    withSearchIndex: vi.fn().mockReturnThis(),
    unique: vi.fn().mockResolvedValue(result),
    collect: vi.fn().mockResolvedValue([]),
  };
}

// Helper to create a mock mutation context
function createMockMutationCtx(
  queryResult: unknown = null,
  identity: unknown = null
) {
  const queryChain = createMockQueryChain(queryResult);
  return {
    ctx: {
      db: {
        query: vi.fn().mockReturnValue(queryChain),
        insert: vi.fn().mockResolvedValue("mock_doc_id"),
        patch: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue(null),
      },
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(identity),
      },
    },
    queryChain,
  };
}

// Extract handler from Convex function registration object
function getHandler(fn: unknown): Function {
  const registration = fn as { _handler?: Function };
  if (registration._handler) return registration._handler;
  throw new Error("Could not find handler on Convex function registration");
}

const mockIdentity = {
  subject: "clerk_123",
  issuer: "https://clerk.example.com",
};

const mockUser = {
  _id: "user_id_1",
  clerkId: "clerk_123",
  email: "test@example.com",
  name: "Test User",
  tier: "free",
  createdAt: 1000,
};

async function importDocuments() {
  return await import("../documents");
}

// ─── saveDocument ─────────────────────────────────────────────

describe("saveDocument", () => {
  it("inserts a new document for authenticated user", async () => {
    const { saveDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(mockUser, mockIdentity);

    const handler = getHandler(saveDocument);
    const result = await handler(ctx, {
      content: "# Hello",
      title: "Hello",
      snippet: "Hello world",
      themeId: "ocean-depth",
      direction: "auto",
    });

    expect(ctx.db.insert).toHaveBeenCalledWith(
      "documents",
      expect.objectContaining({
        userId: "user_id_1",
        content: "# Hello",
        title: "Hello",
        snippet: "Hello world",
        themeId: "ocean-depth",
        direction: "auto",
        isPinned: false,
      })
    );
    expect(result).toBe("mock_doc_id");
  });

  it("throws AUTH_REQUIRED when not authenticated", async () => {
    const { saveDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(null, null);

    const handler = getHandler(saveDocument);
    await expect(
      handler(ctx, {
        content: "test",
        title: "test",
        snippet: "test",
        themeId: "",
        direction: "auto",
      })
    ).rejects.toThrowError(ConvexError);
  });

  it("throws USER_NOT_FOUND when user record missing", async () => {
    const { saveDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(null, mockIdentity);

    const handler = getHandler(saveDocument);
    await expect(
      handler(ctx, {
        content: "test",
        title: "test",
        snippet: "test",
        themeId: "",
        direction: "auto",
      })
    ).rejects.toMatchObject({
      data: { code: "USER_NOT_FOUND" },
    });
  });

  it("uses provided createdAt and isPinned when given", async () => {
    const { saveDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(mockUser, mockIdentity);

    const handler = getHandler(saveDocument);
    await handler(ctx, {
      content: "test",
      title: "test",
      snippet: "test",
      themeId: "",
      direction: "rtl",
      isPinned: true,
      createdAt: 5000,
    });

    expect(ctx.db.insert).toHaveBeenCalledWith(
      "documents",
      expect.objectContaining({
        isPinned: true,
        createdAt: 5000,
        direction: "rtl",
      })
    );
  });
});

// ─── updateDocument ───────────────────────────────────────────

describe("updateDocument", () => {
  it("patches document when user owns it", async () => {
    const { updateDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(mockUser, mockIdentity);
    const existingDoc = {
      _id: "doc_1",
      userId: "user_id_1",
      content: "old content",
    };
    ctx.db.get.mockResolvedValue(existingDoc);

    const handler = getHandler(updateDocument);
    await handler(ctx, {
      id: "doc_1",
      content: "new content",
      title: "new title",
      snippet: "new snippet",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "doc_1",
      expect.objectContaining({
        content: "new content",
        title: "new title",
        updatedAt: expect.any(Number),
      })
    );
  });

  it("throws DOCUMENT_NOT_FOUND when doc belongs to different user", async () => {
    const { updateDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(mockUser, mockIdentity);
    ctx.db.get.mockResolvedValue({
      _id: "doc_1",
      userId: "other_user_id",
      content: "content",
    });

    const handler = getHandler(updateDocument);
    await expect(
      handler(ctx, { id: "doc_1", content: "hack" })
    ).rejects.toMatchObject({
      data: { code: "DOCUMENT_NOT_FOUND" },
    });
  });

  it("throws DOCUMENT_NOT_FOUND when doc does not exist", async () => {
    const { updateDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(mockUser, mockIdentity);
    ctx.db.get.mockResolvedValue(null);

    const handler = getHandler(updateDocument);
    await expect(
      handler(ctx, { id: "doc_1", content: "hack" })
    ).rejects.toMatchObject({
      data: { code: "DOCUMENT_NOT_FOUND" },
    });
  });
});

// ─── deleteDocument ───────────────────────────────────────────

describe("deleteDocument", () => {
  it("deletes document when user owns it", async () => {
    const { deleteDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(mockUser, mockIdentity);
    ctx.db.get.mockResolvedValue({
      _id: "doc_1",
      userId: "user_id_1",
    });

    const handler = getHandler(deleteDocument);
    await handler(ctx, { id: "doc_1" });

    expect(ctx.db.delete).toHaveBeenCalledWith("doc_1");
  });

  it("throws when doc belongs to different user", async () => {
    const { deleteDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(mockUser, mockIdentity);
    ctx.db.get.mockResolvedValue({
      _id: "doc_1",
      userId: "other_user",
    });

    const handler = getHandler(deleteDocument);
    await expect(handler(ctx, { id: "doc_1" })).rejects.toMatchObject({
      data: { code: "DOCUMENT_NOT_FOUND" },
    });
    expect(ctx.db.delete).not.toHaveBeenCalled();
  });
});

// ─── pinDocument ──────────────────────────────────────────────

describe("pinDocument", () => {
  it("toggles isPinned from false to true", async () => {
    const { pinDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(mockUser, mockIdentity);
    ctx.db.get.mockResolvedValue({
      _id: "doc_1",
      userId: "user_id_1",
      isPinned: false,
    });

    const handler = getHandler(pinDocument);
    await handler(ctx, { id: "doc_1" });

    expect(ctx.db.patch).toHaveBeenCalledWith("doc_1", {
      isPinned: true,
      updatedAt: expect.any(Number),
    });
  });

  it("toggles isPinned from true to false", async () => {
    const { pinDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(mockUser, mockIdentity);
    ctx.db.get.mockResolvedValue({
      _id: "doc_1",
      userId: "user_id_1",
      isPinned: true,
    });

    const handler = getHandler(pinDocument);
    await handler(ctx, { id: "doc_1" });

    expect(ctx.db.patch).toHaveBeenCalledWith("doc_1", {
      isPinned: false,
      updatedAt: expect.any(Number),
    });
  });
});

// ─── duplicateDocument ────────────────────────────────────────

describe("duplicateDocument", () => {
  it("creates a copy of the document", async () => {
    const { duplicateDocument } = await importDocuments();
    const { ctx } = createMockMutationCtx(mockUser, mockIdentity);
    ctx.db.get.mockResolvedValue({
      _id: "doc_1",
      userId: "user_id_1",
      content: "# Doc",
      title: "Doc",
      snippet: "Doc content",
      themeId: "ocean-depth",
      direction: "rtl",
      isPinned: true,
    });

    const handler = getHandler(duplicateDocument);
    const result = await handler(ctx, { id: "doc_1" });

    expect(ctx.db.insert).toHaveBeenCalledWith(
      "documents",
      expect.objectContaining({
        userId: "user_id_1",
        content: "# Doc",
        title: "Doc",
        themeId: "ocean-depth",
        direction: "rtl",
        isPinned: false, // duplicates are never pinned
      })
    );
    expect(result).toBe("mock_doc_id");
  });
});

// ─── listMyDocuments ──────────────────────────────────────────

describe("listMyDocuments", () => {
  it("returns empty array when not authenticated", async () => {
    const { listMyDocuments } = await importDocuments();
    const { ctx } = createMockMutationCtx(null, null);

    const handler = getHandler(listMyDocuments);
    const result = await handler(ctx, {});

    expect(result).toEqual([]);
  });

  it("returns empty array when user not found", async () => {
    const { listMyDocuments } = await importDocuments();
    const { ctx } = createMockMutationCtx(null, mockIdentity);

    const handler = getHandler(listMyDocuments);
    const result = await handler(ctx, {});

    expect(result).toEqual([]);
  });

  it("returns sorted documents for authenticated user", async () => {
    const { listMyDocuments } = await importDocuments();
    const docs = [
      { _id: "d1", isPinned: false, updatedAt: 1000 },
      { _id: "d2", isPinned: true, updatedAt: 500 },
      { _id: "d3", isPinned: false, updatedAt: 3000 },
    ];
    // First query returns user, second returns docs
    const userChain = createMockQueryChain(mockUser);
    const docsChain = createMockQueryChain();
    docsChain.collect.mockResolvedValue(docs);

    const ctx = {
      db: {
        query: vi
          .fn()
          .mockReturnValueOnce(userChain) // users query
          .mockReturnValueOnce(docsChain), // documents query
      },
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(mockIdentity),
      },
    };

    const handler = getHandler(listMyDocuments);
    const result = await handler(ctx, {});

    // pinned first, then by updatedAt desc
    expect(result.map((d: any) => d._id)).toEqual(["d2", "d3", "d1"]);
  });
});

// ─── searchMyDocuments ────────────────────────────────────────

describe("searchMyDocuments", () => {
  it("returns empty array when not authenticated", async () => {
    const { searchMyDocuments } = await importDocuments();
    const { ctx } = createMockMutationCtx(null, null);

    const handler = getHandler(searchMyDocuments);
    const result = await handler(ctx, { searchTerm: "test" });

    expect(result).toEqual([]);
  });

  it("returns all docs sorted when searchTerm is empty", async () => {
    const { searchMyDocuments } = await importDocuments();
    const docs = [
      { _id: "d1", isPinned: false, updatedAt: 1000 },
      { _id: "d2", isPinned: true, updatedAt: 500 },
    ];
    const userChain = createMockQueryChain(mockUser);
    const docsChain = createMockQueryChain();
    docsChain.collect.mockResolvedValue(docs);

    const ctx = {
      db: {
        query: vi
          .fn()
          .mockReturnValueOnce(userChain)
          .mockReturnValueOnce(docsChain),
      },
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(mockIdentity),
      },
    };

    const handler = getHandler(searchMyDocuments);
    const result = await handler(ctx, { searchTerm: "  " });

    expect(result.map((d: any) => d._id)).toEqual(["d2", "d1"]);
  });

  it("merges and deduplicates title and content search results", async () => {
    const { searchMyDocuments } = await importDocuments();
    const titleResults = [
      { _id: "d1", isPinned: false, updatedAt: 2000, title: "match" },
      { _id: "d2", isPinned: false, updatedAt: 1000, title: "match too" },
    ];
    const contentResults = [
      { _id: "d2", isPinned: false, updatedAt: 1000, title: "match too" }, // duplicate
      { _id: "d3", isPinned: true, updatedAt: 500, title: "content match" },
    ];

    const userChain = createMockQueryChain(mockUser);
    const titleChain = createMockQueryChain();
    titleChain.collect.mockResolvedValue(titleResults);
    const contentChain = createMockQueryChain();
    contentChain.collect.mockResolvedValue(contentResults);

    const ctx = {
      db: {
        query: vi
          .fn()
          .mockReturnValueOnce(userChain) // user lookup
          .mockReturnValueOnce(titleChain) // title search
          .mockReturnValueOnce(contentChain), // content search
      },
      auth: {
        getUserIdentity: vi.fn().mockResolvedValue(mockIdentity),
      },
    };

    const handler = getHandler(searchMyDocuments);
    const result = await handler(ctx, { searchTerm: "match" });

    // d3 is pinned (first), then d1 (updatedAt 2000), then d2 (updatedAt 1000)
    expect(result).toHaveLength(3);
    expect(result.map((d: any) => d._id)).toEqual(["d3", "d1", "d2"]);
  });
});
