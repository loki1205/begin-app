"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { DAY_KEYS, DAY_LABELS, cn, getLevelName } from "@/lib/utils";
import type { DayKey } from "@/lib/utils";

export default function EditHabitPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const habitId = params?.id;
  const { state, hydrated, updateHabit } = useAppStore();

  const habit = state.habits.find((h) => h.id === habitId);
  const [name, setName] = useState("");
  const [days, setDays] = useState<DayKey[]>([]);

  useEffect(() => {
    if (!habit) return;
    setName(habit.name);
    setDays(habit.days);
  }, [habit]);

  const toggleDay = (day: DayKey) => {
    setDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day]));
  };

  const toggleAll = () => {
    if (days.length === 7) setDays([]);
    else setDays([...DAY_KEYS]);
  };

  const canSubmit = name.trim().length > 0 && days.length > 0;

  const handleSubmit = () => {
    if (!habit || !canSubmit) return;
    updateHabit({
      ...habit,
      name: name.trim(),
      days,
    });
    router.push("/tasks");
  };

  const level = habit.level;
  const levelName = getLevelName(level);

  if (!hydrated) return null;

  if (!habitId || !habit) {
    return (
      <div className="max-w-xl mx-auto mt-16 glass rounded-3xl p-8 text-center">
        <div className="text-lg font-semibold">Ritual not found.</div>
        <p className="mt-3 text-[var(--fg-secondary)]">
          The ritual you are trying to edit does not exist or was removed.
        </p>
        <button
          onClick={() => router.push("/tasks")}
          className="mt-8 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Back to tasks
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-[var(--fg-tertiary)] mb-2">
          <button
            onClick={() => router.push("/tasks")}
            className="rounded-full p-2 bg-[var(--bg-tint)] text-[var(--accent)] transition hover:bg-[var(--bg-subtle)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          Edit ritual
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight">
          Update your ritual.
        </h1>
        <p className="text-[var(--fg-secondary)] mt-3">
          Make small adjustments to keep your routine aligned with how you actually show up.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-8"
      >
        <div>
          <label className="text-[10px] uppercase tracking-[0.25em] text-[var(--fg-tertiary)] mb-3 block">
            What ritual?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Read for ten minutes"
            maxLength={64}
            autoFocus
            className="w-full bg-transparent border-0 border-b border-[var(--border-strong)] focus:border-[var(--accent)] py-3 text-2xl font-display tracking-tight placeholder:text-[var(--fg-quaternary)] rounded-none placeholder:italic transition-colors !rounded-none !outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] uppercase tracking-[0.25em] text-[var(--fg-tertiary)]">
              On which days?
            </label>
            <button
              onClick={toggleAll}
              className="text-[11px] uppercase tracking-wider text-[var(--accent)] hover:opacity-70 transition-opacity"
            >
              {days.length === 7 ? "Clear all" : "Every day"}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {DAY_KEYS.map((d) => {
              const active = days.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={cn(
                    "flex-1 min-w-[44px] h-12 rounded-2xl text-sm font-medium tracking-tight transition-all duration-300 relative overflow-hidden",
                    active
                      ? "bg-gradient-to-br from-[var(--accent)] to-[var(--sage)] text-white glossy depth-1 scale-100"
                      : "glass-subtle text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                  )}
                >
                  {DAY_LABELS[d]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--sage)]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.6} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-tertiary)]">
              Current level
            </div>
            <div className="font-display text-lg tracking-tight">
              Level {habit.level} — {levelName}
            </div>
          </div>
          <div className="text-xs text-[var(--fg-tertiary)] italic">
            updated after save
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full transition-all duration-300",
              canSubmit
                ? "bg-gradient-to-br from-[var(--accent)] to-[var(--sage)] text-white glossy depth-2 hover:scale-[1.02] active:scale-[0.98]"
                : "glass-subtle text-[var(--fg-tertiary)] cursor-not-allowed"
            )}
          >
            <span className="font-medium tracking-tight">Save changes</span>
            <ArrowRight
              className={cn(
                "w-4 h-4 transition-transform",
                canSubmit && "group-hover:translate-x-0.5"
              )}
            />
          </button>
          <button
            onClick={() => router.push("/tasks")}
            className="w-full sm:w-auto rounded-full border border-[var(--border-strong)] px-6 py-4 text-sm font-medium text-[var(--fg-secondary)] transition hover:bg-[var(--bg-tint)]"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
