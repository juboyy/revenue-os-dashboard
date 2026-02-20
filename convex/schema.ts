import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ━━━ Agent status (synced from OpenClaw Gateway) ━━━
  agents: defineTable({
    agentId: v.string(),       // "shanks", "zoro", "nami", etc.
    name: v.string(),
    emoji: v.string(),
    department: v.string(),
    room: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("working"),
      v.literal("idle"),
      v.literal("error"),
      v.literal("sleeping"),
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
    // Gamification
    xp: v.number(),
    level: v.number(),
    levelTitle: v.string(),
    streakDays: v.number(),
    // Stats
    speed: v.number(),
    accuracy: v.number(),
    versatility: v.number(),
    reliability: v.number(),
    creativity: v.number(),
  })
    .index("by_agentId", ["agentId"])
    .index("by_status", ["status"])
    .index("by_department", ["department"]),

  // ━━━ Agent metrics (daily snapshots for history) ━━━
  agentMetrics: defineTable({
    agentId: v.string(),
    date: v.string(),             // "2026-02-19"
    tasksCompleted: v.number(),
    tasksDelegated: v.number(),
    tasksFailed: v.number(),
    tokensUsed: v.number(),
    avgResponseTimeMs: v.optional(v.number()),
    heartbeatsExecuted: v.number(),
    cost: v.optional(v.number()),
  })
    .index("by_agent_date", ["agentId", "date"])
    .index("by_date", ["date"]),

  // ━━━ Tasks (synced from Todo.md) ━━━
  tasks: defineTable({
    taskId: v.string(),           // "STRIPE-2026", "DASH-001", etc.
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("backlog"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical"),
    ),
    assignee: v.optional(v.string()),  // agentId
    jiraKey: v.optional(v.string()),   // "XYZ-456"
    sprint: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_taskId", ["taskId"]),

  // ━━━ Event log (agent interactions, delegations, errors) ━━━
  events: defineTable({
    agentId: v.string(),
    eventType: v.union(
      v.literal("delegation"),
      v.literal("standup"),
      v.literal("escalation"),
      v.literal("collaboration"),
      v.literal("task_completed"),
      v.literal("error"),
      v.literal("heartbeat"),
    ),
    targetAgentId: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_agentId", ["agentId"])
    .index("by_eventType", ["eventType"]),

  // ━━━ Memories (knowledge graph nodes) ━━━
  memories: defineTable({
    memoryId: v.string(),
    content: v.string(),
    agentId: v.string(),
    category: v.union(
      v.literal("fact"),
      v.literal("preference"),
      v.literal("decision"),
      v.literal("pattern"),
    ),
    relevance: v.number(),
    retrievalCount: v.number(),
    source: v.optional(v.string()),  // "MEMORY.md", "daily/2026-02-19.md"
  })
    .index("by_agentId", ["agentId"])
    .index("by_category", ["category"]),

  // ━━━ Memory edges (connections between memories) ━━━
  memoryEdges: defineTable({
    sourceId: v.string(),
    targetId: v.string(),
    relationship: v.string(),     // "informs", "requires", "related", "depends"
    weight: v.number(),
  })
    .index("by_source", ["sourceId"])
    .index("by_target", ["targetId"]),

  // ━━━ Usage monitoring (token/cost snapshots) ━━━
  usageSnapshots: defineTable({
    date: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cacheReadTokens: v.number(),
    cacheWriteTokens: v.number(),
    totalTokens: v.number(),
    totalCost: v.number(),
    byProvider: v.optional(v.any()),  // JSON of provider breakdown
    byModel: v.optional(v.any()),     // JSON of model breakdown
    tools: v.optional(v.any()),       // JSON of tool usage
    latencyAvgMs: v.optional(v.number()),
    latencyP95Ms: v.optional(v.number()),
  })
    .index("by_date", ["date"]),

  // ━━━ Standup messages ━━━
  standupMessages: defineTable({
    agentId: v.string(),
    agentName: v.string(),
    agentEmoji: v.string(),
    message: v.string(),
  })
    .index("by_agentId", ["agentId"]),

  // ━━━ Achievements ━━━
  achievements: defineTable({
    agentId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    earnedAt: v.string(),
    rarity: v.union(
      v.literal("common"),
      v.literal("rare"),
      v.literal("epic"),
      v.literal("legendary"),
    ),
  })
    .index("by_agentId", ["agentId"]),

  // ━━━ Cron jobs (synced from Gateway) ━━━
  cronJobs: defineTable({
    cronId: v.string(),
    name: v.string(),
    schedule: v.string(),
    nextRun: v.optional(v.string()),
    lastRun: v.optional(v.string()),
    agentId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("error"),
    ),
  })
    .index("by_agentId", ["agentId"])
    .index("by_status", ["status"]),
});
