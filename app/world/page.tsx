/**
 * Virtual Office — Gather.town-style pixel art office.
 * Renders a 2D tile-based office floor with room zones, furniture, and animated agent sprites.
 * Agents move autonomously within their assigned rooms. Click an agent to inspect details.
 * Data fed from OpenClaw via Zustand store — no application server needed.
 */
"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDashboardStore } from "../../lib/store";
import { getLevelFromXP } from "../../lib/types";
import type { AgentRecord } from "../../lib/types";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS — Tile map, room definitions, colors
   ═══════════════════════════════════════════════════════════ */

const TILE = 32; // px per tile
const MAP_W = 28; // tiles wide
const MAP_H = 20; // tiles tall
const CANVAS_W = MAP_W * TILE;
const CANVAS_H = MAP_H * TILE;

/** Room zones — each defined by tile coordinates (x, y, w, h) and visual config */
const ROOMS: {
  id: string; label: string; icon: string; color: string;
  x: number; y: number; w: number; h: number;
}[] = [
  { id: "ponte-de-comando", label: "Command Bridge",  icon: "⚓", color: "#f59e0b", x: 1,  y: 1,  w: 8,  h: 5 },
  { id: "forja",            label: "Engineering",      icon: "⚔️", color: "#3b82f6", x: 10, y: 1,  w: 8,  h: 5 },
  { id: "tesouraria",       label: "Treasury",         icon: "💎", color: "#10b981", x: 19, y: 1,  w: 8,  h: 5 },
  { id: "laboratorio",      label: "Analytics Lab",    icon: "🔬", color: "#06b6d4", x: 1,  y: 7,  w: 8,  h: 5 },
  { id: "estaleiro",        label: "Architecture",     icon: "🏗️", color: "#8b5cf6", x: 10, y: 7,  w: 8,  h: 5 },
  { id: "biblioteca",       label: "Library",          icon: "📚", color: "#ec4899", x: 19, y: 7,  w: 8,  h: 5 },
  { id: "sala-de-maquinas", label: "Engine Room",      icon: "⚙️", color: "#ef4444", x: 1,  y: 13, w: 8,  h: 6 },
  { id: "torre-de-vigia",   label: "Watchtower",       icon: "🔭", color: "#f97316", x: 10, y: 13, w: 8,  h: 6 },
  { id: "cozinha",          label: "Lounge",           icon: "🍳", color: "#a855f7", x: 19, y: 13, w: 8,  h: 6 },
];

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981", working: "#f59e0b", idle: "#6b7280", error: "#ef4444", sleeping: "#374151",
};

const FLOOR_COLOR = "#1a1f2e";
const WALL_COLOR = "#0d1117";
const ROOM_FLOOR = "#141924";
const GRID_LINE = "rgba(255,255,255,0.03)";

/* Simple pixel art "furniture" positions per room (drawn as small rectangles) */
const FURNITURE_TYPES = [
  { icon: "desk",  w: 2, h: 1, color: "#2d3748" },
  { icon: "plant", w: 1, h: 1, color: "#22543d" },
  { icon: "screen", w: 1, h: 1, color: "#1a365d" },
] as const;

/* ═══════════════════════════════════════════════════════════
   AGENT SPRITE SYSTEM — pixel art character rendering
   ═══════════════════════════════════════════════════════════ */

