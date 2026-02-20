import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Monitoring data queries — aggregates usageSnapshots into
 * the MonitoringData shape consumed by the monitoring page.
 */

/** Get the latest monitoring snapshot (most recent date) */
export const latest = query({
  args: {},
  handler: async (ctx) => {
    const snapshots = await ctx.db
      .query("usageSnapshots")
      .withIndex("by_date")
      .order("desc")
      .take(1);

    if (snapshots.length === 0) return null;
    return snapshots[0];
  },
});

/** Get daily snapshots for the last N days */
export const daily = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.days ?? 14;
    const snapshots = await ctx.db
      .query("usageSnapshots")
      .withIndex("by_date")
      .order("desc")
      .take(limit);

    // Return in chronological order
    return snapshots.reverse();
  },
});

/** Aggregate monitoring data across all snapshots — full MonitoringData shape */
export const aggregate = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.days ?? 14;
    const snapshots = await ctx.db
      .query("usageSnapshots")
      .withIndex("by_date")
      .order("desc")
      .take(limit);

    if (snapshots.length === 0) return null;

    // Compute totals
    const totals = {
      input: 0, output: 0, cacheRead: 0, cacheWrite: 0,
      totalTokens: 0, totalCost: 0,
      inputCost: 0, outputCost: 0, cacheReadCost: 0, cacheWriteCost: 0,
    };
    const providerMap: Record<string, any> = {};
    const modelMap: Record<string, any> = {};
    const toolMap: Record<string, number> = {};
    let totalToolCalls = 0;
    let latencySum = 0, latencyCount = 0;
    let latencyP95Max = 0;

    for (const snap of snapshots) {
      totals.totalTokens += snap.totalTokens;
      totals.totalCost += snap.totalCost;
      totals.input += snap.inputTokens;
      totals.output += snap.outputTokens;
      totals.cacheRead += snap.cacheReadTokens;
      totals.cacheWrite += snap.cacheWriteTokens;

      // Estimate costs from token ratios
      const tokenTotal = snap.totalTokens || 1;
      totals.inputCost += snap.totalCost * (snap.inputTokens / tokenTotal);
      totals.outputCost += snap.totalCost * (snap.outputTokens / tokenTotal);
      totals.cacheReadCost += snap.totalCost * (snap.cacheReadTokens / tokenTotal);
      totals.cacheWriteCost += snap.totalCost * (snap.cacheWriteTokens / tokenTotal);

      // Aggregate providers
      if (snap.byProvider) {
        const providers = snap.byProvider as Record<string, any>;
        for (const [name, data] of Object.entries(providers)) {
          if (!providerMap[name]) {
            providerMap[name] = { provider: name, count: 0, totals: { ...totals, totalTokens: 0, totalCost: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, inputCost: 0, outputCost: 0, cacheReadCost: 0, cacheWriteCost: 0 } };
          }
          providerMap[name].count += data.count ?? 0;
          providerMap[name].totals.totalTokens += data.totalTokens ?? 0;
          providerMap[name].totals.totalCost += data.totalCost ?? 0;
          providerMap[name].totals.input += data.inputTokens ?? 0;
          providerMap[name].totals.output += data.outputTokens ?? 0;
        }
      }

      // Aggregate models
      if (snap.byModel) {
        const models = snap.byModel as Record<string, any>;
        for (const [name, data] of Object.entries(models)) {
          if (!modelMap[name]) {
            modelMap[name] = { model: name, provider: data.provider ?? "", count: 0, totals: { totalTokens: 0, totalCost: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, inputCost: 0, outputCost: 0, cacheReadCost: 0, cacheWriteCost: 0 } };
          }
          modelMap[name].count += data.count ?? 0;
          modelMap[name].totals.totalTokens += data.totalTokens ?? 0;
          modelMap[name].totals.totalCost += data.totalCost ?? 0;
          modelMap[name].totals.input += data.inputTokens ?? 0;
          modelMap[name].totals.output += data.outputTokens ?? 0;
        }
      }

      // Aggregate tools
      if (snap.tools) {
        const tools = snap.tools as Record<string, number>;
        for (const [name, count] of Object.entries(tools)) {
          toolMap[name] = (toolMap[name] || 0) + count;
          totalToolCalls += count;
        }
      }

      // Latency
      if (snap.latencyAvgMs) { latencySum += snap.latencyAvgMs; latencyCount++; }
      if (snap.latencyP95Ms && snap.latencyP95Ms > latencyP95Max) latencyP95Max = snap.latencyP95Ms;
    }

    // Build arrays
    const byProvider = Object.values(providerMap).sort((a: any, b: any) => b.totals.totalTokens - a.totals.totalTokens);
    const byModel = Object.values(modelMap).sort((a: any, b: any) => b.totals.totalTokens - a.totals.totalTokens);
    const tools = Object.entries(toolMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));

    // Daily metrics
    const daily = snapshots.reverse().map(snap => ({
      date: snap.date,
      tokens: snap.totalTokens,
      cost: snap.totalCost,
      messages: 0, // will be filled by gateway
      toolCalls: 0,
      errors: 0,
    }));

    return {
      totals,
      byProvider,
      byModel,
      tools: {
        totalCalls: totalToolCalls,
        uniqueTools: Object.keys(toolMap).length,
        tools,
      },
      skills: [], // populated from config, not DB
      daily,
      latency: latencyCount > 0 ? {
        avgMs: Math.round(latencySum / latencyCount),
        p95Ms: latencyP95Max,
        minMs: 0,
        maxMs: 0,
      } : undefined,
    };
  },
});

