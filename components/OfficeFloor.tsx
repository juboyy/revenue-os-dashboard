"use client";

import type { AgentRecord } from "../lib/types";
import AgentStation from "./AgentStation";

/* ─── Room config ─── */
const ROOMS: Record<string, { label: string; icon: string; positions: string[] }> = {
  "ponte-de-comando": { label: "Ponte de Comando", icon: "🏴‍☠️", positions: ["shanks"] },
  forja: { label: "A Forja", icon: "⚒️", positions: ["zoro"] },
  estaleiro: { label: "Estaleiro", icon: "🔧", positions: ["franky"] },
  laboratorio: { label: "Laboratório", icon: "🧪", positions: ["chopper"] },
  tesouraria: { label: "Tesouraria", icon: "💎", positions: ["nami"] },
  biblioteca: { label: "Biblioteca", icon: "📖", positions: ["robin"] },
  "sala-de-maquinas": { label: "Sala de Máquinas", icon: "⚙️", positions: ["jinbe"] },
  "torre-de-vigia": { label: "Torre de Vigia", icon: "🔭", positions: ["usopp"] },
  cozinha: { label: "Cozinha", icon: "🔥", positions: ["sanji"] },
};

/* ─── Water cooler / interactions ─── */
function WaterCooler({ agents }: { agents: AgentRecord[] }) {
  const active = agents.filter(
    (a) => a.status === "active" || a.status === "working"
  );
  return (
    <div className="glass rounded-2xl p-4 col-span-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🚰</span>
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Bebedouro — Crew Chat
        </h3>
        <span className="ml-auto text-[11px] text-gray-500 font-mono">
          {active.length} online
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {agents.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-800/60 border border-gray-700/50 text-xs"
          >
            <span className="text-base">{a.emoji}</span>
            <span className={a.status === "idle" ? "text-gray-500" : "text-gray-300"}>
              {a.name}
            </span>
            <span className={`status-dot w-2 h-2 status-${a.status}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Office Floor ─── */
export default function OfficeFloor({ agents }: { agents: AgentRecord[] }) {
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  return (
    <div className="office-grid-bg min-h-screen">
      {/* Ship header */}
      <div className="text-center pt-6 pb-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          ⛵ Thousand Sunny
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-1 tracking-widest uppercase">
          revenue-OS Digital Office • {agents.length} crew members
        </p>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
        {Object.entries(ROOMS).map(([roomId, room]) => {
          const roomAgents = room.positions
            .map((id) => agentMap.get(id))
            .filter(Boolean) as AgentRecord[];

          return (
            <div key={roomId} className="relative">
              {/* Room label */}
              <div className="room-label mb-2 flex items-center gap-1.5 pl-1">
                <span className="text-base">{room.icon}</span>
                {room.label}
              </div>

              {/* Agents in this room */}
              {roomAgents.map((agent, i) => (
                <AgentStation key={agent.id} agent={agent} index={i} />
              ))}
            </div>
          );
        })}
      </div>

      {/* Water cooler */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <WaterCooler agents={agents} />
      </div>
    </div>
  );
}
