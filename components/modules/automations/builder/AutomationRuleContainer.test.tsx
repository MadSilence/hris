import * as React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { AutomationRuleContainer } from "./AutomationRuleContainer";
import { ActionStatus } from "@/components/models/ActionStatus";
import {
  createAutomationAction,
  enableAutomationAction,
  publishAutomationAction,
} from "@/components/modules/automations/actions/automationActions";
import { useAutomation, useAutomationPreview } from "@/components/modules/automations/hooks";
import type {
  AutomationCatalog,
  AutomationPreview,
  AutomationPreviewRequest,
  AutomationRule,
} from "@/models/automations";
import type { FilterDTO } from "@/models/user/fields";
import { partialMock } from "@/test/types";

const replace = jest.fn();
const push = jest.fn();
let search = new URLSearchParams();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  useSearchParams: () => search,
}));
jest.mock("@/components/auth/useAccess", () => ({
  ...jest.requireActual("@/components/auth/useAccess"),
  useCanAccess: () => true,
}));
jest.mock("@/components/modules/automations/actions/automationActions");
jest.mock("@/components/modules/automations/hooks", () => ({
  unwrapAction: jest.requireActual("@/components/modules/automations/hooks/useAutomationQueries").unwrapAction,
  useAutomation: jest.fn(),
  useAutomationCatalog: () => ({ data: catalog, isLoading: false, error: null }),
  useAutomationPreview: jest.fn(),
  useInvalidateAutomations: () => jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/components/modules/organization/hooks/useUserFields/useUserFields", () => ({
  useUserFields: () => ({ data: [{ id: "sys:office", key: "sys:office", label: "Office", valueSource: "offices" }], isLoading: false }),
}));
jest.mock("@/components/modules/automations/shared/useAutomationNames", () => ({
  useAutomationNames: () => ({
    targets: new Map([["berlin", "Berlin"], ["cal-de", "Germany 2026"]]),
    roles: new Map(),
  }),
  useAssignableOptions: () => ({ options: [{ id: "cal-de", label: "Germany 2026" }], isLoading: false }),
}));
jest.mock("@/components/hooks/useReferenceOptions", () => ({ useReferenceOptions: () => ({ options: [], isLoading: false }) }));
jest.mock("@/components/audience/AudienceBuilder", () => ({
  AudienceBuilder: ({ onChange }: { onChange: (filters: FilterDTO[]) => void }) => (
    <button type="button" onClick={() => onChange([{ field: "sys:office", op: "eq", value: "berlin" }])}>
      Filter on Berlin
    </button>
  ),
}));
jest.mock("@/components/ui/SearchableSelect", () => ({
  SearchableSelect: ({ options, value, onChange }: { options: { value: string; label: string }[]; value: string | null; onChange: (v: string | null) => void }) => (
    <select aria-label="Target" value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">Select</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  ),
}));
jest.mock("@/public/desact/src/components/ui/select", () => jest.requireActual("@/test/selectMock"));
// The dropdown renders its items inline, so "Add Action" and the row kebab are plain buttons here.
jest.mock("@/public/desact/src/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button type="button" role="menuitem" onClick={onClick} disabled={disabled}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

const catalog: AutomationCatalog = {
  triggers: ["PERSON_HIRED", "DATE_OFFSET", "JOINS_SEGMENT", "FIELD_CHANGED", "TERMINATION_SCHEDULED", "LAST_WORKING_DAY_ARRIVES"],
  dateFields: [{ value: "HIRE_DATE", label: "Hire Date" }, { value: "PROBATION_END", label: "Probation End" }],
  dateAttributes: [],
  changeableFields: [{ value: "manager", label: "Manager" }],
  actions: ["SEND_EMAIL", "NOTIFY", "CREATE_TASK", "ASSIGN", "UNASSIGN", "GRANT_TIME_OFF_POLICY"],
  assignableTypes: ["OFFICE", "PUBLIC_HOLIDAY_CALENDAR", "TEAM"],
  placeholders: ["firstName", "lastName", "startDate", "managerName"],
  recipientKinds: { SEND_EMAIL: ["PERSON", "MANAGER", "USER"], NOTIFY: ["PERSON", "MANAGER", "ROLE", "USER"], CREATE_TASK: ["PERSON", "MANAGER"] },
  defaultLateWindowDays: 30,
};

const previewOf = (over: Partial<AutomationPreview> = {}): AutomationPreview => ({
  matchingCount: 12,
  matching: [{ id: "p1", name: "Anna Schmidt" }, { id: "p2", name: "Bob Meyer" }],
  pastMomentCount: 3,
  backfillCandidates: [],
  upcoming: [{ date: "2026-10-20", person: { id: "p1", name: "Anna Schmidt" }, position: 0, actionType: "SEND_EMAIL", summary: "Email the person: Welcome", late: false }],
  eventDriven: false,
  samples: [],
  assignments: [],
  conflicts: [],
  inFlight: null,
  problems: [],
  ...over,
});

let nextPreview: AutomationPreview = previewOf();
const previewMutate = jest.fn();

const lastPreviewRequest = (): AutomationPreviewRequest =>
  previewMutate.mock.calls[previewMutate.mock.calls.length - 1][0];

beforeEach(() => {
  jest.clearAllMocks();
  search = new URLSearchParams();
  nextPreview = previewOf();
  // jest.config resets every mock before each test, so the implementation is set here.
  previewMutate.mockImplementation(
    (_req: AutomationPreviewRequest, opts?: { onSuccess?: (data: AutomationPreview) => void }) => opts?.onSuccess?.(nextPreview),
  );
  (useAutomationPreview as jest.Mock).mockReturnValue({ mutate: previewMutate, isPending: false });
  (useAutomation as jest.Mock).mockReturnValue({ data: undefined, error: null, isLoading: false });
  (createAutomationAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: { id: "rule-new" } });
  (enableAutomationAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: {} });
  (publishAutomationAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: {} });
});

