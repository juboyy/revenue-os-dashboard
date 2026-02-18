/**
 * Virtual Office — Premium Gather.town-style pixel art office.
 * Rich isometric office with textured floors, detailed furniture,
 * proper pixel-art character sprites, speech bubbles, ambient effects.
 * Data fed from OpenClaw via Zustand store.
 */
"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useDashboardStore } from "../../lib/store";
import { getLevelFromXP } from "../../lib/types";
import type { AgentRecord } from "../../lib/types";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   TILE CONSTANTS
   ═══════════════════════════════════════════════════════════ */
const T = 40;           // px per tile
const MAP_W = 38;       // tiles (expanded for common areas)
const MAP_H = 28;       // tiles
const CW = MAP_W * T;
const CH = MAP_H * T;

/* ═══════════════════════════════════════════════════════════
   ROOM DEFINITIONS — with floor style and richer layout
   ═══════════════════════════════════════════════════════════ */
interface RoomDef {
  id: string; label: string; icon: string; color: string;
  x: number; y: number; w: number; h: number;
  floor: "wood" | "carpet" | "tile" | "stone";
  floorTint: string;
  type?: "office" | "common";  // common areas get special furniture
}

const ROOMS: RoomDef[] = [
  // ── Row 1: Team offices ──
  { id: "ponte-de-comando", label: "Command Bridge",  icon: "⚓", color: "#f59e0b", x: 1,  y: 1,  w: 8,  h: 6, floor: "wood",   floorTint: "#2a1f14" },
  { id: "forja",            label: "Engineering",      icon: "⚔️", color: "#3b82f6", x: 10, y: 1,  w: 8,  h: 6, floor: "tile",   floorTint: "#141e2e" },
  { id: "tesouraria",       label: "Treasury",         icon: "💎", color: "#10b981", x: 19, y: 1,  w: 8,  h: 6, floor: "carpet", floorTint: "#0d2818" },

  // ── Common Area: Meeting Room (top right) ──
  { id: "sala-reuniao",     label: "Meeting Room",     icon: "🤝", color: "#60a5fa", x: 28, y: 1,  w: 9,  h: 8, floor: "carpet", floorTint: "#0f1a2e", type: "common" },

  // ── Row 2: Team offices ──
  { id: "laboratorio",      label: "Analytics Lab",    icon: "🔬", color: "#06b6d4", x: 1,  y: 8,  w: 8,  h: 6, floor: "tile",   floorTint: "#0d1f24" },
  { id: "estaleiro",        label: "Architecture",     icon: "🏗️", color: "#8b5cf6", x: 10, y: 8,  w: 8,  h: 6, floor: "stone",  floorTint: "#1a152e" },
  { id: "biblioteca",       label: "Library",          icon: "📚", color: "#ec4899", x: 19, y: 8,  w: 8,  h: 6, floor: "wood",   floorTint: "#2a1420" },

  // ── Common Area: Central Lobby (center) ──
  { id: "lobby",            label: "Central Lobby",    icon: "🏛️", color: "#94a3b8", x: 10, y: 15, w: 10, h: 7, floor: "tile",   floorTint: "#121824", type: "common" },

  // ── Row 3: Team offices ──
  { id: "sala-de-maquinas", label: "Engine Room",      icon: "⚙️", color: "#ef4444", x: 1,  y: 15, w: 8,  h: 6, floor: "stone",  floorTint: "#2a1414" },
  { id: "torre-de-vigia",   label: "Watchtower",       icon: "🔭", color: "#f97316", x: 21, y: 15, w: 8,  h: 6, floor: "wood",   floorTint: "#2a2014" },

  // ── Common Area: Café / Break Room (bottom right) ──
  { id: "cafe",             label: "Café & Lounge",    icon: "☕", color: "#a78bfa", x: 28, y: 10, w: 9,  h: 8, floor: "wood",   floorTint: "#1e1418", type: "common" },

  // ── Extra office ──
  { id: "cozinha",          label: "Comms Center",     icon: "📡", color: "#a855f7", x: 1,  y: 22, w: 8,  h: 5, floor: "carpet", floorTint: "#1e142a" },

  // ── Common Area: Garden / Relaxation ──
  { id: "jardim",           label: "Zen Garden",       icon: "🌿", color: "#4ade80", x: 10, y: 23, w: 10, h: 4, floor: "stone",  floorTint: "#0d1f14", type: "common" },

  // ── Extra office (billing) ──
  { id: "billing-room",     label: "Billing Office",   icon: "🎯", color: "#fb923c", x: 21, y: 22, w: 8,  h: 5, floor: "tile",   floorTint: "#2a1f0e" },

  // ── Auditorium / All-Hands ──
  { id: "auditorio",        label: "All-Hands Arena",  icon: "🎪", color: "#fbbf24", x: 28, y: 19, w: 9,  h: 8, floor: "carpet", floorTint: "#2a2010", type: "common" },
];

const STATUS_CFG: Record<string, { color: string; label: string; glow: boolean }> = {
  active:   { color: "#10b981", label: "Active",   glow: true  },
  working:  { color: "#f59e0b", label: "Working",  glow: true  },
  idle:     { color: "#6b7280", label: "Idle",      glow: false },
  error:    { color: "#ef4444", label: "Error",     glow: true  },
  sleeping: { color: "#374151", label: "Sleeping",  glow: false },
};

