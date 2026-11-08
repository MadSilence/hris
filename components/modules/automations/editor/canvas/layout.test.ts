import type { AutomationDefinition, StepSpec } from "@/models/automations";
import { emptyDefinition, newStep } from "@/components/modules/automations/model/tree";
import { cardHeight, fitViewport, layoutTree, nearestSpot, stepNodeId, TRIGGER_NODE_ID } from "./layout";

const step = (id: string, over: Partial<StepSpec> = {}): StepSpec => ({ ...newStep(id, "NOTIFY"), ...over });
const def = (steps: StepSpec[], trigger: AutomationDefinition["trigger"] = { type: "PERSON_HIRED" }): AutomationDefinition => ({
  ...emptyDefinition(),
  trigger,
  steps,
});

// One title line: 16 + 16 + 8 + 22 + 16.
const H = 78;

describe("layoutTree", () => {
  it("puts the trigger on top and the trunk under it, one connector apart", () => {
    const layout = layoutTree(def([step("s1"), step("s2")]));
    const byId = Object.fromEntries(layout.nodes.map((n) => [n.id, n]));
    expect(byId[TRIGGER_NODE_ID]).toMatchObject({ kind: "when", x: 0, y: 0 });
    expect(byId[stepNodeId("s1")]).toMatchObject({ x: 0, y: H + 48, number: "1" });
    expect(byId[stepNodeId("s2")]).toMatchObject({ x: 0, y: 2 * (H + 48), number: "2" });
    expect(layout.edges.map((e) => [e.id, e.insert])).toEqual([
      ["trigger->step:s1", { kind: "trunkStart" }],
      ["step:s1->step:s2", { kind: "after", stepId: "s1" }],
    ]);
    // Under the last card: a step dropped there goes after it.
    expect(layout.spots.find((s) => s.key === "end:s2")).toEqual({ key: "end:s2", x: 160, y: 2 * (H + 48) + H + 24, target: { kind: "after", stepId: "s2" } });
  });

  it("stands an approval's paths side by side under it, each centred on its own column", () => {
    const approval: StepSpec = {
      ...newStep("s2", "REQUEST_APPROVAL"),
      approved: [step("s3"), step("s4")],
      declined: [step("s5")],
    };
    const layout = layoutTree(def([step("s1"), approval]));
    const byId = Object.fromEntries(layout.nodes.map((n) => [n.id, n]));

    // Two paths of one card each: 320 + 40 + 320, the trunk centred over them.
    expect(layout.bounds.width).toBe(680);
    expect(byId[stepNodeId("s1")].x).toBe(180);
    expect(byId[stepNodeId("s2")]).toMatchObject({ x: 180, y: 252, number: "2" });
    const childTop = 252 + H + 48 + 40;
    expect(byId[stepNodeId("s3")]).toMatchObject({ x: 0, y: childTop, number: "3A" });
    expect(byId[stepNodeId("s4")]).toMatchObject({ x: 0, y: childTop + H + 48, number: "4A" });
    expect(byId[stepNodeId("s5")]).toMatchObject({ x: 360, y: childTop, number: "3B" });

    const into = layout.edges.filter((e) => e.source === stepNodeId("s2"));
    expect(into.map((e) => [e.target, e.branch?.kind, e.insert])).toEqual([
      ["step:s3", "APPROVED", { kind: "branchStart", stepId: "s2", branchKey: "approved" }],
      ["step:s5", "DECLINED", { kind: "branchStart", stepId: "s2", branchKey: "declined" }],
    ]);
  });

  it("gives an empty path a card of its own to add into, and widens a path by what it holds", () => {
    const inner: StepSpec = { ...newStep("s3", "REQUEST_APPROVAL"), approved: [step("s4")], declined: [step("s5")] };
    const split: StepSpec = {
      ...newStep("s1", "SPLIT"),
      paths: [{ id: "p1", name: "Warsaw", steps: [inner] }],
      otherwise: { id: "otherwise", name: "Anyone else", steps: [] },
    };
    const layout = layoutTree(def([split]));
    const byId = Object.fromEntries(layout.nodes.map((n) => [n.id, n]));

    // Warsaw holds an approval with two paths (680 wide); Anyone else is empty (320): 680 + 40 + 320.
    expect(layout.bounds.width).toBe(1040);
    expect(byId[stepNodeId("s1")].x).toBe(1040 / 2 - 160);
    expect(byId[stepNodeId("s3")].x).toBe(340 - 160);
    expect(byId["empty:s1:otherwise"]).toMatchObject({ kind: "emptyBranch", x: 720, branch: { stepId: "s1", key: "otherwise" } });
    expect(layout.spots.find((s) => s.key === "empty:s1:otherwise")?.target).toEqual({
      kind: "branchStart",
      stepId: "s1",
      branchKey: "otherwise",
    });
    const pills = layout.edges.filter((e) => e.source === stepNodeId("s1")).map((e) => e.branch);
    expect(pills).toEqual([
      { kind: "PATH", name: "Warsaw", index: 0 },
      { kind: "OTHERWISE", name: "Anyone else", index: 1 },
    ]);
  });

  it("starts a new automation from its placeholders", () => {
    expect(layoutTree(def([], null), { offerAi: true }).nodes.map((n) => [n.kind, n.height])).toEqual([["triggerPlaceholder", 168]]);
    const picked = layoutTree(def([]));
    expect(picked.nodes.map((n) => n.kind)).toEqual(["when", "firstStepPlaceholder"]);
    expect(picked.spots).toEqual([{ key: "firstStep", x: 160, y: H + 48 + 39, target: { kind: "trunkEnd" } }]);
  });

  it("uses the heights it is given", () => {
    const layout = layoutTree(def([step("s1"), step("s2")]), { heightOf: (s) => (s.id === "s1" ? 120 : 78), whenHeight: 100 });
    expect(layout.nodes.find((n) => n.stepId === "s2")?.y).toBe(100 + 48 + 120 + 48);
  });
});

