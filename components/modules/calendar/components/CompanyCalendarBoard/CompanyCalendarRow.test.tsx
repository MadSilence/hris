import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import {
  CompanyCalendarRow,
  toLaneSegments,
} from "@/components/modules/calendar/components/CompanyCalendarBoard/CompanyCalendarRow";
import {
  BoardContext,
  BoardRegistry,
  type BoardContextValue,
  type LeaveDecisions,
} from "@/components/modules/calendar/components/CompanyCalendarBoard/boardContext";
import type { CompanyCalendarAbsence, CompanyCalendarMark, CompanyCalendarUser } from "@/models/calendar";

const rangeStart = new Date(2026, 10, 2); // Mon 2 Nov 2026
const DAY_W = 38;

const user: CompanyCalendarUser = { id: "u1", firstName: "Inga", lastName: "Ruiz", email: "inga@example.com", avatarUrl: null };

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
  startDate: "2026-11-05",
  endDate: "2026-11-05",
  nominalDate: null,
  dayPart: "FULL_DAY",
  calendarId: "c1",
  calendarName: null,
  ...over,
});

const decisionsWith = (over: Partial<LeaveDecisions> = {}): LeaveDecisions => ({
  canDecide: () => false,
  approve: jest.fn(),
  decline: jest.fn(),
  openFull: () => null,
  ...over,
});

const renderInBoard = (ui: ReactElement, over: { decisions?: LeaveDecisions; scale?: "month" | "week"; registry?: BoardRegistry } = {}) => {
  const value: BoardContextValue = {
    geometry: {
      rangeStart,
      dayCount: 28,
      dayW: DAY_W,
      scale: over.scale ?? "month",
      isNonWorkingDay: (d) => d.getDay() === 0 || d.getDay() === 6,
      todayIndex: 2,
      columnHolidays: new Map(),
      headerHeight: 76,
    },
    registry: over.registry ?? new BoardRegistry(),
    decisions: over.decisions ?? decisionsWith(),
    picked: null,
    setPicked: () => {},
  };
  return render(<BoardContext.Provider value={value}>{ui}</BoardContext.Provider>);
};

describe("toLaneSegments", () => {
  it("puts overlapping leave in separate lanes and reuses a lane once it is free", () => {
    const { segments, lanes } = toLaneSegments(
      [
        leave({ requestId: "a", startDate: "2026-11-02", endDate: "2026-11-04" }),
        leave({ requestId: "b", startDate: "2026-11-03", endDate: "2026-11-03" }),
        leave({ requestId: "c", startDate: "2026-11-05", endDate: "2026-11-06" }),
      ],
      rangeStart,
      28,
    );
    expect(lanes).toBe(2);
    expect(segments.map((s) => [s.absence.requestId, s.startCol, s.endCol, s.lane])).toEqual([
      ["a", 0, 2, 0],
      ["b", 1, 1, 1],
      ["c", 3, 4, 0],
    ]);
  });

  it("cuts leave to the loaded days and says where it goes on", () => {
    const { segments } = toLaneSegments(
      [leave({ startDate: "2026-11-02", endDate: "2026-12-31", requestStartDate: "2026-10-20", requestEndDate: "2026-12-31" })],
      rangeStart,
      28,
    );
    expect(segments[0]).toMatchObject({ startCol: 0, endCol: 27, continuesLeft: true, continuesRight: true });
  });

  it("leaves out what is wholly outside the loaded days", () => {
    expect(toLaneSegments([leave({ startDate: "2027-01-04", endDate: "2027-01-05" })], rangeStart, 28).segments).toEqual([]);
  });
});

describe("the name column", () => {
  it("draws the job under the name when the row carries one (B5)", () => {
    renderInBoard(<CompanyCalendarRow user={{ ...user, jobName: "Product designer" }} marks={[]} absences={[]} />);
    expect(screen.getByText("Inga Ruiz")).toBeInTheDocument();
    expect(screen.getByText("Product designer")).toBeInTheDocument();
  });
});

