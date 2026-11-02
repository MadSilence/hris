import * as React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TemplateCanvasEditor } from "./TemplateCanvasEditor";
import type { CanvasProps } from "./TemplateCanvas";
import { ActionStatus } from "@/components/models/ActionStatus";
import { saveTemplateAction } from "@/components/modules/lifecycle/actions/lifecycleActions";
import { useLifecycleTemplate } from "@/components/modules/lifecycle/hooks";
import type { Template } from "@/models/lifecycle";
import { partialMock } from "@/test/types";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }) }));
jest.mock("@/components/auth/useAccess", () => ({
  ...jest.requireActual("@/components/auth/useAccess"),
  useCanAccess: () => true,
}));
jest.mock("@/components/modules/lifecycle/actions/lifecycleActions");
jest.mock("@/components/modules/lifecycle/hooks", () => ({
  useLifecycleTemplate: jest.fn(),
  useInvalidateLifecycle: () => jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/lib/errors/errorToast", () => ({ showSuccess: jest.fn(), showActionError: jest.fn(), showError: jest.fn() }));
jest.mock("@/components/ui/DatePicker", () => ({ DatePicker: () => null }));
jest.mock("@/public/desact/src/components/ui/select", () => jest.requireActual("@/test/selectMock"));
jest.mock("@/components/modules/settings/modules/attributes/hooks/AttributeGroup/useAttributeGroups", () => ({
  useAttributeGroups: () => ({ data: [] }),
}));
jest.mock("@/components/modules/organization/modules/profile/modules/personalDocuments/hooks/useDocumentCategories", () => ({
  useDocumentCategories: () => ({ data: [] }),
}));
jest.mock("@/components/modules/settings/shared/UserPickerField/UserPickerField", () => ({
  UserPickerField: () => <span>person picker</span>,
}));
jest.mock("@/components/ui/RowActionsMenu", () => ({
  RowActionsMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RowAction: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => <button type="button" onClick={onClick}>{children}</button>,
}));

// React Flow is exercised in its own test; here the canvas is a stand-in that hands its props out.
let canvas: CanvasProps;
jest.mock("./TemplateCanvas", () => ({
  TemplateCanvas: (props: CanvasProps) => {
    canvas = props;
    return <div data-test="canvas-stub">{props.items.map((i) => <span key={i.key}>{i.title}</span>)}</div>;
  },
}));

const template: Template = {
  id: "t1", type: "ONBOARDING", name: "Engineers", description: null, archivedAt: null, version: 4,
  items: [
    {
      id: "order", position: 0, kind: "TODO", title: "Order a laptop", description: null, dueKind: "OFFSET",
      offsetDays: -7, assigneeKind: "ONBOARDING_MANAGER", assigneeUserId: null, assigneeName: null,
      assigneeProblem: null, config: {}, waitsFor: [],
    },
    {
      id: "setup", position: 1, kind: "TODO", title: "Set up the laptop", description: null, dueKind: "OFFSET",
      offsetDays: -1, assigneeKind: "TARGET", assigneeUserId: null, assigneeName: null,
      assigneeProblem: null, config: {}, waitsFor: ["order"],
    },
  ],
};

const setWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
};

describe("TemplateCanvasEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setWidth(1280);
    window.localStorage.clear();
    jest.mocked(useLifecycleTemplate).mockReturnValue(partialMock<ReturnType<typeof useLifecycleTemplate>>({
      data: template, isLoading: false, error: null,
    }));
  });

  it("opens on the timeline with no Save button, and says how the timeline is worked", () => {
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    expect(screen.getByTestId("canvas-stub")).toBeInTheDocument();
    expect(screen.getByLabelText("Template Name")).toHaveValue("Engineers");
    expect(screen.getByRole("button", { name: "Timeline" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Lane" })).not.toBeInTheDocument();
    expect(screen.getByText(/Click a day in a person's row to add a task there/)).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("saves by itself a moment after a change, without closing what is open", async () => {
    jest.mocked(saveTemplateAction).mockResolvedValue({ status: ActionStatus.SUCCESS, data: { ...template, version: 5 } });
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    act(() => canvas.onSelectBlockAction("order"));
    fireEvent.change(screen.getByLabelText("Template Name"), { target: { value: "Engineers 2027" } });
    expect(screen.getByText("Saving…")).toBeInTheDocument();

    await waitFor(() => expect(saveTemplateAction).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(jest.mocked(saveTemplateAction).mock.calls[0][0].body.name).toBe("Engineers 2027");
    await waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
    expect(screen.getByRole("complementary", { name: "Task Details" })).toBeInTheDocument();
  });

  it("does not save a draft the server would refuse, and says nothing while it is half-typed", async () => {
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    fireEvent.change(screen.getByLabelText("Template Name"), { target: { value: "  " } });
    await new Promise((r) => setTimeout(r, 1000));
    expect(saveTemplateAction).not.toHaveBeenCalled();
    expect(screen.queryByText(/Not saved/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Give the template a name/)).not.toBeInTheDocument();
  });

  it("previews the person's own tasks", () => {
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    const preview = screen.getByTestId("template-preview");
    expect(preview).toHaveTextContent("Set up the laptop");
    // The manager's task is not the person's to see.
    expect(preview).not.toHaveTextContent("Order a laptop");
  });

  it("switches to the list and remembers the choice", () => {
    const { unmount } = render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByTestId("template-list-view")).toBeInTheDocument();
    expect(screen.queryByTestId("canvas-stub")).not.toBeInTheDocument();
    unmount();

    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    expect(screen.getByTestId("template-list-view")).toBeInTheDocument();
  });

  it("is only the list on a screen narrower than md, with no toggle", () => {
    setWidth(600);
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    expect(screen.getByTestId("template-list-view")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Timeline" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("canvas-stub")).not.toBeInTheDocument();
  });

  it("moves the selected block a day and a lane from the keyboard, and the panel follows", () => {
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    act(() => canvas.onSelectBlockAction("order"));
    expect(screen.getByRole("complementary", { name: "Task Details" })).toBeInTheDocument();
    expect(screen.getByText(/7 days before start\./)).toBeInTheDocument();

    act(() => canvas.onCommandAction({ type: "shiftDays", days: 1 }));
    expect(screen.getByText(/6 days before start\./)).toBeInTheDocument();
    expect(canvas.announcement).toBe("Order a laptop moved to 6 days before start, Onboarding Manager.");

    act(() => canvas.onCommandAction({ type: "shiftLane", lanes: -1 }));
    expect(screen.getByLabelText("Done By")).toHaveValue("TARGET");
  });

  it("asks before Delete removes a block, and takes its arrows with it", async () => {
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    act(() => canvas.onFocusBlockAction("order"));
    act(() => canvas.onCommandAction({ type: "remove" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent("Order a laptop");
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(canvas.items.map((i) => i.key)).toEqual(["setup"]));
    expect(canvas.items[0].waitsFor).toEqual([]);
  });

  it("adds a task where an empty cell was clicked", () => {
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    act(() => canvas.onCellClickAction("ONBOARDING_MANAGER", "d3", { left: 300, top: 120 }));
    const dialog = screen.getByRole("dialog", { name: "Add Task" });
    expect(dialog).toHaveTextContent("Onboarding Manager · 3 days after start");
    fireEvent.change(screen.getByLabelText(/Title/, { selector: "#add-task-title" }), { target: { value: "Welcome lunch" } });
    fireEvent.click(screen.getByRole("button", { name: "Add Task" }));

    const added = canvas.items.find((i) => i.title === "Welcome lunch");
    expect(added).toMatchObject({ dueKind: "OFFSET", offsetDays: 3, assigneeKind: "ONBOARDING_MANAGER" });
    expect(screen.getByRole("complementary", { name: "Task Details" })).toBeInTheDocument();
  });

  it("draws an arrow to make a task wait, and refuses one that would close a circle", () => {
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    act(() => canvas.onConnectAction("order", "setup"));
    expect(canvas.announcement).toMatch(/circle/);
    // On screen as well, not only to a screen reader: a refused arrow otherwise shows nothing at all.
    expect(screen.getByText(/would make the tasks wait for each other in a circle/)).toBeInTheDocument();
    expect(canvas.items.find((i) => i.key === "order")?.waitsFor).toEqual([]);

    act(() => canvas.onSelectEdgeAction("order->setup"));
    act(() => canvas.onCommandAction({ type: "remove" }));
    expect(canvas.items.find((i) => i.key === "setup")?.waitsFor).toEqual([]);
  });

  it("saves the whole template with the arrows by key and the version it was opened with", async () => {
    const saved: Template = { ...template, version: 5, items: template.items.map((i) => ({ ...i, id: `${i.id}-2`, waitsFor: i.waitsFor.map((w) => `${w}-2`) })) };
    jest.mocked(saveTemplateAction).mockResolvedValue({ status: ActionStatus.SUCCESS, data: saved });
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    act(() => canvas.onMoveAction("setup", { dueKind: "OFFSET", offsetDays: 0 }, "TARGET"));

    await waitFor(() => expect(saveTemplateAction).toHaveBeenCalled(), { timeout: 2000 });
    const body = jest.mocked(saveTemplateAction).mock.calls[0][0].body;
    expect(body.version).toBe(4);
    expect(body.items).toEqual([
      expect.objectContaining({ key: "order", waitsFor: [] }),
      expect.objectContaining({ key: "setup", offsetDays: 0, waitsFor: ["order"] }),
    ]);
    await waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
  });

  it("shows a refusal under the header and keeps the draft", async () => {
    jest.mocked(saveTemplateAction).mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "These tasks wait for each other in a circle." });
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    fireEvent.change(screen.getByLabelText("Template Name"), { target: { value: "Engineers 2027" } });
    expect(await screen.findByText("These tasks wait for each other in a circle.", {}, { timeout: 2000 })).toBeInTheDocument();
    expect(screen.getByText("Not saved")).toBeInTheDocument();
    expect(screen.getByLabelText("Template Name")).toHaveValue("Engineers 2027");
  });
});
