import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ━━━ Queries ━━━

/** List all agents, optionally filtered by status */
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("agents")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    }
    return await ctx.db.query("agents").collect();
  },
});

/** Get a single agent by agentId */
export const get = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .unique();
  },
});

/** Get computed metrics across all agents */
export const metrics = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    return {
      totalTasksCompleted: agents.reduce((s, a) => s + a.tasksCompleted, 0),
      totalTasksPending: agents.reduce((s, a) => s + a.tasksPending, 0),
      totalTasksBlocked: agents.reduce((s, a) => s + a.tasksBlocked, 0),
      totalTokensToday: agents.reduce((s, a) => s + a.tokensToday, 0),
      activeAgents: agents.filter((a) => a.status === "active" || a.status === "working").length,
      totalAgents: agents.length,
    };
  },
});

// ━━━ Mutations ━━━

/** Upsert agent status — called by Gateway sync cron */
export const upsert = mutation({
  args: {
    agentId: v.string(),
    name: v.string(),
    emoji: v.string(),
    department: v.string(),
    room: v.string(),
    status: v.union(
      v.literal("active"), v.literal("working"), v.literal("idle"),
      v.literal("error"), v.literal("sleeping"),
    ),
    currentTask: v.optional(v.string()),
    lastHeartbeat: v.optional(v.string()),
    soul: v.optional(v.string()),
    tokensToday: v.number(),
    tasksCompleted: v.number(),
    tasksPending: v.number(),
    tasksBlocked: v.number(),
    model: v.optional(v.string()),
    provider: v.optional(v.string()),
    xp: v.number(),
    level: v.number(),
    levelTitle: v.string(),
    streakDays: v.number(),
    speed: v.number(),
    accuracy: v.number(),
    versatility: v.number(),
    reliability: v.number(),
    creativity: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("agents", args);
    }
  },
});

/** Update just the status of an agent */
export const updateStatus = mutation({
  args: {
    agentId: v.string(),
    status: v.union(
      v.literal("active"), v.literal("working"), v.literal("idle"),
      v.literal("error"), v.literal("sleeping"),
    ),
    currentTask: v.optional(v.string()),
    lastHeartbeat: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        currentTask: args.currentTask,
        lastHeartbeat: args.lastHeartbeat ?? new Date().toISOString(),
      });
    }
  },
});

/** Seed all 9 default agents — run once to populate */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    if (existing.length > 0) return "already_seeded";

    const defaults = [
      { agentId: "shanks", name: "Shanks", emoji: "🏴‍☠️", department: "OS Captain", room: "ponte-de-comando", status: "active" as const, currentTask: "Coordinating crew operations", soul: "The captain who sees the whole ocean.", tokensToday: 12400, tasksCompleted: 23, tasksPending: 4, tasksBlocked: 0, model: "minimax-m2.5:cloud", provider: "ollama", xp: 2800, level: 5, levelTitle: "Master", streakDays: 14, speed: 85, accuracy: 92, versatility: 95, reliability: 98, creativity: 88 },
      { agentId: "zoro", name: "Zoro", emoji: "⚔️", department: "Engineering Lead", room: "forja", status: "working" as const, currentTask: "Building dashboard components", soul: "Three-sword style coder.", tokensToday: 18700, tasksCompleted: 15, tasksPending: 3, tasksBlocked: 1, model: "minimax-m2.5:cloud", provider: "ollama", xp: 3200, level: 5, levelTitle: "Master", streakDays: 12, speed: 90, accuracy: 88, versatility: 70, reliability: 95, creativity: 75 },
      { agentId: "franky", name: "Franky", emoji: "🤖", department: "Architect", room: "estaleiro", status: "working" as const, currentTask: "Designing system architecture", soul: "SUUUPER architect!", tokensToday: 9300, tasksCompleted: 8, tasksPending: 2, tasksBlocked: 0, model: "minimax-m2.5:cloud", provider: "ollama", xp: 1800, level: 4, levelTitle: "Veteran", streakDays: 8, speed: 70, accuracy: 95, versatility: 85, reliability: 90, creativity: 92 },
      { agentId: "chopper", name: "Chopper", emoji: "🩺", department: "Analyst", room: "laboratorio", status: "active" as const, currentTask: "Analyzing revenue metrics", soul: "The tiny doctor with a giant brain.", tokensToday: 6200, tasksCompleted: 12, tasksPending: 5, tasksBlocked: 0, model: "minimax-m2.5:cloud", provider: "ollama", xp: 1400, level: 4, levelTitle: "Veteran", streakDays: 10, speed: 75, accuracy: 98, versatility: 60, reliability: 92, creativity: 80 },
      { agentId: "nami", name: "Nami", emoji: "💰", department: "Finance", room: "tesouraria", status: "active" as const, currentTask: "Tracking token expenditure", soul: "Every berry counts, every token is tracked.", tokensToday: 4100, tasksCompleted: 18, tasksPending: 2, tasksBlocked: 0, model: "minimax-m2.5:cloud", provider: "ollama", xp: 2200, level: 4, levelTitle: "Veteran", streakDays: 15, speed: 82, accuracy: 96, versatility: 65, reliability: 97, creativity: 70 },
      { agentId: "robin", name: "Robin", emoji: "📚", department: "Research", room: "biblioteca", status: "idle" as const, soul: "The archaeologist of knowledge.", tokensToday: 3400, tasksCompleted: 7, tasksPending: 1, tasksBlocked: 0, model: "minimax-m2.5:cloud", provider: "ollama", xp: 950, level: 3, levelTitle: "Expert", streakDays: 6, speed: 65, accuracy: 94, versatility: 90, reliability: 88, creativity: 95 },
      { agentId: "jinbe", name: "Jinbe", emoji: "⚓", department: "DevOps", room: "sala-de-maquinas", status: "active" as const, currentTask: "Monitoring infrastructure", soul: "The helmsman who keeps the ship steady.", tokensToday: 7800, tasksCompleted: 20, tasksPending: 3, tasksBlocked: 0, model: "minimax-m2.5:cloud", provider: "ollama", xp: 2600, level: 5, levelTitle: "Master", streakDays: 20, speed: 78, accuracy: 93, versatility: 72, reliability: 99, creativity: 60 },
      { agentId: "usopp", name: "Usopp", emoji: "🎯", department: "QA & Testing", room: "torre-de-vigia", status: "idle" as const, soul: "The sniper who never misses a bug.", tokensToday: 2900, tasksCompleted: 11, tasksPending: 1, tasksBlocked: 0, model: "minimax-m2.5:cloud", provider: "ollama", xp: 720, level: 3, levelTitle: "Expert", streakDays: 4, speed: 88, accuracy: 97, versatility: 55, reliability: 85, creativity: 65 },
      { agentId: "sanji", name: "Sanji", emoji: "🍳", department: "Content & Marketing", room: "cozinha", status: "working" as const, currentTask: "Crafting content strategy", soul: "Every dish is plated to perfection.", tokensToday: 5600, tasksCompleted: 9, tasksPending: 2, tasksBlocked: 0, model: "minimax-m2.5:cloud", provider: "ollama", xp: 1100, level: 3, levelTitle: "Expert", streakDays: 7, speed: 80, accuracy: 85, versatility: 80, reliability: 90, creativity: 98 },
    ];

    for (const agent of defaults) {
      await ctx.db.insert("agents", agent);
    }
    return "seeded";
  },
});
