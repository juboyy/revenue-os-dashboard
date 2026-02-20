"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PIPELINE_STAGES = [
  { id: "idea", label: "Ideias", icon: "💡", color: "#60a5fa" },
  { id: "planning", label: "Planejamento", icon: "📝", color: "#f59e0b" },
  { id: "script", label: "Script", icon: "✍️", color: "#8b5cf6" },
  { id: "thumbnail", label: "Thumbnail", icon: "🖼️", color: "#10b981" },
  { id: "filming", label: "Filmagem", icon: "🎬", color: "#06b6d4" },
  { id: "editing", label: "Edição", icon: "✂️", color: "#f97316" },
  { id: "published", label: "Publicação", icon: "🚀", color: "#22c55e" },
] as const;

export default function ContentPipelinePage() {
  const [items] = useState(() => ([
    { id: "c1", title: "Agentic Commerce — visão geral", stage: "idea", owner: "Robin" },
    { id: "c2", title: "SPT Explained", stage: "planning", owner: "Sanji" },
    { id: "c3", title: "Mission Control walkthrough", stage: "script", owner: "Robin" },
    { id: "c4", title: "Dashboard teaser", stage: "thumbnail", owner: "Sanji" },
    { id: "c5", title: "LLM Proxy demo", stage: "filming", owner: "Chopper" },
    { id: "c6", title: "Revenue OS demo", stage: "editing", owner: "Sanji" },
    { id: "c7", title: "Product update #12", stage: "published", owner: "Robin" },
  ]));

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🧭</span> Content Pipeline
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">IDEA → SCRIPT → PUBLISH // AUTOMATION READY</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
        {PIPELINE_STAGES.map(stage => {
          const stageItems = items.filter(i => i.stage === stage.id);
          return (
            <div key={stage.id} className="glass-card p-3 min-h-[520px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span>{stage.icon}</span>
                  <span className="text-xs font-semibold text-white">{stage.label}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ color: stage.color, background: `${stage.color}15` }}>{stageItems.length}</span>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {stageItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="p-3 rounded-lg bg-ocean-900/50 border border-glass-border"
                    >
                      <p className="text-xs font-semibold text-white mb-1">{item.title}</p>
                      <p className="text-[10px] text-gray-500">Owner: {item.owner}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
