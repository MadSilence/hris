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
jest.mock("@/lib/errors/errorToast", () => ({ showSuccess: jest.fn(), showActionError: jest.fn() }));
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
      id: "order", position: 0, kind: "CHECKLIST", title: "Order a laptop", description: null, dueKind: "OFFSET",
      offsetDays: -7, assigneeKind: "ONBOARDING_MANAGER", assigneeUserId: null, assigneeName: null,
      assigneeProblem: null, config: {}, waitsFor: [],
    },
    {
      id: "setup", position: 1, kind: "CHECKLIST", title: "Set up the laptop", description: null, dueKind: "OFFSET",
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
    setWidth(1280);
    window.localStorage.clear();
    jest.mocked(useLifecycleTemplate).mockReturnValue(partialMock<ReturnType<typeof useLifecycleTemplate>>({
      data: template, isLoading: false, error: null,
    }));
  });

  it("opens on the canvas, and Save stays off until something changes", () => {
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    expect(screen.getByTestId("canvas-stub")).toBeInTheDocument();
    expect(screen.getByLabelText("Template Name")).toHaveValue("Engineers");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Template Name"), { target: { value: "Engineers 2027" } });
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: "Canvas" })).not.toBeInTheDocument();
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
    const card = screen.getByRole("dialog", { name: "Add Task" });
    expect(card).toHaveTextContent("Onboarding Manager · 3 days after start");
    fireEvent.change(screen.getByLabelText(/Title/, { selector: "#quick-add-title" }), { target: { value: "Welcome lunch" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

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
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(saveTemplateAction).toHaveBeenCalled());
    const body = jest.mocked(saveTemplateAction).mock.calls[0][0].body;
    expect(body.version).toBe(4);
    expect(body.items).toEqual([
      expect.objectContaining({ key: "order", waitsFor: [] }),
      expect.objectContaining({ key: "setup", offsetDays: 0, waitsFor: ["order"] }),
    ]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Save" })).toBeDisabled());
  });

  it("shows a refusal under the header and keeps the draft", async () => {
    jest.mocked(saveTemplateAction).mockResolvedValue({ status: ActionStatus.ERROR, errorMessage: "These tasks wait for each other in a circle." });
    render(<TemplateCanvasEditor type="ONBOARDING" templateId="t1" />);
    fireEvent.change(screen.getByLabelText("Template Name"), { target: { value: "Engineers 2027" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("These tasks wait for each other in a circle.")).toBeInTheDocument();
    expect(screen.getByLabelText("Template Name")).toHaveValue("Engineers 2027");
  });
});
