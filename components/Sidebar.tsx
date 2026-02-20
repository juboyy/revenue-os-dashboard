"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMetrics } from "../lib/hooks";

const NAV_ITEMS = [
  { label: "Comando", href: "/", icon: "🎯" },
  { label: "Escritório", href: "/world", icon: "🏢" },
  { label: "Organograma", href: "/orgchart", icon: "🌳" },
  { label: "Tarefas", href: "/tasks", icon: "📋" },
  { label: "Calendário", href: "/calendar", icon: "🗓️" },
  { label: "Monitor", href: "/monitoring", icon: "📊" },
  { label: "Memória", href: "/memory", icon: "🧠" },
  { label: "Spawn", href: "/spawn", icon: "⚡" },
  { label: "Ranking", href: "/leaderboard", icon: "🏆" },
  { label: "Chat", href: "/interactions", icon: "💬" },
];

export default function TopNav() {
  const pathname = usePathname();
  const { metrics } = useMetrics();

  return (
    <nav className="w-full flex items-center h-12 border-b border-glass-border bg-ocean-950/90 backdrop-blur-xl px-4 gap-1 flex-shrink-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-4 flex-shrink-0">
        <span className="text-lg">🏴‍☠️</span>
        <span className="text-sm font-bold text-white tracking-tight hidden sm:inline">
          OpenClaw
        </span>
      </Link>

      {/* Nav Items */}
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-accent-blue/15 text-white"
                  : "text-gray-500 hover:text-gray-300 hover:bg-ocean-800/50"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span>{metrics.activeAgents}/{metrics.totalAgents} agents</span>
        </div>
      </div>
    </nav>
  );
}
