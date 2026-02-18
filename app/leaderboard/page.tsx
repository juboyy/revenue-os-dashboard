"use client";

import { useDashboardStore } from "../../lib/store";
import { getLevelFromXP, LEVEL_TITLES } from "../../lib/types";
import { motion } from "framer-motion";

const RARITY_COLORS = { common: "#6b7280", rare: "#3b82f6", epic: "#8b5cf6", legendary: "#f59e0b" };

export default function LeaderboardPage() {
  const { agents } = useDashboardStore();
  const sorted = [...agents].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🏆</span> Ranking
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">RANKING_XP // CONQUISTAS // STATS_TRIPULAÇÃO</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {[1, 0, 2].map((rank) => {
          const agent = sorted[rank];
          if (!agent) return null;
          const lvl = getLevelFromXP(agent.xp);
          const isFirst = rank === 0;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rank * 0.1 }}
              className={`glass-card p-5 text-center ${isFirst ? "order-first lg:order-none ring-1 ring-accent-amber/30 lg:-mt-4" : ""}`}
              style={isFirst ? { boxShadow: "0 0 30px rgba(245,158,11,0.15)" } : undefined}
            >
              <div className="text-3xl mb-1">{["🥇", "🥈", "🥉"][rank]}</div>
              <span className="text-4xl">{agent.emoji}</span>
              <h3 className="text-sm font-bold text-white mt-2">{agent.name}</h3>
              <p className="text-[10px] text-gray-500">{agent.department}</p>
              <div className="mt-3 text-xl font-bold text-accent-purple">{(agent.xp ?? 0).toLocaleString()} XP</div>
              <div className="text-[10px] text-accent-blue font-mono">Nv.{lvl.level} {lvl.title}</div>
              <div className="mt-2 xp-bar">
                <div className="xp-bar-fill animate-xp-fill" style={{ width: `${lvl.progress}%` }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Ranking Table */}
      <div className="glass-card p-5">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Ranking Completo</h2>
        <div className="space-y-2">
          {sorted.map((agent, i) => {
            const lvl = getLevelFromXP(agent.xp);
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-ocean-900/30 hover:bg-ocean-900/50 transition-colors"
              >
                <span className="text-sm font-bold text-gray-600 w-6 text-center">{i + 1}</span>
                <span className="text-2xl">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{agent.name}</span>
                    <span className="text-[10px] text-accent-blue font-mono px-1.5 py-0.5 rounded bg-accent-blue/10">
                      Nv.{lvl.level} {lvl.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">{agent.department}</p>
                </div>
                <div className="flex items-center gap-6 text-xs font-mono">
                  <div className="text-center">
                    <div className="text-accent-purple font-bold">{(agent.xp ?? 0).toLocaleString()}</div>
                    <div className="text-[9px] text-gray-600">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-accent-green">{agent.tasks_completed ?? 0}</div>
                    <div className="text-[9px] text-gray-600">TAREFAS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-accent-amber">{agent.streak_days ?? 0}d</div>
                    <div className="text-[9px] text-gray-600">SEQUÊNCIA</div>
                  </div>
                  <div className="w-24">
                    <div className="xp-bar">
                      <div className="xp-bar-fill" style={{ width: `${lvl.progress}%` }} />
                    </div>
                    <div className="text-[9px] text-gray-600 mt-0.5 text-right">{lvl.progress.toFixed(0)}%</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats Radar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.slice(0, 6).map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{agent.emoji}</span>
              <div>
                <h3 className="text-xs font-bold text-white">{agent.name}</h3>
                <p className="text-[10px] text-gray-500">{agent.department}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {Object.entries(agent.stats ?? { speed: 0, accuracy: 0, versatility: 0, reliability: 0, creativity: 0 }).map(([stat, val]) => (
                <div key={stat} className="flex items-center gap-2 text-[11px]">
                  <span className="text-gray-500 w-20 capitalize">{stat}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-ocean-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{
                        background: val >= 90 ? "#10b981" : val >= 75 ? "#3b82f6" : val >= 60 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                  <span className="text-gray-500 font-mono w-6 text-right">{val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
