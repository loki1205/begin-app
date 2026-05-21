import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cn,
  formatDate,
  getDayShort,
  getDayKey,
  DAY_KEYS,
  DAY_LABELS,
  DAILY_QUOTES,
  getDailyQuote,
  getScoreBasedLevel,
  LEVEL_NAMES,
  getAgeBasedMaxLevel,
  getLevelName,
  calculateLevel,
  getHabitAgeInDays,
  clamp,
  getCompletionCount,
  getHabitStabilityScore,
  getPersona,
} from "@/lib/utils";

describe("utils", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds class names with cn", () => {
    expect(cn("a", "b", false, "c")).toBe("a b c");
  });

  it("formats dates as YYYY-MM-DD", () => {
    expect(formatDate(new Date("2026-05-21T15:30:00Z"))).toBe("2026-05-21");
  });

  it("returns day labels and keys", () => {
    expect(getDayShort(0)).toBe("Sun");
    expect(getDayShort(6)).toBe("Sat");
    expect(getDayKey(0)).toBe("sun");
    expect(getDayKey(6)).toBe("sat");
    expect(DAY_KEYS).toEqual(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
    expect(DAY_LABELS.sun).toBe("Sun");
  });

  it("returns a deterministic daily quote", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-03T00:00:00.000Z"));
    expect(getDailyQuote()).toBe(DAILY_QUOTES[3]);
  });

  it("calculates score-based levels and age caps", () => {
    expect(getScoreBasedLevel(0)).toBe(1);
    expect(getScoreBasedLevel(25)).toBe(2);
    expect(getScoreBasedLevel(45)).toBe(3);
    expect(getScoreBasedLevel(65)).toBe(4);
    expect(getScoreBasedLevel(90)).toBe(5);
    expect(getAgeBasedMaxLevel(0)).toBe(1);
    expect(getAgeBasedMaxLevel(5)).toBe(2);
    expect(getAgeBasedMaxLevel(20)).toBe(3);
    expect(getAgeBasedMaxLevel(30)).toBe(4);
    expect(getAgeBasedMaxLevel(100)).toBe(5);
    expect(getLevelName(1)).toBe("Seed");
    expect(getLevelName(99)).toBe("Seed");
    expect(calculateLevel(80, 100)).toBe(4);
    expect(calculateLevel(20, 1)).toBe(1);
  });

  it("computes habit age in days and clamps values", () => {
    vi.useFakeTimers();
    const now = new Date("2026-05-21T00:00:00.000Z");
    vi.setSystemTime(now);
    expect(getHabitAgeInDays("2026-05-20T00:00:00.000Z")).toBe(1);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(20, 0, 10)).toBe(10);
  });

  it("counts completed habit logs correctly", () => {
    const habit = {
      id: "habit-1",
      name: "Test",
      days: ["mon", "tue"],
      level: 1,
      createdAt: "2026-05-20T00:00:00.000Z",
      stabilityScore: 0,
      completionCount: 0,
    };
    const logs = [
      { habitId: "habit-1", date: "2026-05-19", status: "completed" },
      { habitId: "habit-1", date: "2026-05-20", status: "completed" },
      { habitId: "habit-1", date: "2026-05-21", status: "skipped" },
    ];
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-21T00:00:00.000Z"));
    expect(getCompletionCount(habit, logs)).toBe(1);
  });

  it("returns the correct persona text", () => {
    expect(getPersona([], [])).toBe(
      "A quiet beginning awaits. Your first ritual will shape the path."
    );
    expect(
      getPersona(
        [{
          id: "habit-1",
          name: "Test",
          days: ["mon"],
          level: 1,
          createdAt: "2026-05-20T00:00:00.000Z",
          stabilityScore: 0,
          completionCount: 0,
        }],
        [
          { habitId: "habit-1", date: "2026-05-20", status: "completed" },
          { habitId: "habit-1", date: "2026-05-21", status: "completed" },
          { habitId: "habit-1", date: "2026-05-22", status: "completed" },
          { habitId: "habit-1", date: "2026-05-23", status: "completed" },
          { habitId: "habit-1", date: "2026-05-24", status: "completed" },
          { habitId: "habit-2", date: "2026-05-24", status: "skipped" },
        ]
      )
    ).toBe("You show up quietly and consistently. Your routines reflect calm discipline.");
    expect(
      getPersona(
        [{
          id: "habit-1",
          name: "Test",
          days: ["mon"],
          level: 1,
          createdAt: "2026-05-20T00:00:00.000Z",
          stabilityScore: 0,
          completionCount: 0,
        }],
        [
          { habitId: "habit-1", date: "2026-05-20", status: "completed" },
          { habitId: "habit-2", date: "2026-05-21", status: "skipped" },
          { habitId: "habit-2", date: "2026-05-22", status: "skipped" },
          { habitId: "habit-2", date: "2026-05-23", status: "completed" },
          { habitId: "habit-2", date: "2026-05-24", status: "completed" },
        ]
      )
    ).toBe("You return to your rituals with intention. Steady, not rushed.");
    expect(
      getPersona(
        [{
          id: "habit-1",
          name: "Test",
          days: ["mon"],
          level: 1,
          createdAt: "2026-05-20T00:00:00.000Z",
          stabilityScore: 0,
          completionCount: 0,
        }],
        [
          { habitId: "habit-2", date: "2026-05-21", status: "skipped" },
        ]
      )
    ).toBe("You are exploring what consistency feels like. Each return matters.");
  });
});
