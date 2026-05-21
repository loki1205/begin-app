"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Download,
  Upload,
  Sun,
  Moon,
  Monitor,
  HelpCircle,
  X,
  Share2,
  Sparkles,
  Edit,
  Check,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/components/ThemeProvider";
import { cn, getPersona } from "@/lib/utils";

export default function ProfilePage() {
  const { state, exportData, importData, resetAll, hydrated, setUserAvatar } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const stats = useMemo(() => {
    const completed = state.logs.filter((l) => l.status === "completed").length;
    const skipped = state.logs.filter((l) => l.status === "skipped").length;
    const total = completed + skipped;
    const consistency = total > 0 ? Math.round((completed / total) * 100) : 0;
    const highestStability = state.habits.reduce(
      (max, h) => Math.max(max, h.stabilityScore),
      0
    );
    return {
      completed,
      consistency,
      highestStability,
      ritualCount: state.habits.length,
    };
  }, [state]);

  const persona = getPersona(state.habits, state.logs);

  const toggleAvatarEditing = () => {
    if (isEditingAvatar) {
      setUserAvatar(pendingAvatar);
      setIsEditingAvatar(false);
      showToast("Profile photo saved");
    } else {
      setPendingAvatar(state.userAvatar ?? null);
      setIsEditingAvatar(true);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `begin-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data exported");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = importData(ev.target?.result as string);
      showToast(ok ? "Data imported" : "Invalid file");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPendingAvatar(dataUrl);
      showToast("Profile photo ready to save");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    if (!isEditingAvatar) {
      setPendingAvatar(state.userAvatar ?? null);
    }
  }, [state.userAvatar, isEditingAvatar]);

  if (!hydrated) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-start justify-between mb-10"
      >
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--fg-tertiary)] mb-2">
            You
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Profile
          </h1>
        </div>
        <Link
          href="/help"
          className="w-11 h-11 rounded-full glass-subtle flex items-center justify-center hover:bg-[var(--bg-tint)] transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5 text-[var(--fg-secondary)]" strokeWidth={1.6} />
        </Link>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative mb-12"
      >
        <ProfileCard
          userName={state.userName}
          userAvatar={pendingAvatar}
          persona={persona}
          stats={stats}
          onShare={() => setShareOpen(true)}
          isEditing={isEditingAvatar}
          onToggleAvatarEdit={toggleAvatarEditing}
          onAvatarClick={isEditingAvatar ? () => avatarInputRef.current?.click() : undefined}
          onRemoveAvatar={isEditingAvatar ? () => { setPendingAvatar(null); showToast("Profile photo removed"); } : undefined}
        />
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="space-y-8"
      >
        {/* Theme */}
        <SettingsSection title="Appearance">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value as typeof theme)}
                  className={cn(
                    "flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-300",
                    active
                      ? "glass bg-[var(--accent-bg)] text-[var(--accent)]"
                      : "glass-subtle text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.6} />
                  <span className="text-xs tracking-tight">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </SettingsSection>

        {/* Data */}
        <SettingsSection title="Your data">
          <button
            onClick={handleExport}
            className="w-full glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-[var(--bg-tint)] transition-colors text-left"
          >
            <Upload className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.6} />
            <div>
              <div className="text-[15px] tracking-tight">Export data</div>
              <div className="text-xs text-[var(--fg-tertiary)] mt-0.5">
                Download a JSON backup
              </div>
            </div>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full glass rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-[var(--bg-tint)] transition-colors text-left"
          >
            <Download className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.6} />
            <div>
              <div className="text-[15px] tracking-tight">Import data</div>
              <div className="text-xs text-[var(--fg-tertiary)] mt-0.5">
                Restore from a backup
              </div>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="hidden"
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </SettingsSection>

        {/* Danger */}
        <SettingsSection title="Reset">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full glass rounded-2xl px-5 py-4 text-left text-[var(--fg-secondary)] hover:bg-[var(--bg-tint)] transition-colors text-[15px]"
            >
              Start over
            </button>
          ) : (
            <div className="glass rounded-2xl p-5">
              <div className="text-[15px] mb-1">Erase everything?</div>
              <div className="text-xs text-[var(--fg-tertiary)] mb-4">
                This removes all habits and history from this device.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl glass-subtle text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetAll();
                    setConfirmReset(false);
                    window.location.href = "/";
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-500 text-sm"
                >
                  Yes, erase
                </button>
              </div>
            </div>
          )}
        </SettingsSection>
      </motion.div>

      {/* Share card fullscreen modal */}
      <AnimatePresence>
        {shareOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[var(--bg-base)]/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setShareOpen(false)}
          >
            <button
              onClick={() => setShareOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full glass-subtle flex items-center justify-center z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <ShareCard
                userAvatar={state.userAvatar ?? null}
                userName={state.userName}
                persona={persona}
                stats={stats}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-28 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 glass-elevated rounded-full px-5 py-2.5 text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--fg-tertiary)] mb-3 px-2">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ProfileCard({
  userName,
  userAvatar,
  persona,
  stats,
  onShare,
  onAvatarClick,
  onRemoveAvatar,
  isEditing,
  onToggleAvatarEdit,
}: {
  userName: string;
  userAvatar?: string | null;
  persona: string;
  stats: { completed: number; consistency: number; highestStability: number; ritualCount: number };
  onShare: () => void;
  onAvatarClick?: () => void;
  onRemoveAvatar?: () => void;
  isEditing?: boolean;
  onToggleAvatarEdit?: () => void;
}) {
  return (
    <div className="relative glass-elevated rounded-3xl overflow-hidden">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-[var(--sage)]/8" />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={onAvatarClick}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-[var(--accent)] to-[var(--sage)] text-white font-display text-3xl glossy depth-2 relative"
                aria-label="Change profile photo"
              >
                {userAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userAvatar} alt={userName || "avatar"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {userName.charAt(0).toUpperCase() || "B"}
                  </div>
                )}
                {isEditing && (
                  <div
                    className="absolute inset-0 rounded-3xl flex items-center justify-center bg-black"
                    style={{
                      opacity: 0.7,
                    }}
                  >
                    <Edit className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
                  </div>
                )}
              </button>
              {userAvatar && onRemoveAvatar && (
                <button
                  onClick={onRemoveAvatar}
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full glass-subtle flex items-center justify-center"
                  aria-label="Remove profile photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--fg-tertiary)] mb-1">
                Becoming
              </div>
              <div className="font-display text-2xl sm:text-3xl tracking-tight">
                {userName || "friend"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleAvatarEdit?.()}
              className="w-10 h-10 rounded-full glass-subtle flex items-center justify-center hover:bg-[var(--bg-tint)] transition-colors"
              aria-label={isEditing ? "Done editing" : "Edit profile"}
            >
              {isEditing ? (
                <Check className="w-4 h-4" strokeWidth={1.6} />
              ) : (
                <Edit className="w-4 h-4" strokeWidth={1.6} />
              )}
            </button>
            <button
              onClick={onShare}
              className="w-10 h-10 rounded-full glass-subtle flex items-center justify-center hover:bg-[var(--bg-tint)] transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.6} />
            </button>
          </div>
        </div>

        <p className="text-[var(--fg-secondary)] italic font-display text-lg leading-relaxed mb-8 text-balance">
          &ldquo;{persona}&rdquo;
        </p>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Rituals" value={stats.ritualCount} />
          <Stat label="Completed" value={stats.completed} />
          <Stat label="Stability score" value={Math.round(stats.highestStability)} />
        </div>

        {stats.consistency > 0 && (
          <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--fg-tertiary)]">
                Consistency
              </span>
              <span className="font-display text-base tabular-nums">
                {stats.consistency}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.consistency}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--sage)] rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div className="font-display text-2xl sm:text-3xl tracking-tight tabular-nums">
        {value}
        {suffix && <span className="text-base text-[var(--fg-tertiary)] px-2">{suffix}</span>}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-tertiary)] mt-1">
        {label}
      </div>
    </div>
  );
}

function ShareCard({
  userName,
  persona,
  stats,
  userAvatar,
}: {
  userName: string;
  persona: string;
  stats: { completed: number; consistency: number; highestStability: number; ritualCount: number };
  userAvatar: string | null;
}) {
  return (
    <div className="aspect-[4/5] rounded-3xl overflow-hidden relative glossy depth-3">
      {/* Cinematic gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6E78B8] via-[#8B92C9] to-[#7E997D]" />
      <div className="absolute inset-0 opacity-30" style={{
        background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%)"
      }} />
      <div className="absolute inset-0 opacity-20" style={{
        background: "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)"
      }} />

      <div className="absolute inset-0 p-8 flex flex-col text-white">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="w-4 h-4" strokeWidth={1.6} />
              </div>
              <div className="text-xs uppercase tracking-[0.3em] opacity-80">begin</div>
            </div>
            {userAvatar && (
              <div className="w-16 h-16">
                {userAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userAvatar} alt={userName || "avatar"} className="w-full h-full object-cover rounded-[50%]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                    {userName.charAt(0).toUpperCase() || "B"}
                  </div>
                )}
            </div>)}
        </div>

        <div className="my-auto">
          <div className="text-xs uppercase tracking-[0.25em] opacity-70 mb-3">
            {userName || "a quiet ritualist"}
          </div>
          <div className="font-display text-3xl leading-tight mb-6">
            &ldquo;{persona}&rdquo;
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
          <ShareStat label="Rituals" value={stats.ritualCount} />
          <ShareStat label="Done" value={stats.completed} />
          <ShareStat label="Stability" value={Math.round(stats.highestStability)} />
        </div>
      </div>
    </div>
  );
}

function ShareStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-2xl tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] opacity-70 mt-0.5">
        {label}
      </div>
    </div>
  );
}
