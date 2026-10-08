import { fireEvent, render, screen } from "@testing-library/react";
import { UserCalendar } from "@/components/modules/calendar/components/UserCalendar/UserCalendar";

jest.mock("@/components/providers/CompanyDataProvider/CompanyDataProvider", () => ({
  useCompanyData: () => ({ company: undefined }),
}));

/**
 * The day facts a caller is handed, and the month it is told about (Attendance's profile tab). The
 * grid is shared with Time Off, so what is guarded here is that a caller is told the truth about a
 * day — a holiday and a day of leave are exactly the days that have no norm.
 */
const holidays = [{ id: "h1", name: "Autumn Day", date: "2026-10-05" }];
const timeOff = [
  { id: "t1", label: "Annual leave", startDate: "2026-10-12", endDate: "2026-10-14", tone: "approved" as const },
];

const renderCalendar = (props: Partial<React.ComponentProps<typeof UserCalendar>> = {}) =>
  render(<UserCalendar holidays={holidays} timeOff={timeOff} {...props}/>);

/** A day cell's content: its own marks, so a flag that is wrong reads as wrong text. */
const day = (iso: string, marks: string) => <span data-test={`day-${iso}`}>{marks}</span>;

describe("UserCalendar — what a caller is told", () => {
  beforeAll(() => jest.useFakeTimers({ now: new Date(2026, 9, 15, 9, 0, 0) }));
  afterAll(() => jest.useRealTimers());

  it("tells the caller the visible month, and every step of it", () => {
    const onMonthChange = jest.fn();
    renderCalendar({ onMonthChange });

    expect(onMonthChange).toHaveBeenLastCalledWith("2026-10");
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onMonthChange).toHaveBeenLastCalledWith("2026-11");
  });

  it("draws only the weeks the month touches", () => {
    // October 2026 starts on a Thursday and ends on a Saturday: five rows, Mon 28 Sep – Sun 1 Nov.
    // The grid was a fixed six, which added a week that belonged entirely to November.
    renderCalendar({ renderDay: (d) => day(d.iso, "") });

    expect(screen.getByTestId("day-2026-09-28")).toBeInTheDocument();
    expect(screen.getByTestId("day-2026-11-01")).toBeInTheDocument();
    expect(screen.queryByTestId("day-2026-11-02")).not.toBeInTheDocument();
  });

  it("tells a day cell whether the day is a holiday or held by leave", () => {
    renderCalendar({
      renderDay: (d) => day(d.iso, `${d.isHoliday ? "H" : ""}${d.isTimeOff ? "L" : ""}`),
    });

    expect(screen.getByTestId("day-2026-10-05")).toHaveTextContent("H");
    expect(screen.getByTestId("day-2026-10-13")).toHaveTextContent("L");
    expect(screen.getByTestId("day-2026-10-06")).toHaveTextContent("");
  });

  it("reports a click as a span of one day", () => {
    const onSelectRange = jest.fn();
    renderCalendar({ onSelectRange, renderDay: (d) => day(d.iso, "") });

    // The drag is how a span is picked; a click is the same gesture with one day in it.
    fireEvent.pointerDown(screen.getByTestId("day-2026-10-07"));
    fireEvent.pointerUp(window);

    expect(onSelectRange).toHaveBeenCalledWith("2026-10-07", "2026-10-07");
  });

  it("keeps the picked span on screen after the drag", () => {
    renderCalendar({
      selectedRange: { start: "2026-10-07", end: "2026-10-09" },
      renderDay: (d) => day(d.iso, ""),
    });

    // Only the ends are ringed, so a run reads as one run.
    const cell = (iso: string) => screen.getByTestId(`day-${iso}`).closest("div[class*=\"min-h-\"]");
    expect(cell("2026-10-07")).toHaveClass("ring-2");
    expect(cell("2026-10-08")).not.toHaveClass("ring-2");
    expect(cell("2026-10-09")).toHaveClass("ring-2");
  });
});
