import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { AttendanceDay } from "@/models/attendance";
import { expectedLabel, TimesheetDayRow } from "@/components/modules/attendance/timesheet/TimesheetDayRow";

const day = (overrides: Partial<AttendanceDay> = {}): AttendanceDay => ({
  date: "2026-09-21",
  workingDay: true,
  scheduledHours: null,
  holiday: null,
  onLeave: false,
  hours: null,
  description: null,
  source: null,
  conflict: false,
  ...overrides,
});

const renderRow = (props: Partial<React.ComponentProps<typeof TimesheetDayRow>> = {}) => {
  const onSave = props.onSave ?? jest.fn().mockResolvedValue({});
  render(
    <table>
      <tbody>
        <TimesheetDayRow day={day()} today="2026-09-21" canRecord onSave={onSave} {...props}/>
      </tbody>
    </table>,
  );
  return onSave;
};

describe("TimesheetDayRow", () => {
  it("records hours and a description for a day that has happened", async () => {
    const onSave = renderRow();

    fireEvent.change(screen.getByLabelText("Hours on 2026-09-21"), { target: { value: "7,5" } });
    fireEvent.change(screen.getByLabelText("Description on 2026-09-21"), { target: { value: "Sprint review" } });
    fireEvent.click(screen.getByRole("button", { name: "Save 2026-09-21" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith("2026-09-21", 7.5, "Sprint review"));
  });

  it("offers nothing to type for a day after today", () => {
    renderRow({ day: day({ date: "2026-09-22" }) });
    expect(screen.queryByLabelText("Hours on 2026-09-22")).not.toBeInTheDocument();
  });

  it("offers nothing to type to somebody who may not record this person's days", () => {
    renderRow({ canRecord: false, day: day({ hours: 8, description: "Planning" }) });
    expect(screen.queryByLabelText("Hours on 2026-09-21")).not.toBeInTheDocument();
    expect(screen.getByText("Planning")).toBeInTheDocument();
  });

  it("does not ask for hours on a day of leave", () => {
    renderRow({ day: day({ onLeave: true }) });
    expect(screen.getByText("Leave")).toBeInTheDocument();
    expect(screen.queryByLabelText("Hours on 2026-09-21")).not.toBeInTheDocument();
  });

  it("keeps a conflicting day editable and says why", () => {
    renderRow({ day: day({ onLeave: true, conflict: true, hours: 4 }) });
    expect(screen.getByLabelText("Hours on 2026-09-21")).toHaveValue("4");
    expect(screen.getByText(/recorded on a day of approved leave/)).toBeInTheDocument();
  });

  it("shows the refusal on the row and keeps what was typed", async () => {
    const onSave = jest.fn().mockResolvedValue({ error: "Hours must be between 0 and 24.", field: "hours" });
    renderRow({ onSave });

    fireEvent.change(screen.getByLabelText("Hours on 2026-09-21"), { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: "Save 2026-09-21" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Hours must be between 0 and 24.");
    expect(screen.getByLabelText("Hours on 2026-09-21")).toHaveValue("30");
  });

  it("refuses text that is not a number without calling the server", async () => {
    const onSave = renderRow();

    fireEvent.change(screen.getByLabelText("Hours on 2026-09-21"), { target: { value: "eight" } });
    fireEvent.click(screen.getByRole("button", { name: "Save 2026-09-21" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Enter the hours as a number");
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe("expectedLabel", () => {
  it("names the norm only when the schedule knows it", () => {
    expect(expectedLabel(day({ scheduledHours: 4 }))).toBe("4 h");
    expect(expectedLabel(day())).toBe("Working day");
    expect(expectedLabel(day({ workingDay: false }))).toBe("");
    expect(expectedLabel(day({ workingDay: false, holiday: "Knowledge Day" }))).toBe("Knowledge Day");
  });
});
