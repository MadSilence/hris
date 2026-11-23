import { useEffect } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { PolicyAssignmentsTab } from "./PolicyAssignmentsTab";
import { TimeOffPolicyAssignmentStatus } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto/TimeOffPolicyAssignmentStatus";

let assignments: unknown[] = [];
const mounts = { count: 0 };

jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useTimeOffPolicyAssignments",
  () => ({ useTimeOffPolicyAssignments: () => ({ data: assignments, isLoading: false, error: null }) }),
);
jest.mock(
  "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useEndTimeOffPolicyAssignment",
  () => ({ useEndTimeOffPolicyAssignment: () => ({ mutateAsync: jest.fn(), isPending: false }) }),
);
jest.mock("@/components/audience/assignment/history/AssignmentHistory", () => ({
  AssignmentHistoryList: () => null,
  HistoryToggle: () => null,
}));
jest.mock("@/components/audience/assignment/AssignPeopleModal", () => ({
  AssignPeopleModal: ({ isOpen }: { isOpen: boolean }) => {
    useEffect(() => {
      mounts.count += 1;
    }, []);
    return isOpen ? <div>assign window</div> : null;
  },
}));

/**
 * The walk of 2026-11-23: the first person assigned to a policy turned the empty state into the list,
 * and the open Assign window — drawn inside each branch — was remounted and reset to an empty picker,
 * losing the result it had just shown.
 */
describe("PolicyAssignmentsTab — the first assignment", () => {
  it("keeps the open Assign window mounted when the empty state becomes the list", () => {
    assignments = [];
    mounts.count = 0;
    const { rerender } = render(<PolicyAssignmentsTab policyId="p1" policyName="Walk" isArchived={false} />);

    fireEvent.click(screen.getByRole("button", { name: /Assign people/ }));
    expect(screen.getByText("assign window")).toBeInTheDocument();

    assignments = [
      {
        id: "a1",
        userId: "u1",
        status: TimeOffPolicyAssignmentStatus.Active,
        effectiveFrom: "2026-11-01",
        person: { id: "u1", name: "Petr Kastahlod" },
      },
    ];
    rerender(<PolicyAssignmentsTab policyId="p1" policyName="Walk" isArchived={false} />);

    expect(screen.getByText("assign window")).toBeInTheDocument();
    expect(mounts.count).toBe(1);
  });

  it("writes the start date as a date, not as yyyy-MM-dd", () => {
    assignments = [
      {
        id: "a1",
        userId: "u1",
        status: TimeOffPolicyAssignmentStatus.Active,
        effectiveFrom: "2026-11-01",
        person: { id: "u1", name: "Petr Kastahlod" },
      },
    ];
    render(<PolicyAssignmentsTab policyId="p1" policyName="Walk" isArchived={false} />);

    expect(screen.queryByText(/2026-11-01/)).not.toBeInTheDocument();
    expect(screen.getByText(/1 Nov 2026/)).toBeInTheDocument();
  });
});
