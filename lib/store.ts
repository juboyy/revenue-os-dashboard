/**
 * Zustand global store — UI-only state for the dashboard.
 * 
 * Data fetching is now handled by Convex reactive queries in lib/hooks.ts.
 * This store ONLY manages client-side UI state like sidebar collapse,
 * selected agent, and monitoring data (until Convex-connected).
 */
import { create } from "zustand";
import type { MonitoringData } from "./types";

// ━━━ Store Interface ━━━
interface DashboardStore {
  // UI State
  selectedAgent: string | null;
  selectAgent: (id: string | null) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Monitoring (still mock until Vercel AI SDK connected)
  monitoring: MonitoringData | null;
  setMonitoring: (data: MonitoringData) => void;

  // Initialize monitoring mock (temporary)
  initialize: () => void;
}

/** Generates monitoring data — TEMPORARY until Vercel AI SDK connected */
function generateMockMonitoring(): MonitoringData {
  return {
    totals: {
      input: 245000, output: 189000, cacheRead: 52000, cacheWrite: 18000,
      totalTokens: 504000, totalCost: 2.47,
      inputCost: 0.98, outputCost: 1.13, cacheReadCost: 0.21, cacheWriteCost: 0.15,
    },
    byProvider: [
      { provider: "ollama", count: 142, totals: { input: 200000, output: 155000, cacheRead: 52000, cacheWrite: 18000, totalTokens: 425000, totalCost: 2.08, inputCost: 0.8, outputCost: 0.93, cacheReadCost: 0.21, cacheWriteCost: 0.14 } },
      { provider: "google", count: 28, totals: { input: 30000, output: 22000, cacheRead: 0, cacheWrite: 0, totalTokens: 52000, totalCost: 0.26, inputCost: 0.12, outputCost: 0.14, cacheReadCost: 0, cacheWriteCost: 0 } },
      { provider: "vercel-ai-gateway", count: 12, totals: { input: 15000, output: 12000, cacheRead: 0, cacheWrite: 0, totalTokens: 27000, totalCost: 0.13, inputCost: 0.06, outputCost: 0.07, cacheReadCost: 0, cacheWriteCost: 0 } },
    ],
    byModel: [
      { model: "minimax-m2.5:cloud", provider: "ollama", count: 142, totals: { input: 200000, output: 155000, cacheRead: 52000, cacheWrite: 18000, totalTokens: 425000, totalCost: 2.08, inputCost: 0.8, outputCost: 0.93, cacheReadCost: 0.21, cacheWriteCost: 0.14 } },
      { model: "gemini-3-flash-preview", provider: "google", count: 28, totals: { input: 30000, output: 22000, cacheRead: 0, cacheWrite: 0, totalTokens: 52000, totalCost: 0.26, inputCost: 0.12, outputCost: 0.14, cacheReadCost: 0, cacheWriteCost: 0 } },
    ],
    tools: {
      totalCalls: 386,
      uniqueTools: 12,
      tools: [
        { name: "grep_search", count: 87 },
        { name: "view_file", count: 74 },
        { name: "write_to_file", count: 62 },
        { name: "run_command", count: 53 },
        { name: "list_dir", count: 41 },
        { name: "replace_file_content", count: 28 },
        { name: "browser_subagent", count: 18 },
        { name: "search_web", count: 12 },
        { name: "generate_image", count: 6 },
        { name: "read_url_content", count: 3 },
        { name: "view_code_item", count: 1 },
        { name: "send_command_input", count: 1 },
      ],
    },
    skills: [
      { name: "code_review", blockChars: 4200 },
      { name: "web_development", blockChars: 6800 },
      { name: "api_integration", blockChars: 3500 },
      { name: "database_design", blockChars: 2900 },
      { name: "security_audit", blockChars: 5100 },
    ],
    daily: Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return {
        date: d.toISOString().split("T")[0],
        tokens: 25000 + Math.floor(Math.random() * 40000),
        cost: 0.12 + Math.random() * 0.35,
        messages: 40 + Math.floor(Math.random() * 60),
        toolCalls: 15 + Math.floor(Math.random() * 35),
        errors: Math.floor(Math.random() * 5),
      };
    }),
    latency: { avgMs: 420, p95Ms: 1200, minMs: 89, maxMs: 3800 },
  };
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  // UI State
  selectedAgent: null,
  selectAgent: (id) => set({ selectedAgent: id }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // Monitoring — still mock, will be replaced by Vercel AI SDK
  monitoring: null,
  setMonitoring: (data) => set({ monitoring: data }),

  initialize: () => {
    set({
      monitoring: generateMockMonitoring(),
    });
  },
}));
