"use client";

import { useMemo } from "react";
import { useDashboardStore } from "../../lib/store";
import { getLevelFromXP } from "../../lib/types";
import { motion } from "framer-motion";

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

export default function OrgChartPage() {
  const { agents } = useDashboardStore();

  // Build hierarchy: Captain at top, everyone else below
  const captain = agents.find(a => a.department === "OS Captain");
  const crew = agents.filter(a => a.department !== "OS Captain");

  // Group by department type
  const departments = useMemo(() => {
    const groups: Record<string, typeof agents> = {};
    crew.forEach(a => {
      if (!groups[a.department]) groups[a.department] = [];
      groups[a.department].push(a);
    });
    return groups;
  }, [crew]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🌳</span> Org Chart
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">LIVING_HIERARCHY // DELEGATION_MAP</p>
      </div>

      {/* Tree Visualization */}
      <div className="flex flex-col items-center space-y-6">
        {/* Captain Node */}
        {captain && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <OrgNodeCard agent={captain} isRoot />
          </motion.div>
        )}

        {/* Connection line */}
        <div className="w-px h-8 bg-gradient-to-b from-accent-amber/50 to-glass-border" />

        {/* Department Row */}
        <div className="flex flex-wrap justify-center gap-6">
          {Object.entries(departments).map(([dept, deptAgents], i) => {
            const color = DEPT_COLORS[dept] || "#6b7280";
            return (
              <motion.div
                key={dept}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center"
              >
                {/* Department label */}
                <div className="text-[10px] uppercase tracking-widest font-mono px-3 py-1 rounded-full border mb-3"
                  style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
                  {dept}
                </div>

                {/* Connection */}
                <div className="w-px h-4 mb-2" style={{ background: `${color}40` }} />

                {/* Agent nodes */}
                <div className="space-y-2">
                  {deptAgents.map((agent) => (
                    <OrgNodeCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrgNodeCard({ agent, isRoot }: { agent: any; isRoot?: boolean }) {
  const lvl = getLevelFromXP(agent.xp);
  const color = DEPT_COLORS[agent.department] || "#6b7280";
  const isActive = agent.status === "active" || agent.status === "working";

  return (
    <div
      className={`glass-card p-4 w-52 text-center transition-all hover:scale-[1.02] cursor-pointer ${isRoot ? "ring-1" : ""}`}
      style={isRoot ? { borderColor: `${color}40`, boxShadow: `0 0 20px ${color}15` } : undefined}
    >
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
