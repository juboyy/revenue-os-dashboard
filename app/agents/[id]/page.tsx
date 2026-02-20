"use client";

import { useParams, useRouter } from "next/navigation";
import { useAgent, useAgentEvents } from "../../../lib/hooks";
import type { AgentStatus } from "../../../lib/types";
import { motion } from "framer-motion";

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: AgentStatus }) {
  const map: Record<AgentStatus, { bg: string; text: string; label: string }> = {
    active: { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "🟢 Active" },
    working: { bg: "bg-amber-500/20", text: "text-amber-400", label: "🟡 Working" },
    idle: { bg: "bg-gray-500/20", text: "text-gray-400", label: "⚪ Idle" },
    error: { bg: "bg-red-500/20", text: "text-red-400", label: "🔴 Error" },
    sleeping: { bg: "bg-gray-700/20", text: "text-gray-500", label: "💤 Sleeping" },
  };
  const s = map[status];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-mono ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

/* ─── Info row ─── */
function InfoRow({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800/50">
      <span className="text-sm text-gray-400 flex items-center gap-2">
        <span>{icon}</span> {label}
      </span>
      <span className="text-sm font-mono text-gray-200">{value}</span>
    </div>
  );
}

/* ─── Recent Events (from Convex) ─── */
function RecentEvents({ agentId }: { agentId: string }) {
  const { events } = useAgentEvents(agentId);
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
        <span>📜</span> Recent Events
      </h3>
      <div className="space-y-2">
        {events.length === 0 && <p className="text-xs text-gray-600 italic">No events recorded yet...</p>}
        {events.slice(0, 8).map((ev) => (
          <div key={ev._id} className="flex gap-3 text-xs">
            <span className="text-gray-600 font-mono shrink-0">
              {ev.eventType}
            </span>
            <span className="text-gray-400">{ev.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Memory view ─── */
function MemoryView({ soul }: { soul: string | null | undefined }) {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
        <span>🧠</span> Soul & Memory
      </h3>
      {soul ? (
        <p className="text-sm text-gray-400 leading-relaxed italic">&ldquo;{soul}&rdquo;</p>
      ) : (
        <p className="text-sm text-gray-600">No soul definition loaded.</p>
      )}
      <div className="mt-4 pt-3 border-t border-gray-800/50">
        <p className="text-[11px] text-gray-500 font-mono">
          Memory backend: Convex Cloud • Synced via real-time queries
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = typeof params.id === "string" ? params.id : "";
  const { agent, isLoading } = useAgent(agentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-4xl animate-pulse">⏳</span>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="text-6xl">🏴‍☠️</span>
        <p className="text-gray-400 font-mono">Agent not found</p>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-blue-400 hover:text-blue-300 font-mono"
        >
          ← Back to office
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto" style={{ animation: "fadeInUp 0.4s ease-out" }}>
      <button
        onClick={() => router.push("/")}
        className="text-xs text-gray-500 hover:text-blue-400 font-mono mb-6 flex items-center gap-1 transition-colors"
      >
        ← Thousand Sunny
      </button>

      <div className="flex items-center gap-5 mb-8">
        <div className={`agent-emoji agent-emoji-${agent.status}`} style={{ fontSize: "72px" }}>
          {agent.emoji}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
          <p className="text-sm text-gray-500 font-mono">{agent.department}</p>
          <div className="mt-2">
            <StatusBadge status={agent.status} />
          </div>
        </div>
      </div>

      {agent.currentTask && (
        <div className="glass rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
            <span>💭</span> Current Task
          </h3>
          <p className="text-sm text-gray-300 font-mono">{agent.currentTask}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-emerald-400">{agent.tasksCompleted}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Completed</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-amber-400">{agent.tasksPending}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Pending</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-red-400">{agent.tasksBlocked}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Blocked</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold font-mono text-cyan-400">
            {(agent.tokensToday ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Tokens Today</p>
        </div>
      </div>

      <div className="glass rounded-xl p-5 mb-4">
        <h3 className="text-sm font-bold text-gray-300 mb-2">Details</h3>
        <InfoRow icon="🏠" label="Room" value={agent.room ?? "—"} />
        <InfoRow icon="🆔" label="Agent ID" value={agent.agentId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MemoryView soul={agent.soul} />
        <RecentEvents agentId={agent.agentId} />
      </div>
    </div>
  );
}
