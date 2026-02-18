"use client";

import { useDashboardStore } from "../lib/store";
import { getLevelFromXP } from "../lib/types";
import { motion } from "framer-motion";

const statusColor: Record<string, string> = {
  active: "bg-accent-green status-active",
  working: "bg-accent-amber status-working",
  idle: "bg-gray-500",
  error: "bg-accent-red status-error",
  sleeping: "bg-gray-700",
};

const statusLabel: Record<string, string> = {
  active: "Online",
  working: "Working",
  idle: "Idle",
  error: "Error",
  sleeping: "Sleep",
};

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function HomePage() {
  const { agents, monitoring } = useDashboardStore();

  const activeAgents = agents.filter(a => a.status === "active" || a.status === "working").length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasks_completed, 0);
  const totalTokens = monitoring?.totals.totalTokens ?? 0;
  const totalCost = monitoring?.totals.totalCost ?? 0;
  const errorRate = monitoring ? ((monitoring.daily.reduce((s, d) => s + d.errors, 0) / Math.max(monitoring.daily.reduce((s, d) => s + d.messages, 0), 1)) * 100) : 0;

  const kpis = [
    { label: "Active Agents", value: `${activeAgents}/${agents.length}`, icon: "🟢", accent: "text-accent-green" },
    { label: "Tasks Done", value: totalTasks.toString(), icon: "✅", accent: "text-accent-blue" },
    { label: "Tokens Used", value: formatTokens(totalTokens), icon: "🔤", accent: "text-accent-purple" },
    { label: "Total Cost", value: formatCost(totalCost), icon: "💰", accent: "text-accent-amber" },
    { label: "Latency P95", value: `${monitoring?.latency?.p95Ms ?? "—"}ms`, icon: "⚡", accent: "text-accent-cyan" },
    { label: "Error Rate", value: `${errorRate.toFixed(1)}%`, icon: "🔴", accent: errorRate > 5 ? "text-accent-red" : "text-accent-green" },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🎯</span> Command Center
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            REVENUE_OS // MULTI-AGENT TACTICAL DASHBOARD
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          SYSTEM_OPERATIONAL
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="kpi-card group glass-card-hover"
          >
            <div className="text-lg mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.accent}`}>{kpi.value}</div>
            <div className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Agent Grid + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent Status Grid */}
        <div className="lg:col-span-2 glass-card p-5">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4 flex items-center gap-2">
            <span className="text-base">👥</span> Crew Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((agent, i) => {
              const lvl = getLevelFromXP(agent.xp);
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="p-3 rounded-lg border border-glass-border bg-ocean-900/50 hover:border-accent-blue/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{agent.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">{agent.name}</span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor[agent.status]}`} />
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{agent.department}</p>
                      <p className="text-[10px] text-accent-blue/70 truncate mt-0.5 font-mono">
                        {agent.current_task || "AWAITING_COMMANDS"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[10px]">
                    <span className="text-accent-purple font-mono">Lv.{lvl.level}</span>
                    <div className="flex-1 xp-bar">
                      <div className="xp-bar-fill" style={{ width: `${lvl.progress}%` }} />
                    </div>
                    <span className="text-gray-600 font-mono">{agent.xp}xp</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed / Quick Info */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono flex items-center gap-2">
            <span className="text-base">📡</span> Live Feed
          </h2>

          {/* Provider Quick View */}
          {monitoring && (
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-600">Top Providers</h3>
              {monitoring.byProvider.slice(0, 3).map((p) => (
                <div key={p.provider} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 truncate">{p.provider}</span>
                  <div className="flex gap-3 text-gray-500 font-mono">
                    <span>{formatTokens(p.totals.totalTokens)}</span>
                    <span className="text-accent-amber">{formatCost(p.totals.totalCost)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Tools */}
          {monitoring && (
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-600">Most Used Tools</h3>
              {monitoring.tools.tools.slice(0, 5).map((t) => (
                <div key={t.name} className="flex items-center gap-2 text-xs">
                  <span className="text-accent-cyan font-mono text-[11px]">⚙</span>
                  <span className="text-gray-400 flex-1 truncate font-mono text-[11px]">{t.name}</span>
                  <span className="text-gray-600 font-mono">{t.count}×</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Standup */}
          <div className="space-y-2">
            <h3 className="text-[10px] uppercase tracking-widest text-gray-600">Latest Standup</h3>
            <StandupFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

function StandupFeed() {
  const { standupMessages } = useDashboardStore();
  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {standupMessages.slice(-3).map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-2 text-[11px]"
        >
          <span className="flex-shrink-0">{msg.agent_emoji}</span>
          <div className="min-w-0">
            <span className="text-accent-blue font-semibold">{msg.agent_name}</span>
            <p className="text-gray-500 line-clamp-2">{msg.message}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