/** Draws a pixel-art agent avatar at (px, py) on canvas */
function drawAgent(
  ctx: CanvasRenderingContext2D,
  px: number, py: number,
  color: string,
  statusColor: string,
  frame: number,
  isSelected: boolean,
  name: string,
  emoji: string,
) {
  const bounce = Math.sin(frame * 0.15) * 1.5;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(px, py + 14, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (pixel-art-ish rectangle character)
  ctx.fillStyle = color;
  ctx.fillRect(px - 6, py - 12 + bounce, 12, 16);

  // Head
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(px - 5, py - 20 + bounce, 10, 10);

  // Eyes
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(px - 3, py - 17 + bounce, 2, 2);
  ctx.fillRect(px + 1, py - 17 + bounce, 2, 2);

  // Hair/hat tint (matches room color)
  ctx.fillStyle = color;
  ctx.fillRect(px - 5, py - 21 + bounce, 10, 3);

  // Status indicator dot
  ctx.beginPath();
  ctx.arc(px + 8, py - 20 + bounce, 3, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();
  if (statusColor === "#10b981" || statusColor === "#f59e0b") {
    ctx.beginPath();
    ctx.arc(px + 8, py - 20 + bounce, 4, 0, Math.PI * 2);
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4 + Math.sin(frame * 0.1) * 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Selection ring
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(px, py - 4 + bounce, 14, 0, Math.PI * 2);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Name label
  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = isSelected ? "#ffffff" : "#94a3b8";
  ctx.fillText(name, px, py + 24);

  // Emoji above head
  ctx.font = "12px serif";
  ctx.fillText(emoji, px, py - 26 + bounce);
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function WorldPage() {
  const { agents, tasks } = useDashboardStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);
  const frameRef = useRef(0);
  const agentPosRef = useRef<Record<string, { x: number; y: number; tx: number; ty: number; speed: number; wait: number }>>({});

  // Initialize agent positions inside their rooms
  useEffect(() => {
    const pos = agentPosRef.current;
    agents.forEach(agent => {
      if (pos[agent.id]) return; // already initialized
      const room = ROOMS.find(r => r.id === agent.room) || ROOMS[0];
      const cx = (room.x + room.w / 2) * TILE;
      const cy = (room.y + room.h / 2) * TILE;
      const offset = () => (Math.random() - 0.5) * (room.w - 2) * TILE * 0.6;
      pos[agent.id] = {
        x: cx + offset(),
        y: cy + offset(),
        tx: cx + offset(),
        ty: cy + offset(),
        speed: 0.3 + Math.random() * 0.4,
        wait: Math.random() * 200,
      };
    });
  }, [agents]);

  // Pick a new random target within the agent's room
  const pickNewTarget = useCallback((agentId: string, roomId: string) => {
    const room = ROOMS.find(r => r.id === roomId) || ROOMS[0];
    const pos = agentPosRef.current[agentId];
    if (!pos) return;
    const margin = TILE * 1.5;
    pos.tx = room.x * TILE + margin + Math.random() * (room.w * TILE - margin * 2);
    pos.ty = room.y * TILE + margin + Math.random() * (room.h * TILE - margin * 2);
    pos.wait = 80 + Math.random() * 250;
  }, []);

  // Canvas render + animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.scale(dpr, dpr);

    let animId: number;

    const render = () => {
      animId = requestAnimationFrame(render);
      frameRef.current++;
      const frame = frameRef.current;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // ── Background ──
      ctx.fillStyle = WALL_COLOR;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // ── Draw rooms ──
      for (const room of ROOMS) {
        const rx = room.x * TILE;
        const ry = room.y * TILE;
        const rw = room.w * TILE;
        const rh = room.h * TILE;

        // Floor
        ctx.fillStyle = ROOM_FLOOR;
        ctx.fillRect(rx, ry, rw, rh);

        // Floor tiles pattern
        ctx.strokeStyle = GRID_LINE;
        ctx.lineWidth = 0.5;
        for (let tx = room.x; tx < room.x + room.w; tx++) {
          for (let ty = room.y; ty < room.y + room.h; ty++) {
            ctx.strokeRect(tx * TILE, ty * TILE, TILE, TILE);
          }
        }

        // Room border / wall
        ctx.strokeStyle = `${room.color}50`;
        ctx.lineWidth = 2;
        ctx.strokeRect(rx + 1, ry + 1, rw - 2, rh - 2);

        // Colored accent top border
        ctx.fillStyle = `${room.color}30`;
        ctx.fillRect(rx, ry, rw, 3);

        // Room label
        ctx.font = "bold 10px 'Courier New', monospace";
        ctx.fillStyle = `${room.color}cc`;
        ctx.textAlign = "left";
        ctx.fillText(`${room.icon} ${room.label}`, rx + 6, ry + 14);

        // Simple furniture (desks, plants)
        drawFurniture(ctx, room);
      }

      // ── Hallway decoration ──
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      for (let x = 0; x < MAP_W; x++) {
        for (let y = 0; y < MAP_H; y++) {
          if ((x + y) % 2 === 0) {
            ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
          }
        }
      }

      // ── Update and draw agents ──
      const pos = agentPosRef.current;
      for (const agent of agents) {
        const p = pos[agent.id];
        if (!p) continue;

        // Movement AI: if idle/sleeping, stay put. Otherwise, move toward target.
        if (agent.status !== "sleeping") {
          if (p.wait > 0) {
            p.wait--;
          } else {
            const dx = p.tx - p.x;
            const dy = p.ty - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 2) {
              // Arrived — pick new target after waiting
              pickNewTarget(agent.id, agent.room);
            } else {
              p.x += (dx / dist) * p.speed;
              p.y += (dy / dist) * p.speed;
            }
          }
        }

        const room = ROOMS.find(r => r.id === agent.room);
        const agentColor = room?.color || "#6b7280";
        const isSelected = selectedAgent?.id === agent.id;

        drawAgent(
          ctx, p.x, p.y,
          agentColor,
          STATUS_COLORS[agent.status] || "#6b7280",
          frame,
          isSelected,
          agent.name.split(" ")[0],
          agent.emoji,
        );
      }

      // ── Minimap legend ──
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(CANVAS_W - 130, CANVAS_H - 50, 125, 45);
      ctx.font = "8px 'Courier New', monospace";
      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "left";
      ctx.fillText("● active  ● working", CANVAS_W - 124, CANVAS_H - 36);
      ctx.fillText("● idle    ● error", CANVAS_W - 124, CANVAS_H - 24);
      ctx.fillText("● sleeping", CANVAS_W - 124, CANVAS_H - 12);
      // Color the dots
      const legendDots = [
        { x: CANVAS_W - 124, y: CANVAS_H - 40, c: "#10b981" },
        { x: CANVAS_W - 64,  y: CANVAS_H - 40, c: "#f59e0b" },
        { x: CANVAS_W - 124, y: CANVAS_H - 28, c: "#6b7280" },
        { x: CANVAS_W - 64,  y: CANVAS_H - 28, c: "#ef4444" },
        { x: CANVAS_W - 124, y: CANVAS_H - 16, c: "#374151" },
      ];
      legendDots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = d.c;
        ctx.fill();
      });
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [agents, selectedAgent, pickNewTarget]);

  // Click handler — detect which agent was clicked
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const pos = agentPosRef.current;
    for (const agent of agents) {
      const p = pos[agent.id];
      if (!p) continue;
      const dist = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
      if (dist < 18) {
        setSelectedAgent(agent);
        return;
      }
    }
    setSelectedAgent(null);
  }, [agents]);

  // Summary stats  
  const activeCount = agents.filter(a => a.status === "active" || a.status === "working").length;
  const crewXP = agents.reduce((s, a) => s + a.xp, 0);
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl animate-float">🏴‍☠️</span> Thousand Sunny — Virtual Office
          </h1>
          <p className="text-[11px] text-gray-500 font-mono mt-1">
            GATHER_STYLE // PIXEL_OFFICE // {agents.length} AGENTS // LIVE
          </p>
        </div>
        <div className="flex gap-2 flex-wrap text-xs">
          {[
            { icon: "🎯", label: "Active", val: `${activeCount}/${agents.length}`, c: "text-accent-green" },
            { icon: "⭐", label: "Crew XP", val: crewXP.toLocaleString(), c: "text-accent-purple" },
            { icon: "⚡", label: "Tasks", val: inProgressTasks.toString(), c: "text-accent-amber" },
          ].map(k => (
            <div key={k.label} className="kpi-card px-3 py-1.5 flex items-center gap-2">
              <span>{k.icon}</span>
              <div>
                <div className={`font-mono font-bold ${k.c}`}>{k.val}</div>
                <div className="text-[8px] text-gray-600 uppercase">{k.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content: Canvas + Agent Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-3 glass-card p-2 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onClick={handleClick}
            className="w-full rounded-lg cursor-crosshair"
            style={{ imageRendering: "pixelated", aspectRatio: `${MAP_W}/${MAP_H}` }}
          />
        </div>

        {/* Agent Detail Panel */}
        <div className="glass-card p-4 space-y-4 overflow-y-auto max-h-[650px]">
          <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Agent Inspector</h3>
          <AnimatePresence mode="wait">
            {selectedAgent ? (
              <AgentPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 space-y-2">
                <span className="text-4xl block">👆</span>
                <p className="text-xs text-gray-600">Click an agent on the map</p>
                <p className="text-[10px] text-gray-700 font-mono">to inspect their profile</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Agent list sidebar */}
          <div className="border-t border-glass-border pt-3 space-y-1.5">
            <h4 className="text-[9px] uppercase tracking-widest text-gray-600 font-mono mb-2">All Crew</h4>
            {agents.map(a => (
              <button key={a.id} onClick={() => setSelectedAgent(a)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all text-xs ${
                  selectedAgent?.id === a.id ? "bg-accent-blue/10 border border-accent-blue/30" : "hover:bg-ocean-900/50 border border-transparent"
                }`}>
                <span>{a.emoji}</span>
                <span className="text-gray-300 truncate flex-1">{a.name}</span>
                <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[a.status] }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FURNITURE — Draws desks/plants/screens in rooms
   ═══════════════════════════════════════════════════════════ */

function drawFurniture(ctx: CanvasRenderingContext2D, room: typeof ROOMS[number]) {
  const rx = room.x * TILE;
  const ry = room.y * TILE;
  const rw = room.w * TILE;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const rh = room.h * TILE;

  // Desks (2 per room, centered)
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(rx + TILE * 1.5, ry + TILE * 2, TILE * 2, TILE * 0.6);
  ctx.fillRect(rx + rw - TILE * 3.5, ry + TILE * 2, TILE * 2, TILE * 0.6);

  // Screen on desk
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(rx + TILE * 1.8, ry + TILE * 1.5, TILE * 0.6, TILE * 0.5);
  ctx.fillStyle = "#3b82f640";
  ctx.fillRect(rx + TILE * 1.85, ry + TILE * 1.55, TILE * 0.5, TILE * 0.35);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(rx + rw - TILE * 3.2, ry + TILE * 1.5, TILE * 0.6, TILE * 0.5);
  ctx.fillStyle = "#10b98140";
  ctx.fillRect(rx + rw - TILE * 3.15, ry + TILE * 1.55, TILE * 0.5, TILE * 0.35);

  // Plant in corner
  ctx.fillStyle = "#064e3b";
  ctx.fillRect(rx + rw - TILE * 1.3, ry + TILE * 0.7, TILE * 0.5, TILE * 0.5);
  ctx.fillStyle = "#22543d";
  ctx.beginPath();
  ctx.arc(rx + rw - TILE * 1.05, ry + TILE * 0.6, TILE * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

/* ═══════════════════════════════════════════════════════════
   AGENT PANEL — Shows detailed info for selected agent
   ═══════════════════════════════════════════════════════════ */

const RARITY_COLORS: Record<string, string> = { common: "#6b7280", rare: "#3b82f6", epic: "#8b5cf6", legendary: "#f59e0b" };

function AgentPanel({ agent, onClose }: { agent: AgentRecord; onClose: () => void }) {
  const lvl = getLevelFromXP(agent.xp);
  const st = STATUS_COLORS[agent.status] || "#6b7280";

  return (
    <motion.div
      key={agent.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ background: `${st}15`, boxShadow: `0 0 12px ${st}30` }}>
          {agent.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{agent.name}</h3>
          <p className="text-[10px] text-gray-500">{agent.department}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full" style={{ background: st }} />
            <span className="text-[10px] font-mono capitalize" style={{ color: st }}>{agent.status}</span>
            <span className="text-[10px] font-mono text-accent-purple ml-1">Lv.{lvl.level}</span>
          </div>
        </div>
      </div>

      {/* Soul quote */}
      {agent.soul && (
        <p className="text-[10px] text-gray-400 italic border-l-2 border-glass-border pl-2">
          &ldquo;{agent.soul}&rdquo;
        </p>
      )}

      {/* XP */}
      <div>
        <div className="flex justify-between text-[9px] text-gray-600 mb-0.5">
          <span>{agent.xp} XP</span>
          <span>{lvl.nextXP} XP</span>
        </div>
        <div className="xp-bar h-1.5">
          <motion.div initial={{ width: 0 }} animate={{ width: `${lvl.progress}%` }}
            transition={{ duration: 0.8 }} className="xp-bar-fill h-full" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 text-center">
        {[
          { label: "Tasks", val: agent.tasks_completed, c: "text-accent-green" },
          { label: "Streak", val: `${agent.streak_days}d`, c: "text-accent-amber" },
          { label: "Tokens", val: agent.tokens_today.toLocaleString(), c: "text-accent-blue" },
          { label: "Blocked", val: agent.tasks_blocked, c: "text-accent-red" },
        ].map(s => (
          <div key={s.label} className="p-2 rounded-lg bg-ocean-900/50">
            <div className={`text-sm font-bold font-mono ${s.c}`}>{s.val}</div>
            <div className="text-[8px] text-gray-600 uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Stats bars */}
      <div className="space-y-1.5">
        {Object.entries(agent.stats).map(([stat, val]) => (
          <div key={stat} className="flex items-center gap-1.5 text-[10px]">
            <span className="text-gray-500 w-16 capitalize">{stat}</span>
            <div className="flex-1 h-1.5 rounded-full bg-ocean-800 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }}
                transition={{ duration: 0.6 }} className="h-full rounded-full"
                style={{ background: val >= 90 ? "#10b981" : val >= 75 ? "#3b82f6" : val >= 60 ? "#f59e0b" : "#ef4444" }} />
            </div>
            <span className="text-gray-500 font-mono w-5 text-right">{val}</span>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {agent.achievements.length > 0 && (
        <div className="border-t border-glass-border pt-2">
          <h4 className="text-[9px] uppercase text-gray-600 font-mono mb-1.5">Achievements</h4>
          <div className="flex flex-wrap gap-1.5">
            {agent.achievements.map(a => (
              <span key={a.id} title={`${a.name} — ${a.description}`}
                className="w-7 h-7 flex items-center justify-center text-sm rounded border"
                style={{ borderColor: `${RARITY_COLORS[a.rarity]}40`, background: `${RARITY_COLORS[a.rarity]}10` }}>
                {a.icon}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Current task */}
      {agent.current_task && (
        <div className="border-t border-glass-border pt-2">
          <h4 className="text-[9px] uppercase text-gray-600 font-mono mb-1">Current Task</h4>
          <p className="text-[11px] text-gray-300 font-mono">{agent.current_task}</p>
        </div>
      )}
    </motion.div>
  );
}
