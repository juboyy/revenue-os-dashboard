import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ━━━ Queries ━━━

/** Get the full memory graph (nodes + edges) */
export const graph = query({
  args: {},
  handler: async (ctx) => {
    const nodes = await ctx.db.query("memories").collect();
    const edges = await ctx.db.query("memoryEdges").collect();
    return { nodes, edges };
  },
});

/** Get memories by agent */
export const byAgent = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .collect();
  },
});

/** Search memories by category */
export const byCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_category", (q) => q.eq("category", args.category as any))
      .collect();
  },
});

// ━━━ Mutations ━━━

/** Upsert a memory node */
export const upsert = mutation({
  args: {
    memoryId: v.string(),
    content: v.string(),
    agentId: v.string(),
    category: v.union(
      v.literal("fact"), v.literal("preference"),
      v.literal("decision"), v.literal("pattern"),
    ),
    relevance: v.number(),
    retrievalCount: v.number(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("memories")
      .filter((q) => q.eq(q.field("memoryId"), args.memoryId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("memories", args);
  },
});

/** Add a memory edge */
export const addEdge = mutation({
  args: {
    sourceId: v.string(),
    targetId: v.string(),
    relationship: v.string(),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memoryEdges", args);
  },
});
