import type { AutomationCatalog, AutomationEventOption, RecipientKind, RecipientSpec } from "@/models/automations";

/** One recipient's identity: two picks of "Their manager" are one, two company roles are two. */
export const recipientKey = (r: RecipientSpec): string => `${r.kind}:${r.roleId ?? r.userId ?? ""}`;

/** The roles that change with each person, in the design's order (S1b); those the catalogue offers. */
const RELATIVE: RecipientKind[] = ["PERSON", "MANAGER", "MANAGERS_MANAGER", "DEPARTMENT_HEAD", "ONBOARDING_MANAGER"];

/**
 * The "Roles" part of the people picker: the person, their manager, their manager's manager, the department head,
 * the onboarding manager (what the catalogue's `recipientKinds` offers), the approver when the trigger is a time-off
 * event, then the company's roles A–Z. Pure: words are the caller's.
 */
export const roleChoices = (
  catalog: Pick<AutomationCatalog, "recipientKinds" | "roles">,
  event?: Pick<AutomationEventOption, "recipientKinds"> | null,
): RecipientSpec[] => {
  const offered = new Set<RecipientKind>([...(catalog.recipientKinds ?? []), ...(event?.recipientKinds ?? [])]);
  const relative = RELATIVE.filter((k) => offered.has(k)).map((kind) => ({ kind }));
  const approver: RecipientSpec[] = event?.recipientKinds?.includes("APPROVER") ? [{ kind: "APPROVER" }] : [];
  const roles: RecipientSpec[] = offered.has("ROLE")
    ? [...(catalog.roles ?? [])]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((r) => ({ kind: "ROLE" as const, roleId: r.id }))
    : [];
  return [...relative, ...approver, ...roles];
};

export const includesRecipient = (list: RecipientSpec[], r: RecipientSpec): boolean =>
  list.some((x) => recipientKey(x) === recipientKey(r));

/** Adds a pick; in single mode it replaces what was there. */
export const addRecipient = (list: RecipientSpec[], r: RecipientSpec, mode: "single" | "multiple"): RecipientSpec[] => {
  if (mode === "single") return [r];
  return includesRecipient(list, r) ? list : [...list, r];
};

export const removeRecipient = (list: RecipientSpec[], r: RecipientSpec): RecipientSpec[] =>
  list.filter((x) => recipientKey(x) !== recipientKey(r));

/** Splits a label around the first match of what was typed, so the typed letters can be bold. */
export const splitMatch = (label: string, query: string): [string, string, string] | null => {
  const q = query.trim();
  if (!q) return null;
  const at = label.toLocaleLowerCase().indexOf(q.toLocaleLowerCase());
  if (at < 0) return null;
  return [label.slice(0, at), label.slice(at, at + q.length), label.slice(at + q.length)];
};
