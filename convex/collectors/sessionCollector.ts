import { action, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Mutation to upsert agent status from collected data
export const upsertAgent = internalMutation({
  args: {
    agentId: v.string(),
    status: v.string(),
    currentTask: v.optional(v.string()),
    sessionKey: v.optional(v.string()),
    lastHeartbeat: v.number(),
    tokensToday: v.optional(v.number()),
    model: v.optional(v.string()),
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
        sessionKey: args.sessionKey,
        lastHeartbeat: args.lastHeartbeat,
        ...(args.tokensToday !== undefined ? { tokensToday: args.tokensToday } : {}),
        ...(args.model !== undefined ? { model: args.model } : {}),
      });
    }
  },
});

// Action that fetches OpenClaw session data and updates agents
export const collectSessions = action({
  args: {
    openclawUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const baseUrl = args.openclawUrl || "http://127.0.0.1:3000";

    try {
      // Fetch active sessions from OpenClaw
      const res = await fetch(`${baseUrl}/api/sessions`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.log("OpenClaw sessions API not available:", res.status);
        return { collected: 0, error: "API not available" };
      }

      const data = await res.json();
      const sessions = data.sessions || data || [];
      let collected = 0;

      for (const session of sessions) {
        const agentId = extractAgentId(session.key || session.sessionKey || "");
        if (!agentId) continue;

        await ctx.runMutation(internal.collectors.sessionCollector.upsertAgent, {
          agentId,
          status: inferStatus(session),
          currentTask: session.lastMessage || undefined,
          sessionKey: session.key || session.sessionKey,
          lastHeartbeat: session.updatedAt || Date.now(),
          tokensToday: session.totalTokens,
          model: session.model,
        });
        collected++;
      }

      return { collected, timestamp: Date.now() };
    } catch (e: any) {
      console.error("Session collector error:", e.message);
      return { collected: 0, error: e.message };
    }
  },
});

function extractAgentId(key: string): string | null {
  // "agent:os:main" -> "os"
  // "agent:eng-lead:subagent:..." -> "eng-lead"
  const match = key.match(/^agent:([^:]+)/);
  return match ? match[1] : null;
}

function inferStatus(session: any): string {
  if (session.abortedLastRun) return "error";
  const age = Date.now() - (session.updatedAt || 0);
  if (age < 60000) return "working";
  if (age < 300000) return "active";
  if (age < 3600000) return "idle";
  return "sleeping";
}
