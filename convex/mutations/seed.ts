import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const seedAgents = mutation({
  args: { agents: v.array(v.any()) },
  handler: async (ctx, { agents }) => {
    for (const agent of agents) {
      await ctx.db.insert("agents", agent);
    }
  },
});

export const seedTasks = mutation({
  args: { tasks: v.array(v.any()) },
  handler: async (ctx, { tasks }) => {
    for (const task of tasks) {
      await ctx.db.insert("tasks", task);
    }
  },
});

export const seedMonitoring = mutation({
  args: { metrics: v.array(v.any()) },
  handler: async (ctx, { metrics }) => {
    for (const metric of metrics) {
      await ctx.db.insert("metrics", metric);
    }
  },
});

export const seedMemories = mutation({
  args: {
    memories: v.array(v.any()),
    edges: v.array(v.any()),
  },
  handler: async (ctx, { memories, edges }) => {
    const idMap: Record<string, any> = {};
    for (const mem of memories) {
      const id = await ctx.db.insert("memories", mem);
      idMap[mem.id] = id;
    }
    for (const edge of edges) {
      const sourceId = idMap[edge.source] ?? edge.source;
      const targetId = idMap[edge.target] ?? edge.target;
      await ctx.db.insert("memoryEdges", {
        sourceId,
        targetId,
        relationship: edge.relationship,
        weight: edge.weight,
      });
    }
  },
});

export const seedInteractions = mutation({
  args: {
    interactions: v.array(v.any()),
    standups: v.array(v.any()),
  },
  handler: async (ctx, { interactions, standups }) => {
    for (const inter of interactions) {
      await ctx.db.insert("interactions", inter);
    }
    for (const msg of standups) {
      await ctx.db.insert("standupMessages", msg);
    }
  },
});
