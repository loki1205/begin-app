"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { DAY_KEYS, DAY_LABELS, cn, calculateLevel } from "@/lib/utils";
import type { DayKey } from "@/lib/utils";

export default function AddHabitPage() {
  const router = useRouter();
  const { addHabit, hydrated } = useAppStore();
  const [name, setName] = useState("");
  const [days, setDays] = useState<DayKey[]>([]);

  const toggleDay = (day: DayKey) => {
    setDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day]));
  };

  const toggleAll = () => {
    if (days.length === 7) setDays([]);
    else setDays([...DAY_KEYS]);
  };

  const canSubmit = name.trim().length > 0 && days.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    addHabit({
      name: name.trim(),
      days,
      level: 1,
    });
    router.push("/today");
  };

  const level = calculateLevel(0, 0);
  const levelName = ["Seed", "Sprout", "Root", "Flow", "Anchor"][level - 1] || "Seed";

  if (!hydrated) return null;

  return (
    <div className="max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--fg-tertiary)] mb-2">
          Add ritual
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight">
          A new beginning.
        </h1>
        <p className="text-[var(--fg-secondary)] mt-3">
          Small, specific, and yours.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-8"
      >
        {/* Habit name */}
        <div>
          <label className="text-[10px] uppercase tracking-[0.25em] text-[var(--fg-tertiary)] mb-3 block">
            What habit?
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

        {/* Day selector */}
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

        {/* Level preview */}
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--sage)]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.6} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-tertiary)]">
              Starting level
            </div>
            <div className="font-display text-lg tracking-tight">
              Level {level} — {levelName}
            </div>
          </div>
          <div className="text-xs text-[var(--fg-tertiary)] italic">
            grows with you
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
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
            <span className="font-medium tracking-tight">Create ritual</span>
            <ArrowRight
              className={cn(
                "w-4 h-4 transition-transform",
                canSubmit && "group-hover:translate-x-0.5"
              )}
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
