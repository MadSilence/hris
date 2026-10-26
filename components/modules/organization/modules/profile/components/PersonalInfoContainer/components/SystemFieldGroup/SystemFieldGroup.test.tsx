import * as React from "react";
import { render, screen } from "@testing-library/react";

import type { User } from "@/models/user/User";
import type { FieldDTO } from "@/models/user/fields";
import type { ScheduledChange } from "@/models/user/ScheduledChange";
import { formatDisplayDate } from "@/lib/date";
import { partialMock } from "@/test/types";
import { SystemFieldGroup } from "./SystemFieldGroup";

const user = partialMock<User>({
  id: "u1",
  firstName: "Ada",
  lastName: "Lovelace",
  office: { id: "london", name: "London" },
  department: { id: "eng", name: "Engineering" },
  custom: {},
});

const fields = [
  partialMock<FieldDTO>({ id: "sys:office", label: "Office" }),
  partialMock<FieldDTO>({ id: "sys:department", label: "Department" }),
];

const officeMove: ScheduledChange = {
  id: "c1",
  kind: "ASSIGNMENT_START",
  labelKey: "ASSIGNMENT_START.OFFICE",
  effectiveAt: "2026-12-01",
  scheduledBy: null,
  scheduledAt: null,
  canCancel: true,
  canReschedule: false,
  rescheduleDate: null,
  fieldId: "sys:office",
  operation: "SET",
  value: { id: "paris", name: "Paris" },
  subject: null,
};

const renderGroup = (scheduledChanges?: ScheduledChange[]) =>
  render(
    <SystemFieldGroup
      user={user}
      fields={fields}
      title="Placement"
      isEdit={false}
      draft={null}
      onDraftChange={jest.fn()}
      scheduledChanges={scheduledChanges}
    />,
  );

describe("SystemFieldGroup — a field that is going to change", () => {
  it("reads current → new from <date>, the second half muted", () => {
    renderGroup([officeMove]);

    expect(screen.getByText("London")).toBeInTheDocument();
    const pending = screen.getByTestId("pending-change");
    expect(pending).toHaveTextContent(`→ Paris from ${formatDisplayDate("2026-12-01", { style: "medium" })}`);
    expect(pending).toHaveClass("text-muted-foreground");
  });

  it("leaves a field nothing is scheduled on as it is", () => {
    renderGroup([officeMove]);

    expect(screen.getAllByTestId("pending-change")).toHaveLength(1);
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("shows no pending value to a reader who was given none", () => {
    renderGroup([]);

    expect(screen.queryByTestId("pending-change")).not.toBeInTheDocument();
  });
});
