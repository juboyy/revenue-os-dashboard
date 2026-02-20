import { action, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Mutation to upsert daily metric
export const upsertDailyMetric = internalMutation({
  args: {
    period: v.string(),
    tokens: v.number(),
    cost: v.number(),
    messages: v.number(),
    toolCalls: v.number(),
    errors: v.number(),
    provider: v.optional(v.string()),
    model: v.optional(v.string()),
    latencyAvg: v.optional(v.number()),
    latencyP95: v.optional(v.number()),
    latencyMin: v.optional(v.number()),
    latencyMax: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Find existing metric for this period
    const existing = await ctx.db
      .query("metrics")
      .withIndex("by_period", (q) => q.eq("period", args.period))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        tokens: args.tokens,
        cost: args.cost,
        messages: args.messages,
        toolCalls: args.toolCalls,
        errors: args.errors,
        provider: args.provider,
        model: args.model,
        latencyAvg: args.latencyAvg,
        latencyP95: args.latencyP95,
        latencyMin: args.latencyMin,
        latencyMax: args.latencyMax,
      });
    } else {
      await ctx.db.insert("metrics", {
        metricType: "daily",
        period: args.period,
        tokens: args.tokens,
        cost: args.cost,
        messages: args.messages,
        toolCalls: args.toolCalls,
        errors: args.errors,
        provider: args.provider,
        model: args.model,
        latencyAvg: args.latencyAvg,
        latencyP95: args.latencyP95,
        latencyMin: args.latencyMin,
        latencyMax: args.latencyMax,
        createdAt: Date.now(),
      });
    }
  },
});

// Action that fetches OpenClaw status and computes daily metrics
export const collectMetrics = action({
  args: {
    openclawUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const baseUrl = args.openclawUrl || "http://127.0.0.1:3000";
    const today = new Date().toISOString().slice(0, 10);

    try {
      const res = await fetch(`${baseUrl}/api/status`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.log("OpenClaw status API not available:", res.status);
        return { collected: false, error: "API not available" };
      }

      const data = await res.json();
      const usage = data.usage || {};

      await ctx.runMutation(internal.collectors.metricsCollector.upsertDailyMetric, {
        period: today,
        tokens: (usage.inputTokens || 0) + (usage.outputTokens || 0),
        cost: usage.totalCost || 0,
        messages: usage.messages || 0,
        toolCalls: usage.toolCalls || 0,
        errors: usage.errors || 0,
        provider: usage.provider,
        model: usage.model,
        latencyAvg: usage.latencyAvg,
        latencyP95: usage.latencyP95,
        latencyMin: usage.latencyMin,
        latencyMax: usage.latencyMax,
      });

      return { collected: true, period: today, timestamp: Date.now() };
    } catch (e: any) {
      console.error("Metrics collector error:", e.message);
      return { collected: false, error: e.message };
    }
  },
});
