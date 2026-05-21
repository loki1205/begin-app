import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HabitRow } from "@/components/HabitRow";
import type { Habit } from "@/lib/utils";

const habit: Habit = {
  id: "habit-1",
  name: "Meditate",
  days: ["mon", "wed"],
  level: 1,
  createdAt: "2026-05-21T00:00:00.000Z",
  stabilityScore: 0,
  completionCount: 0,
};

describe("HabitRow", () => {
  it("renders the habit name", () => {
    render(<HabitRow habit={habit} status="pending" onStatusChange={() => {}} />);
    expect(screen.getByText("Meditate")).toBeInTheDocument();
  });

  it("renders day abbreviations", () => {
    render(<HabitRow habit={habit} status="pending" onStatusChange={() => {}} />);
    expect(screen.getByText("Mon · Wed")).toBeInTheDocument();
  });
});
