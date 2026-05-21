"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { WheelPicker } from "@/components/WheelPicker";
import { formatDate, cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function HistoryPage() {
  const { state, hydrated } = useAppStore();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [day, setDay] = useState(today.getDate());

  const years = useMemo(() => {
    const arr = [];
    for (let y = today.getFullYear() - 5; y <= today.getFullYear(); y++) {
      arr.push({ value: y, label: String(y) });
    }
    return arr;
  }, [today]);

  const months = useMemo(() => {
    return MONTHS.map((label, value) => {
      const disabled =
        year === today.getFullYear() && value > today.getMonth();
      return { value, label, disabled };
    });
  }, [year, today]);

  const days = useMemo(() => {
    const dim = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: dim }, (_, i) => {
      const v = i + 1;
      const date = new Date(year, month, v);
      const disabled = date > today;
      return { value: v, label: String(v).padStart(2, "0"), disabled };
    });
  }, [year, month, today]);

  // adjust day if invalid
  useEffect(() => {
    const dim = new Date(year, month + 1, 0).getDate();
    if (day > dim) setDay(dim);
    const selected = new Date(year, month, day);
    if (selected > today) {
      setDay(today.getDate());
      setMonth(today.getMonth());
      setYear(today.getFullYear());
    }
  }, [year, month, day, today]);

  const selectedDate = useMemo(() => new Date(year, month, day), [year, month, day]);
  const dateStr = formatDate(selectedDate);

  const dayLogs = useMemo(() => {
    return state.logs.filter((l) => l.date === dateStr);
  }, [state.logs, dateStr]);

  const habitMap = useMemo(() => {
    return new Map(state.habits.map((h) => [h.id, h]));
  }, [state.habits]);

  const completedLogs = dayLogs.filter((l) => l.status === "completed");
  const skippedLogs = dayLogs.filter((l) => l.status === "skipped");

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
          Looking back
        </div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
          History
        </h1>
      </motion.div>

      {/* Wheel pickers - 3 stacked vertically */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="glass-elevated rounded-3xl p-6 sm:p-8 mb-8"
      >
        <div className="space-y-1">
          <WheelPicker
            label="Year"
            items={years}
            value={year}
            onChange={setYear}
          />
          <div className="h-px bg-[var(--border-subtle)] my-2" />
          <WheelPicker
            label="Month"
            items={months}
            value={month}
            onChange={setMonth}
          />
          <div className="h-px bg-[var(--border-subtle)] my-2" />
          <WheelPicker
            label="Day"
            items={days}
            value={day}
            onChange={setDay}
          />
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--fg-tertiary)] mb-2">
            Showing
          </div>
          <div className="font-display text-2xl tracking-tight">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <motion.div
        key={dateStr}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {dayLogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="font-display text-2xl mb-2 text-[var(--fg-secondary)]">
              No tasks to show.
            </div>
            <p className="text-sm text-[var(--fg-tertiary)]">
              Nothing recorded on this day.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {completedLogs.length > 0 && (
              <Section
                title="Completed"
                count={completedLogs.length}
                color="sage"
              >
                {completedLogs.map((log) => {
                  const habit = habitMap.get(log.habitId);
                  return (
                    <LogRow
                      key={log.habitId}
                      name={habit?.name ?? "Removed habit"}
                      icon="check"
                    />
                  );
                })}
              </Section>
            )}
            {skippedLogs.length > 0 && (
              <Section
                title="Skipped"
                count={skippedLogs.length}
                color="muted"
              >
                {skippedLogs.map((log) => {
                  const habit = habitMap.get(log.habitId);
                  return (
                    <LogRow
                      key={log.habitId}
                      name={habit?.name ?? "Removed habit"}
                      icon="skip"
                      muted
                    />
                  );
                })}
              </Section>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Section({
  title,
  count,
  color,
  children,
}: {
  title: string;
  count: number;
  color: "sage" | "muted";
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3 px-2">
        <div
          className={cn(
            "w-1 h-1 rounded-full",
            color === "sage" ? "bg-[var(--sage)]" : "bg-[var(--fg-quaternary)]"
          )}
        />
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--fg-tertiary)]">
          {title} · {count}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function LogRow({
  name,
  icon,
  muted,
}: {
  name: string;
  icon: "check" | "skip";
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass rounded-2xl px-5 py-4 flex items-center gap-4",
        muted && "opacity-60"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
          icon === "check"
            ? "bg-[var(--sage)] text-white"
            : "bg-[var(--bg-subtle)] text-[var(--fg-tertiary)]"
        )}
      >
        {icon === "check" ? (
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        ) : (
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        )}
      </div>
      <span
        className={cn(
          "text-[15px] tracking-tight",
          muted && "line-through decoration-1"
        )}
      >
        {name}
      </span>
    </div>
  );
}
