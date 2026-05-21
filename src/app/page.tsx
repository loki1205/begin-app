"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { getDailyQuote } from "@/lib/utils";

export default function SplashPage() {
  const router = useRouter();
  const { state, hydrated } = useAppStore();
  const [quote] = useState(() => getDailyQuote());
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        if (state.onboarded) router.replace("/today");
        else router.replace("/onboarding");
      }, 800);
    }, 2400);
    return () => clearTimeout(t);
  }, [hydrated, state.onboarded, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-6">
      <AnimatePresence>
        {!exiting && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Logo composition */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-12"
            >
              {/* Concentric rings - breathing */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 -m-12 rounded-full border border-[var(--accent)]/20"
              />
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute inset-0 -m-20 rounded-full border border-[var(--accent)]/15"
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute inset-0 -m-28 rounded-full border border-[var(--accent)]/10"
              />

              {/* Center mark */}
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[var(--sage)] flex items-center justify-center glossy depth-3">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none">
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                  <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
                </svg>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-6xl sm:text-7xl tracking-tight mb-3"
              style={{ fontVariationSettings: "'opsz' 144" }}
            >
              begin
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-[var(--fg-secondary)] text-center max-w-sm italic font-display text-lg"
            >
              &ldquo;{quote}&rdquo;
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="absolute bottom-12 flex gap-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-1 h-1 rounded-full bg-[var(--fg-tertiary)]"
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
