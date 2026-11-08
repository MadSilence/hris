import type {
  AutomationDefinition,
  AutomationStepType,
  SplitPath,
  StepSpec,
} from "@/models/automations";

/**
 * The steps of an automation as a tree — the same reading as the backend's `AutomationTree`
 * (hris-api `features/automations/model/AutomationTree.java`). Pure: no React, no words.
 *
 * A branch point (an approval, a split) ends its line; its paths carry the steps after it. Paths do not join
 * again. Numbers are computed, never stored: the trunk is 1, 2, 3…; a path continues the number with its letter
 * (2A, 3A, 2B), a path inside a path adds one more (4AB).
 */

export const APPROVED = "approved";
export const DECLINED = "declined";
export const OTHERWISE = "otherwise";

/** One path out of a branch point, whatever kind of point it is. */
export type Branch = { key: string; name: string | null; steps: StepSpec[]; kind: "APPROVED" | "DECLINED" | "PATH" | "OTHERWISE" };

/** One step, flat. `previous` is the position of the step before it on its line, -1 after the trigger. */
export type FlatStep = { position: number; step: StepSpec; path: string; previous: number; number: string; depth: number };

export const branches = (step: StepSpec): boolean => step.type === "REQUEST_APPROVAL" || step.type === "SPLIT";

export const branchList = (step: StepSpec): Branch[] => {
  if (step.type === "REQUEST_APPROVAL") {
    return [
      { key: APPROVED, name: null, steps: step.approved ?? [], kind: "APPROVED" },
      { key: DECLINED, name: null, steps: step.declined ?? [], kind: "DECLINED" },
    ];
  }
  if (step.type === "SPLIT") {
    const paths: Branch[] = (step.paths ?? []).map((p) => ({ key: p.id, name: p.name, steps: p.steps ?? [], kind: "PATH" as const }));
    const o = step.otherwise;
    paths.push({ key: OTHERWISE, name: o?.name ?? null, steps: o?.steps ?? [], kind: "OTHERWISE" });
    return paths;
  }
  return [];
};

export const letter = (i: number): string => (i < 26 ? String.fromCharCode(65 + i) : `A${letter(i - 26)}`);

export const flatten = (d: Pick<AutomationDefinition, "steps"> | null | undefined): FlatStep[] => {
  const out: FlatStep[] = [];
  const walk = (line: StepSpec[], path: string, previous: number, first: number, suffix: string, depth: number) => {
    let prev = previous;
    let n = first;
    for (const step of line) {
      if (!step) continue;
      const node: FlatStep = { position: out.length, step, path, previous: prev, number: `${n}${suffix}`, depth };
      out.push(node);
      prev = node.position;
      n++;
      if (branches(step)) {
        branchList(step).forEach((b, i) => {
          const choice = `${step.id}=${b.key}`;
          walk(b.steps, path ? `${path}/${choice}` : choice, node.position, n, suffix + letter(i), depth + 1);
        });
        return;
      }
    }
  };
  walk(d?.steps ?? [], "", -1, 1, "", 0);
  return out;
};

/** Each step's number by its id: "3", "2A". */
export const numbers = (d: Pick<AutomationDefinition, "steps"> | null | undefined): Record<string, string> =>
  Object.fromEntries(flatten(d).map((n) => [n.step.id, n.number]));

export const allSteps = (d: Pick<AutomationDefinition, "steps"> | null | undefined): StepSpec[] => flatten(d).map((n) => n.step);

export const findStep = (d: Pick<AutomationDefinition, "steps"> | null | undefined, id: string | null): StepSpec | null =>
  id ? allSteps(d).find((s) => s.id === id) ?? null : null;

/** The steps above a step on its own line, nearest first — what "Wait until a task from this run is done" offers. */
export const stepsAbove = (d: Pick<AutomationDefinition, "steps">, id: string): StepSpec[] => {
  const flat = flatten(d);
  const node = flat.find((n) => n.step.id === id);
  const out: StepSpec[] = [];
  for (let p = node?.previous ?? -1; p >= 0; p = flat[p].previous) out.push(flat[p].step);
  return out;
};

// ── ids ───────────────────────────────────────────────────────────────────────────────────────

