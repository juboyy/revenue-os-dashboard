"use client";

import { useMetrics } from "@/lib/hooks";

/* ─── Single metric card ─── */
function MetricCard({
  label,
  value,
  icon,
  color,
  suffix,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-[11px] uppercase tracking-widest text-gray-500 font-mono">
          {label}
        </span>
      </div>
      <div className="metric-value">
        <span className={`text-2xl font-bold font-mono ${color}`}>
          {suffix === "$"
            ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
            : value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/* ─── Uptime bar ─── */
function UptimeBar() {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-widest text-gray-500 font-mono flex items-center gap-2">
          <span className="text-xl">⏱️</span> Uptime
        </span>
        <span className="text-sm font-mono text-emerald-400 font-bold">100%</span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full w-full" />
      </div>
      <p className="text-[10px] text-gray-600 mt-1 font-mono">
        Supabase + Vercel • Zero downtime
      </p>
    </div>
  );
}

/* ─── Cron jobs ─── */
function CronJobs() {
  const jobs = [
    { name: "standup-report", schedule: "0 9 * * 1-5", next: "Mon 09:00 UTC", agent: "shanks" },
    { name: "metrics-digest", schedule: "0 */6 * * *", next: "~6h", agent: "chopper" },
    { name: "health-check", schedule: "*/5 * * * *", next: "~5min", agent: "jinbe" },
    { name: "content-pipeline", schedule: "0 10,16 * * *", next: "Mon 10:00 UTC", agent: "sanji" },
    { name: "budget-sweep", schedule: "0 0 * * *", next: "00:00 UTC", agent: "nami" },
  ];

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-[11px] uppercase tracking-widest text-gray-500 font-mono mb-3 flex items-center gap-2">
        <span className="text-xl">⏰</span> Cron Jobs
      </h3>
      <div className="space-y-2">
        {jobs.map((j) => (
          <div key={j.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-gray-300 font-mono">{j.name}</span>
            </div>
            <span className="text-gray-500 font-mono text-[10px]">{j.next}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Sidebar ─── */
export default function MetricsSidebar() {
  const { metrics, isLoading } = useMetrics();

  if (isLoading) {
    return (
      <aside className="space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-xl h-24" />
        ))}
      </aside>
    );
  }

  return (
    <aside className="space-y-3" style={{ animation: "slideInRight 0.5s ease-out" }}>
      <MetricCard
        label="Tasks Completed"
        value={metrics.totalTasksCompleted}
        icon="✅"
        color="text-emerald-400"
      />
      <MetricCard
        label="Tasks Pending"
        value={metrics.totalTasksPending}
        icon="📋"
        color="text-amber-400"
      />
      <MetricCard
        label="Tasks Blocked"
        value={metrics.totalTasksBlocked}
        icon="🚫"
        color="text-red-400"
      />
      <MetricCard
        label="Tokens Today"
        value={metrics.totalTokensToday}
        icon="🪙"
        color="text-cyan-400"
        suffix="$"
      />
      <MetricCard
        label="Agents Active"
        value={metrics.activeAgents}
        icon="🏴‍☠️"
        color="text-blue-400"
      />
      <UptimeBar />
      <CronJobs />
    </aside>
  );
}
