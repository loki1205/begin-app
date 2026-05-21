"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WheelPickerProps {
  label: string;
  items: { value: number; label: string; disabled?: boolean }[];
  value: number;
  onChange: (value: number) => void;
  itemWidth?: number;
  visibleItems?: number;
}

const DEFAULT_ITEM_WIDTH = 90;
const DEFAULT_VISIBLE = 4; // odd

export function WheelPicker({ label, items, value, onChange, itemWidth = DEFAULT_ITEM_WIDTH, visibleItems = DEFAULT_VISIBLE }: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [responsiveItemWidth, setResponsiveItemWidth] = useState(itemWidth);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      const available = Math.max(60, Math.floor((window.innerWidth - 48) / Math.max(visibleItems, 3)));
      const width = Math.min(itemWidth, available);
      setResponsiveItemWidth(width);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [itemWidth, visibleItems]);

  // Scroll to value on mount/change
  useEffect(() => {
    const idx = items.findIndex((i) => i.value === value);
    if (idx >= 0 && containerRef.current) {
      containerRef.current.scrollTo({ left: idx * responsiveItemWidth, behavior: "auto" });
    }
  }, [value, responsiveItemWidth, items]);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      if (!containerRef.current) return;
      const idx = Math.round(containerRef.current.scrollLeft / responsiveItemWidth);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const target = items[clamped];
      if (target && !target.disabled) {
        onChange(target.value);
        containerRef.current.scrollTo({
          left: clamped * responsiveItemWidth,
          behavior: "smooth",
        });
      } else {
        // snap back if disabled
        const prevIdx = items.findIndex((i) => i.value === value);
        if (prevIdx >= 0) {
          containerRef.current.scrollTo({
            left: prevIdx * responsiveItemWidth,
            behavior: "smooth",
          });
        }
      }
      setIsScrolling(false);
    }, 150);
  };

  const containerWidth = responsiveItemWidth * visibleItems;
  const padding = responsiveItemWidth * Math.floor(visibleItems / 2);

  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--fg-tertiary)] mb-3">
        {label}
      </div>
      <div
        className="relative"
        style={{ width: containerWidth, height: "auto" }}
      >
        {/* Selection highlight */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-10 border-x border-[var(--border-subtle)]"
          style={{
            left: padding,
            width: responsiveItemWidth,
          }}
        />

        {/* Gradient fades */}
        <div
          className="absolute inset-y-0 left-0 pointer-events-none z-20"
          style={{
            width: padding,
            background: "linear-gradient(to right, var(--bg-elevated) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 pointer-events-none z-20"
          style={{
            width: padding,
            background: "linear-gradient(to left, var(--bg-elevated) 0%, transparent 100%)",
          }}
        />

        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="overflow-x-auto no-scrollbar snap-x snap-mandatory flex"
          style={{
            scrollPaddingLeft: padding,
            scrollPaddingRight: padding,
            width: containerWidth,
          }}
        >
          <div style={{ width: padding, flexShrink: 0 }} />
          {items.map((item) => {
            const isSelected = item.value === value;
            return (
              <div
                key={item.value}
                className={cn(
                  "flex items-center justify-center snap-center transition-all duration-200 flex-shrink-0",
                  isSelected
                    ? "text-[var(--fg-primary)] font-display text-2xl"
                    : "text-[var(--fg-tertiary)] text-base",
                  item.disabled && "text-[var(--fg-quaternary)] opacity-50"
                )}
                style={{ width: responsiveItemWidth }}
              >
                {item.label}
              </div>
            );
          })}
          <div style={{ width: padding, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
