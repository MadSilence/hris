import { fireEvent, render, screen } from "@testing-library/react";
import {
  CompanyCalendarRow,
  leaveStyle,
  leaveTitle,
  rowHeight,
  toSegments,
  type CompanyCalendarBar,
} from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarRow";
import type { CompanyCalendarAbsence, CompanyCalendarMark } from "@/models/calendar";

jest.mock("@/components/modules/settings/shared/UserChip/UserChip", () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <span>{name}</span>,
}));

const dayISOs = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"];

const leave = (over: Partial<CompanyCalendarAbsence> = {}): CompanyCalendarAbsence => ({
  userId: "u1",
  startDate: "2026-11-03",
  endDate: "2026-11-04",
  status: "APPROVED",
  ...over,
});

const holiday = (over: Partial<CompanyCalendarMark> = {}): CompanyCalendarMark => ({
  userId: "u1",
  id: "h1",
  name: "Founders Day",
  startDate: "2026-11-03",
  endDate: "2026-11-03",
  nominalDate: null,
  dayPart: "FULL_DAY",
  calendarId: "c1",
  calendarName: null,
  ...over,
});

const leaveBar = (a: CompanyCalendarAbsence, key: string): CompanyCalendarBar => ({
  kind: "leave",
  key,
  absence: a,
  startDate: a.startDate,
  endDate: a.endDate,
});

describe("toSegments — lanes", () => {
  it("puts overlapping bars in separate lanes and reuses a lane once it is free", () => {
    const segments = toSegments(
      [
        { kind: "holiday", key: "h", mark: holiday(), startDate: "2026-11-03", endDate: "2026-11-03" },
        leaveBar(leave(), "a"),
        leaveBar(leave({ startDate: "2026-11-05", endDate: "2026-11-06" }), "b"),
      ],
      dayISOs,
    );
    const lane = (key: string) => segments.find((s) => s.bar.key === key)?.lane;
    expect(lane("h")).toBe(0);
    expect(lane("a")).toBe(1);
    expect(lane("b")).toBe(0);
    expect(rowHeight(segments)).toBeGreaterThan(44);
  });

  it("keeps one lane at the old row height", () => {
    expect(rowHeight(toSegments([leaveBar(leave(), "a")], dayISOs))).toBe(44);
  });

  it("clips a bar to the window and marks that it continues", () => {
    const [seg] = toSegments([leaveBar(leave({ startDate: "2026-10-30", endDate: "2026-11-02" }), "a")], dayISOs);
    expect(seg.startCol).toBe(0);
    expect(seg.continuesLeft).toBe(true);
  });
});

describe("a leave bar", () => {
  it("says Time off and stays neutral when the type was not sent", () => {
    const style = leaveStyle(leave());
    expect(leaveTitle(leave())).toContain("Time off");
    expect(style.backgroundColor).toBe("var(--brown-100)");
  });

  it("is tinted with the type's colour only when the type was sent", () => {
    expect(leaveStyle(leave({ leaveTypeName: "Vacation", leaveTypeColor: "#22aa44" })).backgroundColor).toBe(
      "#22aa4433",
    );
  });

  it("is hatched and says so while it is being decided", () => {
    const pending = leave({ status: "PENDING", awaitingYou: true });
    expect(leaveStyle(pending).backgroundImage).toContain("repeating-linear-gradient");
    expect(leaveTitle(pending)).toContain("Pending your approval");
    expect(leaveTitle(leave({ status: "PENDING" }))).toContain("Pending approval");
  });

  const geometry = {
    days: dayISOs.map((iso) => new Date(`${iso}T00:00:00`)),
    dayISOs,
    todayISO: "2026-11-02",
    isNonWorkingDay: () => false,
    density: "week" as const,
    gridTemplateColumns: "200px repeat(5, 1fr)",
  };
  const user = { id: "u1", firstName: "Anna", lastName: "Berg", email: "anna@example.com", avatarUrl: null };

  it("opens the request when the server sent its id", () => {
    render(<CompanyCalendarRow user={user} marks={[]} absences={[leave({ requestId: "r1" })]} {...geometry} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/time-off/requests/r1");
  });

  it("is not a link without the id", () => {
    render(<CompanyCalendarRow user={user} marks={[]} absences={[leave()]} {...geometry} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Time off")).toBeInTheDocument();
  });

  it("opens a request for the days dragged across, in either direction", () => {
    const onSelectRange = jest.fn();
    const { container } = render(
      <CompanyCalendarRow user={user} marks={[]} onSelectRange={onSelectRange} {...geometry} />,
    );
    const day = (iso: string) => container.querySelector(`[data-day="${iso}"]`) as HTMLElement;
    fireEvent.mouseDown(day("2026-11-05"));
    fireEvent.mouseEnter(day("2026-11-03"));
    fireEvent.mouseUp(window);
    expect(onSelectRange).toHaveBeenCalledWith("2026-11-03", "2026-11-05");
  });

  it("offers nothing on a row the reader may not request for", () => {
    const { container } = render(<CompanyCalendarRow user={user} marks={[]} {...geometry} />);
    expect(container.querySelector(".cursor-cell")).toBeNull();
  });
});
