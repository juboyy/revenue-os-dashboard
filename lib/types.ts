/* ─── revenue-OS Dashboard Types ─── */

// ━━━ Agent System ━━━
export type AgentStatus = "active" | "working" | "idle" | "error" | "sleeping";

export interface AgentRecord {
  id: string;
  name: string;
  emoji: string;
  department: string;
  room: string;
  status: AgentStatus;
  current_task: string | null;
  last_heartbeat: string | null;
  soul: string | null;
  tokens_today: number;
  tasks_completed: number;
  tasks_pending: number;
  tasks_blocked: number;
  model?: string;
  provider?: string;
  // Gamification
  xp: number;
  level: number;
  level_title: string;
  achievements: Achievement[];
  streak_days: number;
  // Stats
  stats: AgentStats;
  created_at: string;
  updated_at: string;
}

export interface AgentStats {
  speed: number;       // 0-100 — response time relative
  accuracy: number;    // 0-100 — success rate
  versatility: number; // 0-100 — unique tools used
  reliability: number; // 0-100 — uptime / streak
  creativity: number;  // 0-100 — context innovation
}

// ━━━ Gamification ━━━
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const LEVEL_TITLES = [
  "Recruit",      // 0
  "Apprentice",   // 1
  "Specialist",   // 2
  "Expert",       // 3
  "Veteran",      // 4
  "Master",       // 5
  "Champion",     // 6
  "Legend",        // 7
] as const;

export function getLevelFromXP(xp: number): { level: number; title: string; progress: number; nextXP: number } {
  const thresholds = [0, 100, 300, 600, 1200, 2500, 5000, 10000];
  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) { level = i; break; }
  }
  const current = thresholds[level];
  const next = thresholds[level + 1] ?? thresholds[level] * 2;
  const progress = ((xp - current) / (next - current)) * 100;
  return { level, title: LEVEL_TITLES[level] || "Legend", progress: Math.min(progress, 100), nextXP: next };
}

// ━━━ Monitoring & Usage ━━━
export interface UsageTotals {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  totalCost: number;
  inputCost: number;
  outputCost: number;
  cacheReadCost: number;
  cacheWriteCost: number;
}

export interface ProviderUsage {
  provider: string;
  model?: string;
  count: number;
  totals: UsageTotals;
}

export interface ModelUsage {
  provider?: string;
  model: string;
  count: number;
  totals: UsageTotals;
}

export interface ToolUsageEntry {
  name: string;
  count: number;
}

export interface SkillEntry {
  name: string;
  blockChars: number;
}

export interface MonitoringData {
  totals: UsageTotals;
  byProvider: ProviderUsage[];
  byModel: ModelUsage[];
  tools: {
    totalCalls: number;
    uniqueTools: number;
    tools: ToolUsageEntry[];
  };
  skills: SkillEntry[];
  daily: DailyMetric[];
  latency?: {
    avgMs: number;
    p95Ms: number;
    minMs: number;
    maxMs: number;
  };
}

export interface DailyMetric {
  date: string;
  tokens: number;
  cost: number;
  messages: number;
  toolCalls: number;
  errors: number;
}

// ━━━ Memory (mem0) ━━━
export interface Memory {
  id: string;
  content: string;
  agent_id: string;
  category: "fact" | "preference" | "decision" | "pattern";
  relevance: number;
  retrieval_count: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

export interface MemoryGraph {
  nodes: Memory[];
  edges: MemoryEdge[];
}

// ━━━ Spawn System ━━━
export interface SpawnConfig {
  name: string;
  emoji: string;
  department: string;
  role: string;
  model: string;
  provider: string;
  system_prompt: string;
  skills: string[];
  schedule?: string;
}

export interface SpawnTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Partial<SpawnConfig>;
}

// ━━━ Org Chart ━━━
export interface OrgNode {
  id: string;
  agent_id: string;
  parent_id: string | null;
  department: string;
  level: number;
  children: OrgNode[];
}

// ━━━ Tasks / Kanban ━━━
export type TaskStatus = "backlog" | "in_progress" | "review" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  created_at: string;
  updated_at: string;
}

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  critical: { label: "Critical", color: "#ef4444", icon: "🔴" },
  high: { label: "High", color: "#f59e0b", icon: "🟠" },
  medium: { label: "Medium", color: "#3b82f6", icon: "🔵" },
  low: { label: "Low", color: "#6b7280", icon: "⚪" },
};

