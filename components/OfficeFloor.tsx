"use client";

import type { AgentRecord } from "../lib/types";
import AgentStation from "./AgentStation";

const DEPARTMENTS = {
  "COMMAND": ["shanks"],
  "ENGINEERING": ["zoro", "jinbe", "franky"],
  "OPERATIONS": ["nami", "billing"],
  "RESEARCH": ["chopper", "robin"],
  "COMMS": ["sanji"]
};

export default function OfficeFloor({ agents }: { agents: AgentRecord[] }) {
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full h-full overflow-y-auto">
      {/* Header HUD */}
      <div className="flex justify-between items-end mb-8 border-b border-cyber-cyan/20 pb-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tighter text-glow">
            THOUSAND<span className="text-cyber-cyan">SUNNY</span>
          </h1>
          <p className="text-xs text-cyber-cyan/60 tracking-[0.3em] mt-1">
            REVENUE_OS // TACTICAL_DASHBOARD
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-gray-500">SYSTEM STATUS</div>
          <div className="text-cyber-cyan font-bold animate-pulse">ONLINE</div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(DEPARTMENTS).map(([dept, ids]) => (
          <div key={dept} className="relative group">
            {/* Department Label */}
            <div className="absolute -top-3 left-4 bg-void px-2 text-[10px] text-cyber-cyan border border-cyber-cyan/30 uppercase tracking-widest z-10">
              SECTOR: {dept}
            </div>
            
            <div className="border border-gray-800 p-6 pt-8 bg-glass-100 backdrop-blur-sm grid gap-6 relative">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-cyan" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-cyan" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyber-cyan" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-cyan" />

              {ids.map((id, i) => {
                const agent = agentMap.get(id);
                if (!agent) return null;
                return <AgentStation key={id} agent={agent} index={i} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
