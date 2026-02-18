"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDashboardStore } from "../../lib/store";
import { getLevelFromXP } from "../../lib/types";
import type { AgentRecord } from "../../lib/types";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const T = 32;
const MAP_W = 42;
const MAP_H = 30;
const CW = MAP_W * T;
const CH = MAP_H * T;

interface RoomDef {
  id: string; label: string; icon: string; color: string;
  x: number; y: number; w: number; h: number;
  floor: "wood" | "carpet" | "tile" | "stone";
  floorTint: string;
  type?: "office" | "common";
}

const ROOMS: RoomDef[] = [
  { id: "ponte-de-comando", label: "Ponte de Comando", icon: "⚓", color: "#f59e0b", x: 1, y: 1, w: 9, h: 7, floor: "wood", floorTint: "#2a1f14" },
  { id: "forja", label: "Engenharia", icon: "⚔️", color: "#3b82f6", x: 11, y: 1, w: 9, h: 7, floor: "tile", floorTint: "#141e2e" },
  { id: "tesouraria", label: "Tesouraria", icon: "💎", color: "#10b981", x: 21, y: 1, w: 9, h: 7, floor: "carpet", floorTint: "#0d2818" },
  { id: "sala-reuniao", label: "Sala de Reunião", icon: "🤝", color: "#60a5fa", x: 31, y: 1, w: 10, h: 9, floor: "carpet", floorTint: "#0f1a2e", type: "common" },
  { id: "laboratorio", label: "Lab. Análises", icon: "🔬", color: "#06b6d4", x: 1, y: 9, w: 9, h: 7, floor: "tile", floorTint: "#0d1f24" },
  { id: "estaleiro", label: "Arquitetura", icon: "🏗️", color: "#8b5cf6", x: 11, y: 9, w: 9, h: 7, floor: "stone", floorTint: "#1a152e" },
  { id: "biblioteca", label: "Biblioteca", icon: "📚", color: "#ec4899", x: 21, y: 9, w: 9, h: 7, floor: "wood", floorTint: "#2a1420" },
  { id: "lobby", label: "Lobby Central", icon: "🏛️", color: "#94a3b8", x: 11, y: 17, w: 12, h: 7, floor: "tile", floorTint: "#121824", type: "common" },
  { id: "sala-de-maquinas", label: "Sala de Máquinas", icon: "⚙️", color: "#ef4444", x: 1, y: 17, w: 9, h: 7, floor: "stone", floorTint: "#2a1414" },
  { id: "torre-de-vigia", label: "Torre de Vigia", icon: "🔭", color: "#f97316", x: 24, y: 17, w: 9, h: 7, floor: "wood", floorTint: "#2a2014" },
  { id: "cafe", label: "Café & Descanso", icon: "☕", color: "#a78bfa", x: 31, y: 11, w: 10, h: 9, floor: "wood", floorTint: "#1e1418", type: "common" },
  { id: "cozinha", label: "Central de Comms", icon: "📡", color: "#a855f7", x: 1, y: 25, w: 9, h: 4, floor: "carpet", floorTint: "#1e142a" },
  { id: "jardim", label: "Jardim Zen", icon: "🌿", color: "#4ade80", x: 11, y: 25, w: 12, h: 4, floor: "stone", floorTint: "#0d1f14", type: "common" },
  { id: "billing-room", label: "Escritório Billing", icon: "🎯", color: "#fb923c", x: 24, y: 25, w: 9, h: 4, floor: "tile", floorTint: "#2a1f0e" },
  { id: "auditorio", label: "Auditório Geral", icon: "🎪", color: "#fbbf24", x: 31, y: 21, w: 10, h: 8, floor: "carpet", floorTint: "#2a2010", type: "common" },
];

// Unique visual profile per agent index
interface AgentVisual {
  skin: string; hair: string; hairStyle: "short"|"spiky"|"long"|"bald"|"ponytail"|"afro"|"mohawk"|"bowl";
  shirt: string; pants: string; accessory: "none"|"glasses"|"headphones"|"hat"|"helm"|"scarf"|"badge"|"tie";
}

const AGENT_VISUALS: AgentVisual[] = [
  { skin: "#ffd5a0", hair: "#1a1a2e", hairStyle: "short",    shirt: "#f59e0b", pants: "#374151", accessory: "hat" },
  { skin: "#e8b88a", hair: "#2d3436", hairStyle: "spiky",    shirt: "#3b82f6", pants: "#1e293b", accessory: "headphones" },
  { skin: "#ffecd2", hair: "#DAA520", hairStyle: "long",     shirt: "#10b981", pants: "#374151", accessory: "glasses" },
  { skin: "#c68e6a", hair: "#4a3728", hairStyle: "afro",     shirt: "#06b6d4", pants: "#1e293b", accessory: "badge" },
  { skin: "#deb887", hair: "#8B4513", hairStyle: "ponytail", shirt: "#8b5cf6", pants: "#374151", accessory: "tie" },
  { skin: "#ffd5a0", hair: "#800020", hairStyle: "mohawk",   shirt: "#ec4899", pants: "#1e293b", accessory: "scarf" },
  { skin: "#a0724a", hair: "#2c1810", hairStyle: "bald",     shirt: "#ef4444", pants: "#374151", accessory: "helm" },
  { skin: "#e8b88a", hair: "#6c5ce7", hairStyle: "bowl",     shirt: "#f97316", pants: "#1e293b", accessory: "glasses" },
  { skin: "#ffecd2", hair: "#d63031", hairStyle: "spiky",    shirt: "#a855f7", pants: "#374151", accessory: "headphones" },
  { skin: "#c68e6a", hair: "#1a1a2e", hairStyle: "short",    shirt: "#fb923c", pants: "#1e293b", accessory: "badge" },
];

const STATUS_CFG: Record<string, { label: string; color: string; glow: boolean }> = {
  active:   { label: "ATIVO",      color: "#10b981", glow: true },
  working:  { label: "TRABALHANDO", color: "#3b82f6", glow: true },
  idle:     { label: "OCIOSO",     color: "#6b7280", glow: false },
  error:    { label: "ERRO",       color: "#ef4444", glow: true },
  sleeping: { label: "DORMINDO",   color: "#4b5563", glow: false },
};

const INTERACTIONS = [
  { type: "meeting", icon: "📋", label: "Revisão de Sprint" },
  { type: "coffee", icon: "☕", label: "Pausa para Café" },
  { type: "pairing", icon: "👥", label: "Programação em Par" },
  { type: "debate", icon: "💡", label: "Brainstorming" },
  { type: "review", icon: "🔍", label: "Revisão de Código" },
];

const MENU_ITEMS = [
  { label: "Central", href: "/", icon: "🎯" },
  { label: "Escritório", href: "/world", icon: "🏢" },
  { label: "Organograma", href: "/orgchart", icon: "🌳" },
  { label: "Tarefas", href: "/tasks", icon: "📋" },
  { label: "Monitor", href: "/monitoring", icon: "📊" },
  { label: "Memória", href: "/memory", icon: "🧠" },
  { label: "Spawn", href: "/spawn", icon: "⚡" },
  { label: "Ranking", href: "/leaderboard", icon: "🏆" },
];

