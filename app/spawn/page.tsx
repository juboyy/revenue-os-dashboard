"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SpawnTemplate } from "../../lib/types";

const TEMPLATES: SpawnTemplate[] = [
  { id: "developer", name: "Developer Agent", description: "Full-stack code generation and debugging", icon: "💻", config: { department: "Engineering", role: "Developer", model: "zai/glm-5", provider: "vercel-ai-gateway", skills: ["web_development", "code_review"] } },
  { id: "analyst", name: "Data Analyst", description: "Metrics analysis and report generation", icon: "📊", config: { department: "Analytics", role: "Analyst", model: "zai/glm-5", provider: "vercel-ai-gateway", skills: ["database_design", "api_integration"] } },
  { id: "researcher", name: "Researcher", description: "Deep research and knowledge synthesis", icon: "🔬", config: { department: "Research", role: "Researcher", model: "zai/glm-5", provider: "vercel-ai-gateway", skills: ["security_audit"] } },
  { id: "devops", name: "DevOps Agent", description: "Infrastructure, CI/CD, and monitoring", icon: "⚙️", config: { department: "DevOps", role: "SRE", model: "zai/glm-5", provider: "vercel-ai-gateway", skills: ["api_integration"] } },
  { id: "writer", name: "Content Writer", description: "Marketing copy and documentation", icon: "✍️", config: { department: "Content", role: "Writer", model: "zai/glm-5", provider: "vercel-ai-gateway", skills: ["web_development"] } },
  { id: "qa", name: "QA Engineer", description: "Test planning and quality assurance", icon: "🎯", config: { department: "QA", role: "Tester", model: "zai/glm-5", provider: "vercel-ai-gateway", skills: ["code_review"] } },
];

export default function SpawnPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<SpawnTemplate | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🤖");
  const [spawning, setSpawning] = useState(false);
  const [spawned, setSpawned] = useState(false);

  const handleSpawn = () => {
    setSpawning(true);
    setTimeout(() => {
      setSpawning(false);
      setSpawned(true);
      setTimeout(() => setSpawned(false), 3000);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">⚡</span> Agent Spawn
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">RECRUITMENT_CENTER // SPAWN_AGENT // CONFIGURE</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Library */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono flex items-center gap-2">
            <span className="text-base">📦</span> Template Library
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEMPLATES.map((tpl, i) => (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setSelectedTemplate(tpl); setEmoji(tpl.icon); }}
                className={`glass-card p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedTemplate?.id === tpl.id ? "ring-1 ring-accent-blue/50 border-accent-blue/30" : ""
                }`}
              >
                <span className="text-3xl">{tpl.icon}</span>
                <h3 className="text-sm font-bold text-white mt-2">{tpl.name}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{tpl.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tpl.config.skills?.map(s => (
                    <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-accent-purple/10 text-accent-purple font-mono">{s}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Spawn Config */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono flex items-center gap-2">
            <span className="text-base">⚡</span> Configure & Spawn
          </h2>

          {selectedTemplate ? (
            <div className="space-y-3">
              {/* Preview */}
              <div className="text-center p-4 rounded-lg bg-ocean-950/50 border border-glass-border">
                <motion.span
                  key={emoji}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-5xl inline-block"
                >
                  {emoji}
                </motion.span>
                <h3 className="text-sm font-bold text-white mt-2">{name || selectedTemplate.name}</h3>
                <p className="text-[10px] text-gray-500">{selectedTemplate.config.department} · {selectedTemplate.config.role}</p>
              </div>

              {/* Config Fields */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={selectedTemplate.name}
                  className="w-full px-3 py-2 rounded-lg bg-ocean-900/50 border border-glass-border text-xs text-white placeholder:text-gray-600 outline-none focus:border-accent-blue/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Model</label>
                <div className="px-3 py-2 rounded-lg bg-ocean-900/50 border border-glass-border text-xs text-gray-400 font-mono">
                  {selectedTemplate.config.provider}/{selectedTemplate.config.model}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Est. Token Usage</label>
                <div className="px-3 py-2 rounded-lg bg-ocean-900/50 border border-glass-border text-xs font-mono">
                  <span className="text-accent-amber">~5,000</span>
                  <span className="text-gray-600"> tokens/day · </span>
                  <span className="text-accent-green">~$0.02/day</span>
                </div>
              </div>

              {/* Spawn Button */}
              <motion.button
                onClick={handleSpawn}
                disabled={spawning}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${
                  spawning
                    ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/30 animate-pulse"
                    : spawned
                    ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                    : "bg-accent-blue/20 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/30"
                }`}
              >
                {spawning ? "⚡ Spawning..." : spawned ? "✅ Agent Spawned!" : "⚡ Spawn Agent"}
              </motion.button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600 text-xs">
              <span className="text-4xl block mb-3">📦</span>
              Select a template to configure
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