export const KANBAN_COLUMNS: { id: TaskStatus; label: string; icon: string; color: string }[] = [
  { id: "backlog", label: "Backlog", icon: "📋", color: "#6b7280" },
  { id: "in_progress", label: "In Progress", icon: "⚡", color: "#f59e0b" },
  { id: "review", label: "Review", icon: "🔍", color: "#8b5cf6" },
  { id: "done", label: "Done", icon: "✅", color: "#10b981" },
  { id: "blocked", label: "Blocked", icon: "🚫", color: "#ef4444" },
];

// ━━━ Interactions ━━━
export interface InteractionEvent {
  id: string;
  from_agent: string;
  to_agent: string;
  type: "delegation" | "standup" | "escalation" | "collaboration";
  content: string;
  timestamp: string;
}

export interface StandupMessage {
  agent_id: string;
  agent_name: string;
  agent_emoji: string;
  message: string;
  timestamp: string;
}

// ━━━ Navigation ━━━
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

// ━━━ Metrics ━━━
export interface Metrics {
  totalTasksCompleted: number;
  totalTasksPending: number;
  totalTasksBlocked: number;
  totalTokensToday: number;
  totalCostToday: number;
  activeAgents: number;
  totalAgents: number;
  errorRate: number;
  avgLatencyMs: number;
}

// ━━━ Cron ━━━
export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  next_run: string;
  last_run: string | null;
  agent_id: string;
  status: "active" | "paused" | "error";
}

