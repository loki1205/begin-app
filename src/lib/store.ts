"use client";

import { useEffect, useState, useCallback } from "react";
import type { AppState, Habit, HabitLog, HabitStatus, DayKey } from "@/lib/utils";
import {
  formatDate,
  getDayKey,
  calculateLevel,
  clamp,
  getHabitAgeInDays,
  getCompletionCount,
  COMPLETE_REWARD,
  MISS_PENALTY,
  MIN_SCORE,
  MAX_SCORE,
} from "@/lib/utils";

const STORAGE_KEY = "begin.appstate.v1";

const defaultState: AppState = {
  habits: [],
  logs: [],
  userName: "",
  userAvatar: null,
  onboarded: false,
};

let memoryState: AppState = defaultState;
const listeners = new Set<(s: AppState) => void>();

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as any;
    const logs = Array.isArray(parsed.logs) ? parsed.logs : [];
    const habits = Array.isArray(parsed.habits)
      ? parsed.habits.map((h: any) => ({
          ...h,
          stabilityScore:
            typeof h.stabilityScore === "number" ? h.stabilityScore : 0,
          completionCount:
            typeof h.completionCount === "number"
              ? h.completionCount
              : getCompletionCount(h, logs),
        }))
      : [];
    return { ...defaultState, ...parsed, habits };
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getHabitStabilityScore(habit: Habit, logs: HabitLog[]): number {
  const today = new Date();
  const created = new Date(habit.createdAt);
  let score = 0;
  const endingDate = new Date(today);
  const todayKey = formatDate(today);

  for (let d = new Date(created); d <= endingDate; d.setDate(d.getDate() + 1)) {
    const dayKey = getDayKey(d.getDay());
    if (!habit.days.includes(dayKey)) continue;

    const date = formatDate(d);
    const log = logs.find((l) => l.habitId === habit.id && l.date === date);

    if (date === todayKey && !log) continue;
    if (log?.status === "completed") {
      score += COMPLETE_REWARD;
    } else {
      score -= MISS_PENALTY;
    }
  }

  return clamp(score, MIN_SCORE, MAX_SCORE);
}

function setState(updater: (s: AppState) => AppState) {
  memoryState = updater(memoryState);
  saveState(memoryState);
  listeners.forEach((l) => l(memoryState));
}

let initialized = false;

export function useAppStore() {
  const [state, setLocalState] = useState<AppState>(memoryState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!initialized) {
      memoryState = loadState();
      initialized = true;
    }
    setLocalState(memoryState);
    setHydrated(true);
    const listener = (s: AppState) => setLocalState(s);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const setUserName = useCallback((name: string) => {
    setState((s) => ({ ...s, userName: name, onboarded: true }));
  }, []);

  const setUserAvatar = useCallback((dataUrl: string | null) => {
    setState((s) => ({ ...s, userAvatar: dataUrl }));
  }, []);

  const addHabit = useCallback(
    (habit: Omit<Habit, "id" | "createdAt" | "stabilityScore" | "completionCount">) => {
      const newHabit: Habit = {
        ...habit,
        id: generateId(),
        createdAt: new Date().toISOString(),
        stabilityScore: 0,
        completionCount: 0,
      };
      setState((s) => ({ ...s, habits: [...s.habits, newHabit] }));
      return newHabit;
    },
    []
  );

  const deleteHabit = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      habits: s.habits.filter((h) => h.id !== id),
      logs: s.logs.filter((l) => l.habitId !== id),
    }));
  }, []);

  const setHabitStatus = useCallback(
    (habitId: string, date: string, status: HabitStatus) => {
      setState((s) => {
        const existing = s.logs.find(
          (l) => l.habitId === habitId && l.date === date
        );

        if (existing && existing.status === status) {
          return s;
        }

        let newLogs: HabitLog[];
        if (existing) {
          newLogs = s.logs.map((l) =>
            l.habitId === habitId && l.date === date ? { ...l, status } : l
          );
        } else if (status === "pending") {
          newLogs = s.logs;
        } else {
          newLogs = [...s.logs, { habitId, date, status }];
        }

        const newHabits = s.habits.map((h) => {
          if (h.id !== habitId) return h;
          const stabilityScore = getHabitStabilityScore(h, newLogs);
          const level = calculateLevel(
            stabilityScore,
            getHabitAgeInDays(h.createdAt)
          );
          const completionCount = getCompletionCount(h, newLogs);
          return { ...h, stabilityScore, level, completionCount };
        });

        return { ...s, logs: newLogs, habits: newHabits };
      });
    },
    []
  );

  const exportData = useCallback(() => {
    return JSON.stringify(memoryState, null, 2);
  }, []);

  const importData = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as any;
      if (!parsed.habits || !Array.isArray(parsed.habits)) throw new Error("Invalid");
      const logs = Array.isArray(parsed.logs) ? parsed.logs : [];
      const habits = parsed.habits.map((h: any) => ({
        ...h,
        stabilityScore:
          typeof h.stabilityScore === "number" ? h.stabilityScore : 0,
        completionCount:
          typeof h.completionCount === "number"
            ? h.completionCount
            : getCompletionCount(h, logs),
      }));
      setState(() => ({ ...defaultState, ...parsed, habits }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetAll = useCallback(() => {
    setState(() => defaultState);
  }, []);

  return {
    state,
    hydrated,
    setUserName,
    setUserAvatar,
    addHabit,
    deleteHabit,
    setHabitStatus,
    exportData,
    importData,
    resetAll,
  };
}