/** Record a usage snapshot — called by Gateway sync or API route */
export const recordSnapshot = mutation({
  args: {
    date: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cacheReadTokens: v.number(),
    cacheWriteTokens: v.number(),
    totalTokens: v.number(),
    totalCost: v.number(),
    byProvider: v.optional(v.any()),
    byModel: v.optional(v.any()),
    tools: v.optional(v.any()),
    latencyAvgMs: v.optional(v.number()),
    latencyP95Ms: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Upsert by date — if snapshot for this date exists, update it
    const existing = await ctx.db
      .query("usageSnapshots")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("usageSnapshots", args);
  },
});

/** Seed monitoring with demo data */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existing = await ctx.db.query("usageSnapshots").take(1);
    if (existing.length > 0) return "already_seeded";

    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const date = d.toISOString().split("T")[0];
      const inputTokens = 15000 + Math.floor(Math.random() * 25000);
      const outputTokens = 10000 + Math.floor(Math.random() * 20000);
      const cacheRead = Math.floor(Math.random() * 8000);
      const cacheWrite = Math.floor(Math.random() * 3000);

      await ctx.db.insert("usageSnapshots", {
        date,
        inputTokens,
        outputTokens,
        cacheReadTokens: cacheRead,
        cacheWriteTokens: cacheWrite,
        totalTokens: inputTokens + outputTokens + cacheRead + cacheWrite,
        totalCost: ((inputTokens + outputTokens) * 0.000004) + (cacheRead * 0.000002),
        byProvider: {
          ollama: { count: 8 + Math.floor(Math.random() * 12), totalTokens: inputTokens * 0.8, totalCost: ((inputTokens * 0.8) * 0.000004), inputTokens: inputTokens * 0.4, outputTokens: inputTokens * 0.4 },
          google: { count: 2 + Math.floor(Math.random() * 4), totalTokens: inputTokens * 0.15, totalCost: ((inputTokens * 0.15) * 0.000004), inputTokens: inputTokens * 0.08, outputTokens: inputTokens * 0.07 },
          "vercel-ai-gateway": { count: Math.floor(Math.random() * 3), totalTokens: inputTokens * 0.05, totalCost: ((inputTokens * 0.05) * 0.000004), inputTokens: inputTokens * 0.03, outputTokens: inputTokens * 0.02 },
        },
        byModel: {
          "minimax-m2.5:cloud": { provider: "ollama", count: 8 + Math.floor(Math.random() * 12), totalTokens: inputTokens * 0.8, totalCost: ((inputTokens * 0.8) * 0.000004), inputTokens: inputTokens * 0.4, outputTokens: inputTokens * 0.4 },
          "gemini-3-flash-preview": { provider: "google", count: 2 + Math.floor(Math.random() * 4), totalTokens: inputTokens * 0.15, totalCost: ((inputTokens * 0.15) * 0.000004), inputTokens: inputTokens * 0.08, outputTokens: inputTokens * 0.07 },
        },
        tools: {
          grep_search: 5 + Math.floor(Math.random() * 10),
          view_file: 4 + Math.floor(Math.random() * 8),
          write_to_file: 3 + Math.floor(Math.random() * 6),
          run_command: 2 + Math.floor(Math.random() * 5),
          list_dir: 2 + Math.floor(Math.random() * 4),
          replace_file_content: 1 + Math.floor(Math.random() * 3),
        },
        latencyAvgMs: 300 + Math.floor(Math.random() * 300),
        latencyP95Ms: 800 + Math.floor(Math.random() * 800),
      });
    }
    return "seeded";
  },
});
