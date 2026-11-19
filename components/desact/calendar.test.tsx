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

/**
 * react-day-picker joins the modifiers' classes to the day's own without merging them, so a colour on the day itself
 * outranked them all: past days a picker refuses, the next month's days and today read Ink (walk of 2026-11-19).
 */
describe("Calendar — a day's colour comes from its modifiers", () => {
  it("gives a plain day no colour of its own, so a refused day can turn gray", () => {
    const nov = (d: number) => new Date(2026, 10, d);
    render(<Calendar mode="single" onSelect={() => {}} defaultMonth={nov(1)} disabled={{ before: nov(19) }} />);
    expect(day(18).className).toContain("text-disabled");
    expect(day(18).className).not.toContain("text-primary");
    expect(day(20).className).not.toContain("text-primary");
  });
});
