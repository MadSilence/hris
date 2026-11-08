import type { AutomationSummary, TriggerSpec } from "@/models/automations";

/** The status chips of the list (Q-9): single choice. */
export type StatusChip = "ALL" | "ACTIVE" | "PAUSED" | "DRAFT";
export const STATUS_CHIPS: StatusChip[] = ["ALL", "ACTIVE", "PAUSED", "DRAFT"];

/**
 * What a trigger is, as a key of the `automations` catalogue's `trigger` words: an event trigger is its event, a
 * date trigger on a picked date is `FIXED_DATE`. The "Starts when" filter groups by it.
 */
export type TriggerKey =
  | Exclude<TriggerSpec["type"], "EVENT">
  | NonNullable<TriggerSpec["event"]>
  | "FIXED_DATE";

export const triggerKey = (trigger: TriggerSpec | null | undefined): TriggerKey | null => {
  if (!trigger) return null;
  if (trigger.type === "EVENT") return trigger.event ?? null;
  if (trigger.type === "DATE_OFFSET" && trigger.field === "FIXED") return "FIXED_DATE";
  return trigger.type;
};

export type ListFilters = { q: string; chip: StatusChip; startsWhen: TriggerKey | null };

export const EMPTY_FILTERS: ListFilters = { q: "", chip: "ALL", startsWhen: null };

export const isFiltered = (filters: ListFilters) =>
  filters.q.trim() !== "" || filters.chip !== "ALL" || filters.startsWhen !== null;

/** The cards a filter leaves, in the server's order — with one just duplicated put first. */
export const filterAutomations = (
  automations: AutomationSummary[],
  filters: ListFilters,
  firstId: string | null = null,
): AutomationSummary[] => {
  const q = filters.q.trim().toLowerCase();
  const kept = automations.filter((automation) => {
    if (filters.chip !== "ALL" && automation.status !== filters.chip) return false;
    if (filters.startsWhen && triggerKey(automation.trigger) !== filters.startsWhen) return false;
    if (!q) return true;
    return [automation.name, automation.description ?? "", automation.owner?.name ?? ""].some((text) =>
      text.toLowerCase().includes(q),
    );
  });
  if (!firstId) return kept;
  const first = kept.find((automation) => automation.id === firstId);
  return first ? [first, ...kept.filter((automation) => automation.id !== firstId)] : kept;
};

/** The triggers the automations on the list start from — the "Starts when" menu offers only those. */
export const triggerKeysOf = (automations: AutomationSummary[]): TriggerKey[] => {
  const keys = new Set<TriggerKey>();
  automations.forEach((automation) => {
    const key = triggerKey(automation.trigger);
    if (key) keys.add(key);
  });
  return [...keys];
};

export type MenuItem =
  | "edit"
  | "duplicate"
  | "turnOff"
  | "turnOn"
  | "runHistory"
  | "changeOwner"
  | "archive"
  | "delete"
  | "unarchive";

/**
 * The ⋯ menu shows only what applies (`automations-list` → Actions):
 * Active — Edit, Duplicate, Turn off, Run history, Change owner, Archive;
 * Paused — Edit, Duplicate, Turn on, Run history, Change owner, Archive;
 * Draft — Edit, Duplicate, Change owner, then Delete (a draft that ran is archived instead);
 * Archived — Unarchive, Duplicate, Run history.
 * A holiday calendar's binding (`SYSTEM`) is changed through the place's field, so it offers its history alone.
 */
export const menuFor = (automation: AutomationSummary): MenuItem[] => {
  if (automation.origin === "SYSTEM") return ["runHistory"];
  switch (automation.status) {
    case "ACTIVE":
      return ["edit", "duplicate", "turnOff", "runHistory", "changeOwner", "archive"];
    case "PAUSED":
      return ["edit", "duplicate", "turnOn", "runHistory", "changeOwner", "archive"];
    case "DRAFT":
      return automation.runs > 0
        ? ["edit", "duplicate", "changeOwner", "archive"]
        : ["edit", "duplicate", "changeOwner", "delete"];
    case "ARCHIVED":
      return ["unarchive", "duplicate", "runHistory"];
  }
};

/** The one button a paused card carries: whose problem it is decides what fixes it. */
export type PauseFix = "makeMeOwner" | "fixStep" | "turnOn";

export const pauseFixFor = (automation: AutomationSummary): PauseFix | null => {
  if (automation.status !== "PAUSED" || !automation.pause) return null;
  switch (automation.pause.reason) {
    case "OWNER_LEFT":
    case "OWNER_LACKS_RIGHT":
      return "makeMeOwner";
    case "TARGET_GONE":
      return "fixStep";
    case "MANUAL":
      return "turnOn";
  }
};

// ── where things open ─────────────────────────────────────────────────────────────────────────

export const automationsHref = {
  list: "/automations",
  open: (id: string) => `/automations/${id}`,
  edit: (id: string) => `/automations/${id}?edit=1`,
  turnOn: (id: string) => `/automations/${id}?turnOn=1`,
  fixStep: (id: string, stepId: string | null) =>
    stepId ? `/automations/${id}?step=${encodeURIComponent(stepId)}` : `/automations/${id}?edit=1`,
  run: (id: string, runId: string) => `/automations/${id}?run=${encodeURIComponent(runId)}`,
  activity: (automationId?: string | null) =>
    automationId ? `/automations?tab=activity&automation=${encodeURIComponent(automationId)}` : "/automations?tab=activity",
  /** "See why" on a card: Activity for this automation, the failures, and the failed run open. */
  seeWhy: (automationId: string, runId?: string | null) =>
    runId
      ? `/automations?tab=activity&automation=${encodeURIComponent(automationId)}&chip=FAILED&run=${encodeURIComponent(runId)}`
      : `/automations?tab=activity&automation=${encodeURIComponent(automationId)}&chip=FAILED&why=1`,
  newFromTemplate: (key: string) => `/automations/new?template=${encodeURIComponent(key)}`,
  newFromScratch: "/automations/new",
  newWithAi: (prompt: string) => `/automations/new?ai=${encodeURIComponent(prompt)}`,
};
