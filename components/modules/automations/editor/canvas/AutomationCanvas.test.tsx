import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { emptyDefinition, newStep } from "@/components/modules/automations/model/tree";
import type { AutomationDefinition, StepSpec } from "@/models/automations";
import { AutomationCanvas, type AutomationCanvasProps } from "./AutomationCanvas";

jest.mock("../seams", () => ({
  useAutomationWords: () => ({
    triggerTitle: () => "Time off is requested",
    triggerSubtitle: () => "Any time off",
    stepKind: (s: StepSpec) => (s.type === "REQUEST_APPROVAL" ? "Ask for approval" : "Send an email"),
    stepTitle: (s: StepSpec) => `Title ${s.id}`,
    stepSubtitle: () => null,
  }),
}));

// React Flow reads node transforms through DOMMatrixReadOnly, which jsdom does not have.
class DOMMatrixReadOnlyMock {
  m22 = 1;
  constructor(_transform?: string) {}
}
Object.defineProperty(window, "DOMMatrixReadOnly", { writable: true, configurable: true, value: DOMMatrixReadOnlyMock });

const definition: AutomationDefinition = {
  ...emptyDefinition(),
  trigger: { type: "EVENT", event: "TIME_OFF_REQUESTED" },
  steps: [{ ...newStep("s1", "REQUEST_APPROVAL"), declined: [{ ...newStep("s2", "SEND_EMAIL"), skipped: true }] }],
};

const renderCanvas = (over: Partial<AutomationCanvasProps> = {}) => {
  const props: AutomationCanvasProps = {
    definition,
    actions: ["NOTIFY", "SEND_EMAIL"],
    readOnly: false,
    selectedStepId: null,
    triggerSelected: false,
    needs: new Map(),
    edited: new Set(),
    runStates: null,
    offerAi: false,
    insets: { left: 80, right: 0, top: 120, bottom: 76 },
    fitKey: "",
    paletteDrag: false,
    announcement: null,
    onSelectStep: jest.fn(),
    onSelectTrigger: jest.fn(),
    onDeselect: jest.fn(),
    onChooseTrigger: jest.fn(),
    onOpenAi: jest.fn(),
    onOpenAddStep: jest.fn(),
    onInsert: jest.fn(),
    onMove: jest.fn(),
    onCardCommand: jest.fn(),
    ...over,
  };
  render(
    <div style={{ width: 1200, height: 800 }}>
      <AutomationCanvas {...props} />
    </div>,
  );
  return props;
};

describe("AutomationCanvas", () => {
  it("draws the trigger, the numbered steps, the branch pills and an empty path's way in", () => {
    renderCanvas({ needs: new Map([["s1", "Choose who approves"]]) });
    // The When card's second line, its key setting (walk of 2026-11-07: the canvas never passed it).
    expect(screen.getByRole("button", { name: "When: Time off is requested" })).toHaveTextContent("Any time off");
    expect(screen.getByRole("button", { name: "Step 1: Ask for approval, Title s1" })).toHaveTextContent("Choose who approves");
    expect(screen.getByRole("button", { name: "Step 2B: Send an email, Title s2" })).toHaveTextContent("Skipped");
    expect(screen.getByTestId("empty-path")).toHaveTextContent("Add a step");
    expect(screen.getByRole("group", { name: "Zoom" })).toHaveTextContent("100%");
  });

  it("selects a card by click and by key, and moves it with Alt and an arrow", () => {
    const props = renderCanvas();
    const card = screen.getByRole("button", { name: /Step 2B/ });
    fireEvent.click(card);
    expect(props.onSelectStep).toHaveBeenCalledWith("s2");
    fireEvent.keyDown(card, { key: "ArrowUp", altKey: true });
    expect(props.onCardCommand).toHaveBeenLastCalledWith("s2", "up");
    fireEvent.keyDown(card, { key: "F10", shiftKey: true });
    expect(props.onCardCommand).toHaveBeenLastCalledWith("s2", "menu");
  });

  it("shows a run's state on the cards", () => {
    renderCanvas({ runStates: { s1: "failed", s2: "notStarted" } });
    expect(screen.getByRole("button", { name: /Step 1/ })).toHaveTextContent("Failed in this run");
    expect(screen.getByRole("button", { name: /Step 2B/ })).toHaveTextContent("Not started yet");
  });

  it("starts a new automation from the placeholder, with noddo AI under it", () => {
    const props = renderCanvas({ definition: emptyDefinition(), offerAi: true });
    fireEvent.click(screen.getByTestId("trigger-placeholder"));
    expect(props.onChooseTrigger).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Describe it to noddo AI" }));
    expect(props.onOpenAi).toHaveBeenCalled();
  });

  it("offers no way to change anything in read mode", () => {
    const props = renderCanvas({ readOnly: true });
    expect(screen.queryByTestId("empty-path")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add a step here" })).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("button", { name: /Step 2B/ }), { key: "Delete" });
    expect(props.onCardCommand).not.toHaveBeenCalled();
  });
});
