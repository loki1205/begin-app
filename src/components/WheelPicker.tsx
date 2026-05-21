"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WheelPickerProps {
  label: string;
  items: { value: number; label: string; disabled?: boolean }[];
  value: number;
  onChange: (value: number) => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE = 5; // odd

export function WheelPicker({ label, items, value, onChange }: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Scroll to value on mount/change
  useEffect(() => {
    const idx = items.findIndex((i) => i.value === value);
    if (idx >= 0 && containerRef.current) {
      containerRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "auto" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!containerRef.current) return;
      const idx = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const target = items[clamped];
      if (target && !target.disabled) {
        onChange(target.value);
        containerRef.current.scrollTo({
          top: clamped * ITEM_HEIGHT,
          behavior: "smooth",
        });
      } else {
        // snap back if disabled
        const prevIdx = items.findIndex((i) => i.value === value);
        if (prevIdx >= 0) {
          containerRef.current.scrollTo({
            top: prevIdx * ITEM_HEIGHT,
            behavior: "smooth",
          });
        }
      }
      setIsScrolling(false);
    }, 150);
  };

  const containerHeight = ITEM_HEIGHT * VISIBLE;
  const padding = ITEM_HEIGHT * Math.floor(VISIBLE / 2);

  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--fg-tertiary)] mb-3">
        {label}
      </div>
      <div
        className="relative w-full"
        style={{ height: containerHeight }}
      >
        {/* Selection highlight */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-10 border-y border-[var(--border-subtle)]"
          style={{
            top: padding,
            height: ITEM_HEIGHT,
          }}
        />

        {/* Gradient fades */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none z-20"
          style={{
            height: padding,
            background: "linear-gradient(to bottom, var(--bg-elevated) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none z-20"
          style={{
            height: padding,
            background: "linear-gradient(to top, var(--bg-elevated) 0%, transparent 100%)",
          }}
        />

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="overflow-y-auto no-scrollbar h-full snap-y snap-mandatory"
          style={{
            scrollPaddingTop: padding,
            scrollPaddingBottom: padding,
          }}
        >
          <div style={{ height: padding }} />
          {items.map((item) => {
            const isSelected = item.value === value;
            return (
              <div
                key={item.value}
                className={cn(
                  "flex items-center justify-center snap-center transition-all duration-200",
                  isSelected
                    ? "text-[var(--fg-primary)] font-display text-2xl"
                    : "text-[var(--fg-tertiary)] text-base",
                  item.disabled && "text-[var(--fg-quaternary)] opacity-50"
                )}
                style={{ height: ITEM_HEIGHT }}
              >
                {item.label}
              </div>
            );
          })}
          <div style={{ height: padding }} />
        </div>
      </div>
    </div>
  );
}
