"use client";

/**
 * Zustand global store — central state for the entire dashboard.
 * Uses Convex as the single source of truth.
 */
import { create } from "zustand";
import type {
  AgentRecord, MonitoringData, Memory, MemoryGraph,
  SpawnConfig, InteractionEvent, StandupMessage, Metrics, CronJob, TaskItem, TaskStatus, FinanceData
} from "./types";
import { AGENT_DEFAULTS } from "./types";
import { convexQuery } from "./convexHttp";

// ━━━ Mock Data Generators (used only when Convex is empty) ━━━
function generateMockMonitoring(): MonitoringData {
  return {
    totals: {
      input: 245000, output: 189000, cacheRead: 52000, cacheWrite: 18000,
      totalTokens: 504000, totalCost: 2.47,
      inputCost: 0.98, outputCost: 1.13, cacheReadCost: 0.21, cacheWriteCost: 0.15,
    },
    byProvider: [
      { provider: "vercel-ai-gateway", count: 142, totals: { input: 200000, output: 155000, cacheRead: 52000, cacheWrite: 18000, totalTokens: 425000, totalCost: 2.08, inputCost: 0.8, outputCost: 0.93, cacheReadCost: 0.21, cacheWriteCost: 0.14 } },
      { provider: "openai", count: 28, totals: { input: 30000, output: 22000, cacheRead: 0, cacheWrite: 0, totalTokens: 52000, totalCost: 0.26, inputCost: 0.12, outputCost: 0.14, cacheReadCost: 0, cacheWriteCost: 0 } },
      { provider: "anthropic", count: 12, totals: { input: 15000, output: 12000, cacheRead: 0, cacheWrite: 0, totalTokens: 27000, totalCost: 0.13, inputCost: 0.06, outputCost: 0.07, cacheReadCost: 0, cacheWriteCost: 0 } },
    ],
    byModel: [
      { model: "zai/glm-5", provider: "vercel-ai-gateway", count: 142, totals: { input: 200000, output: 155000, cacheRead: 52000, cacheWrite: 18000, totalTokens: 425000, totalCost: 2.08, inputCost: 0.8, outputCost: 0.93, cacheReadCost: 0.21, cacheWriteCost: 0.14 } },
      { model: "gpt-4o", provider: "openai", count: 28, totals: { input: 30000, output: 22000, cacheRead: 0, cacheWrite: 0, totalTokens: 52000, totalCost: 0.26, inputCost: 0.12, outputCost: 0.14, cacheReadCost: 0, cacheWriteCost: 0 } },
      { model: "claude-3-sonnet", provider: "anthropic", count: 12, totals: { input: 15000, output: 12000, cacheRead: 0, cacheWrite: 0, totalTokens: 27000, totalCost: 0.13, inputCost: 0.06, outputCost: 0.07, cacheReadCost: 0, cacheWriteCost: 0 } },
    ],
    tools: {
      totalCalls: 386,
      uniqueTools: 12,
      tools: [
        { name: "grep_search", count: 87 },
        { name: "view_file", count: 74 },
        { name: "write_to_file", count: 62 },
        { name: "run_command", count: 53 },
        { name: "list_dir", count: 41 },
        { name: "replace_file_content", count: 28 },
        { name: "browser_subagent", count: 18 },
        { name: "search_web", count: 12 },
        { name: "generate_image", count: 6 },
        { name: "read_url_content", count: 3 },
        { name: "view_code_item", count: 1 },
        { name: "send_command_input", count: 1 },
      ],
    },
    skills: [
      { name: "code_review", blockChars: 4200 },
      { name: "web_development", blockChars: 6800 },
      { name: "api_integration", blockChars: 3500 },
      { name: "database_design", blockChars: 2900 },
      { name: "security_audit", blockChars: 5100 },
    ],
    daily: Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return {
        date: d.toISOString().split("T")[0],
        tokens: 25000 + Math.floor(Math.random() * 40000),
        cost: 0.12 + Math.random() * 0.35,
        messages: 40 + Math.floor(Math.random() * 60),
        toolCalls: 15 + Math.floor(Math.random() * 35),
        errors: Math.floor(Math.random() * 5),
      };
    }),
    latency: { avgMs: 420, p95Ms: 1200, minMs: 89, maxMs: 3800 },
  };
}

