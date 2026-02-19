"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const MOCK_EVENTS = [
  { id: "cron-1", title: "infra-health-check", type: "cron", date: "2026-02-19", time: "04:30", status: "✅" },
  { id: "cron-2", title: "billing-reconciliation", type: "cron", date: "2026-02-19", time: "06:00", status: "⏳" },
  { id: "task-1", title: "QA-001 edge-case validation", type: "task", date: "2026-02-19", time: "09:00", status: "⏳" },
  { id: "task-2", title: "DOC-003 update", type: "task", date: "2026-02-19", time: "14:00", status: "⏳" },
  { id: "cron-3", title: "daily-standup-slack", type: "cron", date: "2026-02-19", time: "12:00", status: "⏳" },
  { id: "rem-1", title: "Check PR backlog", type: "reminder", date: "2026-02-19", time: "16:00", status: "⏳" },
];

const TYPE_STYLES: Record<string, { color: string; bg: string }> = {
  cron: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  task: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  reminder: { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};

export default function CalendarPage() {
  const days = useMemo(() => {
    const list: string[] = [];
    const start = new Date("2026-02-17T00:00:00Z");
    for (let i = 0; i < 10; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      list.push(d.toISOString().slice(0, 10));
    }
    return list;
  }, []);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🗓️</span> Calendar
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">CRON_JOBS // TASKS // REMINDERS</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono mb-4">Upcoming Schedule</h2>
          <div className="space-y-3">
            {days.map((day) => (
              <div key={day} className="border border-glass-border rounded-lg p-3">
                <div className="text-xs text-gray-400 font-mono mb-2">{day}</div>
                <div className="space-y-2">
                  {MOCK_EVENTS.filter(e => e.date === day).map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-md"
                      style={{ background: TYPE_STYLES[event.type].bg }}
                    >
                      <span className="text-sm">{event.status}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white font-semibold truncate">{event.title}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{event.time} · {event.type.toUpperCase()}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ color: TYPE_STYLES[event.type].color, background: `${TYPE_STYLES[event.type].color}1A` }}>
                        {event.type}
                      </span>
                    </motion.div>
                  ))}
                  {MOCK_EVENTS.filter(e => e.date === day).length === 0 && (
                    <div className="text-[10px] text-gray-600 font-mono">No events</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-mono">Create Reminder</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Title</label>
              <input className="w-full mt-1 px-3 py-2 rounded bg-ocean-900/50 border border-glass-border text-xs text-white" placeholder="Reminder title" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Date</label>
              <input className="w-full mt-1 px-3 py-2 rounded bg-ocean-900/50 border border-glass-border text-xs text-white" type="date" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Time</label>
              <input className="w-full mt-1 px-3 py-2 rounded bg-ocean-900/50 border border-glass-border text-xs text-white" type="time" />
            </div>
            <button className="w-full py-2 rounded bg-accent-blue/20 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/30 transition">Schedule Reminder</button>
          </div>
        </div>
      </div>
    </div>
  );
}
