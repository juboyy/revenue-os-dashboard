"use client";

import useSWR from "swr";
import { supabase } from "./supabase";
import { AGENT_DEFAULTS, type AgentRecord, type Metrics } from "./types";

/* ─── Fetcher: Supabase agent_status ─── */
async function fetchAgents(): Promise<AgentRecord[]> {
  const { data, error } = await supabase
    .from("agent_status")
    .select("*")
    .order("name");

  if (error || !data || data.length === 0) {
    // Fallback to static defaults when table is empty or on error
    const now = new Date().toISOString();
    return AGENT_DEFAULTS.map((a) => ({
      ...a,
      created_at: now,
      updated_at: now,
    }));
  }

  return data as AgentRecord[];
}

/* ─── Hook: all agents (auto-refresh 5s) ─── */
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

/* ─── Hook: single agent ─── */
export function useAgent(id: string) {
  const { agents, error, isLoading } = useAgents();
  const agent = agents.find((a) => a.id === id) ?? null;
  return { agent, error, isLoading };
}

/* ─── Hook: computed metrics ─── */
export function useMetrics() {
  const { agents, isLoading } = useAgents();

  const metrics: Metrics = {
    totalTasksCompleted: agents.reduce((s, a) => s + (a.tasks_completed ?? 0), 0),
    totalTasksPending: agents.reduce((s, a) => s + (a.tasks_pending ?? 0), 0),
    totalTasksBlocked: agents.reduce((s, a) => s + (a.tasks_blocked ?? 0), 0),
    totalTokensToday: agents.reduce((s, a) => s + (a.tokens_today ?? 0), 0),
    activeAgents: agents.filter((a) => a.status === "active" || a.status === "working").length,
    totalAgents: agents.length,
  };

  return { metrics, isLoading };
}
