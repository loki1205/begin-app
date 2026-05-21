"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserName } = useAppStore();
  const [step, setStep] = useState<"welcome" | "name">("welcome");
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setStep("name"), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (step === "name") {
      setTimeout(() => inputRef.current?.focus(), 600);
    }
  }, [step]);

  const handleContinue = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    router.replace("/today");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Floating decorative shapes */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          rotate: [0, 5, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] left-[10%] w-32 h-32 rounded-[40%] bg-gradient-to-br from-[var(--accent)]/15 to-[var(--sage)]/10 blur-xl"
      />
      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[20%] right-[15%] w-40 h-40 rounded-full bg-gradient-to-br from-[var(--sage)]/15 to-[var(--accent)]/10 blur-2xl"
      />

      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-7xl sm:text-8xl tracking-tight leading-[0.95] mb-8"
            >
              <span className="block opacity-40">small</span>
              <span className="block">rituals</span>
              <span className="block italic gradient-text">shape us.</span>
            </motion.div>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-[var(--fg-secondary)] text-lg max-w-md mx-auto text-balance"
            >
              A quiet place to return to. Track the small things that make you who
              you&rsquo;re becoming.
            </motion.p>
          </motion.div>
        )}

        {step === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs uppercase tracking-[0.3em] text-[var(--fg-tertiary)] mb-6"
            >
              one moment
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display text-4xl sm:text-5xl tracking-tight mb-12 text-balance"
            >
              What do we call you?
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative mb-12"
            >
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleContinue();
                }}
                placeholder="your name"
                maxLength={32}
                className="w-full text-center text-3xl font-display bg-transparent border-0 border-b border-[var(--border-strong)] focus:border-[var(--accent)] outline-none py-4 placeholder:text-[var(--fg-quaternary)] placeholder:italic transition-colors"
              />
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: name.trim() ? 1 : 0.3, y: 0 }}
              transition={{ delay: 0.7 }}
              disabled={!name.trim()}
              onClick={handleContinue}
              className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full glass-elevated text-[var(--fg-primary)] font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 text-xs text-[var(--fg-tertiary)]"
            >
              Your data stays on this device. Always.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
