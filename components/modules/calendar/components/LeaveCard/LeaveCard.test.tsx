import { render, screen } from "@testing-library/react";

import type { CompanyCalendarAbsence } from "@/models/calendar";
import { LeaveCard } from "./LeaveCard";

const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
const leave = (over: Partial<CompanyCalendarAbsence> = {}): CompanyCalendarAbsence => ({
  userId: "u1",
  startDate: "2026-11-16",
  endDate: "2026-11-20",
  status: "APPROVED",
  policyName: "Annual leave",
  policyColor: "blue",
  ...over,
});

describe("the board's leave card", () => {
  it("says working days by the request's counting method (B5)", () => {
    render(<LeaveCard absence={leave({ requestId: "r1", amount: 5, unit: "DAYS", countingMode: "WORKING_DAYS" })} isNonWorkingDay={weekend} />);
    expect(screen.getByText(/^5 working days · back/)).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("is reduced for a reader who may not see the time off: no status, length or comment (A3)", () => {
    render(<LeaveCard absence={leave()} isNonWorkingDay={weekend} onApprove={jest.fn()} />);
    expect(screen.getByText("Annual leave")).toBeInTheDocument();
    expect(screen.getByText(/^Back Mon/)).toBeInTheDocument();
    expect(screen.queryByText("Approved")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("says Away for a private policy", () => {
    render(<LeaveCard absence={leave({ policyName: undefined, policyColor: undefined })} isNonWorkingDay={weekend} />);
    expect(screen.getByText("Away")).toBeInTheDocument();
  });
});
