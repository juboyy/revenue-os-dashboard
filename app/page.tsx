"use client";

import OfficeFloor from "../components/OfficeFloor";
import MetricsSidebar from "../components/MetricsSidebar";
import { useAgents } from "../lib/hooks";

export default function HomePage() {
  const { agents, isLoading } = useAgents();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Main area — office floor */}
      <main className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <span className="text-6xl block mb-4" style={{ animation: "float 2s ease-in-out infinite" }}>
                ⛵
              </span>
              <p className="text-gray-500 font-mono text-sm animate-pulse">
                Loading crew stations...
              </p>
            </div>
          </div>
        ) : (
          <OfficeFloor agents={agents} />
        )}
      </main>

      {/* Sidebar — metrics */}
      <aside className="w-full lg:w-80 lg:border-l border-gray-800/50 p-4 overflow-auto bg-ocean-900/50">
        <div className="sticky top-4">
          <h2 className="text-[11px] uppercase tracking-widest text-gray-500 font-mono mb-4 flex items-center gap-2">
            <span className="text-lg">📊</span> Ship Metrics
          </h2>
          <MetricsSidebar />
        </div>
      </aside>
    </div>
  );
}
