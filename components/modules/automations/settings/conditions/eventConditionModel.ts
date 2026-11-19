import type { EventCondition } from "@/models/automations";

/**
 * The "Only when" of a time-off or process trigger, in the shape the builder edits, and its mapping to the backend's
 * `EventCondition` tree (hris-api `EventConditions`: `ALL | ANY | NOT | MATCH`, ops `eq neq gt gte lt lte in`, `in`
 * a comma-separated list).
 *
 * <p>**A flat list joined by AND**, like every other condition list in automations (owner, 2026-11-18): the builder
 * writes `ALL` over `MATCH` leaves and nothing else. The backend's tree is unchanged and still reads anything; a tree
 * stored before — with `ANY`, a group or a `NOT` — is read as its comparisons in one list (a `NOT` over one comparison
 * as the opposite comparison), and {@link isFlatAnd} says whether that reading is the same condition. It is written back
 * only when the list is edited. Pure: no React.
 */
export type EventOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in";

export type EventLeaf = { kind: "leaf"; id: number; field: string; op: EventOp | null; value: string };

let seq = 1;
const nextId = () => seq++;

export const blankLeaf = (): EventLeaf => ({ kind: "leaf", id: nextId(), field: "", op: null, value: "" });

/** What a field of an event is: `TEXT`, `NUMBER`, or the values it can take ("PREBOARDING,ONBOARDING,OFFBOARDING"). */
export const fieldKind = (type: string): { kind: "text" | "number" | "list"; values: string[] } => {
  if (type === "NUMBER") return { kind: "number", values: [] };
  if (type === "TEXT" || !type) return { kind: "text", values: [] };
  return { kind: "list", values: type.split(",").map((v) => v.trim()).filter(Boolean) };
};

export const opsFor = (type: string): EventOp[] =>
  fieldKind(type).kind === "number" ? ["gt", "gte", "lt", "lte", "eq", "neq"] : ["eq", "neq", "in"];

const OPPOSITE: Record<EventOp, EventOp | null> = { eq: "neq", neq: "eq", gt: "lte", gte: "lt", lt: "gte", lte: "gt", in: null };

const isOp = (op: string | null | undefined): op is EventOp =>
  op === "eq" || op === "neq" || op === "gt" || op === "gte" || op === "lt" || op === "lte" || op === "in";

export const leafComplete = (l: EventLeaf): boolean => Boolean(l.field && l.op && l.value.trim());

const leafOf = (c: EventCondition, negate = false): EventLeaf | null => {
  if (c.kind !== "MATCH" || !c.field || !isOp(c.op)) return null;
  const op = negate ? OPPOSITE[c.op] : c.op;
  if (!op) return null;
  return { kind: "leaf", id: nextId(), field: c.field, op, value: c.value ?? "" };
};

/** Every comparison under a node, flattened. */
const leavesUnder = (c: EventCondition, negate = false): EventLeaf[] => {
  if (c.kind === "MATCH") {
    const l = leafOf(c, negate);
    return l ? [l] : [];
  }
  if (c.kind === "NOT") return (c.children ?? []).flatMap((ch) => leavesUnder(ch, !negate));
  return (c.children ?? []).flatMap((ch) => leavesUnder(ch, negate));
};

/** The builder's list for a stored tree: its comparisons, in order; none for no tree. */
export const fromTree = (tree: EventCondition | null | undefined): EventLeaf[] => (tree && tree.kind ? leavesUnder(tree) : []);

/**
 * Whether a stored tree says what its flat list says — comparisons all joined by AND. False for a tree with an `ANY`
 * of more than one branch, or a `NOT` over more than one comparison: the list would read it differently.
 */
export const isFlatAnd = (tree: EventCondition | null | undefined): boolean => {
  if (!tree || !tree.kind) return true;
  const ok = (c: EventCondition, negated: boolean): boolean => {
    if (c.kind === "MATCH") return true;
    const children = c.children ?? [];
    if (c.kind === "NOT") return children.length === 1 && children[0].kind === "MATCH" && !negated;
    if (c.kind === "ANY" && children.length > 1) return false;
    return children.every((ch) => ok(ch, negated));
  };
  return ok(tree, false);
};

/** The tree for the backend: every complete comparison under one `ALL`; null when none is complete — "always". */
export const toTree = (leaves: EventLeaf[]): EventCondition | null => {
  const children = leaves
    .filter(leafComplete)
    .map((l): EventCondition => ({ kind: "MATCH", field: l.field, op: l.op, value: l.value.trim() }));
  return children.length > 0 ? { kind: "ALL", children } : null;
};

/** The comparisons of a tree, for words ("Days more than 10"). */
export const comparisons = (tree: EventCondition | null | undefined): EventLeaf[] => (tree ? leavesUnder(tree) : []);
