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
  { id: "ponte-de-comando", label: "Command Bridge", icon: "⚓", color: "#f59e0b", x: 1, y: 1, w: 9, h: 7, floor: "wood", floorTint: "#2a1f14" },
  { id: "forja", label: "Engineering", icon: "⚔️", color: "#3b82f6", x: 11, y: 1, w: 9, h: 7, floor: "tile", floorTint: "#141e2e" },
  { id: "tesouraria", label: "Treasury", icon: "💎", color: "#10b981", x: 21, y: 1, w: 9, h: 7, floor: "carpet", floorTint: "#0d2818" },
  { id: "sala-reuniao", label: "Meeting Room", icon: "🤝", color: "#60a5fa", x: 31, y: 1, w: 10, h: 9, floor: "carpet", floorTint: "#0f1a2e", type: "common" },
  { id: "laboratorio", label: "Analytics Lab", icon: "🔬", color: "#06b6d4", x: 1, y: 9, w: 9, h: 7, floor: "tile", floorTint: "#0d1f24" },
  { id: "estaleiro", label: "Architecture", icon: "🏗️", color: "#8b5cf6", x: 11, y: 9, w: 9, h: 7, floor: "stone", floorTint: "#1a152e" },
  { id: "biblioteca", label: "Library", icon: "📚", color: "#ec4899", x: 21, y: 9, w: 9, h: 7, floor: "wood", floorTint: "#2a1420" },
  { id: "lobby", label: "Central Lobby", icon: "🏛️", color: "#94a3b8", x: 11, y: 17, w: 12, h: 7, floor: "tile", floorTint: "#121824", type: "common" },
  { id: "sala-de-maquinas", label: "Engine Room", icon: "⚙️", color: "#ef4444", x: 1, y: 17, w: 9, h: 7, floor: "stone", floorTint: "#2a1414" },
  { id: "torre-de-vigia", label: "Watchtower", icon: "🔭", color: "#f97316", x: 24, y: 17, w: 9, h: 7, floor: "wood", floorTint: "#2a2014" },
  { id: "cafe", label: "Café & Lounge", icon: "☕", color: "#a78bfa", x: 31, y: 11, w: 10, h: 9, floor: "wood", floorTint: "#1e1418", type: "common" },
  { id: "cozinha", label: "Comms Center", icon: "📡", color: "#a855f7", x: 1, y: 25, w: 9, h: 4, floor: "carpet", floorTint: "#1e142a" },
  { id: "jardim", label: "Zen Garden", icon: "🌿", color: "#4ade80", x: 11, y: 25, w: 12, h: 4, floor: "stone", floorTint: "#0d1f14", type: "common" },
  { id: "billing-room", label: "Billing Office", icon: "🎯", color: "#fb923c", x: 24, y: 25, w: 9, h: 4, floor: "tile", floorTint: "#2a1f0e" },
  { id: "auditorio", label: "All-Hands Arena", icon: "🎪", color: "#fbbf24", x: 31, y: 21, w: 10, h: 8, floor: "carpet", floorTint: "#2a2010", type: "common" },
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
  active:   { label: "ACTIVE",   color: "#10b981", glow: true },
  working:  { label: "WORKING",  color: "#3b82f6", glow: true },
  idle:     { label: "IDLE",     color: "#6b7280", glow: false },
  error:    { label: "ERROR",    color: "#ef4444", glow: true },
  sleeping: { label: "SLEEPING", color: "#4b5563", glow: false },
};

const INTERACTIONS = [
  { type: "meeting", icon: "📋", label: "Sprint Review" },
  { type: "coffee", icon: "☕", label: "Coffee Break" },
  { type: "pairing", icon: "👥", label: "Pair Coding" },
  { type: "debate", icon: "💡", label: "Brainstorming" },
  { type: "review", icon: "🔍", label: "Code Review" },
];

