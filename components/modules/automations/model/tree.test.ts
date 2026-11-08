import type { AutomationDefinition, StepSpec } from "@/models/automations";
import {
  emptyDefinition,
  flatten,
  insertStep,
  moveStep,
  newStep,
  newStepId,
  numbers,
  removeStep,
  stepsAbove,
  updateStep,
} from "./tree";

const notify = (id: string): StepSpec => ({ id, type: "NOTIFY", recipients: [], text: id });

const tree = (): AutomationDefinition => ({
  ...emptyDefinition(),
  steps: [
    notify("a"),
    {
      id: "ok",
      type: "REQUEST_APPROVAL",
      approved: [notify("b"), notify("c")],
      declined: [notify("d")],
    },
  ],
});

describe("the step tree", () => {
  it("reads flat: the trunk, then each path of a branch point", () => {
    expect(flatten(tree()).map((n) => [n.step.id, n.path, n.previous])).toEqual([
      ["a", "", -1],
      ["ok", "", 0],
      ["b", "ok=approved", 1],
      ["c", "ok=approved", 2],
      ["d", "ok=declined", 1],
    ]);
  });

  it("numbers the trunk 1, 2 and each path with its letter", () => {
    expect(numbers(tree())).toEqual({ a: "1", ok: "2", b: "3A", c: "4A", d: "3B" });
  });

  it("puts a step after another on its line, and first on a path after a branch point", () => {
    const after = insertStep(tree(), notify("x"), { kind: "after", stepId: "b" });
    expect(numbers(after).x).toBe("4A");
    const afterBranch = insertStep(tree(), notify("y"), { kind: "after", stepId: "ok" });
    expect(flatten(afterBranch).find((n) => n.step.id === "y")?.path).toBe("ok=approved");
  });

  it("gives a branch point inserted mid-line the rest of the line as its first path", () => {
    const d: AutomationDefinition = { ...emptyDefinition(), steps: [notify("a"), notify("b")] };
    const split = newStep("sp", "SPLIT");
    const next = insertStep(d, split, { kind: "after", stepId: "a" });
    expect(next.steps.map((s) => s.id)).toEqual(["a", "sp"]);
    expect(next.steps[1].paths?.[0].steps.map((s) => s.id)).toEqual(["b"]);
  });

  it("removes a branch point and keeps its first path's steps", () => {
    const next = removeStep(tree(), "ok");
    expect(next.steps.map((s) => s.id)).toEqual(["a", "b", "c"]);
  });

  it("updates, moves and names steps by id", () => {
    const d = updateStep(tree(), "c", (s) => ({ ...s, text: "changed" }));
    expect(flatten(d)[3].step.text).toBe("changed");
    const moved = moveStep(d, "c", -1);
    expect(moved.steps[1].approved?.map((s) => s.id)).toEqual(["c", "b"]);
    expect(newStepId(d)).not.toMatch(/^(a|ok|b|c|d)$/);
    expect(stepsAbove(d, "c").map((s) => s.id)).toEqual(["b", "ok", "a"]);
  });
});
