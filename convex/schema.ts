import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    agentId: v.string(),
    name: v.string(),
    emoji: v.string(),
    department: v.string(),
    role: v.string(),
    room: v.string(),
    soul: v.optional(v.string()),
    model: v.string(),
    provider: v.string(),
    skills: v.array(v.string()),
    status: v.string(),
    currentTask: v.optional(v.string()),
    sessionKey: v.optional(v.string()),
    lastHeartbeat: v.number(),
    xp: v.number(),
    level: v.number(),
    levelTitle: v.string(),
    tokensConsumed: v.number(),
    tokensToday: v.number(),
    tasksCompleted: v.number(),
    tasksPending: v.number(),
    tasksBlocked: v.number(),
    costTotal: v.number(),
    streakDays: v.number(),
    lastActiveDate: v.string(),
    speed: v.number(),
    accuracy: v.number(),
    versatility: v.number(),
    reliability: v.number(),
    creativity: v.number(),
  })
    .index("by_agentId", ["agentId"])
    .index("by_department", ["department"])
    .index("by_status", ["status"])
    .index("by_xp", ["xp"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    assignee: v.optional(v.string()),
    assigneeType: v.string(),
    source: v.optional(v.string()),
    bountyValue: v.number(),
    dueDate: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_priority", ["priority"]),

  interactions: defineTable({
    fromAgent: v.string(),
    toAgent: v.string(),
    type: v.string(),
    content: v.string(),
    relatedTask: v.optional(v.id("tasks")),
    timestamp: v.number(),
  })
    .index("by_fromAgent", ["fromAgent"])
    .index("by_toAgent", ["toAgent"])
    .index("by_type", ["type"]),

  standupMessages: defineTable({
    agentId: v.string(),
    agentName: v.string(),
    agentEmoji: v.string(),
    message: v.string(),
    timestamp: v.number(),
  })
    .index("by_agentId", ["agentId"])
    .index("by_timestamp", ["timestamp"]),

  memories: defineTable({
    title: v.string(),
    content: v.string(),
    filePath: v.string(),
    agentId: v.optional(v.string()),
    category: v.string(),
    relevance: v.number(),
    retrievalCount: v.number(),
    tags: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_agentId", ["agentId"])
    .index("by_category", ["category"])
    .index("by_filePath", ["filePath"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["agentId", "category"],
    }),

  memoryEdges: defineTable({
    sourceId: v.id("memories"),
    targetId: v.id("memories"),
    relationship: v.string(),
    weight: v.number(),
  })
    .index("by_source", ["sourceId"])
    .index("by_target", ["targetId"]),

  metrics: defineTable({
    metricType: v.string(),
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
    createdAt: v.number(),
  })
    .index("by_metricType", ["metricType"])
    .index("by_period", ["period"])
    .index("by_provider", ["provider"])
    .index("by_model", ["model"]),

  cronJobs: defineTable({
    name: v.string(),
    schedule: v.string(),
    nextRun: v.optional(v.number()),
    lastRun: v.optional(v.number()),
    agentId: v.string(),
    status: v.string(),
  })
    .index("by_agentId", ["agentId"])
    .index("by_status", ["status"]),

  contentItems: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    stage: v.string(),
    script: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    assignee: v.optional(v.string()),
    tags: v.array(v.string()),
    dueDate: v.optional(v.number()),
  })
    .index("by_stage", ["stage"]),

  bounties: defineTable({
    title: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(),
    assignee: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    tags: v.array(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"]),

  transactions: defineTable({
    amount: v.number(),
    currency: v.string(),
    type: v.string(),
    category: v.string(),
    description: v.string(),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"])
    .index("by_category", ["category"]),
});
