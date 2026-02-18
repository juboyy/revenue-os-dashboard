/**
 * Zustand global store — central state for the entire dashboard.
 * Contains agents, monitoring data, memory graph, interactions, standup messages, and tasks.
 * Uses mock data generators until OpenClaw live APIs are connected.
 */
import { create } from "zustand";
import type {
  AgentRecord, MonitoringData, Memory, MemoryGraph,
  SpawnConfig, InteractionEvent, StandupMessage, Metrics, CronJob, TaskItem, TaskStatus
} from "./types";
import { AGENT_DEFAULTS } from "./types";
import { supabase } from "./supabase";

// ━━━ Mock Data Generators ━━━
// These functions produce realistic sample data for development.
// They will be replaced by API calls to OpenClaw + Supabase once integrated.

/** Generates monitoring data: token/cost totals, provider/model breakdowns, tool usage, 14-day daily series */
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

/** Generates a knowledge graph with 20 memory nodes and 15 edges for the Memory page */
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

/** Generates 16 realistic tasks across all Kanban columns with varied priorities */
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

// ━━━ Store Interface ━━━
// All top-level state + actions available to any component via useDashboardStore()
interface DashboardStore {
  // Agents
  agents: AgentRecord[];
  selectedAgent: string | null;
  selectAgent: (id: string | null) => void;
  // Monitoring
  monitoring: MonitoringData | null;
  // Memory
  memoryGraph: MemoryGraph | null;
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  // Interactions
  standupMessages: StandupMessage[];
  interactions: InteractionEvent[];
  // Tasks (Kanban board)
  tasks: TaskItem[];
  /** Moves a task to a new column — called on drag-and-drop in the Kanban */
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  /** Hydrates the store with mock data — called once from StoreInitializer on mount */
  initialize: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  agents: [],
  selectedAgent: null,
  selectAgent: (id) => set({ selectedAgent: id }),
  monitoring: null,
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
    // Try Supabase first, fall back to mock data
    let agents: AgentRecord[];
    try {
      const { data, error } = await supabase
        .from("agent_status")
        .select("*")
        .order("name");
      if (!error && data && data.length > 0) {
        agents = data as AgentRecord[];
      } else {
        const now = new Date().toISOString();
        agents = AGENT_DEFAULTS.map(a => ({ ...a, created_at: now, updated_at: now })) as AgentRecord[];
      }
    } catch {
      const now = new Date().toISOString();
      agents = AGENT_DEFAULTS.map(a => ({ ...a, created_at: now, updated_at: now })) as AgentRecord[];
    }

    const standupMessages: StandupMessage[] = [
      { agent_id: "shanks", agent_name: "Shanks", agent_emoji: "🏴‍☠️", message: "Bom dia, tripulação! Todos os sistemas operando a plena capacidade.", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { agent_id: "zoro", agent_name: "Zoro", agent_emoji: "⚔️", message: "Finalizei os componentes de monitoramento. Partindo para o grafo de memória.", timestamp: new Date(Date.now() - 2400000).toISOString() },
      { agent_id: "nami", agent_name: "Nami", agent_emoji: "💰", message: "Custos de token 12% abaixo do orçamento. Taxa de cache do GLM-5 subiu para 68%.", timestamp: new Date(Date.now() - 1800000).toISOString() },
      { agent_id: "chopper", agent_name: "Chopper", agent_emoji: "🩺", message: "Analisei padrões de latência — P95 caiu para 1.2s após otimização de cache.", timestamp: new Date(Date.now() - 900000).toISOString() },
      { agent_id: "franky", agent_name: "Franky", agent_emoji: "🤖", message: "SUUUPER! Documentação de arquitetura atualizada. Schema do spawn pronto para revisão.", timestamp: new Date(Date.now() - 300000).toISOString() },
    ];

    const interactions: InteractionEvent[] = [
      { id: "int-1", from_agent: "shanks", to_agent: "zoro", type: "delegation", content: "Construir componentes do dashboard de monitoramento", timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: "int-2", from_agent: "zoro", to_agent: "franky", type: "collaboration", content: "Preciso de revisão da arquitetura dos componentes", timestamp: new Date(Date.now() - 5400000).toISOString() },
      { id: "int-3", from_agent: "nami", to_agent: "chopper", type: "collaboration", content: "Cruzar custos de tokens com padrões de latência", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: "int-4", from_agent: "chopper", to_agent: "shanks", type: "escalation", content: "Pico na taxa de erros detectado na última hora", timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: "int-5", from_agent: "franky", to_agent: "jinbe", type: "delegation", content: "Deploy do ambiente de staging para revisão", timestamp: new Date(Date.now() - 600000).toISOString() },
    ];

    set({
      agents,
      monitoring: generateMockMonitoring(),
      memoryGraph: generateMockMemories(),
      standupMessages,
      interactions,
      tasks: generateMockTasks(),
    });
  },
}));