/** A fresh id, unique within the definition. */
export const newStepId = (d: Pick<AutomationDefinition, "steps"> | null | undefined): string => {
  const taken = new Set(allSteps(d).map((s) => s.id));
  for (let i = taken.size + 1; ; i++) {
    const id = `s${i}`;
    if (!taken.has(id)) return id;
  }
};

/** A fresh path id within a split. */
export const newPathId = (step: StepSpec): string => {
  const taken = new Set((step.paths ?? []).map((p) => p.id));
  for (let i = taken.size + 1; ; i++) {
    const id = `p${i}`;
    if (!taken.has(id) && id !== OTHERWISE) return id;
  }
};

// ── editing — every function returns a new tree, the old one untouched ───────────────────────

/** Where a step goes: after a step on its line, or first on a path of a branch point, or first on the trunk. */
export type InsertTarget =
  | { kind: "after"; stepId: string }
  | { kind: "branchStart"; stepId: string; branchKey: string }
  | { kind: "trunkStart" }
  | { kind: "trunkEnd" };

type Line = StepSpec[];

const mapLines = (line: Line, f: (line: Line) => Line): Line =>
  f(line).map((s) => {
    if (s.type === "REQUEST_APPROVAL") {
      return { ...s, approved: mapLines(s.approved ?? [], f), declined: mapLines(s.declined ?? [], f) };
    }
    if (s.type === "SPLIT") {
      return {
        ...s,
        paths: (s.paths ?? []).map((p) => ({ ...p, steps: mapLines(p.steps ?? [], f) })),
        otherwise: s.otherwise ? { ...s.otherwise, steps: mapLines(s.otherwise.steps ?? [], f) } : s.otherwise,
      };
    }
    return s;
  });

const withLines = (d: AutomationDefinition, f: (line: Line) => Line): AutomationDefinition => ({
  ...d,
  steps: mapLines(d.steps ?? [], f),
});

/** A branch point inserted mid-line takes the rest of its line as its first path (paths do not join again). */
const adopt = (step: StepSpec, rest: StepSpec[]): StepSpec => {
  if (rest.length === 0) return step;
  if (step.type === "REQUEST_APPROVAL") return { ...step, approved: [...(step.approved ?? []), ...rest] };
  if (step.type === "SPLIT") {
    const paths = step.paths ?? [];
    if (paths.length === 0) return { ...step, otherwise: { ...(step.otherwise ?? emptyOtherwise()), steps: rest } };
    return { ...step, paths: [{ ...paths[0], steps: [...(paths[0].steps ?? []), ...rest] }, ...paths.slice(1)] };
  }
  return step;
};

export const insertStep = (d: AutomationDefinition, step: StepSpec, target: InsertTarget): AutomationDefinition => {
  const place = (line: Line, at: number): Line =>
    branches(step) ? [...line.slice(0, at), adopt(step, line.slice(at))] : [...line.slice(0, at), step, ...line.slice(at)];
  if (target.kind === "trunkStart") return { ...d, steps: place(d.steps ?? [], 0) };
  if (target.kind === "trunkEnd") {
    // After the last step of the trunk; a trunk that ends in a branch point takes it on its first path's end.
    const trunk = d.steps ?? [];
    const last = trunk[trunk.length - 1];
    if (last && branches(last)) {
      const first = branchList(last)[0];
      const lastOnPath = first.steps[first.steps.length - 1];
      return lastOnPath
        ? insertStep(d, step, { kind: "after", stepId: lastOnPath.id })
        : insertStep(d, step, { kind: "branchStart", stepId: last.id, branchKey: first.key });
    }
    return { ...d, steps: place(trunk, trunk.length) };
  }
  if (target.kind === "after") {
    return withLines(d, (line) => {
      const i = line.findIndex((s) => s.id === target.stepId);
      if (i < 0) return line;
      if (branches(line[i])) {
        // After a branch point means first on its first path.
        const first = branchList(line[i])[0];
        return line.map((s, j) => (j === i ? setBranch(s, first.key, place(first.steps, 0)) : s));
      }
      return place(line, i + 1);
    });
  }
  return withLines(d, (line) =>
    line.map((s) => {
      if (s.id !== target.stepId) return s;
      const b = branchList(s).find((x) => x.key === target.branchKey);
      return b ? setBranch(s, b.key, place(b.steps, 0)) : s;
    }),
  );
};

