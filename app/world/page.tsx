/**
 * Virtual Office — Gamified agent headquarters.
 * Renders a CSS grid floor plan with 9 rooms, each populated by agents.
 * Features: crew HUD, agent stations with XP/status, detail drawer, activity feed.
 */
"use client";

import { useState, useMemo } from "react";
import { useDashboardStore } from "../../lib/store";
import { getLevelFromXP } from "../../lib/types";
import type { AgentRecord } from "../../lib/types";
import { motion, AnimatePresence } from "framer-motion";

/** Status-to-visual mapping — each status gets a color, glow box-shadow, label, and CSS pulse class */
const STATUS_CONFIG: Record<string, { color: string; glow: string; label: string; pulse: string }> = {
  active:   { color: "#10b981", glow: "0 0 16px rgba(16,185,129,0.5)",  label: "ACTIVE",   pulse: "status-active" },
  working:  { color: "#f59e0b", glow: "0 0 16px rgba(245,158,11,0.5)",  label: "WORKING",  pulse: "status-working" },
  idle:     { color: "#6b7280", glow: "none",                           label: "IDLE",     pulse: "" },
  error:    { color: "#ef4444", glow: "0 0 16px rgba(239,68,68,0.5)",   label: "ERROR",    pulse: "status-error" },
  sleeping: { color: "#374151", glow: "none",                           label: "SLEEPING", pulse: "" },
};

/** Room definitions — gridArea maps to CSS grid-template-areas in globals.css (.office-floor) */
const ROOMS: { id: string; label: string; icon: string; color: string; gridArea: string }[] = [
  { id: "ponte-de-comando", label: "Command Bridge",  icon: "⚓",  color: "#f59e0b", gridArea: "bridge" },
  { id: "forja",            label: "Engineering Lab",  icon: "⚔️",  color: "#3b82f6", gridArea: "eng" },
  { id: "tesouraria",       label: "Treasury",         icon: "💎",  color: "#10b981", gridArea: "treasury" },
  { id: "laboratorio",      label: "Analytics Lab",    icon: "🔬",  color: "#06b6d4", gridArea: "analytics" },
  { id: "estaleiro",        label: "Architecture Bay", icon: "🏗️",  color: "#8b5cf6", gridArea: "arch" },
  { id: "biblioteca",       label: "Research Library", icon: "📚",  color: "#ec4899", gridArea: "research" },
  { id: "sala-de-maquinas", label: "Engine Room",      icon: "⚙️",  color: "#ef4444", gridArea: "devops" },
  { id: "torre-de-vigia",   label: "Watchtower",       icon: "🔭",  color: "#f97316", gridArea: "qa" },
  { id: "cozinha",          label: "Content Kitchen",  icon: "🍳",  color: "#a855f7", gridArea: "content" },
];

/** Achievement rarity → border/text color for the achievements grid in the drawer */
const RARITY_COLORS: Record<string, string> = { common: "#6b7280", rare: "#3b82f6", epic: "#8b5cf6", legendary: "#f59e0b" };

