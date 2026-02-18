"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useDashboardStore } from "../../lib/store";
import { motion, AnimatePresence } from "framer-motion";
import type { Memory, MemoryEdge } from "../../lib/types";

const TABS = ["Knowledge Graph", "Timeline", "Agent Brains", "Search"] as const;
type Tab = typeof TABS[number];

const CATEGORY_COLORS: Record<string, string> = {
  fact: "#3b82f6",
  preference: "#10b981",
  decision: "#f59e0b",
  pattern: "#8b5cf6",
};

const CATEGORY_ICONS: Record<string, string> = {
  fact: "📋",
  preference: "💡",
  decision: "⚖️",
  pattern: "🔄",
};

export default function MemoryPage() {
  const [tab, setTab] = useState<Tab>("Knowledge Graph");
  const { memoryGraph, agents } = useDashboardStore();

  if (!memoryGraph) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 font-mono text-sm animate-pulse">Loading memory data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🧠</span> Memory
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            MEM0_INTEGRATION // KNOWLEDGE_GRAPH // AGENT_MEMORY
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
          <span className="text-accent-purple">{memoryGraph.nodes.length}</span> memories
          <span className="text-glass-border">|</span>
          <span className="text-accent-blue">{memoryGraph.edges.length}</span> connections
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-ocean-900/50 border border-glass-border w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
              tab === t
                ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30"
                : "text-gray-500 hover:text-gray-300 border border-transparent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === "Knowledge Graph" && <KnowledgeGraphTab memoryGraph={memoryGraph} agents={agents} />}
        {tab === "Timeline" && <TimelineTab memoryGraph={memoryGraph} agents={agents} />}
        {tab === "Agent Brains" && <AgentBrainsTab memoryGraph={memoryGraph} agents={agents} />}
        {tab === "Search" && <SearchTab memoryGraph={memoryGraph} agents={agents} />}
      </motion.div>
    </div>
  );
}