function generateMockMemories(): MemoryGraph {
  const cats: Memory["category"][] = ["fact", "preference", "decision", "pattern"];
  const agents = AGENT_DEFAULTS.map(a => a.id);
  const nodes: Memory[] = Array.from({ length: 20 }, (_, i) => ({
    id: `mem-${i}`,
    content: [
      "User prefers dark theme interfaces",
      "Dashboard should use glassmorphism effects",
      "Always run tests before deploying",
      "Revenue metrics need daily granularity",
      "Authentication uses Supabase",
      "Pixel-art style for virtual office",
      "Agent delegation follows hierarchy",
      "Token budget caps at $10/day",
      "Monitoring should include latency P95",
      "Skills loaded from SKILL.md files",
      "Memory graphs use force-directed layout",
      "WebSocket for real-time updates",
      "Error rate threshold is 5%",
      "Cache read reduces costs by 40%",
      "One Piece theme for UI elements",
      "Gamification XP scales logarithmically",
      "Tools are sorted by usage frequency",
      "Provider fallback: vercel → openai → anthropic",
      "Spawn templates reduce onboarding time",
      "Org chart supports 5 hierarchy levels",
    ][i],
    agent_id: agents[i % agents.length],
    category: cats[i % cats.length],
    relevance: 0.5 + Math.random() * 0.5,
    retrieval_count: Math.floor(Math.random() * 20),
    created_at: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }));
  const edges: MemoryGraph["edges"] = [
    { source: "mem-0", target: "mem-1", relationship: "informs", weight: 0.8 },
    { source: "mem-2", target: "mem-3", relationship: "requires", weight: 0.6 },
    { source: "mem-4", target: "mem-5", relationship: "related", weight: 0.5 },
    { source: "mem-6", target: "mem-7", relationship: "depends", weight: 0.9 },
    { source: "mem-8", target: "mem-9", relationship: "related", weight: 0.7 },
    { source: "mem-10", target: "mem-11", relationship: "informs", weight: 0.6 },
    { source: "mem-0", target: "mem-14", relationship: "related", weight: 0.4 },
    { source: "mem-3", target: "mem-8", relationship: "requires", weight: 0.7 },
    { source: "mem-12", target: "mem-13", relationship: "informs", weight: 0.8 },
    { source: "mem-15", target: "mem-16", relationship: "related", weight: 0.5 },
    { source: "mem-1", target: "mem-10", relationship: "informs", weight: 0.6 },
    { source: "mem-14", target: "mem-15", relationship: "related", weight: 0.4 },
    { source: "mem-17", target: "mem-18", relationship: "depends", weight: 0.7 },
    { source: "mem-7", target: "mem-12", relationship: "informs", weight: 0.5 },
    { source: "mem-19", target: "mem-6", relationship: "related", weight: 0.6 },
  ];
  return { nodes, edges };
}

