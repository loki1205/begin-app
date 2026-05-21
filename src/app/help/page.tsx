"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Heart,
  Bug,
  Users,
  GitPullRequest,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const FAQS = [
  {
    q: "What makes Begin different?",
    a: "Begin is built around one idea: quiet consistency matters more than loud motivation. There is no stability shaming, no notifications begging for your attention, no gamification. Just a calm place to return to.",
  },
  {
    q: "Where is my data stored?",
    a: "Everything lives in your browser's local storage on this device. We have no servers, no accounts, and no analytics. Use Export to back up your data, and Import to move it.",
  },
  {
    q: "Why can I skip habits?",
    a: "Because life happens. Skipping is a way to honestly mark a day without breaking your sense of self. It's better than guilt-completion.",
  },
  {
    q: "How is stability score calculated?",
    a: "Stability score grows with completed scheduled days and gently decreases for missed days. It measures consistency without pressure.",
  },
];

const LINKS = [
  {
    title: "GitHub Repository",
    description: "Source code and releases",
    icon: Github,
    href: "https://github.com",
  },
  {
    title: "Contribute",
    description: "Help shape Begin",
    icon: GitPullRequest,
    href: "https://github.com",
  },
  {
    title: "Report a bug",
    description: "Something feel off?",
    icon: Bug,
    href: "https://github.com",
  },
  {
    title: "Contributors",
    description: "The people behind it",
    icon: Users,
    href: "https://github.com",
  },
  {
    title: "Support development",
    description: "Donations keep Begin free",
    icon: Heart,
    href: "https://github.com",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--fg-tertiary)] mb-2">
          About
        </div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
          Help & About
        </h1>
      </motion.div>

      {/* Manifesto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="glass-elevated rounded-3xl p-6 sm:p-8 mb-10"
      >
        <p className="font-display text-xl sm:text-2xl leading-relaxed text-[var(--fg-primary)] italic text-balance">
          Begin is about small consistent actions. It is for the kind of person
          who would rather walk than run, and who knows that becoming someone is
          slower and quieter than it looks.
        </p>
      </motion.div>

      {/* FAQs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-[var(--fg-tertiary)] mb-4 px-2">
          Questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
              >
                <span className="text-[15px] tracking-tight font-medium">
                  {faq.q}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-[var(--fg-tertiary)] transition-transform shrink-0",
                    openFaq === i && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-[var(--fg-secondary)] text-[14px] leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Links */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-[var(--fg-tertiary)] mb-4 px-2">
          Community
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass rounded-2xl p-5 hover:bg-[var(--bg-tint)] transition-colors group"
              >
                <Icon
                  className="w-5 h-5 text-[var(--accent)] mb-3 transition-transform group-hover:scale-110"
                  strokeWidth={1.6}
                />
                <div className="text-[15px] tracking-tight font-medium">
                  {link.title}
                </div>
                <div className="text-xs text-[var(--fg-tertiary)] mt-1">
                  {link.description}
                </div>
              </a>
            );
          })}
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-16 mb-8"
      >
        <div className="font-display text-xs italic text-[var(--fg-tertiary)]">
          made with care · v1.0
        </div>
      </motion.div>
    </div>
  );
}
