import type { AutomationStepType } from "@/models/automations";

/**
 * The Add a step list (D2): four groups, in the design's order. "Assign or unassign" is one entry — the step's own
 * fields pick which (UNASSIGN is never listed on its own).
 */
export const STEP_GROUPS: { key: "ask" | "tell" | "change" | "flow"; types: AutomationStepType[] }[] = [
  { key: "ask", types: ["CREATE_TASK", "REQUEST_APPROVAL", "START_REVIEW", "SIGN_DOCUMENT", "SEND_SURVEY"] },
  { key: "tell", types: ["NOTIFY", "SEND_EMAIL"] },
  { key: "change", types: ["ASSIGN", "GRANT_TIME_OFF_POLICY"] },
  { key: "flow", types: ["WAIT_UNTIL", "SPLIT"] },
];

/** The quick add's short list (D4), before anything is typed. */
export const COMMON_STEPS: AutomationStepType[] = ["CREATE_TASK", "REQUEST_APPROVAL", "NOTIFY", "SEND_EMAIL", "WAIT_UNTIL"];

/** The groups with only what the catalogue offers, filtered by a search over the names. */
export const filterGroups = (
  available: AutomationStepType[],
  query: string,
  nameOf: (type: AutomationStepType) => string,
): { key: (typeof STEP_GROUPS)[number]["key"]; types: AutomationStepType[] }[] => {
  const q = query.trim().toLocaleLowerCase();
  const offered = new Set(available);
  return STEP_GROUPS.map((g) => ({
    key: g.key,
    types: g.types.filter((type) => offered.has(type) && (!q || nameOf(type).toLocaleLowerCase().includes(q))),
  })).filter((g) => g.types.length > 0);
};

/** The data type a step carries while it is dragged from the list onto the canvas. */
export const STEP_DRAG_TYPE = "application/x-noddo-automation-step";
