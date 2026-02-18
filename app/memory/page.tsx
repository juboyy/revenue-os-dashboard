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

// ━━━ Knowledge Graph Tab (3D via Three.js) ━━━
function KnowledgeGraphTab({ memoryGraph, agents }: { memoryGraph: { nodes: Memory[]; edges: MemoryEdge[] }; agents: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Memory | null>(null);

  // 3D positions via force layout in 3D space
  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number; z: number }> = {};
    const n = memoryGraph.nodes.length;
    // Distribute on sphere surface using golden spiral
    const phi = (1 + Math.sqrt(5)) / 2;
    memoryGraph.nodes.forEach((node, i) => {
      const theta = 2 * Math.PI * i / phi;
      const y = 1 - (2 * i) / (n - 1 || 1);
      const radiusAtY = Math.sqrt(1 - y * y);
      const spread = 3 + node.relevance * 1.5;
      pos[node.id] = {
        x: Math.cos(theta) * radiusAtY * spread,
        y: y * spread,
        z: Math.sin(theta) * radiusAtY * spread,
      };
    });
    // Force simulation in 3D
    for (let iter = 0; iter < 80; iter++) {
      // Repulsion
      for (const a of memoryGraph.nodes) {
        for (const b of memoryGraph.nodes) {
          if (a.id >= b.id) continue;
          const pa = pos[a.id], pb = pos[b.id];
          const dx = pb.x - pa.x, dy = pb.y - pa.y, dz = pb.z - pa.z;
          const dist = Math.max(Math.sqrt(dx*dx + dy*dy + dz*dz), 0.1);
          if (dist < 2) {
            const force = (2 - dist) * 0.15;
            pa.x -= (dx / dist) * force;
            pa.y -= (dy / dist) * force;
            pa.z -= (dz / dist) * force;
            pb.x += (dx / dist) * force;
            pb.y += (dy / dist) * force;
            pb.z += (dz / dist) * force;
          }
        }
      }
      // Attraction along edges
      for (const edge of memoryGraph.edges) {
        const pa = pos[edge.source], pb = pos[edge.target];
        if (!pa || !pb) continue;
        const dx = pb.x - pa.x, dy = pb.y - pa.y, dz = pb.z - pa.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist > 2.5) {
          const force = (dist - 2.5) * 0.02 * edge.weight;
          pa.x += (dx / dist) * force;
          pa.y += (dy / dist) * force;
          pa.z += (dz / dist) * force;
          pb.x -= (dx / dist) * force;
          pb.y -= (dy / dist) * force;
          pb.z -= (dz / dist) * force;
        }
      }
      // Center gravity
      for (const node of memoryGraph.nodes) {
        const p = pos[node.id];
        p.x *= 0.995; p.y *= 0.995; p.z *= 0.995;
      }
    }
    return pos;
  }, [memoryGraph]);

  // Three.js scene setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dynamic import of Three.js to avoid SSR issues
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

      const width = container.clientWidth;
      const height = 520;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x060a14);
      scene.fog = new THREE.FogExp2(0x060a14, 0.06);

      // Camera
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      camera.position.set(6, 4, 8);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
      renderer.domElement.style.borderRadius = "12px";

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      controls.minDistance = 3;
      controls.maxDistance = 20;

      // Ambient light
      scene.add(new THREE.AmbientLight(0xffffff, 0.3));
      const pointLight = new THREE.PointLight(0x3b82f6, 1.5, 25);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      // Grid helper (subtle)
      const grid = new THREE.GridHelper(16, 16, 0x1f2937, 0x111827);
      grid.position.y = -4;
      (grid.material as any).opacity = 0.3;
      (grid.material as any).transparent = true;
      scene.add(grid);

      // Category color map
      const catColors: Record<string, number> = {
        fact: 0x3b82f6,
        preference: 0x10b981,
        decision: 0xf59e0b,
        pattern: 0x8b5cf6,
      };

      // Node meshes
      const nodeMeshes: THREE.Mesh[] = [];
      const nodeIdMap = new Map<THREE.Mesh, Memory>();

      for (const node of memoryGraph.nodes) {
        const p = nodePositions[node.id];
        if (!p) continue;

        const radius = 0.12 + node.relevance * 0.15;
        const color = catColors[node.category] || 0x6b7280;

        // Node sphere
        const geo = new THREE.SphereGeometry(radius, 16, 16);
        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.4,
          roughness: 0.3,
          metalness: 0.5,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(p.x, p.y, p.z);
        scene.add(mesh);
        nodeMeshes.push(mesh);
        nodeIdMap.set(mesh, node);

        // Glow aura
        const glowGeo = new THREE.SphereGeometry(radius * 2, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.08,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.copy(mesh.position);
        scene.add(glow);
      }

      // Edges
      for (const edge of memoryGraph.edges) {
        const from = nodePositions[edge.source];
        const to = nodePositions[edge.target];
        if (!from || !to) continue;

        const points = [
          new THREE.Vector3(from.x, from.y, from.z),
          new THREE.Vector3(to.x, to.y, to.z),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x6b7280,
          transparent: true,
          opacity: 0.15 + edge.weight * 0.15,
        });
        scene.add(new THREE.Line(lineGeo, lineMat));
      }

      // Particle stars background
      const starGeo = new THREE.BufferGeometry();
      const starVerts = new Float32Array(600).map(() => (Math.random() - 0.5) * 30);
      starGeo.setAttribute("position", new THREE.BufferAttribute(starVerts, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.4 });
      scene.add(new THREE.Points(starGeo, starMat));

      // Raycaster for selection
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onClick = (e: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(nodeMeshes);
        if (hits.length > 0) {
          const node = nodeIdMap.get(hits[0].object as THREE.Mesh);
          if (node) setSelectedNode(node);
        } else {
          setSelectedNode(null);
        }
      };
      renderer.domElement.addEventListener("click", onClick);

      // Animation loop
      let frameId: number;
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        controls.update();

        // Subtle node pulse animation
        const time = Date.now() * 0.001;
        nodeMeshes.forEach((mesh) => {
          const scale = 1 + Math.sin(time * 2 + mesh.position.x) * 0.05;
          mesh.scale.set(scale, scale, scale);
        });

        renderer.render(scene, camera);
      };
      animate();

      // Resize
      const onResize = () => {
        const w = container.clientWidth;
        camera.aspect = w / height;
        camera.updateProjectionMatrix();
        renderer.setSize(w, height);
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        cancelAnimationFrame(frameId);
        renderer.domElement.removeEventListener("click", onClick);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        controls.dispose();
        container.innerHTML = "";
      };
    })();

    return () => { if (cleanup) cleanup(); };
  }, [memoryGraph, nodePositions]);

  // Agent lookup for detail panel
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
        <div className="ml-auto text-[9px] text-gray-600 font-mono">drag to rotate • scroll to zoom • click node to inspect</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 3D Graph Container */}
        <div className="lg:col-span-2 glass-card p-4 overflow-hidden">
          <div ref={containerRef} className="w-full h-[520px] rounded-lg" />
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
                Click on a 3D node to view memory details
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