const setBranch = (s: StepSpec, key: string, steps: StepSpec[]): StepSpec => {
  if (key === APPROVED) return { ...s, approved: steps };
  if (key === DECLINED) return { ...s, declined: steps };
  if (key === OTHERWISE) return { ...s, otherwise: { ...(s.otherwise ?? emptyOtherwise()), steps } };
  return { ...s, paths: (s.paths ?? []).map((p) => (p.id === key ? { ...p, steps } : p)) };
};

export const updateStep = (d: AutomationDefinition, id: string, patch: (s: StepSpec) => StepSpec): AutomationDefinition =>
  withLines(d, (line) => line.map((s) => (s.id === id ? patch(s) : s)));

/** Removes a step; a branch point takes its paths with it, except the first path's steps, which move up. */
export const removeStep = (d: AutomationDefinition, id: string): AutomationDefinition =>
  withLines(d, (line) => {
    const i = line.findIndex((s) => s.id === id);
    if (i < 0) return line;
    const s = line[i];
    const kept = branches(s) ? branchList(s)[0].steps : [];
    return [...line.slice(0, i), ...kept, ...line.slice(i + 1)];
  });

/** A copy right after it with a fresh id. A branch point is copied without its paths' steps: the copy ends nothing. */
export const duplicateStep = (d: AutomationDefinition, id: string): AutomationDefinition => {
  const source = findStep(d, id);
  if (!source) return d;
  const copy: StepSpec = { ...source, id: newStepId(d) };
  if (source.type === "REQUEST_APPROVAL") {
    copy.approved = [];
    copy.declined = [];
  }
  if (source.type === "SPLIT") {
    copy.paths = (source.paths ?? []).map((p) => ({ ...p, steps: [] }));
    copy.otherwise = { ...(source.otherwise ?? emptyOtherwise()), steps: [] };
  }
  return insertStep(d, copy, { kind: "after", stepId: id });
};

/** Moves a step one place up or down its own line (a branch point stays the last of its line). */
export const moveStep = (d: AutomationDefinition, id: string, delta: -1 | 1): AutomationDefinition =>
  withLines(d, (line) => {
    const i = line.findIndex((s) => s.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= line.length) return line;
    if (branches(line[i]) || branches(line[j])) return line;
    const out = [...line];
    [out[i], out[j]] = [out[j], out[i]];
    return out;
  });

/** Moves a step to just after another (drag on the canvas). A branch point is not moved this way. */
export const moveStepAfter = (d: AutomationDefinition, id: string, target: InsertTarget): AutomationDefinition => {
  const step = findStep(d, id);
  if (!step || branches(step)) return d;
  if (target.kind === "after" && target.stepId === id) return d;
  return insertStep(removeStep(d, id), step, target);
};

// ── new steps ────────────────────────────────────────────────────────────────────────────────

const emptyOtherwise = (): SplitPath => ({ id: OTHERWISE, name: "", steps: [] });

/** A new step of a type, with the design's defaults filled in where the design names one. */
export const newStep = (id: string, type: AutomationStepType): StepSpec => {
  switch (type) {
    case "CREATE_TASK":
      return { id, type, assignee: null, title: "", dueDays: 7 };
    case "REQUEST_APPROVAL":
      return { id, type, assignee: { kind: "MANAGER" }, maxDays: 3, ifNoAnswer: "ASK_THEIR_MANAGER", remindDaily: false,
        approved: [], declined: [] };
    case "START_REVIEW":
      return { id, type, assignee: { kind: "MANAGER" }, dueDays: 14 };
    case "WAIT_UNTIL":
      return { id, type, until: "TASK_DONE", maxDays: 10, onTimeout: "STOP_AND_TELL" };
    case "SPLIT":
      return { id, type, question: "", paths: [{ id: "p1", name: "", condition: null, steps: [] }], otherwise: emptyOtherwise() };
    case "ASSIGN":
    case "UNASSIGN":
      return { id, type, assignableType: null, assignableId: null };
    case "NOTIFY":
      return { id, type, recipients: [], text: "" };
    case "SEND_EMAIL":
      return { id, type, recipients: [], subject: "", body: "" };
    default:
      return { id, type };
  }
};

export const emptyDefinition = (): AutomationDefinition => ({
  trigger: null,
  conditions: { filters: [], excludeUserIds: [] },
  steps: [],
  latePolicy: "RUN_LATE",
  lateWindowDays: null,
});
