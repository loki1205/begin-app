"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Pencil, Trash2, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { DAY_KEYS, DAY_LABELS, getLevelName, cn } from "@/lib/utils";
import type { Habit, DayKey } from "@/lib/utils";

export default function TasksPage() {
  const router = useRouter();
  const { state, hydrated, deleteHabit } = useAppStore();
  const [selectedDays, setSelectedDays] = useState<DayKey[]>(() => [...DAY_KEYS]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const tasks = useMemo(() => state.habits, [state.habits]);

  const filteredTasks = useMemo(() => {
    if (selectedDays.length === 0) return [];
    return tasks.filter((habit) => habit.days.some((day) => selectedDays.includes(day)));
  }, [tasks, selectedDays]);

  const toggleDay = (day: DayKey) => {
    setSelectedDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
    );
  };

  const toggleAll = () => {
    setSelectedDays((days) =>
      days.length === DAY_KEYS.length ? [] : [...DAY_KEYS]
    );
  };

  if (!hydrated) return null;

  return (
    <div className="relative max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--fg-tertiary)] mb-2">
          Tasks
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight">
          All rituals
        </h1>
      </motion.div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-elevated rounded-3xl p-4 sm:p-5 flex flex-wrap items-center gap-2"
        >
          {DAY_KEYS.map((day) => {
            const active = selectedDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={cn(
                  "min-w-[44px] text-sm font-medium tracking-tight transition-all duration-300 rounded-2xl px-3 py-2",
                  active
                    ? "bg-gradient-to-br from-[var(--accent)] to-[var(--sage)] text-white"
                    : "glass-subtle text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                )}
              >
                {DAY_LABELS[day]}
              </button>
            );
          })}

          <button
            onClick={toggleAll}
            className="ml-auto text-[11px] uppercase tracking-wider text-[var(--accent)] hover:opacity-70 transition-opacity"
          >
            {selectedDays.length === DAY_KEYS.length ? "Clear all" : "Every day"}
          </button>
        </motion.div>

        {tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-elevated rounded-3xl p-6 sm:p-8 text-[var(--fg-secondary)]"
          >
            You haven’t added any rituals yet. Create one to see stability score,
            level, creation date, and completion count here.
          </motion.div>
        ) : selectedDays.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-elevated rounded-3xl p-6 sm:p-8 text-[var(--fg-secondary)]"
          >
            Select one or more days above to display matching tasks.
          </motion.div>
        ) : filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-elevated rounded-3xl p-6 sm:p-8 text-[var(--fg-secondary)]"
          >
            No rituals are scheduled for the selected day(s).
          </motion.div>
        ) : (
          filteredTasks.map((habit, index) => (
            <TaskCard
              key={habit.id}
              habit={habit}
              delay={index * 0.05}
              onEdit={() => router.push(`/edit/${habit.id}`)}
              onDelete={() => setDeleteTarget({ id: habit.id, name: habit.name })}
            />
          ))
        )}
      </div>

      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-[rgba(17,24,39,0.65)] backdrop-blur-sm z-10" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-20 flex items-center justify-center px-4 py-8"
          >
            <div className="w-full max-w-[680px] glass rounded-3xl p-6 sm:p-8 border border-red-200 shadow-[0_35px_60px_-35px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-red-600">
                Delete ritual?
              </div>
              <p className="text-[13px] text-[var(--fg-secondary)] mt-2">
                Do you want to keep existing logs for <span className="font-medium">{deleteTarget?.name}</span>?
                Keeping logs preserves history while removing the habit.
              </p>
            </div>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-full p-2 text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] transition-colors"
              aria-label="Close delete dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                if (!deleteTarget) return;
                deleteHabit(deleteTarget.id, true);
                setDeleteTarget(null);
              }}
              className="w-full inline-flex items-center justify-center rounded-2xl bg-[var(--sage)] text-white px-4 py-3 font-medium transition hover:opacity-90"
            >
              Keep logs and delete ritual
            </button>
            <button
              type="button"
              onClick={() => {
                if (!deleteTarget) return;
                deleteHabit(deleteTarget.id, false);
                setDeleteTarget(null);
              }}
              className="w-full inline-flex items-center justify-center rounded-2xl border border-red-300 text-red-600 px-4 py-3 font-medium transition hover:bg-red-50"
            >
              Delete ritual and logs
            </button>
          </div>
        </div>
      </motion.div>
        </>
      )}
    </div>
  );
}

function TaskCard({ habit, delay, onEdit, onDelete }: { habit: Habit; delay: number; onEdit: () => void; onDelete: () => void }) {
  const createdAt = new Date(habit.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const levelName = getLevelName(habit.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className="glass rounded-3xl p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="text-[15px] sm:text-base font-display tracking-tight">
              {habit.name}
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--fg-tertiary)] mt-3">
            Level {habit.level} · {levelName}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent-bg)] px-3 py-2 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--bg-tint)]"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--fg-quaternary)] px-3 py-2 text-sm font-medium text-[var(--fg-primary)] transition hover:bg-[var(--bg-tint)]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-[var(--bg-tint)] px-3 py-2 text-sm font-medium text-[var(--accent)] mt-4">
        <Sparkles className="w-4 h-4" strokeWidth={1.6} />
        <span>{Math.round(habit.stabilityScore)} stability</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 text-sm text-[var(--fg-secondary)]">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-tertiary)]">
            Created
          </div>
          <div>{createdAt}</div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-tertiary)]">
            Completed
          </div>
          <div>{habit.completionCount}</div>
        </div>
      </div>

      <div className="mt-6 text-[13px] text-[var(--fg-secondary)] uppercase tracking-[0.2em]">
        {habit.days.length === 7
          ? "Every day"
          : [...habit.days]
              .sort((a, b) => DAY_KEYS.indexOf(a) - DAY_KEYS.indexOf(b))
              .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
              .join(" · ")}
      </div>
    </motion.div>
  );
}
