"use client";

import Link from "next/link";
import type { AgentRecord, AgentStatus } from "../lib/types";

function getStatusColor(s: AgentStatus) {
  switch (s) {
    case "active": return "text-cyber-cyan border-cyber-cyan shadow-neon-cyan";
    case "working": return "text-cyber-yellow border-cyber-yellow animate-pulse";
    case "error": return "text-cyber-red border-cyber-red shadow-neon-red";
    default: return "text-gray-600 border-gray-800";
  }
}

export default function AgentStation({ agent, index }: { agent: AgentRecord; index: number }) {
  const statusColor = getStatusColor(agent.status);
  const isOnline = agent.status === "active" || agent.status === "working";

  return (
    <Link href={`/agents/${agent.id}`} className="block group relative">
      {/* Connector Line */}
      <div className="absolute -top-4 left-1/2 w-px h-4 bg-gray-800 group-hover:bg-cyber-cyan transition-colors" />

      <div className={`
        cyber-panel p-4 transition-all duration-300
        hover:bg-obsidian hover:scale-[1.02]
        ${isOnline ? 'border-opacity-50' : 'opacity-60 grayscale hover:grayscale-0'}
      `}>
        {/* Header: ID + Status */}
        <div className="flex justify-between items-start mb-3 border-b border-gray-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-cyber-cyan font-bold tracking-widest">
              [{agent.id.toUpperCase()}]
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-cyber-cyan shadow-neon-cyan' : 'bg-gray-700'}`} />
        </div>

        {/* Core Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`
            w-10 h-10 flex items-center justify-center text-2xl bg-black/50 border
            ${statusColor} rounded-sm
          `}>
            {agent.emoji}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyber-cyan transition-colors uppercase tracking-wider">
              {agent.name.split(" — ")[0]}
            </h3>
            <p className="text-[10px] text-gray-500 uppercase">{agent.department}</p>
          </div>
        </div>

        {/* Task Log */}
        <div className="bg-black/40 p-2 rounded-sm border border-gray-800/50 mb-2 h-12 overflow-hidden">
          <p className="text-[10px] font-mono text-cyber-cyan/80 leading-tight">
            <span className="text-gray-600 mr-2">{">>"}</span>
            {agent.current_task || "SYSTEM_IDLE // AWAITING_COMMANDS"}
          </p>
        </div>

        {/* Metrics Footer */}
        <div className="flex justify-between items-center text-[9px] text-gray-600 uppercase tracking-wider">
          <span>MEM: {Math.floor(Math.random() * 60) + 20}%</span>
          <span>TASKS: {agent.tasks_completed ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}