export default function WorldPage() {
  const { agents, tasks } = useDashboardStore();
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);

  // Group agents by room for floor plan layout
  const roomAgents = useMemo(() => {
    const m: Record<string, AgentRecord[]> = {};
    agents.forEach(a => { if (!m[a.room]) m[a.room] = []; m[a.room].push(a); });
    return m;
  }, [agents]);

  // Aggregate crew-wide stats for the HUD bar
  const crewXP = agents.reduce((s, a) => s + a.xp, 0);
  const crewTasks = agents.reduce((s, a) => s + a.tasks_completed, 0);
  const crewTokens = agents.reduce((s, a) => s + a.tokens_today, 0);
  const activeCount = agents.filter(a => a.status === "active" || a.status === "working").length;
  const maxStreak = Math.max(...agents.map(a => a.streak_days));
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-5">
      {/* ── Header HUD ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl animate-float">🏴‍☠️</span> Thousand Sunny — Virtual Office
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">GAMIFIED_HQ // CREW_STATUS // LIVE</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { icon: "⭐", label: "Crew XP", value: crewXP.toLocaleString(), color: "text-accent-purple" },
            { icon: "🔥", label: "Best Streak", value: `${maxStreak}d`, color: "text-accent-amber" },
            { icon: "🎯", label: "Active", value: `${activeCount}/${agents.length}`, color: "text-accent-green" },
            { icon: "⚡", label: "In Progress", value: inProgressTasks.toString(), color: "text-accent-blue" },
            { icon: "✅", label: "Done Today", value: crewTasks.toString(), color: "text-accent-cyan" },
            { icon: "🪙", label: "Tokens", value: crewTokens.toLocaleString(), color: "text-accent-amber" },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card flex items-center gap-2 px-3 py-2">
              <span className="text-sm">{kpi.icon}</span>
              <div>
                <div className={`text-sm font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[9px] text-gray-600 uppercase">{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Office Floor Plan ── */}
      <div className="office-floor">
        {ROOMS.map((room, ri) => {
          const agentsInRoom = roomAgents[room.id] || [];
          const hasActive = agentsInRoom.some(a => a.status === "active" || a.status === "working");
          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: ri * 0.04 }}
              className="office-room"
              style={{
                gridArea: room.gridArea,
                borderColor: hasActive ? `${room.color}40` : undefined,
                boxShadow: hasActive ? `inset 0 0 40px ${room.color}08, 0 0 20px ${room.color}10` : undefined,
              }}
            >
              {/* Room Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{room.icon}</span>
                  <div>
                    <h3 className="text-xs font-bold text-white">{room.label}</h3>
                    <p className="text-[9px] text-gray-600 font-mono">{room.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${hasActive ? "animate-pulse" : ""}`}
                    style={{ background: hasActive ? room.color : "#374151" }} />
                  <span className="text-[10px] text-gray-500 font-mono">{agentsInRoom.length}</span>
                </div>
              </div>

              {/* Room Color Bar */}
              <div className="h-[2px] rounded-full mb-3 opacity-40" style={{ background: `linear-gradient(90deg, ${room.color}, transparent)` }} />

              {/* Agent Stations */}
              <div className="space-y-2 flex-1">
                {agentsInRoom.map(agent => (
                  <AgentStation key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
                ))}
                {agentsInRoom.length === 0 && (
                  <div className="flex items-center justify-center py-4 text-gray-700 text-[10px] font-mono">VACANT</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Activity Timeline ── */}
      <div className="glass-card p-4">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-3 flex items-center gap-2">
          <span className="text-sm">📡</span> Activity Feed
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {agents.filter(a => a.current_task).slice(0,6).map((a, i) => {
            const st = STATUS_CONFIG[a.status];
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-ocean-900/50 border border-glass-border"
              >
                <span className="text-lg">{a.emoji}</span>
                <div>
                  <span className="text-[10px] font-bold text-white">{a.name}</span>
                  <span className="text-[9px] mx-1.5" style={{ color: st.color }}>●</span>
                  <span className="text-[10px] text-gray-400 font-mono">{a.current_task}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Agent Detail Drawer ── */}
      <AnimatePresence>
        {selectedAgent && (
          <AgentDrawer agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * AgentStation — Compact card for each agent inside a room.
 * Shows emoji with status glow, name, level badge, streak indicator, XP bar, and current task.
 */
function AgentStation({ agent, onClick }: { agent: AgentRecord; onClick: () => void }) {
  const lvl = getLevelFromXP(agent.xp);
  const st = STATUS_CONFIG[agent.status];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="flex items-center gap-3 p-2.5 rounded-lg bg-ocean-950/60 cursor-pointer transition-all hover:bg-ocean-900/50 group"
      style={{ borderLeft: `3px solid ${st.color}` }}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all"
          style={{ boxShadow: st.glow, background: `${st.color}15` }}
        >
          {agent.emoji}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ocean-950 ${st.pulse}`}
          style={{ background: st.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white group-hover:text-accent-blue transition-colors">{agent.name}</span>
          <span className="text-[9px] font-mono px-1 py-0.5 rounded" style={{ color: "#8b5cf6", background: "rgba(139,92,246,0.1)" }}>
            Lv.{lvl.level}
          </span>
          {agent.streak_days >= 7 && <span className="text-[9px]">🔥{agent.streak_days}</span>}
        </div>
        <p className="text-[10px] text-gray-500 truncate font-mono">{agent.current_task || "IDLE"}</p>
        <div className="xp-bar mt-1">
          <div className="xp-bar-fill" style={{ width: `${lvl.progress}%` }} />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[10px] font-mono font-bold" style={{ color: st.color }}>{st.label}</div>
        <div className="text-[9px] text-gray-600">{agent.xp} XP</div>
      </div>
    </motion.div>
  );
}

/**
 * AgentDrawer — Slide-in right panel with full agent profile.
 * Sections: header + soul quote, XP progress bar, summary stats,
 * animated stats radar bars, achievements grid (colored by rarity), action buttons.
 */
function AgentDrawer({ agent, onClose }: { agent: AgentRecord; onClose: () => void }) {
  const lvl = getLevelFromXP(agent.xp);
  const st = STATUS_CONFIG[agent.status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Drawer */}
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-sm bg-ocean-950 border-l border-glass-border overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-glass-border" style={{ background: `linear-gradient(135deg, ${st.color}10, transparent)` }}>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-sm">✕</button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl"
              style={{ boxShadow: st.glow, background: `${st.color}15` }}>
              {agent.emoji}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{agent.name}</h2>
              <p className="text-xs text-gray-500">{agent.department}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: st.color, background: `${st.color}15` }}>
                  {st.label}
                </span>
                <span className="text-[10px] font-mono text-accent-purple">Lv.{lvl.level} {lvl.title}</span>
              </div>
            </div>
          </div>
          {agent.soul && (
            <p className="text-[11px] text-gray-400 italic mt-3 pl-1 border-l-2 border-glass-border">&ldquo;{agent.soul}&rdquo;</p>
          )}
        </div>

        {/* XP Progress */}
        <div className="p-4 border-b border-glass-border">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>{agent.xp} XP</span>
            <span>{lvl.nextXP} XP</span>
          </div>
          <div className="xp-bar h-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${lvl.progress}%` }} transition={{ duration: 1, ease: "easeOut" }}
              className="xp-bar-fill h-full" />
          </div>
          <div className="flex justify-between mt-2">
            <div className="text-center">
              <div className="text-sm font-bold text-accent-amber">{agent.streak_days}d</div>
              <div className="text-[9px] text-gray-600">STREAK</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-accent-green">{agent.tasks_completed}</div>
              <div className="text-[9px] text-gray-600">DONE</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-accent-blue">{agent.tokens_today.toLocaleString()}</div>
              <div className="text-[9px] text-gray-600">TOKENS</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-accent-red">{agent.tasks_blocked}</div>
              <div className="text-[9px] text-gray-600">BLOCKED</div>
            </div>
          </div>
        </div>

        {/* Stats Radar */}
        <div className="p-4 border-b border-glass-border">
          <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-3">Stats Radar</h3>
          <div className="space-y-2">
            {Object.entries(agent.stats).map(([stat, val]) => (
              <div key={stat} className="flex items-center gap-2 text-[11px]">
                <span className="text-gray-500 w-20 capitalize">{stat}</span>
                <div className="flex-1 h-2 rounded-full bg-ocean-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{ background: val >= 90 ? "#10b981" : val >= 75 ? "#3b82f6" : val >= 60 ? "#f59e0b" : "#ef4444" }}
                  />
                </div>
                <span className="text-gray-400 font-mono w-6 text-right">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="p-4 border-b border-glass-border">
          <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-3">
            Achievements ({agent.achievements.length})
          </h3>
          {agent.achievements.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {agent.achievements.map(ach => (
                <div key={ach.id} className="text-center p-2 rounded-lg bg-ocean-900/50 border border-glass-border group"
                  style={{ borderColor: `${RARITY_COLORS[ach.rarity]}30` }}>
                  <span className="text-xl block">{ach.icon}</span>
                  <span className="text-[9px] font-bold text-white block mt-1">{ach.name}</span>
                  <span className="text-[8px] capitalize font-mono" style={{ color: RARITY_COLORS[ach.rarity] }}>{ach.rarity}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-gray-600 text-center py-3">No achievements yet</p>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-2">Actions</h3>
          {[
            { label: "Wake Up", icon: "☀️", color: "#f59e0b" },
            { label: "Assign Task", icon: "📋", color: "#3b82f6" },
            { label: "View Memory", icon: "🧠", color: "#8b5cf6" },
          ].map(btn => (
            <button key={btn.label} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.01]"
              style={{ background: `${btn.color}10`, color: btn.color, border: `1px solid ${btn.color}25` }}>
              <span>{btn.icon}</span> {btn.label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