describe("cardHeight", () => {
  it("grows by a line for a subtitle and for what is under it, and caps a title at two lines", () => {
    expect(cardHeight({ title: "Tell HR" })).toBe(78);
    expect(cardHeight({ title: "Tell HR", subtitle: "Before the first day" })).toBe(98);
    expect(cardHeight({ title: "Tell HR", extraLine: true })).toBe(100);
    expect(cardHeight({ title: "x".repeat(300) })).toBe(100);
  });
});

describe("nearestSpot", () => {
  const spots = [
    { key: "a", x: 0, y: 0, target: { kind: "trunkStart" as const } },
    { key: "b", x: 0, y: 100, target: { kind: "trunkEnd" as const } },
  ];
  it("takes the closest spot within reach, and nothing out of it", () => {
    expect(nearestSpot(spots, { x: 10, y: 70 })?.key).toBe("b");
    expect(nearestSpot(spots, { x: 500, y: 500 })).toBeNull();
  });
});

describe("fitViewport", () => {
  it("fits into the area the windows leave free, never past 100 %, in steps of 5 %", () => {
    const bounds = { x: 0, y: 0, width: 680, height: 800 };
    expect(fitViewport(bounds, { width: 1400, height: 900 }, { left: 0, right: 0, top: 0, bottom: 0 }).zoom).toBe(1);
    const fitted = fitViewport(bounds, { width: 1400, height: 900 }, { left: 400, right: 360, top: 100, bottom: 80 });
    // 720 / 800 = 0.9 high, 640 / 680 = 0.94 wide: 0.9.
    expect(fitted.zoom).toBe(0.9);
    // Centred across the free width.
    expect(fitted.x).toBeCloseTo(400 + (640 - 680 * 0.9) / 2);
  });
});