function generateMockTasks(): TaskItem[] {
  const now = Date.now();
  return [
    { id: "t1", title: "Implement WebSocket real-time updates", description: "Add live data streaming for agent status changes", status: "in_progress", priority: "high", assignee: "zoro", created_at: new Date(now - 86400000 * 3).toISOString(), updated_at: new Date(now - 3600000).toISOString() },
    { id: "t2", title: "Design token budget alert system", description: "Notify when daily token spend exceeds threshold", status: "backlog", priority: "medium", assignee: "nami", created_at: new Date(now - 86400000 * 2).toISOString(), updated_at: new Date(now - 86400000).toISOString() },
    { id: "t3", title: "Integrate mem0 API for persistent memory", description: "Replace mock memory data with real mem0 cloud calls", status: "in_progress", priority: "critical", assignee: "robin", created_at: new Date(now - 86400000 * 5).toISOString(), updated_at: new Date(now - 7200000).toISOString() },
    { id: "t4", title: "Build agent spawn wizard", description: "Step-by-step form for creating new agents with templates", status: "review", priority: "medium", assignee: "franky", created_at: new Date(now - 86400000 * 4).toISOString(), updated_at: new Date(now - 1800000).toISOString() },
    { id: "t5", title: "Create cron job scheduler UI", description: "Visual timeline and CRUD for scheduled tasks", status: "backlog", priority: "low", assignee: null, created_at: new Date(now - 86400000).toISOString(), updated_at: new Date(now - 86400000).toISOString() },
    { id: "t6", title: "Implement error boundary components", description: "Graceful error handling for all page routes", status: "done", priority: "high", assignee: "jinbe", created_at: new Date(now - 86400000 * 7).toISOString(), updated_at: new Date(now - 86400000 * 2).toISOString() },
    { id: "t7", title: "Add latency heatmap to monitoring", description: "Hourly heatmap showing response time patterns", status: "backlog", priority: "medium", assignee: "chopper", created_at: new Date(now - 86400000 * 2).toISOString(), updated_at: new Date(now - 86400000 * 2).toISOString() },
    { id: "t8", title: "Fix cache hit rate calculation", description: "Cache read tokens not properly counted in totals", status: "blocked", priority: "critical", assignee: "zoro", created_at: new Date(now - 86400000 * 6).toISOString(), updated_at: new Date(now - 86400000).toISOString() },
    { id: "t9", title: "SEO metadata for all pages", description: "Add title, description, and Open Graph tags", status: "done", priority: "low", assignee: "sanji", created_at: new Date(now - 86400000 * 8).toISOString(), updated_at: new Date(now - 86400000 * 3).toISOString() },
    { id: "t10", title: "Provider failover logic", description: "Automatic fallback: vercel → openai → anthropic", status: "in_progress", priority: "high", assignee: "jinbe", created_at: new Date(now - 86400000 * 4).toISOString(), updated_at: new Date(now - 3600000 * 5).toISOString() },
    { id: "t11", title: "Pixel-art virtual office map", description: "Isometric tilemap for the office floor visualization", status: "backlog", priority: "medium", assignee: null, created_at: new Date(now - 86400000).toISOString(), updated_at: new Date(now - 86400000).toISOString() },
    { id: "t12", title: "Agent delegation protocol", description: "Implement task routing based on specialization", status: "review", priority: "high", assignee: "shanks", created_at: new Date(now - 86400000 * 5).toISOString(), updated_at: new Date(now - 7200000).toISOString() },
    { id: "t13", title: "Dark mode toggle", description: "Add theme switch between dark ocean and light mode", status: "backlog", priority: "low", assignee: null, created_at: new Date(now - 86400000 * 3).toISOString(), updated_at: new Date(now - 86400000 * 3).toISOString() },
    { id: "t14", title: "Unit tests for store actions", description: "Test all Zustand store mutations and selectors", status: "in_progress", priority: "medium", assignee: "usopp", created_at: new Date(now - 86400000 * 2).toISOString(), updated_at: new Date(now - 3600000 * 2).toISOString() },
    { id: "t15", title: "Performance optimization pass", description: "Reduce bundle size, lazy load heavy components", status: "backlog", priority: "high", assignee: null, created_at: new Date(now - 86400000).toISOString(), updated_at: new Date(now - 86400000).toISOString() },
    { id: "t16", title: "Standup room typewriter effect", description: "Animate new messages with typing animation", status: "done", priority: "low", assignee: "sanji", created_at: new Date(now - 86400000 * 6).toISOString(), updated_at: new Date(now - 86400000 * 4).toISOString() },
  ];
}

