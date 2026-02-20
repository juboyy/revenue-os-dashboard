import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ━━━ Queries ━━━

/** Get recent events, newest first */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .order("desc")
      .take(args.limit ?? 50);
    return events;
  },
});

/** Get events by agent */
export const byAgent = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(50);
  },
});

/** Get standup messages, newest first */
export const standups = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("standupMessages")
      .order("desc")
      .take(args.limit ?? 20);
  },
});

// ━━━ Mutations ━━━

/** Log a new event */
export const log = mutation({
  args: {
    agentId: v.string(),
    eventType: v.union(
      v.literal("delegation"), v.literal("standup"), v.literal("escalation"),
      v.literal("collaboration"), v.literal("task_completed"), v.literal("error"),
      v.literal("heartbeat"),
    ),
    targetAgentId: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", args);
  },
});

/** Post a standup message */
export const postStandup = mutation({
  args: {
    agentId: v.string(),
    agentName: v.string(),
    agentEmoji: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("standupMessages", args);
  },
});
