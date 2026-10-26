/**
 * The template canvas's working copy of a template, and every rule about it that is not drawing.
 *
 * The canvas is a view of a list of tasks: a block's place is derived from the task — its day from the
 * due offset, its lane from who does it — and never stored (research § B, "positions derived from data").
 * So the list view, the side panel and the canvas all edit this one shape.
 */
import {
  ASSIGNEE_KIND_LABELS,
  type AssigneeProblem,
  type DueKind,
  type ProcessType,
  type TaskKind,
  type Template,
  type TemplateAssigneeKind,
  type TemplateItemWrite,
  type TemplateWrite,
} from "@/models/lifecycle";

export type DraftItem = {
  /** The item's id when it exists, `new-N` when it was added here. What an arrow names. */
  key: string;
  kind: TaskKind;
  title: string;
  description: string;
  dueKind: DueKind;
  /** Null exactly when `dueKind` is BEFORE_START. Calendar days from the start day (decision 12). */
  offsetDays: number | null;
  assigneeKind: TemplateAssigneeKind;
  assigneeUserId: string | null;
  assigneeName: string | null;
  assigneeProblem: AssigneeProblem | null;
  attributeIds: string[];
  categoryId: string | null;
  /** Keys of the tasks this one waits for. */
  waitsFor: string[];
};

export type TemplateDraft = {
  name: string;
  description: string;
  items: DraftItem[];
};

let newKeySeq = 0;
export const newItemKey = () => `new-${++newKeySeq}`;

export const draftFromTemplate = (template: Template): TemplateDraft => ({
  name: template.name,
  description: template.description ?? "",
  items: template.items.map((i) => ({
    key: i.id,
    kind: i.kind,
    title: i.title,
    description: i.description ?? "",
    dueKind: i.dueKind,
    offsetDays: i.dueKind === "BEFORE_START" ? null : i.offsetDays ?? 0,
    // A template never holds LINE_MANAGER — the backend refuses it — so this narrowing is safe.
    assigneeKind: i.assigneeKind === "LINE_MANAGER" ? "ONBOARDING_MANAGER" : i.assigneeKind,
    assigneeUserId: i.assigneeUserId,
    assigneeName: i.assigneeName,
    assigneeProblem: i.assigneeProblem,
    attributeIds: i.config?.attributeIds ?? [],
    categoryId: i.config?.categoryId ?? null,
    waitsFor: (i.waitsFor ?? []).filter((id) => template.items.some((other) => other.id === id)),
  })),
});

/** The order a saved template lists its tasks in: by day, "by the start day" just before Day 1. */
export const timelineOrder = (a: DraftItem, b: DraftItem) => sortDay(a) - sortDay(b);
const sortDay = (i: DraftItem) => (i.dueKind === "BEFORE_START" ? -0.5 : i.offsetDays ?? 0);

export const draftToWrite = (type: ProcessType, draft: TemplateDraft, version?: number): TemplateWrite => ({
  type,
  name: draft.name.trim(),
  description: draft.description.trim() || null,
  items: [...draft.items].sort(timelineOrder).map(itemToWrite),
  ...(version !== undefined ? { version } : {}),
});

const itemToWrite = (i: DraftItem): TemplateItemWrite => ({
  key: i.key,
  kind: i.kind,
  title: i.title.trim(),
  description: i.description.trim() || null,
  dueKind: i.dueKind,
  offsetDays: i.dueKind === "BEFORE_START" ? null : i.offsetDays ?? 0,
  assigneeKind: i.assigneeKind,
  assigneeUserId: i.assigneeKind === "SPECIFIC_USER" ? i.assigneeUserId : null,
  config: i.kind === "FILL_FIELDS" ? { attributeIds: i.attributeIds }
    : i.kind === "DOCUMENT" ? { categoryId: i.categoryId } : null,
  waitsFor: i.waitsFor,
});

/** Two drafts say the same thing — what the dirty guard asks. */
export const sameDraft = (a: TemplateDraft, b: TemplateDraft) =>
  JSON.stringify(draftToWrite("ONBOARDING", a)) === JSON.stringify(draftToWrite("ONBOARDING", b));

// ── lanes ────────────────────────────────────────────────────────────────────────────────────

/** "TARGET", "ONBOARDING_MANAGER", or "USER:<id>" — one lane per named person used. */
export type LaneId = string;

export type Lane = {
  id: LaneId;
  assigneeKind: TemplateAssigneeKind;
  userId: string | null;
  label: string;
  problem: AssigneeProblem | null;
};

export const NO_PERSON_LANE = "USER:";

export const laneIdOf = (i: Pick<DraftItem, "assigneeKind" | "assigneeUserId">): LaneId =>
  i.assigneeKind === "SPECIFIC_USER" ? `USER:${i.assigneeUserId ?? ""}` : i.assigneeKind;

/**
 * The lanes down the side: the new person and the onboarding manager always, then one per named person —
 * in the order they first appear, then the ones added here that hold no task yet. There is no line
 * manager lane: a template's manager is the process's onboarding manager.
 */