interface DashboardStore {
  agents: AgentRecord[];
  selectedAgent: string | null;
  selectAgent: (id: string | null) => void;
  monitoring: MonitoringData | null;
  finance: FinanceData | null;
  memoryGraph: MemoryGraph | null;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  standupMessages: StandupMessage[];
  interactions: InteractionEvent[];
  tasks: TaskItem[];
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  initialize: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  agents: [],
  selectedAgent: null,
  selectAgent: (id) => set({ selectedAgent: id }),
  monitoring: null,
  finance: null,
  memoryGraph: null,
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  standupMessages: [],
  interactions: [],
  tasks: [],
  moveTask: (taskId, newStatus) => set((s) => ({
    tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t),
  })),
  initialize: async () => {
    const agentsRaw = await convexQuery<any[]>("agents:list", {});
    const agents = agentsRaw && agentsRaw.length > 0
      ? agentsRaw.map((a) => ({
          id: a.agentId,
          name: a.name,
          emoji: a.emoji,
          department: a.department,
          room: a.room,
          status: a.status,
          current_task: a.currentTask ?? null,
          last_heartbeat: a.lastHeartbeat ? new Date(a.lastHeartbeat).toISOString() : null,
          soul: a.soul ?? null,
          tokens_today: a.tokensToday ?? 0,
          tasks_completed: a.tasksCompleted ?? 0,
          tasks_pending: a.tasksPending ?? 0,
          tasks_blocked: a.tasksBlocked ?? 0,
          model: a.model,
          provider: a.provider,
          xp: a.xp ?? 0,
          level: a.level ?? 0,
          level_title: a.levelTitle ?? "",
          achievements: [],
          streak_days: a.streakDays ?? 0,
          stats: {
            speed: a.speed ?? 0,
            accuracy: a.accuracy ?? 0,
            versatility: a.versatility ?? 0,
            reliability: a.reliability ?? 0,
            creativity: a.creativity ?? 0,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) as AgentRecord[]
      : AGENT_DEFAULTS.map(a => ({ ...a, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) as AgentRecord[];

    const tasksRaw = await convexQuery<any[]>("tasks:list", {});
    const tasks = tasksRaw && tasksRaw.length > 0
      ? tasksRaw.map((t) => ({
          id: t._id,
          title: t.title,
          description: t.description ?? "",
          status: t.status,
          priority: t.priority,
          assignee: t.assignee ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          due_date: t.dueDate ? new Date(t.dueDate).toISOString() : null,
        })) as TaskItem[]
      : generateMockTasks();

    const interRaw = await convexQuery<any[]>("interactions:list", {});
    const standupRaw = await convexQuery<any[]>("interactions:standups", {});
    const interactions = (interRaw ?? []).map((i) => ({
      id: i._id,
      from_agent: i.fromAgent,
      to_agent: i.toAgent,
      type: i.type,
      content: i.content,
      timestamp: new Date(i.timestamp).toISOString(),
    })) as InteractionEvent[];
    const standupMessages = (standupRaw ?? []).map((m) => ({
      agent_id: m.agentId,
      agent_name: m.agentName,
      agent_emoji: m.agentEmoji,
      message: m.message,
      timestamp: new Date(m.timestamp).toISOString(),
    })) as StandupMessage[];

    const memRaw = await convexQuery<any[]>("memories:list", {});
    const edgeRaw = await convexQuery<any[]>("memories:edges", {});
    const memoryGraph: MemoryGraph = memRaw && memRaw.length > 0
      ? {
          nodes: memRaw.map((m) => ({
            id: m._id,
            content: m.content,
            agent_id: m.agentId ?? "",
            category: m.category,
            relevance: m.relevance,
            retrieval_count: m.retrievalCount,
            created_at: new Date(m.createdAt).toISOString(),
            updated_at: new Date(m.createdAt).toISOString(),
            metadata: { title: m.title, filePath: m.filePath, tags: m.tags },
          })) as Memory[],
          edges: (edgeRaw ?? []).map((e) => ({
            source: e.sourceId,
            target: e.targetId,
            relationship: e.relationship,
            weight: e.weight,
          })),
        }
      : generateMockMemories();

    const metricsRaw = await convexQuery<any[]>("metrics:list", {});
    const monitoring = metricsRaw && metricsRaw.length > 0 ? generateMockMonitoring() : generateMockMonitoring();

    // TODO: replace with Convex metrics aggregation once collectors are wired

    set({
      agents,
      monitoring,
      memoryGraph,
      standupMessages,
      interactions,
      tasks,
      finance: null,
    });
  },
}));
