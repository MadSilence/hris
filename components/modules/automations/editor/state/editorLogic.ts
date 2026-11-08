import type {
  AutomationCheck,
  AutomationDefinition,
  AutomationProblem,
  AutomationRun,
  AutomationStatus,
  BackfillChoice,
  StepSpec,
} from "@/models/automations";
import { flatten } from "@/components/modules/automations/model/tree";

/**
 * The editor's decisions, pure: which header buttons, what a turn-on attempt leads to, which cards are edited, which
 * need details, what a run's state is on each card. No React, no words — the components read these.
 */

// ── what is being edited ──────────────────────────────────────────────────────────────────────

export type EditorDraft = {
  name: string;
  description: string;
  icon: string | null;
  definition: AutomationDefinition;
};

export const sameDefinition = (a: AutomationDefinition, b: AutomationDefinition): boolean => JSON.stringify(a) === JSON.stringify(b);

export const sameMeta = (a: EditorDraft, b: EditorDraft): boolean =>
  a.name === b.name && a.description === b.description && a.icon === b.icon;

/** A step without the steps under it: a branch point is "edited" for its own fields, not for what its paths hold. */
const own = (step: StepSpec): string => {
  const rest: StepSpec = { ...step };
  delete rest.approved;
  delete rest.declined;
  delete rest.paths;
  delete rest.otherwise;
  return JSON.stringify([rest, step.paths?.map((p) => ({ ...p, steps: undefined })), step.otherwise ? { ...step.otherwise, steps: undefined } : null]);
};

/** The steps of `current` that are new or changed against `saved` — "· edited" on a live automation's cards (F5). */
export const editedStepIds = (saved: AutomationDefinition | null, current: AutomationDefinition): Set<string> => {
  const before = new Map(flatten(saved).map((n) => [n.step.id, own(n.step)]));
  const out = new Set<string>();
  for (const node of flatten(current)) {
    if (before.get(node.step.id) !== own(node.step)) out.add(node.step.id);
  }
  return out;
};

// ── the header ────────────────────────────────────────────────────────────────────────────────

export type HeaderButton = "testRun" | "saveDraft" | "turnOn" | "turnOff" | "saveChanges" | "edit";

/**
 * The header's buttons on the right (`automations-editor` → Layout 2): Test run, then by status. Read mode shows Edit
 * alone after Test run; a viewer sees none, and Edit is not offered on an archived or a system automation.
 */
export const headerButtons = ({
  status,
  readMode,
  canManage,
  system,
}: {
  status: AutomationStatus;
  readMode: boolean;
  canManage: boolean;
  system: boolean;
}): HeaderButton[] => {
  if (!canManage) return [];
  if (system) return [];
  if (readMode) return status === "ARCHIVED" ? [] : ["testRun", "edit"];
  switch (status) {
    case "DRAFT":
      return ["testRun", "saveDraft", "turnOn"];
    case "ACTIVE":
      return ["testRun", "turnOff", "saveChanges"];
    case "PAUSED":
      return ["testRun", "turnOn", "saveChanges"];
    case "ARCHIVED":
      return [];
  }
};

/** Active, Paused and Archived open read only (R3, R4); so does anything for a viewer and a system automation. */
export const opensReadOnly = (status: AutomationStatus): boolean => status !== "DRAFT";

// ── turning on ────────────────────────────────────────────────────────────────────────────────

export type TurnOnNext = { kind: "problems"; problems: AutomationProblem[] } | { kind: "confirm"; waiting: boolean };

/** What a Turn on leads to once the check is back: missing details (F3), or the dialog, with waiting cases (V6) or not (F4). */
export const turnOnNext = (check: Pick<AutomationCheck, "problems" | "waitingCases">): TurnOnNext =>
  check.problems.length > 0
    ? { kind: "problems", problems: check.problems }
    : { kind: "confirm", waiting: check.waitingCases > 0 };

/** The messages turning on would send at once: only when the waiting cases are taken in. */
export const messagesNow = (check: Pick<AutomationCheck, "messagesPerFiring" | "waitingCases">, backfill: BackfillChoice): number =>
  backfill === "ALL" ? check.messagesPerFiring * check.waitingCases : 0;

/**
 * Over the threshold, "I understand, send them" has to be ticked before Turn on is enabled — the messages one firing
 * sends (a schedule's whole firing), or the waiting cases taken in at once, whichever is more. The backend asks the
 * same of one firing (`requireVolume`); asked only for the waiting cases, a schedule to everybody could not be turned
 * on at all — "We couldn't turn it on", with nothing to tick (walk of 2026-11-07).
 */
export const needsVolumeTick = (
  check: Pick<AutomationCheck, "messagesPerFiring" | "waitingCases" | "volumeThreshold">,
  backfill: BackfillChoice,
): boolean => Math.max(messagesNow(check, backfill), check.messagesPerFiring) > check.volumeThreshold;

/** Whether one firing alone is over the threshold — what Save changes asks about on a live automation. */
export const firingOverVolume = (check: Pick<AutomationCheck, "messagesPerFiring" | "volumeThreshold">): boolean =>
  check.messagesPerFiring > check.volumeThreshold;

