"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboardStore } from "../lib/store";
import { useMetrics } from "../lib/hooks";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Central de Comando", href: "/", icon: "🎯" },
  { label: "Escritório Virtual", href: "/world", icon: "🏢" },
  { label: "Organograma", href: "/orgchart", icon: "🌳" },
  { label: "Tarefas", href: "/tasks", icon: "📋" },
  { label: "Monitoramento", href: "/monitoring", icon: "📊" },
  { label: "Memória", href: "/memory", icon: "🧠" },
  { label: "Spawn", href: "/spawn", icon: "⚡" },
  { label: "Ranking", href: "/leaderboard", icon: "🏆" },
  { label: "Interações", href: "/interactions", icon: "💬" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useDashboardStore();
  const { metrics } = useMetrics();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-screen flex flex-col border-r border-glass-border bg-ocean-950/80 backdrop-blur-xl overflow-hidden flex-shrink-0"
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-glass-border min-h-[64px]">
        <button
          onClick={toggleSidebar}
          className="text-xl hover:scale-110 transition-transform flex-shrink-0"
          title={sidebarCollapsed ? "Expand" : "Collapse"}
        >
          🏴‍☠️
        </button>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-xs font-bold tracking-widest text-accent-blue uppercase">
                REVENUE OS
              </h1>
              <p className="text-[10px] text-gray-500 font-mono">v5.0 // TACTICAL</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? "active" : ""}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Agent Status Footer */}
      <div className="p-3 border-t border-glass-border">
        <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
          <div className="relative flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-accent-green status-active" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-mono"
              >
                <span className="text-accent-green">{metrics.activeAgents}</span>
                <span className="text-gray-500"> / {metrics.totalAgents} agentes online</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
