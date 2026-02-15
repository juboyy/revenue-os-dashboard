/* ─── revenue-OS Dashboard Types ─── */

export type AgentStatus = "active" | "working" | "idle" | "error";

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
  created_at: string;
  updated_at: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  next_run: string;
  last_run: string | null;
  agent_id: string;
}

export interface Metrics {
  totalTasksCompleted: number;
  totalTasksPending: number;
  totalTasksBlocked: number;
  totalTokensToday: number;
  activeAgents: number;
  totalAgents: number;
}

/** Static fallback agent definitions (used when DB is empty) */
export const AGENT_DEFAULTS: Omit<AgentRecord, "created_at" | "updated_at">[] = [
  {
    id: "shanks",
    name: "Shanks",
    emoji: "🏴‍☠️",
    department: "OS Captain",
    room: "ponte-de-comando",
    status: "active",
    current_task: "Coordinating crew operations",
    last_heartbeat: new Date().toISOString(),
    soul: "The captain who sees the whole ocean. Delegates with trust, intervenes with precision.",
    tokens_today: 12400,
    tasks_completed: 23,
    tasks_pending: 4,
    tasks_blocked: 0,
  },
  {
    id: "zoro",
    name: "Zoro",
    emoji: "⚔️",
    department: "Engineering Lead",
    room: "forja",
    status: "working",
    current_task: "Building dashboard components",
    last_heartbeat: new Date().toISOString(),
    soul: "Three-sword style coder. Gets lost in directories but always finds the optimal path.",
    tokens_today: 18700,
    tasks_completed: 15,
    tasks_pending: 3,
    tasks_blocked: 1,
  },
  {
    id: "franky",
    name: "Franky",
    emoji: "🤖",
    department: "Architect",
    room: "estaleiro",
    status: "working",
    current_task: "Designing system architecture",
    last_heartbeat: new Date().toISOString(),
    soul: "SUUUPER architect! Builds systems that are both beautiful and bulletproof.",
    tokens_today: 9300,
    tasks_completed: 8,
    tasks_pending: 2,
    tasks_blocked: 0,
  },
  {
    id: "chopper",
    name: "Chopper",
    emoji: "🩺",
    department: "Analyst",
    room: "laboratorio",
    status: "active",
    current_task: "Analyzing revenue metrics",
    last_heartbeat: new Date().toISOString(),
    soul: "The tiny doctor with a giant brain. Diagnoses data anomalies before they spread.",
    tokens_today: 6200,
    tasks_completed: 12,
    tasks_pending: 5,
    tasks_blocked: 0,
  },
  {
    id: "nami",
    name: "Nami",
    emoji: "💰",
    department: "Finance",
    room: "tesouraria",
    status: "active",
    current_task: "Tracking token expenditure",
    last_heartbeat: new Date().toISOString(),
    soul: "The navigator who charts financial waters. Every berry counts, every token is tracked.",
    tokens_today: 4100,
    tasks_completed: 18,
    tasks_pending: 2,
    tasks_blocked: 0,
  },
  {
    id: "robin",
    name: "Robin",
    emoji: "📚",
    department: "Research",
    room: "biblioteca",
    status: "idle",
    current_task: null,
    last_heartbeat: new Date().toISOString(),
    soul: "The archaeologist of knowledge. Reads between the lines of every dataset.",
    tokens_today: 3400,
    tasks_completed: 7,
    tasks_pending: 1,
    tasks_blocked: 0,
  },
  {
    id: "jinbe",
    name: "Jinbe",
    emoji: "⚓",
    department: "DevOps",
    room: "sala-de-maquinas",
    status: "active",
    current_task: "Monitoring infrastructure health",
    last_heartbeat: new Date().toISOString(),
    soul: "The helmsman who keeps the ship steady. Calm under pressure, reliable as the tide.",
    tokens_today: 7800,
    tasks_completed: 20,
    tasks_pending: 3,
    tasks_blocked: 0,
  },
  {
    id: "usopp",
    name: "Usopp",
    emoji: "🎯",
    department: "QA & Testing",
    room: "torre-de-vigia",
    status: "idle",
    current_task: null,
    last_heartbeat: new Date().toISOString(),
    soul: "The sniper who never misses a bug. Tells tall tales but delivers precise tests.",
    tokens_today: 2900,
    tasks_completed: 11,
    tasks_pending: 1,
    tasks_blocked: 0,
  },
  {
    id: "sanji",
    name: "Sanji",
    emoji: "🍳",
    department: "Content & Marketing",
    room: "cozinha",
    status: "working",
    current_task: "Crafting content strategy",
    last_heartbeat: new Date().toISOString(),
    soul: "The chef who serves content with flair. Every dish (post) is plated to perfection.",
    tokens_today: 5600,
    tasks_completed: 9,
    tasks_pending: 2,
    tasks_blocked: 0,
  },
];
