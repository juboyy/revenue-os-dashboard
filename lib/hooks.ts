"use client";

import useSWR from "swr";
import { convexQuery } from "./convexHttp";
import { AGENT_DEFAULTS, type AgentRecord, type Metrics } from "./types";

async function fetchAgents(): Promise<AgentRecord[]> {
  const data = await convexQuery<any[]>("agents:list", {});
  if (!data || data.length === 0) {
    const now = new Date().toISOString();
    return AGENT_DEFAULTS.map((a) => ({
      ...a,
      created_at: now,
      updated_at: now,
    })) as AgentRecord[];
  }
  return data.map((a) => ({
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
  })) as AgentRecord[];
}

export function useAgents() {
  const { data, error, isLoading, mutate } = useSWR<AgentRecord[]>(
    "agents",
    fetchAgents,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return { agents: data ?? [], error, isLoading, refresh: mutate };
}

export function useAgent(id: string) {
  const { agents, error, isLoading } = useAgents();
  const agent = agents.find((a) => a.id === id) ?? null;
  return { agent, error, isLoading };
}

export function useMetrics() {
  const { agents, isLoading } = useAgents();

  const metrics: Metrics = {
    totalTasksCompleted: agents.reduce((s, a) => s + (a.tasks_completed ?? 0), 0),
    totalTasksPending: agents.reduce((s, a) => s + (a.tasks_pending ?? 0), 0),
    totalTasksBlocked: agents.reduce((s, a) => s + (a.tasks_blocked ?? 0), 0),
    totalTokensToday: agents.reduce((s, a) => s + (a.tokens_today ?? 0), 0),
    totalCostToday: 0,
    activeAgents: agents.filter((a) => a.status === "active" || a.status === "working").length,
    totalAgents: agents.length,
    errorRate: 0,
    avgLatencyMs: 0,
  };

  return { metrics, isLoading };
}
