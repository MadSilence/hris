import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { AssignmentHistoryList, HistoryToggle } from "./AssignmentHistory";
import { useAssignmentHistory } from "@/components/modules/automations/hooks";
import type { AssignmentHistoryItem } from "@/models/automations";

jest.mock("@/components/modules/automations/hooks", () => ({ useAssignmentHistory: jest.fn() }));

const item = (over: Partial<AssignmentHistoryItem>): AssignmentHistoryItem => ({
  recordId: "h1",
  person: { id: "p1", name: "Bob Meyer" },
  status: "CREATED",
  origin: "RULE",
  rule: { id: "r1", name: "Berlin office" },
  by: null,
  at: "2026-06-01T08:00:00Z",
  skipReason: null,
  ...over,
});

describe("AssignmentHistoryList", () => {
  it("says who was assigned by which rule or by hand, removals included", () => {
    (useAssignmentHistory as jest.Mock).mockReturnValue({
      data: { content: [
        item({ recordId: "h2", status: "REMOVED", origin: "HAND", rule: null, by: { id: "a1", name: "Ada Admin" } }),
        item({}),
      ] },
      isLoading: false,
      error: null,
    });
    render(<AssignmentHistoryList assignableType="PUBLIC_HOLIDAY_CALENDAR" assignableId="cal-de" />);

    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("Bob Meyer · Removed by hand · Ada Admin");
    expect(rows[1]).toHaveTextContent("Bob Meyer · Assigned by rule Berlin office");
    expect(screen.getByRole("link", { name: "Berlin office" })).toHaveAttribute("href", "/settings/automation/automations/r1");
    expect(useAssignmentHistory).toHaveBeenCalledWith("PUBLIC_HOLIDAY_CALENDAR", "cal-de");
  });

  it("has an empty state of its own", () => {
    (useAssignmentHistory as jest.Mock).mockReturnValue({ data: { content: [] }, isLoading: false, error: null });
    render(<AssignmentHistoryList assignableType="TEAM" assignableId="t1" />);

    expect(screen.getByText("No history yet")).toBeInTheDocument();
  });
});

describe("HistoryToggle", () => {
  it("is a pressed / not pressed switch", () => {
    const onChange = jest.fn();
    render(<HistoryToggle showing={false} onChange={onChange} />);

    const button = screen.getByRole("button", { name: "History" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