// ━━━ Knowledge Graph Tab ━━━
function KnowledgeGraphTab({ memoryGraph, agents }: { memoryGraph: { nodes: Memory[]; edges: MemoryEdge[] }; agents: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<Memory | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Simple force-directed positions (pre-computed for display)
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const width = 800, height = 500;
    const cx = width / 2, cy = height / 2;
    memoryGraph.nodes.forEach((node, i) => {
      const angle = (i / memoryGraph.nodes.length) * 2 * Math.PI;
      const radius = 120 + (node.relevance * 80) + (i % 3) * 30;
      positions[node.id] = {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });
    // Simple repulsion
    for (let iter = 0; iter < 50; iter++) {
      for (const a of memoryGraph.nodes) {
        for (const b of memoryGraph.nodes) {
          if (a.id === b.id) continue;
          const pa = positions[a.id], pb = positions[b.id];
          const dx = pb.x - pa.x, dy = pb.y - pa.y;
          const dist = Math.max(Math.sqrt(dx*dx + dy*dy), 1);
          if (dist < 80) {
            const force = (80 - dist) * 0.3;
            pa.x -= (dx / dist) * force;
            pa.y -= (dy / dist) * force;
            pb.x += (dx / dist) * force;
            pb.y += (dy / dist) * force;
          }
        }
      }
      // Attract connected nodes
      for (const edge of memoryGraph.edges) {
        const pa = positions[edge.source], pb = positions[edge.target];
        if (!pa || !pb) continue;
        const dx = pb.x - pa.x, dy = pb.y - pa.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 100) {
          const force = (dist - 100) * 0.02;
          pa.x += (dx / dist) * force;
          pa.y += (dy / dist) * force;
          pb.x -= (dx / dist) * force;
          pb.y -= (dy / dist) * force;
        }
      }
      // Center gravity
      for (const node of memoryGraph.nodes) {
        const p = positions[node.id];
        p.x += (cx - p.x) * 0.01;
        p.y += (cy - p.y) * 0.01;
      }
    }
    return positions;
  }, [memoryGraph]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 800 * dpr;
    canvas.height = 500 * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, 800, 500);

    // Draw edges
    for (const edge of memoryGraph.edges) {
      const from = nodePositions[edge.source];
      const to = nodePositions[edge.target];
      if (!from || !to) continue;

      const isHighlighted = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = isHighlighted ? "rgba(139, 92, 246, 0.6)" : "rgba(255,255,255,0.08)";
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();
    }

    // Draw nodes
    for (const node of memoryGraph.nodes) {
      const pos = nodePositions[node.id];
      if (!pos) continue;

      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode === node.id;
      const isConnected = selectedNode && memoryGraph.edges.some(
        e => (e.source === selectedNode.id && e.target === node.id) || (e.target === selectedNode.id && e.source === node.id)
      );
      const color = CATEGORY_COLORS[node.category] || "#6b7280";
      const baseRadius = 6 + (node.relevance * 8);
      const radius = isSelected ? baseRadius + 4 : isHovered ? baseRadius + 2 : baseRadius;

      // Glow
      if (isSelected || isConnected) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = `${color}30`;
        ctx.fill();
      }

      // Node
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? color : isConnected ? `${color}cc` : node.id === hoveredNode ? `${color}dd` : `${color}88`;
      ctx.fill();

      // Label
      if (isSelected || isHovered) {
        ctx.font = "10px monospace";
        ctx.fillStyle = "#d1d5db";
        ctx.textAlign = "center";
        const label = node.content.length > 30 ? node.content.slice(0, 28) + "…" : node.content;
        ctx.fillText(label, pos.x, pos.y - radius - 8);
      }
    }
  }, [memoryGraph, nodePositions, selectedNode, hoveredNode]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const node of memoryGraph.nodes) {
      const pos = nodePositions[node.id];
      if (!pos) continue;
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < 14) {
        setSelectedNode(node);
        return;
      }
    }
    setSelectedNode(null);
  }, [memoryGraph, nodePositions]);

  const handleCanvasMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const node of memoryGraph.nodes) {
      const pos = nodePositions[node.id];
      if (!pos) continue;
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist < 14) {
        setHoveredNode(node.id);
        canvas.style.cursor = "pointer";
        return;
      }
    }
    setHoveredNode(null);
    canvas.style.cursor = "default";
  }, [memoryGraph, nodePositions]);

  const agentLookup = useMemo(() => {
    const m: Record<string, { name: string; emoji: string }> = {};
    agents.forEach(a => { m[a.id] = { name: a.name, emoji: a.emoji }; });
    return m;
  }, [agents]);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex gap-4 text-[10px] text-gray-500">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="capitalize">{cat}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph Canvas */}
        <div className="lg:col-span-2 glass-card p-4 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            className="w-full h-[500px] rounded-lg"
            style={{ background: "rgba(6, 10, 20, 0.8)" }}
          />
        </div>

        {/* Selected Node Detail */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono">Memory Detail</h3>
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div key={selectedNode.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[selectedNode.category]}</span>
                  <span className="text-[10px] uppercase tracking-widest font-mono px-2 py-0.5 rounded"
                    style={{ background: `${CATEGORY_COLORS[selectedNode.category]}20`, color: CATEGORY_COLORS[selectedNode.category] }}>
                    {selectedNode.category}
                  </span>
                </div>
                <p className="text-sm text-white leading-relaxed">{selectedNode.content}</p>
                <div className="space-y-1 text-[11px] text-gray-500 font-mono">
                  <div className="flex justify-between">
                    <span>Agent</span>
                    <span className="text-white">{agentLookup[selectedNode.agent_id]?.emoji} {agentLookup[selectedNode.agent_id]?.name || selectedNode.agent_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Relevance</span>
                    <span className="text-accent-purple">{(selectedNode.relevance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retrievals</span>
                    <span className="text-accent-blue">{selectedNode.retrieval_count}×</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span>{new Date(selectedNode.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Connected memories */}
                <div className="pt-3 border-t border-glass-border">
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Connected</h4>
                  <div className="space-y-1.5">
                    {memoryGraph.edges
                      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                      .map((edge, i) => {
                        const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                        const other = memoryGraph.nodes.find(n => n.id === otherId);
                        if (!other) return null;
                        return (
                          <div key={i} className="text-[10px] p-2 rounded-md bg-ocean-900/50 border border-glass-border cursor-pointer hover:border-accent-purple/30 transition-colors"
                            onClick={() => setSelectedNode(other)}>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <span style={{ color: CATEGORY_COLORS[other.category] }}>●</span>
                              <span className="text-[10px] text-gray-600">{edge.relationship} →</span>
                            </div>
                            <p className="text-gray-300 mt-0.5 truncate">{other.content}</p>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-600 text-xs py-8">
                <span className="text-3xl block mb-2">🧠</span>
                Click on a node to view memory details
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ━━━ Timeline Tab ━━━
function TimelineTab({ memoryGraph, agents }: { memoryGraph: { nodes: Memory[] }; agents: any[] }) {
  const sorted = useMemo(
    () => [...memoryGraph.nodes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [memoryGraph]
  );
  const agentLookup = useMemo(() => {
    const m: Record<string, { name: string; emoji: string }> = {};
    agents.forEach(a => { m[a.id] = { name: a.name, emoji: a.emoji }; });
    return m;
  }, [agents]);

  return (
    <div className="glass-card p-5">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-6">Memory Timeline</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-glass-border" />
        <div className="space-y-4">
          {sorted.map((mem, i) => {
            const agent = agentLookup[mem.agent_id];
            const freshness = 1 - Math.min((Date.now() - new Date(mem.created_at).getTime()) / (7 * 86400000), 1);
            return (
              <motion.div
                key={mem.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex gap-4 pl-8 relative"
              >
                <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-ocean-900"
                  style={{ background: CATEGORY_COLORS[mem.category], opacity: 0.4 + freshness * 0.6 }} />
                <div className="flex-1 p-3 rounded-lg bg-ocean-900/50 border border-glass-border hover:border-accent-purple/20 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{agent?.emoji || "🤖"}</span>
                    <span className="text-xs text-accent-blue font-medium">{agent?.name || mem.agent_id}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded"
                      style={{ background: `${CATEGORY_COLORS[mem.category]}15`, color: CATEGORY_COLORS[mem.category] }}>
                      {mem.category}
                    </span>
                    <span className="ml-auto text-[10px] text-gray-600 font-mono">
                      {new Date(mem.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{mem.content}</p>
                  <div className="flex gap-3 mt-2 text-[10px] text-gray-600 font-mono">
                    <span>relevance: {(mem.relevance * 100).toFixed(0)}%</span>
                    <span>retrieved: {mem.retrieval_count}×</span>
                    <span style={{ color: freshness > 0.7 ? "#10b981" : freshness > 0.3 ? "#f59e0b" : "#6b7280" }}>
                      freshness: {(freshness * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ━━━ Agent Brains Tab ━━━
function AgentBrainsTab({ memoryGraph, agents }: { memoryGraph: { nodes: Memory[] }; agents: any[] }) {
  const agentMemoryMap = useMemo(() => {
    const m: Record<string, Memory[]> = {};
    for (const mem of memoryGraph.nodes) {
      if (!m[mem.agent_id]) m[mem.agent_id] = [];
      m[mem.agent_id].push(mem);
    }
    return m;
  }, [memoryGraph]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent, i) => {
        const memories = agentMemoryMap[agent.id] || [];
        const categories = memories.reduce((acc: Record<string, number>, m: Memory) => {
          acc[m.category] = (acc[m.category] || 0) + 1;
          return acc;
        }, {});
        const totalRetrievals = memories.reduce((s: number, m: Memory) => s + m.retrieval_count, 0);

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{agent.emoji}</span>
              <div>
                <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                <p className="text-[10px] text-gray-500">{agent.department}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-ocean-900/50">
                <div className="text-lg font-bold text-accent-purple">{memories.length}</div>
                <div className="text-[9px] text-gray-600 uppercase">memories</div>
              </div>
              <div className="p-2 rounded-lg bg-ocean-900/50">
                <div className="text-lg font-bold text-accent-blue">{totalRetrievals}</div>
                <div className="text-[9px] text-gray-600 uppercase">retrivals</div>
              </div>
              <div className="p-2 rounded-lg bg-ocean-900/50">
                <div className="text-lg font-bold text-accent-green">{Object.keys(categories).length}</div>
                <div className="text-[9px] text-gray-600 uppercase">categories</div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="space-y-1.5">
              {Object.entries(categories).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-2 text-[11px]">
                  <span>{CATEGORY_ICONS[cat] || "📋"}</span>
                  <span className="text-gray-400 capitalize flex-1">{cat}</span>
                  <span className="text-gray-600 font-mono">{count}</span>
                  <div className="w-16 h-1 rounded-full bg-ocean-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      background: CATEGORY_COLORS[cat],
                      width: `${(count / memories.length) * 100}%`,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Latest memory */}
            {memories[0] && (
              <div className="pt-2 border-t border-glass-border">
                <p className="text-[10px] text-gray-600 uppercase mb-1">Latest Memory</p>
                <p className="text-[11px] text-gray-400 line-clamp-2">{memories[0].content}</p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ━━━ Search Tab ━━━
function SearchTab({ memoryGraph, agents }: { memoryGraph: { nodes: Memory[] }; agents: any[] }) {
  const [query, setQuery] = useState("");
  const agentLookup = useMemo(() => {
    const m: Record<string, { name: string; emoji: string }> = {};
    agents.forEach(a => { m[a.id] = { name: a.name, emoji: a.emoji }; });
    return m;
  }, [agents]);

  const results = useMemo(() => {
    if (!query.trim()) return memoryGraph.nodes;
    const q = query.toLowerCase();
    return memoryGraph.nodes
      .filter(m => m.content.toLowerCase().includes(q) || m.category.includes(q) || m.agent_id.includes(q))
      .sort((a, b) => b.relevance - a.relevance);
  }, [query, memoryGraph]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories... (content, category, agent)"
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-600"
          />
          <span className="text-[10px] text-gray-600 font-mono">{results.length} results</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {results.map((mem, i) => {
          const agent = agentLookup[mem.agent_id];
          return (
            <motion.div
              key={mem.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-card p-4 hover:border-accent-purple/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{agent?.emoji || "🤖"}</span>
                <span className="text-xs text-gray-400">{agent?.name || mem.agent_id}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded"
                  style={{ background: `${CATEGORY_COLORS[mem.category]}15`, color: CATEGORY_COLORS[mem.category] }}>
                  {mem.category}
                </span>
                <span className="ml-auto text-accent-purple text-[10px] font-mono">{(mem.relevance * 100).toFixed(0)}%</span>
              </div>
              <p className="text-sm text-gray-300">{mem.content}</p>
              <div className="flex gap-3 mt-1.5 text-[10px] text-gray-600 font-mono">
                <span>retrieved {mem.retrieval_count}×</span>
                <span>{new Date(mem.created_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
