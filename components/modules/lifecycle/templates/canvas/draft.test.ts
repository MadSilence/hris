import {
  addWait,
  dayLabel,
  deriveLanes,
  draftFromTemplate,
  draftProblems,
  draftToWrite,
  phaseOf,
  removeItem,
  sameDraft,
  wouldCreateCycle,
  type DraftItem,
} from "./draft";
import type { Template } from "@/models/lifecycle";

const item = (key: string, over: Partial<DraftItem> = {}): DraftItem => ({
  key,
  kind: "CHECKLIST",
  title: key.toUpperCase(),
  description: "",
  dueKind: "OFFSET",
  offsetDays: 0,
  assigneeKind: "TARGET",
  assigneeUserId: null,
  assigneeName: null,
  assigneeProblem: null,
  attributeIds: [],
  categoryId: null,
  waitsFor: [],
  ...over,
});

describe("waiting for another task", () => {
  const items = [item("a"), item("b", { waitsFor: ["a"] }), item("c", { waitsFor: ["b"] })];

  it("refuses an arrow that would close a circle, directly or through other tasks", () => {
    expect(wouldCreateCycle(items, "a", "a")).toBe(true);
    expect(wouldCreateCycle(items, "a", "b")).toBe(true);
    expect(wouldCreateCycle(items, "a", "c")).toBe(true);
    expect(wouldCreateCycle(items, "c", "a")).toBe(false);

    const refused = addWait(items, "a", "c");
    expect(refused.refused).toBe(true);
    expect(refused.items).toBe(items);
  });

  it("adds an allowed arrow once", () => {
    const once = addWait(items, "c", "a");
    expect(once.refused).toBe(false);
    expect(once.items.find((i) => i.key === "c")?.waitsFor).toEqual(["b", "a"]);
    expect(addWait(once.items, "c", "a").items.find((i) => i.key === "c")?.waitsFor).toEqual(["b", "a"]);
  });

  it("takes a removed task's arrows with it", () => {
    const left = removeItem(items, "b");
    expect(left.map((i) => i.key)).toEqual(["a", "c"]);
    expect(left.find((i) => i.key === "c")?.waitsFor).toEqual([]);
  });
});

describe("a draft and the template it saves as", () => {
  const template: Template = {
    id: "t1", type: "ONBOARDING", name: "Engineers", description: null, archivedAt: null, version: 3,
    items: [
      {
        id: "i1", position: 0, kind: "CHECKLIST", title: "Order a laptop", description: null, dueKind: "OFFSET",
        offsetDays: -7, assigneeKind: "ONBOARDING_MANAGER", assigneeUserId: null, assigneeName: null,
        assigneeProblem: null, config: {}, waitsFor: [],
      },
      {
        id: "i2", position: 1, kind: "DOCUMENT", title: "Passport", description: null, dueKind: "BEFORE_START",
        offsetDays: null, assigneeKind: "TARGET", assigneeUserId: null, assigneeName: null,
        assigneeProblem: null, config: { categoryId: "cat" }, waitsFor: [],
      },
      {
        id: "i3", position: 2, kind: "CHECKLIST", title: "Set up the laptop", description: null, dueKind: "OFFSET",
        offsetDays: -1, assigneeKind: "SPECIFIC_USER", assigneeUserId: "u1", assigneeName: "Linus",
        assigneeProblem: null, config: {}, waitsFor: ["i1"],
      },
    ],
  };

  it("names each item by its id and sends the arrows by those names, ordered along the timeline", () => {
    const draft = draftFromTemplate(template);
    const write = draftToWrite("ONBOARDING", draft, 3);
    expect(write.version).toBe(3);
    expect(write.items.map((i) => i.key)).toEqual(["i1", "i3", "i2"]);
    expect(write.items.find((i) => i.key === "i3")).toMatchObject({ waitsFor: ["i1"], assigneeUserId: "u1" });
    expect(write.items.find((i) => i.key === "i2")).toMatchObject({ dueKind: "BEFORE_START", offsetDays: null, config: { categoryId: "cat" } });
  });

  it("is dirty only when something a save would send has changed", () => {
    const a = draftFromTemplate(template);
    expect(sameDraft(a, draftFromTemplate(template))).toBe(true);
    expect(sameDraft(a, { ...a, items: a.items.map((i) => (i.key === "i1" ? { ...i, offsetDays: -6 } : i)) })).toBe(false);
  });

  it("gives one lane per named person, after the new person and the onboarding manager", () => {
    const lanes = deriveLanes(draftFromTemplate(template).items, [
      { id: "USER:u2", assigneeKind: "SPECIFIC_USER", userId: "u2", label: "Grace", problem: null },
    ]);
    expect(lanes.map((l) => l.label)).toEqual(["The New Person", "Onboarding Manager", "Linus", "Grace"]);
  });

  it("says what is missing before a save would be refused", () => {
    const draft = draftFromTemplate(template);
    expect(draftProblems(draft)).toEqual([]);
    expect(draftProblems({ ...draft, name: " ", items: [item("x", { title: "" })] }))
      .toEqual(["Give the template a name.", "A task has no title."]);
  });
});

describe("words", () => {
  it("groups by phase and says days as people do", () => {
    expect(phaseOf({ dueKind: "BEFORE_START", offsetDays: null })).toBe("BEFORE_START");
    expect(phaseOf({ dueKind: "OFFSET", offsetDays: -3 })).toBe("BEFORE_START");
    expect(phaseOf({ dueKind: "OFFSET", offsetDays: 0 })).toBe("WEEK_1");
    expect(phaseOf({ dueKind: "OFFSET", offsetDays: 6 })).toBe("WEEK_1");
    expect(phaseOf({ dueKind: "OFFSET", offsetDays: 7 })).toBe("MONTH_1");
    expect(phaseOf({ dueKind: "OFFSET", offsetDays: 30 })).toBe("LATER");
    expect(dayLabel({ dueKind: "OFFSET", offsetDays: 0 })).toBe("Day 1");
    expect(dayLabel({ dueKind: "OFFSET", offsetDays: 3 })).toBe("3 days after start");
    expect(dayLabel({ dueKind: "OFFSET", offsetDays: -1 })).toBe("1 day before start");
    expect(dayLabel({ dueKind: "BEFORE_START", offsetDays: null })).toBe("By the start day");
  });
});
