import { action, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Mutation to upsert a task by title (deduplicate)
export const upsertTask = internalMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    assignee: v.optional(v.string()),
    assigneeType: v.string(),
    source: v.string(),
    bountyValue: v.number(),
  },
  handler: async (ctx, args) => {
    // Find existing task by title
    const all = await ctx.db.query("tasks").collect();
    const existing = all.find((t) => t.title === args.title);

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        priority: args.priority,
        assignee: args.assignee,
        description: args.description,
      });
    } else {
      await ctx.db.insert("tasks", {
        title: args.title,
        description: args.description,
        status: args.status,
        priority: args.priority,
        assignee: args.assignee,
        assigneeType: args.assigneeType,
        source: args.source,
        bountyValue: args.bountyValue,
      });
    }
  },
});

// Action that parses Todo.md content and syncs tasks
export const collectTasks = action({
  args: {
    todoContent: v.string(),
  },
  handler: async (ctx, args) => {
    const lines = args.todoContent.split("\n");
    let currentSection = "backlog";
    let collected = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect section headers
      if (trimmed.startsWith("## Urgente")) {
        currentSection = "in_progress";
        continue;
      }
      if (trimmed.startsWith("## Concluído") || trimmed.startsWith("## Concluido")) {
        currentSection = "done";
        continue;
      }
      if (trimmed.match(/^## \d{4}/)) {
        currentSection = "backlog";
        continue;
      }

      // Parse task lines: "- [ ] [TAG] Title" or "- [x] [TAG] Title" or "[x] [TAG] Title"
      const taskMatch = trimmed.match(
        /^[-*]?\s*\[([xX ])\]\s*(?:\[([^\]]+)\]\s*)?(.+)$/
      );
      if (!taskMatch) continue;

      const isDone = taskMatch[1].toLowerCase() === "x";
      const tag = taskMatch[2] || "";
      const title = taskMatch[3].trim();
      const status = isDone ? "done" : currentSection;
      const priority = inferPriority(tag, title);

      await ctx.runMutation(internal.collectors.taskCollector.upsertTask, {
        title: tag ? `[${tag}] ${title}` : title,
        status,
        priority,
        assigneeType: "agent",
        source: "Todo.md",
        bountyValue: priority === "critical" ? 200 : priority === "high" ? 150 : priority === "medium" ? 80 : 40,
      });
      collected++;
    }

    return { collected, timestamp: Date.now() };
  },
});

function inferPriority(tag: string, title: string): string {
  const upper = (tag + " " + title).toUpperCase();
  if (upper.includes("URGENT") || upper.includes("CRITICAL") || upper.includes("STRIPE")) return "critical";
  if (upper.includes("HIGH") || upper.includes("DASH") || upper.includes("QA")) return "high";
  if (upper.includes("DOC") || upper.includes("MEDIUM")) return "medium";
  return "low";
}
