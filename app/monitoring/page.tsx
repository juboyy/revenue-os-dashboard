"use client";

import { useState } from "react";
import { useMonitoring } from "../../lib/hooks";
import { useDashboardStore } from "../../lib/store";
import type { MonitoringData } from "../../lib/types";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from "recharts";

const TABS = ["Overview", "Pricing", "Providers & Models", "Tools & Skills"] as const;
type Tab = typeof TABS[number];

function formatTokens(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}
function formatCost(n: number): string { return `$${n.toFixed(4)}`; }
function formatCostShort(n: number): string { return `$${n.toFixed(2)}`; }

const CHART_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"];

export default function MonitoringPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  
  // Try Convex first, fall back to Zustand mock
  const { monitoring: convexMonitoring } = useMonitoring();
  const { monitoring: storeMonitoring } = useDashboardStore();
  const monitoring = (convexMonitoring as MonitoringData | null) ?? storeMonitoring;

  if (!monitoring) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 font-mono text-sm animate-pulse">Loading monitoring data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📊</span> Monitoring
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">
          TOKEN_ANALYTICS // PROVIDER_METRICS // TOOL_USAGE
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-ocean-900/50 border border-glass-border w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
              tab === t
                ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                : "text-gray-500 hover:text-gray-300 border border-transparent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === "Overview" && <OverviewTab monitoring={monitoring} />}
        {tab === "Pricing" && <PricingTab monitoring={monitoring} />}
        {tab === "Providers & Models" && <ProvidersTab monitoring={monitoring} />}
        {tab === "Tools & Skills" && <ToolsSkillsTab monitoring={monitoring} />}
      </motion.div>
    </div>
  );
}

// ━━━ Overview Tab ━━━
function OverviewTab({ monitoring }: { monitoring: MonitoringData }) {
  const kpis = [
    { label: "Total Tokens", value: formatTokens(monitoring.totals.totalTokens), icon: "🔤", color: "text-accent-blue" },
    { label: "Total Cost", value: formatCostShort(monitoring.totals.totalCost), icon: "💰", color: "text-accent-amber" },
    { label: "Avg Latency", value: `${monitoring.latency?.avgMs ?? "—"}ms`, icon: "⚡", color: "text-accent-green" },
    { label: "P95 Latency", value: `${monitoring.latency?.p95Ms ?? "—"}ms`, icon: "📈", color: "text-accent-purple" },
    { label: "Providers", value: monitoring.byProvider.length.toString(), icon: "🔌", color: "text-accent-cyan" },
    { label: "Unique Tools", value: monitoring.tools.uniqueTools.toString(), icon: "🔧", color: "text-accent-pink" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="kpi-card">
            <div className="text-lg mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Daily Usage Chart */}
      <div className="glass-card p-5">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Daily Token Usage & Cost</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monitoring.daily}>
            <defs>
              <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v: number) => formatTokens(v)} />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
              itemStyle={{ color: "#d1d5db" }}
              labelStyle={{ color: "#9ca3af" }}
            />
            <Area type="monotone" dataKey="tokens" stroke="#3b82f6" fill="url(#tokenGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Errors + Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Messages & Tool Calls</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monitoring.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="messages" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="toolCalls" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Error Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monitoring.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: "#ef4444" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ━━━ Pricing Tab ━━━