export const deriveLanes = (items: DraftItem[], extra: Lane[] = []): Lane[] => {
  const lanes: Lane[] = [
    { id: "TARGET", assigneeKind: "TARGET", userId: null, label: ASSIGNEE_KIND_LABELS.TARGET, problem: null },
    {
      id: "ONBOARDING_MANAGER", assigneeKind: "ONBOARDING_MANAGER", userId: null,
      label: ASSIGNEE_KIND_LABELS.ONBOARDING_MANAGER, problem: null,
    },
  ];
  const seen = new Set(lanes.map((l) => l.id));
  for (const i of items) {
    const id = laneIdOf(i);
    if (seen.has(id)) continue;
    seen.add(id);
    lanes.push({
      id,
      assigneeKind: "SPECIFIC_USER",
      userId: i.assigneeUserId,
      label: i.assigneeUserId ? i.assigneeName || "Named Person" : "Nobody Chosen",
      problem: i.assigneeUserId ? i.assigneeProblem : "MISSING",
    });
  }
  for (const l of extra) {
    if (seen.has(l.id)) continue;
    seen.add(l.id);
    lanes.push(l);
  }
  return lanes;
};

/** What a task becomes when it is moved into a lane: its assignee. */
export const assigneeOfLane = (lane: Lane): Pick<DraftItem, "assigneeKind" | "assigneeUserId" | "assigneeName" | "assigneeProblem"> => ({
  assigneeKind: lane.assigneeKind,
  assigneeUserId: lane.assigneeKind === "SPECIFIC_USER" ? lane.userId : null,
  assigneeName: lane.assigneeKind === "SPECIFIC_USER" ? lane.label : null,
  assigneeProblem: lane.assigneeKind === "SPECIFIC_USER" ? lane.problem : null,
});

// ── waiting ──────────────────────────────────────────────────────────────────────────────────

/**
 * Would `key` waiting for `on` close a circle? True when `on` already waits, through any number of
 * tasks, for `key` — or is `key` itself. The backend refuses a circle too (LC00007); this keeps the
 * canvas from offering one.
 */
export const wouldCreateCycle = (items: DraftItem[], key: string, on: string): boolean => {
  if (key === on) return true;
  const byKey = new Map(items.map((i) => [i.key, i]));
  const stack = [on];
  const seen = new Set<string>();
  while (stack.length) {
    const next = stack.pop() as string;
    if (next === key) return true;
    if (seen.has(next)) continue;
    seen.add(next);
    stack.push(...(byKey.get(next)?.waitsFor ?? []));
  }
  return false;
};

/** `key` waits for `on` as well, unless that would close a circle; the items unchanged then. */
export const addWait = (items: DraftItem[], key: string, on: string): { items: DraftItem[]; refused: boolean } => {
  if (wouldCreateCycle(items, key, on)) return { items, refused: true };
  return {
    items: items.map((i) => (i.key === key && !i.waitsFor.includes(on) ? { ...i, waitsFor: [...i.waitsFor, on] } : i)),
    refused: false,
  };
};

export const removeWait = (items: DraftItem[], key: string, on: string): DraftItem[] =>
  items.map((i) => (i.key === key ? { ...i, waitsFor: i.waitsFor.filter((k) => k !== on) } : i));

/** A task removed takes its arrows with it, both ways. */
export const removeItem = (items: DraftItem[], key: string): DraftItem[] =>
  items.filter((i) => i.key !== key).map((i) => ({ ...i, waitsFor: i.waitsFor.filter((k) => k !== key) }));

// ── words ────────────────────────────────────────────────────────────────────────────────────

const MINUS = "−";

/**
 * "By the start day", "Day 1", "3 days after start", "3 days before start" — as people say them, and
 * agreeing with the ruler's "+3". Offsets count calendar days (decision 12).
 */
export const dayLabel = (i: Pick<DraftItem, "dueKind" | "offsetDays">): string => {
  if (i.dueKind === "BEFORE_START") return "By the start day";
  const n = i.offsetDays ?? 0;
  if (n === 0) return "Day 1";
  const days = Math.abs(n) === 1 ? "1 day" : `${Math.abs(n)} days`;
  return n > 0 ? `${days} after start` : `${days} before start`;
};

/** A compact day for the ruler: "−3", "Day 1", "+5". */
export const shortDay = (offset: number): string =>
  offset === 0 ? "Day 1" : offset < 0 ? `${MINUS}${Math.abs(offset)}` : `+${offset}`;

export type Phase = "BEFORE_START" | "WEEK_1" | "MONTH_1" | "LATER";

export const PHASE_LABELS: Record<Phase, string> = {
  BEFORE_START: "Before Start",
  WEEK_1: "Week 1",
  MONTH_1: "Month 1",
  LATER: "Later",
};

/** The list view's groups. Day 1 starts week 1; a month is the first thirty days. */
export const phaseOf = (i: Pick<DraftItem, "dueKind" | "offsetDays">): Phase => {
  if (i.dueKind === "BEFORE_START") return "BEFORE_START";
  const n = i.offsetDays ?? 0;
  if (n < 0) return "BEFORE_START";
  if (n < 7) return "WEEK_1";
  if (n < 30) return "MONTH_1";
  return "LATER";
};

/** Nothing a save would refuse at once: every task has a title, every named task names somebody. */
export const draftProblems = (draft: TemplateDraft): string[] => {
  const problems: string[] = [];
  if (!draft.name.trim()) problems.push("Give the template a name.");
  draft.items.forEach((i) => {
    if (!i.title.trim()) problems.push("A task has no title.");
    else if (i.assigneeKind === "SPECIFIC_USER" && !i.assigneeUserId) problems.push(`${i.title.trim()}: choose who does it.`);
    else if (i.kind === "FILL_FIELDS" && i.attributeIds.length === 0) problems.push(`${i.title.trim()}: choose the fields to fill in.`);
    else if (i.kind === "DOCUMENT" && !i.categoryId) problems.push(`${i.title.trim()}: choose a document category.`);
  });
  return problems;
};