const publishButton = () => screen.getByRole("button", { name: "Publish" });

describe("AutomationRuleContainer — composing a rule", () => {
  it("builds trigger → conditions → actions into one definition and reads it back as a sentence", async () => {
    render(<AutomationRuleContainer ruleId={null} />);

    fireEvent.change(screen.getByLabelText("Trigger"), { target: { value: "DATE_OFFSET" } });
    fireEvent.change(screen.getByLabelText("Days"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Direction"), { target: { value: "AFTER" } });
    fireEvent.click(screen.getByRole("button", { name: "Filter on Berlin" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Assign" }));
    fireEvent.change(screen.getByLabelText("What"), { target: { value: "PUBLIC_HOLIDAY_CALENDAR" } });
    fireEvent.change(screen.getByLabelText("Target"), { target: { value: "cal-de" } });

    const when = screen.getByRole("region", { name: "When" });
    expect(within(when).getByText("5 days after the hire date")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "For Whom" })).getByText(/people whose Office is Berlin/)).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Do" })).getByText("Assign holiday calendar Germany 2026")).toBeInTheDocument();

    await waitFor(() => expect(lastPreviewRequest().definition.actions).toHaveLength(1));
    const { definition } = lastPreviewRequest();
    expect(definition.trigger).toEqual(expect.objectContaining({ type: "DATE_OFFSET", field: "HIRE_DATE", direction: "AFTER", days: 5 }));
    expect(definition.conditions.filters).toEqual([{ field: "sys:office", op: "eq", value: "berlin" }]);
    expect(definition.actions[0]).toEqual(expect.objectContaining({ type: "ASSIGN", assignableType: "PUBLIC_HOLIDAY_CALENDAR", assignableId: "cal-de" }));
  });

  it("inserts a placeholder chip at the caret, not by hand", () => {
    search = new URLSearchParams("starter=welcome-email");
    render(<AutomationRuleContainer ruleId={null} />);

    // A single action opens on its own.
    const subject = screen.getByLabelText(/^Subject/) as HTMLInputElement;
    fireEvent.change(subject, { target: { value: "Hello  today" } });
    subject.setSelectionRange(6, 6);
    fireEvent.click(within(screen.getByRole("group", { name: "Insert into Subject" })).getByRole("button", { name: "First Name" }));

    expect(subject.value).toBe("Hello {firstName} today");
  });
});

describe("AutomationRuleContainer — the preview gate", () => {
  it("holds Publish until the rule has a name, and shows the preview's counts", async () => {
    search = new URLSearchParams("starter=welcome-email");
    render(<AutomationRuleContainer ruleId={null} />);

    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "" } });
    await waitFor(() => expect(screen.getByTestId("preview-matching")).toHaveTextContent("12 people"));
    expect(publishButton()).toBeDisabled();
    expect(screen.getByTestId("publish-gate")).toHaveTextContent("Give the automation a name to publish it.");

    fireEvent.change(screen.getByLabelText(/^Name/), { target: { value: "Welcome email" } });
    await waitFor(() => expect(publishButton()).toBeEnabled());
    expect(screen.getByTestId("preview-past")).toHaveTextContent("3 people are already past the moment");
    expect(screen.getByTestId("for-whom-count")).toHaveTextContent("12 people match now");
  });

  it("keeps Publish off while the preview reports a problem, in the dictionary's words", async () => {
    nextPreview = previewOf({ problems: [{ path: "actions[0].body", code: "AU00005", message: "Unknown placeholder: fristName" }] });
    search = new URLSearchParams("starter=welcome-email");
    render(<AutomationRuleContainer ruleId={null} />);

    await waitFor(() => expect(screen.getByTestId("preview-problems")).toHaveTextContent("fristName is not a placeholder this text can use"));
    expect(publishButton()).toBeDisabled();
    expect(screen.getByTestId("publish-gate")).toHaveTextContent("Fix what the preview lists to publish.");
  });
});

