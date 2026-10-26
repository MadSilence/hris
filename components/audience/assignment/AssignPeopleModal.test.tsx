import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AssignPeopleModal } from "./AssignPeopleModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  assignmentApplyAction,
  assignmentPreviewAction,
} from "@/components/audience/assignment/actions/assignmentActions";
import { createLiveRuleAction, previewLiveRuleAction } from "@/components/modules/automations/actions/automationActions";
import type { PeoplePickerProps } from "@/components/audience/PeoplePicker";

jest.mock("@/components/audience/assignment/actions/assignmentActions");
jest.mock("@/components/modules/automations/actions/automationActions");
jest.mock("@/components/modules/organization/hooks/useUserFields/useUserFields", () => ({
  useUserFields: () => ({ data: [], isLoading: false }),
}));
jest.mock("@/components/auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/components/ui/DatePicker", () => ({
  DatePicker: ({ ariaLabel, value, onChange }: { ariaLabel: string; value: string; onChange: (v: string) => void }) => (
    <input aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));
// The picker is its own component with its own tests; here it hands over a choice and a total.
jest.mock("@/components/audience/PeoplePicker", () => ({
  ...jest.requireActual("@/components/audience/PeoplePicker"),
  PeoplePicker: ({ onToggle, onToggleAllMatching, onMetaChange, onFiltersChange }: PeoplePickerProps) => {
    React.useEffect(() => onMetaChange?.({ total: 40 }), [onMetaChange]);
    return (
      <div>
        <button type="button" onClick={() => onToggle({ id: "u1", email: "anna@example.com" })}>Pick Anna</button>
        <button type="button" onClick={() => onFiltersChange([{ field: "sys:office", op: "eq", value: "berlin" }])}>Filter Berlin</button>
        <button type="button" onClick={() => onToggleAllMatching?.(true)}>Everyone Who Matches</button>
      </div>
    );
  },
}));

const renderModal = (props: Partial<React.ComponentProps<typeof AssignPeopleModal>> = {}) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <AssignPeopleModal
        isOpen
        onCloseAction={jest.fn()}
        basePath="/public-holiday-calendars"
        assignableId="cal-de"
        assignableName="Germany 2026"
        noun="calendar"
        semantics="add"
        {...props}
      />
    </QueryClientProvider>,
  );

beforeEach(() => {
  (assignmentPreviewAction as jest.Mock).mockResolvedValue({
    status: ActionStatus.SUCCESS,
    data: {
      assignableType: "PUBLIC_HOLIDAY_CALENDAR", assignableId: "cal-de", targetType: "USER",
      toCreate: [{ userId: "u1", email: "anna@example.com" }],
      toSkip: [],
      summary: { total: 3, created: 1, skipped: 2, failed: 0 },
      skippedByReason: { HAND_OVERRIDE: 1, DUPLICATE: 1 },
    },
  });
  (assignmentApplyAction as jest.Mock).mockResolvedValue({
    status: ActionStatus.SUCCESS,
    data: { ruleId: "a1", created: [{ userId: "u1", email: "anna@example.com" }], skipped: [], failed: [], summary: { total: 1, created: 1, skipped: 0, failed: 0 } },
  });
  (previewLiveRuleAction as jest.Mock).mockResolvedValue({
    status: ActionStatus.SUCCESS,
    data: { matching: 40, willAssign: 35, skippedByReason: { DUPLICATE: 3, RULE_CONFLICT: 2 }, items: [], conflicts: [{ person: { id: "p9", name: "Zoe" }, assignableType: "PUBLIC_HOLIDAY_CALENDAR", value: "x", otherRule: null, otherValue: null }] },
  });
  (createLiveRuleAction as jest.Mock).mockResolvedValue({
    status: ActionStatus.SUCCESS,
    data: { ruleId: "rule-9", ruleName: "Assign Germany 2026", willAssign: 35, skippedByReason: { DUPLICATE: 3 }, appliedNow: 35 },
  });
});

describe("AssignPeopleModal — picked people", () => {
  it("previews before Apply: N will be assigned, M skipped, and why", async () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Pick Anna" }));
    fireEvent.click(screen.getByRole("button", { name: "Review 1 person" }));

    const preview = await screen.findByTestId("assignment-preview");
    expect(preview).toHaveTextContent("1 person will be assigned, 2 skipped.");
    expect(preview).toHaveTextContent("1 set by hand to something else");
    expect(preview).toHaveTextContent("1 already there");
    expect(preview).toHaveTextContent("These people are assigned by hand, once.");
    expect(assignmentApplyAction).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Add 1 person" }));
    await screen.findByText("1 of 1 person added to the calendar.");
    expect(assignmentApplyAction).toHaveBeenCalledWith("/public-holiday-calendars", "cal-de", expect.objectContaining({ targetPayload: { userIds: ["u1"] } }));
    expect(createLiveRuleAction).not.toHaveBeenCalled();
  });

  it("goes back to the picker from the preview without applying anything", async () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Pick Anna" }));
    fireEvent.click(screen.getByRole("button", { name: "Review 1 person" }));
    await screen.findByTestId("assignment-preview");
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByRole("button", { name: "Pick Anna" })).toBeInTheDocument();
    expect(assignmentApplyAction).not.toHaveBeenCalled();
  });
});

describe("AssignPeopleModal — everyone who matches", () => {
  it("says plainly that a filter makes a live rule, and creates one", async () => {
    renderModal();

    fireEvent.click(screen.getByRole("button", { name: "Filter Berlin" }));
    fireEvent.click(screen.getByRole("button", { name: "Everyone Who Matches" }));
    expect(screen.getByTestId("live-rule-note")).toHaveTextContent("Everyone who matches now, and anyone who matches later.");

    fireEvent.click(screen.getByRole("button", { name: "Review 40 people" }));
    const preview = await screen.findByTestId("assignment-preview");
    expect(preview).toHaveTextContent("35 people will be assigned, 5 skipped.");
    expect(preview).toHaveTextContent("2 another rule sets this for them");
    expect(preview).toHaveTextContent("1 person already has a calendar from another live rule");
    expect(preview).toHaveTextContent("This creates a live rule — everyone who matches now, and anyone who matches later.");

    // The rule's segment is the reader's filters only — not the picker's "not assigned yet" filter,
    // which would make everybody the rule assigns stop matching at once.
    expect(previewLiveRuleAction).toHaveBeenCalledWith({
      assignableType: "PUBLIC_HOLIDAY_CALENDAR",
      assignableId: "cal-de",
      segment: expect.objectContaining({ filters: [{ field: "sys:office", op: "eq", value: "berlin" }] }),
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Live Rule" }));
    await screen.findByText("Live rule “Assign Germany 2026” created.");
    expect(createLiveRuleAction).toHaveBeenCalled();
    expect(assignmentApplyAction).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Open the Rule" })).toHaveAttribute("href", "/settings/automation/automations/rule-9");
  });

  it("asks no date for a dated target, because each person gets it from the day they match", () => {
    renderModal({ basePath: "/time-off/policies", assignableId: "pol-1", noun: "policy", temporal: true });

    expect(screen.getByLabelText("Effective from")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Everyone Who Matches" }));

    expect(screen.queryByLabelText("Effective from")).not.toBeInTheDocument();
    expect(screen.getByTestId("live-rule-note")).toHaveTextContent("from the day they start matching");
    expect(screen.getByRole("button", { name: "Review 40 people" })).toBeEnabled();
  });
});