/* ═══════════════════════════════════════════════════════════
   FLOOR DRAWING — wood planks, carpet weave, tiles, stone
   ═══════════════════════════════════════════════════════════ */
function drawFloorTile(ctx: CanvasRenderingContext2D, px: number, py: number, style: RoomDef["floor"], tint: string, tx: number, ty: number) {
  ctx.fillStyle = tint;
  ctx.fillRect(px, py, T, T);

  if (style === "wood") {
    // Wood plank lines
    ctx.strokeStyle = "rgba(255,200,100,0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const yy = py + i * 10 + ((tx * 3) % 5);
      ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px + T, yy); ctx.stroke();
    }
    // Wood grain dots
    if ((tx + ty) % 3 === 0) {
      ctx.fillStyle = "rgba(255,180,80,0.04)";
      ctx.fillRect(px + 8, py + 4, 24, 8);
    }
  } else if (style === "carpet") {
    // Carpet weave pattern
    ctx.fillStyle = "rgba(255,255,255,0.015)";
    for (let cx2 = 0; cx2 < T; cx2 += 4) {
      for (let cy = 0; cy < T; cy += 4) {
        if ((cx2 + cy + tx * 2 + ty * 3) % 8 < 4) {
          ctx.fillRect(px + cx2, py + cy, 2, 2);
        }
      }
    }
  } else if (style === "tile") {
    // Clean tile grid
    ctx.strokeStyle = "rgba(100,200,255,0.04)";
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 1, py + 1, T - 2, T - 2);
    // Tile shine
    if ((tx + ty) % 4 === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.015)";
      ctx.fillRect(px + 4, py + 4, 8, 8);
    }
  } else {
    // Stone - irregular blocks
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    const ox = (tx * 7) % 3;
    ctx.strokeRect(px + ox, py + 1, T / 2 - ox, T / 2);
    ctx.strokeRect(px + T / 2, py, T / 2, T / 2 + 2);
    ctx.strokeRect(px, py + T / 2 + 1, T / 2 + ox, T / 2 - 2);
    ctx.strokeRect(px + T / 2 + ox, py + T / 2, T / 2 - ox, T / 2);
  }
}

/* ═══════════════════════════════════════════════════════════
   WALL DRAWING — 3D-ish walls with thickness
   ═══════════════════════════════════════════════════════════ */
function drawRoomWalls(ctx: CanvasRenderingContext2D, room: RoomDef) {
  const rx = room.x * T, ry = room.y * T;
  const rw = room.w * T, rh = room.h * T;
  const wt = 4; // wall thickness

  // Wall shadow (depth effect)
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(rx - 2, ry - 2, rw + 4, wt + 2);           // top
  ctx.fillRect(rx - 2, ry, wt + 2, rh);                     // left
  ctx.fillRect(rx + rw - wt, ry, wt + 2, rh);               // right
  ctx.fillRect(rx - 2, ry + rh - wt, rw + 4, wt + 2);      // bottom

  // Wall fill
  ctx.fillStyle = "#1a1f2e";
  ctx.fillRect(rx, ry, rw, wt);           // top
  ctx.fillRect(rx, ry, wt, rh);           // left
  ctx.fillRect(rx + rw - wt, ry, wt, rh); // right
  ctx.fillRect(rx, ry + rh - wt, rw, wt); // bottom

  // Room color accent - top wall glow
  const g = ctx.createLinearGradient(rx, ry, rx, ry + 20);
  g.addColorStop(0, `${room.color}30`);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(rx + wt, ry + wt, rw - wt * 2, 16);

  // Door opening (center bottom)
  ctx.fillStyle = room.floorTint;
  const doorX = rx + rw / 2 - 16;
  ctx.fillRect(doorX, ry + rh - wt, 32, wt);

  // Room label plate
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(rx + wt + 4, ry + wt + 2, 120, 18);
  ctx.fillStyle = `${room.color}cc`;
  ctx.font = "bold 10px 'Segoe UI', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${room.icon} ${room.label}`, rx + wt + 8, ry + wt + 14);
}

/* ═══════════════════════════════════════════════════════════
   FURNITURE DRAWING — desks, chairs, monitors, plants, shelves
   ═══════════════════════════════════════════════════════════ */
