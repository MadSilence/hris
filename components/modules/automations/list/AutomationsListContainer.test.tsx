import * as React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { AutomationSummary } from "@/models/automations";
import { ActionStatus } from "@/components/models/ActionStatus";
import * as actions from "@/components/modules/automations/actions/automationActions";
import { showError, showSuccess } from "@/lib/errors/errorToast";
import { showUndoToast } from "@/lib/feedback/undoToast";
import { AutomationsListContainer } from "./AutomationsListContainer";
import { summary } from "./testSummary";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: jest.fn() }) }));

jest.mock("@/components/modules/automations/actions/automationActions", () => ({
  duplicateAutomationAction: jest.fn(),
  archiveAutomationAction: jest.fn(),
  unarchiveAutomationAction: jest.fn(),
  deleteAutomationAction: jest.fn(),
  turnOffAutomationAction: jest.fn(),
  turnOnAutomationAction: jest.fn(),
  changeAutomationOwnerAction: jest.fn(),
  takeOverAutomationAction: jest.fn(),
}));

type Envelope = { status: string; data?: unknown; errorMessage?: string };
let list: AutomationSummary[] = [];
let archivedCount = 0;
let listState: { isLoading: boolean; error: Error | null } = { isLoading: false, error: null };

jest.mock("@/components/modules/automations/hooks", () => ({
  useAutomations: () => ({ data: list, ...listState, refetch: jest.fn() }),
  useArchivedAutomationsCount: () => ({ data: archivedCount }),
  useAutomationMutation: <TInput,>(action: (input: TInput) => Promise<Envelope>) => {
    const run = async (input: TInput) => {
      const result = await action(input);
      if (result.status !== "SUCCESS") throw new Error(result.errorMessage);
      return result.data;
    };
    return {
      isPending: false,
      mutateAsync: run,
      mutate: (input: TInput, callbacks?: { onSuccess?: (data: unknown) => void; onError?: (error: unknown) => void }) =>
        run(input).then(
          (data) => callbacks?.onSuccess?.(data),
          (error) => callbacks?.onError?.(error),
        ),
    };
  },
}));

jest.mock("./seams", () => ({
  useAutomationWords: () => ({ triggerLine: () => "7 days before start date", stepTitle: () => "Email the new teammate" }),
}));

jest.mock("./dialogs/useOwnerCandidates", () => ({
  useOwnerCandidates: () => ({
    isLoading: false,
    data: [
      { id: "u1", name: "Ulia Tykoon", avatarUrl: null, detail: "HR Admin" },
      { id: "u2", name: "Jonas Petrauskas", avatarUrl: null, detail: "HR Partner · Vilnius" },
    ],
  }),
}));

jest.mock("@/lib/errors/errorToast", () => ({ showSuccess: jest.fn(), showError: jest.fn() }));
jest.mock("@/lib/feedback/undoToast", () => ({ showUndoToast: jest.fn() }));

