"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, useCronJobs, useEvents } from "../../lib/hooks";

const DAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DAY_NAMES_FULL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  active:      { dot: "bg-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-300" },
  paused:      { dot: "bg-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     text: "text-amber-300" },
  error:       { dot: "bg-red-400",     bg: "bg-red-500/10 border-red-500/20",         text: "text-red-300" },
  in_progress: { dot: "bg-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",       text: "text-blue-300" },
  done:        { dot: "bg-gray-500",    bg: "bg-gray-500/10 border-gray-500/20",       text: "text-gray-400" },
  backlog:     { dot: "bg-violet-400",  bg: "bg-violet-500/10 border-violet-500/20",   text: "text-violet-300" },
  blocked:     { dot: "bg-orange-400",  bg: "bg-orange-500/10 border-orange-500/20",   text: "text-orange-300" },
  review:      { dot: "bg-cyan-400",    bg: "bg-cyan-500/10 border-cyan-500/20",       text: "text-cyan-300" },
};

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
}

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { tasks } = useTasks();
  const { cronJobs } = useCronJobs();
  const { events } = useEvents(50);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startStr = `${start.getDate()} ${start.toLocaleDateString("pt-BR", { month: "short" })}`;
    const endStr = `${end.getDate()} ${end.toLocaleDateString("pt-BR", { month: "short" })}`;
    return `${startStr} — ${endStr}`;
  }, [weekDates]);

  // Group items by date
  const dayItems = useMemo(() => {
    const map: Record<string, Array<{ id: string; title: string; type: "cron" | "task" | "event"; status: string; time?: string }>> = {};

    weekDates.forEach(d => {
      const key = formatDate(d);
      map[key] = [];
    });

    // Add cron jobs (repeat every day based on schedule)
    cronJobs.forEach((cron: any) => {
      weekDates.forEach(d => {
        const key = formatDate(d);
        map[key]?.push({
          id: `cron-${cron._id}-${key}`,
          title: cron.name || cron.cronId,
          type: "cron",
          status: cron.status || "active",
          time: cron.schedule,
        });
      });
    });

    // Add tasks with creation dates
    tasks.forEach((task: any) => {
      const taskDate = task._creationTime
        ? new Date(task._creationTime).toISOString().slice(0, 10)
        : null;
      if (taskDate && map[taskDate]) {
        map[taskDate].push({
          id: `task-${task._id}`,
          title: task.title || task.taskId || "Untitled",
          type: "task",
          status: task.status || "backlog",
        });
      }
    });

    // Add events
    events.forEach((evt: any) => {
      const evtDate = evt._creationTime
        ? new Date(evt._creationTime).toISOString().slice(0, 10)
        : null;
      if (evtDate && map[evtDate]) {
        map[evtDate].push({
          id: `evt-${evt._id}`,
          title: evt.description || evt.eventType,
          type: "event",
          status: evt.eventType || "heartbeat",
        });
      }
    });

    return map;
  }, [weekDates, cronJobs, tasks, events]);

  const typeIcons: Record<string, string> = {
    cron: "⏱️",
    task: "📋",
    event: "⚡",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🗓️</span> Calendário Semanal
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            CRON_JOBS // TASKS // EVENTS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="w-9 h-9 rounded-lg bg-ocean-800/60 border border-glass-border text-gray-400 hover:text-white hover:bg-ocean-700 transition-all flex items-center justify-center text-lg"
          >
            ←
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-4 py-2 rounded-lg bg-ocean-800/60 border border-glass-border text-sm font-mono text-gray-300 hover:text-white hover:bg-ocean-700 transition-all min-w-[180px] text-center"
          >
            {weekOffset === 0 ? "Esta semana" : weekLabel}
          </button>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-9 h-9 rounded-lg bg-ocean-800/60 border border-glass-border text-gray-400 hover:text-white hover:bg-ocean-700 transition-all flex items-center justify-center text-lg"
          >
            →
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1.5">
            <span>⏱️</span><span className="text-gray-500">CRON</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span>📋</span><span className="text-gray-500">TASK</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span>⚡</span><span className="text-gray-500">EVENT</span>
          </span>
        </div>
      </div>

      {/* Week Grid — fills remaining space */}
      <div className="flex-1 grid grid-cols-7 gap-2 min-h-0">
        {weekDates.map((date, i) => {
          const key = formatDate(date);
          const items = dayItems[key] || [];
          const today = isToday(date);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex flex-col rounded-xl border overflow-hidden ${
                today
                  ? "border-accent-blue/40 bg-accent-blue/5"
                  : "border-glass-border bg-ocean-900/40"
              }`}
            >
              {/* Day Header */}
              <div className={`px-3 py-2.5 border-b flex items-center justify-between ${
                today ? "border-accent-blue/20 bg-accent-blue/10" : "border-glass-border bg-ocean-800/30"
              }`}>
                <div>
                  <div className={`text-[10px] font-mono uppercase tracking-wider ${
                    today ? "text-accent-blue" : "text-gray-500"
                  }`}>
                    {DAY_NAMES[i]}
                  </div>
                  <div className={`text-lg font-bold ${today ? "text-white" : "text-gray-300"}`}>
                    {date.getDate()}
                  </div>
                </div>
                {items.length > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    today ? "bg-accent-blue/20 text-accent-blue" : "bg-ocean-800 text-gray-500"
                  }`}>
                    {items.length}
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                <AnimatePresence>
                  {items.map((item, idx) => {
                    const colors = STATUS_COLORS[item.status] || STATUS_COLORS.backlog;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`p-2 rounded-lg border ${colors.bg} group cursor-default`}
                      >
                        <div className="flex items-start gap-1.5">
                          <span className="text-xs flex-shrink-0 mt-0.5">{typeIcons[item.type]}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-white truncate leading-tight">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                              <span className={`text-[9px] font-mono uppercase ${colors.text}`}>
                                {item.status}
                              </span>
                              {item.time && (
                                <span className="text-[9px] font-mono text-gray-600 ml-auto">
                                  {item.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {items.length === 0 && (
                  <div className="flex items-center justify-center h-full text-[10px] text-gray-700 font-mono">
                    Sem eventos
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
