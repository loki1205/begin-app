"use client";

import { useEffect, useState, useCallback } from "react";
import type { AppState, Habit, HabitLog, HabitStatus, DayKey } from "@/lib/utils";
import { formatDate, getDayKey } from "@/lib/utils";

const STORAGE_KEY = "begin.appstate.v1";

const defaultState: AppState = {
  habits: [],
  logs: [],
  userName: "",
  onboarded: false,
};

let memoryState: AppState = defaultState;
const listeners = new Set<(s: AppState) => void>();

function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  const addHabit = useCallback(
    (habit: Omit<Habit, "id" | "createdAt" | "streak">) => {
      const newHabit: Habit = {
        ...habit,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        streak: 0,
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
        let newLogs: HabitLog[];
        if (existing) {
          newLogs = s.logs.map((l) =>
            l.habitId === habitId && l.date === date ? { ...l, status } : l
          );
        } else {
          newLogs = [...s.logs, { habitId, date, status }];
        }

        // recompute streak for habit
        const newHabits = s.habits.map((h) => {
          if (h.id !== habitId) return h;
          let streak = 0;
          const today = new Date();
          for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dk = getDayKey(d.getDay());
            if (!h.days.includes(dk)) continue;
            const log = newLogs.find(
              (l) => l.habitId === habitId && l.date === formatDate(d)
            );
            if (log?.status === "completed") {
              streak++;
            } else if (log?.status === "skipped") {
              break;
            } else if (i === 0) {
              // today not yet logged - allow streak count from yesterday
              continue;
            } else {
              break;
            }
          }
          return { ...h, streak };
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
      const parsed = JSON.parse(json);
      if (!parsed.habits || !Array.isArray(parsed.habits)) throw new Error("Invalid");
      setState(() => ({ ...defaultState, ...parsed }));
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
    addHabit,
    deleteHabit,
    setHabitStatus,
    exportData,
    importData,
    resetAll,
  };
}
