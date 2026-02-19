import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";

const http = httpRouter();

// POST /collect/sessions — trigger session collector
http.route({
  path: "/collect/sessions",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json().catch(() => ({}));
    const result = await ctx.runAction(api.collectors.sessionCollector.collectSessions, {
      openclawUrl: body.openclawUrl,
    });
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// POST /collect/tasks — trigger task collector with Todo.md content
http.route({
  path: "/collect/tasks",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const result = await ctx.runAction(api.collectors.taskCollector.collectTasks, {
      todoContent: body.todoContent || "",
    });
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// POST /collect/metrics — trigger metrics collector
http.route({
  path: "/collect/metrics",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json().catch(() => ({}));
    const result = await ctx.runAction(api.collectors.metricsCollector.collectMetrics, {
      openclawUrl: body.openclawUrl,
    });
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// POST /collect/memories — trigger memory collector with file content
http.route({
  path: "/collect/memories",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.json();
    const result = await ctx.runAction(api.collectors.memoryCollector.collectMemories, {
      filePath: body.filePath || "unknown",
      content: body.content || "",
      agentId: body.agentId,
    });
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