// ══════════════════════════════════════════════════════════
// DRAWING HELPERS
// ══════════════════════════════════════════════════════════

function drawFloorTile(ctx: CanvasRenderingContext2D, x: number, y: number, floor: string, tint: string, tx: number, ty: number) {
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, T, T);
  if (floor === "wood") {
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    if (ty % 2 === 0) ctx.fillRect(x, y + T / 2, T, 1);
    ctx.fillRect(x + (tx % 3) * 10, y, 1, T);
  } else if (floor === "tile") {
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x + 1, y + 1, T - 2, T - 2);
  } else if (floor === "carpet") {
    ctx.fillStyle = "rgba(255,255,255,0.015)";
    if ((tx + ty) % 2 === 0) ctx.fillRect(x, y, T, T);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
  }
}

/* ────────────────────────────────── */
/* v2.0 ROOM RENDERING — detailed    */
/* ────────────────────────────────── */
function drawRoomShadow(ctx: CanvasRenderingContext2D, room: RoomDef) {
  const rx = room.x * T + 4, ry = room.y * T + 4;
  const rw = room.w * T, rh = room.h * T;
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.roundRect(rx, ry, rw, rh, 4);
  ctx.fill();
}

function drawRoomFloor(ctx: CanvasRenderingContext2D, room: RoomDef) {
  const rx = room.x * T, ry = room.y * T;
  const rw = room.w * T, rh = room.h * T;
  const floorColors: Record<string, string> = {
    wood: "#d4c4a8", tile: "#dde2e8", carpet: "#c5ccb8", stone: "#c8c4bc",
  };
  ctx.fillStyle = floorColors[room.floor] || "#d0c8b8";
  ctx.fillRect(rx, ry, rw, rh);

  // Detailed floor patterns
  if (room.floor === "wood") {
    for (let py = ry; py < ry + rh; py += 8) {
      ctx.fillStyle = py % 16 === 0 ? "rgba(160,120,70,0.08)" : "rgba(120,90,50,0.06)";
      ctx.fillRect(rx, py, rw, 8);
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      ctx.fillRect(rx, py + 7, rw, 1);
      // Wood knots
      for (let kx = rx + (py % 32) * 3; kx < rx + rw; kx += 64) {
        ctx.fillStyle = "rgba(100,70,30,0.06)";
        ctx.beginPath(); ctx.arc(kx, py + 4, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
  } else if (room.floor === "tile") {
    for (let tx = rx; tx < rx + rw; tx += T) {
      for (let ty = ry; ty < ry + rh; ty += T) {
        ctx.fillStyle = (Math.floor(tx / T) + Math.floor(ty / T)) % 2 === 0 ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.02)";
        ctx.fillRect(tx, ty, T, T);
        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tx + 0.5, ty + 0.5, T - 1, T - 1);
      }
    }
  } else if (room.floor === "carpet") {
    // Carpet weave texture
    for (let py = ry; py < ry + rh; py += 4) {
      for (let px = rx; px < rx + rw; px += 4) {
        ctx.fillStyle = (px + py) % 8 === 0 ? "rgba(80,100,60,0.05)" : "rgba(100,120,80,0.03)";
        ctx.fillRect(px, py, 4, 4);
      }
    }
    // Carpet border/rug area
    ctx.strokeStyle = "rgba(80,60,40,0.15)";
    ctx.lineWidth = 2;
    ctx.strokeRect(rx + 12, ry + 26, rw - 24, rh - 38);
  } else {
    // Stone — irregular cobble look
    for (let tx = rx; tx < rx + rw; tx += T) {
      for (let ty = ry; ty < ry + rh; ty += T) {
        const offset = (Math.floor(ty / T)) % 2 === 0 ? 0 : T / 2;
        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tx + offset, ty, T, T);
        ctx.fillStyle = `rgba(0,0,0,${0.01 + Math.sin(tx * 0.3 + ty * 0.7) * 0.02})`;
        ctx.fillRect(tx + offset, ty, T, T);
      }
    }
  }
}

function drawRoomWalls(ctx: CanvasRenderingContext2D, room: RoomDef) {
  const rx = room.x * T, ry = room.y * T;
  const rw = room.w * T, rh = room.h * T;
  // Wall base (cream/beige top strip)
  ctx.fillStyle = "#e8e0d0";
  ctx.fillRect(rx, ry, rw, 22);
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(rx, ry + 20, rw, 2);
  // Outer wall stroke
  ctx.strokeStyle = "#9a9488";
  ctx.lineWidth = 2;
  ctx.strokeRect(rx, ry, rw, rh);
  // Inner baseboard
  ctx.fillStyle = "rgba(120,100,70,0.12)";
  ctx.fillRect(rx + 1, ry + rh - 4, rw - 2, 3);
}

