import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAuth } from "./lib/authorization";

// ─── Helpers ──────────────────────────────────────────────────────────

async function lookupUser(ctx: MutationCtx) {
  const identity = await requireAuth(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) {
    throw new ConvexError({
      code: "USER_NOT_FOUND",
      message: "משתמש לא נמצא",
      messageEn: "User not found",
    });
  }
  return user;
}

async function getOwnedDocument(
  ctx: MutationCtx,
  documentId: Id<"documents">,
  userId: Id<"users">
) {
  const doc = await ctx.db.get(documentId);
  if (!doc || doc.userId !== userId) {
    throw new ConvexError({
      code: "DOCUMENT_NOT_FOUND",
      message: "מסמך לא נמצא",
      messageEn: "Document not found",
    });
  }
  return doc;
}

// ─── Mutations ────────────────────────────────────────────────────────

export const saveDocument = mutation({
  args: {
    content: v.string(),
    title: v.string(),
    snippet: v.string(),
    themeId: v.string(),
    direction: v.union(v.literal("auto"), v.literal("rtl"), v.literal("ltr")),
    isPinned: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await lookupUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("documents", {
      userId: user._id,
      content: args.content,
      title: args.title,
      snippet: args.snippet,
      themeId: args.themeId,
      direction: args.direction,
      isPinned: args.isPinned ?? false,
      createdAt: args.createdAt ?? now,
      updatedAt: now,
    });
  },
});

export const updateDocument = mutation({
  args: {
    id: v.id("documents"),
    content: v.optional(v.string()),
    title: v.optional(v.string()),
    snippet: v.optional(v.string()),
    themeId: v.optional(v.string()),
    direction: v.optional(
      v.union(v.literal("auto"), v.literal("rtl"), v.literal("ltr"))
    ),
  },
  handler: async (ctx, args) => {
    const user = await lookupUser(ctx);
    await getOwnedDocument(ctx, args.id, user._id);

    const { id, ...updates } = args;
    const patch: Record<string, unknown> = { ...updates, updatedAt: Date.now() };
    // Remove undefined values
    for (const key of Object.keys(patch)) {
      if (patch[key] === undefined) delete patch[key];
    }
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await lookupUser(ctx);
    await getOwnedDocument(ctx, args.id, user._id);
    await ctx.db.delete(args.id);
  },
});

export const pinDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await lookupUser(ctx);
    const doc = await getOwnedDocument(ctx, args.id, user._id);
    await ctx.db.patch(args.id, {
      isPinned: !doc.isPinned,
      updatedAt: Date.now(),
    });
    return args.id;
  },
});

export const duplicateDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await lookupUser(ctx);
    const doc = await getOwnedDocument(ctx, args.id, user._id);
    const now = Date.now();
    return await ctx.db.insert("documents", {
      userId: user._id,
      content: doc.content,
      title: doc.title,
      snippet: doc.snippet,
      themeId: doc.themeId,
      direction: doc.direction,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ─── Queries ──────────────────────────────────────────────────────────

export const listMyDocuments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const docs = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Sort: pinned first, then updatedAt descending
    return docs.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  },
});

export const searchMyDocuments = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    if (!args.searchTerm.trim()) {
      // Empty search — return all docs sorted
      const docs = await ctx.db
        .query("documents")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect();
      return docs.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      });
    }

    // Search by title
    const titleResults = await ctx.db
      .query("documents")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.searchTerm).eq("userId", user._id)
      )
      .collect();

    // Search by content
    const contentResults = await ctx.db
      .query("documents")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.searchTerm).eq("userId", user._id)
      )
      .collect();

    // Merge and deduplicate
    const seen = new Set<string>();
    const merged = [];
    for (const doc of [...titleResults, ...contentResults]) {
      const id = doc._id.toString();
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(doc);
      }
    }

    // Sort merged results: pinned first, then updatedAt desc
    return merged.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  },
});
