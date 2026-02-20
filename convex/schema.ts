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
    sessionKey: v.optional(v.string()),  // from sessionCollector
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
    taskId: v.optional(v.string()),    // "STRIPE-2026", "DASH-001", etc.
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),                // flexible for collectors
    priority: v.string(),              // flexible for collectors
    assignee: v.optional(v.string()),  // agentId
    jiraKey: v.optional(v.string()),   // "XYZ-456"
    sprint: v.optional(v.string()),
    assigneeType: v.optional(v.string()),  // from taskCollector
    source: v.optional(v.string()),        // from taskCollector
    bountyValue: v.optional(v.number()),   // from taskCollector
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_taskId", ["taskId"]),

  // ━━━ Event log (agent interactions, delegations, errors) ━━━
  events: defineTable({
    agentId: v.string(),
    eventType: v.string(),             // flexible for all event types
    targetAgentId: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_agentId", ["agentId"])
    .index("by_eventType", ["eventType"]),

  // ━━━ Memories (knowledge graph nodes) ━━━
  memories: defineTable({
    memoryId: v.optional(v.string()),
    title: v.optional(v.string()),        // from memoryCollector
    content: v.string(),
    agentId: v.optional(v.string()),      // optional for memoryCollector
    filePath: v.optional(v.string()),     // from memoryCollector
    category: v.string(),                 // flexible for collectors
    relevance: v.number(),
    retrievalCount: v.number(),
    source: v.optional(v.string()),       // "MEMORY.md", "daily/2026-02-19.md"
    tags: v.optional(v.array(v.string())),  // from memoryCollector
    createdAt: v.optional(v.number()),    // from memoryCollector
  })
    .index("by_agentId", ["agentId"])
    .index("by_category", ["category"])
    .index("by_filePath", ["filePath"]),

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

  // ━━━ Metrics (from metricsCollector) ━━━
  metrics: defineTable({
    metricType: v.optional(v.string()),  // "daily"
    period: v.string(),                   // "2026-02-19"
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
    createdAt: v.optional(v.number()),
  })
    .index("by_period", ["period"]),

  // ━━━ Content items ━━━
  contentItems: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    type: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }),

  // ━━━ Bounties ━━━
  bounties: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    value: v.optional(v.number()),
    status: v.optional(v.string()),
    assignee: v.optional(v.string()),
  }),

  // ━━━ Transactions ━━━
  transactions: defineTable({
    type: v.optional(v.string()),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    agentId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }),

  // ━━━ Interactions ━━━
  interactions: defineTable({
    fromAgent: v.optional(v.string()),
    toAgent: v.optional(v.string()),
    type: v.optional(v.string()),
    message: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }),
});