// The menus render inline: what matters is which items a card offers and what they do.
jest.mock("@/components/desact/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div role="menu">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button type="button" role="menuitem" onClick={onClick}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

const ok = (data: unknown = null): Envelope => ({ status: ActionStatus.SUCCESS, data });
const mocked = <T extends (...args: never[]) => unknown>(fn: T) => fn as unknown as jest.Mock;

const cardOf = (name: string) => screen.getByRole("link", { name }).closest("article") as HTMLElement;
const menuOf = (name: string) =>
  within(cardOf(name))
    .queryAllByRole("menuitem")
    .map((item) => item.textContent);

const renderList = (canManage = true) => {
  const onOpenNew = jest.fn();
  render(<AutomationsListContainer canManage={canManage} onOpenNew={onOpenNew} />);
  return { onOpenNew };
};

beforeEach(() => {
  push.mockReset();
  archivedCount = 0;
  listState = { isLoading: false, error: null };
  list = [
    summary({ id: "a1", name: "New hire: first week", status: "ACTIVE", runs: 312, lastRun: { runId: null, at: "2026-03-01", failed: false } }),
    summary({
      id: "a2",
      name: "Probation review reminder",
      status: "PAUSED",
      owner: { id: "u9", name: "Marta Nowak" },
      pause: { reason: "OWNER_LEFT", by: null, at: null, detail: null, stepId: null },
      waiting: 3,
    }),
    summary({ id: "a3", name: "Sick day notice", status: "DRAFT", updatedAt: null }),
    summary({ id: "a4", name: "Equipment return", status: "ACTIVE", runs: 27, lastRun: { runId: "r9", at: "2026-11-04", failed: true } }),
    summary({
      id: "a5",
      name: "Expiring vacation days",
      status: "PAUSED",
      pause: { reason: "TARGET_GONE", by: null, at: null, detail: null, stepId: "s4" },
    }),
  ];
});

describe("the cards", () => {
  it("show each status with its words and menu", () => {
    renderList();

    expect(within(cardOf("New hire: first week")).getByText("Active")).toBeInTheDocument();
    expect(within(cardOf("New hire: first week")).getByText(/^Last run .+ · 312 runs$/)).toBeInTheDocument();
    expect(menuOf("New hire: first week")).toEqual(["Edit", "Duplicate", "Turn off", "Run history", "Change owner", "Archive"]);

    const paused = cardOf("Probation review reminder");
    expect(within(paused).getByText("Paused")).toBeInTheDocument();
    expect(within(paused).getByText("Marta Nowak left the company, so it can't run.")).toBeInTheDocument();
    expect(menuOf("Probation review reminder")).toContain("Turn on");

    expect(within(cardOf("Sick day notice")).getByText("Draft")).toBeInTheDocument();
    expect(within(cardOf("Sick day notice")).getByText("Not turned on yet")).toBeInTheDocument();
    expect(menuOf("Sick day notice")).toEqual(["Edit", "Duplicate", "Change owner", "Delete"]);

    expect(within(cardOf("Equipment return")).getByText(/^Last run failed on/)).toBeInTheDocument();
  });

  it("route the pause buttons, See why and the menu to where they act", () => {
    renderList();

    fireEvent.click(within(cardOf("Expiring vacation days")).getByRole("button", { name: "Fix the step" }));
    expect(push).toHaveBeenLastCalledWith("/automations/a5?step=s4");

    fireEvent.click(within(cardOf("Equipment return")).getByRole("button", { name: "See why" }));
    expect(push).toHaveBeenLastCalledWith("/automations?tab=activity&automation=a4&chip=FAILED&run=r9");

    fireEvent.click(within(cardOf("Probation review reminder")).getByRole("menuitem", { name: "Turn on" }));
    expect(push).toHaveBeenLastCalledWith("/automations/a2?turnOn=1");

    fireEvent.click(within(cardOf("New hire: first week")).getByRole("menuitem", { name: "Run history" }));
    expect(push).toHaveBeenLastCalledWith("/automations?tab=activity&automation=a1");
  });

  it("offer a viewer no menu and no buttons (E6)", () => {
    renderList(false);

    screen.getAllByTestId("automation-card").forEach((card) => expect(within(card).queryAllByRole("menuitem")).toHaveLength(0));
    expect(screen.queryByRole("button", { name: "Make me the owner" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "See why" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New hire: first week" })).toHaveAttribute("href", "/automations/a1");
  });
});

describe("the filters", () => {
  it("narrow by status chip and by search, and clear back", () => {
    renderList();

    fireEvent.click(screen.getByRole("button", { name: "Drafts" }));
    expect(screen.getAllByTestId("automation-card")).toHaveLength(1);

    fireEvent.change(screen.getByRole("textbox", { name: "Search" }), { target: { value: "laptop" } });
    expect(screen.getByText("No automations match these filters")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getAllByTestId("automation-card")).toHaveLength(5);
  });

  it("filter by what starts it", () => {
    list = [
      summary({ id: "x", name: "Welcome", trigger: { type: "PERSON_HIRED" } }),
      summary({ id: "y", name: "Leave heads-up", trigger: { type: "EVENT", event: "TIME_OFF_REQUESTED" } }),
    ];
    renderList();

    fireEvent.click(screen.getByRole("menuitem", { name: "Time off is requested" }));

    expect(screen.getAllByTestId("automation-card")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Leave heads-up" })).toBeInTheDocument();
  });
});

describe("the states", () => {
  it("E2: nothing yet — the AI field and the two ways, no toolbar", () => {
    list = [];
    const { onOpenNew } = renderList();

    expect(screen.getByText("No automations yet")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Search" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pick a template" }));
    expect(onOpenNew).toHaveBeenCalledWith(true);

    fireEvent.change(screen.getByLabelText("Describe what should happen"), { target: { value: "Remind managers" } });
    fireEvent.click(screen.getByRole("button", { name: "Draft with AI" }));
    expect(push).toHaveBeenLastCalledWith("/automations/new?ai=Remind%20managers");
  });

  it("E7: an error, with a way to try again", () => {
    listState = { isLoading: false, error: new Error("boom") };
    renderList();

    expect(screen.getByText("We couldn't load automations")).toBeInTheDocument();
    expect(screen.getByText("Your automations keep running.")).toBeInTheDocument();
  });
});

describe("the dialogs", () => {
  it("Duplicate confirms, then says so", async () => {
    mocked(actions.duplicateAutomationAction).mockResolvedValue(ok(summary({ id: "copy" })));
    renderList();

    fireEvent.click(within(cardOf("New hire: first week")).getByRole("menuitem", { name: "Duplicate" }));
    expect(screen.getByText("Duplicate New hire: first week?")).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Duplicate" })));

    expect(actions.duplicateAutomationAction).toHaveBeenCalledWith("a1");
    expect(showSuccess).toHaveBeenCalledWith("Automation duplicated");
  });

  it("Archive (H3) counts what waits, archives, and Undo unarchives", async () => {
    mocked(actions.archiveAutomationAction).mockResolvedValue(ok());
    mocked(actions.unarchiveAutomationAction).mockResolvedValue(ok());
    list[0] = summary({ ...list[0], waiting: 3 });
    renderList();

    fireEvent.click(within(cardOf("New hire: first week")).getByRole("menuitem", { name: "Archive" }));
    expect(screen.getByText(/3 requests waiting on a manager stay as they are/)).toBeInTheDocument();
    const confirm = screen.getByRole("button", { name: "Archive" });
    expect(confirm.className).toContain("bg-tertiary");
    await act(async () => fireEvent.click(confirm));

    expect(actions.archiveAutomationAction).toHaveBeenCalledWith("a1");
    const toast = mocked(showUndoToast).mock.calls[0][0] as { message: string; onUndo: () => Promise<unknown> };
    expect(toast.message).toBe("Automation archived");
    await act(async () => {
      await toast.onUndo();
    });
    expect(actions.unarchiveAutomationAction).toHaveBeenCalledWith("a1");
  });

  it("Archive keeps the dialog open with the refusal when it fails", async () => {
    mocked(actions.archiveAutomationAction).mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "Something went wrong. Try again." });
    renderList();

    fireEvent.click(within(cardOf("New hire: first week")).getByRole("menuitem", { name: "Archive" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Archive" })));

    expect(screen.getByRole("alert")).toHaveTextContent(/./);
    expect(screen.getByText("Archive New hire: first week?")).toBeInTheDocument();
  });

  it("Delete (H5) deletes a draft", async () => {
    mocked(actions.deleteAutomationAction).mockResolvedValue(ok());
    renderList();

    fireEvent.click(within(cardOf("Sick day notice")).getByRole("menuitem", { name: "Delete" }));
    expect(screen.getByText("It was never turned on, so nothing ran. You can't undo this.")).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Delete automation" })));

    expect(actions.deleteAutomationAction).toHaveBeenCalledWith("a3");
    expect(showSuccess).toHaveBeenCalledWith("Automation deleted");
  });

  it("Turn off fires at once, and Undo turns it on for new cases only", async () => {
    mocked(actions.turnOffAutomationAction).mockResolvedValue(ok());
    mocked(actions.turnOnAutomationAction).mockResolvedValue(ok());
    renderList();

    await act(async () => fireEvent.click(within(cardOf("New hire: first week")).getByRole("menuitem", { name: "Turn off" })));

    expect(actions.turnOffAutomationAction).toHaveBeenCalledWith("a1");
    const toast = mocked(showUndoToast).mock.calls[0][0] as { message: string; onUndo: () => Promise<unknown> };
    expect(toast.message).toBe("Automation turned off");
    await act(async () => {
      await toast.onUndo();
    });
    expect(actions.turnOnAutomationAction).toHaveBeenCalledWith({ id: "a1", request: { backfill: "NONE", confirmVolume: true } });
  });

  it("Turn off's refusal goes to the card", async () => {
    mocked(actions.turnOffAutomationAction).mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "No." });
    renderList();

    await act(async () => fireEvent.click(within(cardOf("New hire: first week")).getByRole("menuitem", { name: "Turn off" })));

    expect(showError).toHaveBeenCalled();
    expect(showUndoToast).not.toHaveBeenCalled();
  });

  it("Make me the owner (H6) names who left and can turn it on now", async () => {
    mocked(actions.takeOverAutomationAction).mockResolvedValue(ok());
    renderList();

    fireEvent.click(within(cardOf("Probation review reminder")).getByRole("button", { name: "Make me the owner" }));
    expect(screen.getByText("Marta Nowak, its owner, has left the company, so it needs a new owner.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox"));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Make me the owner" })));

    expect(actions.takeOverAutomationAction).toHaveBeenCalledWith({ id: "a2", turnOnNow: true });
    expect(showSuccess).toHaveBeenCalledWith("You're the owner now");
  });

  it("Change owner (O1 → O2) stays off until someone is picked", async () => {
    mocked(actions.changeAutomationOwnerAction).mockResolvedValue(ok());
    renderList();

    fireEvent.click(within(cardOf("New hire: first week")).getByRole("menuitem", { name: "Change owner" }));
    expect(screen.getByText("Who should own New hire: first week?")).toBeInTheDocument();
    const confirm = screen.getByRole("button", { name: "Change owner" });
    expect(confirm).toBeDisabled();

    fireEvent.focus(screen.getByRole("combobox"));
    // The owner now is not offered again.
    expect(screen.queryByRole("option", { name: /Ulia Tykoon/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Jonas Petrauskas/ }));
    expect(screen.getByText("Runs already going finish as they are. New runs come from Jonas.")).toBeInTheDocument();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Change owner" })));
    expect(actions.changeAutomationOwnerAction).toHaveBeenCalledWith({ id: "a1", userId: "u2" });
    expect(showSuccess).toHaveBeenCalledWith("Jonas Petrauskas owns it now");
  });
});
