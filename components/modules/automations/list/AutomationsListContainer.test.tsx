import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";

import { AutomationsListContainer } from "./AutomationsListContainer";
import { useAutomations } from "@/components/modules/automations/hooks";
import type { AutomationRuleSummary } from "@/models/automations";
import { partialMock } from "@/test/types";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/components/auth/PermissionGate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/components/modules/automations/hooks", () => ({ useAutomations: jest.fn() }));
jest.mock("@/components/modules/organization/hooks/useUserFields/useUserFields", () => ({
  useUserFields: () => ({ data: [{ id: "sys:office", key: "sys:office", label: "Office", valueSource: "offices" }] }),
}));
jest.mock("@/components/modules/automations/shared/useAutomationNames", () => ({
  useAutomationNames: () => ({ targets: new Map([["berlin", "Berlin Office"], ["cal-de", "Germany 2026"]]), roles: new Map() }),
}));

const runs = { scheduled: 1, inProgress: 0, done: 5, skipped: 2, failed: 0, cancelled: 0 };

const rule = (over: Partial<AutomationRuleSummary>): AutomationRuleSummary =>
  partialMock<AutomationRuleSummary>({
    id: "r1",
    name: "Berlin calendar",
    description: null,
    status: "ENABLED",
    origin: "ASSIGNMENT",
    triggerType: "JOINS_SEGMENT",
    versionNo: 1,
    pausedReason: null,
    runs,
    lastRunAt: "2026-10-15T09:30:00",
    definition: {
      trigger: { type: "JOINS_SEGMENT" },
      conditions: { filters: [{ field: "sys:office", op: "eq", value: "berlin" }], excludeUserIds: [] },
      actions: [{ type: "ASSIGN", offsetDays: 0, assignableType: "PUBLIC_HOLIDAY_CALENDAR", assignableId: "cal-de" }],
    },
    ...over,
  });

const withRules = (rules: AutomationRuleSummary[]) =>
  (useAutomations as jest.Mock).mockReturnValue({ data: rules, isLoading: false, error: null });

describe("AutomationsListContainer", () => {
  it("reads each rule as its sentence, with its status and how often it ran", () => {
    withRules([rule({})]);
    render(<AutomationsListContainer />);

    const row = screen.getByText("Berlin calendar").closest("tr") as HTMLElement;
    expect(within(row).getByTestId("rule-sentence")).toHaveTextContent(
      "When someone starts matching · for people whose Office is Berlin Office → Assign holiday calendar Germany 2026",
    );
    expect(within(row).getByText("Enabled")).toBeInTheDocument();
    expect(within(row).getByText("8")).toBeInTheDocument();

    fireEvent.click(row);
    expect(push).toHaveBeenCalledWith("/settings/automation/automations/r1");
  });

  it("offers the archived view only when something is archived, and switches to it", () => {
    withRules([rule({}), rule({ id: "r2", name: "Old welcome", status: "ARCHIVED" })]);
    render(<AutomationsListContainer />);

    expect(screen.queryByText("Old welcome")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Archived (1)" }));
    expect(screen.getByText("Old welcome")).toBeInTheDocument();
    expect(screen.queryByText("Berlin calendar")).not.toBeInTheDocument();
  });

  it("does not render the archived toggle when nothing is archived", () => {
    withRules([rule({})]);
    render(<AutomationsListContainer />);

    expect(screen.queryByRole("button", { name: /Archived/ })).not.toBeInTheDocument();
  });

  it("searches the sentence as well as the name", () => {
    withRules([rule({}), rule({ id: "r2", name: "Welcome", definition: { trigger: { type: "PERSON_HIRED" }, conditions: { filters: [], excludeUserIds: [] }, actions: [] } })]);
    render(<AutomationsListContainer />);

    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "germany" } });
    expect(screen.getByText("Berlin calendar")).toBeInTheDocument();
    expect(screen.queryByText("Welcome")).not.toBeInTheDocument();
  });

  it("invites the first rule with ready-made starting points", () => {
    withRules([]);
    render(<AutomationsListContainer />);

    expect(screen.getByText("Automate the first rule")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Welcome Email Before the First Day/ }));
    expect(push).toHaveBeenCalledWith("/settings/automation/automations/new?starter=welcome-email");
  });

  it("says when the list could not be read, rather than that it is empty", () => {
    (useAutomations as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, error: new Error("Server down") });
    render(<AutomationsListContainer />);

    expect(screen.queryByText("Automate the first rule")).not.toBeInTheDocument();
    expect(screen.getByText("Server down")).toBeInTheDocument();
  });
});
