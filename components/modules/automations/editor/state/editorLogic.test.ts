import type { AutomationCheck, AutomationDefinition, AutomationRun, StepSpec } from "@/models/automations";
import { emptyDefinition, newStep } from "@/components/modules/automations/model/tree";
import { partialMock } from "@/test/types";
import {
  cardKeyCommand,
  editedStepIds,
  headerButtons,
  messagesNow,
  needsKey,
  needsVolumeTick,
  firingOverVolume,
  nextProblem,
  problemsByStep,
  runCardStates,
  turnOnNext,
} from "./editorLogic";

const def = (steps: StepSpec[]): AutomationDefinition => ({ ...emptyDefinition(), trigger: { type: "PERSON_HIRED" }, steps });
const check = (over: Partial<AutomationCheck>): AutomationCheck => ({
  matchingCount: 48,
  matching: [],
  places: [],
  waitingCases: 0,
  messagesPerFiring: 1,
  volumeThreshold: 200,
  audiences: [],
  runsGoing: 0,
  examples: [],
  problems: [],
  ...over,
});

describe("headerButtons", () => {
  const as = (status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED", readMode = false, over: { canManage?: boolean; system?: boolean } = {}) =>
    headerButtons({ status, readMode, canManage: over.canManage ?? true, system: over.system ?? false });

  it("gives each status its own buttons after Test run", () => {
    expect(as("DRAFT")).toEqual(["testRun", "saveDraft", "turnOn"]);
    expect(as("ACTIVE")).toEqual(["testRun", "turnOff", "saveChanges"]);
    expect(as("PAUSED")).toEqual(["testRun", "turnOn", "saveChanges"]);
  });

  it("shows Edit alone in read mode, and nothing on an archived, a system or a viewer's automation", () => {
    expect(as("ACTIVE", true)).toEqual(["testRun", "edit"]);
    expect(as("PAUSED", true)).toEqual(["testRun", "edit"]);
    expect(as("ARCHIVED", true)).toEqual([]);
    expect(as("ACTIVE", true, { system: true })).toEqual([]);
    expect(as("ACTIVE", true, { canManage: false })).toEqual([]);
  });
});

describe("turning on", () => {
  it("stops on missing details, and otherwise asks — with the waiting cases when there are any", () => {
    const problem = { stepId: "s1", field: "subject", code: "REQUIRED", message: "" };
    expect(turnOnNext(check({ problems: [problem] }))).toEqual({ kind: "problems", problems: [problem] });
    expect(turnOnNext(check({}))).toEqual({ kind: "confirm", waiting: false });
    expect(turnOnNext(check({ waitingCases: 6 }))).toEqual({ kind: "confirm", waiting: true });
  });

  it("asks for the tick only when taking the waiting cases in sends more than the threshold", () => {
    const busy = check({ waitingCases: 6, messagesPerFiring: 40 });
    expect(messagesNow(busy, "ALL")).toBe(240);
    expect(messagesNow(busy, "NONE")).toBe(0);
    expect(needsVolumeTick(busy, "ALL")).toBe(true);
    expect(needsVolumeTick(busy, "NONE")).toBe(false);
    expect(needsVolumeTick(check({ waitingCases: 6, messagesPerFiring: 2 }), "ALL")).toBe(false);
  });

  it("asks for the tick when one firing alone is over the threshold — a schedule to everybody (walk of 2026-11-07)", () => {
    const schedule = check({ waitingCases: 0, messagesPerFiring: 255 });
    expect(needsVolumeTick(schedule, "NONE")).toBe(true);
    expect(firingOverVolume(schedule)).toBe(true);
    expect(firingOverVolume(check({ messagesPerFiring: 20 }))).toBe(false);
  });
});

describe("editedStepIds", () => {
  it("marks a changed or a new step, and not a branch point whose paths alone changed", () => {
    const approval: StepSpec = { ...newStep("s2", "REQUEST_APPROVAL"), approved: [newStep("s3", "NOTIFY")] };
    const saved = def([newStep("s1", "NOTIFY"), approval]);
    const current = def([
      { ...newStep("s1", "NOTIFY"), text: "Hello" },
      { ...approval, approved: [{ ...newStep("s3", "NOTIFY"), text: "Changed" }, newStep("s4", "SEND_EMAIL")] },
    ]);
    expect([...editedStepIds(saved, current)].sort()).toEqual(["s1", "s3", "s4"]);
  });
});

describe("missing details", () => {
  const approval = newStep("s1", "REQUEST_APPROVAL");
  const email = newStep("s2", "SEND_EMAIL");

  it("words each problem by its field, an approval's assignee as who approves", () => {
    expect(needsKey({ stepId: "s1", field: "assignee", code: "", message: "" }, approval)).toBe("approver");
    expect(needsKey({ stepId: "s2", field: "subject", code: "", message: "" }, email)).toBe("subject");
    expect(needsKey({ stepId: null, field: "trigger", code: "", message: "" }, null)).toBe("trigger");
    expect(needsKey({ stepId: "s2", field: "unheardOf", code: "", message: "" }, email)).toBe("other");
  });

  it("orders them as the cards are drawn, and Show next walks them round", () => {
    const d = def([approval, email]);
    const problems = [
      { stepId: "s2", field: "subject", code: "", message: "" },
      { stepId: "s1", field: "assignee", code: "", message: "" },
    ];
    const order = [...problemsByStep(d, problems).keys()];
    expect(order).toEqual(["s1", "s2"]);
    expect(nextProblem(order, undefined)).toBe("s1");
    expect(nextProblem(order, "s1")).toBe("s2");
    expect(nextProblem(order, "s2")).toBe("s1");
  });
});

describe("runCardStates", () => {
  it("draws what the run reached, and the steps ahead as not started", () => {
    const d = def([newStep("s1", "NOTIFY"), newStep("s2", "CREATE_TASK"), newStep("s3", "SEND_EMAIL")]);
    const run = partialMock<AutomationRun>({
      steps: [
        partialMock({ stepId: "s1", status: "DONE" }),
        partialMock({ stepId: "s2", status: "FAILED" }),
      ],
    });
    expect(runCardStates(run, d)).toEqual({ s1: "done", s2: "failed", s3: "notStarted" });
    expect(runCardStates(null, d)).toBeNull();
  });
});

describe("cardKeyCommand", () => {
  const key = (k: string, mods: Partial<Record<"altKey" | "shiftKey" | "metaKey" | "ctrlKey", boolean>> = {}) =>
    cardKeyCommand({ key: k, altKey: false, shiftKey: false, metaKey: false, ctrlKey: false, ...mods });

  it("reaches every move of the canvas from the keyboard", () => {
    expect(key("Enter")).toBe("open");
    expect(key("ArrowUp", { altKey: true })).toBe("up");
    expect(key("ArrowDown", { altKey: true })).toBe("down");
    expect(key("F10", { shiftKey: true })).toBe("menu");
    expect(key("ContextMenu")).toBe("menu");
    expect(key("Delete")).toBe("remove");
    expect(key("Escape")).toBe("deselect");
    expect(key("ArrowUp")).toBeNull();
    expect(key("a", { ctrlKey: true })).toBeNull();
  });
});
