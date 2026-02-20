import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ━━━ Queries ━━━

/** List tasks, optionally filtered by status or assignee */
export const list = query({
  args: {
    status: v.optional(v.string()),
    assignee: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    }
    if (args.assignee) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_assignee", (q) => q.eq("assignee", args.assignee))
        .collect();
    }
    return await ctx.db.query("tasks").collect();
  },
});

// ━━━ Mutations ━━━

/** Move a task to a new status (drag & drop in Kanban) */
export const move = mutation({
  args: {
    taskId: v.string(),
    status: v.union(
      v.literal("backlog"), v.literal("in_progress"), v.literal("review"),
      v.literal("done"), v.literal("blocked"),
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query("tasks")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .unique();
    if (task) {
      await ctx.db.patch(task._id, { status: args.status });
    }
  },
});

/** Create a new task */
export const create = mutation({
  args: {
    taskId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("backlog"), v.literal("in_progress"), v.literal("review"),
      v.literal("done"), v.literal("blocked"),
    ),
    priority: v.union(
      v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"),
    ),
    assignee: v.optional(v.string()),
    jiraKey: v.optional(v.string()),
    sprint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

/** Seed tasks from real Todo.md data */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tasks").collect();
    if (existing.length > 0) return "already_seeded";

    const tasks = [
      { taskId: "STRIPE-2026", title: "Implementar suporte a Agentic Commerce e SPTs", status: "done" as const, priority: "critical" as const, assignee: "shanks", jiraKey: "STRIPE-2026" },
      { taskId: "DASH-FINANCE", title: "Criar tela de Gestão Financeira e Bounties", status: "done" as const, priority: "high" as const, assignee: "nami" },
      { taskId: "MC-001", title: "Integrar dados reais (collectors OpenClaw → dashboard)", status: "done" as const, priority: "high" as const, assignee: "zoro" },
      { taskId: "QA-001", title: "Validar integração do LLM Proxy com cenários de edge-cases", status: "done" as const, priority: "medium" as const, assignee: "usopp" },
      { taskId: "DOC-003", title: "Atualizar documentação com novo fluxo de Agentic Commerce", status: "done" as const, priority: "medium" as const, assignee: "robin" },
      { taskId: "XYZ-456", title: "Requires input from Sales team on feature spec", status: "blocked" as const, priority: "high" as const, jiraKey: "XYZ-456" },
      { taskId: "ABC-101", title: "Waiting for dependency deploy from Jinbe's pipeline", status: "blocked" as const, priority: "high" as const, assignee: "jinbe", jiraKey: "ABC-101" },
      { taskId: "CONVEX-001", title: "Conectar dashboard ao Convex com dados reais", status: "in_progress" as const, priority: "critical" as const, assignee: "zoro" },
      { taskId: "VERCEL-AI", title: "Instalar Vercel AI SDK para monitoramento de custos", status: "backlog" as const, priority: "high" as const, assignee: "nami" },
      { taskId: "GW-API", title: "Criar API routes para comandos ao Gateway", status: "backlog" as const, priority: "high" as const, assignee: "jinbe" },
      { taskId: "MEMORY-001", title: "Conectar hub de memória com MEMORY.md real", status: "backlog" as const, priority: "medium" as const, assignee: "robin" },
      { taskId: "WS-001", title: "Implementar WebSocket para updates em tempo real", status: "backlog" as const, priority: "medium" as const, assignee: "franky" },
    ];

    for (const task of tasks) {
      await ctx.db.insert("tasks", task);
    }
    return "seeded";
  },
});
