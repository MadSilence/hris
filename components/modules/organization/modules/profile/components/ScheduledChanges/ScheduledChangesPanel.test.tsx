import * as React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import type { ScheduledChange } from "@/models/user/ScheduledChange";
import { ActionStatus } from "@/components/models/ActionStatus";
import { formatDisplayDate } from "@/lib/date";
import {
  cancelScheduledChangeAction,
  rescheduleScheduledChangeAction,
} from "@/components/modules/organization/modules/profile/actions/scheduledChangeActions";
import { ScheduledChangesPanel } from "./ScheduledChangesPanel";

jest.mock("@/components/modules/organization/modules/profile/actions/scheduledChangeActions", () => ({
  cancelScheduledChangeAction: jest.fn(),
  rescheduleScheduledChangeAction: jest.fn(),
}));
const mockInvalidate = jest.fn();
jest.mock("@/components/modules/organization/modules/profile/hooks/useUserScheduledChanges", () => ({
  useInvalidateUserScheduledChanges: () => mockInvalidate,
}));

const mockedCancel = jest.mocked(cancelScheduledChangeAction);
const mockedReschedule = jest.mocked(rescheduleScheduledChangeAction);

const termination: ScheduledChange = {
  id: "t1",
  kind: "TERMINATION",
  labelKey: "TERMINATION",
  effectiveAt: "2026-11-01",
  scheduledBy: { id: "hr", name: "Grace Hopper" },
  scheduledAt: "2026-10-01T09:00:00",
  canCancel: true,
  canReschedule: true,
  rescheduleDate: "2026-10-31",
  fieldId: "sys:status",
  operation: "SET",
  value: { id: "ARCHIVED", name: null },
  subject: null,
};

const task: ScheduledChange = {
  ...termination,
  id: "k1",
  kind: "TASK_DUE",
  labelKey: "TASK_DUE",
  effectiveAt: "2026-11-05",
  scheduledBy: null,
  canCancel: false,
  canReschedule: false,
  rescheduleDate: null,
  fieldId: null,
  operation: null,
  value: null,
  subject: "Return the laptop",
};

const renderPanel = (changes: ScheduledChange[], onChanged = jest.fn()) =>
  render(<ScheduledChangesPanel userId="u1" changes={changes} onChangedAction={onChanged} />);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ScheduledChangesPanel", () => {
  it("is not drawn at all when nothing is scheduled", () => {
    const { container } = renderPanel([]);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists each change with its date and who scheduled it, and offers only what the kind allows", () => {
    renderPanel([termination, task]);

    fireEvent.click(screen.getByRole("button", { name: /Scheduled Changes \(2\)/ }));

    const list = screen.getByRole("list", { name: "Scheduled changes" });
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(2);

    expect(within(rows[0]).getByText("Employment Ends")).toBeInTheDocument();
    expect(within(rows[0]).getByText(new RegExp(formatDisplayDate("2026-10-31", { style: "medium" })))).toBeInTheDocument();
    expect(within(rows[0]).getByText("Scheduled by Grace Hopper")).toBeInTheDocument();
    expect(within(rows[0]).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(within(rows[0]).getByRole("button", { name: "Change Date" })).toBeInTheDocument();

    expect(within(rows[1]).getByText("Task Due: Return the laptop")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Scheduled by a process")).toBeInTheDocument();
    expect(within(rows[1]).queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    expect(within(rows[1]).queryByRole("button", { name: "Change Date" })).not.toBeInTheDocument();
  });

  it("cancels after a confirmation, then re-reads the list and the person", async () => {
    mockedCancel.mockResolvedValue({ status: ActionStatus.SUCCESS });
    const onChanged = jest.fn();
    renderPanel([termination], onChanged);

    fireEvent.click(screen.getByRole("button", { name: /Scheduled Changes \(1\)/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockedCancel).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancel Change" }));

    await waitFor(() => expect(mockedCancel).toHaveBeenCalledWith({ userId: "u1", changeId: "t1" }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(mockInvalidate).toHaveBeenCalledWith("u1");
  });

  it("keeps the confirmation open and says why when the cancel is refused", async () => {
    mockedCancel.mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "This change is no longer scheduled." });
    const onChanged = jest.fn();
    renderPanel([termination], onChanged);

    fireEvent.click(screen.getByRole("button", { name: /Scheduled Changes/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel Change" }));

    expect(await screen.findByText("This change is no longer scheduled.")).toBeInTheDocument();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("moves a change to the date chosen, starting from the date it has", async () => {
    mockedReschedule.mockResolvedValue({ status: ActionStatus.SUCCESS });
    renderPanel([termination]);

    fireEvent.click(screen.getByRole("button", { name: /Scheduled Changes/ }));
    fireEvent.click(screen.getByRole("button", { name: "Change Date" }));
    expect(screen.getByText("Last Working Day")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(mockedReschedule).toHaveBeenCalledWith({ userId: "u1", changeId: "t1", date: "2026-10-31" }),
    );
  });
});