describe("a leave pill", () => {
  it("says Away and stays gray when the policy was not sent", () => {
    renderInBoard(<CompanyCalendarRow user={user} marks={[]} absences={[leave()]} />);
    const pill = screen.getByRole("button", { name: /^Away/ });
    expect(pill.getAttribute("style")).toContain("--leave-gray-fill");
  });

  it("is named by its policy, coloured by it, with the length when the server sent it", () => {
    renderInBoard(
      <CompanyCalendarRow
        user={user}
        marks={[]}
        absences={[leave({ policyName: "Annual leave", policyColor: "ocean", amount: 2, unit: "DAYS" })]}
      />,
    );
    const pill = screen.getByRole("button", { name: "Annual leave · 2 days" });
    expect(pill.getAttribute("style")).toContain("--leave-ocean-fill");
  });

  it("is white under a dashed edge while it is being decided", () => {
    renderInBoard(<CompanyCalendarRow user={user} marks={[]} absences={[leave({ status: "PENDING", policyColor: "ocean", policyName: "Annual leave" })]} />);
    const pill = screen.getByRole("button", { name: /Annual leave/ });
    expect(pill).toHaveAttribute("data-status", "PENDING");
    expect(pill.getAttribute("style")).toContain("dashed");
  });

  it("says where a long leave ends rather than how long it is", () => {
    renderInBoard(
      <CompanyCalendarRow
        user={user}
        marks={[]}
        absences={[leave({ policyName: "Parental leave", startDate: "2026-11-02", endDate: "2026-12-31", amount: 44 })]}
      />,
    );
    expect(screen.getByRole("button", { name: /Parental leave · back/ })).toBeInTheDocument();
  });
});

describe("the leave card", () => {
  it("opens on a click with the dates, the length and the comment the server sent", () => {
    renderInBoard(
      <CompanyCalendarRow
        user={user}
        marks={[]}
        absences={[leave({ policyName: "Annual leave", amount: 2, comment: "Family trip to Madeira", requestId: "r1" })]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Annual leave/ }));
    const card = screen.getByRole("dialog");
    expect(within(card).getByText("Family trip to Madeira")).toBeInTheDocument();
    expect(within(card).getByText(/2 days · back/)).toBeInTheDocument();
    expect(within(card).getByText("Approved")).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });

  it("offers Decline and Approve to whoever can decide, and says who else is away", () => {
    const decisions = decisionsWith({ canDecide: () => true });
    const registry = new BoardRegistry();
    const mine = leave({ status: "PENDING", policyName: "Annual leave", requestId: "r1", startDate: "2026-11-09", endDate: "2026-11-13" });
    registry.set(
      "flat",
      [user, { id: "u2", firstName: "Urs", lastName: "Baumann", email: "urs@example.com", avatarUrl: null }],
      [mine, leave({ userId: "u2", startDate: "2026-11-12", endDate: "2026-11-16" })],
    );
    renderInBoard(<CompanyCalendarRow user={user} marks={[]} absences={[mine]} />, { decisions, registry });

    fireEvent.click(screen.getByRole("button", { name: /Annual leave/ }));
    const card = screen.getByRole("dialog");
    expect(within(card).getByText(/Urs Baumann is also away/)).toBeInTheDocument();

    fireEvent.click(within(card).getByRole("button", { name: "Approve" }));
    expect(decisions.approve).toHaveBeenCalledWith(mine);
  });
});

describe("a row", () => {
  it("tints the person's public holiday and names it in the week view", () => {
    const { container, rerender } = renderInBoard(<CompanyCalendarRow user={user} marks={[holiday()]} />);
    expect(container.querySelector("[data-holiday='Founders Day']")).not.toBeNull();
    expect(screen.queryByText("Founders Day")).not.toBeInTheDocument();
    rerender(<></>);
    renderInBoard(<CompanyCalendarRow user={user} marks={[holiday()]} />, { scale: "week" });
    expect(screen.getByText("Founders Day")).toBeInTheDocument();
  });

  it("opens a request for the days dragged across, in either direction", () => {
    const onSelectRange = jest.fn();
    renderInBoard(<CompanyCalendarRow user={user} marks={[]} onSelectRange={onSelectRange} />);
    const days = screen.getByTestId("calendar-row-days");
    fireEvent.mouseDown(days, { button: 0, clientX: 4 * DAY_W + 5 });
    fireEvent.mouseMove(window, { clientX: 1 * DAY_W + 5 });
    fireEvent.mouseUp(window);
    expect(onSelectRange).toHaveBeenCalledWith("2026-11-03", "2026-11-06");
  });

  it("offers nothing on a row the reader may not request for", () => {
    renderInBoard(<CompanyCalendarRow user={user} marks={[]} />);
    expect(screen.getByTestId("calendar-row-days").className).not.toContain("cursor-cell");
  });
});
