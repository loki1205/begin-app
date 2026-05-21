"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { DAY_KEYS, DAY_LABELS, getLevelName, cn } from "@/lib/utils";
import type { Habit, DayKey } from "@/lib/utils";

export default function TasksPage() {
  const { state, hydrated } = useAppStore();
  const [selectedDays, setSelectedDays] = useState<DayKey[]>(() => [...DAY_KEYS]);

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
    <div className="max-w-3xl mx-auto">
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
            <TaskCard key={habit.id} habit={habit} delay={index * 0.05} />
          ))
        )}
      </div>
    </div>
  );
}

function TaskCard({ habit, delay }: { habit: Habit; delay: number }) {
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
          <div className="text-[15px] sm:text-base font-display tracking-tight">
            {habit.name}
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--fg-tertiary)] mt-3">
            Level {habit.level} · {levelName}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-[var(--bg-tint)] px-3 py-2 text-sm font-medium text-[var(--accent)]">
          <Sparkles className="w-4 h-4" strokeWidth={1.6} />
          <span>{Math.round(habit.stabilityScore)} stability</span>
        </div>
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