function drawFurniture(ctx: CanvasRenderingContext2D, room: RoomDef, frame: number) {
  const rx = room.x * T + 4, ry = room.y * T + 4;
  const rw = room.w * T - 8;

  const drawDesk = (x: number, y: number) => {
    // Desk shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x + 2, y + 18, 52, 4);
    // Desk top (wood)
    ctx.fillStyle = "#3d2b1f";
    ctx.fillRect(x, y + 6, 54, 12);
    ctx.fillStyle = "#4a3625";
    ctx.fillRect(x + 1, y + 7, 52, 10);
    // Desk legs
    ctx.fillStyle = "#2d1f14";
    ctx.fillRect(x + 2, y + 18, 4, 6);
    ctx.fillRect(x + 48, y + 18, 4, 6);
    // Monitor
    ctx.fillStyle = "#0a0e18";
    ctx.fillRect(x + 14, y - 8, 26, 16);
    ctx.fillStyle = "#1a2a4a";
    ctx.fillRect(x + 15, y - 7, 24, 14);
    // Screen content (animated)
    const screenColor = Math.sin(frame * 0.05 + x) > 0 ? "#3b82f640" : "#10b98140";
    ctx.fillStyle = screenColor;
    ctx.fillRect(x + 16, y - 6, 22, 12);
    // Screen lines (code)
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    for (let i = 0; i < 4; i++) {
      const w = 4 + ((x + i * 7) % 12);
      ctx.fillRect(x + 18, y - 4 + i * 3, w, 1);
    }
    // Monitor stand
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x + 24, y + 8, 6, 4);
    // Keyboard
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x + 16, y + 10, 22, 4);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let kx = 0; kx < 18; kx += 3) {
      ctx.fillRect(x + 18 + kx, y + 11, 2, 2);
    }
  };

  const drawChair = (x: number, y: number, color: string) => {
    // Chair shadow
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(x + 8, y + 14, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Seat
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 2, 16, 10);
    ctx.fillStyle = `${color}cc`;
    ctx.fillRect(x + 1, y + 3, 14, 8);
    // Back
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y - 6, 12, 10);
  };

  const drawPlant = (x: number, y: number, size: number) => {
    // Pot
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x + size / 2 - 6, y + size - 8, 12, 8);
    ctx.fillStyle = "#A0522D";
    ctx.fillRect(x + size / 2 - 7, y + size - 9, 14, 3);
    // Soil
    ctx.fillStyle = "#3E2723";
    ctx.fillRect(x + size / 2 - 5, y + size - 9, 10, 2);
    // Leaves (animated sway)
    const sway = Math.sin(frame * 0.03 + x) * 1.5;
    ctx.fillStyle = "#2d6a4f";
    ctx.beginPath();
    ctx.ellipse(x + size / 2 + sway, y + size / 2 - 4, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#40916c";
    ctx.beginPath();
    ctx.ellipse(x + size / 2 - 3 + sway, y + size / 2 - 6, 6, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#52b788";
    ctx.beginPath();
    ctx.ellipse(x + size / 2 + 3 + sway, y + size / 2 - 8, 5, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBookshelf = (x: number, y: number) => {
    // Shelf frame
    ctx.fillStyle = "#3d2b1f";
    ctx.fillRect(x, y, 40, 36);
    ctx.fillStyle = "#2a1f14";
    ctx.fillRect(x + 2, y + 2, 36, 10);
    ctx.fillRect(x + 2, y + 14, 36, 10);
    ctx.fillRect(x + 2, y + 26, 36, 8);
    // Books (colorful)
    const bookColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
    for (let row = 0; row < 3; row++) {
      for (let b = 0; b < 6; b++) {
        const bx = x + 4 + b * 6;
        const by = y + 3 + row * 12;
        const bh = 7 + (b % 3);
        ctx.fillStyle = bookColors[(b + row * 3) % bookColors.length];
        ctx.fillRect(bx, by + (9 - bh), 4, bh);
      }
    }
  };

  const drawWhiteboard = (x: number, y: number) => {
    // Board
    ctx.fillStyle = "#374151";
    ctx.fillRect(x, y, 48, 30);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(x + 2, y + 2, 44, 26);
    // Content (sticky notes)
    const colors = ["#fef08a", "#bfdbfe", "#bbf7d0", "#fecaca"];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = colors[i];
      ctx.fillRect(x + 4 + (i % 2) * 22, y + 4 + Math.floor(i / 2) * 14, 18, 10);
    }
    // Marker tray
    ctx.fillStyle = "#6b7280";
    ctx.fillRect(x + 8, y + 30, 32, 3);
  };

  const drawRug = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = `${color}15`;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = `${color}25`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
    ctx.strokeStyle = `${color}15`;
    ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  };

  // ── Conference table (for meeting rooms) ──
  const drawConferenceTable = (x: number, y: number) => {
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(x + 4, y + 4, 120, 54);
    ctx.fillStyle = "#3d2b1f";
    ctx.fillRect(x, y, 120, 50);
    ctx.fillStyle = "#4a3625";
    ctx.fillRect(x + 3, y + 3, 114, 44);
    // Table highlight
    ctx.fillStyle = "rgba(255,200,100,0.04)";
    ctx.fillRect(x + 10, y + 8, 100, 34);
    // Center accent line
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(x + 50, y + 5, 20, 40);
  };

  // ── Sofa (for lobby/café) ──
  const drawSofa = (x: number, y: number, horizontal: boolean, color: string) => {
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    if (horizontal) {
      ctx.fillRect(x + 2, y + 18, 64, 4);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 64, 16);
      ctx.fillStyle = `${color}cc`;
      ctx.fillRect(x + 2, y + 2, 60, 12);
      // Armrests
      ctx.fillStyle = color;
      ctx.fillRect(x - 4, y, 6, 16);
      ctx.fillRect(x + 62, y, 6, 16);
      // Back
      ctx.fillStyle = `${color}aa`;
      ctx.fillRect(x, y - 6, 64, 8);
      // Cushion lines
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + 21, y + 2); ctx.lineTo(x + 21, y + 14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 42, y + 2); ctx.lineTo(x + 42, y + 14); ctx.stroke();
    } else {
      ctx.fillRect(x + 2, y + 2, 4, 56);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 16, 52);
      ctx.fillStyle = `${color}cc`;
      ctx.fillRect(x + 2, y + 2, 12, 48);
    }
  };

  // ── Water cooler ──
  const drawWaterCooler = (x: number, y: number) => {
    ctx.fillStyle = "#475569";
    ctx.fillRect(x + 2, y + 16, 12, 18);
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(x, y, 16, 18);
    ctx.fillStyle = "#60a5fa90";
    ctx.fillRect(x + 3, y + 2, 10, 12);
    // Animated water bubble
    const bubbleY = y + 4 + ((frame * 0.3 + x) % 8);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(x + 6, bubbleY, 2, 2);
  };

  // ── Coffee machine (for café) ──
  const drawCoffeeMachine = (x: number, y: number) => {
    ctx.fillStyle = "#374151";
    ctx.fillRect(x, y, 24, 28);
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(x + 2, y + 2, 20, 14);
    // Steam (animated)
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    for (let i = 0; i < 3; i++) {
      const sy = y - 4 - i * 4 - ((frame * 0.15 + i * 2) % 6);
      ctx.beginPath();
      ctx.arc(x + 12 + Math.sin(frame * 0.04 + i) * 3, sy, 2 + i, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cup
    ctx.fillStyle = "#d1d5db";
    ctx.fillRect(x + 8, y + 18, 8, 8);
    ctx.fillStyle = "#92400e";
    ctx.fillRect(x + 9, y + 19, 6, 5);
  };

  // ── Café counter ──
  const drawCafeCounter = (x: number, y: number) => {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x + 3, y + 18, 84, 4);
    ctx.fillStyle = "#3d2b1f";
    ctx.fillRect(x, y, 84, 16);
    ctx.fillStyle = "#5a3e28";
    ctx.fillRect(x + 2, y + 2, 80, 12);
    // Bar stools
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(x + 8 + i * 28, y + 20, 12, 10);
      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(x + 7 + i * 28, y + 18, 14, 4);
    }
  };

  // ── Small round table (for café/lounge) ──
  const drawBistroTable = (x: number, y: number) => {
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(x + 10, y + 14, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a3625";
    ctx.beginPath();
    ctx.ellipse(x + 10, y, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5a4635";
    ctx.beginPath();
    ctx.ellipse(x + 10, y, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stand
    ctx.fillStyle = "#374151";
    ctx.fillRect(x + 8, y + 4, 4, 12);
  };

  // ── Pond / water feature (garden) ──
  const drawPond = (x: number, y: number) => {
    ctx.fillStyle = "rgba(59,130,246,0.1)";
    ctx.beginPath();
    ctx.ellipse(x + 30, y + 18, 30, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(59,130,246,0.15)";
    ctx.beginPath();
    ctx.ellipse(x + 30, y + 18, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ripples
    ctx.strokeStyle = "rgba(147,197,253,0.15)";
    ctx.lineWidth = 1;
    const r = 8 + Math.sin(frame * 0.04) * 4;
    ctx.beginPath();
    ctx.ellipse(x + 30, y + 18, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  };

  // ── Bamboo / tall plant (garden) ──
  const drawBamboo = (x: number, y: number) => {
    const sway = Math.sin(frame * 0.02 + x * 0.1) * 2;
    for (let i = 0; i < 3; i++) {
      const bx = x + i * 8;
      ctx.fillStyle = "#2d6a4f";
      ctx.fillRect(bx + sway * 0.5, y, 3, 30);
      ctx.fillStyle = "#40916c";
      for (let l = 0; l < 3; l++) {
        ctx.beginPath();
        ctx.ellipse(bx + 1 + sway + (l % 2 === 0 ? -6 : 6), y + 4 + l * 8, 6, 3, (l % 2 === 0 ? -0.3 : 0.3), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // ── Auditorium seats ──
  const drawAuditoriumSeats = (x: number, y: number, rows: number, cols: number) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = x + c * 18;
        const sy = y + r * 22;
        ctx.fillStyle = "#4a3625";
        ctx.fillRect(sx, sy + 4, 14, 10);
        ctx.fillStyle = "#5a4635";
        ctx.fillRect(sx + 1, sy + 5, 12, 8);
        ctx.fillStyle = "#4a3625";
        ctx.fillRect(sx + 2, sy, 10, 6);
      }
    }
    // Stage/podium
    ctx.fillStyle = "#374151";
    ctx.fillRect(x + cols * 18 + 10, y + 6, 40, rows * 22 - 12);
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(x + cols * 18 + 12, y + 8, 36, rows * 22 - 16);
    // Projector screen
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x + cols * 18 + 14, y + 10, 32, 20);
    ctx.fillStyle = `rgba(59,130,246,${0.1 + Math.sin(frame * 0.03) * 0.05})`;
    ctx.fillRect(x + cols * 18 + 16, y + 12, 28, 16);
  };

  // ── Reception desk ──
  const drawReceptionDesk = (x: number, y: number) => {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x + 3, y + 16, 74, 4);
    // L-shaped desk
    ctx.fillStyle = "#374151";
    ctx.fillRect(x, y, 72, 14);
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(x + 2, y + 2, 68, 10);
    ctx.fillStyle = "#374151";
    ctx.fillRect(x, y + 14, 24, 24);
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(x + 2, y + 16, 20, 20);
    // Monitor on desk
    ctx.fillStyle = "#0a0e18";
    ctx.fillRect(x + 32, y - 6, 18, 10);
    ctx.fillStyle = "#1a2a4a";
    ctx.fillRect(x + 33, y - 5, 16, 8);
  };

  // ══════════════════════ PLACE FURNITURE ══════════════════════
  if (room.type === "common") {
    // COMMON AREA FURNITURE
    if (room.id === "sala-reuniao") {
      // Meeting Room: conference table + chairs around it
      drawRug(rx + 20, ry + 40, rw - 40, room.h * T - 80, room.color);
      drawConferenceTable(rx + rw / 2 - 60, ry + room.h * T / 2 - 20);
      // Chairs around table (4 each side)
      for (let i = 0; i < 4; i++) {
        drawChair(rx + rw / 2 - 54 + i * 30, ry + room.h * T / 2 - 44, "#4b5563");
        drawChair(rx + rw / 2 - 54 + i * 30, ry + room.h * T / 2 + 36, "#4b5563");
      }
      drawWhiteboard(rx + 16, ry + 28);
      drawPlant(rx + rw - 36, ry + 28, 20);
      drawPlant(rx + rw - 36, ry + room.h * T - 48, 20);

    } else if (room.id === "lobby") {
      // Central Lobby: reception desk, sofas, water cooler, plants
      drawRug(rx + rw / 2 - 60, ry + 40, 120, room.h * T - 80, room.color);
      drawReceptionDesk(rx + 20, ry + 40);
      drawSofa(rx + rw / 2 - 32, ry + room.h * T - 80, true, "#475569");
      drawSofa(rx + rw / 2 - 32, ry + room.h * T - 56, true, "#475569");
      drawWaterCooler(rx + rw - 40, ry + 36);
      drawPlant(rx + 16, ry + room.h * T - 50, 24);
      drawPlant(rx + rw - 40, ry + room.h * T - 50, 24);
      // Notice board
      drawWhiteboard(rx + rw - 70, ry + 30);

    } else if (room.id === "cafe") {
      // Café: counter, coffee machine, bistro tables, stools
      drawRug(rx + 16, ry + 30, rw - 32, 60, room.color);
      drawCafeCounter(rx + 16, ry + 36);
      drawCoffeeMachine(rx + rw - 44, ry + 30);
      // Bistro tables scattered
      drawBistroTable(rx + 30, ry + room.h * T - 80);
      drawBistroTable(rx + 80, ry + room.h * T - 80);
      drawBistroTable(rx + rw - 60, ry + room.h * T - 80);
      drawChair(rx + 22, ry + room.h * T - 60, "#6b7280");
      drawChair(rx + 72, ry + room.h * T - 60, "#6b7280");
      drawChair(rx + rw - 68, ry + room.h * T - 60, "#6b7280");
      drawPlant(rx + 12, ry + room.h * T - 46, 18);

    } else if (room.id === "jardim") {
      // Zen Garden: pond, bamboo, plants, stones
      drawPond(rx + rw / 2 - 30, ry + 20);
      drawBamboo(rx + 20, ry + 16);
      drawBamboo(rx + rw - 44, ry + 16);
      drawPlant(rx + 60, ry + room.h * T - 48, 26);
      drawPlant(rx + rw - 60, ry + 60, 22);
      // Stepping stones
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(rx + 30 + i * 20, ry + room.h * T - 22, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (room.id === "auditorio") {
      // All-Hands Arena: rows of seats, podium, screen
      drawRug(rx + 12, ry + 30, rw - 24, room.h * T - 60, room.color);
      drawAuditoriumSeats(rx + 20, ry + 40, 4, 6);
      drawPlant(rx + 12, ry + 28, 18);
      drawPlant(rx + rw - 32, ry + 28, 18);
    }
  } else {
    // OFFICE FURNITURE (original behavior)
    drawRug(rx + rw / 2 - 50, ry + room.h * T / 2 - 30, 100, 60, room.color);
    drawDesk(rx + 20, ry + 60);
    drawDesk(rx + rw - 80, ry + 60);
    drawChair(rx + 32, ry + 90, `${room.color}90`);
    drawChair(rx + rw - 68, ry + 90, `${room.color}90`);
    drawPlant(rx + rw - 40, ry + 28, 20);
    if (room.floor === "wood" || room.floor === "carpet") {
      drawBookshelf(rx + rw - 56, ry + room.h * T - 60);
    } else {
      drawWhiteboard(rx + 12, ry + 28);
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   CHARACTER SPRITES — proper pixel art body
   ═══════════════════════════════════════════════════════════ */
const SKIN_TONES = ["#ffd5a0", "#e8b88a", "#c68e6a", "#a0724a", "#ffecd2", "#deb887"];
const HAIR_STYLES = ["#1a1a2e", "#4a3728", "#8B4513", "#DAA520", "#2c1810", "#800020", "#2d3436", "#d63031", "#6c5ce7"];

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  px: number, py: number,
  color: string, statusColor: string,
  frame: number, isSelected: boolean, isHovered: boolean,
  name: string, emoji: string, currentTask: string | null,
  agentIndex: number, isMoving: boolean,
) {
  const bounce = isMoving ? Math.sin(frame * 0.2) * 2 : Math.sin(frame * 0.06) * 0.5;
  const skin = SKIN_TONES[agentIndex % SKIN_TONES.length];
  const hair = HAIR_STYLES[agentIndex % HAIR_STYLES.length];

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(px, py + 18, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Selection / hover ring
  if (isSelected || isHovered) {
    ctx.beginPath();
    ctx.ellipse(px, py + 18, 14, 5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = isSelected ? "#3b82f6" : "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash(isSelected ? [4, 3] : []);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const by = py + bounce; // bounced y

  // Feet
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(px - 6, by + 12, 5, 4);
  ctx.fillRect(px + 1, by + 12, 5, 4);

  // Legs
  ctx.fillStyle = "#374151";
  ctx.fillRect(px - 5, by + 6, 4, 7);
  ctx.fillRect(px + 1, by + 6, 4, 7);

  // Body (shirt)
  ctx.fillStyle = color;
  ctx.fillRect(px - 7, by - 6, 14, 14);
  // Shirt detail
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(px - 1, by - 4, 2, 10);
  // Arms
  ctx.fillStyle = color;
  ctx.fillRect(px - 10, by - 4, 4, 10);
  ctx.fillRect(px + 6, by - 4, 4, 10);
  // Hands
  ctx.fillStyle = skin;
  ctx.fillRect(px - 10, by + 4, 4, 4);
  ctx.fillRect(px + 6, by + 4, 4, 4);

  // Head
  ctx.fillStyle = skin;
  ctx.fillRect(px - 6, by - 18, 12, 14);
  // Face detail
  // Eyes
  ctx.fillStyle = "#1a1a2e";
  const blink = Math.sin(frame * 0.08 + agentIndex * 2) > 0.95;
  if (!blink) {
    ctx.fillRect(px - 4, by - 12, 3, 3);
    ctx.fillRect(px + 1, by - 12, 3, 3);
    // Eye whites
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px - 3, by - 11, 1, 1);
    ctx.fillRect(px + 2, by - 11, 1, 1);
  } else {
    ctx.fillRect(px - 4, by - 11, 3, 1);
    ctx.fillRect(px + 1, by - 11, 3, 1);
  }
  // Mouth
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(px - 2, by - 7, 4, 1);

  // Hair
  ctx.fillStyle = hair;
  ctx.fillRect(px - 7, by - 20, 14, 5);
  ctx.fillRect(px - 7, by - 18, 3, 8);
  ctx.fillRect(px + 4, by - 18, 3, 4);

  // Status indicator
  ctx.beginPath();
  ctx.arc(px + 10, by - 18, 4, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();
  ctx.strokeStyle = "#0d1117";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Status glow pulse
  if (STATUS_CFG[Object.keys(STATUS_CFG).find(k => STATUS_CFG[k].color === statusColor) || "idle"]?.glow) {
    ctx.beginPath();
    ctx.arc(px + 10, by - 18, 6 + Math.sin(frame * 0.1) * 2, 0, Math.PI * 2);
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3 + Math.sin(frame * 0.1) * 0.2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Emoji above head
  ctx.font = "14px serif";
  ctx.textAlign = "center";
  ctx.fillText(emoji, px, by - 24);

  // Name tag
  const nameWidth = ctx.measureText(name).width;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(px - nameWidth / 2 - 6, py + 22, nameWidth + 12, 14);
  ctx.fillStyle = isSelected ? "#60a5fa" : isHovered ? "#ffffff" : "#d1d5db";
  ctx.font = "bold 9px 'Segoe UI', sans-serif";
  ctx.fillText(name, px, py + 32);

  // Speech bubble with current task (on hover or select)
  if ((isSelected || isHovered) && currentTask) {
    const bubbleText = currentTask.length > 35 ? currentTask.slice(0, 33) + "…" : currentTask;
    const tw = ctx.measureText(bubbleText).width + 16;
    const bx = px - tw / 2;
    const bby = by - 44;

    // Bubble
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.roundRect(bx, bby, tw, 18, 6);
    ctx.fill();
    // Bubble tail
    ctx.beginPath();
    ctx.moveTo(px - 4, bby + 18);
    ctx.lineTo(px, bby + 24);
    ctx.lineTo(px + 4, bby + 18);
    ctx.fill();
    // Text
    ctx.fillStyle = "#1e293b";
    ctx.font = "8px 'Segoe UI', sans-serif";
    ctx.fillText(bubbleText, px, bby + 12);
  }
}

/* ═══════════════════════════════════════════════════════════
   AMBIENT EFFECTS — particles, light rays
   ═══════════════════════════════════════════════════════════ */
interface Particle { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number }

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * CW,
    y: Math.random() * CH,
    vx: (Math.random() - 0.5) * 0.15,
    vy: -Math.random() * 0.1 - 0.02,
    size: Math.random() * 2 + 0.5,
    alpha: Math.random() * 0.3 + 0.1,
    life: Math.random() * 500 + 200,
  }));
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function WorldPage() {
  const { agents, tasks } = useDashboardStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState<{x:number;y:number}>({x:0,y:0});
  const frameRef = useRef(0);
  const particlesRef = useRef<Particle[]>(createParticles(60));
  const agentPosRef = useRef<Record<string, {
    x: number; y: number; tx: number; ty: number;
    speed: number; wait: number; moving: boolean;
    currentRoom: string; // agents can be in ANY room
  }>>({});

  // Init agent positions — start in their home room
  useEffect(() => {
    const pos = agentPosRef.current;
    agents.forEach((agent, i) => {
      if (pos[agent.id]) return;
      const room = ROOMS.find(r => r.id === agent.room) || ROOMS[i % ROOMS.length];
      const cx = (room.x + room.w / 2) * T;
      const cy = (room.y + room.h / 2) * T + 20;
      const off = (dim: number) => (Math.random() - 0.5) * dim * 0.4;
      pos[agent.id] = {
        x: cx + off(room.w * T), y: cy + off(room.h * T),
        tx: cx + off(room.w * T), ty: cy + off(room.h * T),
        speed: 0.5 + Math.random() * 0.4,
        wait: Math.random() * 120,
        moving: false,
        currentRoom: room.id,
      };
    });
  }, [agents]);

  // Pick next target — 30% chance to visit a different room (common areas preferred)
  const pickTarget = useCallback((id: string, homeRoomId: string) => {
    const p = agentPosRef.current[id];
    if (!p) return;
    const shouldRoam = Math.random() < 0.3;
    let targetRoom: RoomDef;
    if (shouldRoam) {
      const commonRooms = ROOMS.filter(r => r.type === "common");
      const otherRooms = ROOMS.filter(r => r.id !== p.currentRoom);
      const pool = Math.random() < 0.6 ? commonRooms : otherRooms;
      targetRoom = pool[Math.floor(Math.random() * pool.length)] || ROOMS[0];
    } else {
      targetRoom = ROOMS.find(r => r.id === homeRoomId) || ROOMS[0];
    }
    const m = T * 2;
    p.tx = targetRoom.x * T + m + Math.random() * (targetRoom.w * T - m * 2);
    p.ty = targetRoom.y * T + m + 20 + Math.random() * (targetRoom.h * T - m * 2 - 20);
    p.wait = 80 + Math.random() * 250;
    p.currentRoom = targetRoom.id;
  }, []);

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

      // Background
      ctx.fillStyle = "#080c14";
      ctx.fillRect(0, 0, CW, CH);

      // Hallway floor
      for (let x = 0; x < MAP_W; x++) {
        for (let y = 0; y < MAP_H; y++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? "#0c1018" : "#0e1220";
          ctx.fillRect(x * T, y * T, T, T);
        }
      }

      // Room floors + walls + furniture
      for (const room of ROOMS) {
        for (let tx = room.x; tx < room.x + room.w; tx++) {
          for (let ty = room.y; ty < room.y + room.h; ty++) {
            drawFloorTile(ctx, tx * T, ty * T, room.floor, room.floorTint, tx, ty);
          }
        }
        drawRoomWalls(ctx, room);
        drawFurniture(ctx, room, frame);
      }

      // Particles
      const parts = particlesRef.current;
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0 || p.y < 0 || p.x < 0 || p.x > CW) {
          p.x = Math.random() * CW; p.y = CH + 10; p.life = 300 + Math.random() * 300;
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.5})`; ctx.fill();
      }

      // Update + draw agents (sorted by y for depth)
      const pos = agentPosRef.current;
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
        const room = ROOMS.find(r => r.id === p.currentRoom) || ROOMS.find(r => r.id === agent.room);
        const st = STATUS_CFG[agent.status] || STATUS_CFG.idle;
        const idx = agents.indexOf(agent);
        drawCharacter(ctx, p.x, p.y, room?.color || "#6b7280", st.color, frame,
          selectedAgent?.id === agent.id, hoveredAgent === agent.id,
          agent.name.split(" ")[0], agent.emoji, agent.current_task, idx, p.moving);
      }

      // Inter-agent interaction bubbles
      const agentArr = agents.filter(a => pos[a.id]);
      for (let i = 0; i < agentArr.length; i++) {
        for (let j = i + 1; j < agentArr.length; j++) {
          const pa = pos[agentArr[i].id], pb = pos[agentArr[j].id];
          if (!pa || !pb) continue;
          const d = Math.sqrt((pa.x - pb.x) ** 2 + (pa.y - pb.y) ** 2);
          if (d < 80 && !pa.moving && !pb.moving) {
            // Draw chat indicator between them
            const mx2 = (pa.x + pb.x) / 2, my2 = (pa.y + pb.y) / 2 - 30;
            ctx.fillStyle = "rgba(59,130,246,0.3)";
            ctx.beginPath();
            ctx.ellipse(mx2, my2, 12 + Math.sin(frame * 0.08) * 3, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.font = "10px serif";
            ctx.textAlign = "center";
            ctx.fillText("💬", mx2, my2 + 4);
          }
        }
      }

      // Vignette
      const vg = ctx.createRadialGradient(CW / 2, CH / 2, CW * 0.3, CW / 2, CH / 2, CW * 0.7);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,0,0,0.3)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, CW, CH);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [agents, selectedAgent, hoveredAgent, pickTarget]);

  // Click + hover
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
      if (Math.abs(mx - p.x) < 16 && Math.abs(my - p.y) < 24) return agent;
    }
    return null;
  }, [agents]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const agent = getAgentAt(e);
    setSelectedAgent(agent);
    if (agent) setPopupPos({ x: e.clientX, y: e.clientY });
  }, [getAgentAt]);

  const handleMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const agent = getAgentAt(e);
    setHoveredAgent(agent?.id || null);
    if (canvasRef.current) canvasRef.current.style.cursor = agent ? "pointer" : "default";
  }, [getAgentAt]);

  // Stats
  const activeCount = agents.filter(a => a.status === "active" || a.status === "working").length;
  const crewXP = agents.reduce((s, a) => s + a.xp, 0);
  const inProgress = tasks.filter(t => t.status === "in_progress").length;

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: "calc(100vh - 56px)" }}>
      {/* ═══ HEADBAR ═══ */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2"
        style={{ background: "rgba(8,12,20,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">
          <span className="text-xl">🏴‍☠️</span>
          <div>
            <h1 className="text-sm font-bold text-white">Thousand Sunny — Virtual Office</h1>
            <p className="text-[9px] text-gray-600 font-mono">GATHER ● {agents.length} AGENTS ● {activeCount} ACTIVE ● LIVE</p>
          </div>
        </div>

        {/* Agent avatar strip */}
        <div className="flex items-center gap-1">
          {agents.map(a => {
            const st = STATUS_CFG[a.status] || STATUS_CFG.idle;
            return (
              <button key={a.id} onClick={() => { setSelectedAgent(a); setPopupPos({ x: 400, y: 100 }); }}
                title={`${a.name} — ${st.label}`}
                className={`relative w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                  selectedAgent?.id === a.id ? "ring-1 ring-blue-500 bg-blue-500/10 scale-110" : "hover:bg-white/5"
                }`}>
                {a.emoji}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#080c14]" style={{ background: st.color }} />
              </button>
            );
          })}
        </div>

        {/* KPIs */}
        <div className="flex gap-3 text-[10px]">
          {[
            { label: "Active", val: `${activeCount}/${agents.length}`, c: "#10b981" },
            { label: "XP", val: crewXP.toLocaleString(), c: "#8b5cf6" },
            { label: "Tasks", val: inProgress.toString(), c: "#f59e0b" },
          ].map(k => (
            <div key={k.label} className="text-center">
              <div className="font-mono font-bold" style={{ color: k.c }}>{k.val}</div>
              <div className="text-gray-600 uppercase text-[7px]">{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CANVAS (full viewport) ═══ */}
      <canvas
        ref={canvasRef}
        width={CW} height={CH}
        onClick={handleClick}
        onMouseMove={handleMove}
        className="w-full h-full"
        style={{ imageRendering: "auto", objectFit: "contain", background: "#080c14" }}
      />

      {/* ═══ FLOATING AGENT POPUP ═══ */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            key={selectedAgent.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-30 w-72 max-h-[400px] overflow-y-auto"
            style={{
              left: Math.min(popupPos.x + 16, (containerRef.current?.clientWidth || 800) - 300),
              top: Math.min(Math.max(popupPos.y - 80, 48), (containerRef.current?.clientHeight || 600) - 420),
              background: "rgba(10,15,28,0.92)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "14px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}>
            <FloatingAgentCard agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING AGENT CARD (replaces sidebar panel)
   ═══════════════════════════════════════════════════════════ */
const RARITY_COLORS: Record<string, string> = { common: "#6b7280", rare: "#3b82f6", epic: "#8b5cf6", legendary: "#f59e0b" };

function FloatingAgentCard({ agent, onClose }: { agent: AgentRecord; onClose: () => void }) {
  const lvl = getLevelFromXP(agent.xp);
  const st = STATUS_CFG[agent.status] || STATUS_CFG.idle;

  return (
    <div className="space-y-2.5 text-xs">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: `${st.color}15`, boxShadow: `0 0 12px ${st.color}30` }}>
          {agent.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{agent.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full" style={{ background: st.color }} />
            <span className="text-[10px] font-mono capitalize" style={{ color: st.color }}>{st.label}</span>
            <span className="text-[10px] font-mono text-purple-400 ml-1">Lv.{lvl.level}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-white text-lg leading-none">×</button>
      </div>

      {/* Soul quote */}
      {agent.soul && <p className="text-[10px] text-gray-400 italic border-l-2 border-gray-800 pl-2">&ldquo;{agent.soul}&rdquo;</p>}

      {/* XP Bar */}
      <div>
        <div className="flex justify-between text-[8px] text-gray-600 mb-0.5"><span>{agent.xp} XP</span><span>{lvl.nextXP}</span></div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${lvl.progress}%` }}
            transition={{ duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {[
          { l: "Done", v: agent.tasks_completed, c: "text-green-400" },
          { l: "Streak", v: `${agent.streak_days}d`, c: "text-amber-400" },
          { l: "Tokens", v: (agent.tokens_today / 1000).toFixed(1) + "k", c: "text-blue-400" },
          { l: "Block", v: agent.tasks_blocked, c: "text-red-400" },
        ].map(s => (
          <div key={s.l} className="p-1.5 rounded bg-white/[0.03]">
            <div className={`text-xs font-bold font-mono ${s.c}`}>{s.v}</div>
            <div className="text-[7px] text-gray-600 uppercase">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Stat bars */}
      <div className="space-y-1">
        {Object.entries(agent.stats).map(([stat, val]) => (
          <div key={stat} className="flex items-center gap-1.5 text-[9px]">
            <span className="text-gray-500 w-14 capitalize">{stat}</span>
            <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${val}%`,
                background: val >= 90 ? "#10b981" : val >= 75 ? "#3b82f6" : val >= 60 ? "#f59e0b" : "#ef4444",
              }} />
            </div>
            <span className="text-gray-600 font-mono w-4 text-right">{val}</span>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {agent.achievements.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {agent.achievements.map(a => (
            <span key={a.id} title={`${a.name}`}
              className="w-6 h-6 flex items-center justify-center text-xs rounded"
              style={{ background: `${RARITY_COLORS[a.rarity]}15`, border: `1px solid ${RARITY_COLORS[a.rarity]}30` }}>{a.icon}</span>
          ))}
        </div>
      )}

      {/* Current task */}
      {agent.current_task && (
        <div className="border-t border-gray-800 pt-2">
          <p className="text-[9px] text-gray-500 uppercase mb-0.5">Current Task</p>
          <p className="text-[10px] text-gray-300">{agent.current_task}</p>
        </div>
      )}
    </div>
  );
}