function drawRoomLabel(ctx: CanvasRenderingContext2D, room: RoomDef, agentCount: number) {
  const rx = room.x * T, ry = room.y * T, rw = room.w * T;
  // Icon + label on wall strip
  ctx.font = "12px serif";
  ctx.textAlign = "left";
  ctx.fillText(room.icon, rx + 6, ry + 15);
  ctx.font = "bold 10px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#5a5040";
  ctx.fillText(room.label, rx + 24, ry + 14);
  // Agent count
  if (agentCount > 0) {
    const bx = rx + rw - 20;
    ctx.fillStyle = "#5b8c5a";
    ctx.beginPath(); ctx.arc(bx, ry + 11, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${agentCount}`, bx, ry + 14);
  }
}

function drawWallDecorations(ctx: CanvasRenderingContext2D, room: RoomDef, frame: number) {
  const rx = room.x * T, ry = room.y * T, rw = room.w * T;
  // Clock on wall
  const cx = rx + rw - 22, cy = ry + 11;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#999"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.stroke();
  // Clock hands
  const angle = (frame * 0.005) % (Math.PI * 2);
  ctx.strokeStyle = "#333"; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle) * 4, cy + Math.sin(angle) * 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle * 12) * 3, cy + Math.sin(angle * 12) * 3); ctx.stroke();
}

/* ────────────────────────────────── */
/* FURNITURE — detailed pixel objects */
/* ────────────────────────────────── */
function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  // Desk surface
  ctx.fillStyle = "#8B7355"; ctx.fillRect(x, y + 12, 40, 16);
  ctx.fillStyle = "#a08563"; ctx.fillRect(x + 1, y + 13, 38, 2); // highlight
  // Monitor
  ctx.fillStyle = "#2c2c2c"; ctx.fillRect(x + 10, y, 20, 14);
  ctx.fillStyle = `${color}30`; ctx.fillRect(x + 12, y + 1, 16, 11); // screen glow
  ctx.fillStyle = "#444"; ctx.fillRect(x + 17, y + 14, 6, 3); // stand
  // Keyboard
  ctx.fillStyle = "#555"; ctx.fillRect(x + 8, y + 20, 14, 4);
  ctx.fillStyle = "#666"; ctx.fillRect(x + 9, y + 21, 12, 2); // keys
}

function drawChair(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Seat
  ctx.fillStyle = "#4a4a5a"; ctx.fillRect(x, y, 14, 10);
  ctx.fillStyle = "#5a5a6a"; ctx.fillRect(x + 1, y + 1, 12, 3); // cushion
  // Back
  ctx.fillStyle = "#3a3a4a"; ctx.fillRect(x + 1, y - 6, 12, 7);
  // Wheels (just dots)
  ctx.fillStyle = "#333";
  ctx.fillRect(x + 1, y + 10, 3, 2);
  ctx.fillRect(x + 10, y + 10, 3, 2);
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  // Pot
  ctx.fillStyle = "#b87333"; ctx.fillRect(x + 2, y + 8, 10, 10);
  ctx.fillStyle = "#d48a45"; ctx.fillRect(x + 1, y + 7, 12, 3);
  // Dirt
  ctx.fillStyle = "#5a3e2b"; ctx.fillRect(x + 3, y + 7, 8, 2);
  // Leaves
  const sway = Math.sin(frame * 0.03) * 1.5;
  ctx.fillStyle = "#4a8c3f";
  ctx.beginPath(); ctx.arc(x + 7 + sway, y + 2, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5ba84e";
  ctx.beginPath(); ctx.arc(x + 4 + sway * 0.5, y + 4, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 10 + sway * 0.7, y + 5, 4, 0, Math.PI * 2); ctx.fill();
}

function drawCouch(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  // Base
  ctx.fillStyle = color; ctx.fillRect(x, y + 4, 50, 16);
  // Cushions
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(x + 3, y + 6, 20, 8);
  ctx.fillRect(x + 27, y + 6, 20, 8);
  // Arms
  ctx.fillStyle = color; ctx.fillRect(x - 3, y + 2, 5, 18);
  ctx.fillRect(x + 48, y + 2, 5, 18);
  // Backrest
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 50, 6);
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(x + 1, y + 1, 48, 2);
}

function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Frame
  ctx.fillStyle = "#8B7355"; ctx.fillRect(x, y, 30, 24);
  ctx.fillStyle = "#7a6345"; ctx.fillRect(x + 1, y + 1, 28, 1); // top
  // Shelves
  ctx.fillStyle = "#725d3d"; ctx.fillRect(x + 1, y + 8, 28, 1);
  ctx.fillRect(x + 1, y + 16, 28, 1);
  // Books
  const bookColors = ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#f39c12", "#e74c3c", "#3498db"];
  for (let s = 0; s < 3; s++) {
    const sy = y + 1 + s * 8;
    for (let b = 0; b < 5; b++) {
      ctx.fillStyle = bookColors[(s * 5 + b) % bookColors.length];
      ctx.fillRect(x + 3 + b * 5, sy + 1, 4, 6);
    }
  }
}

function drawTable(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Table top (circle)
  ctx.fillStyle = "#8B7355";
  ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#a08563";
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
}

function drawWhiteboard(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#ddd"; ctx.fillRect(x, y, 40, 24);
  ctx.strokeStyle = "#999"; ctx.lineWidth = 1; ctx.strokeRect(x, y, 40, 24);
  // Scribbles
  ctx.strokeStyle = "#4a90d9"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 5, y + 6); ctx.lineTo(x + 20, y + 8); ctx.lineTo(x + 35, y + 5); ctx.stroke();
  ctx.strokeStyle = "#e74c3c";
  ctx.beginPath(); ctx.moveTo(x + 5, y + 14); ctx.lineTo(x + 25, y + 12); ctx.stroke();
  ctx.strokeStyle = "#27ae60";
  ctx.beginPath(); ctx.moveTo(x + 5, y + 20); ctx.lineTo(x + 30, y + 18); ctx.stroke();
}

function drawFurniture(ctx: CanvasRenderingContext2D, room: RoomDef, frame: number) {
  const rx = room.x * T + 8, ry = room.y * T + 28;
  const rw = room.w * T - 16, rh = room.h * T - 36;

  if (room.type === "common") {
    if (room.id === "lobby") {
      drawCouch(ctx, rx + 10, ry + 10, "#6a7b8a");
      drawCouch(ctx, rx + rw - 60, ry + rh - 30, "#7a6b5a");
      drawPlant(ctx, rx + rw - 20, ry + 8, frame);
      drawPlant(ctx, rx + 5, ry + rh - 20, frame);
      drawTable(ctx, rx + rw / 2, ry + rh / 2);
    } else if (room.id === "cafe") {
      // Counter
      ctx.fillStyle = "#8B7355"; ctx.fillRect(rx + 6, ry + 4, rw - 12, 12);
      ctx.fillStyle = "#a08563"; ctx.fillRect(rx + 8, ry + 5, rw - 16, 3);
      // Coffee cups
      ctx.fillStyle = "#ddd"; ctx.fillRect(rx + 14, ry + 2, 5, 4);
      ctx.fillStyle = "#ddd"; ctx.fillRect(rx + 24, ry + 2, 5, 4);
      // Steam
      ctx.fillStyle = `rgba(200,200,200,${0.3 + Math.sin(frame * 0.06) * 0.15})`;
      ctx.fillRect(rx + 15, ry - 2 - Math.abs(Math.sin(frame * 0.08)) * 4, 2, 4);
      ctx.fillRect(rx + 25, ry - 1 - Math.abs(Math.sin(frame * 0.07)) * 3, 2, 4);
      // Tables
      drawTable(ctx, rx + 30, ry + rh / 2 + 5);
      drawTable(ctx, rx + rw - 30, ry + rh / 2 + 5);
      drawPlant(ctx, rx + rw - 16, ry + 6, frame);
    } else if (room.id === "sala-reuniao") {
      // Conference table
      ctx.fillStyle = "#7a6345"; ctx.fillRect(rx + rw / 2 - 40, ry + rh / 2 - 10, 80, 20);
      ctx.fillStyle = "#8B7355"; ctx.fillRect(rx + rw / 2 - 38, ry + rh / 2 - 8, 76, 16);
      // Chairs around table
      for (let i = 0; i < 5; i++) { drawChair(ctx, rx + rw / 2 - 35 + i * 16, ry + rh / 2 - 22); }
      for (let i = 0; i < 5; i++) { drawChair(ctx, rx + rw / 2 - 35 + i * 16, ry + rh / 2 + 14); }
      drawWhiteboard(ctx, rx + rw / 2 - 20, ry + 4);
    } else if (room.id === "jardim") {
      // Green patches
      ctx.fillStyle = "#7aba6e"; ctx.beginPath(); ctx.arc(rx + 20, ry + rh / 2, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#6aaa5e"; ctx.beginPath(); ctx.arc(rx + rw - 20, ry + rh / 2, 10, 0, Math.PI * 2); ctx.fill();
      // Water feature
      ctx.fillStyle = "#6ab8d4";
      ctx.beginPath(); ctx.ellipse(rx + rw / 2, ry + rh / 2, 20 + Math.sin(frame * 0.03) * 2, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.ellipse(rx + rw / 2, ry + rh / 2, 14 + Math.sin(frame * 0.05) * 3, 7, 0, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 3; i++) drawPlant(ctx, rx + 10 + i * 40, ry + 4, frame + i * 30);
    } else if (room.id === "auditorio") {
      // Rows of chairs
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) drawChair(ctx, rx + 12 + c * 18, ry + 14 + r * 22);
      // Stage/podium
      ctx.fillStyle = "#8B7355"; ctx.fillRect(rx + rw / 2 - 16, ry + rh - 18, 32, 12);
      ctx.fillStyle = "#a08563"; ctx.fillRect(rx + rw / 2 - 14, ry + rh - 16, 28, 3);
    }
  } else {
    // Office rooms — 2 desk + chair stations, bookshelf, plant
    drawDesk(ctx, rx + 8, ry + 20, room.color);
    drawChair(ctx, rx + 20, ry + 42);
    drawDesk(ctx, rx + rw - 50, ry + 20, room.color);
    drawChair(ctx, rx + rw - 38, ry + 42);
    drawBookshelf(ctx, rx + rw - 34, ry + rh - 28);
    drawPlant(ctx, rx + 2, ry + rh - 20, frame);
    drawPlant(ctx, rx + rw - 14, ry + 4, frame);
  }
}

// ══════════════════════════════════════════════════════════
// OUTDOOR ENVIRONMENT — trees, bushes, paths, benches, fences, lamps
// ══════════════════════════════════════════════════════════
function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frame: number) {
  const s = size;
  const sway = Math.sin(frame * 0.015 + x * 0.08) * 1.2;
  // Shadow on ground
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath(); ctx.ellipse(x, y + 14 * s, 14 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
  // Trunk
  ctx.fillStyle = "#6b4a2a";
  ctx.fillRect(x - 3 * s, y, 6 * s, 16 * s);
  ctx.fillStyle = "#7d5c38";
  ctx.fillRect(x - 2 * s, y + 2, 4 * s, 3 * s);
  // Canopy layers
  ctx.fillStyle = "#2d6b22";
  ctx.beginPath(); ctx.arc(x + sway, y - 8 * s, 14 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a8a2e";
  ctx.beginPath(); ctx.arc(x - 5 * s + sway * 0.7, y - 3 * s, 9 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 6 * s + sway * 0.5, y - 4 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4a9a3e";
  ctx.beginPath(); ctx.arc(x + 2 * s + sway, y - 10 * s, 8 * s, 0, Math.PI * 2); ctx.fill();
  // Highlight
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath(); ctx.arc(x - 3 + sway, y - 10 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const sway = Math.sin(frame * 0.02 + y * 0.1) * 0.8;
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.beginPath(); ctx.ellipse(x, y + 7, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a7830";
  ctx.beginPath(); ctx.arc(x + sway, y, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#4a9a3e";
  ctx.beginPath(); ctx.arc(x - 5 + sway, y + 2, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 6 + sway, y + 1, 7, 0, Math.PI * 2); ctx.fill();
  // Berry dots
  ctx.fillStyle = "#c0392b";
  ctx.beginPath(); ctx.arc(x + 3 + sway, y - 3, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x - 2 + sway, y + 1, 1.5, 0, Math.PI * 2); ctx.fill();
}

function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, frame: number) {
  const sway = Math.sin(frame * 0.03 + x) * 1;
  ctx.fillStyle = "#4a8c3f";
  ctx.fillRect(x, y + 3, 2, 7);
  ctx.fillStyle = color;
  for (let a = 0; a < 5; a++) {
    const angle = (a / 5) * Math.PI * 2;
    ctx.beginPath(); ctx.arc(x + 1 + sway + Math.cos(angle) * 2.5, y + 2 + Math.sin(angle) * 2.5, 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x + 1 + sway, y + 2, 1.5, 0, Math.PI * 2); ctx.fill();
}

function drawBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.beginPath(); ctx.ellipse(x + 15, y + 14, 17, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8B7355";
  ctx.fillRect(x, y, 30, 3); // seat
  ctx.fillRect(x, y - 8, 30, 3); // back
  ctx.fillStyle = "#6b5a3a";
  ctx.fillRect(x + 2, y + 3, 3, 10); // legs
  ctx.fillRect(x + 25, y + 3, 3, 10);
  ctx.fillRect(x + 2, y - 5, 3, 5);
  ctx.fillRect(x + 25, y - 5, 3, 5);
}

function drawLampPost(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.beginPath(); ctx.ellipse(x, y + 22, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#555";
  ctx.fillRect(x - 2, y, 4, 22);
  ctx.fillStyle = "#666";
  ctx.fillRect(x - 4, y - 2, 8, 4);
  // Light glow
  const glow = 0.08 + Math.sin(frame * 0.04) * 0.03;
  ctx.fillStyle = `rgba(255,220,130,${glow})`;
  ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffd580";
  ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
}

function drawFence(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, vertical: boolean) {
  ctx.fillStyle = "#a88c60";
  for (let i = 0; i < length; i += 12) {
    if (vertical) {
      ctx.fillRect(x - 1, y + i, 3, 10); // post
      ctx.fillRect(x, y + i + 3, 1, 4); // cross
    } else {
      ctx.fillRect(x + i, y - 1, 3, 10); // post
    }
  }
  // Rails
  if (vertical) {
    ctx.fillRect(x - 1, y, 1, length);
    ctx.fillRect(x + 1, y, 1, length);
  } else {
    ctx.fillRect(x, y + 2, length, 1);
    ctx.fillRect(x, y + 6, length, 1);
  }
}

function drawPath(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number) {
  ctx.fillStyle = "#c4b89a";
  if (x1 === x2) {
    ctx.fillRect(x1 - width / 2, Math.min(y1, y2), width, Math.abs(y2 - y1));
  } else {
    ctx.fillRect(Math.min(x1, x2), y1 - width / 2, Math.abs(x2 - x1), width);
  }
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  if (x1 === x2) {
    ctx.fillRect(x1 - width / 2, Math.min(y1, y2), 1, Math.abs(y2 - y1));
    ctx.fillRect(x1 + width / 2, Math.min(y1, y2), 1, Math.abs(y2 - y1));
  } else {
    ctx.fillRect(Math.min(x1, x2), y1 - width / 2, Math.abs(x2 - x1), 1);
    ctx.fillRect(Math.min(x1, x2), y1 + width / 2, Math.abs(x2 - x1), 1);
  }
  // Stepping stones
  ctx.fillStyle = "rgba(180,170,140,0.4)";
  const len = Math.abs(x1 === x2 ? y2 - y1 : x2 - x1);
  for (let i = 8; i < len; i += 16) {
    if (x1 === x2) {
      ctx.beginPath(); ctx.arc(x1, Math.min(y1, y2) + i, 3, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(Math.min(x1, x2) + i, y1, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawOutdoorDecorations(ctx: CanvasRenderingContext2D, frame: number) {
  // Trees along edges (with shadows)
  const treePositions = [
    [16, 24], [100, 20], [460, 16], [600, 22], [780, 18], [980, 22], [1120, 18], [1240, 20],
    [14, 300], [14, 520], [14, 740], [1318, 120], [1318, 380], [1318, 580], [1318, 780],
    [220, 930], [540, 935], [840, 928], [1140, 932],
  ];
  for (const [tx, ty] of treePositions) drawTree(ctx, tx, ty, 1.1 + Math.sin(tx * 0.01) * 0.2, frame);

  // Bushes
  const bushPos = [
    [60, 40], [170, 28], [330, 38], [690, 30], [890, 40], [1140, 32], [1270, 45],
    [60, 910], [380, 915], [688, 905], [988, 912], [1270, 908],
    [28, 180], [28, 440], [28, 650], [1310, 230], [1310, 500], [1310, 710],
  ];
  for (const [bx, by] of bushPos) drawBush(ctx, bx, by, frame);

  // Flowers
  const flowerColors = ["#e74c3c", "#f1c40f", "#e67e22", "#9b59b6", "#3498db", "#e91e63", "#ff6b9d", "#ffd93d"];
  for (let i = 0; i < 40; i++) {
    const fx = 45 + (i * 37) % 1270;
    const fy = i < 20 ? 32 + (i * 11) % 20 : 910 + (i * 7) % 18;
    drawFlower(ctx, fx, fy, flowerColors[i % flowerColors.length], frame);
  }

  // Paths connecting rooms
  drawPath(ctx, 9 * T + T / 2, 4 * T, 11 * T, 4 * T, 16);
  drawPath(ctx, 20 * T, 7 * T + T / 2, 20 * T, 9 * T, 16);
  drawPath(ctx, 30 * T, 7 * T + T / 2, 31 * T, 9 * T, 14);
  drawPath(ctx, 9 * T + T / 2, 15 * T, 11 * T, 15 * T, 16);
  drawPath(ctx, 22 * T, 16 * T, 24 * T, 16 * T, 14);
  drawPath(ctx, 16 * T, 8 * T, 16 * T, 9 * T, 12);
  drawPath(ctx, 16 * T, 24 * T, 16 * T, 25 * T, 12);

  // Benches
  drawBench(ctx, 340, 932);
  drawBench(ctx, 740, 928);
  drawBench(ctx, 1060, 932);

  // Lamp posts
  drawLampPost(ctx, 160, 18, frame);
  drawLampPost(ctx, 700, 14, frame);
  drawLampPost(ctx, 1080, 16, frame);
  drawLampPost(ctx, 160, 920, frame);
  drawLampPost(ctx, 900, 918, frame);

  // Fences along bottom
  drawFence(ctx, 35, 948, 200, false);
  drawFence(ctx, 450, 948, 200, false);
  drawFence(ctx, 870, 948, 200, false);
}

// ══════════════════════════════════════════════════════════
// CHARACTER DRAWING — Gather-style chibi pixel art
// ══════════════════════════════════════════════════════════
const SPRITE_SCALE = 1.2;

function drawCharacter(
  ctx: CanvasRenderingContext2D, px: number, py: number,
  vis: AgentVisual, statusColor: string, frame: number,
  isSelected: boolean, isHovered: boolean,
  name: string, emoji: string, statusLabel: string,
  isMoving: boolean, interactionIcon: string | null,
) {
  // Scale up the sprite
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(SPRITE_SCALE, SPRITE_SCALE);
  // Draw at origin (0,0) — all coordinates relative
  const bounce = isMoving ? Math.sin(frame * 0.25) * 2.5 : Math.sin(frame * 0.05) * 0.5;
  const by = bounce;
  const walkPhase = Math.sin(frame * 0.3);

  // ── Shadow ──
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 24, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Status glow aura (for active/working agents) ──
  if (statusColor === "#10b981" || statusColor === "#3b82f6") {
    ctx.save();
    const pulse = 0.08 + Math.sin(frame * 0.06) * 0.04;
    ctx.fillStyle = `${statusColor}${Math.round(pulse * 255).toString(16).padStart(2, '0')}`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Selection ring ──
  if (isSelected || isHovered) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 24, 18, 7, 0, 0, Math.PI * 2);
    ctx.strokeStyle = isSelected ? "#3b82f6" : "rgba(255,255,255,0.6)";
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    if (isSelected) { ctx.shadowColor = "#3b82f6"; ctx.shadowBlur = 10; }
    if (isHovered && !isSelected) { ctx.shadowColor = "rgba(255,255,255,0.4)"; ctx.shadowBlur = 6; }
    ctx.stroke();
    ctx.restore();
  }

  // ── Feet / Shoes ──
  ctx.fillStyle = "#2c2c3a";
  if (isMoving) {
    ctx.fillRect(-7 + walkPhase * 2, by + 18, 6, 4);
    ctx.fillRect(1 - walkPhase * 2, by + 18, 6, 4);
  } else {
    ctx.fillRect(-7, by + 18, 6, 4);
    ctx.fillRect(1, by + 18, 6, 4);
  }

  // ── Legs ──
  ctx.fillStyle = vis.pants;
  if (isMoving) {
    ctx.fillRect(-6 + walkPhase * 1.5, by + 10, 5, 9);
    ctx.fillRect(1 - walkPhase * 1.5, by + 10, 5, 9);
  } else {
    ctx.fillRect(-6, by + 10, 5, 9);
    ctx.fillRect(1, by + 10, 5, 9);
  }

  // ── Body / Torso ──
  ctx.fillStyle = vis.shirt;
  ctx.beginPath();
  ctx.roundRect(-10, by - 4, 20, 16, 2);
  ctx.fill();
  // Shirt detail — collar
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(-4, by - 4, 8, 3);
  // Shirt shadow
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(-9, by + 8, 18, 3);
  // Shirt highlight stripe
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(-8, by - 2, 5, 2);

  // ── Arms ──
  ctx.fillStyle = vis.shirt;
  const armSwing = isMoving ? walkPhase * 3 : 0;
  ctx.beginPath(); ctx.roundRect(-14, by - 2 + armSwing, 5, 14, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(9, by - 2 - armSwing, 5, 14, 2); ctx.fill();
  // Hands (skin)
  ctx.fillStyle = vis.skin;
  ctx.fillRect(-14, by + 10 + armSwing, 5, 4);
  ctx.fillRect(9, by + 10 - armSwing, 5, 4);

  // ── Head (large, chibi-proportioned) ──
  ctx.fillStyle = vis.skin;
  ctx.beginPath();
  ctx.roundRect(-10, by - 24, 20, 22, 5);
  ctx.fill();
  // Cheek blush
  ctx.fillStyle = "rgba(255,140,140,0.12)";
  ctx.beginPath(); ctx.arc(-7, by - 10, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, by - 10, 3, 0, Math.PI * 2); ctx.fill();

  // ── Eyes ──
  const blink = Math.sin(frame * 0.07 + px * 0.02) > 0.93;
  if (!blink) {
    // Large anime-style eyes
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(-6, by - 18, 5, 6);
    ctx.fillRect(1, by - 18, 5, 6);
    // White/shiny highlight
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-5, by - 17, 2, 2);
    ctx.fillRect(2, by - 17, 2, 2);
    // Iris color dots
    ctx.fillStyle = vis.hair;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(-4, by - 15, 2, 2);
    ctx.fillRect(3, by - 15, 2, 2);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(-6, by - 15, 5, 1);
    ctx.fillRect(1, by - 15, 5, 1);
  }

  // ── Mouth ──
  ctx.fillStyle = "#c0665a";
  ctx.fillRect(-2, by - 8, 4, 2);

  // ── Hair (various styles, Gather-like) ──
  ctx.fillStyle = vis.hair;
  switch (vis.hairStyle) {
    case "short":
      ctx.fillRect(-11, by - 27, 22, 7);
      ctx.fillRect(-11, by - 24, 3, 8);
      ctx.fillRect(8, by - 24, 3, 6);
      break;
    case "spiky":
      ctx.fillRect(-11, by - 28, 22, 7);
      ctx.fillRect(-8, by - 34, 5, 8);
      ctx.fillRect(-1, by - 36, 5, 10);
      ctx.fillRect(5, by - 33, 5, 7);
      break;
    case "long":
      ctx.fillRect(-12, by - 27, 24, 7);
      ctx.fillRect(-12, by - 24, 4, 22);
      ctx.fillRect(8, by - 24, 4, 22);
      ctx.fillRect(-8, by - 22, 4, 4);
      ctx.fillRect(4, by - 22, 4, 4);
      break;
    case "bald":
      ctx.fillStyle = vis.skin;
      ctx.fillRect(-10, by - 26, 20, 3);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(-4, by - 26, 6, 2);
      break;
    case "ponytail":
      ctx.fillRect(-11, by - 27, 22, 7);
      ctx.fillRect(8, by - 24, 4, 8);
      ctx.fillRect(11, by - 18, 5, 3);
      ctx.fillRect(14, by - 16, 4, 14);
      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(12, by - 17, 6, 3);
      break;
    case "afro":
      ctx.beginPath();
      ctx.arc(0, by - 22, 16, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "mohawk":
      ctx.fillRect(-11, by - 27, 22, 6);
      ctx.fillRect(-3, by - 38, 6, 14);
      ctx.fillRect(-1, by - 40, 2, 4);
      break;
    case "bowl":
      ctx.fillRect(-12, by - 27, 24, 9);
      ctx.fillRect(-12, by - 20, 4, 6);
      ctx.fillRect(8, by - 20, 4, 6);
      break;
  }

  // ── Accessories ──
  switch (vis.accessory) {
    case "glasses":
      ctx.strokeStyle = "rgba(180,200,220,0.8)"; ctx.lineWidth = 1.5;
      ctx.strokeRect(-7, by - 19, 6, 6);
      ctx.strokeRect(1, by - 19, 6, 6);
      ctx.beginPath(); ctx.moveTo(-1, by - 16); ctx.lineTo(1, by - 16); ctx.stroke();
      break;
    case "headphones":
      ctx.strokeStyle = "#444"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, by - 26, 14, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = "#333"; ctx.fillRect(-15, by - 22, 6, 10); ctx.fillRect(9, by - 22, 6, 10);
      ctx.fillStyle = "#555"; ctx.fillRect(-14, by - 20, 4, 6); ctx.fillRect(10, by - 20, 4, 6);
      break;
    case "hat":
      ctx.fillStyle = vis.shirt;
      ctx.fillRect(-14, by - 30, 28, 5);
      ctx.fillRect(-8, by - 36, 16, 8);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(-6, by - 34, 12, 2);
      break;
    case "helm":
      ctx.fillStyle = "#7a7a8a";
      ctx.fillRect(-12, by - 29, 24, 7);
      ctx.fillRect(-5, by - 34, 10, 7);
      ctx.fillStyle = "#8a8a9a";
      ctx.fillRect(-10, by - 28, 20, 2);
      break;
    case "scarf":
      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(-10, by - 4, 20, 5);
      ctx.fillRect(-14, by - 2, 6, 14);
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(-13, by + 4, 4, 2);
      break;
    case "tie":
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(-2, by - 1, 4, 12);
      ctx.beginPath(); ctx.moveTo(-3, by + 11); ctx.lineTo(0, by + 16); ctx.lineTo(3, by + 11); ctx.fill();
      break;
    case "badge":
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath(); ctx.arc(8, by, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 5px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("★", 8, by + 2);
      break;
  }

  // ── Emoji above head (key identifier) ──
  ctx.font = "16px serif";
  ctx.textAlign = "center";
  ctx.fillText(emoji, 0, by - 42);

  // ── Interaction bubble ──
  if (interactionIcon) {
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.beginPath();
    ctx.roundRect(-18, by - 68, 36, 24, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.moveTo(-4, by - 38); ctx.lineTo(0, by - 33); ctx.lineTo(4, by - 38);
    ctx.fill();
    ctx.font = "14px serif";
    ctx.fillStyle = "#1e293b";
    ctx.textAlign = "center";
    ctx.fillText(interactionIcon, 0, by - 44);
  }

  // Restore transform before drawing name tag (draw in world-space at full size)
  ctx.restore();

  // ── Name tag — drawn in world space (not scaled) for crisp text ──
  ctx.font = "bold 11px 'Segoe UI', sans-serif";
  const nameW = ctx.measureText(name).width + 20;
  const nx = px - nameW / 2;
  const ny = py + 26 * SPRITE_SCALE;
  // Pill shape
  ctx.fillStyle = isSelected ? "rgba(59,130,246,0.92)" : "rgba(255,255,255,0.94)";
  ctx.beginPath();
  ctx.roundRect(nx, ny, nameW, 18, 9);
  ctx.fill();
  // Shadow on pill
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Status dot inside pill
  ctx.beginPath();
  ctx.arc(nx + 9, ny + 9, 4, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();
  // Name text
  ctx.fillStyle = isSelected ? "#ffffff" : "#2c2c3a";
  ctx.textAlign = "center";
  ctx.fillText(name, px + 3, ny + 13);
}

// ══════════════════════════════════════════════════════════
// PARTICLES
// ══════════════════════════════════════════════════════════
interface Particle { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number }
function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * CW, y: Math.random() * CH,
    vx: (Math.random() - 0.5) * 0.12, vy: -Math.random() * 0.08 - 0.02,
    size: Math.random() * 2 + 0.5, alpha: Math.random() * 0.25 + 0.05, life: Math.random() * 500 + 200,
  }));
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function WorldPage() {
  const { agents, tasks } = useDashboardStore();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const frameRef = useRef(0);
  const particlesRef = useRef<Particle[]>(createParticles(50));
  const interactionsRef = useRef<Record<string, { icon: string; ttl: number }>>({});
  const agentPosRef = useRef<Record<string, {
    x: number; y: number; tx: number; ty: number;
    speed: number; wait: number; moving: boolean; currentRoom: string;
  }>>({});

  useEffect(() => {
    const pos = agentPosRef.current;
    agents.forEach((agent, i) => {
      if (pos[agent.id]) return;
      const room = ROOMS.find(r => r.id === agent.room) || ROOMS[i % ROOMS.length];
      const cx = (room.x + room.w / 2) * T;
      const cy = (room.y + room.h / 2) * T + 20;
      pos[agent.id] = {
        x: cx + (Math.random() - 0.5) * room.w * T * 0.3,
        y: cy + (Math.random() - 0.5) * room.h * T * 0.3,
        tx: cx, ty: cy, speed: 0.4 + Math.random() * 0.3,
        wait: Math.random() * 120, moving: false, currentRoom: room.id,
      };
    });
  }, [agents]);

  const pickTarget = useCallback((id: string, homeRoomId: string) => {
    const p = agentPosRef.current[id];
    if (!p) return;
    const shouldRoam = Math.random() < 0.25;
    let targetRoom: RoomDef;
    if (shouldRoam) {
      const pool = ROOMS.filter(r => r.id !== p.currentRoom);
      targetRoom = pool[Math.floor(Math.random() * pool.length)] || ROOMS[0];
    } else {
      targetRoom = ROOMS.find(r => r.id === homeRoomId) || ROOMS[0];
    }
    const m = T * 1.5;
    p.tx = targetRoom.x * T + m + Math.random() * (targetRoom.w * T - m * 2);
    p.ty = targetRoom.y * T + m + 24 + Math.random() * (targetRoom.h * T - m * 2 - 24);
    p.wait = 100 + Math.random() * 300;
    p.currentRoom = targetRoom.id;
  }, []);

  // Spawn random interactions
  useEffect(() => {
    const iv = setInterval(() => {
      const activeAgents = agents.filter(a => a.status !== "sleeping");
      if (activeAgents.length < 2) return;
      const pos = agentPosRef.current;
      for (let i = 0; i < activeAgents.length; i++) {
        for (let j = i + 1; j < activeAgents.length; j++) {
          const pa = pos[activeAgents[i].id], pb = pos[activeAgents[j].id];
          if (!pa || !pb) continue;
          const d = Math.sqrt((pa.x - pb.x) ** 2 + (pa.y - pb.y) ** 2);
          if (d < 70 && !pa.moving && !pb.moving && Math.random() < 0.15) {
            const inter = INTERACTIONS[Math.floor(Math.random() * INTERACTIONS.length)];
            interactionsRef.current[activeAgents[i].id] = { icon: inter.icon, ttl: 120 };
            interactionsRef.current[activeAgents[j].id] = { icon: inter.icon, ttl: 120 };
          }
        }
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [agents]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
    ctx.scale(dpr, dpr);

    let animId: number;
    const render = () => {
      animId = requestAnimationFrame(render);
      frameRef.current++;
      const frame = frameRef.current;
      ctx.clearRect(0, 0, CW, CH);
      // Background — warm earthy outdoor tone
      ctx.fillStyle = "#9ab07a";
      ctx.fillRect(0, 0, CW, CH);
      // Subtle grass texture
      for (let x = 0; x < MAP_W; x++) {
        for (let y = 0; y < MAP_H; y++) {
          const shade = (x + y) % 3 === 0 ? "rgba(0,0,0,0.03)" : (x + y) % 3 === 1 ? "rgba(255,255,255,0.02)" : "transparent";
          if (shade !== "transparent") {
            ctx.fillStyle = shade;
            ctx.fillRect(x * T, y * T, T, T);
          }
        }
      }

      // Outdoor decorations (trees, bushes, flowers, paths)
      drawOutdoorDecorations(ctx, frame);

      // Count agents per room
      const pos = agentPosRef.current;
      const roomCounts: Record<string, number> = {};
      agents.forEach(a => {
        const p = pos[a.id];
        if (p) roomCounts[p.currentRoom] = (roomCounts[p.currentRoom] || 0) + 1;
      });

      // Rooms — shadow first, then floor/walls/furniture/label
      for (const room of ROOMS) drawRoomShadow(ctx, room);
      for (const room of ROOMS) {
        drawRoomFloor(ctx, room);
        drawRoomWalls(ctx, room);
        drawFurniture(ctx, room, frame);
        drawWallDecorations(ctx, room, frame);
        drawRoomLabel(ctx, room, roomCounts[room.id] || 0);
      }

      // Leaf particles (green-tinted for outdoor feel)
      for (const p of particlesRef.current) {
        p.x += p.vx + Math.sin(p.life * 0.02) * 0.1; p.y += p.vy; p.life--;
        if (p.life <= 0 || p.y < 0 || p.x < 0 || p.x > CW) {
          p.x = Math.random() * CW; p.y = CH + 10; p.life = 300 + Math.random() * 300;
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,160,60,${p.alpha * 0.3})`; ctx.fill();
      }

      // Tick interactions
      for (const [id, inter] of Object.entries(interactionsRef.current)) {
        inter.ttl--;
        if (inter.ttl <= 0) delete interactionsRef.current[id];
      }

      // Agents
      const sortedAgents = [...agents].sort((a, b) => (pos[a.id]?.y || 0) - (pos[b.id]?.y || 0));
      for (const agent of sortedAgents) {
        const p = pos[agent.id];
        if (!p) continue;
        if (agent.status !== "sleeping") {
          if (p.wait > 0) { p.wait--; p.moving = false; }
          else {
            const dx = p.tx - p.x, dy = p.ty - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 3) { pickTarget(agent.id, agent.room); p.moving = false; }
            else { p.x += (dx / dist) * p.speed; p.y += (dy / dist) * p.speed; p.moving = true; }
          }
        }
        const vis = AGENT_VISUALS[agents.indexOf(agent) % AGENT_VISUALS.length];
        const st = STATUS_CFG[agent.status] || STATUS_CFG.idle;
        const inter = interactionsRef.current[agent.id];
        drawCharacter(ctx, p.x, p.y, vis, st.color, frame,
          selectedAgent?.id === agent.id, hoveredAgent === agent.id,
          agent.name.split(" ")[0], agent.emoji, st.label, p.moving, inter?.icon || null);
      }

      // Vignette
      const vg = ctx.createRadialGradient(CW / 2, CH / 2, CW * 0.3, CW / 2, CH / 2, CW * 0.7);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,0,0,0.25)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, CW, CH);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [agents, selectedAgent, hoveredAgent, pickTarget]);

  const getAgentAt = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sx = CW / rect.width, sy = CH / rect.height;
    const mx = (e.clientX - rect.left) * sx, my = (e.clientY - rect.top) * sy;
    const pos = agentPosRef.current;
    for (const agent of agents) {
      const p = pos[agent.id];
      if (!p) continue;
      if (Math.abs(mx - p.x) < 30 && Math.abs(my - p.y) < 45) return agent;
    }
    return null;
  }, [agents]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const agent = getAgentAt(e);
    setSelectedAgent(agent);
  }, [getAgentAt]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const agent = getAgentAt(e);
    setHoveredAgent(agent?.id || null);
    setMousePos({ x: e.clientX, y: e.clientY });
    if (canvasRef.current) canvasRef.current.style.cursor = agent ? "pointer" : "default";
  }, [getAgentAt]);

  const activeCount = agents.filter(a => a.status === "active" || a.status === "working").length;

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: "calc(100vh - 56px)" }}>
      {/* ═══ HEADBAR — System Navigation ═══ */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 h-10"
        style={{ background: "rgba(8,12,20,0.88)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-1.5">
          <span className="text-base mr-1">🏴‍☠️</span>
          <span className="text-[10px] font-bold text-white tracking-wider uppercase mr-3">ESCRITÓRIO VIRTUAL</span>
          <div className="h-4 w-px bg-white/10 mr-2" />
          {MENU_ITEMS.map(item => {
            const isActive = item.href === "/world";
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
                  isActive ? "bg-blue-500/15 text-blue-400" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}>
                <span className="text-xs">{item.icon}</span>
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-green-400 font-mono">{activeCount}/{agents.length} <span className="text-gray-600">ativos</span></span>
          <span className="text-gray-600">●</span>
          <span className="text-gray-500 font-mono">AO VIVO</span>
        </div>
      </div>

      {/* ═══ CANVAS ═══ */}
      <canvas ref={canvasRef} width={CW} height={CH}
        onClick={handleClick} onMouseMove={handleMove}
        className="w-full h-full pt-10"
        style={{ imageRendering: "auto", objectFit: "contain", background: "#7a9960" }} />

      {/* ═══ HOVER TOOLTIP ═══ */}
      <AnimatePresence>
        {hoveredAgent && !selectedAgent && (() => {
          const agent = agents.find(a => a.id === hoveredAgent);
          if (!agent) return null;
          const lvl = getLevelFromXP(agent.xp);
          const st = STATUS_CFG[agent.status] || STATUS_CFG.idle;
          return (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.12 }}
              className="fixed z-50 pointer-events-none"
              style={{ left: mousePos.x + 16, top: mousePos.y - 8 }}
            >
              <div className="rounded-xl p-3 min-w-[200px] shadow-xl"
                style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: "blur(12px)" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{agent.emoji}</span>
                  <div>
                    <div className="text-xs font-bold text-gray-800">{agent.name}</div>
                    <div className="text-[9px] text-gray-500">{agent.department}</div>
                  </div>
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: st.color, background: `${st.color}15` }}>● {st.label}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-600 mb-1">
                  <span>Nv.{lvl.level} {lvl.title}</span>
                  <span>•</span>
                  <span>{agent.xp ?? 0} XP</span>
                  <span>•</span>
                  <span>🔥 {agent.streak_days ?? 0}d</span>
                </div>
                {/* XP bar */}
                <div className="h-1 rounded-full bg-gray-200 overflow-hidden mb-1">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-blue-400" style={{ width: `${lvl.progress}%` }} />
                </div>
                {agent.current_task && (
                  <div className="text-[9px] text-gray-500 mt-1 border-t border-gray-100 pt-1">
                    📋 {agent.current_task}
                  </div>
                )}
                <div className="text-[8px] text-gray-400 mt-1 italic">Clique para detalhes</div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ═══ FLOATING AGENT INSPECTOR (right panel) ═══ */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="absolute top-12 right-3 w-72 max-h-[calc(100vh-120px)] overflow-y-auto z-30 rounded-xl p-4"
            style={{ background: "rgba(10,15,25,0.92)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <AgentInspector agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// AGENT INSPECTOR PANEL
// ══════════════════════════════════════════════════════════
const RARITY_COLORS: Record<string, string> = { common: "#6b7280", rare: "#3b82f6", epic: "#8b5cf6", legendary: "#f59e0b" };

function AgentInspector({ agent, onClose }: { agent: AgentRecord; onClose: () => void }) {
  const lvl = getLevelFromXP(agent.xp);
  const st = STATUS_CFG[agent.status] || STATUS_CFG.idle;
  const vis = AGENT_VISUALS[0]; // fallback

  return (
    <div className="space-y-3 text-xs">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="text-3xl">{agent.emoji}</span>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-ocean-950" style={{ background: st.color }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{agent.name}</h3>
            <p className="text-[10px] text-gray-500 font-mono">{agent.department}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: st.color, background: `${st.color}15` }}>● {st.label}</span>
              <span className="text-purple-400 text-[9px] font-mono">Nv.{lvl.level} {lvl.title}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-white text-lg leading-none">×</button>
      </div>

      {/* Soul */}
      {agent.soul && <p className="text-[10px] text-gray-400 italic border-l-2 border-gray-800 pl-2">&ldquo;{agent.soul}&rdquo;</p>}

      {/* XP bar */}
      <div>
        <div className="flex justify-between text-[8px] text-gray-600 mb-0.5"><span>{agent.xp} XP</span><span>{lvl.nextXP}</span></div>
        <div className="h-1.5 rounded-full bg-ocean-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${lvl.progress}%` }} />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Tarefas", value: agent.tasks_completed ?? 0, c: "text-green-400", icon: "✅" },
          { label: "Sequência", value: `${agent.streak_days ?? 0}d`, c: "text-amber-400", icon: "🔥" },
          { label: "Tokens", value: `${((agent.tokens_today ?? 0) / 1000).toFixed(1)}k`, c: "text-blue-400", icon: "⚡" },
          { label: "Bloqueado", value: agent.tasks_blocked ?? 0, c: "text-red-400", icon: "🚫" },
        ].map(k => (
          <div key={k.label} className="p-2 rounded-lg bg-ocean-900/50 text-center">
            <div className="text-sm">{k.icon}</div>
            <div className={`text-sm font-bold font-mono ${k.c}`}>{k.value}</div>
            <div className="text-[7px] text-gray-600 uppercase">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Stats Bars */}
      <div className="space-y-1.5">
        <h4 className="text-[8px] uppercase tracking-widest text-gray-600 font-mono">Estatísticas</h4>
        {Object.entries(agent.stats ?? { speed: 0, accuracy: 0, versatility: 0, reliability: 0, creativity: 0 }).map(([stat, val]) => (
          <div key={stat} className="flex items-center gap-1.5">
            <span className="text-gray-500 w-16 capitalize text-[9px]">{stat}</span>
            <div className="flex-1 h-1.5 rounded-full bg-ocean-800 overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${val}%`,
                background: val >= 80 ? "linear-gradient(90deg,#10b981,#34d399)" :
                  val >= 60 ? "linear-gradient(90deg,#3b82f6,#60a5fa)" :
                  "linear-gradient(90deg,#f59e0b,#fbbf24)",
              }} />
            </div>
            <span className="text-gray-600 font-mono w-5 text-right text-[9px]">{val}</span>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {(agent.achievements ?? []).length > 0 && (
        <div>
          <h4 className="text-[8px] uppercase tracking-widest text-gray-600 font-mono mb-1">Conquistas</h4>
          <div className="flex flex-wrap gap-1">
            {(agent.achievements ?? []).map(a => (
              <span key={a.id} title={`${a.name}: ${a.description}`}
                className="text-sm p-1 rounded border"
                style={{ borderColor: `${RARITY_COLORS[a.rarity]}30`, background: `${RARITY_COLORS[a.rarity]}08` }}>{a.icon}</span>
            ))}
          </div>
        </div>
      )}

      {/* Current Task */}
      {agent.current_task && (
        <div className="border-t border-glass-border pt-2">
          <h4 className="text-[8px] uppercase text-gray-600 font-mono mb-0.5">Tarefa Atual</h4>
          <p className="text-[10px] text-gray-300 font-mono">{agent.current_task}</p>
        </div>
      )}

      {/* Lifecycle Actions */}
      <div className="border-t border-glass-border pt-2 flex gap-1.5">
        <button className="flex-1 py-1.5 rounded text-[9px] font-mono bg-green-500/10 text-green-400 hover:bg-green-500/20 transition">⬆ Promover</button>
        <button className="flex-1 py-1.5 rounded text-[9px] font-mono bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition">📋 Revisar</button>
        <button className="flex-1 py-1.5 rounded text-[9px] font-mono bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">⛔ Demitir</button>
      </div>
    </div>
  );
}
