import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

/**
 * Gateway Sync Endpoint — OpenClaw Gateway pushes data here.
 * 
 * POST /sync/agent-status
 *   Body: { agentId, status, currentTask, tokensToday, ... }
 * 
 * POST /sync/usage-snapshot
 *   Body: { date, inputTokens, outputTokens, totalTokens, totalCost, ... }
 * 
 * POST /sync/event
 *   Body: { agentId, eventType, description, ... }
 */

// ━━━ Agent Status Sync ━━━
http.route({
  path: "/sync/agent-status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      await ctx.runMutation(api.agents.upsert, body);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ━━━ Usage Snapshot Sync ━━━
http.route({
  path: "/sync/usage-snapshot",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const id = await ctx.runMutation(api.monitoring.recordSnapshot, body);
      return new Response(JSON.stringify({ ok: true, id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ━━━ Event Log Sync ━━━
http.route({
  path: "/sync/event",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const id = await ctx.runMutation(api.events.log, body);
      return new Response(JSON.stringify({ ok: true, id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// ━━━ Health Check ━━━
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
