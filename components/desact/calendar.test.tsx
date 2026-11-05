import { fireEvent, render, screen } from "@testing-library/react";
import { Calendar } from "./calendar";

const day = (n: number) => screen.getAllByRole("gridcell", { name: String(n) }).find((b) => !b.className.includes("day-outside"))!;

/** The range band's preview while the second date is still to come (the designers' answer 1.5). */
describe("Calendar — range preview", () => {
  const nov = (d: number) => new Date(2026, 10, d);

  it.each([
    ["only the first date picked", { from: nov(3), to: undefined }],
    // The request dialog keeps the end equal to the start after the first click (walk of 2026-11-05).
    ["a one-day range", { from: nov(3), to: nov(3) }],
  ])("runs a Mist band to the day under the pointer — %s", (_, selected) => {
    render(<Calendar mode="range" selected={selected} onSelect={() => {}} defaultMonth={nov(1)} />);
    fireEvent.mouseEnter(day(12));
    expect(day(12).classList.contains("day-preview-end")).toBe(true);
    expect(day(8).classList.contains("day-preview")).toBe(true);
  });

  it("draws no preview once both dates are picked", () => {
    render(<Calendar mode="range" selected={{ from: nov(3), to: nov(5) }} onSelect={() => {}} defaultMonth={nov(1)} />);
    fireEvent.mouseEnter(day(12));
    expect(day(12).classList.contains("day-preview")).toBe(false);
  });
});
