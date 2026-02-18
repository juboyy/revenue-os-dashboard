"use client";

import { useMemo } from "react";
import { useDashboardStore } from "../../lib/store";
import { motion } from "framer-motion";

const TYPE_COLORS: Record<string, string> = {
  delegation: "#3b82f6",
  standup: "#10b981",
  escalation: "#ef4444",
  collaboration: "#8b5cf6",
};
const TYPE_ICONS: Record<string, string> = {
  delegation: "📋",
  standup: "☕",
  escalation: "🚨",
  collaboration: "🤝",
};

export default function InteractionsPage() {
  const { interactions, standupMessages, agents } = useDashboardStore();

  const agentLookup = useMemo(() => {
    const m: Record<string, { name: string; emoji: string }> = {};
    agents.forEach(a => { m[a.id] = { name: a.name, emoji: a.emoji }; });
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
        {/* Interaction Log */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono flex items-center gap-2">
            <span className="text-base">📡</span> Interaction Log
          </h2>
          <div className="space-y-3">
            {interactions.map((inter, i) => {
              const from = agentLookup[inter.from_agent];
              const to = agentLookup[inter.to_agent];
              return (
                <motion.div
                  key={inter.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg bg-ocean-900/50 border border-glass-border hover:border-opacity-30 transition-colors"
                  style={{ borderLeftColor: TYPE_COLORS[inter.type], borderLeftWidth: 3 }}
                >
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span>{from?.emoji || "🤖"}</span>
                    <span className="text-white font-medium">{from?.name || inter.from_agent}</span>
                    <span className="text-gray-600">→</span>
                    <span>{to?.emoji || "🤖"}</span>
                    <span className="text-white font-medium">{to?.name || inter.to_agent}</span>
                    <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: `${TYPE_COLORS[inter.type]}15`, color: TYPE_COLORS[inter.type] }}>
                      {TYPE_ICONS[inter.type]} {inter.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{inter.content}</p>
                  <p className="text-[10px] text-gray-600 font-mono mt-1">
                    {new Date(inter.timestamp).toLocaleTimeString()}
                  </p>
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
            {standupMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{msg.agent_emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-accent-blue">{msg.agent_name}</span>
                    <span className="text-[10px] text-gray-600 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-ocean-900/50 border border-glass-border">
                    <p className="text-xs text-gray-300 leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
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
          { label: "Total Interactions", value: interactions.length.toString(), icon: "📡", color: "text-accent-blue" },
          { label: "Delegations", value: interactions.filter(i => i.type === "delegation").length.toString(), icon: "📋", color: "text-accent-blue" },
          { label: "Escalations", value: interactions.filter(i => i.type === "escalation").length.toString(), icon: "🚨", color: "text-accent-red" },
          { label: "Collaborations", value: interactions.filter(i => i.type === "collaboration").length.toString(), icon: "🤝", color: "text-accent-purple" },
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