// ━━━ Static Agent Defaults ━━━
export const AGENT_DEFAULTS: Omit<AgentRecord, "created_at" | "updated_at">[] = [
  {
    id: "shanks", name: "Shanks", emoji: "🏴‍☠️", department: "OS Captain",
    room: "ponte-de-comando", status: "active",
    current_task: "Coordinating crew operations", last_heartbeat: new Date().toISOString(),
    soul: "The captain who sees the whole ocean.", tokens_today: 12400,
    tasks_completed: 23, tasks_pending: 4, tasks_blocked: 0,
    model: "glm-5", provider: "vercel-ai-gateway",
    xp: 2800, level: 5, level_title: "Master", achievements: [
      { id: "a1", name: "First Blood", description: "Complete first task", icon: "⚔️", earned_at: new Date(Date.now() - 86400000 * 10).toISOString(), rarity: "common" },
      { id: "a2", name: "Token Master", description: "Use 100K tokens", icon: "🪙", earned_at: new Date(Date.now() - 86400000 * 5).toISOString(), rarity: "rare" },
      { id: "a3", name: "Captain's Log", description: "Lead 50 delegations", icon: "📜", earned_at: new Date(Date.now() - 86400000 * 2).toISOString(), rarity: "epic" },
    ], streak_days: 14,
    stats: { speed: 85, accuracy: 92, versatility: 95, reliability: 98, creativity: 88 },
  },
  {
    id: "zoro", name: "Zoro", emoji: "⚔️", department: "Engineering Lead",
    room: "forja", status: "working",
    current_task: "Building dashboard components", last_heartbeat: new Date().toISOString(),
    soul: "Three-sword style coder.", tokens_today: 18700,
    tasks_completed: 15, tasks_pending: 3, tasks_blocked: 1,
    model: "glm-5", provider: "vercel-ai-gateway",
    xp: 3200, level: 5, level_title: "Master", achievements: [
      { id: "a4", name: "Code Samurai", description: "Ship 30 components", icon: "🗡️", earned_at: new Date(Date.now() - 86400000 * 3).toISOString(), rarity: "epic" },
      { id: "a5", name: "Night Owl", description: "10 late-night sessions", icon: "🦉", earned_at: new Date(Date.now() - 86400000 * 7).toISOString(), rarity: "rare" },
    ], streak_days: 12,
    stats: { speed: 90, accuracy: 88, versatility: 70, reliability: 95, creativity: 75 },
  },
  {
    id: "franky", name: "Franky", emoji: "🤖", department: "Architect",
    room: "estaleiro", status: "working",
    current_task: "Designing system architecture", last_heartbeat: new Date().toISOString(),
    soul: "SUUUPER architect!", tokens_today: 9300,
    tasks_completed: 8, tasks_pending: 2, tasks_blocked: 0,
    model: "glm-5", provider: "vercel-ai-gateway",
    xp: 1800, level: 4, level_title: "Veteran", achievements: [
      { id: "a6", name: "Architect", description: "Design 5 systems", icon: "🏗️", earned_at: new Date(Date.now() - 86400000 * 4).toISOString(), rarity: "legendary" },
    ], streak_days: 8,
    stats: { speed: 70, accuracy: 95, versatility: 85, reliability: 90, creativity: 92 },
  },
  {
    id: "chopper", name: "Chopper", emoji: "🩺", department: "Analyst",
    room: "laboratorio", status: "active",
    current_task: "Analyzing revenue metrics", last_heartbeat: new Date().toISOString(),
    soul: "The tiny doctor with a giant brain.", tokens_today: 6200,
    tasks_completed: 12, tasks_pending: 5, tasks_blocked: 0,
    model: "glm-5", provider: "vercel-ai-gateway",
    xp: 1400, level: 4, level_title: "Veteran", achievements: [], streak_days: 10,
    stats: { speed: 75, accuracy: 98, versatility: 60, reliability: 92, creativity: 80 },
  },
  {
    id: "nami", name: "Nami", emoji: "💰", department: "Finance",
    room: "tesouraria", status: "active",
    current_task: "Tracking token expenditure", last_heartbeat: new Date().toISOString(),
    soul: "Every berry counts, every token is tracked.", tokens_today: 4100,
    tasks_completed: 18, tasks_pending: 2, tasks_blocked: 0,
    model: "glm-5", provider: "vercel-ai-gateway",
    xp: 2200, level: 4, level_title: "Veteran", achievements: [
      { id: "a9", name: "Penny Pincher", description: "Save $10 in token costs", icon: "💎", earned_at: new Date(Date.now() - 86400000 * 1).toISOString(), rarity: "rare" },
    ], streak_days: 15,
    stats: { speed: 82, accuracy: 96, versatility: 65, reliability: 97, creativity: 70 },
  },
  {
    id: "robin", name: "Robin", emoji: "📚", department: "Research",
    room: "biblioteca", status: "idle", current_task: null,
    last_heartbeat: new Date().toISOString(),
    soul: "The archaeologist of knowledge.", tokens_today: 3400,
    tasks_completed: 7, tasks_pending: 1, tasks_blocked: 0,
    model: "glm-5", provider: "vercel-ai-gateway",
    xp: 950, level: 3, level_title: "Expert", achievements: [], streak_days: 6,
    stats: { speed: 65, accuracy: 94, versatility: 90, reliability: 88, creativity: 95 },
  },
  {
    id: "jinbe", name: "Jinbe", emoji: "⚓", department: "DevOps",
    room: "sala-de-maquinas", status: "active",
    current_task: "Monitoring infrastructure", last_heartbeat: new Date().toISOString(),
    soul: "The helmsman who keeps the ship steady.", tokens_today: 7800,
    tasks_completed: 20, tasks_pending: 3, tasks_blocked: 0,
    model: "glm-5", provider: "vercel-ai-gateway",
    xp: 2600, level: 5, level_title: "Master", achievements: [], streak_days: 20,
    stats: { speed: 78, accuracy: 93, versatility: 72, reliability: 99, creativity: 60 },
  },
  {
    id: "usopp", name: "Usopp", emoji: "🎯", department: "QA & Testing",
    room: "torre-de-vigia", status: "idle", current_task: null,
    last_heartbeat: new Date().toISOString(),
    soul: "The sniper who never misses a bug.", tokens_today: 2900,
    tasks_completed: 11, tasks_pending: 1, tasks_blocked: 0,
    model: "glm-5", provider: "vercel-ai-gateway",
    xp: 720, level: 3, level_title: "Expert", achievements: [], streak_days: 4,
    stats: { speed: 88, accuracy: 97, versatility: 55, reliability: 85, creativity: 65 },
  },
  {
    id: "sanji", name: "Sanji", emoji: "🍳", department: "Content & Marketing",
    room: "cozinha", status: "working",
    current_task: "Crafting content strategy", last_heartbeat: new Date().toISOString(),
    soul: "Every dish is plated to perfection.", tokens_today: 5600,
    tasks_completed: 9, tasks_pending: 2, tasks_blocked: 0,
    model: "glm-5", provider: "vercel-ai-gateway",
    xp: 1100, level: 3, level_title: "Expert", achievements: [], streak_days: 7,
    stats: { speed: 80, accuracy: 85, versatility: 80, reliability: 90, creativity: 98 },
  },
];
