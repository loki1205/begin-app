"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDate, getDayKey, cn } from "@/lib/utils";
import { HabitRow } from "@/components/HabitRow";
import Link from "next/link";

export default function TodayPage() {
  const { state, setHabitStatus, deleteHabit, hydrated } = useAppStore();
  const [completedOpen, setCompletedOpen] = useState(false);
  const [skippedOpen, setSkippedOpen] = useState(false);
  const [now] = useState(() => new Date());

  const today = formatDate(now);
  const todayKey = getDayKey(now.getDay());

  const { todaysHabits, completed, skipped, pending } = useMemo(() => {
    const todaysHabits = state.habits.filter((h) => h.days.includes(todayKey));
    const logsToday = state.logs.filter((l) => l.date === today);

    const getStatus = (id: string) =>
      logsToday.find((l) => l.habitId === id)?.status ?? "pending";

    return {
      todaysHabits,
      completed: todaysHabits.filter((h) => getStatus(h.id) === "completed"),
      skipped: todaysHabits.filter((h) => getStatus(h.id) === "skipped"),
      pending: todaysHabits.filter((h) => getStatus(h.id) === "pending"),
    };
  }, [state.habits, state.logs, today, todayKey]);

  const total = todaysHabits.length;
  const completedCount = completed.length;
  const progress = total > 0 ? completedCount / total : 0;

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const greeting = (() => {
    const h = now.getHours();
    if (h < 5) return "Late night";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Tonight";
  })();

  if (!hydrated) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-10 lg:mb-14"
      >
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--fg-tertiary)] mb-2">
            {greeting}{state.userName && `, ${state.userName}`}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight">
            {dateStr}
          </h1>
          <div className="text-sm text-[var(--fg-secondary)] mt-2 tabular-nums">
            {timeStr}
          </div>
        </div>

        {/* Progress ring */}
        {total > 0 && (
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 aspect-square">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="6"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 42 * (1 - progress),
                }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--sage)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-lg sm:text-xl tabular-nums">
                {completedCount}
              </span>
              <span className="text-[10px] text-[var(--fg-tertiary)] -mt-0.5">
                of {total}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Pending habits */}
      {pending.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
          }}
          className="space-y-3 mb-8"
        >
          {pending.map((habit) => (
            <motion.div
              key={habit.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              <HabitRow
                habit={habit}
                status="pending"
                onStatusChange={(s) => setHabitStatus(habit.id, today, s)}
                onDelete={() => deleteHabit(habit.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => setCompletedOpen(!completedOpen)}
            className="w-full flex items-center justify-between px-2 py-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-[var(--sage)]" />
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--fg-tertiary)]">
                Completed · {completed.length}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[var(--fg-tertiary)] transition-transform duration-300",
                completedOpen && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {completedOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-2">
                  {completed.map((habit) => (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      status="completed"
                      onStatusChange={(s) => setHabitStatus(habit.id, today, s)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Skipped section */}
      {skipped.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <button
            onClick={() => setSkippedOpen(!skippedOpen)}
            className="w-full flex items-center justify-between px-2 py-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-[var(--fg-quaternary)]" />
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--fg-tertiary)]">
                Skipped · {skipped.length}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[var(--fg-tertiary)] transition-transform duration-300",
                skippedOpen && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence initial={false}>
            {skippedOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-2">
                  {skipped.map((habit) => (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      status="skipped"
                      onStatusChange={(s) => setHabitStatus(habit.id, today, s)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty state */}
      {total === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center py-20 sm:py-28"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-8 h-8 text-[var(--fg-tertiary)]" strokeWidth={1.2} />
          </motion.div>
          <h3 className="font-display text-3xl tracking-tight mb-3">
            No habits for today.
          </h3>
          <p className="text-[var(--fg-secondary)] mb-8 max-w-sm mx-auto">
            A blank page is its own kind of beginning.
          </p>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-elevated hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <span className="text-sm font-medium">Add your first ritual</span>
          </Link>
        </motion.div>
      )}

      {/* Hint when there are pending habits */}
      {pending.length > 0 && completedCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-[var(--fg-tertiary)] italic">
            Tap the circle to complete · Swipe right to skip
          </p>
        </motion.div>
      )}
    </div>
  );
}
