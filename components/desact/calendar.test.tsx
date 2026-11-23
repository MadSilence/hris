import { fireEvent, render, screen } from "@testing-library/react";
import { Calendar } from "./calendar";

const nov = (d: number) => new Date(2026, 10, d);
const day = (iso: string) => document.querySelector<HTMLButtonElement>(`[data-day="${iso}"]`)!;

/** The one range look (DATE-RANGE, AQ-02): accent circles at the ends, the band centre to centre. */
describe("Calendar — a range", () => {
  it("fills the two ends and bands the days between", () => {
    render(<Calendar mode="range" selected={{ from: nov(3), to: nov(5) }} onSelect={() => {}} defaultMonth={nov(1)} />);
    expect(day("2026-11-03").className).toContain("bg-accent");
    expect(day("2026-11-05").className).toContain("bg-accent");
    expect(day("2026-11-04").dataset.inRange).toBe("true");
    expect(day("2026-11-06").dataset.inRange).toBeUndefined();
  });

  it("runs the band to the day under the pointer while the second date is still to come", () => {
    render(<Calendar mode="range" selected={{ from: nov(3) }} onSelect={() => {}} defaultMonth={nov(1)} />);
    fireEvent.mouseEnter(day("2026-11-12"));
    expect(day("2026-11-12").dataset.previewEnd).toBe("true");
    expect(day("2026-11-08").dataset.inRange).toBe("true");
  });

  it("brings the band in from the left edge when the range began in the month before", () => {
    render(<Calendar mode="range" selected={{ from: new Date(2026, 9, 28), to: nov(4) }} onSelect={() => {}} defaultMonth={nov(1)} />);
    // November 2026 starts on a Sunday, so a Monday-first grid has six blank cells before it, each carrying the band.
    const firstRow = screen.getAllByRole("row")[1];
    expect(firstRow.querySelectorAll("[aria-hidden] > span").length).toBeGreaterThan(0);
    expect(day("2026-11-01").dataset.inRange).toBe("true");
  });

  it("draws only the month's own days", () => {
    render(<Calendar mode="single" onSelect={() => {}} defaultMonth={nov(1)} />);
    expect(day("2026-10-31")).toBeNull();
    expect(day("2026-12-01")).toBeNull();
  });
});

describe("Calendar — a single day", () => {
  it("greys and refuses the days outside the field's bounds", () => {
    const onSelect = jest.fn();
    render(<Calendar mode="single" onSelect={onSelect} defaultMonth={nov(1)} isDisabled={(d) => d < nov(19)} />);
    expect(day("2026-11-18").className).toContain("text-disabled");
    fireEvent.click(day("2026-11-18"));
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(day("2026-11-20"));
    expect(onSelect).toHaveBeenCalledWith(nov(20));
  });

  it("turns into a grid of years from the year, and back to that year's days on a click", () => {
    render(<Calendar mode="single" selected={nov(14)} onSelect={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Year" }));
    fireEvent.click(screen.getByRole("option", { name: "2031" }));
    expect(day("2031-11-14")).not.toBeNull();
  });

  it("offers Today and Clear in the footer", () => {
    const onToday = jest.fn();
    const onClear = jest.fn();
    render(<Calendar mode="single" onSelect={() => {}} onToday={onToday} onClear={onClear} />);
    fireEvent.click(screen.getByRole("button", { name: "Today" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onToday).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalled();
  });
});
