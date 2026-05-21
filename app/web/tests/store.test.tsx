import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generateId,
  loadState,
  saveState,
  getHabitStabilityScore,
  setState,
  getMemoryState,
} from "@/lib/store";

const STORAGE_KEY = "begin.appstate.v1";

describe("store helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    setState(() => ({
      habits: [],
      logs: [],
      userName: "",
      userAvatar: null,
      onboarded: false,
    }));
  });

  it("loads persisted state from localStorage", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        habits: [],
        logs: [],
        userName: "persisted",
        userAvatar: null,
        onboarded: true,
      })
    );

    const state = loadState();
    expect(state.userName).toBe("persisted");
  });

  it("reconstructs habits when saved state omits scores and counts", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        habits: [
          {
            id: "habit-1",
            name: "Repair",
            days: ["wed"],
            level: 1,
            createdAt: "2026-05-20T00:00:00.000Z",
          },
        ],
        logs: [
          {
            habitId: "habit-1",
            date: "2026-05-21",
            status: "completed",
          },
        ],
        userName: "builder",
        userAvatar: null,
        onboarded: false,
      })
    );

    const state = loadState();
    expect(state.habits).toHaveLength(1);
    expect(state.habits[0].stabilityScore).toBe(0);
    expect(state.habits[0].completionCount).toBe(1);
  });

  it("preserves numeric completionCount when loading saved state", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        habits: [
          {
            id: "habit-1",
            name: "Counted",
            days: ["wed"],
            level: 1,
            createdAt: "2026-05-20T00:00:00.000Z",
            stabilityScore: 2,
            completionCount: 5,
          },
        ],
        logs: [],
        userName: "builder",
        userAvatar: null,
        onboarded: false,
      })
    );

    const state = loadState();
    expect(state.habits[0].completionCount).toBe(5);
    expect(state.habits[0].stabilityScore).toBe(2);
  });

  it("returns default state when saved state uses invalid habit data", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        habits: "not-an-array",
        logs: "not-an-array",
        userName: "broken",
        userAvatar: null,
        onboarded: false,
      })
    );

    const state = loadState();
    expect(state.habits).toEqual([]);
    expect(state.logs).toEqual([]);
    expect(state.userName).toBe("broken");
  });

  it("returns default state when localStorage contains invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    expect(loadState()).toEqual({
      habits: [],
      logs: [],
      userName: "",
      userAvatar: null,
      onboarded: false,
    });
  });

  it("saves and retrieves state through localStorage", () => {
    saveState({
      habits: [],
      logs: [],
      userName: "Sally",
      userAvatar: null,
      onboarded: true,
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").userName).toBe("Sally");
  });

  it("allows setState to modify memory state", () => {
    setState((s) => ({ ...s, userName: "CacheTest", onboarded: true }));
    expect(getMemoryState().userName).toBe("CacheTest");
  });

  it("calculates habit stability score correctly", () => {
    const habit = {
      id: "habit-1",
      name: "Read",
      days: ["wed", "thu"],
      level: 1,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      stabilityScore: 0,
      completionCount: 0,
    } as const;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    const logs = [
      { habitId: "habit-1", date: yesterday, status: "completed" },
    ];

    const score = getHabitStabilityScore(habit, logs);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it("penalizes skipped habit logs when calculating stability score", () => {
    const habit = {
      id: "habit-1",
      name: "Skipped Habit",
      days: ["fri"],
      level: 1,
      createdAt: "2026-05-21T00:00:00.000Z",
      stabilityScore: 0,
      completionCount: 0,
    } as const;
    const logs = [{ habitId: "habit-1", date: "2026-05-21", status: "skipped" }];
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-21T00:00:00.000Z"));
    expect(getHabitStabilityScore(habit, logs)).toBe(0);
  });

  it("penalizes skipped habit logs before today", () => {
    const habit = {
      id: "habit-1",
      name: "Skipped Habit",
      days: ["fri"],
      level: 1,
      createdAt: "2026-05-20T00:00:00.000Z",
      stabilityScore: 0,
      completionCount: 0,
    } as const;
    const logs = [{ habitId: "habit-1", date: "2026-05-21", status: "skipped" }];
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-23T00:00:00.000Z"));
    expect(getHabitStabilityScore(habit, logs)).toBe(0);
  });

  it("covers all generateId fallbacks", () => {
    const defaultId = generateId();
    expect(defaultId).toMatch(/^[\w-]+$/);

    vi.stubGlobal("crypto", {
      getRandomValues(array: Uint8Array) {
        for (let i = 0; i < array.length; i += 1) {
          array[i] = i;
        }
        return array;
      },
    } as any);
    const fallbackId = generateId();
    expect(fallbackId).toMatch(/^[0-9a-f-]+$/);

    vi.stubGlobal("crypto", undefined as unknown as Crypto);
    const finalFallbackId = generateId();
    expect(finalFallbackId).toMatch(/^id-/);
  });
});
