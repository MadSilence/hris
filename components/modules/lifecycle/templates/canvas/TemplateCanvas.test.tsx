import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { TemplateCanvas, type CanvasProps } from "./TemplateCanvas";
import { deriveLanes, type DraftItem } from "./draft";
import { buildAxis, layoutTemplate } from "./timeAxis";
import { translatorFor } from "@/test/nextIntl";
import type { LifecycleT } from "@/components/modules/lifecycle/i18n";

// The English catalogue, through the real ICU formatter.
const t = translatorFor("lifecycle") as unknown as LifecycleT;

// React Flow measures with ResizeObserver (jest.setup) and reads node transforms through DOMMatrixReadOnly,
// which jsdom has neither of.
class DOMMatrixReadOnlyMock {
  m22 = 1;
  constructor(_transform?: string) {}
}
Object.defineProperty(window, "DOMMatrixReadOnly", { writable: true, configurable: true, value: DOMMatrixReadOnlyMock });

const item = (key: string, title: string, over: Partial<DraftItem> = {}): DraftItem => ({
  key,
  kind: "TODO",
  title,
  description: "",
  dueKind: "OFFSET",
  offsetDays: 0,
  assigneeKind: "TARGET",
  assigneeUserId: null,
  assigneeName: null,
  assigneeProblem: null,
  attributeIds: [],
  categoryId: null,
  materials: [],
  questions: [],
  waitsFor: [],
  ...over,
});

const render_ = (over: Partial<CanvasProps> = {}) => {
  const items = [
    item("order", "Order a laptop", { offsetDays: -7, assigneeKind: "ONBOARDING_MANAGER" }),
    item("setup", "Set up the laptop", { offsetDays: -1, waitsFor: ["order"] }),
  ];
  const props: CanvasProps = {
    items,
    layout: layoutTemplate(items, deriveLanes(items, t), buildAxis(items, t)),
    readOnly: false,
    selectedKey: null,
    selectedEdgeId: null,
    onSelectBlockAction: jest.fn(),
    onFocusBlockAction: jest.fn(),
    onSelectEdgeAction: jest.fn(),
    onMoveAction: jest.fn(),
    onConnectAction: jest.fn(),
    onCellClickAction: jest.fn(),
    onAddInLaneAction: jest.fn(),
    onCommandAction: jest.fn(),
    announcement: null,
    ...over,
  };
  render(<div style={{ width: 1200, height: 600 }}><TemplateCanvas {...props} /></div>);
  return props;
};

describe("TemplateCanvas", () => {
  it("draws the tasks as blocks, the lanes down the side and the days across", () => {
    render_();
    expect(screen.getAllByTestId("task-block")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Order a laptop, 7 days before start, Onboarding manager/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Set up the laptop, 1 day before start, The new person, waits for 1 task/ })).toBeInTheDocument();
    expect(screen.getByText("The new person")).toBeInTheDocument();
    // No zoom buttons on the canvas (owner, 2026-11-02): it opens on the first week; pinch, Ctrl/Cmd + scroll
    // and Alt/Option + 1 zoom.
    expect(screen.queryByRole("group", { name: "Zoom" })).not.toBeInTheDocument();
  });

  it("selects a block reached by Tab, and turns arrow keys on it into a day or a lane", () => {
    const props = render_({ selectedKey: "order" });
    const block = screen.getByRole("button", { name: /Order a laptop/ });
    fireEvent.focus(block);
    expect(props.onFocusBlockAction).toHaveBeenCalledWith("order");
    fireEvent.keyDown(block, { key: "ArrowRight" });
    expect(props.onCommandAction).toHaveBeenLastCalledWith({ type: "shiftDays", days: 1 });
    fireEvent.keyDown(block, { key: "ArrowDown" });
    expect(props.onCommandAction).toHaveBeenLastCalledWith({ type: "shiftLane", lanes: 1 });
    fireEvent.keyDown(block, { key: "Delete" });
    expect(props.onCommandAction).toHaveBeenLastCalledWith({ type: "remove" });
  });

  it("adds from a lane's own button — the keyboard's way to a cell", () => {
    const props = render_();
    fireEvent.click(screen.getByRole("button", { name: "Add task for Onboarding manager" }));
    expect(props.onAddInLaneAction).toHaveBeenCalledWith("ONBOARDING_MANAGER", expect.objectContaining({ left: expect.any(Number) }));
  });

  it("offers an empty cell to click, and nothing to edit when read-only", () => {
    const props = render_();
    fireEvent.click(screen.getByTestId("cell-ONBOARDING_MANAGER-d3"));
    expect(props.onCellClickAction).toHaveBeenCalledWith("ONBOARDING_MANAGER", "d3", expect.any(Object));
  });

  it("is read-only for an archived template", () => {
    render_({ readOnly: true });
    expect(screen.queryByTestId("cell-TARGET-d0")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Add task for/ })).not.toBeInTheDocument();
  });
});