describe("AutomationRuleContainer — publishing", () => {
  it("creates a new rule and enables it for people who already match too, when asked", async () => {
    search = new URLSearchParams("starter=welcome-email");
    render(<AutomationRuleContainer ruleId={null} />);
    await waitFor(() => expect(publishButton()).toBeEnabled());

    fireEvent.click(publishButton());
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("checkbox", { name: "Enable It Now" })).toBeChecked();
    expect(within(dialog).getByText(/Also 3 people whose moment has already passed/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("radio", { name: "Also People Who Already Match" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Publish" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/settings/automation/automations/rule-new"));
    expect(createAutomationAction).toHaveBeenCalledWith(expect.objectContaining({ name: "Welcome email" }));
    expect(enableAutomationAction).toHaveBeenCalledWith({ id: "rule-new", body: { backfill: "ALL" } });
  });

  it("enables forward only by default", async () => {
    search = new URLSearchParams("starter=welcome-email");
    render(<AutomationRuleContainer ruleId={null} />);
    await waitFor(() => expect(publishButton()).toBeEnabled());

    fireEvent.click(publishButton());
    fireEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Publish" }));

    await waitFor(() => expect(enableAutomationAction).toHaveBeenCalledWith({ id: "rule-new", body: { backfill: "NONE" } }));
  });

  const existing = partialMock<AutomationRule>({
    id: "rule-1",
    name: "Welcome email",
    description: null,
    status: "ENABLED",
    origin: "BUILDER",
    versionNo: 4,
    pausedReason: null,
    runs: { scheduled: 23, inProgress: 2, done: 140, skipped: 0, failed: 0, cancelled: 0 },
    definition: {
      trigger: { type: "PERSON_HIRED" },
      conditions: { filters: [], excludeUserIds: [] },
      actions: [{ type: "NOTIFY", offsetDays: 0, recipients: [{ kind: "PERSON" }], text: "Welcome" }],
      latePolicy: "RUN_LATE",
      lateWindowDays: null,
    },
  });

  const editExisting = async () => {
    (useAutomation as jest.Mock).mockReturnValue({ data: existing, error: null, isLoading: false });
    nextPreview = previewOf({ inFlight: { scheduledRuns: 23, inProgressRuns: 2, completedRuns: 140, wouldCancel: 4, wouldAdd: 6 } });
    render(<AutomationRuleContainer ruleId="rule-1" />);
    // Nothing changed yet: there is nothing to publish.
    expect(publishButton()).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Trigger"), { target: { value: "TERMINATION_SCHEDULED" } });
    await waitFor(() => expect(publishButton()).toBeEnabled());
    fireEvent.click(publishButton());
    return screen.findByRole("dialog");
  };

  it("asks what happens to runs in flight, with the counts, and keeps them by default", async () => {
    const dialog = await editExisting();

    expect(within(dialog).getByText("25 runs are under way")).toBeInTheDocument();
    expect(within(dialog).getByText(/140 completed runs are unaffected/)).toBeInTheDocument();
    // An enabled rule is not asked whether to enable it.
    expect(within(dialog).queryByRole("checkbox", { name: "Enable It Now" })).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Publish" }));

    await waitFor(() => expect(publishAutomationAction).toHaveBeenCalledWith({
      id: "rule-1",
      body: expect.objectContaining({ inFlight: "KEEP", expectedVersionNo: 4 }),
    }));
    expect(enableAutomationAction).not.toHaveBeenCalled();
  });

  it("moves everyone to the new version when chosen", async () => {
    const dialog = await editExisting();

    expect(within(dialog).getByText(/4 cancelled, 6 added/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("radio", { name: "Move Everyone to the New Version" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Publish" }));

    await waitFor(() => expect(publishAutomationAction).toHaveBeenCalledWith({
      id: "rule-1",
      body: expect.objectContaining({ inFlight: "MOVE", definition: expect.objectContaining({ trigger: { type: "TERMINATION_SCHEDULED" } }) }),
    }));
  });
});
