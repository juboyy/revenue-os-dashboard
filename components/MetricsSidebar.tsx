"use client";

import { useMetrics } from "../lib/hooks";

function MetricRow({ label, value, color = "text-cyber-cyan" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-800 py-2">
      <span className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
      <span className={`font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}

function ProgressBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[9px] uppercase mb-1 text-gray-500">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1 w-full bg-gray-800 relative overflow-hidden">
        <div 
          className="h-full bg-cyber-cyan shadow-neon-cyan absolute top-0 left-0"
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
}

export default function MetricsSidebar() {
  const { metrics, isLoading } = useMetrics();

  if (isLoading) return <div className="animate-pulse h-full bg-gray-900/50" />;

  return (
    <aside className="w-80 hidden lg:flex flex-col border-l border-gray-800 bg-obsidian/90 backdrop-blur-md p-6 h-screen sticky top-0 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 pb-2 border-b-2 border-cyber-cyan">
        <h2 className="text-sm font-bold text-white uppercase tracking-widest">
          DIAGNOSTICS
        </h2>
        <p className="text-[9px] text-gray-500 font-mono">LIVE TELEMETRY FEED</p>
      </div>

      {/* Main Metrics */}
      <div className="mb-8">
        <MetricRow label="Active Agents" value={metrics.activeAgents} color="text-cyber-yellow" />
        <MetricRow label="Tasks Done" value={metrics.totalTasksCompleted} />
        <MetricRow label="Tasks Pending" value={metrics.totalTasksPending} color="text-cyber-purple" />
        <MetricRow label="Tokens Today" value={metrics.totalTokensToday.toLocaleString()} />
      </div>

      {/* System Health */}
      <div className="mb-8 p-4 border border-gray-800 bg-void/50">
        <h3 className="text-[10px] text-cyber-cyan mb-3 uppercase tracking-widest border-b border-gray-800 pb-1">
          System Resources
        </h3>
        <ProgressBar label="CPU Load" percent={42} />
        <ProgressBar label="Memory" percent={68} />
        <ProgressBar label="Network" percent={24} />
      </div>

      {/* Log Feed Mockup */}
      <div className="flex-1 font-mono text-[9px] text-gray-600 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-obsidian pointer-events-none" />
        <div className="space-y-1 opacity-70">
          <p>{">"} INITIATING HANDSHAKE...</p>
          <p>{">"} CONNECTED TO SUPABASE [OK]</p>
          <p>{">"} SYNCING AGENT STATES...</p>
          <p>{">"} CRON_JOB: INFRA_HEALTH [Running]</p>
          <p>{">"} PACKET_LOSS: 0.0%</p>
          <p>{">"} SYSTEM STABLE</p>
        </div>
      </div>
    </aside>
  );
}
