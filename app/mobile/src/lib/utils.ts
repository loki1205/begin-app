import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getDayShort(dayIndex: number): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
}

export function getDayKey(dayIndex: number): DayKey {
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayIndex] as DayKey;
}

export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type HabitStatus = "pending" | "completed" | "skipped";

export interface Habit {
  id: string;
  name: string;
  days: DayKey[];
  level: number;
  createdAt: string;
  stabilityScore: number;
  completionCount: number;
}

export interface HabitLog {
  habitId: string;
  date: string;
  status: HabitStatus;
  habitName?: string;
}

export interface AppState {
  habits: Habit[];
  logs: HabitLog[];
  userName: string;
  userAvatar?: string | null;
  onboarded: boolean;
}

export const DAILY_QUOTES = [
  "Be Consistent, Not Perfect.",
  "Small habits become identities over time.",
  "Every day one step closer to who you want to be.",
  "Discipline grows by showing up daily.",
  "Sometimes showing up is the most important part of the ritual.",
  "Your identity is not defined by a single day",
  "Do it daily, even when you don't feel like it.",
];

export function getDailyQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

export const MAX_SCORE = 100;
export const MIN_SCORE = 0;
export const COMPLETE_REWARD = 1;
export const MISS_PENALTY = 0.25;

export function getScoreBasedLevel(score: number): number {
  if (score <= 20) return 1;
  if (score <= 40) return 2;
  if (score <= 60) return 3;
  if (score <= 80) return 4;
  return 5;
}

export const LEVEL_NAMES = ["Seed", "Sprout", "Root", "Flow", "Anchor"] as const;

export function getAgeBasedMaxLevel(ageInDays: number): number {
  if (ageInDays < 3) return 1;
  if (ageInDays < 10) return 2;
  if (ageInDays < 21) return 3;
  if (ageInDays < 45) return 4;
  return 5;
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level - 1] ?? LEVEL_NAMES[0];
}

export function calculateLevel(stabilityScore: number, ageInDays: number): number {
  const scoreLevel = getScoreBasedLevel(stabilityScore);
  const ageLevel = getAgeBasedMaxLevel(ageInDays);
  return Math.min(scoreLevel, ageLevel);
}

export function getHabitAgeInDays(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = now - created;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getCompletionCount(habit: Habit, logs: HabitLog[]): number {
  const createdDay = formatDate(new Date(habit.createdAt));
  const today = formatDate(new Date());
  return logs.filter(
    (log) =>
      log.habitId === habit.id &&
      log.status === "completed" &&
      log.date >= createdDay &&
      log.date <= today
  ).length;
}

export function getPersona(habits: Habit[], logs: HabitLog[]): string {
  const completionRate = logs.length
    ? logs.filter((l) => l.status === "completed").length / logs.length
    : 0;

  if (habits.length === 0) {
    return "A quiet beginning awaits. Your first ritual will shape the path.";
  }
  if (completionRate > 0.8) {
    return "You show up quietly and consistently. Your routines reflect calm discipline.";
  }
  if (completionRate > 0.5) {
    return "You return to your rituals with intention. Steady, not rushed.";
  }
  return "You are exploring what consistency feels like. Each return matters.";
}