const MENU_ITEMS = [
  { label: "Command Center", href: "/", icon: "🎯" },
  { label: "Office", href: "/world", icon: "🏢" },
  { label: "Org Chart", href: "/orgchart", icon: "🌳" },
  { label: "Tasks", href: "/tasks", icon: "📋" },
  { label: "Monitor", href: "/monitoring", icon: "📊" },
  { label: "Memory", href: "/memory", icon: "🧠" },
  { label: "Spawn", href: "/spawn", icon: "⚡" },
  { label: "Board", href: "/leaderboard", icon: "🏆" },
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

function drawRoomWalls(ctx: CanvasRenderingContext2D, room: RoomDef) {
  const rx = room.x * T, ry = room.y * T;
  const rw = room.w * T, rh = room.h * T;
  // Glassmorphism border
  ctx.save();
  ctx.strokeStyle = `${room.color}35`;
  ctx.lineWidth = 2;
  ctx.shadowColor = `${room.color}20`;
  ctx.shadowBlur = 12;
  ctx.strokeRect(rx, ry, rw, rh);
  ctx.restore();
  // Inner glow line
  ctx.strokeStyle = `${room.color}15`;
  ctx.lineWidth = 1;
  ctx.strokeRect(rx + 2, ry + 2, rw - 4, rh - 4);
}

function drawRoomLabel(ctx: CanvasRenderingContext2D, room: RoomDef, agentCount: number) {
  const rx = room.x * T, ry = room.y * T, rw = room.w * T;
  // Background bar
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(rx, ry, rw, 22);
  ctx.fillStyle = `${room.color}18`;
  ctx.fillRect(rx, ry, rw, 22);
  // Bottom edge
  ctx.fillStyle = `${room.color}40`;
  ctx.fillRect(rx, ry + 21, rw, 1);
  // Icon + label
  ctx.font = "11px serif";
  ctx.textAlign = "left";
  ctx.fillText(room.icon, rx + 6, ry + 15);
  ctx.font = "bold 10px 'Segoe UI', sans-serif";
  ctx.fillStyle = room.color;
  ctx.fillText(room.label, rx + 24, ry + 15);
  // Agent count badge
  if (agentCount > 0) {
    const badge = `${agentCount}`;
    ctx.font = "bold 8px 'Segoe UI', sans-serif";
    const bw = ctx.measureText(badge).width + 8;
    ctx.fillStyle = `${room.color}30`;
    ctx.beginPath();
    ctx.roundRect(rx + rw - bw - 6, ry + 5, bw, 13, 4);
    ctx.fill();
    ctx.fillStyle = room.color;
    ctx.textAlign = "center";
    ctx.fillText(badge, rx + rw - bw / 2 - 6, ry + 14);
  }
}

function drawFurniture(ctx: CanvasRenderingContext2D, room: RoomDef, frame: number) {
  const rx = room.x * T + 4, ry = room.y * T + 26;
  const rw = room.w * T - 8, rh = room.h * T - 30;
  ctx.globalAlpha = 0.7;
  if (room.type === "common") {
    if (room.id === "lobby") {
      // Sofas
      ctx.fillStyle = "#1e3a5f"; ctx.fillRect(rx + 20, ry + 20, 60, 20);
      ctx.fillStyle = "#2563eb20"; ctx.fillRect(rx + rw - 80, ry + rh - 40, 60, 20);
      // Reception desk
      ctx.fillStyle = "#374151"; ctx.fillRect(rx + rw / 2 - 30, ry + rh / 2, 60, 16);
      ctx.fillStyle = "#94a3b820"; ctx.fillRect(rx + rw / 2 - 28, ry + rh / 2 + 2, 56, 12);
    } else if (room.id === "cafe") {
      // Counter
      ctx.fillStyle = "#4a3728"; ctx.fillRect(rx + 10, ry + 10, rw - 20, 14);
      // Tables
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "#374151";
        ctx.beginPath();
        ctx.arc(rx + 40 + i * 50, ry + rh / 2 + 10, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      // Steam animation
      ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.sin(frame * 0.05) * 0.05})`;
      ctx.fillRect(rx + 20, ry + 4 - Math.sin(frame * 0.08) * 3, 4, 6);
    } else if (room.id === "sala-reuniao") {
      ctx.fillStyle = "#1e293b"; ctx.fillRect(rx + rw / 2 - 40, ry + rh / 2 - 12, 80, 24);
      ctx.fillStyle = `${room.color}15`; ctx.fillRect(rx + rw / 2 - 38, ry + rh / 2 - 10, 76, 20);
      // Chairs around
      for (let i = 0; i < 6; i++) {
        const cx2 = rx + rw / 2 - 35 + i * 14;
        ctx.fillStyle = "#4b5563"; ctx.fillRect(cx2, ry + rh / 2 - 20, 8, 6);
        ctx.fillRect(cx2, ry + rh / 2 + 14, 8, 6);
      }
    } else if (room.id === "jardim") {
      // Pond with ripples
      ctx.fillStyle = "#0d4f6f";
      ctx.beginPath();
      ctx.ellipse(rx + rw / 2, ry + rh / 2, 30 + Math.sin(frame * 0.03) * 2, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(100,200,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(rx + rw / 2, ry + rh / 2, 20 + Math.sin(frame * 0.05) * 4, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Bamboo
      ctx.fillStyle = "#2d5a27";
      ctx.fillRect(rx + 14, ry + 6, 4, rh - 10);
      ctx.fillRect(rx + rw - 18, ry + 6, 4, rh - 10);
    } else if (room.id === "auditorio") {
      // Rows of seats
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 6; c++) {
          ctx.fillStyle = "#374151"; ctx.fillRect(rx + 20 + c * 18, ry + 20 + r * 20, 12, 10);
        }
      }
      // Podium
      ctx.fillStyle = "#4a3728"; ctx.fillRect(rx + rw / 2 - 12, ry + rh - 20, 24, 14);
    }
  } else {
    // Office furniture
    ctx.fillStyle = "#1e293b"; ctx.fillRect(rx + 14, ry + 30, 50, 20); // desk
    ctx.fillStyle = `${room.color}15`; ctx.fillRect(rx + 16, ry + 32, 46, 16); // screen glow
    ctx.fillStyle = "#374151"; ctx.fillRect(rx + 26, ry + 52, 10, 8); // chair
    ctx.fillStyle = "#1e293b"; ctx.fillRect(rx + rw - 64, ry + 30, 50, 20); // desk 2
    ctx.fillStyle = `${room.color}15`; ctx.fillRect(rx + rw - 62, ry + 32, 46, 16);
    ctx.fillStyle = "#374151"; ctx.fillRect(rx + rw - 52, ry + 52, 10, 8);
    // Plant
    ctx.fillStyle = "#2d5a27";
    ctx.beginPath();
    ctx.arc(rx + rw - 16, ry + rh - 16, 8 + Math.sin(frame * 0.04) * 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a3728"; ctx.fillRect(rx + rw - 19, ry + rh - 10, 6, 10);
  }
  ctx.globalAlpha = 1;
}

// ══════════════════════════════════════════════════════════
// CHARACTER DRAWING — Premium identifiable sprites
// ══════════════════════════════════════════════════════════

function drawCharacter(
  ctx: CanvasRenderingContext2D, px: number, py: number,
  vis: AgentVisual, statusColor: string, frame: number,
  isSelected: boolean, isHovered: boolean,
  name: string, emoji: string, statusLabel: string,
  isMoving: boolean, interactionIcon: string | null,
) {
  const bounce = isMoving ? Math.sin(frame * 0.2) * 3 : Math.sin(frame * 0.06) * 0.5;
  const by = py + bounce;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(px, py + 22, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Selection ring
  if (isSelected || isHovered) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(px, py + 22, 16, 6, 0, 0, Math.PI * 2);
    ctx.strokeStyle = isSelected ? "#3b82f6" : "rgba(255,255,255,0.3)";
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    if (isSelected) { ctx.shadowColor = "#3b82f6"; ctx.shadowBlur = 8; }
    ctx.stroke();
    ctx.restore();
  }

  // Feet
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(px - 7, by + 16, 6, 5);
  ctx.fillRect(px + 1, by + 16, 6, 5);
  // Legs
  ctx.fillStyle = vis.pants;
  ctx.fillRect(px - 6, by + 8, 5, 9);
  ctx.fillRect(px + 1, by + 8, 5, 9);
  // Body
  ctx.fillStyle = vis.shirt;
  ctx.fillRect(px - 9, by - 6, 18, 16);
  // Shirt detail (collar)
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(px - 2, by - 6, 4, 3);
  // Arms
  ctx.fillStyle = vis.shirt;
  ctx.fillRect(px - 13, by - 4, 5, 14);
  ctx.fillRect(px + 8, by - 4, 5, 14);
  // Hands
  ctx.fillStyle = vis.skin;
  ctx.fillRect(px - 13, by + 8, 5, 5);
  ctx.fillRect(px + 8, by + 8, 5, 5);
  // Head
  ctx.fillStyle = vis.skin;
  ctx.fillRect(px - 8, by - 22, 16, 18);
  // Eyes
  ctx.fillStyle = "#1a1a2e";
  const blink = Math.sin(frame * 0.08 + px * 0.01) > 0.92;
  if (!blink) {
    ctx.fillRect(px - 5, by - 16, 4, 4);
    ctx.fillRect(px + 1, by - 16, 4, 4);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px - 4, by - 15, 2, 2);
    ctx.fillRect(px + 2, by - 15, 2, 2);
  } else {
    ctx.fillRect(px - 5, by - 14, 4, 1);
    ctx.fillRect(px + 1, by - 14, 4, 1);
  }
  // Mouth
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(px - 3, by - 9, 6, 2);

  // Hair by style
  ctx.fillStyle = vis.hair;
  switch (vis.hairStyle) {
    case "short":
      ctx.fillRect(px - 9, by - 24, 18, 6);
      ctx.fillRect(px - 9, by - 22, 3, 8);
      ctx.fillRect(px + 6, by - 22, 3, 6);
      break;
    case "spiky":
      ctx.fillRect(px - 9, by - 26, 18, 6);
      ctx.fillRect(px - 7, by - 30, 4, 6);
      ctx.fillRect(px - 1, by - 32, 4, 8);
      ctx.fillRect(px + 5, by - 29, 4, 5);
      break;
    case "long":
      ctx.fillRect(px - 10, by - 24, 20, 6);
      ctx.fillRect(px - 10, by - 22, 4, 18);
      ctx.fillRect(px + 6, by - 22, 4, 18);
      break;
    case "bald":
      ctx.fillRect(px - 8, by - 23, 16, 3);
      break;
    case "ponytail":
      ctx.fillRect(px - 9, by - 24, 18, 6);
      ctx.fillRect(px + 6, by - 22, 4, 6);
      ctx.fillRect(px + 9, by - 18, 6, 4);
      ctx.fillRect(px + 13, by - 16, 4, 12);
      break;
    case "afro":
      ctx.beginPath();
      ctx.arc(px, by - 22, 14, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "mohawk":
      ctx.fillRect(px - 9, by - 24, 18, 5);
      ctx.fillRect(px - 3, by - 32, 6, 10);
      break;
    case "bowl":
      ctx.fillRect(px - 10, by - 24, 20, 8);
      ctx.fillRect(px - 10, by - 18, 3, 6);
      ctx.fillRect(px + 7, by - 18, 3, 6);
      break;
  }

  // Accessories
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  switch (vis.accessory) {
    case "glasses":
      ctx.strokeStyle = "rgba(200,200,255,0.6)"; ctx.lineWidth = 1.5;
      ctx.strokeRect(px - 6, by - 17, 5, 5);
      ctx.strokeRect(px + 1, by - 17, 5, 5);
      ctx.beginPath(); ctx.moveTo(px - 1, by - 15); ctx.lineTo(px + 1, by - 15); ctx.stroke();
      break;
    case "headphones":
      ctx.strokeStyle = "#555"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(px, by - 24, 12, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = "#333"; ctx.fillRect(px - 13, by - 20, 5, 8); ctx.fillRect(px + 8, by - 20, 5, 8);
      break;
    case "hat":
      ctx.fillStyle = vis.shirt;
      ctx.fillRect(px - 12, by - 27, 24, 5);
      ctx.fillRect(px - 7, by - 32, 14, 7);
      break;
    case "helm":
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(px - 10, by - 26, 20, 6);
      ctx.fillRect(px - 4, by - 30, 8, 6);
      break;
    case "scarf":
      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(px - 9, by - 6, 18, 4);
      ctx.fillRect(px - 12, by - 4, 6, 12);
      break;
    case "tie":
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(px - 2, by - 3, 4, 10);
      ctx.beginPath(); ctx.moveTo(px - 3, by + 7); ctx.lineTo(px, by + 12); ctx.lineTo(px + 3, by + 7); ctx.fill();
      break;
    case "badge":
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath(); ctx.arc(px + 7, by - 2, 3, 0, Math.PI * 2); ctx.fill();
      break;
  }

  // Status dot + label
  ctx.beginPath();
  ctx.arc(px + 12, by - 22, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();
  ctx.strokeStyle = "#0d1117"; ctx.lineWidth = 1.5; ctx.stroke();
  // Status text
  ctx.font = "bold 7px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = statusColor;
  ctx.fillText(statusLabel, px, py + 36);

  // Name pill
  ctx.font = "bold 9px 'Segoe UI', sans-serif";
  const nameW = ctx.measureText(name).width + 12;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath();
  ctx.roundRect(px - nameW / 2, py + 24, nameW, 14, 4);
  ctx.fill();
  ctx.fillStyle = isSelected ? "#60a5fa" : isHovered ? "#ffffff" : "#e5e7eb";
  ctx.fillText(name, px, py + 34);

  // Emoji badge on body
  ctx.font = "12px serif";
  ctx.fillText(emoji, px, by - 34);

  // Interaction bubble
  if (interactionIcon) {
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.roundRect(px - 14, by - 52, 28, 20, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px - 4, by - 32); ctx.lineTo(px, by - 28); ctx.lineTo(px + 4, by - 32);
    ctx.fill();
    ctx.font = "13px serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText(interactionIcon, px, by - 38);
  }

  // Speech bubble on hover/select
  if ((isSelected || isHovered)) {
    ctx.font = "8px 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    const lvlText = `${emoji} ${name}`;
    const tw = ctx.measureText(lvlText).width + 16;
    ctx.beginPath();
    ctx.roundRect(px - tw / 2, by - 48, tw, 14, 5);
    ctx.fill();
    ctx.fillStyle = "#d1d5db";
    ctx.fillText(lvlText, px, by - 38);
  }
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
      ctx.fillStyle = "#080c14";
      ctx.fillRect(0, 0, CW, CH);

      // Hallway tiles
      for (let x = 0; x < MAP_W; x++) {
        for (let y = 0; y < MAP_H; y++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? "#0c1018" : "#0e1220";
          ctx.fillRect(x * T, y * T, T, T);
        }
      }

      // Count agents per room
      const pos = agentPosRef.current;
      const roomCounts: Record<string, number> = {};
      agents.forEach(a => {
        const p = pos[a.id];
        if (p) roomCounts[p.currentRoom] = (roomCounts[p.currentRoom] || 0) + 1;
      });

      // Rooms
      for (const room of ROOMS) {
        for (let tx = room.x; tx < room.x + room.w; tx++) {
          for (let ty = room.y; ty < room.y + room.h; ty++) {
            drawFloorTile(ctx, tx * T, ty * T, room.floor, room.floorTint, tx, ty);
          }
        }
        drawRoomWalls(ctx, room);
        drawFurniture(ctx, room, frame);
        drawRoomLabel(ctx, room, roomCounts[room.id] || 0);
      }

      // Particles
      for (const p of particlesRef.current) {
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0 || p.y < 0 || p.x < 0 || p.x > CW) {
          p.x = Math.random() * CW; p.y = CH + 10; p.life = 300 + Math.random() * 300;
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.4})`; ctx.fill();
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
      if (Math.abs(mx - p.x) < 18 && Math.abs(my - p.y) < 28) return agent;
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
          <span className="text-[10px] font-bold text-white tracking-wider uppercase mr-3">VIRTUAL OFFICE</span>
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
          <span className="text-green-400 font-mono">{activeCount}/{agents.length} <span className="text-gray-600">active</span></span>
          <span className="text-gray-600">●</span>
          <span className="text-gray-500 font-mono">LIVE</span>
        </div>
      </div>

      {/* ═══ CANVAS ═══ */}
      <canvas ref={canvasRef} width={CW} height={CH}
        onClick={handleClick} onMouseMove={handleMove}
        className="w-full h-full pt-10"
        style={{ imageRendering: "auto", objectFit: "contain", background: "#080c14" }} />

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
              <span className="text-purple-400 text-[9px] font-mono">Lv.{lvl.level} {lvl.title}</span>
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
          { label: "Tasks", value: agent.tasks_completed, c: "text-green-400", icon: "✅" },
          { label: "Streak", value: `${agent.streak_days}d`, c: "text-amber-400", icon: "🔥" },
          { label: "Tokens", value: `${(agent.tokens_today / 1000).toFixed(1)}k`, c: "text-blue-400", icon: "⚡" },
          { label: "Blocked", value: agent.tasks_blocked, c: "text-red-400", icon: "🚫" },
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
        <h4 className="text-[8px] uppercase tracking-widest text-gray-600 font-mono">Stats</h4>
        {Object.entries(agent.stats).map(([stat, val]) => (
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
      {agent.achievements.length > 0 && (
        <div>
          <h4 className="text-[8px] uppercase tracking-widest text-gray-600 font-mono mb-1">Achievements</h4>
          <div className="flex flex-wrap gap-1">
            {agent.achievements.map(a => (
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
          <h4 className="text-[8px] uppercase text-gray-600 font-mono mb-0.5">Current Task</h4>
          <p className="text-[10px] text-gray-300 font-mono">{agent.current_task}</p>
        </div>
      )}

      {/* Lifecycle Actions */}
      <div className="border-t border-glass-border pt-2 flex gap-1.5">
        <button className="flex-1 py-1.5 rounded text-[9px] font-mono bg-green-500/10 text-green-400 hover:bg-green-500/20 transition">⬆ Promote</button>
        <button className="flex-1 py-1.5 rounded text-[9px] font-mono bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition">📋 Review</button>
        <button className="flex-1 py-1.5 rounded text-[9px] font-mono bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">⛔ Dismiss</button>
      </div>
    </div>
  );
}
