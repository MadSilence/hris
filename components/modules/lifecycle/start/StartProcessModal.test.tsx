import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { StartProcessModal } from "./StartProcessModal";
import { ActionStatus } from "@/components/models/ActionStatus";
import { previewStartAction, startProcessAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useLifecycleTemplates } from "@/components/modules/lifecycle/hooks";
import type { StartPreview } from "@/models/lifecycle";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/components/modules/lifecycle/actions/lifecycleActions");
jest.mock("@/components/modules/lifecycle/hooks", () => ({
  useLifecycleTemplates: jest.fn(),
  useInvalidateLifecycle: () => jest.fn(),
}));
jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => ({
  UserPickerField: ({ onChange }: { onChange: (u: { id: string; firstName: string }) => void }) => (
    <button type="button" onClick={() => onChange({ id: "u-new", firstName: "Grace" })}>Pick Person</button>
  ),
}));
jest.mock("@/public/desact/src/components/ui/select", () => ({
  Select: ({ onValueChange, children }: { onValueChange: (v: string) => void; children: React.ReactNode }) => (
    <div>
      <button type="button" onClick={() => onValueChange("t1")}>Choose Template</button>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const preview: StartPreview = {
  type: "PREBOARDING",
  target: { id: "p1", name: "Alan Turing" },
  templateId: "t1",
  templateName: "Standard",
  anchorDate: "2026-10-14",
  hireDateRequired: false,
  emailRequired: false,
  manager: { id: "m1", name: "Ada Lovelace" },
  managerProblem: null,
  tasks: [
    {
      templateItemId: "i1", position: 0, kind: "CHECKLIST", title: "Say hello", description: null,
      dueKind: "OFFSET", offsetDays: -7, dueDate: "2026-10-07", assigneeKind: "TARGET",
      assigneeUserId: "p1", assigneeName: "Alan Turing", assigneeProblem: null, config: {},
    },
    {
      templateItemId: "i2", position: 1, kind: "CHECKLIST", title: "Welcome call", description: null,
      dueKind: "OFFSET", offsetDays: 1, dueDate: "2026-10-15", assigneeKind: "SPECIFIC_USER",
      assigneeUserId: "gone", assigneeName: "Old Colleague", assigneeProblem: "LEFT", config: {},
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  (useLifecycleTemplates as jest.Mock).mockReturnValue({
    data: [{ id: "t1", type: "PREBOARDING", name: "Standard", description: null, taskCount: 2, archivedAt: null, updatedAt: "", hasProblems: true }],
  });
  (previewStartAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: preview });
  (startProcessAction as jest.Mock).mockResolvedValue({ status: ActionStatus.SUCCESS, data: { id: "proc1" } });
});

const openReview = async () => {
  render(
    <StartProcessModal open type="PREBOARDING" userId="p1" fullName="Alan Turing"
      lineManager={{ id: "m1", name: "Ada Lovelace" }} onCloseAction={jest.fn()} />,
  );
  fireEvent.click(screen.getByText("Choose Template"));
  fireEvent.click(screen.getByRole("button", { name: "Review Tasks" }));
  await screen.findByDisplayValue("Welcome call");
};

describe("StartProcessModal", () => {
  it("flags a task named for somebody who left and will not start until it is resolved", async () => {
    await openReview();

    expect(screen.getByText(/Old Colleague: Has left the company/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeDisabled();
  });

  it("starts with the correction made in the summary", async () => {
    await openReview();

    fireEvent.click(screen.getAllByText("Pick Person").at(-1)!);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    await waitFor(() => expect(startProcessAction).toHaveBeenCalled());
    const body = (startProcessAction as jest.Mock).mock.calls[0][0].body;
    expect(body.items).toEqual([
      expect.objectContaining({ templateItemId: "i2", removed: false, assigneeKind: "SPECIFIC_USER", assigneeUserId: "u-new" }),
    ]);
    await waitFor(() => expect(push).toHaveBeenCalledWith("/processes/proc1"));
  });

  it("can remove the task instead", async () => {
    await openReview();

    fireEvent.click(screen.getAllByRole("button", { name: "Remove Task" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    await waitFor(() => expect(startProcessAction).toHaveBeenCalled());
    const body = (startProcessAction as jest.Mock).mock.calls[0][0].body;
    expect(body.items).toEqual([expect.objectContaining({ templateItemId: "i2", removed: true })]);
  });
});
