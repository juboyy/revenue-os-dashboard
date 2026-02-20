"use client";

import { useMemo } from "react";
import { useEvents, useStandups, useAgents } from "../../lib/hooks";
import { motion } from "framer-motion";

const TYPE_COLORS: Record<string, string> = {
  delegation: "#3b82f6",
  standup: "#10b981",
  escalation: "#ef4444",
  collaboration: "#8b5cf6",
  task_completed: "#10b981",
  error: "#ef4444",
  heartbeat: "#6b7280",
};
const TYPE_ICONS: Record<string, string> = {
  delegation: "📋",
  standup: "☕",
  escalation: "🚨",
  collaboration: "🤝",
  task_completed: "✅",
  error: "❌",
  heartbeat: "💓",
};

export default function InteractionsPage() {
  const { events } = useEvents(50);
  const { standups } = useStandups(20);
  const { agents } = useAgents();

  const agentLookup = useMemo(() => {
    const m: Record<string, { name: string; emoji: string }> = {};
    agents.forEach(a => { m[a.agentId] = { name: a.name, emoji: a.emoji }; });
    return m;
  }, [agents]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">💬</span> Interactions
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">AGENT_COMMS // STANDUP_ROOM // COLLABORATION_LOG</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Log */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono flex items-center gap-2">
            <span className="text-base">📡</span> Event Log
          </h2>
          <div className="space-y-3">
            {events.length === 0 && <p className="text-xs text-gray-600 italic">Nenhum evento registrado...</p>}
            {events.map((ev, i) => {
              const from = agentLookup[ev.agentId];
              const to = ev.targetAgentId ? agentLookup[ev.targetAgentId] : null;
              return (
                <motion.div
                  key={ev._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg bg-ocean-900/50 border border-glass-border hover:border-opacity-30 transition-colors"
                  style={{ borderLeftColor: TYPE_COLORS[ev.eventType] ?? "#6b7280", borderLeftWidth: 3 }}
                >
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span>{from?.emoji || "🤖"}</span>
                    <span className="text-white font-medium">{from?.name || ev.agentId}</span>
                    {to && (
                      <>
                        <span className="text-gray-600">→</span>
                        <span>{to.emoji}</span>
                        <span className="text-white font-medium">{to.name}</span>
                      </>
                    )}
                    <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: `${TYPE_COLORS[ev.eventType]}15`, color: TYPE_COLORS[ev.eventType] }}>
                      {TYPE_ICONS[ev.eventType] ?? "📌"} {ev.eventType}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{ev.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Standup Room */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono flex items-center gap-2">
            <span className="text-base">☕</span> Standup Room
          </h2>
          <div className="space-y-3">
            {standups.length === 0 && <p className="text-xs text-gray-600 italic">Nenhum standup ainda...</p>}
            {standups.map((msg, i) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{msg.agentEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-accent-blue">{msg.agentName}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-ocean-900/50 border border-glass-border">
                    <p className="text-xs text-gray-300 leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 pt-3 border-t border-glass-border">
            <input
              type="text"
              placeholder="Type a message to the crew..."
              className="flex-1 px-3 py-2 rounded-lg bg-ocean-900/50 border border-glass-border text-xs text-white placeholder:text-gray-600 outline-none focus:border-accent-blue/30 transition-colors"
              disabled
            />
            <button className="px-4 py-2 rounded-lg bg-accent-blue/20 text-accent-blue text-xs font-medium border border-accent-blue/30 hover:bg-accent-blue/30 transition-colors" disabled>
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Events", value: events.length.toString(), icon: "📡", color: "text-accent-blue" },
          { label: "Delegations", value: events.filter(i => i.eventType === "delegation").length.toString(), icon: "📋", color: "text-accent-blue" },
          { label: "Errors", value: events.filter(i => i.eventType === "error").length.toString(), icon: "🚨", color: "text-accent-red" },
          { label: "Collaborations", value: events.filter(i => i.eventType === "collaboration").length.toString(), icon: "🤝", color: "text-accent-purple" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="text-lg mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
