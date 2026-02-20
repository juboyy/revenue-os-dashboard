"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useAgents } from "../../lib/hooks";
import { getLevelFromXP } from "../../lib/types";
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
const STAT_LABELS = ["speed", "accuracy", "versatility", "reliability", "creativity"] as const;
const STAT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function OrgChartPage() {
  const { agents } = useAgents();
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
  const selectedAgent = agents.find(a => a.agentId === selectedId) || null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🌳</span> Organograma
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">HIERARQUIA_VIVA // CLIQUE EM UM AGENTE PARA VISÃO PROFUNDA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col items-center space-y-6">
          {captain && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <OrgNodeCard agent={captain} isRoot selected={selectedId === captain.agentId}
                onClick={() => setSelectedId(selectedId === captain.agentId ? null : captain.agentId)} />
            </motion.div>
          )}
          <div className="w-px h-8 bg-gradient-to-b from-accent-amber/50 to-glass-border" />
          <div className="flex flex-wrap justify-center gap-6">
            {Object.entries(departments).map(([dept, deptAgents], i) => {
              const color = DEPT_COLORS[dept] || "#6b7280";
              return (
                <motion.div key={dept} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} className="flex flex-col items-center">
                  <div className="text-[10px] uppercase tracking-widest font-mono px-3 py-1 rounded-full border mb-3"
                    style={{ color, borderColor: `${color}40`, background: `${color}10` }}>{dept}</div>
                  <div className="w-px h-4 mb-2" style={{ background: `${color}40` }} />
                  <div className="space-y-2">
                    {deptAgents.map(agent => (
                      <OrgNodeCard key={agent._id} agent={agent} selected={selectedId === agent.agentId}
                        onClick={() => setSelectedId(selectedId === agent.agentId ? null : agent.agentId)} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-4 overflow-y-auto max-h-[80vh]">
          <AnimatePresence mode="wait">
            {selectedAgent ? (
              <AgentDeepView key={selectedAgent._id} agent={selectedAgent} />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-2">
                <span className="text-4xl block">👈</span>
                <p className="text-xs text-gray-500">Selecione um agente para perfil profundo</p>
                <p className="text-[10px] text-gray-700 font-mono">Radar de Stats • KPIs • Ciclo de Vida</p>
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
      style={isRoot ? { borderColor: `${color}40`, boxShadow: `0 0 20px ${color}15` } : selected ? { boxShadow: `0 0 16px ${color}20` } : undefined}>
      <div className="relative inline-block">
        <span className={`${isRoot ? "text-4xl" : "text-3xl"}`}>{agent.emoji}</span>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ocean-950"
          style={{ background: isActive ? "#10b981" : agent.status === "error" ? "#ef4444" : "#6b7280" }} />
      </div>
      <h3 className={`${isRoot ? "text-base" : "text-sm"} font-bold text-white mt-2`}>{agent.name}</h3>
      <p className="text-[10px] text-gray-500">{agent.department}</p>
      <div className="flex items-center justify-center gap-2 mt-2 text-[10px] font-mono">
        <span className="text-accent-purple">Nv.{lvl.level}</span>
        <span className="text-gray-600">•</span>
        <span className="text-accent-blue">{agent.xp} XP</span>
      </div>
      <div className="xp-bar mt-1.5"><div className="xp-bar-fill" style={{ width: `${lvl.progress}%` }} /></div>
      {agent.currentTask && <p className="text-[9px] text-gray-600 mt-1.5 truncate font-mono">{agent.currentTask}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// RADAR CHART — Canvas-drawn spider chart for agent stats
// ══════════════════════════════════════════════════════════
function RadarChart({ stats, color }: { stats: Record<string, number>; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = 2;
    canvas.width = 200 * dpr;
    canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);
    const cx = 100, cy = 100, maxR = 70;
    const values = STAT_LABELS.map(k => stats[k] ?? 0);
    const n = values.length;
    const angleStep = (2 * Math.PI) / n;

    for (let r = 1; r <= 4; r++) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= n; i++) {
        const angle = -Math.PI / 2 + i * angleStep;
        const rad = (maxR * r) / 4;
        const x = cx + Math.cos(angle) * rad;
        const y = cy + Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + i * angleStep;
      const lx = cx + Math.cos(angle) * (maxR + 16);
      const ly = cy + Math.sin(angle) * (maxR + 16);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.stroke();
      ctx.font = "bold 8px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = STAT_COLORS[i];
      ctx.fillText(STAT_LABELS[i].toUpperCase(), lx, ly);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "bold 7px monospace";
      ctx.fillText(`${values[i]}`, lx, ly + 10);
    }

    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const angle = -Math.PI / 2 + idx * angleStep;
      const r = (values[idx] / 100) * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = `${color}20`;
    ctx.fill();
    ctx.strokeStyle = `${color}aa`;
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + i * angleStep;
      const r = (values[i] / 100) * maxR;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = STAT_COLORS[i];
      ctx.fill();
      ctx.strokeStyle = "#0a0f19";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [stats, color]);

  return <canvas ref={canvasRef} className="w-full" style={{ maxWidth: 200, height: 200, margin: "0 auto", display: "block" }} />;
}

// ══════════════════════════════════════════════════════════
// DEEP AGENT VIEW — full profile with radar, KPIs, lifecycle
// ══════════════════════════════════════════════════════════
function AgentDeepView({ agent }: { agent: any }) {
  const lvl = getLevelFromXP(agent.xp);
  const color = DEPT_COLORS[agent.department] || "#6b7280";
  const isActive = agent.status === "active" || agent.status === "working";
  const statusLabel = agent.status === "active" ? "Ativo" : agent.status === "working" ? "Trabalhando" : agent.status === "error" ? "Erro" : agent.status === "sleeping" ? "Dormindo" : "Ocioso";
  const safeStats: Record<string, number> = {
    speed: agent.speed ?? 0,
    accuracy: agent.accuracy ?? 0,
    versatility: agent.versatility ?? 0,
    reliability: agent.reliability ?? 0,
    creativity: agent.creativity ?? 0,
  };
  const avgStat = Math.round(Object.values(safeStats).reduce((s, v) => s + v, 0) / 5);
  const perfTier = avgStat >= 85 ? "S" : avgStat >= 70 ? "A" : avgStat >= 55 ? "B" : avgStat >= 40 ? "C" : "D";
  const tierColor = perfTier === "S" ? "#f59e0b" : perfTier === "A" ? "#10b981" : perfTier === "B" ? "#3b82f6" : perfTier === "C" ? "#f97316" : "#ef4444";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
      <div className="text-center">
        <div className="relative inline-block">
          <span className="text-5xl">{agent.emoji}</span>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-ocean-950" style={{ background: isActive ? "#10b981" : "#6b7280" }} />
        </div>
        <h3 className="text-lg font-bold text-white mt-2">{agent.name}</h3>
        <p className="text-[11px] font-mono" style={{ color }}>{agent.department}</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold" style={{ color: isActive ? "#10b981" : "#6b7280", background: isActive ? "#10b98115" : "#6b728015" }}>● {statusLabel}</span>
          <span className="text-purple-400 text-[9px] font-mono">Nv.{lvl.level} {lvl.title}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono" style={{ color: tierColor, background: `${tierColor}15` }}>TIER {perfTier}</span>
        </div>
      </div>

      {agent.soul && <p className="text-[10px] text-gray-400 italic border-l-2 border-gray-800 pl-2 text-center">&ldquo;{agent.soul}&rdquo;</p>}

      <div>
        <div className="flex justify-between text-[8px] text-gray-600 mb-0.5"><span>{agent.xp} XP</span><span>{lvl.nextXP}</span></div>
        <div className="h-2 rounded-full bg-ocean-800 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${lvl.progress}%` }} transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
        </div>
      </div>

      <div>
        <h4 className="text-[8px] uppercase tracking-widest text-gray-600 font-mono mb-1 text-center">Radar de Performance</h4>
        <RadarChart stats={safeStats} color={color} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Tarefas", value: agent.tasksCompleted ?? 0, c: "text-green-400", icon: "✅" },
          { label: "Sequência", value: `${agent.streakDays ?? 0}d`, c: "text-amber-400", icon: "🔥" },
          { label: "Tokens", value: `${((agent.tokensToday ?? 0) / 1000).toFixed(1)}k`, c: "text-blue-400", icon: "⚡" },
          { label: "Bloqueado", value: agent.tasksBlocked ?? 0, c: "text-red-400", icon: "🚫" },
          { label: "Média Stats", value: avgStat, c: "text-purple-400", icon: "📊" },
          { label: "Pendente", value: agent.tasksPending ?? 0, c: "text-yellow-400", icon: "⏳" },
        ].map(k => (
          <div key={k.label} className="p-2.5 rounded-lg bg-ocean-900/50 text-center">
            <div className="text-sm mb-0.5">{k.icon}</div>
            <div className={`text-base font-bold font-mono ${k.c}`}>{k.value}</div>
            <div className="text-[7px] text-gray-600 uppercase">{k.label}</div>
          </div>
        ))}
      </div>

      {agent.currentTask && (
        <div className="border-t border-glass-border pt-2">
          <h4 className="text-[8px] uppercase text-gray-600 font-mono mb-0.5">Tarefa Atual</h4>
          <p className="text-[10px] text-gray-300 font-mono">{agent.currentTask}</p>
        </div>
      )}

      <div className="border-t border-glass-border pt-3 space-y-2">
        <h4 className="text-[8px] uppercase tracking-widest text-gray-600 font-mono">Ações do Ciclo de Vida</h4>
        <div className="grid grid-cols-3 gap-1.5">
          <button className="py-2 rounded-lg text-[9px] font-mono font-bold bg-green-500/10 text-green-400 hover:bg-green-500/20 transition border border-green-500/15">
            ⬆ Promover
          </button>
          <button className="py-2 rounded-lg text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition border border-blue-500/15">
            📋 Revisar
          </button>
          <button className="py-2 rounded-lg text-[9px] font-mono font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition border border-red-500/15">
            ⛔ Demitir
          </button>
        </div>
        <p className="text-[8px] text-gray-700 font-mono text-center">
          Tier {perfTier} • {avgStat >= 70 ? "Elegível para promoção" : avgStat >= 40 ? "Sob observação" : "Risco de demissão"}
        </p>
      </div>
    </motion.div>
  );
}