function PricingTab({ monitoring }: { monitoring: MonitoringData }) {
  const { totals, byModel } = monitoring;
  const costBreakdown = [
    { name: "Input", value: totals.inputCost, color: "#3b82f6" },
    { name: "Output", value: totals.outputCost, color: "#10b981" },
    { name: "Cache Read", value: totals.cacheReadCost, color: "#8b5cf6" },
    { name: "Cache Write", value: totals.cacheWriteCost, color: "#f59e0b" },
  ];

  const tokenBreakdown = [
    { name: "Input", value: totals.input, color: "#3b82f6" },
    { name: "Output", value: totals.output, color: "#10b981" },
    { name: "Cache Read", value: totals.cacheRead, color: "#8b5cf6" },
    { name: "Cache Write", value: totals.cacheWrite, color: "#f59e0b" },
  ];

  // Cost per 1K tokens per model
  const costPerKTokens = byModel.map(m => ({
    model: m.model.length > 20 ? m.model.slice(0, 18) + "…" : m.model,
    inputPer1K: m.totals.totalTokens > 0 ? (m.totals.inputCost / (m.totals.input / 1000)) : 0,
    outputPer1K: m.totals.totalTokens > 0 ? (m.totals.outputCost / (m.totals.output / 1000)) : 0,
    total: m.totals.totalCost,
    tokens: m.totals.totalTokens,
  }));

  // Daily cost trend
  const dailyCost = monitoring.daily.map(d => ({
    date: d.date.slice(5),
    cost: d.cost,
  }));

  const totalDailyCost = monitoring.daily.reduce((s, d) => s + d.cost, 0);
  const dailyAvg = totalDailyCost / Math.max(monitoring.daily.length, 1);
  const burnRate30d = dailyAvg * 30;

  return (
    <div className="space-y-6">
      {/* Cost Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Cost", value: formatCostShort(totals.totalCost), icon: "💰", color: "text-accent-amber" },
          { label: "Daily Average", value: formatCostShort(dailyAvg), icon: "📅", color: "text-accent-blue" },
          { label: "30d Projection", value: formatCostShort(burnRate30d), icon: "🔥", color: "text-accent-red" },
          { label: "Cost/1K Tokens", value: formatCost(totals.totalCost / (totals.totalTokens / 1000)), icon: "📊", color: "text-accent-green" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="text-lg mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost Distribution Donut */}
        <div className="glass-card p-5">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Cost by Token Type</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={costBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                  {costBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatCostShort(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {costBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ background: item.color }} />
                  <span className="text-gray-400">{item.name}</span>
                  <span className="ml-auto text-white font-mono">{formatCostShort(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Token Distribution Donut */}
        <div className="glass-card p-5">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Token Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={tokenBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                  {tokenBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatTokens(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {tokenBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ background: item.color }} />
                  <span className="text-gray-400">{item.name}</span>
                  <span className="ml-auto text-white font-mono">{formatTokens(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Per 1K Tokens by Model */}
      <div className="glass-card p-5">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Price Comparison (per 1K tokens)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-glass-border">
                <th className="text-left py-2 px-3 font-medium">Model</th>
                <th className="text-right py-2 px-3 font-medium">Input/1K</th>
                <th className="text-right py-2 px-3 font-medium">Output/1K</th>
                <th className="text-right py-2 px-3 font-medium">Total Cost</th>
                <th className="text-right py-2 px-3 font-medium">Total Tokens</th>
              </tr>
            </thead>
            <tbody>
              {costPerKTokens.map((row, i) => (
                <tr key={i} className="border-b border-glass-border/50 hover:bg-glass-hover transition-colors">
                  <td className="py-2.5 px-3 text-white font-mono">{row.model}</td>
                  <td className="py-2.5 px-3 text-right text-accent-blue font-mono">{formatCost(row.inputPer1K)}</td>
                  <td className="py-2.5 px-3 text-right text-accent-green font-mono">{formatCost(row.outputPer1K)}</td>
                  <td className="py-2.5 px-3 text-right text-accent-amber font-mono">{formatCostShort(row.total)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-400 font-mono">{formatTokens(row.tokens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Burn Rate Chart */}
      <div className="glass-card p-5">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Daily Cost Burn Rate</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={dailyCost}>
            <defs>
              <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={(v: number) => `$${v.toFixed(2)}`} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => formatCostShort(Number(v))} />
            <Area type="monotone" dataKey="cost" stroke="#f59e0b" fill="url(#costGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ━━━ Providers & Models Tab ━━━
function ProvidersTab({ monitoring }: { monitoring: MonitoringData }) {
  const { byProvider, byModel } = monitoring;

  // Provider share data for pie
  const providerShare = byProvider.map(p => ({
    name: p.provider,
    value: p.count,
    tokens: p.totals.totalTokens,
    cost: p.totals.totalCost,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Provider Market Share */}
        <div className="glass-card p-5">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Provider Market Share</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={providerShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3} strokeWidth={0}>
                  {providerShare.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {providerShare.map((p, i) => (
                <div key={p.name} className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-white font-semibold">{p.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 pl-5 font-mono">
                    {p.value} calls · {formatTokens(p.tokens)} tokens · {formatCostShort(p.cost)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Provider Ranking */}
        <div className="glass-card p-5">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Provider Ranking</h3>
          <div className="space-y-3">
            {byProvider.map((p, i) => {
              const maxTokens = Math.max(...byProvider.map(x => x.totals.totalTokens));
              const pct = (p.totals.totalTokens / maxTokens) * 100;
              return (
                <div key={p.provider} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="text-base">{["🥇", "🥈", "🥉"][i] || "•"}</span>
                      <span className="text-white font-medium">{p.provider}</span>
                    </span>
                    <span className="text-gray-400 font-mono">{formatTokens(p.totals.totalTokens)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-ocean-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.15 }}
                      className="h-full rounded-full"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Rankings Table */}
      <div className="glass-card p-5">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Model Usage Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-glass-border">
                <th className="text-left py-2 px-3 font-medium">#</th>
                <th className="text-left py-2 px-3 font-medium">Model</th>
                <th className="text-left py-2 px-3 font-medium">Provider</th>
                <th className="text-right py-2 px-3 font-medium">Calls</th>
                <th className="text-right py-2 px-3 font-medium">Input</th>
                <th className="text-right py-2 px-3 font-medium">Output</th>
                <th className="text-right py-2 px-3 font-medium">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {byModel.map((m, i) => (
                <tr key={i} className="border-b border-glass-border/50 hover:bg-glass-hover transition-colors">
                  <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                  <td className="py-2.5 px-3 text-white font-mono">{m.model}</td>
                  <td className="py-2.5 px-3 text-gray-400">{m.provider || "—"}</td>
                  <td className="py-2.5 px-3 text-right text-accent-cyan font-mono">{m.count}</td>
                  <td className="py-2.5 px-3 text-right text-accent-blue font-mono">{formatTokens(m.totals.input)}</td>
                  <td className="py-2.5 px-3 text-right text-accent-green font-mono">{formatTokens(m.totals.output)}</td>
                  <td className="py-2.5 px-3 text-right text-accent-amber font-mono">{formatCostShort(m.totals.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ━━━ Tools & Skills Tab ━━━
function ToolsSkillsTab({ monitoring }: { monitoring: MonitoringData }) {
  const { tools, skills } = monitoring;
  const maxToolCount = Math.max(...tools.tools.map(t => t.count));
  const totalSkillChars = skills.reduce((s, sk) => s + sk.blockChars, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tool Calls", value: tools.totalCalls.toString(), icon: "🔧", color: "text-accent-blue" },
          { label: "Unique Tools", value: tools.uniqueTools.toString(), icon: "⚙️", color: "text-accent-purple" },
          { label: "Skills Loaded", value: skills.length.toString(), icon: "📚", color: "text-accent-green" },
          { label: "Skill Context", value: formatTokens(Math.floor(totalSkillChars / 4)), icon: "📏", color: "text-accent-amber" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="text-lg mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tool Usage Ranking */}
        <div className="glass-card p-5">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Tool Usage Ranking</h3>
          <div className="space-y-2.5">
            {tools.tools.map((tool, i) => {
              const pct = (tool.count / maxToolCount) * 100;
              return (
                <div key={tool.name} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-2">
                      <span className="text-accent-cyan text-[11px]">⚙</span>
                      <span className="text-gray-300 font-mono text-[11px]">{tool.name}</span>
                    </span>
                    <span className="text-gray-500 font-mono">{tool.count}×</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ocean-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills Context Weight */}
        <div className="glass-card p-5">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Skills Context Weight</h3>
          <div className="space-y-3">
            {skills.map((skill, i) => {
              const pct = (skill.blockChars / totalSkillChars) * 100;
              const tokenEstimate = Math.floor(skill.blockChars / 4);
              return (
                <div key={skill.name} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-2">
                      <span className="text-accent-purple text-[11px]">📚</span>
                      <span className="text-gray-300 font-mono text-[11px]">{skill.name}</span>
                    </span>
                    <span className="text-gray-500 font-mono text-[10px]">{formatTokens(tokenEstimate)} tokens</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ocean-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-pink"
                    />
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono mt-0.5">
                    {skill.blockChars.toLocaleString()} chars · {pct.toFixed(1)}% of context
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Context Budget */}
          <div className="mt-4 pt-4 border-t border-glass-border">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total Skill Context</span>
              <span className="text-white font-mono">{totalSkillChars.toLocaleString()} chars · ~{formatTokens(Math.floor(totalSkillChars / 4))} tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Usage Bar Chart */}
      <div className="glass-card p-5">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Tool Usage Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={tools.tools.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#6b7280" }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} width={140} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
