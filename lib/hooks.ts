"use client";

/**
 * Convex-powered hooks — replace the old SWR+Supabase hooks.
 * These use Convex's reactive `useQuery` which automatically
 * re-renders when data changes on the server (real-time).
 */
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { TaskStatus } from "./types";

// ━━━ Agents ━━━

/** Reactive list of all agents — auto-updates when any agent changes */
export function useAgents(status?: string) {
  const agents = useQuery(api.agents.list, status ? { status } : {});
  return {
    agents: agents ?? [],
    isLoading: agents === undefined,
  };
}

/** Single agent — reactive */
export function useAgent(agentId: string) {
  const agent = useQuery(api.agents.get, { agentId });
  return {
    agent: agent ?? null,
    isLoading: agent === undefined,
  };
}

/** Computed metrics across all agents — reactive */
export function useMetrics() {
  const metrics = useQuery(api.agents.metrics);
  return {
    metrics: metrics ?? {
      totalTasksCompleted: 0,
      totalTasksPending: 0,
      totalTasksBlocked: 0,
      totalTokensToday: 0,
      activeAgents: 0,
      totalAgents: 0,
    },
    isLoading: metrics === undefined,
  };
}

/** Upsert agent mutation */
export function useUpsertAgent() {
  return useMutation(api.agents.upsert);
}

/** Update agent status mutation */
export function useUpdateAgentStatus() {
  return useMutation(api.agents.updateStatus);
}

// ━━━ Tasks ━━━

/** Reactive list of all tasks */
export function useTasks(status?: string, assignee?: string) {
  const tasks = useQuery(api.tasks.list, {
    ...(status ? { status } : {}),
    ...(assignee ? { assignee } : {}),
  });
  return {
    tasks: tasks ?? [],
    isLoading: tasks === undefined,
  };
}

/** Move task mutation (Kanban drag & drop) */
export function useMoveTask() {
  return useMutation(api.tasks.move);
}

/** Create task mutation */
export function useCreateTask() {
  return useMutation(api.tasks.create);
}

// ━━━ Events & Standups ━━━

/** Recent events — reactive */
export function useEvents(limit?: number) {
  const events = useQuery(api.events.recent, { limit });
  return {
    events: events ?? [],
    isLoading: events === undefined,
  };
}

/** Events by agent — reactive */
export function useAgentEvents(agentId: string) {
  const events = useQuery(api.events.byAgent, { agentId });
  return {
    events: events ?? [],
    isLoading: events === undefined,
  };
}

/** Standup messages — reactive */
export function useStandups(limit?: number) {
  const standups = useQuery(api.events.standups, { limit });
  return {
    standups: standups ?? [],
    isLoading: standups === undefined,
  };
}

/** Log event mutation */
export function useLogEvent() {
  return useMutation(api.events.log);
}

/** Post standup mutation */
export function usePostStandup() {
  return useMutation(api.events.postStandup);
}

// ━━━ Memory Graph ━━━

/** Full memory graph (nodes + edges) — reactive */
export function useMemoryGraph() {
  const graph = useQuery(api.memories.graph);
  return {
    graph: graph ?? { nodes: [], edges: [] },
    isLoading: graph === undefined,
  };
}

/** Memories by agent — reactive */
export function useAgentMemories(agentId: string) {
  const memories = useQuery(api.memories.byAgent, { agentId });
  return {
    memories: memories ?? [],
    isLoading: memories === undefined,
  };
}

// ━━━ Monitoring ━━━

/** Aggregated monitoring data — reactive */
export function useMonitoring(days?: number) {
  const monitoring = useQuery(api.monitoring.aggregate, { days });
  return {
    monitoring: monitoring ?? null,
    isLoading: monitoring === undefined,
  };
}

// ━━━ Cron Jobs ━━━

/** Cron jobs list — reactive */
export function useCronJobs() {
  const cronJobs = useQuery(api.cronJobs.list);
  return {
    cronJobs: cronJobs ?? [],
    isLoading: cronJobs === undefined,
  };
}
