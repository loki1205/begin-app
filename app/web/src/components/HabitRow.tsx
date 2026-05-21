"use client";

import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { Check, SkipForward, Flame, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Habit, HabitStatus } from "@/lib/utils";

interface HabitRowProps {
  habit: Habit;
  status: HabitStatus;
  onStatusChange: (status: HabitStatus) => void;
  onDelete?: () => void;
}

export function HabitRow({ habit, status, onStatusChange, onDelete }: HabitRowProps) {
  const x = useMotionValue(0);
  const [showDelete, setShowDelete] = useState(false);

  const checkboxBg = useTransform(
    x,
    [-150, -40, 0, 40, 150],
    [
      "rgba(180,184,192,0.2)",
      "rgba(180,184,192,0.15)",
      "transparent",
      "rgba(126,153,125,0.15)",
      "rgba(126,153,125,0.3)",
    ]
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 80) {
      // swipe right -> skip... wait, spec says swipe right = skip
      if(isSkipped){
        onStatusChange("pending");
      }
      else{
        onStatusChange("skipped");
      }
      animate(x, 0, { duration: 0.3 });
    } else {
      animate(x, 0, { duration: 0.3 });
      setShowDelete(false);
    }
  };

  const handleCheckbox = () => {
    if (status === "completed") {
      onStatusChange("pending");
    } else {
      onStatusChange("completed");
    }
  };

  const isCompleted = status === "completed";
  const isSkipped = status === "skipped";

  return (
    <div className="relative">
      {/* Swipe right background (skip hint) */}
      <div className="absolute inset-0 rounded-2xl flex items-center justify-start pl-6 pointer-events-none">
        <motion.div
          style={{ opacity: useTransform(x, [0, 60, 120], [0, 0.4, 1]) }}
          className="flex items-center gap-2 text-[var(--fg-tertiary)]"
        >
          <SkipForward className="w-4 h-4" />
          <span className="text-sm">{isSkipped ? "Bring it back" : "Skip today"}</span>
        </motion.div>
      </div>

      {/* Delete button revealed on left swipe */}
      {showDelete && onDelete && (
        <button
          onClick={() => {
            onDelete();
            setShowDelete(false);
            animate(x, 0);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors z-10"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}

      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 200 }}
        dragElastic={0.2}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "relative glass rounded-2xl px-5 py-4 flex items-center gap-4 cursor-grab active:cursor-grabbing transition-opacity",
          isSkipped && "opacity-50",
          isCompleted && "opacity-90"
        )}
      >
        {/* Checkbox */}
        <button
          onClick={handleCheckbox}
          className="relative shrink-0 focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center -m-2 p-2"
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        >
          <motion.div
            style={{ background: isCompleted ? undefined : checkboxBg }}
            className={cn(
              "w-7 h-7 rounded-full border-[1.5px] transition-all duration-300 flex items-center justify-center",
              isCompleted
                ? "border-[var(--sage)] bg-[var(--sage)]"
                : "border-[var(--border-strong)] hover:border-[var(--accent)]"
            )}
          >
            {isCompleted && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                viewBox="0 0 24 24"
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12 L10 17 L19 7" />
              </motion.svg>
            )}
          </motion.div>
        </button>

        {/* Habit name */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-[15px] sm:text-base tracking-tight transition-all duration-300",
              isCompleted && "line-through decoration-[var(--fg-tertiary)] decoration-1"
            )}
          >
            {habit.name}
          </div>
          {habit.days.length < 7 && (
            <div className="text-[11px] text-[var(--fg-tertiary)] mt-0.5 uppercase tracking-wider">
              {habit.days.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(" · ")}
            </div>
          )}
        </div>

        {/* Stability score */}
        {habit.stabilityScore > 0 && (
          <div className="flex items-center gap-1 text-[var(--fg-secondary)] text-sm">
            <Flame className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="font-medium">{Math.round(habit.stabilityScore)}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