// ── missing details ───────────────────────────────────────────────────────────────────────────

export type NeedsKey =
  | "trigger"
  | "assignee"
  | "approver"
  | "recipients"
  | "subject"
  | "body"
  | "text"
  | "title"
  | "assignable"
  | "policy"
  | "form"
  | "question"
  | "paths"
  | "task"
  | "field"
  | "documents"
  | "survey"
  | "other";

/** The "Add …" / "Choose …" line a card shows for a problem (F3), by the field the check names. */
export const needsKey = (problem: AutomationProblem, step: StepSpec | null): NeedsKey => {
  if (!problem.stepId) return "trigger";
  switch (problem.field) {
    case "assignee":
      return step?.type === "REQUEST_APPROVAL" ? "approver" : "assignee";
    case "recipients":
    case "tell":
      return "recipients";
    case "subject":
      return "subject";
    case "body":
      return "body";
    case "text":
      return "text";
    case "title":
      return "title";
    case "assignableType":
    case "assignableId":
    case "relation":
      return "assignable";
    case "policyId":
      return "policy";
    case "formId":
      return "form";
    case "question":
      return "question";
    case "paths":
      return "paths";
    case "taskStepId":
      return "task";
    case "field":
      return "field";
    case "documents":
      return "documents";
    case "survey":
      return "survey";
    default:
      return "other";
  }
};

/** The problems by step, the trigger's under `null`, in the order the steps are drawn — what Show next walks. */
export const problemsByStep = (definition: AutomationDefinition, problems: AutomationProblem[]): Map<string | null, AutomationProblem[]> => {
  const out = new Map<string | null, AutomationProblem[]>();
  const order = [null, ...flatten(definition).map((n) => n.step.id)];
  for (const id of order) {
    const own = problems.filter((p) => (p.stepId ?? null) === id);
    if (own.length > 0) out.set(id, own);
  }
  // A problem about a step that is no longer there still counts, at the end.
  for (const p of problems) {
    if (!out.has(p.stepId ?? null)) out.set(p.stepId ?? null, problems.filter((q) => q.stepId === p.stepId));
  }
  return out;
};

/** The next place with a problem after `current` — round the end back to the first. */
export const nextProblem = (order: (string | null)[], current: string | null | undefined): string | null | undefined => {
  if (order.length === 0) return undefined;
  const at = current === undefined ? -1 : order.indexOf(current);
  return order[(at + 1) % order.length];
};

// ── a run on the canvas ───────────────────────────────────────────────────────────────────────

export type RunCardState = "done" | "waiting" | "failed" | "skipped" | "notStarted";

/** Each step's state in an open run (V1, V1b): what it reached, and "Not started yet" for what lies ahead. */
export const runCardStates = (run: AutomationRun | null, definition: AutomationDefinition | null): Record<string, RunCardState> | null => {
  if (!run) return null;
  const out: Record<string, RunCardState> = {};
  for (const node of flatten(definition)) out[node.step.id] = "notStarted";
  for (const s of run.steps ?? []) {
    switch (s.status) {
      case "DONE":
        out[s.stepId] = "done";
        break;
      case "WAITING":
        out[s.stepId] = "waiting";
        break;
      case "FAILED":
        out[s.stepId] = "failed";
        break;
      case "SKIPPED":
      case "CANCELLED":
      case "STOPPED":
        out[s.stepId] = "skipped";
        break;
      default:
        out[s.stepId] = "notStarted";
    }
  }
  return out;
};

// ── the keyboard on a card ────────────────────────────────────────────────────────────────────

export type CardCommand = "open" | "menu" | "up" | "down" | "remove" | "deselect";

type KeyLike = Pick<KeyboardEvent, "key" | "altKey" | "shiftKey" | "metaKey" | "ctrlKey">;

/** A card's keys: every move a mouse makes on the canvas, without one. */
export const cardKeyCommand = (event: KeyLike): CardCommand | null => {
  if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) return "menu";
  if (event.altKey && event.key === "ArrowUp") return "up";
  if (event.altKey && event.key === "ArrowDown") return "down";
  if (event.metaKey || event.ctrlKey || event.altKey) return null;
  switch (event.key) {
    case "Enter":
    case " ":
      return "open";
    case "Delete":
    case "Backspace":
      return "remove";
    case "Escape":
      return "deselect";
    default:
      return null;
  }
};

/** Keys typed into a field are the field's, not the canvas's. */
export const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
};

// ── the trigger ───────────────────────────────────────────────────────────────────────────────

/** Time-off events wait as requests; the turn-on dialog says "requests" for them and "cases" for the rest. */
export const countsRequests = (definition: AutomationDefinition): boolean =>
  definition.trigger?.type === "EVENT" && (definition.trigger.event ?? "").startsWith("TIME_OFF_");

/** Steps a run skips because they are not connected yet (K9). */
export const notConnectedSteps = (definition: AutomationDefinition): StepSpec[] =>
  flatten(definition).map((n) => n.step).filter((s) => s.type === "SIGN_DOCUMENT" || s.type === "SEND_SURVEY");
