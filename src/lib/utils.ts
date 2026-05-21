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
  streak: number;
}

export interface HabitLog {
  habitId: string;
  date: string;
  status: HabitStatus;
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

export function getLevel(streak: number): { level: number; name: string } {
  if (streak < 7) return { level: 1, name: "Beginner" };
  if (streak < 21) return { level: 2, name: "Practiced" };
  if (streak < 60) return { level: 3, name: "Devoted" };
  if (streak < 120) return { level: 4, name: "Ritualist" };
  return { level: 5, name: "Master" };
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
