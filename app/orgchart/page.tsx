"use client";

import { useMemo, useState } from "react";
import { useDashboardStore } from "../../lib/store";
import { getLevelFromXP } from "../../lib/types";
import type { AgentRecord } from "../../lib/types";
import { motion, AnimatePresence } from "framer-motion";

const DEPT_COLORS: Record<string, string> = {
  "OS Captain": "#f59e0b",
  "Engineering Lead": "#3b82f6",
  "Architect": "#8b5cf6",
  "Analyst": "#06b6d4",
  "Finance": "#10b981",
  "Research": "#ec4899",
  "DevOps": "#ef4444",
  "QA & Testing": "#f97316",
  "Content & Marketing": "#a855f7",
};

const RARITY_COLORS: Record<string, string> = { common: "#6b7280", rare: "#3b82f6", epic: "#8b5cf6", legendary: "#f59e0b" };

export default function OrgChartPage() {
  const { agents } = useDashboardStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const captain = agents.find(a => a.department === "OS Captain");
  const crew = agents.filter(a => a.department !== "OS Captain");

  const departments = useMemo(() => {
    const groups: Record<string, typeof agents> = {};
    crew.forEach(a => {
      if (!groups[a.department]) groups[a.department] = [];
      groups[a.department].push(a);
    });
    return groups;
  }, [crew]);

  const selectedAgent = agents.find(a => a.id === selectedId) || null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🌳</span> Org Chart
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">LIVING_HIERARCHY // CLICK AN AGENT FOR DETAILS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tree Visualization (left 2/3) */}
        <div className="lg:col-span-2 flex flex-col items-center space-y-6">
          {/* Captain Node */}
          {captain && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <OrgNodeCard agent={captain} isRoot selected={selectedId === captain.id}
                onClick={() => setSelectedId(selectedId === captain.id ? null : captain.id)} />
            </motion.div>
          )}

          <div className="w-px h-8 bg-gradient-to-b from-accent-amber/50 to-glass-border" />

          {/* Department Row */}
          <div className="flex flex-wrap justify-center gap-6">
            {Object.entries(departments).map(([dept, deptAgents], i) => {
              const color = DEPT_COLORS[dept] || "#6b7280";
              return (
                <motion.div key={dept}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center">
                  <div className="text-[10px] uppercase tracking-widest font-mono px-3 py-1 rounded-full border mb-3"
                    style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
                    {dept}
                  </div>
                  <div className="w-px h-4 mb-2" style={{ background: `${color}40` }} />
                  <div className="space-y-2">
                    {deptAgents.map((agent) => (
                      <OrgNodeCard key={agent.id} agent={agent}
                        selected={selectedId === agent.id}
                        onClick={() => setSelectedId(selectedId === agent.id ? null : agent.id)} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Agent Detail Panel (right 1/3) */}
        <div className="glass-card p-4 overflow-y-auto max-h-[700px]">
          <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-3">Agent Profile</h3>
          <AnimatePresence mode="wait">
            {selectedAgent ? (
              <AgentDetailPanel key={selectedAgent.id} agent={selectedAgent} />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-16 space-y-2">
                <span className="text-4xl block">👈</span>
                <p className="text-xs text-gray-500">Select an agent for full profile</p>
                <p className="text-[10px] text-gray-700 font-mono">Stats • Tasks • Achievements</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function OrgNodeCard({ agent, isRoot, selected, onClick }: { agent: any; isRoot?: boolean; selected: boolean; onClick: () => void }) {
  const lvl = getLevelFromXP(agent.xp);
  const color = DEPT_COLORS[agent.department] || "#6b7280";
  const isActive = agent.status === "active" || agent.status === "working";

  return (
    <div onClick={onClick}
      className={`glass-card p-4 w-52 text-center transition-all hover:scale-[1.02] cursor-pointer ${isRoot ? "ring-1" : ""} ${selected ? "ring-1 ring-blue-500" : ""}`}
      style={isRoot ? { borderColor: `${color}40`, boxShadow: `0 0 20px ${color}15` }
        : selected ? { boxShadow: `0 0 16px ${color}20` } : undefined}>
      <div className="relative inline-block">
        <span className={`${isRoot ? "text-4xl" : "text-3xl"}`}>{agent.emoji}</span>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ocean-950"
          style={{ background: isActive ? "#10b981" : agent.status === "error" ? "#ef4444" : "#6b7280" }} />
      </div>
      <h3 className={`${isRoot ? "text-base" : "text-sm"} font-bold text-white mt-2`}>{agent.name}</h3>
      <p className="text-[10px] text-gray-500">{agent.department}</p>
      <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-mono">
        <span className="text-accent-purple">Lv.{lvl.level}</span>
        <span className="text-gray-600">•</span>
        <span className="text-accent-blue">{agent.xp} XP</span>
      </div>
      <div className="xp-bar mt-1.5">
        <div className="xp-bar-fill" style={{ width: `${lvl.progress}%` }} />
      </div>
      {agent.current_task && (
        <p className="text-[9px] text-gray-600 mt-1.5 truncate font-mono">{agent.current_task}</p>
      )}
    </div>
  );
}

function AgentDetailPanel({ agent }: { agent: AgentRecord }) {
  const lvl = getLevelFromXP(agent.xp);
  const color = DEPT_COLORS[agent.department] || "#6b7280";
  const isActive = agent.status === "active" || agent.status === "working";
  const statusLabel = agent.status === "active" ? "Active" : agent.status === "working" ? "Working" : agent.status === "error" ? "Error" : agent.status === "sleeping" ? "Sleeping" : "Idle";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="relative inline-block">
          <span className="text-5xl">{agent.emoji}</span>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-ocean-950"
            style={{ background: isActive ? "#10b981" : agent.status === "error" ? "#ef4444" : "#6b7280" }} />
        </div>
        <h3 className="text-lg font-bold text-white mt-2">{agent.name}</h3>
        <p className="text-[11px] font-mono" style={{ color }}>{agent.department}</p>
        <div className="flex items-center justify-center gap-2 mt-1 text-[10px]">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold"
            style={{ color: isActive ? "#10b981" : "#6b7280", background: isActive ? "#10b98115" : "#6b728015" }}>
            ● {statusLabel}
          </span>
          <span className="text-purple-400 font-mono">Lv.{lvl.level}</span>
        </div>
      </div>

      {/* Soul quote */}
      {agent.soul && <p className="text-[10px] text-gray-400 italic border-l-2 border-gray-800 pl-2 text-center">&ldquo;{agent.soul}&rdquo;</p>}

      {/* XP Progress */}
      <div>
        <div className="flex justify-between text-[9px] text-gray-600 mb-1"><span>{agent.xp} XP</span><span>{lvl.nextXP} XP</span></div>
        <div className="h-2 rounded-full bg-ocean-800 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${lvl.progress}%` }}
            transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: "Tasks Done", value: agent.tasks_completed, color: "text-green-400", icon: "✅" },
          { label: "Streak", value: `${agent.streak_days}d`, color: "text-amber-400", icon: "🔥" },
          { label: "Tokens Today", value: (agent.tokens_today / 1000).toFixed(1) + "k", color: "text-blue-400", icon: "⚡" },
          { label: "Blocked", value: agent.tasks_blocked, color: "text-red-400", icon: "🚫" },
        ].map(k => (
          <div key={k.label} className="p-2.5 rounded-lg bg-ocean-900/50 text-center">
            <div className="text-sm mb-0.5">{k.icon}</div>
            <div className={`text-base font-bold font-mono ${k.color}`}>{k.value}</div>
            <div className="text-[8px] text-gray-600 uppercase">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Stat Bars */}
      <div className="space-y-2">
        <h4 className="text-[9px] uppercase tracking-widest text-gray-600 font-mono">Capabilities</h4>
        {Object.entries(agent.stats).map(([stat, val]) => (
          <div key={stat} className="flex items-center gap-2 text-[10px]">
            <span className="text-gray-400 w-20 capitalize">{stat}</span>
            <div className="flex-1 h-2 rounded-full bg-ocean-800 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full" style={{
                  background: val >= 90 ? "linear-gradient(90deg, #10b981, #34d399)" :
                    val >= 75 ? "linear-gradient(90deg, #3b82f6, #60a5fa)" :
                    val >= 60 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" :
                    "linear-gradient(90deg, #ef4444, #f87171)",
                }} />
            </div>
            <span className="text-gray-500 font-mono w-6 text-right">{val}</span>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {agent.achievements.length > 0 && (
        <div>
          <h4 className="text-[9px] uppercase tracking-widest text-gray-600 font-mono mb-2">Achievements ({agent.achievements.length})</h4>
          <div className="grid grid-cols-4 gap-2">
            {agent.achievements.map(a => (
              <div key={a.id} title={`${a.name} — ${a.description}`}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg"
                style={{ background: `${RARITY_COLORS[a.rarity]}10`, border: `1px solid ${RARITY_COLORS[a.rarity]}25` }}>
                <span className="text-lg">{a.icon}</span>
                <span className="text-[7px] text-gray-500 truncate w-full text-center">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Task */}
      {agent.current_task && (
        <div className="border-t border-glass-border pt-3">
          <h4 className="text-[9px] uppercase tracking-widest text-gray-600 font-mono mb-1">Current Task</h4>
          <p className="text-[11px] text-gray-300 font-mono leading-relaxed">{agent.current_task}</p>
        </div>
      )}
    </motion.div>
  );
}
