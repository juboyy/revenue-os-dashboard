"use client";

import { useState, useMemo, useCallback } from "react";
import { useDashboardStore } from "../../lib/store";
import { KANBAN_COLUMNS, PRIORITY_CONFIG } from "../../lib/types";
import type { TaskItem, TaskStatus as TStatus, TaskPriority } from "../../lib/types";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const { tasks, moveTask, agents } = useDashboardStore();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const filteredTasks = useMemo(() => {
    let t = tasks;
    if (filterAgent !== "all") t = t.filter(x => x.assignee === filterAgent);
    if (filterPriority !== "all") t = t.filter(x => x.priority === filterPriority);
    return t;
  }, [tasks, filterAgent, filterPriority]);

  const tasksByCol = useMemo(() => {
    const m: Record<string, TaskItem[]> = {};
    KANBAN_COLUMNS.forEach(c => m[c.id] = []);
    filteredTasks.forEach(t => { if (m[t.status]) m[t.status].push(t); });
    return m;
  }, [filteredTasks]);

  const handleDragStart = useCallback((taskId: string) => setDraggedTask(taskId), []);
  const handleDragEnd = useCallback(() => { setDraggedTask(null); setDragOverCol(null); }, []);
  const handleDrop = useCallback((colId: string) => {
    if (draggedTask) moveTask(draggedTask, colId as TStatus);
    setDraggedTask(null);
    setDragOverCol(null);
  }, [draggedTask, moveTask]);

  const agentMap = useMemo(() => {
    const m: Record<string, { name: string; emoji: string }> = {};
    agents.forEach(a => m[a.id] = { name: a.name, emoji: a.emoji });
    return m;
  }, [agents]);

  // Summary stats
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const blocked = tasks.filter(t => t.status === "blocked").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">📋</span> Task Board
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">KANBAN // DRAG_DROP // CREW_TASKS</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Total", value: total, color: "text-gray-300" },
            { label: "In Progress", value: inProgress, color: "text-accent-amber" },
            { label: "Done", value: done, color: "text-accent-green" },
            { label: "Blocked", value: blocked, color: "text-accent-red" },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card px-3 py-2">
              <div className={`text-sm font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[9px] text-gray-600 uppercase">{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase font-mono">Agent:</span>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="bg-ocean-900 text-xs text-gray-300 px-2 py-1.5 rounded-md border border-glass-border outline-none focus:border-accent-blue"
          >
            <option value="all">All Agents</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
            <option value="">Unassigned</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase font-mono">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-ocean-900 text-xs text-gray-300 px-2 py-1.5 rounded-md border border-glass-border outline-none focus:border-accent-blue"
          >
            <option value="all">All</option>
            {(["critical", "high", "medium", "low"] as TaskPriority[]).map(p => (
              <option key={p} value={p}>{PRIORITY_CONFIG[p].icon} {PRIORITY_CONFIG[p].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {KANBAN_COLUMNS.map(col => {
          const colTasks = tasksByCol[col.id] || [];
          return (
            <div key={col.id} className="kanban-column">
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{col.icon}</span>
                  <span className="text-xs font-bold text-white">{col.label}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{ color: col.color, background: `${col.color}15` }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Column Body */}
              <div
                className={`kanban-column-body ${dragOverCol === col.id ? "drag-over" : ""}`}
                onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => { e.preventDefault(); handleDrop(col.id); }}
              >
                <AnimatePresence>
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      agentMap={agentMap}
                      isDragging={draggedTask === task.id}
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </AnimatePresence>
                {colTasks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-[10px] text-gray-700 font-mono py-8">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Task Card ── */
function TaskCard({
  task,
  agentMap,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  task: TaskItem;
  agentMap: Record<string, { name: string; emoji: string }>;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const pr = PRIORITY_CONFIG[task.priority];
  const agent = task.assignee ? agentMap[task.assignee] : null;
  const timeAgo = getTimeAgo(task.updated_at);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`kanban-card ${isDragging ? "dragging" : ""}`}
      style={{ borderLeft: `3px solid ${pr.color}` }}
    >
      {/* Priority + Time */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
          style={{ color: pr.color, background: `${pr.color}15` }}>
          {pr.icon} {pr.label}
        </span>
        <span className="text-[9px] text-gray-600 font-mono">{timeAgo}</span>
      </div>

      {/* Title */}
      <h4 className="text-xs font-bold text-white mb-1 leading-snug">{task.title}</h4>
      <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">{task.description}</p>

      {/* Assignee */}
      <div className="flex items-center justify-between">
        {agent ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{agent.emoji}</span>
            <span className="text-[10px] text-gray-400">{agent.name}</span>
          </div>
        ) : (
          <span className="text-[10px] text-gray-600 italic">Unassigned</span>
        )}
        <span className="text-[9px] text-gray-700 font-mono">{task.id}</span>
      </div>
    </motion.div>
  );
}

function getTimeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}
