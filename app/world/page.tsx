"use client";

import { useDashboardStore } from "../../lib/store";
import { getLevelFromXP } from "../../lib/types";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  working: "#f59e0b",
  idle: "#6b7280",
  error: "#ef4444",
  sleeping: "#374151",
};

const ROOMS: Record<string, { label: string; color: string; icon: string }> = {
  "ponte-de-comando": { label: "Command Bridge", color: "#f59e0b", icon: "⚓" },
  "forja": { label: "Engineering Lab", color: "#3b82f6", icon: "⚔️" },
  "estaleiro": { label: "Architecture Bay", color: "#8b5cf6", icon: "🏗️" },
  "laboratorio": { label: "Analytics Lab", color: "#06b6d4", icon: "🔬" },
  "tesouraria": { label: "Treasury", color: "#10b981", icon: "💎" },
  "biblioteca": { label: "Research Library", color: "#ec4899", icon: "📚" },
  "sala-de-maquinas": { label: "Engine Room", color: "#ef4444", icon: "⚙️" },
  "torre-de-vigia": { label: "Watchtower", color: "#f97316", icon: "🔭" },
  "cozinha": { label: "Content Kitchen", color: "#a855f7", icon: "🍳" },
};

export default function WorldPage() {
  const { agents } = useDashboardStore();

  // Group agents by room
  const roomAgents: Record<string, typeof agents> = {};
  for (const agent of agents) {
    if (!roomAgents[agent.room]) roomAgents[agent.room] = [];
    roomAgents[agent.room].push(agent);
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🏢</span> Virtual Office
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          THOUSAND_SUNNY // FLOOR_MAP // LIVE_STATUS
        </p>
      </div>

      {/* Office Floor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(ROOMS).map(([roomId, room], i) => {
          const roomAgentList = roomAgents[roomId] || [];
          const hasActive = roomAgentList.some(a => a.status === "active" || a.status === "working");
          return (
            <motion.div
              key={roomId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-5 space-y-3 relative overflow-hidden ${hasActive ? "ring-1" : ""}`}
              style={hasActive ? { boxShadow: `0 0 20px ${room.color}15`, borderColor: `${room.color}30` } : undefined}
            >
              {/* Room Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{room.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{room.label}</h3>
                    <p className="text-[10px] text-gray-600 font-mono">{roomId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: hasActive ? room.color : "#374151" }} />
                  <span className="text-[10px] text-gray-500 font-mono">{roomAgentList.length}</span>
                </div>
              </div>

              {/* Agents in Room */}
              {roomAgentList.length > 0 ? (
                <div className="space-y-2">
                  {roomAgentList.map((agent) => {
                    const lvl = getLevelFromXP(agent.xp);
                    return (
                      <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-ocean-950/50">
                        <div className="relative">
                          <span className="text-xl">{agent.emoji}</span>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-ocean-950"
                            style={{ background: STATUS_COLORS[agent.status] }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-white">{agent.name}</span>
                            <span className="text-[9px] text-accent-purple font-mono">Lv.{lvl.level}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 truncate font-mono">
                            {agent.current_task || "IDLE"}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono capitalize" style={{ color: STATUS_COLORS[agent.status] }}>
                          {agent.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-700 text-xs">
                  Empty room
                </div>
              )}

              {/* Room gradient bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${room.color}40, transparent)` }} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
