import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";

import type { LeaverDecisionsDTO } from "@/api/modules/users/clients/hrisApiUsersClient";
import {
  hasLeaverDecisions,
  LeaverDecisionsStep,
  NO_REASSIGNMENT,
  type LeaverReassignmentChoice,
} from "./LeaverDecisionsStep";

type PickerProps = { id?: string; value: { id: string } | null; onChange: (u: { id: string; firstName: string } | null) => void };

jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => ({
  UserPickerField: ({ id, value, onChange }: PickerProps) => (
    <button type="button" data-test={`picker-${id}`} onClick={() => onChange({ id: "erin", firstName: "Erin" })}>
      {value ? `picked ${value.id}` : "Reassign To…"}
    </button>
  ),
}));

const decisions: LeaverDecisionsDTO = {
  requests: [
    {
      requestId: "r1",
      requester: { id: "bob", name: "Bob Builder" },
      startDate: "2026-11-02",
      endDate: "2026-11-04",
      status: "PENDING",
      fallbackRoleName: "HR Admin",
    },
  ],
  tasks: [{ taskId: "t1", title: "Sign the welcome pack", subject: { id: "jo", name: "Jo Joiner" }, defaultAssignee: null }],
  policies: [],
};

const Harness = ({ onChange }: { onChange: (v: LeaverReassignmentChoice) => void }) => {
  const [value, setValue] = useState<LeaverReassignmentChoice>(NO_REASSIGNMENT);
  return (
    <LeaverDecisionsStep
      fullName="Dave Departing"
      decisions={decisions}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
};

describe("LeaverDecisionsStep", () => {
  it("lists what waits on the leaver, by group, with each group's default", () => {
    render(<Harness onChange={jest.fn()} />);

    expect(screen.getByText("Decisions Waiting on Dave Departing")).toBeInTheDocument();
    const requests = screen.getByTestId("leaver-group-requestsTo");
    expect(within(requests).getByText(/Bob Builder/)).toBeInTheDocument();
    expect(within(requests).getByText("Unchosen, they go to the HR Admin role, the policy's fallback.")).toBeInTheDocument();
    const tasks = screen.getByTestId("leaver-group-tasksTo");
    expect(within(tasks).getByText("Sign the welcome pack · for Jo Joiner")).toBeInTheDocument();
    expect(within(tasks).getByText("Unchosen, each goes to its onboarding manager.")).toBeInTheDocument();
    // A group with nothing in it is not shown at all.
    expect(screen.queryByTestId("leaver-group-policiesTo")).not.toBeInTheDocument();
  });

  it("reassigns one group without touching the others", () => {
    const onChange = jest.fn();
    render(<Harness onChange={onChange} />);

    fireEvent.click(screen.getByTestId("picker-reassign-requestsTo"));

    expect(onChange).toHaveBeenLastCalledWith({
      requestsTo: { id: "erin", firstName: "Erin" },
      tasksTo: null,
      policiesTo: null,
    });
    expect(screen.getByTestId("picker-reassign-requestsTo")).toHaveTextContent("picked erin");
    // The default is no longer what happens to that group, so it is not said any more.
    expect(screen.queryByText("Unchosen, they go to the HR Admin role, the policy's fallback.")).not.toBeInTheDocument();
  });

  it("says when a policy has no fallback, and shows nothing when nothing waits", () => {
    render(
      <LeaverDecisionsStep
        fullName="Dave"
        decisions={{ ...decisions, tasks: [], requests: [{ ...decisions.requests[0], fallbackRoleName: null }] }}
        value={NO_REASSIGNMENT}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/they wait for an administrator/)).toBeInTheDocument();
    expect(hasLeaverDecisions({ requests: [], tasks: [], policies: [] })).toBe(false);
    expect(hasLeaverDecisions(null)).toBe(false);
  });
});
