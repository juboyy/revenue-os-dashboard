"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AgentRecord, AgentStatus } from "../lib/types";

/* ─── Helpers ─── */
function statusClass(s: AgentStatus) {
  switch (s) {
    case "active":
      return "status-active";
    case "working":
      return "status-working";
    case "idle":
      return "status-idle";
    case "error":
      return "status-error";
  }
}

function statusLabel(s: AgentStatus) {
  switch (s) {
    case "active":
      return "Online";
    case "working":
      return "Working";
    case "idle":
      return "Idle";
    case "error":
      return "Error";
  }
}

function emojiGlowClass(s: AgentStatus) {
  return `agent-emoji agent-emoji-${s}`;
}

function heartbeatAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

/* ─── Particles effect for active agents ─── */
function Particles({ status }: { status: AgentStatus }) {
  if (status !== "active" && status !== "working") return null;
  const color = status === "active" ? "bg-emerald-400" : "bg-amber-400";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className={`particle ${color}`}
          style={{
            left: `${20 + i * 25}%`,
            top: `${15 + i * 10}%`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function AgentStation({
  agent,
  index,
}: {
  agent: AgentRecord;
  index: number;
}) {
  const [hbText, setHbText] = useState(() => heartbeatAgo(agent.last_heartbeat));

  // Update heartbeat every second
  useEffect(() => {
    const iv = setInterval(() => {
      setHbText(heartbeatAgo(agent.last_heartbeat));
    }, 1000);
    return () => clearInterval(iv);
  }, [agent.last_heartbeat]);

  return (
    <Link href={`/agents/${agent.id}`} className="block group">
      <div
        className={`
          relative glass glass-hover rounded-2xl p-5
          transition-all duration-300 ease-out
          stagger-${index + 1}
        `}
        style={{ animationFillMode: "both", animation: `fadeInUp 0.5s ease-out ${index * 0.06}s both` }}
      >
        <Particles status={agent.status} />

        {/* Top row: emoji + status */}
        <div className="flex items-start justify-between mb-3">
          <div className={emojiGlowClass(agent.status)}>{agent.emoji}</div>
          <div className="flex items-center gap-1.5">
            <span className={`status-dot ${statusClass(agent.status)}`} />
            <span className="text-xs font-mono text-gray-400">{statusLabel(agent.status)}</span>
          </div>
        </div>

        {/* Name + dept */}
        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
          {agent.name}
        </h3>
        <p className="text-xs text-gray-500 font-mono mb-3">{agent.department}</p>

        {/* Thought bubble — current task */}
        {agent.current_task ? (
          <div className="thought-bubble mb-3">
            <span className="text-gray-300 leading-tight line-clamp-2">{agent.current_task}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 mb-3 h-[38px]">
            <span className="text-xs text-gray-600 italic">💤 resting...</span>
          </div>
        )}

        {/* Footer: heartbeat + tasks */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span>❤️ {hbText}</span>
          <span>
            ✅ {agent.tasks_completed ?? 0} · 📋 {agent.tasks_pending ?? 0}
          </span>
        </div>

        {/* Working indicator */}
        {agent.status === "working" && (
          <div className="absolute bottom-2 right-3 flex gap-1 items-center">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
      </div>
    </Link>
  );
}
